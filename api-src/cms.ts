/**
 * Vercel serverless function — `/api/cms/*`
 *
 * The entire private API behind the ENICE Website Manager: authentication, content, pages,
 * sections, settings, media, administrators, activity, search and the AI manager.
 *
 * ## One function, many routes
 *
 * `vercel.json` rewrites `/api/cms/:path*` onto this file and the sub-path is dispatched by
 * `lib/router.ts`. See that module for why this is one function rather than sixty.
 *
 * ## The request pipeline
 *
 * Every request runs the same sequence, in this order, before a handler is reached:
 *
 *   1. `no-store` on the response — nothing here is ever cacheable.
 *   2. Configuration check — a missing `DATABASE_URL` or `CMS_SECRET` produces a 503 that says
 *      exactly what to set, rather than an opaque crash.
 *   3. Migrations, memoised per instance.
 *   4. Route match.
 *   5. For everything except the login endpoints: resolve the session, require it to be fully
 *      authenticated, verify same-origin, verify the CSRF token.
 *   6. Permission check, declared per route in the table below.
 *
 * Authorisation is declared *in the route table*, next to the path it guards, so a new endpoint
 * cannot be added without stating what it requires. A route with no permission listed is still
 * behind full authentication — the permission is an additional constraint, never a replacement.
 */

import type { ContentKind } from "../src/lib/cms/types";
import { CONTENT_KINDS, CONTENT_STATUSES } from "../src/lib/cms/types";
import { ROLE_PERMISSIONS, type Permission } from "../src/lib/cms/permissions";
import { errorRef, type ApiRequest, type ApiResponse } from "./lib/http";
import {
  DatabaseNotConfiguredError,
  ensureMigrated,
  isDatabaseConfigured,
  isInvalidInputSyntax,
  pruneExpired,
} from "./lib/db";
import {
  AuthError,
  CSRF_COOKIE,
  authenticateWithPassword,
  clearAuthCookies,
  completeMfa,
  ensureBootstrapOwner,
  listSessions,
  parseCookies,
  requireCsrf,
  requireFullSession,
  requirePermission,
  requireSameOrigin,
  resolveSession,
  revokeAllSessions,
  revokeSession,
  setAuthCookies,
  SESSION_COOKIE,
  type AdminIdentity,
} from "./lib/auth";
import {
  SecretNotConfiguredError,
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  isSecretConfigured,
  issueCsrfToken,
  totpUri,
  verifyTotp,
} from "./lib/crypto";
import { recordActivity } from "./lib/audit";
import {
  HttpError,
  Router,
  badRequest,
  buildContext,
  enumValue,
  intParam,
  notFound,
  resolveRequestPath,
} from "./lib/router";
import {
  createContent,
  deleteContent,
  duplicateContent,
  getContent,
  isSlugAvailable,
  listContent,
  listRevisions,
  listTaxonomies,
  revertToRevision,
  transitionContent,
  updateContent,
  uniqueSlug,
} from "./lib/repo/content";
import { seedWebsiteDefaults } from "./lib/repo/website";
import {
  changeOwnPassword,
  twoFactorStatus,
  updateOwnProfile,
  verifyOwnPassword,
} from "./lib/repo/admins";
import { dashboardSnapshot, globalSearch } from "./lib/repo/insights";
import {
  createKnowledge,
  deleteKnowledge,
  getKnowledge,
  knowledgeStats,
  listKnowledge,
  updateKnowledge,
} from "./lib/repo/knowledge";
import { db } from "./lib/db";

// ─── Route declaration ───────────────────────────────────────────────────────

/** Routes reachable without a session. Everything else requires full authentication. */
const PUBLIC_ROUTES = new Set([
  "POST /auth/login",
  "POST /auth/mfa",
  "POST /auth/logout",
  "GET /auth/session",
]);

/**
 * Permission required per route.
 *
 * Kept as one table rather than a call inside each handler so the whole authorisation surface can
 * be reviewed at a glance, and so it is obvious when a new route has been given none.
 */
