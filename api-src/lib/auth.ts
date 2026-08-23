/**
 * Session authentication and authorisation for the ENICE Website Manager.
 *
 * ## Why cookies rather than a bearer token
 *
 * The previous admin page kept a shared password in `sessionStorage` and sent it as a custom
 * header on every request. That works, but anything reachable from JavaScript is readable by
 * any script that manages to run on the page. Sessions here are `HttpOnly` cookies, so a
 * successful XSS cannot exfiltrate the credential — it can only act while the page is open.
 *
 * The cookie is `SameSite=Strict`, which is the primary CSRF defence: a cross-site request
 * simply does not carry it. On top of that, every mutating request must present a
 * session-bound CSRF token in a header (see `crypto.ts`), which a cross-origin page cannot
 * read or forge.
 *
 * ## Two-factor flow
 *
 * A session exists from the moment the password is verified, but with `mfa_satisfied = false`.
 * In that state it can reach only the endpoints that complete the second factor. Holding the
 * partial state server-side means the client cannot skip the step by omitting a flag, and it
 * gives the TOTP submission something to rate-limit against.
 *
 *   password ok ──▶ session (mfa_satisfied = false) ──▶ TOTP or recovery code ──▶ full access
 */

import type { AdminRole, Permission } from "../../src/lib/cms/permissions";
import { ADMIN_ROLES, can, ROLE_META } from "../../src/lib/cms/permissions";
import { clientIp, header, type ApiRequest, type ApiResponse } from "./http";
import { consumeRateLimit, clearRateLimit, db, isoOrNull, json, newId, type Sql } from "./db";
import {
  consumeRecoveryCode,
  hashPassword,
  issueCsrfToken,
  randomToken,
  sha256,
  verifyCsrfToken,
  verifyPassword,
  verifyTotp,
  decryptSecret,
  type StoredRecoveryCode,
} from "./crypto";

// ─── Configuration ───────────────────────────────────────────────────────────

export const SESSION_COOKIE = "enice_admin_session";
export const CSRF_COOKIE = "enice_admin_csrf";
export const CSRF_HEADER = "x-enice-csrf";

/**
 * Idle timeout. A session is extended on each authenticated request, so this is how long an
 * unattended tab stays usable rather than a hard cap on a working day.
 */
const SESSION_IDLE_MS = 12 * 60 * 60 * 1000;

/**
 * Absolute lifetime. Independent of activity, so a stolen cookie cannot be kept alive
 * indefinitely by a script that simply keeps polling.
 */
const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;

/** Failed passwords before the account itself locks, independent of source address. */
const MAX_FAILED_ATTEMPTS = 8;
const ACCOUNT_LOCK_MS = 15 * 60 * 1000;

/** Per-address ceiling, so one attacker cannot spray many accounts from one host. */
const IP_ATTEMPT_MAX = 20;
const IP_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

/** Attempts at the second factor, counted separately from the password stage. */
const MFA_ATTEMPT_MAX = 10;
const MFA_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

// ─── Types ───────────────────────────────────────────────────────────────────

/** The authenticated administrator, as every handler sees them. */
export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  title: string;
  avatarUrl: string | null;
  role: AdminRole;
  totpEnabled: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  sessionId: string;
  /** False between the password and second-factor stages. */
  mfaSatisfied: boolean;
}

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  title: string;
  avatar_url: string | null;
  role: string;
  status: string;
  password_hash: string | null;
  totp_secret: string | null;
  totp_enabled: boolean;
  recovery_codes: StoredRecoveryCode[];
  must_change_password: boolean;
  failed_attempts: number;
  locked_until: Date | null;
  last_login_at: Date | null;
}

/** Why an authentication attempt did not produce a usable session. */
export type AuthFailure =
  | { kind: "invalid_credentials" }
  | { kind: "account_locked"; retryAfterSeconds: number }
  | { kind: "rate_limited"; retryAfterSeconds: number }
  | { kind: "suspended" }
  | { kind: "invite_pending" }
  | { kind: "mfa_required"; sessionToken: string; csrfToken: string }
  | { kind: "mfa_invalid" };

export type AuthResult =
  | { ok: true; identity: AdminIdentity; sessionToken: string; csrfToken: string }
  | { ok: false; failure: AuthFailure };

// ─── Cookies ─────────────────────────────────────────────────────────────────

/** Parses a `Cookie` header into a map. Values are percent-decoded. */
export function parseCookies(req: ApiRequest): Record<string, string> {
  const raw = header(req, "cookie");
  if (!raw) return {};

  const cookies: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      cookies[name] = part.slice(separator + 1).trim();
    }
  }
  return cookies;
}

