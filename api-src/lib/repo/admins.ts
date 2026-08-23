/**
 * Administrator accounts.
 *
 * There is no public registration anywhere in this system, by design. An account exists only
 * because an existing administrator with `admins.write` created it, and it becomes usable only
 * when the invitee sets a password using a single-use token delivered out of band.
 *
 * ## Privilege rules enforced here
 *
 * - An administrator may only create, modify or remove accounts of a **strictly lower** rank
 *   (`canManageRole`). Without that, two owners could demote each other, and an administrator
 *   could promote themselves.
 * - The **last active owner cannot be removed, suspended or demoted.** That check is the
 *   difference between a system you can lock yourself out of and one you cannot.
 * - Changing a password or suspending an account **revokes every session** for it, so the change
 *   takes effect immediately rather than whenever the existing cookie happens to expire.
 */

import type { AdminRole } from "../../../src/lib/cms/permissions";
import { ADMIN_ROLES, canManageRole, ROLE_META } from "../../../src/lib/cms/permissions";
import { sanitizeText, sanitizeUrl } from "../../../src/lib/cms/sanitize";
import { db, iso, isoOrNull, newId } from "../db";
import { badRequest, conflict, notFound } from "../router";
import { hashPassword, randomToken, sha256, validatePassword, verifyPassword } from "../crypto";
import { revokeAllSessions, type AdminIdentity } from "../auth";

/** The public shape of an administrator. Never carries a hash, secret or token. */
export interface AdminSummary {
  id: string;
  email: string;
  name: string;
  title: string;
  avatarUrl: string | null;
  role: AdminRole;
  status: "active" | "invited" | "suspended";
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  /** True while an unexpired invitation is outstanding. */
  invitePending: boolean;
}

interface AdminRow {
  id: string;
  email: string;
  name: string;
  title: string;
  avatar_url: string | null;
  role: string;
  status: string;
  totp_enabled: boolean;
  last_login_at: Date | null;
  created_at: Date;
  invite_expires_at: Date | null;
  password_hash: string | null;
}

function mapAdmin(row: AdminRow): AdminSummary {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    title: row.title,
    avatarUrl: row.avatar_url,
    role: (ADMIN_ROLES as readonly string[]).includes(row.role)
      ? (row.role as AdminRole)
      : "editor",
    status:
      row.status === "active" ? "active" : row.status === "suspended" ? "suspended" : "invited",
    twoFactorEnabled: row.totp_enabled,
    lastLoginAt: isoOrNull(row.last_login_at),
    createdAt: iso(row.created_at),
    invitePending:
      row.password_hash === null &&
      row.invite_expires_at !== null &&
      row.invite_expires_at.getTime() > Date.now(),
  };
}

const ADMIN_COLUMNS = `
  id, email, name, title, avatar_url, role, status, totp_enabled,
  last_login_at, created_at, invite_expires_at, password_hash
`;

export async function listAdmins(): Promise<AdminSummary[]> {
  const sql = db();
  const rows = await sql<AdminRow[]>`
    SELECT ${sql.unsafe(ADMIN_COLUMNS)} FROM admin_users
    ORDER BY
      CASE role WHEN 'owner' THEN 0 WHEN 'administrator' THEN 1 ELSE 2 END,
      name ASC, email ASC
  `;
  return rows.map(mapAdmin);
}

export async function getAdmin(id: string): Promise<AdminSummary | null> {
  const sql = db();
  const rows = await sql<AdminRow[]>`
    SELECT ${sql.unsafe(ADMIN_COLUMNS)} FROM admin_users WHERE id = ${id}
  `;
  return rows[0] ? mapAdmin(rows[0]) : null;
}

/** How long an invitation stays valid. Long enough to act on, short enough to expire. */
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface InviteResult {
  admin: AdminSummary;
  /**
   * The single-use token. Returned exactly once, at creation, and only its digest is stored —
   * so it must be delivered to the invitee now or reissued later.
   */
  inviteToken: string;
  expiresAt: string;
}