const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "GET /content": "content.read",
  "POST /content": "content.write",
  "GET /content/:id": "content.read",
  "PATCH /content/:id": "content.write",
  "DELETE /content/:id": "content.delete",
  "POST /content/:id/transition": "content.publish",
  "POST /content/:id/duplicate": "content.write",
  "GET /content/:id/revisions": "content.read",
  "POST /content/:id/revert": "content.write",
  "GET /taxonomies": "content.read",

  "GET /search": "content.read",

  "GET /knowledge": "ai.knowledge.read",
  "POST /knowledge": "ai.knowledge.write",
  "GET /knowledge/:id": "ai.knowledge.read",
  "PATCH /knowledge/:id": "ai.knowledge.write",
  "DELETE /knowledge/:id": "ai.knowledge.write",
};

const router = new Router<AdminIdentity>();

// ─── Authentication ──────────────────────────────────────────────────────────

router.add("POST /auth/login", async ({ req, res, body }) => {
  // Runs before the first login attempt so a fresh deployment has an account to sign in to.
  await ensureBootstrapOwner();

  const result = await authenticateWithPassword(req, body.email, body.password);

  if (!result.ok) {
    const failure = result.failure;

    if (failure.kind === "mfa_required") {
      // The half-session is issued now; it can reach only /auth/mfa until the code is verified.
      setAuthCookies(res, failure.sessionToken, failure.csrfToken);
      return { mfaRequired: true, csrfToken: failure.csrfToken };
    }

    await recordActivity(
      req,
      { email: typeof body.email === "string" ? body.email.slice(0, 200) : undefined },
      failure.kind === "account_locked" ? "login.locked" : "login.failed",
      { outcome: "failure", metadata: { reason: failure.kind } },
    );

    if (failure.kind === "rate_limited" || failure.kind === "account_locked") {
      throw new HttpError(
        429,
        `Too many attempts. Try again in ${Math.ceil(failure.retryAfterSeconds / 60)} minute(s).`,
        failure.kind,
      );
    }
    if (failure.kind === "invite_pending") {
      throw new HttpError(
        403,
        "This account has not been set up yet. Use the invitation link you were sent.",
        failure.kind,
      );
    }
    if (failure.kind === "suspended") {
      throw new HttpError(403, "This account has been suspended.", failure.kind);
    }
    // One message for every credential problem, so the response cannot enumerate accounts.
    throw new HttpError(401, "Those credentials are not correct.", "invalid_credentials");
  }

  setAuthCookies(res, result.sessionToken, result.csrfToken);
  await recordActivity(req, result.identity, "login.success");

  const session = await resolveSession(req);
  return {
    identity: publicIdentity(session?.identity ?? result.identity),
    csrfToken: result.csrfToken,
  };
});

router.add("POST /auth/mfa", async ({ req, res, body }) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) throw new HttpError(401, "Start again from the sign-in screen.", "unauthenticated");

  const result = await completeMfa(req, token, body.code);
  if (!result.ok) {
    const failure = result.failure;
    if (failure.kind === "rate_limited") {
      throw new HttpError(
        429,
        `Too many attempts. Try again in ${Math.ceil(failure.retryAfterSeconds / 60)} minute(s).`,
        failure.kind,
      );
    }
    await recordActivity(req, null, "login.failed", {
      outcome: "failure",
      metadata: { stage: "mfa" },
    });
    throw new HttpError(
      401,
      "That code is not valid. Check your authenticator and try again.",
      "mfa_invalid",
    );
  }

  setAuthCookies(res, result.sessionToken, result.csrfToken);
  await recordActivity(req, result.identity, "login.success", { metadata: { mfa: true } });
  return { identity: publicIdentity(result.identity), csrfToken: result.csrfToken };
});

router.add("POST /auth/logout", async ({ req, res }) => {
  const session = await resolveSession(req);
  if (session) {
    await revokeSession(session.identity.sessionId);
    await recordActivity(req, session.identity, "logout");
  }
  clearAuthCookies(res);
  return { signedOut: true };
});