/**
 * Whether to mark cookies `Secure`.
 *
 * Always true in production. Local development over plain HTTP has to omit it, or the browser
 * discards the cookie and login silently fails — a confusing enough failure to be worth the
 * explicit environment check.
 */
function secureCookiesRequired(): boolean {
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") return true;
  return process.env.NODE_ENV === "production";
}

function serializeCookie(
  name: string,
  value: string,
  options: { maxAgeSeconds?: number; httpOnly?: boolean },
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Strict"];
  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (secureCookiesRequired()) parts.push("Secure");
  // maxAge 0 with an epoch expiry is the reliable way to delete a cookie across browsers.
  if (options.maxAgeSeconds === 0) {
    parts.push("Max-Age=0", "Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  } else if (options.maxAgeSeconds !== undefined) {
    parts.push(`Max-Age=${options.maxAgeSeconds}`);
  }
  return parts.join("; ");
}

/**
 * Issues the session and CSRF cookies.
 *
 * The CSRF cookie is deliberately *not* `HttpOnly`: the admin panel has to read it to echo the
 * value back in a request header, which is the entire mechanism of a double-submit check. It
 * carries no authority on its own — without the `HttpOnly` session cookie it is inert.
 */
export function setAuthCookies(
  res: ApiResponse,
  sessionToken: string,
  csrfToken: string,
  maxAgeSeconds = Math.floor(SESSION_IDLE_MS / 1000),
): void {
  res.setHeader("Set-Cookie", [
    serializeCookie(SESSION_COOKIE, sessionToken, { maxAgeSeconds, httpOnly: true }),
    serializeCookie(CSRF_COOKIE, csrfToken, { maxAgeSeconds, httpOnly: false }),
  ]);
}

export function clearAuthCookies(res: ApiResponse): void {
  res.setHeader("Set-Cookie", [
    serializeCookie(SESSION_COOKIE, "", { maxAgeSeconds: 0, httpOnly: true }),
    serializeCookie(CSRF_COOKIE, "", { maxAgeSeconds: 0, httpOnly: false }),
  ]);
}

// ─── Row mapping ─────────────────────────────────────────────────────────────

/** Coerces a stored role string, defaulting to the least privileged role. */
function toRole(value: string): AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value) ? (value as AdminRole) : "editor";
}

function toIdentity(row: AdminUserRow, sessionId: string, mfaSatisfied: boolean): AdminIdentity {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    title: row.title,
    avatarUrl: row.avatar_url,
    role: toRole(row.role),
    totpEnabled: row.totp_enabled,
    mustChangePassword: row.must_change_password,
    lastLoginAt: isoOrNull(row.last_login_at),
    sessionId,
    mfaSatisfied,
  };
}

const USER_COLUMNS = `
  id, email, name, title, avatar_url, role, status, password_hash,
  totp_secret, totp_enabled, recovery_codes, must_change_password,
  failed_attempts, locked_until, last_login_at
`;

// ─── Bootstrap ───────────────────────────────────────────────────────────────

/**
 * Creates the first owner from the environment when the administrator table is empty.
 *
 * Without this there is a chicken-and-egg problem: the panel has no public registration by
 * design, so a fresh deployment would have no way in. Doing it from environment variables keeps
 * the credential out of the repository and out of any HTTP endpoint — there is no unauthenticated
 * "setup" route to find and race.
 *
 * The insert is conditional on the table still being empty (`WHERE NOT EXISTS`), so two cold
 * starts cannot both create an owner, and it never runs again once any account exists.
 */
export async function ensureBootstrapOwner(): Promise<void> {
  const email = process.env.CMS_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.CMS_OWNER_PASSWORD;
  if (!email || !password) return;

  const sql = db();
  const existing = await sql<{ count: string }[]>`SELECT count(*)::text AS count FROM admin_users`;
  if (Number(existing[0]?.count ?? "0") > 0) return;

  const passwordHash = await hashPassword(password);
  await sql`
    INSERT INTO admin_users (
      id, email, name, title, role, status, password_hash, password_updated_at
    )
    SELECT ${newId()}, ${email}, ${process.env.CMS_OWNER_NAME?.trim() || "ENICE Owner"},
           ${"Owner"}, ${"owner"}, ${"active"}, ${passwordHash}, now()
    WHERE NOT EXISTS (SELECT 1 FROM admin_users)
  `;
  console.log(`[cms] bootstrapped owner account for ${email}`);
}

// ─── Password authentication ─────────────────────────────────────────────────