/**
 * Creates an account in the `invited` state.
 *
 * No password is set. The invitee supplies one via `acceptInvite`, which means a working
 * credential is never transmitted or stored by whoever created the account.
 */
export async function inviteAdmin(
  input: { email?: unknown; name?: unknown; title?: unknown; role?: unknown },
  actor: AdminIdentity,
): Promise<InviteResult> {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw badRequest("Enter a valid email address.");
  }

  const role = typeof input.role === "string" ? input.role : "editor";
  if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
    throw badRequest(`Role must be one of: ${ADMIN_ROLES.join(", ")}.`);
  }
  if (!canManageRole(actor.role, role as AdminRole)) {
    throw badRequest(
      `As ${ROLE_META[actor.role].label} you can only invite administrators below your own level.`,
    );
  }

  const existing = await db()<{ id: string }[]>`SELECT id FROM admin_users WHERE email = ${email}`;
  if (existing.length > 0) throw conflict("An administrator with that email already exists.");

  const id = newId();
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  await db()`
    INSERT INTO admin_users (
      id, email, name, title, role, status, invite_token_hash, invite_expires_at,
      must_change_password
    ) VALUES (
      ${id}, ${email}, ${sanitizeText(input.name, 120)}, ${sanitizeText(input.title, 120)},
      ${role}, ${"invited"}, ${sha256(token)}, ${expiresAt}, true
    )
  `;

  const admin = await getAdmin(id);
  if (!admin) throw new Error("Administrator disappeared immediately after insert.");
  return { admin, inviteToken: token, expiresAt: expiresAt.toISOString() };
}

/**
 * Completes an invitation by setting the first password.
 *
 * Unauthenticated — the token is the credential. It is compared by digest, single-use (cleared
 * on success), and time-limited. A generic error is returned for every failure so the endpoint
 * cannot be used to test whether a token exists.
 */
