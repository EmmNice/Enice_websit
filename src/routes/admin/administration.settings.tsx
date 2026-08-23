import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, KeyRound, LogOut, Monitor, ShieldCheck, ShieldOff, UserRound } from "lucide-react";
import {
  account,
  CmsError,
  type AdminSessionInfo,
  type TwoFactorStatus,
} from "@/lib/cms/admin-client";
import { PASSWORD_MIN_LENGTH } from "@/lib/cms/password-policy";
import { formatRelativeTime, formatShortDate } from "@/lib/cms/public-client";
import { ROLE_META } from "@/lib/cms/permissions";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { Modal, OneTimeSecretModal, useConfirm } from "@/components/admin/Modal";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Skeleton,
  StatusPill,
} from "@/components/admin/primitives";

/**
 * Account settings — the administrator's own security controls.
 *
 * Profile, password change, two-factor enrolment, recovery codes and active sessions with
 * sign-out-of-all-devices. Every sensitive action re-verifies the password server-side (changing
 * it, disabling 2FA, regenerating codes), so a hijacked session cannot quietly lower the account's
 * defences.
 */
function SettingsScreen() {
  const { identity, refresh } = useAdmin();
  const toast = useToast();

  const [twoFactor, setTwoFactor] = useState<TwoFactorStatus | null>(null);
  const [sessions, setSessions] = useState<AdminSessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    account
      .load()
      .then((result) => {
        setTwoFactor(result.twoFactor);
        setSessions(result.sessions);
      })
      .catch((caught) => toast.error("Could not load your account", describeError(caught)))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  if (!identity) return null;

  return (
    <>
      <PageHeader
        title="Account settings"
        description="Your profile, password, two-factor authentication and active sessions."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard onSaved={() => void refresh()} />
        <PasswordCard />
        <TwoFactorCard
          loading={loading}
          status={twoFactor}
          twoFactorEnabled={identity.twoFactorEnabled}
          onChanged={() => {
            load();
            void refresh();
          }}
        />
        <SessionsCard loading={loading} sessions={sessions} onChanged={load} />
      </div>
    </>
  );
}