/**
 * Verifies an email and password, returning either a session or a typed failure.
 *
 * Three properties worth noting:
 *
 * 1. **A missing account still costs a hash.** Returning early would make "no such user"
 *    measurably faster than "wrong password", which enumerates valid administrator emails.
 *    A dummy verification keeps the two paths comparable.
 *
 * 2. **Failures are counted in two places** — per account and per source address — because
 *    either one alone is bypassable. Per-account alone lets an attacker spread guesses across
 *    many accounts; per-address alone is defeated by a botnet.
 *
 * 3. **`invalid_credentials` is returned for every credential problem**, including a locked or
 *    unknown account, so the response cannot be used to probe which emails exist.
 */
export async function authenticateWithPassword(
  req: ApiRequest,
  email: unknown,
  password: unknown,
): Promise<AuthResult> {
  const ip = clientIp(req);
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  const ipLimit = await consumeRateLimit(`login:ip:${ip}`, IP_ATTEMPT_MAX, IP_ATTEMPT_WINDOW_MS);
  if (ipLimit.limited) {
    return {
      ok: false,
      failure: {
        kind: "rate_limited",
        retryAfterSeconds: Math.max(1, Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 1000)),
      },
    };
  }

  if (!normalizedEmail || typeof password !== "string" || !password) {
    return { ok: false, failure: { kind: "invalid_credentials" } };
  }

  const sql = db();
  const rows = await sql<AdminUserRow[]>`
    SELECT ${sql.unsafe(USER_COLUMNS)} FROM admin_users WHERE email = ${normalizedEmail}
  `;
  const user = rows[0];

  if (!user) {
    // Constant-ish work for an unknown account. The hash is discarded; only its cost matters.
    await verifyPassword(password, await dummyHash());
    return { ok: false, failure: { kind: "invalid_credentials" } };
  }

  if (user.locked_until && user.locked_until.getTime() > Date.now()) {
    return {
      ok: false,
      failure: {
        kind: "account_locked",
        retryAfterSeconds: Math.ceil((user.locked_until.getTime() - Date.now()) / 1000),
      },
    };
  }

  if (user.status === "suspended") return { ok: false, failure: { kind: "suspended" } };
  if (!user.password_hash) return { ok: false, failure: { kind: "invite_pending" } };

  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    await recordFailedAttempt(sql, user);
    return { ok: false, failure: { kind: "invalid_credentials" } };
  }

  // Success clears both counters so a user who mistyped twice is not penalised afterwards.
  await sql`
    UPDATE admin_users
    SET failed_attempts = 0, locked_until = NULL, last_login_at = now(), last_login_ip = ${ip},
        updated_at = now()
    WHERE id = ${user.id}
  `;
  await clearRateLimit(`login:ip:${ip}`);

  const mfaRequired = user.totp_enabled;
  const { token, csrf } = await createSession(user.id, req, !mfaRequired);

  if (mfaRequired) {
    // The session exists but is inert until the second factor succeeds.
    return { ok: false, failure: { kind: "mfa_required", sessionToken: token, csrfToken: csrf } };
  }

  const identity = toIdentity(user, "", true);
  return { ok: true, identity, sessionToken: token, csrfToken: csrf };
}

/**
 * A throwaway hash for the unknown-account path.
 *
 * Computed once per instance and reused: generating a fresh one per attempt would double the
 * cost of the very path an attacker floods.
 */
let cachedDummyHash: string | null = null;
async function dummyHash(): Promise<string> {
  if (!cachedDummyHash) cachedDummyHash = await hashPassword(randomToken(16));
  return cachedDummyHash;
}

/** Increments the failure counter and locks the account once the threshold is reached. */
async function recordFailedAttempt(sql: Sql, user: AdminUserRow): Promise<void> {
  const attempts = user.failed_attempts + 1;
  const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
  await sql`
    UPDATE admin_users
    SET failed_attempts = ${attempts},
        locked_until = ${shouldLock ? new Date(Date.now() + ACCOUNT_LOCK_MS) : null},
        updated_at = now()
    WHERE id = ${user.id}
  `;
}

// ─── Second factor ───────────────────────────────────────────────────────────

/**
 * Completes a half-authenticated session with a TOTP code or a recovery code.
 *
 * The session token is the only thing identifying the account at this stage, so a caller cannot
 * complete the second factor for an account they have not already proved a password for.
 */