/**
 * Reports the current session.
 *
 * Public because the admin panel calls it on boot to decide whether to show the login screen. It
 * answers `{ authenticated: false }` for an anonymous caller rather than 401, so a normal
 * unauthenticated load is not logged as an error.
 */
router.add("GET /auth/session", async ({ req, res }) => {
  const session = await resolveSession(req);
  if (!session) {
    return {
      authenticated: false,
      config: configFlags(),
    };
  }

  if (!session.identity.mfaSatisfied) {
    return { authenticated: false, mfaRequired: true, config: configFlags() };
  }

  // Reissued on every check so a long-lived tab's token cannot go stale against a rotated cookie.
  const csrfToken = parseCookies(req)[CSRF_COOKIE] || issueCsrfToken(session.identity.sessionId);
  setAuthCookies(res, parseCookies(req)[SESSION_COOKIE], csrfToken);

  return {
    authenticated: true,
    identity: publicIdentity(session.identity),
    permissions: ROLE_PERMISSIONS[session.identity.role],
    csrfToken,
    config: configFlags(),
  };
});

// ─── Account ─────────────────────────────────────────────────────────────────

router.add("GET /account", async ({ identity }) => ({
  identity: publicIdentity(identity),
  permissions: ROLE_PERMISSIONS[identity.role],
  twoFactor: await twoFactorStatus(identity.id),
  sessions: await listSessions(identity.id),
}));

router.add("PATCH /account", async ({ req, body, identity }) => {
  const admin = await updateOwnProfile(identity, body);
  await recordActivity(req, identity, "admin.updated", {
    entityType: "admin",
    entityId: identity.id,
    entityLabel: admin.email,
    metadata: { self: true },
  });
  return { admin };
});

router.add("POST /account/password", async ({ req, body, identity }) => {
  await changeOwnPassword(identity, body.currentPassword, body.newPassword);
  await recordActivity(req, identity, "password.changed", {
    entityType: "admin",
    entityId: identity.id,
    entityLabel: identity.email,
  });
  return { changed: true, otherSessionsSignedOut: true };
});

router.add("POST /account/sessions/revoke-all", async ({ req, identity }) => {
  const revoked = await revokeAllSessions(identity.id, identity.sessionId);
  await recordActivity(req, identity, "logout.all", { metadata: { revoked } });
  return { revoked };
});

/**
 * Begins two-factor enrolment.
 *
 * The secret is stored immediately but `totp_enabled` stays false, so an abandoned enrolment
 * cannot lock anyone out. It becomes active only when a valid code proves the authenticator was
 * set up correctly.
 */
router.add("POST /account/2fa/start", async ({ identity }) => {
  if (!isSecretConfigured()) throw new SecretNotConfiguredError();

  const secret = generateTotpSecret();
  await db()`
    UPDATE admin_users SET totp_secret = ${encryptSecret(secret)}, updated_at = now()
    WHERE id = ${identity.id}
  `;

  return { secret, uri: totpUri(identity.email, secret) };
});

router.add("POST /account/2fa/confirm", async ({ req, body, identity }) => {
  const rows = await db()<{ totp_secret: string | null }[]>`
    SELECT totp_secret FROM admin_users WHERE id = ${identity.id}
  `;
  const secret = decryptSecret(rows[0]?.totp_secret ?? null);
  if (!secret) throw badRequest("Start the two-factor setup again.");

  if (!verifyTotp(secret, body.code)) {
    throw badRequest("That code is not valid. Check your authenticator app and try again.");
  }

  // Issued only now, so an administrator never holds recovery codes for inactive 2FA.
  const { codes, hashes } = generateRecoveryCodes();
  await db()`
    UPDATE admin_users SET
      totp_enabled = true,
      totp_confirmed_at = now(),
      recovery_codes = ${db().json(hashes.map((hash) => ({ hash, usedAt: null })))},
      updated_at = now()
    WHERE id = ${identity.id}
  `;

  await recordActivity(req, identity, "twofactor.enabled", {
    entityType: "admin",
    entityId: identity.id,
    entityLabel: identity.email,
  });

  return { enabled: true, recoveryCodes: codes };
});