function ProfileCard({ onSaved }: { onSaved: () => void }) {
  const { identity } = useAdmin();
  const toast = useToast();
  const [name, setName] = useState(identity?.name ?? "");
  const [title, setTitle] = useState(identity?.title ?? "");
  const [saving, setSaving] = useState(false);

  if (!identity) return null;
  const dirty = name !== identity.name || title !== identity.title;

  const save = async () => {
    setSaving(true);
    try {
      await account.updateProfile({ name, title });
      toast.success("Profile updated");
      onSaved();
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Profile" icon={UserRound} />
      <div className="space-y-4 p-4">
        <Field label="Email">
          {(props) => (
            <Input {...props} value={identity.email} readOnly className="text-muted-foreground" />
          )}
        </Field>
        <Field label="Name">
          {(props) => (
            <Input {...props} value={name} onChange={(event) => setName(event.target.value)} />
          )}
        </Field>
        <Field label="Title">
          {(props) => (
            <Input
              {...props}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Head of Marketing"
            />
          )}
        </Field>
        <div className="flex items-center justify-between">
          <StatusPill tone="info" dot={false}>
            {ROLE_META[identity.role].label}
          </StatusPill>
          <Button variant="primary" loading={saving} disabled={!dirty} onClick={save}>
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  const mismatch = confirmation.length > 0 && next !== confirmation;
  const tooShort = next.length > 0 && next.length < PASSWORD_MIN_LENGTH;
  const ready = current && next && !mismatch && !tooShort;

  const change = async () => {
    setSaving(true);
    try {
      await account.changePassword(current, next);
      toast.success("Password changed", "You've been signed out of your other devices.");
      setCurrent("");
      setNext("");
      setConfirmation("");
    } catch (caught) {
      toast.error(
        "Could not change password",
        caught instanceof CmsError ? caught.message : undefined,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Password"
        icon={KeyRound}
        description="Changing it signs you out of all other devices."
      />
      <div className="space-y-4 p-4">
        <Field label="Current password">
          {(props) => (
            <Input
              {...props}
              type="password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              autoComplete="current-password"
            />
          )}
        </Field>
        <Field
          label="New password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          error={tooShort ? `Use at least ${PASSWORD_MIN_LENGTH} characters.` : null}
        >
          {(props) => (
            <Input
              {...props}
              type="password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              autoComplete="new-password"
            />
          )}
        </Field>
        <Field label="Confirm new password" error={mismatch ? "These do not match." : null}>
          {(props) => (
            <Input
              {...props}
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="new-password"
            />
          )}
        </Field>
        <div className="flex justify-end">
          <Button variant="primary" loading={saving} disabled={!ready} onClick={change}>
            Change password
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TwoFactorCard({
  loading,
  status,
  twoFactorEnabled,
  onChanged,
}: {
  loading: boolean;
  status: TwoFactorStatus | null;
  twoFactorEnabled: boolean;
  onChanged: () => void;
}) {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [enrolling, setEnrolling] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [password, setPassword] = useState("");

  const enabled = status?.enabled ?? twoFactorEnabled;

  const start = async () => {
    setBusy(true);
    try {
      const result = await account.startTwoFactor();
      setEnrolling(result);
      setCode("");
    } catch (caught) {
      toast.error("Could not start setup", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const confirmEnrol = async () => {
    setBusy(true);
    try {
      const result = await account.confirmTwoFactor(code.trim());
      setEnrolling(null);
      setRecoveryCodes(result.recoveryCodes);
      toast.success("Two-factor authentication is on");
      onChanged();
    } catch (caught) {
      toast.error(
        "That code was not accepted",
        caught instanceof CmsError ? caught.message : undefined,
      );
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await account.disableTwoFactor(password);
      setDisableOpen(false);
      setPassword("");
      toast.success("Two-factor authentication turned off");
      onChanged();
    } catch (caught) {
      toast.error("Could not disable", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    const ok = await confirm({
      title: "Generate new recovery codes?",
      message:
        "Your existing recovery codes will stop working immediately. You'll be shown the new set once.",
      confirmLabel: "Generate",
      tone: "primary",
    });
    if (!ok) return;
    const pwd = window.prompt("Confirm your password to continue");
    if (!pwd) return;
    try {
      const result = await account.regenerateRecoveryCodes(pwd);
      setRecoveryCodes(result.recoveryCodes);
      onChanged();
    } catch (caught) {
      toast.error("Could not regenerate", caught instanceof CmsError ? caught.message : undefined);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Two-factor authentication"
        icon={ShieldCheck}
        actions={
          !loading && (
            <StatusPill tone={enabled ? "success" : "warning"}>{enabled ? "On" : "Off"}</StatusPill>
          )
        }
      />
      <div className="space-y-4 p-4">
        {loading ? (
          <Skeleton className="h-20" />
        ) : enabled ? (
          <>
            <p className="text-muted-foreground text-[12.5px] leading-relaxed">
              Your account is protected by an authenticator app.
              {status ? ` ${status.recoveryCodesRemaining} recovery code(s) remaining.` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={regenerate}>
                New recovery codes
              </Button>
              <Button
                variant="ghost"
                icon={ShieldOff}
                className="text-destructive"
                onClick={() => setDisableOpen(true)}
              >
                Turn off
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-[12.5px] leading-relaxed">
              Add a second step at sign-in using an authenticator app (1Password, Authy, Google
              Authenticator). Strongly recommended.
            </p>
            <Button variant="primary" icon={ShieldCheck} loading={busy} onClick={start}>
              Set up two-factor authentication
            </Button>
          </>
        )}
      </div>

      {/* Enrolment dialog */}
      <Modal
        open={Boolean(enrolling)}
        onClose={() => setEnrolling(null)}
        title="Set up two-factor authentication"
        description="Add this secret to your authenticator app, then enter the six-digit code it shows."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEnrolling(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={busy}
              disabled={code.trim().length < 6}
              onClick={confirmEnrol}
            >
              Verify and turn on
            </Button>
          </>
        }
      >
        {enrolling && (
          <div className="space-y-4">
            <div
              className="border-border bg-secondary rounded-lg border p-4 text-center"
              data-allow-select
            >
              <p className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wider uppercase">
                Manual entry key
              </p>
              <code className="text-foreground text-[15px] font-bold tracking-[0.15em] select-all">
                {enrolling.secret.replace(/(.{4})/g, "$1 ").trim()}
              </code>
              <p className="text-muted-foreground mt-2 text-[11px]">
                Time-based (TOTP), 6 digits, 30-second period.
              </p>
            </div>
            <Field label="Six-digit code from your app">
              {(props) => (
                <Input
                  {...props}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center font-mono text-[18px] tracking-[0.3em]"
                  autoFocus
                />
              )}
            </Field>
          </div>
        )}
      </Modal>

      {/* Disable dialog — re-verifies the password. */}
      <Modal
        open={disableOpen}
        onClose={() => setDisableOpen(false)}
        title="Turn off two-factor authentication"
        description="This reduces your account's security. Confirm your password to continue."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDisableOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} disabled={!password} onClick={disable}>
              Turn off
            </Button>
          </>
        }
      >
        <Field label="Your password">
          {(props) => (
            <Input
              {...props}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
          )}
        </Field>
      </Modal>

      <OneTimeSecretModal
        open={Boolean(recoveryCodes)}
        onClose={() => setRecoveryCodes(null)}
        title="Your recovery codes"
        description="Store these somewhere safe. Each works once, and they are the only way in if you lose your authenticator. They are shown only now."
        values={recoveryCodes ?? []}
        acknowledgeLabel="I have saved my recovery codes"
      />

      {dialog}
    </Card>
  );
}

function SessionsCard({
  loading,
  sessions,
  onChanged,
}: {
  loading: boolean;
  sessions: AdminSessionInfo[];
  onChanged: () => void;
}) {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [busy, setBusy] = useState(false);

  const revokeAll = async () => {
    const ok = await confirm({
      title: "Sign out of all other devices?",
      message:
        "Every other session will be ended immediately. The device you're using now stays signed in.",
      confirmLabel: "Sign out others",
      tone: "primary",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const { revoked } = await account.revokeOtherSessions();
      toast.success(
        revoked === 0 ? "No other sessions were active" : `Signed out ${revoked} other session(s)`,
      );
      onChanged();
    } catch (caught) {
      toast.error(
        "Could not sign out others",
        caught instanceof CmsError ? caught.message : undefined,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Active sessions"
        icon={Monitor}
        actions={
          sessions.length > 1 && (
            <Button variant="outline" size="sm" icon={LogOut} loading={busy} onClick={revokeAll}>
              Sign out others
            </Button>
          )
        }
      />
      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session, index) => (
              <li
                key={session.id}
                className="border-border flex items-center gap-3 rounded-lg border p-3"
              >
                <Monitor className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-[12.5px] font-medium">
                    {shortAgent(session.userAgent)}
                    {index === 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                        <Check className="h-3 w-3" /> this device
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {session.ipAddress ?? "unknown IP"} · active{" "}
                    {formatRelativeTime(session.lastSeenAt)} · since{" "}
                    {formatShortDate(session.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {dialog}
    </Card>
  );
}

/** A readable device label from a user-agent string. */
function shortAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const os = /Windows/.test(userAgent)
    ? "Windows"
    : /Macintosh|Mac OS/.test(userAgent)
      ? "macOS"
      : /Android/.test(userAgent)
        ? "Android"
        : /iPhone|iPad|iOS/.test(userAgent)
          ? "iOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
}

export const Route = createFileRoute("/admin/administration/settings")({
  component: function SettingsRoute() {
    return (
      <AdminShell>
        <SettingsScreen />
      </AdminShell>
    );
  },
});