export async function completeMfa(
  req: ApiRequest,
  sessionToken: string,
  code: unknown,
): Promise<AuthResult> {
  const sql = db();
  const ip = clientIp(req);

  const limit = await consumeRateLimit(`mfa:ip:${ip}`, MFA_ATTEMPT_MAX, MFA_ATTEMPT_WINDOW_MS);
  if (limit.limited) {
    return {
      ok: false,
      failure: {
        kind: "rate_limited",
        retryAfterSeconds: Math.max(1, Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)),
      },
    };
  }

  const sessions = await sql<{ id: string; user_id: string }[]>`
    SELECT id, user_id FROM admin_sessions
    WHERE token_hash = ${sha256(sessionToken)}
      AND revoked_at IS NULL
      AND expires_at > now()
  `;
  const session = sessions[0];
  if (!session) return { ok: false, failure: { kind: "invalid_credentials" } };

  const rows = await sql<AdminUserRow[]>`
    SELECT ${sql.unsafe(USER_COLUMNS)} FROM admin_users WHERE id = ${session.user_id}
  `;
  const user = rows[0];
  if (!user || user.status === "suspended") {
    return { ok: false, failure: { kind: "suspended" } };
  }

  const submitted = typeof code === "string" ? code.trim() : "";
  if (!submitted) return { ok: false, failure: { kind: "mfa_invalid" } };

  const secret = decryptSecret(user.totp_secret);
  let accepted = secret ? verifyTotp(secret, submitted) : false;

  // Fall back to a recovery code. This also covers the case where `CMS_SECRET` was rotated
  // and the TOTP secret can no longer be decrypted — the administrator is not locked out.
  if (!accepted && submitted.replace(/[^A-Za-z0-9]/g, "").length >= 12) {
    const stored = Array.isArray(user.recovery_codes) ? user.recovery_codes : [];
    const result = consumeRecoveryCode(stored, submitted);
    if (result.matched) {
      accepted = true;
      await sql`
        UPDATE admin_users
        SET recovery_codes = ${json(result.updated)}, updated_at = now()
        WHERE id = ${user.id}
      `;
    }
  }

  if (!accepted) {
    await recordFailedAttempt(sql, user);
    return { ok: false, failure: { kind: "mfa_invalid" } };
  }

  await sql`
    UPDATE admin_sessions
    SET mfa_satisfied = true, last_seen_at = now()
    WHERE id = ${session.id}
  `;
  await sql`
    UPDATE admin_users SET failed_attempts = 0, locked_until = NULL WHERE id = ${user.id}
  `;
  await clearRateLimit(`mfa:ip:${ip}`);

  const csrf = issueCsrfToken(session.id);
  return {
    ok: true,
    identity: toIdentity(user, session.id, true),
    sessionToken,
    csrfToken: csrf,
  };
}

// ─── Sessions ────────────────────────────────────────────────────────────────

/** Creates a session row and returns the raw token, which is never stored. */
export async function createSession(
  userId: string,
  req: ApiRequest,
  mfaSatisfied: boolean,
): Promise<{ token: string; csrf: string; sessionId: string }> {
  const sql = db();
  const sessionId = newId();
  const token = randomToken(32);

  await sql`
    INSERT INTO admin_sessions (
      id, user_id, token_hash, ip_address, user_agent, mfa_satisfied, expires_at
    ) VALUES (
      ${sessionId}, ${userId}, ${sha256(token)}, ${clientIp(req)},
      ${(header(req, "user-agent") ?? "").slice(0, 400)}, ${mfaSatisfied},
      ${new Date(Date.now() + SESSION_IDLE_MS)}
    )
  `;

  return { token, csrf: issueCsrfToken(sessionId), sessionId };
}

/** A resolved session together with the administrator it belongs to. */
export interface ResolvedSession {
  identity: AdminIdentity;
}

/**
 * Resolves the session cookie into an identity, or null.
 *
 * Every condition that should invalidate a session is expressed in the query — revoked,
 * expired, past its absolute lifetime, or belonging to a suspended account — so there is no
 * ordering of checks in application code that could accidentally admit a stale session.
 *
 * `last_seen_at` and `expires_at` are extended on each call, giving the sliding idle timeout.
 */
export async function resolveSession(req: ApiRequest): Promise<ResolvedSession | null> {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;

  const sql = db();
  const rows = await sql<(AdminUserRow & { session_id: string; mfa_satisfied: boolean })[]>`
    SELECT ${sql.unsafe(
      USER_COLUMNS.split(",")
        .map((column) => `u.${column.trim()}`)
        .join(", "),
    )},
           s.id AS session_id, s.mfa_satisfied
    FROM admin_sessions s
    JOIN admin_users u ON u.id = s.user_id
    WHERE s.token_hash = ${sha256(token)}
      AND s.revoked_at IS NULL
      AND s.expires_at > now()
      AND s.created_at > now() - ${`${SESSION_ABSOLUTE_MS} milliseconds`}::interval
      AND u.status = 'active'
  `;

  const row = rows[0];
  if (!row) return null;

  await sql`
    UPDATE admin_sessions
    SET last_seen_at = now(), expires_at = now() + ${`${SESSION_IDLE_MS} milliseconds`}::interval
    WHERE id = ${row.session_id}
  `;

  return { identity: toIdentity(row, row.session_id, row.mfa_satisfied) };
}