router.add("POST /account/2fa/disable", async ({ req, body, identity }) => {
  // Re-authentication: a hijacked session must not be able to remove the second factor.
  if (!(await verifyOwnPassword(identity.id, body.password))) {
    throw badRequest("Your password is not correct.");
  }

  await db()`
    UPDATE admin_users SET
      totp_enabled = false, totp_secret = NULL, totp_confirmed_at = NULL,
      recovery_codes = '[]'::jsonb, updated_at = now()
    WHERE id = ${identity.id}
  `;

  await recordActivity(req, identity, "twofactor.disabled", {
    entityType: "admin",
    entityId: identity.id,
    entityLabel: identity.email,
  });

  return { enabled: false };
});

router.add("POST /account/2fa/recovery-codes", async ({ body, identity }) => {
  if (!(await verifyOwnPassword(identity.id, body.password))) {
    throw badRequest("Your password is not correct.");
  }
  const status = await twoFactorStatus(identity.id);
  if (!status.enabled) throw badRequest("Turn on two-factor authentication first.");

  const { codes, hashes } = generateRecoveryCodes();
  await db()`
    UPDATE admin_users SET
      recovery_codes = ${db().json(hashes.map((hash) => ({ hash, usedAt: null })))},
      updated_at = now()
    WHERE id = ${identity.id}
  `;
  return { recoveryCodes: codes };
});

// ─── Dashboard and search ────────────────────────────────────────────────────

router.add("GET /dashboard", async () => {
  await seedWebsiteDefaults();
  return dashboardSnapshot();
});

router.add("GET /search", async ({ query }) => ({
  results: await globalSearch(query.get("q") ?? "", intParam(query, "limit", 30, 60) || 30),
}));

router.add("GET /taxonomies", async ({ query }) => {
  const kind = query.get("kind");
  return listTaxonomies(
    kind && (CONTENT_KINDS as readonly string[]).includes(kind) ? (kind as ContentKind) : undefined,
  );
});

// ─── Content ─────────────────────────────────────────────────────────────────

/**
 * Reads the requested kind from a query string or body.
 *
 * Required on write so an item can never be created without one; the list endpoint treats it as
 * an optional filter, which is what lets the Publishing views span all kinds at once.
 */
function kindFrom(value: unknown, required: boolean): ContentKind | undefined {
  if (typeof value !== "string" || !value) {
    if (required) throw badRequest(`A content kind is required (${CONTENT_KINDS.join(", ")}).`);
    return undefined;
  }
  return enumValue(value, CONTENT_KINDS, "Content kind");
}

router.add("GET /content", async ({ query }) => {
  const statusParam = query.get("status");
  const result = await listContent({
    kind: kindFrom(query.get("kind"), false),
    status: statusParam ? enumValue(statusParam, CONTENT_STATUSES, "Status") : undefined,
    category: query.get("category") ?? undefined,
    tag: query.get("tag") ?? undefined,
    search: query.get("search") ?? undefined,
    featured: query.get("featured") === "true" ? true : undefined,
    limit: intParam(query, "limit", 50, 200) || 50,
    offset: intParam(query, "offset", 0, 100_000),
    sort: (query.get("sort") as "recent" | "published" | "title" | null) ?? "recent",
  });
  return result;
});

// Declared before "GET /content/:id" so the literal segment is not captured as an id.
router.add("GET /content/slug-available", async ({ query }) => {
  const kind = kindFrom(query.get("kind"), true) as ContentKind;
  const slug = query.get("slug") ?? "";
  if (!slug) throw badRequest("A slug is required.");
  return {
    available: await isSlugAvailable(kind, slug, query.get("excludeId") ?? undefined),
    suggestion: await uniqueSlug(kind, slug, query.get("excludeId") ?? undefined),
  };
});