export async function acceptInvite(token: unknown, password: unknown): Promise<AdminSummary> {
  if (typeof token !== "string" || !token) throw badRequest("This invitation link is not valid.");

  const policy = validatePassword(password);
  if (!policy.ok) throw badRequest(policy.error);

  const sql = db();
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM admin_users
    WHERE invite_token_hash = ${sha256(token)}
      AND invite_expires_at > now()
      AND password_hash IS NULL
  `;
  const row = rows[0];
  if (!row) {
    throw badRequest("This invitation link has expired or has already been used.");
  }

  await sql`
    UPDATE admin_users SET
      password_hash = ${await hashPassword(password as string)},
      password_updated_at = now(),
      must_change_password = false,
      status = 'active',
      invite_token_hash = NULL,
      invite_expires_at = NULL,
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = now()
    WHERE id = ${row.id}
  `;

  const admin = await getAdmin(row.id);
  if (!admin) throw notFound("That administrator");
  return admin;
}

/** Issues a fresh invitation token, for a lost link or a password reset. */
export async function reissueInvite(id: string, actor: AdminIdentity): Promise<InviteResult> {
  const target = await getAdmin(id);
  if (!target) throw notFound("That administrator");
  if (target.id !== actor.id && !canManageRole(actor.role, target.role)) {
    throw badRequest("You cannot manage an administrator at or above your own level.");
  }

  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  // Clearing the password hash is what turns this into a reset: the old credential stops
  // working immediately rather than remaining valid alongside the new link.
  await db()`
    UPDATE admin_users SET
      invite_token_hash = ${sha256(token)},
      invite_expires_at = ${expiresAt},
      password_hash = NULL,
      must_change_password = true,
      status = CASE WHEN status = 'suspended' THEN 'suspended' ELSE 'invited' END,
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = now()
    WHERE id = ${id}
  `;
  await revokeAllSessions(id);

  const admin = await getAdmin(id);
  if (!admin) throw notFound("That administrator");
  return { admin, inviteToken: token, expiresAt: expiresAt.toISOString() };
}

/** Active owners, used for the last-owner guard. */
async function activeOwnerCount(): Promise<number> {
  const rows = await db()<{ count: string }[]>`
    SELECT count(*)::text AS count FROM admin_users WHERE role = 'owner' AND status = 'active'
  `;
  return Number(rows[0]?.count ?? "0");
}

/**
 * Rejects any change that would remove the last usable owner.
 *
 * Called before demotion, suspension and deletion. This is the check that makes the permission
 * system safe to operate: without it, one mis-click could leave the Website Manager with nobody
 * able to manage administrators or approve deployments, recoverable only by direct database
 * access.
 */
async function guardLastOwner(target: AdminSummary, change: string): Promise<void> {
  if (target.role !== "owner" || target.status !== "active") return;
  if ((await activeOwnerCount()) > 1) return;
  throw badRequest(
    `${target.name || target.email} is the only active Owner, so they cannot be ${change}. ` +
      "Promote another administrator to Owner first.",
  );
}

export async function updateAdmin(
  id: string,
  input: { name?: unknown; title?: unknown; role?: unknown; status?: unknown; avatarUrl?: unknown },
  actor: AdminIdentity,
): Promise<AdminSummary> {
  const target = await getAdmin(id);
  if (!target) throw notFound("That administrator");

  const isSelf = target.id === actor.id;
  // Anyone may edit their own name and title; changing anyone else requires outranking them.
  if (!isSelf && !canManageRole(actor.role, target.role)) {
    throw badRequest("You cannot manage an administrator at or above your own level.");
  }

  let role = target.role;
  if (input.role !== undefined && input.role !== target.role) {
    if (isSelf) throw badRequest("You cannot change your own role.");
    const requested = typeof input.role === "string" ? input.role : "";
    if (!(ADMIN_ROLES as readonly string[]).includes(requested)) {
      throw badRequest(`Role must be one of: ${ADMIN_ROLES.join(", ")}.`);
    }
    if (!canManageRole(actor.role, requested as AdminRole)) {
      throw badRequest("You cannot assign a role at or above your own level.");
    }
    await guardLastOwner(target, "demoted");
    role = requested as AdminRole;
  }

  let status = target.status;
  if (input.status !== undefined && input.status !== target.status) {
    if (isSelf) throw badRequest("You cannot change your own account status.");
    const requested = typeof input.status === "string" ? input.status : "";
    if (!["active", "suspended"].includes(requested)) {
      throw badRequest("Status must be either active or suspended.");
    }
    if (requested === "suspended") await guardLastOwner(target, "suspended");
    // A reactivated account with no password returns to `invited`, not `active`.
    status =
      requested === "active" && target.invitePending
        ? "invited"
        : (requested as "active" | "suspended");
  }

  await db()`
    UPDATE admin_users SET
      name = ${input.name === undefined ? target.name : sanitizeText(input.name, 120)},
      title = ${input.title === undefined ? target.title : sanitizeText(input.title, 120)},
      avatar_url = ${
        input.avatarUrl === undefined ? target.avatarUrl : (sanitizeUrl(input.avatarUrl) ?? null)
      },
      role = ${role},
      status = ${status},
      updated_at = now()
    WHERE id = ${id}
  `;

  // Suspension must take effect now, not when the cookie expires.
  if (status === "suspended") await revokeAllSessions(id);

  const updated = await getAdmin(id);
  if (!updated) throw notFound("That administrator");
  return updated;
}

export async function deleteAdmin(id: string, actor: AdminIdentity): Promise<AdminSummary> {
  const target = await getAdmin(id);
  if (!target) throw notFound("That administrator");
  if (target.id === actor.id) throw badRequest("You cannot remove your own account.");
  if (!canManageRole(actor.role, target.role)) {
    throw badRequest("You cannot remove an administrator at or above your own level.");
  }
  await guardLastOwner(target, "removed");

  // Sessions cascade. Content authorship survives via the denormalised `*_by_email` columns.
  await db()`DELETE FROM admin_users WHERE id = ${id}`;
  return target;
}

// ─── Self-service ────────────────────────────────────────────────────────────

/**
 * Changes one's own password.
 *
 * The current password is required even though the caller is already authenticated: it stops a
 * hijacked session from locking the real owner out by rotating the credential.
 *
 * Every *other* session is then revoked. The current one is deliberately kept so the
 * administrator is not signed out of the tab they are working in.
 */
export async function changeOwnPassword(
  actor: AdminIdentity,
  currentPassword: unknown,
  newPassword: unknown,
): Promise<void> {
  const sql = db();
  const rows = await sql<{ password_hash: string | null }[]>`
    SELECT password_hash FROM admin_users WHERE id = ${actor.id}
  `;
  const hash = rows[0]?.password_hash ?? null;

  if (typeof currentPassword !== "string" || !(await verifyPassword(currentPassword, hash))) {
    throw badRequest("Your current password is not correct.");
  }

  const policy = validatePassword(newPassword);
  if (!policy.ok) throw badRequest(policy.error);
  if (currentPassword === newPassword) {
    throw badRequest("Choose a password different from your current one.");
  }

  await sql`
    UPDATE admin_users SET
      password_hash = ${await hashPassword(newPassword as string)},
      password_updated_at = now(),
      must_change_password = false,
      updated_at = now()
    WHERE id = ${actor.id}
  `;

  await revokeAllSessions(actor.id, actor.sessionId);
}

export async function updateOwnProfile(
  actor: AdminIdentity,
  input: { name?: unknown; title?: unknown; avatarUrl?: unknown },
): Promise<AdminSummary> {
  await db()`
    UPDATE admin_users SET
      name = ${input.name === undefined ? actor.name : sanitizeText(input.name, 120)},
      title = ${input.title === undefined ? actor.title : sanitizeText(input.title, 120)},
      avatar_url = ${
        input.avatarUrl === undefined ? actor.avatarUrl : (sanitizeUrl(input.avatarUrl) ?? null)
      },
      updated_at = now()
    WHERE id = ${actor.id}
  `;

  const updated = await getAdmin(actor.id);
  if (!updated) throw notFound("Your account");
  return updated;
}

export async function adminCount(): Promise<number> {
  const rows = await db()<{ count: string }[]>`
    SELECT count(*)::text AS count FROM admin_users WHERE status <> 'suspended'
  `;
  return Number(rows[0]?.count ?? "0");
}

// ─── Two-factor enrolment ────────────────────────────────────────────────────

/**
 * Reads the stored TOTP state for the account settings screen.
 *
 * Returns only whether 2FA is on and how many recovery codes remain — never the secret or the
 * code digests.
 */
export async function twoFactorStatus(
  userId: string,
): Promise<{ enabled: boolean; confirmedAt: string | null; recoveryCodesRemaining: number }> {
  const rows = await db()<
    {
      totp_enabled: boolean;
      totp_confirmed_at: Date | null;
      recovery_codes: { usedAt: string | null }[] | null;
    }[]
  >`
    SELECT totp_enabled, totp_confirmed_at, recovery_codes FROM admin_users WHERE id = ${userId}
  `;
  const row = rows[0];
  if (!row) throw notFound("Your account");

  return {
    enabled: row.totp_enabled,
    confirmedAt: isoOrNull(row.totp_confirmed_at),
    recoveryCodesRemaining: (row.recovery_codes ?? []).filter((code) => code.usedAt === null)
      .length,
  };
}

/** Verifies a password before a sensitive account change. */
export async function verifyOwnPassword(userId: string, password: unknown): Promise<boolean> {
  const rows = await db()<{ password_hash: string | null }[]>`
    SELECT password_hash FROM admin_users WHERE id = ${userId}
  `;
  if (typeof password !== "string") return false;
  return verifyPassword(password, rows[0]?.password_hash ?? null);
}