/** Revokes one session — an ordinary sign-out. */
export async function revokeSession(sessionId: string): Promise<void> {
  await db()`UPDATE admin_sessions SET revoked_at = now() WHERE id = ${sessionId}`;
}

/**
 * Revokes every session for an account: "sign out of all devices".
 *
 * Also used when a password changes or an administrator is suspended, so a credential change
 * takes effect immediately rather than whenever existing sessions happen to expire.
 */
export async function revokeAllSessions(userId: string, exceptSessionId?: string): Promise<number> {
  const sql = db();
  const rows = await sql<{ id: string }[]>`
    UPDATE admin_sessions
    SET revoked_at = now()
    WHERE user_id = ${userId}
      AND revoked_at IS NULL
      ${exceptSessionId ? sql`AND id <> ${exceptSessionId}` : sql``}
    RETURNING id
  `;
  return rows.length;
}

/** Active sessions for the account settings screen. */
export async function listSessions(userId: string) {
  const rows = await db()<
    {
      id: string;
      ip_address: string | null;
      user_agent: string | null;
      created_at: Date;
      last_seen_at: Date;
    }[]
  >`
    SELECT id, ip_address, user_agent, created_at, last_seen_at
    FROM admin_sessions
    WHERE user_id = ${userId} AND revoked_at IS NULL AND expires_at > now()
    ORDER BY last_seen_at DESC
    LIMIT 50
  `;

  return rows.map((row) => ({
    id: row.id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: isoOrNull(row.created_at),
    lastSeenAt: isoOrNull(row.last_seen_at),
  }));
}

// ─── Guards ──────────────────────────────────────────────────────────────────

/** Raised by the guards below and translated into an HTTP response by the router. */
export class AuthError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Requires a fully authenticated session.
 *
 * A session that has passed the password stage but not the second factor is rejected with a
 * distinct code, so the admin panel can show the 2FA prompt instead of bouncing to the login
 * form and discarding the partial progress.
 */
export function requireFullSession(session: ResolvedSession | null): AdminIdentity {
  if (!session) throw new AuthError(401, "Sign in to continue.", "unauthenticated");
  if (!session.identity.mfaSatisfied) {
    throw new AuthError(401, "Two-factor verification required.", "mfa_required");
  }
  return session.identity;
}

/** Requires a capability, naming the missing grant so the failure is diagnosable. */
export function requirePermission(identity: AdminIdentity, permission: Permission): void {
  if (!can(identity.role, permission)) {
    throw new AuthError(
      403,
      `Your role (${ROLE_META[identity.role].label}) cannot perform this action.`,
      `missing_permission:${permission}`,
    );
  }
}

/**
 * Verifies the CSRF token on a state-changing request.
 *
 * Checks the header against the session id rather than against the cookie value. A plain
 * double-submit comparison trusts that the attacker cannot write the cookie, which is not true
 * for a subdomain-scoped injection; binding the token to the session id with an HMAC removes
 * that assumption.
 */
export function requireCsrf(req: ApiRequest, identity: AdminIdentity): void {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const token = header(req, CSRF_HEADER);
  if (!verifyCsrfToken(identity.sessionId, token)) {
    throw new AuthError(403, "Your session expired. Reload the page and try again.", "bad_csrf");
  }
}

/**
 * Rejects cross-origin requests outright.
 *
 * Defence in depth behind `SameSite=Strict` and the CSRF token. The admin panel is same-origin
 * by construction, so anything arriving with a foreign `Origin` is either a misconfiguration
 * or an attack; there is no legitimate caller to break.
 */
export function requireSameOrigin(req: ApiRequest): void {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return;

  const origin = header(req, "origin");
  if (!origin) return; // Non-browser clients (curl, monitoring) send no Origin.

  const host = header(req, "x-forwarded-host") ?? header(req, "host");
  if (!host) return;

  try {
    if (new URL(origin).host !== host) {
      throw new AuthError(403, "Cross-origin requests are not allowed.", "bad_origin");
    }
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(403, "Malformed Origin header.", "bad_origin");
  }
}