router.add("POST /content", async ({ req, body, identity }) => {
  const kind = kindFrom(body.kind, true) as ContentKind;
  const item = await createContent(kind, body, identity);
  await recordActivity(req, identity, "content.created", {
    entityType: kind,
    entityId: item.id,
    entityLabel: item.title,
  });
  return { item };
});

router.add("GET /content/:id", async ({ params }) => {
  const item = await getContent(params.id);
  if (!item) throw notFound("That content");
  return { item, revisions: await listRevisions(item.id) };
});

router.add("PATCH /content/:id", async ({ req, params, body, identity }) => {
  const expected = typeof body.revision === "number" ? body.revision : undefined;
  const item = await updateContent(params.id, body, identity, expected);
  await recordActivity(req, identity, "content.updated", {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
    metadata: { revision: item.revision },
  });
  return { item };
});

router.add("DELETE /content/:id", async ({ req, params, identity }) => {
  const item = await deleteContent(params.id);
  await recordActivity(req, identity, "content.deleted", {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
  });
  return { deleted: true, id: item.id };
});

router.add("POST /content/:id/transition", async ({ req, params, body, identity }) => {
  const status = enumValue(body.status, CONTENT_STATUSES, "Status");
  const item = await transitionContent(
    params.id,
    status,
    typeof body.scheduledFor === "string" ? body.scheduledFor : null,
    identity,
  );

  // A distinct audit action per transition, so the log reads as events rather than as edits.
  const action =
    status === "published"
      ? "content.published"
      : status === "scheduled"
        ? "content.scheduled"
        : status === "archived"
          ? "content.archived"
          : "content.unpublished";

  await recordActivity(req, identity, action, {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
    metadata: { status, scheduledFor: item.scheduledFor },
  });

  return { item };
});

router.add("POST /content/:id/duplicate", async ({ req, params, identity }) => {
  const item = await duplicateContent(params.id, identity);
  await recordActivity(req, identity, "content.duplicated", {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
    metadata: { sourceId: params.id },
  });
  return { item };
});

router.add("GET /content/:id/revisions", async ({ params }) => ({
  revisions: await listRevisions(params.id),
}));

router.add("POST /content/:id/revert", async ({ req, params, body, identity }) => {
  const revision = Number(body.revision);
  if (!Number.isFinite(revision)) throw badRequest("Choose a revision to restore.");

  const item = await revertToRevision(params.id, revision, identity);
  await recordActivity(req, identity, "content.restored", {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
    metadata: { revertedTo: revision },
  });
  return { item };
});

// ─── AI assistant knowledge base ─────────────────────────────────────────────

router.add("GET /knowledge", async ({ query }) => {
  const statusParam = query.get("status");
  const result = await listKnowledge({
    search: query.get("search") ?? undefined,
    status: statusParam === "active" || statusParam === "disabled" ? statusParam : undefined,
    limit: intParam(query, "limit", 50, 200) || 50,
    offset: intParam(query, "offset", 0, 100_000),
  });
  return { ...result, stats: await knowledgeStats() };
});

router.add("POST /knowledge", async ({ req, body, identity }) => {
  const entry = await createKnowledge({ ...body, sourceKind: "note" }, identity);
  await recordActivity(req, identity, "knowledge.created", {
    entityType: "knowledge",
    entityId: entry.id,
    entityLabel: entry.title || "Untitled note",
    metadata: { sourceKind: "note", characters: entry.characters },
  });
  return { entry };
});

router.add("GET /knowledge/:id", async ({ params }) => {
  const entry = await getKnowledge(params.id);
  if (!entry) throw notFound("That knowledge entry");
  return { entry };
});

