/**
 * Session and authorisation context for the Website Manager.
 *
 * Holds one authoritative copy of who is signed in, what they may do, and which optional
 * integrations are configured — fetched once on mount from `GET /api/cms/auth/session`.
 *
 * ## Why a context rather than a fetch per screen
 *
 * Every screen needs the identity (for the account menu) and the permission set (to decide which
 * controls to render). Fetching per screen would mean a request on every navigation and a flash of
 * incorrect UI while it resolved. Holding it here means navigation is instant and `can()` is a
 * synchronous call.
 *
 * ## The permission check is a convenience, not a control
 *
 * `can()` hides controls the current administrator cannot use, so the panel never offers an action
 * that will be refused. It is **not** the security boundary: the server checks every request
 * against the same matrix (see `ROUTE_PERMISSIONS` in `api-src/cms.ts`). Anyone editing the client
 * bundle to reveal a button gains nothing.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth, CmsError, type AdminProfile, type ConfigFlags } from "@/lib/cms/admin-client";
import { can as roleCan, type Permission } from "@/lib/cms/permissions";

/** Where the session lifecycle currently is. Drives what the shell renders. */
export type AuthPhase =
  | "loading"
  /** No usable session — show the sign-in form. */
  | "anonymous"
  /** Password accepted, second factor outstanding — show the code prompt. */
  | "second-factor"
  | "authenticated"
  /** The API itself is unreachable or unconfigured; not a credentials problem. */
  | "unavailable";

interface AdminContextValue {
  phase: AuthPhase;
  identity: AdminProfile | null;
  permissions: Permission[];
  config: ConfigFlags;
  /** Why the session could not be established, when `phase` is `unavailable`. */
  unavailableReason: string | null;

  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;

  /** Re-reads the session — after a profile edit, or on a 401 from another call. */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Called by the login screen once a full session exists. */
  onAuthenticated: (identity: AdminProfile, permissions: Permission[]) => void;
  /** Called when the password stage succeeded but a code is still needed. */
  onSecondFactorRequired: () => void;
}

const FALLBACK_CONFIG: ConfigFlags = {
  databaseConfigured: false,
  secretConfigured: false,
  mediaStorageConfigured: false,
  codeDeliveryConfigured: false,
  aiConfigured: false,
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used inside <AdminProvider>. Wrap the route in it.");
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AuthPhase>("loading");
  const [identity, setIdentity] = useState<AdminProfile | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [config, setConfig] = useState<ConfigFlags>(FALLBACK_CONFIG);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const session = await auth.session();
      setConfig(session.config ?? FALLBACK_CONFIG);
      setUnavailableReason(null);

      if (session.authenticated && session.identity) {
        setIdentity(session.identity);
        setPermissions(session.permissions ?? []);
        setPhase("authenticated");
        return;
      }

      // A half-authenticated session is reported here so a page reload during the 2FA step resumes
      // at the code prompt instead of discarding the password stage.
      setIdentity(null);
      setPermissions([]);
      setPhase(session.mfaRequired ? "second-factor" : "anonymous");
    } catch (error) {
      setIdentity(null);
      setPermissions([]);

      // A missing DATABASE_URL or CMS_SECRET is a deployment problem, not a login problem, and
      // must not be presented as "wrong password".
      if (error instanceof CmsError && error.isNotConfigured) {
        setUnavailableReason(error.message);
        setPhase("unavailable");
        return;
      }
      if (error instanceof CmsError && error.code === "network_error") {
        setUnavailableReason(error.message);
        setPhase("unavailable");
        return;
      }

      setPhase("anonymous");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const signOut = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      // Even if the call fails the local session must be discarded: leaving someone apparently
      // signed in after they asked to leave is the worse outcome.
    }
    setIdentity(null);
    setPermissions([]);
    setPhase("anonymous");
  }, []);

  const value = useMemo<AdminContextValue>(() => {
    // Checked against the server-sent grant list first, falling back to the role matrix. The list
    // is authoritative because it came from the server that will enforce it.
    const check = (permission: Permission) =>
      permissions.length > 0
        ? permissions.includes(permission)
        : roleCan(identity?.role ?? null, permission);

    return {
      phase,
      identity,
      permissions,
      config,
      unavailableReason,
      can: check,
      canAny: (list) => list.some(check),
      refresh: load,
      signOut,
      onAuthenticated: (nextIdentity, nextPermissions) => {
        setIdentity(nextIdentity);
        setPermissions(nextPermissions);
        setPhase("authenticated");
        // Re-read so `config` and any server-side defaults are picked up too.
        void load();
      },
      onSecondFactorRequired: () => setPhase("second-factor"),
    };
  }, [phase, identity, permissions, config, unavailableReason, load, signOut]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

/**
 * Renders children only when the administrator holds a permission.
 *
 * Used instead of an inline `can()` guard where the fallback matters — a disabled control with an
 * explanation is often better than a control that silently is not there.
 */
export function IfPermitted({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = useAdmin();
  return <>{can(permission) ? children : fallback}</>;
}