router.add("PATCH /knowledge/:id", async ({ req, params, body, identity }) => {
  const entry = await updateKnowledge(params.id, body, identity);
  await recordActivity(req, identity, "knowledge.updated", {
    entityType: "knowledge",
    entityId: entry.id,
    entityLabel: entry.title || "Untitled entry",
    metadata: { status: entry.status },
  });
  return { entry };
});

router.add("DELETE /knowledge/:id", async ({ req, params, identity }) => {
  const { entry } = await deleteKnowledge(params.id);
  await recordActivity(req, identity, "knowledge.deleted", {
    entityType: "knowledge",
    entityId: entry.id,
    entityLabel: entry.title || "Untitled entry",
  });
  return { deleted: true, id: entry.id };
});

// ─── Shared response shaping ─────────────────────────────────────────────────

/** Strips internals — session id, MFA state — from an identity before it leaves the server. */
function publicIdentity(identity: AdminIdentity) {
  return {
    id: identity.id,
    email: identity.email,
    name: identity.name,
    title: identity.title,
    avatarUrl: identity.avatarUrl,
    role: identity.role,
    twoFactorEnabled: identity.totpEnabled,
    mustChangePassword: identity.mustChangePassword,
    lastLoginAt: identity.lastLoginAt,
  };
}

/**
 * Which optional integrations are configured.
 *
 * Sent with the session so the admin panel can explain a missing capability in place — "media
 * storage is not configured yet" beside the upload button — instead of letting the administrator
 * discover it through a failed action.
 */
function configFlags() {
  return {
    databaseConfigured: isDatabaseConfigured(),
    secretConfigured: isSecretConfigured(),
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const ref = errorRef("CMS");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  // The admin API must never be framed or sniffed, whatever the platform's defaults are.
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");

  const { path, query } = resolveRequestPath(req, "/api/cms");
  const method = (req.method ?? "GET").toUpperCase();

  try {
    // Reported before anything touches the database, with the variable name to set — a blank
    // 500 on first deploy is the least useful possible failure.
    if (!isDatabaseConfigured()) throw new DatabaseNotConfiguredError();
    if (!isSecretConfigured()) throw new SecretNotConfiguredError();

    await ensureMigrated();

    const matched = router.match(method, path);
    if (matched === null) {
      throw new HttpError(404, `No such endpoint: ${method} ${path}`, "unknown_route");
    }
    if (matched === "method_mismatch") {
      throw new HttpError(405, `${method} is not allowed on ${path}`, "method_not_allowed");
    }

    const routeKey = `${method} ${routePatternFor(path, matched.params)}`;
    let identity = null as AdminIdentity | null;

    if (!PUBLIC_ROUTES.has(routeKey) && !PUBLIC_ROUTES.has(`${method} ${path}`)) {
      const session = await resolveSession(req);
      identity = requireFullSession(session);
      requireSameOrigin(req);
      requireCsrf(req, identity);

      const permission = ROUTE_PERMISSIONS[routeKey];
      if (permission) requirePermission(identity, permission);
    }

    const context = buildContext(req, res, path, query, matched.params, identity as AdminIdentity);
    const payload = await matched.handler(context);

    // Housekeeping, after the response payload is ready so it never delays the request. Failures
    // are already swallowed inside pruneExpired.
    if (Math.random() < 0.02) await pruneExpired();

    if (!res.headersSent) res.status(200).json({ ok: true, ...(payload as object) });
  } catch (error) {
    respondWithError(res, error, ref);
  }
}

/**
 * Reconstructs the registered pattern from a concrete path.
 *
 * The permission table and the public-route set are both keyed by pattern (`/content/:id`), but
 * the request carries a concrete path (`/content/abc-123`). Substituting the matched parameter
 * values back out recovers the key. Values are replaced only as whole segments, so a literal
 * segment that happens to equal a parameter value is not rewritten.
 */
function routePatternFor(path: string, params: Record<string, string>): string {
  if (Object.keys(params).length === 0) return path;

  const byValue = new Map(Object.entries(params).map(([name, value]) => [value, `:${name}`]));
  return `/${path
    .split("/")
    .filter(Boolean)
    .map((segment) => byValue.get(segment) ?? segment)
    .join("/")}`;
}

/**
 * Converts any thrown value into a JSON error response.
 *
 * Known error types map to their own status and a message written for an administrator to read.
 * Anything else becomes a 500 carrying only a correlation reference: the details go to the
 * function logs, never to the client, so an unexpected exception cannot leak a stack trace, a
 * query or a connection string.
 */
function respondWithError(res: ApiResponse, error: unknown, ref: string): void {
  if (res.headersSent) return;

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      ok: false,
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (error instanceof AuthError) {
    res.status(error.statusCode).json({ ok: false, error: error.message, code: error.code });
    return;
  }

  // A path parameter that is not a UUID reaches Postgres and is rejected there. That is a
  // "no such record", not a server fault, so it must not surface as a 500.
  if (isInvalidInputSyntax(error)) {
    res.status(404).json({
      ok: false,
      error: "That item could not be found.",
      code: "not_found",
    });
    return;
  }

  if (error instanceof DatabaseNotConfiguredError || error instanceof SecretNotConfiguredError) {
    console.error(`[api/cms:${ref}] not configured:`, error.message);
    res.status(503).json({ ok: false, error: error.message, code: "not_configured" });
    return;
  }

  console.error(`[api/cms:${ref}]`, error);
  res.status(500).json({
    ok: false,
    error: `Something went wrong on our side. ${faultSummary(error)}`,
    code: "internal_error",
    fault: faultFields(error),
    ref,
  });
}

/**
 * The structural facts about a fault, safe to return to the caller.
 *
 * ## Why a 500 says anything at all
 *
 * The generic "something went wrong, the reference is in the logs" is the right default for a
 * public API, where an error message is an information leak and the operator can always read the
 * logs. Neither holds here. This is a private, invitation-only panel, and its operator may be an
 * administrator on a phone with no access to platform logs at all — for whom an opaque 500 beside
 * a password field is unactionable. A fault that cannot be described cannot be reported, and a
 * fault that cannot be reported does not get fixed.
 *
 * ## What is deliberately excluded
 *
 * Only *structural* fields are exposed: the error's class, the SQLSTATE, and the schema object
 * involved. Postgres's `detail` and `hint` are never included, because those echo the offending
 * row's values — the one place a database error genuinely can leak data. Free-text messages are
 * truncated and only used for non-database faults, where they name a property or type rather than
 * a value.
 */
function faultFields(error: unknown): Record<string, string> {
  const e = (error ?? {}) as {
    name?: string;
    code?: string;
    constraint_name?: string;
    table_name?: string;
    column_name?: string;
    routine?: string;
    errno?: number;
    syscall?: string;
  };

  const fields: Record<string, string> = {};
  const set = (key: string, value: unknown): void => {
    if (typeof value === "string" && value !== "") fields[key] = value.slice(0, 80);
    else if (typeof value === "number") fields[key] = String(value);
  };

  set("name", e.name);
  // For a Postgres error this is the five-character SQLSTATE; for a socket failure, a code such
  // as ECONNREFUSED or ETIMEDOUT. Either identifies the failure precisely on its own.
  set("code", e.code);
  set("constraint", e.constraint_name);
  set("table", e.table_name);
  set("column", e.column_name);
  set("routine", e.routine);
  set("syscall", e.syscall);

  return fields;
}

/** The same facts as one short sentence, for a screen that shows a single line of red text. */
function faultSummary(error: unknown): string {
  const fields = faultFields(error);
  const parts = Object.entries(fields).map(([key, value]) => `${key}=${value}`);

  // A message is worth including only when the structural fields say nothing useful, which in
  // practice means a programming error rather than a database one.
  if (!fields.code && error instanceof Error && error.message) {
    parts.push(`message=${error.message.slice(0, 160)}`);
  }

  return parts.length === 0 ? "No detail was available." : `Fault: ${parts.join(" ")}.`;
}
