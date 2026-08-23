/**
 * Postgres access for the ENICE Website Manager.
 *
 * ## Choice of driver
 *
 * `postgres` (postgres.js) has zero transitive dependencies and speaks the wire protocol
 * directly, so it bundles cleanly into the esbuild output and works against *any* Postgres —
 * Vercel Postgres, Neon, Supabase, RDS or self-hosted. A vendor-specific HTTP driver would have
 * been marginally faster to cold-start but would put the CMS's data behind one provider's API,
 * which is precisely the lock-in this project exists to escape.
 *
 * ## Serverless connection handling
 *
 * Each Vercel invocation may run in its own isolate, so a large pool per instance would exhaust
 * the server's connection limit under load. The pool is therefore capped at one connection and
 * allowed to go idle quickly, and `prepare` is disabled so the CMS works through a
 * transaction-mode pooler (PgBouncer, Supabase's port 6543), where named prepared statements
 * are not supported. Operators should point `DATABASE_URL` at a pooled endpoint.
 *
 * ## Failure mode
 *
 * The website must not break because the CMS database is unreachable. Callers can ask
 * `isDatabaseConfigured()` first, and the public read API degrades to empty collections rather
 * than surfacing a 500 to a visitor.
 */

import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { MIGRATIONS, MIGRATION_LOCK_KEY, MIGRATIONS_TABLE_SQL } from "./schema";

// ─── Errors ──────────────────────────────────────────────────────────────────

/** Thrown when a code path that needs storage runs without `DATABASE_URL` set. */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "The Website Manager database is not configured. Set DATABASE_URL to a Postgres " +
        "connection string (a pooled endpoint is recommended). If the database was attached " +
        "through a Vercel integration under a prefix, the prefixed name is also accepted — " +
        "the value simply has to begin with postgres:// or postgresql://.",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

/** Raised for a unique-constraint collision, so handlers can answer 409 rather than 500. */
export class UniqueViolationError extends Error {
  constructor(
    message: string,
    readonly constraint: string,
  ) {
    super(message);
    this.name = "UniqueViolationError";
  }
}

/** Postgres reports a unique-constraint breach as SQLSTATE 23505. */
export function isUniqueViolation(error: unknown): boolean {
  return Boolean(error) && (error as { code?: string }).code === "23505";
}

/**
 * Whether Postgres rejected a value as unparseable for its column type (SQLSTATE 22P02).
 *
 * In practice this means a path parameter that is not a UUID — `/content/not-a-real-id`. Without
 * translating it, every such request becomes a 500 with a database error in the logs, when the
 * honest answer is simply that no such record exists. Callers map it to a 404.
 */
export function isInvalidInputSyntax(error: unknown): boolean {
  return Boolean(error) && (error as { code?: string }).code === "22P02";
}

/** The constraint name from a unique violation, used to build a useful message. */
export function violatedConstraint(error: unknown): string {
  return (error as { constraint_name?: string }).constraint_name ?? "";
}

// ─── Connection ──────────────────────────────────────────────────────────────

export type Sql = postgres.Sql<Record<string, never>>;

let client: Sql | null = null;

/** A value we are willing to treat as a connection string. */
const POSTGRES_URL = /^postgres(ql)?:\/\/[^\s]/i;

/**
 * Variable names that may hold the connection string, most preferred first.
 *
 * Pooled endpoints come before direct ones because each serverless invocation opens its own
 * connection, and the unpooled endpoint runs out of them far sooner. `POSTGRES_URL_NO_SSL` is
 * deliberately absent: this CMS holds credentials and audit history, so an unencrypted link to
 * it is never the right default.
 */
const URL_VARIABLES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
] as const;

/**
 * Finds the Postgres connection string in the environment.
 *
 * ## Why this is not just `process.env.DATABASE_URL`
 *
 * Vercel lets an operator attach a database store under a *prefix*, and the prefix is applied to
 * every variable the provider publishes. Connecting Neon under the prefix `DATABASE` produces
 * `DATABASE_DATABASE_URL`, not `DATABASE_URL`. Those variables are owned by the integration and
 * cannot be renamed by hand, so a resolver that insisted on the bare name would leave the
 * operator with a database that is correctly provisioned, correctly connected, and still
 * unreachable — with no way to fix it short of tearing the store down and re-adding it.
 *
 * So each known name is accepted either exactly or as a `_`-delimited suffix, and the candidate
 * must actually look like a Postgres URL. Requiring the scheme is what makes the suffix match
 * safe: the same integrations also publish ARNs, hostnames and project IDs, and none of those
 * can be mistaken for a connection string.
 *
 * Preference order is by name, not by discovery order, because `process.env` ordering is not
 * guaranteed and a database that is chosen at random between deployments is worse than one that
 * is missing. Within a single name, the shortest matching variable wins, so an explicitly set
 * `DATABASE_URL` always beats a prefixed one an integration happened to inject.
 */
export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): {
  url: string;
  variable: string;
} | null {
  for (const name of URL_VARIABLES) {
    const matches = Object.keys(env)
      .filter((key) => key === name || key.endsWith(`_${name}`))
      .filter((key) => POSTGRES_URL.test((env[key] ?? "").trim()))
      .sort((a, b) => a.length - b.length || a.localeCompare(b));

    const variable = matches[0];
    if (variable !== undefined) return { url: (env[variable] as string).trim(), variable };
  }

  return null;
}

export function databaseUrl(): string | undefined {
  return resolveDatabaseUrl()?.url;
}

export function isDatabaseConfigured(): boolean {
  return resolveDatabaseUrl() !== null;
}

/**
 * Chooses a TLS mode for the connection, as options to *spread* into the driver config.
 *
 * Local development against a container needs TLS off, while every managed provider requires it.
 * An explicit `sslmode` in the URL always wins so an operator can pin `verify-full` with their
 * own CA bundle.
 *
 * ## Why this returns an object rather than a value
 *
 * postgres.js merges its options by *key presence*, not by definedness:
 *
 * ```js
 * const value = k in o ? o[k] : k in query ? … : d
 * ```
 *
 * So passing `ssl: undefined` to mean "no opinion, use the URL" does the opposite: the key is
 * present, `undefined` wins, and both the `sslmode` in the connection string and the driver's own
 * default are discarded — silently turning TLS off. Against a provider that requires TLS, such as
 * Neon, every connection then fails, and it fails at connect time with a message that says
 * nothing about SSL. Returning a partial object means the key is genuinely absent when we have no
 * opinion, which is the only way to defer to the URL.
 */
function sslOptions(url: string): Pick<postgres.Options<Record<string, never>>, "ssl"> {
  // postgres.js maps `sslmode` in the query string onto its own `ssl` option, including
  // `disable` → false. Leaving the key out lets that happen.
  if (/[?&]sslmode=/i.test(url)) return {};
  try {
    const { hostname } = new URL(url);
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return { ssl: false };
    }
  } catch {
    // An unparseable URL will fail at connect time with a clearer error than anything here.
  }
  return { ssl: "require" };
}

/**
 * The shared client, created on first use.
 *
 * Throws `DatabaseNotConfiguredError` rather than returning null: every caller needs the
 * connection to proceed, so failing loudly at the point of use beats threading null checks
 * through the whole API layer. Guard with `isDatabaseConfigured()` where degrading is correct.
 */
export function db(): Sql {
  if (client) return client;

  const resolved = resolveDatabaseUrl();
  if (resolved === null) throw new DatabaseNotConfiguredError();
  const { url, variable } = resolved;

  // The variable *name* only — never the value, which carries the password. With prefixed
  // integration variables in play, "which one did it pick?" is the first question worth
  // answering when a deployment talks to a database nobody expected.
  console.log(`[db] connecting using ${variable}`);

  client = postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    // Named prepared statements are incompatible with transaction-mode poolers.
    prepare: false,
    // Spread, never assigned: see sslOptions on why `ssl: undefined` would disable TLS.
    ...sslOptions(url),
    // Postgres emits notices for every `IF NOT EXISTS` no-op during migration; they are
    // expected and would otherwise fill the function logs on each cold start.
    onnotice: () => {},
    transform: { undefined: null },
  });

  return client;
}

/** Fresh UUID for a primary key. Generated in the app so no Postgres extension is needed. */
export function newId(): string {
  return randomUUID();
}

// ─── Migrations ──────────────────────────────────────────────────────────────

/**
 * Per-instance memo of the migration run.
 *
 * Stored as the in-flight promise rather than a boolean so that concurrent requests on a
 * warm instance await the same run instead of each starting their own.
 */
let migrationPromise: Promise<void> | null = null;

/**
 * Applies any migrations this database has not seen, exactly once per instance.
 *
 * Called at the top of every API request. That sounds expensive but is not: after the first
 * invocation the memoised promise resolves immediately, and a cold start pays one cheap
 * `SELECT` against `cms_migrations`.
 *
 * Running migrations on request rather than as a separate deploy step is a deliberate
 * trade-off. It means there is no way to deploy code whose schema has not been applied — the
 * failure mode that produces the worst production incidents — at the cost of a slower first
 * request after a schema change.
 */
export async function ensureMigrated(): Promise<void> {
  if (!isDatabaseConfigured()) throw new DatabaseNotConfiguredError();
  if (migrationPromise) return migrationPromise;

  migrationPromise = runMigrations().catch((error: unknown) => {
    // Clear the memo so a transient failure (a database still waking up) can be retried by
    // the next request instead of poisoning this instance for its whole lifetime.
    migrationPromise = null;
    throw error;
  });

  return migrationPromise;
}

async function runMigrations(): Promise<void> {
  const sql = db();

  await sql.unsafe(MIGRATIONS_TABLE_SQL).simple();

  const applied = await sql<{ id: number }[]>`SELECT id FROM cms_migrations`;
  const appliedIds = new Set(applied.map((row) => row.id));
  const pending = MIGRATIONS.filter((migration) => !appliedIds.has(migration.id));
  if (pending.length === 0) return;

  // Serialise the whole run across instances. `IF NOT EXISTS` makes each statement safe on
  // its own, but two sessions issuing CREATE INDEX against the same table can deadlock.
  await sql`SELECT pg_advisory_lock(${MIGRATION_LOCK_KEY}::bigint)`;
  try {
    // Re-read inside the lock: another instance may have finished while we waited.
    const nowApplied = await sql<{ id: number }[]>`SELECT id FROM cms_migrations`;
    const nowAppliedIds = new Set(nowApplied.map((row) => row.id));

    for (const migration of MIGRATIONS) {
      if (nowAppliedIds.has(migration.id)) continue;
      // `.simple()` runs the statements in one round trip using the simple query protocol,
      // which is what allows a multi-statement string.
      await sql.unsafe(migration.sql).simple();
      await sql`
        INSERT INTO cms_migrations (id, name)
        VALUES (${migration.id}, ${migration.name})
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`[cms] applied migration ${migration.id}: ${migration.name}`);
    }
  } finally {
    await sql`SELECT pg_advisory_unlock(${MIGRATION_LOCK_KEY}::bigint)`;
  }
}

// ─── Persisted rate limiting ─────────────────────────────────────────────────

/**
 * Fixed-window counter in the database.
 *
 * The in-memory limiter in `./http` is per-instance, which is fine for shedding accidental
 * load but useless against a deliberate attacker: concurrent invocations each get their own
 * counter. Anything protecting a credential or a paid resource is counted here instead.
 *
 * The upsert is a single statement, so two simultaneous callers cannot both read a stale count
 * and write the same increment.
 */
export async function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ limited: boolean; remaining: number; resetAt: Date }> {
  const sql = db();
  const rows = await sql<{ count: number; reset_at: Date }[]>`
    INSERT INTO cms_rate_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + ${`${windowMs} milliseconds`}::interval)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN cms_rate_limits.reset_at < now() THEN 1
        ELSE cms_rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN cms_rate_limits.reset_at < now()
          THEN now() + ${`${windowMs} milliseconds`}::interval
        ELSE cms_rate_limits.reset_at
      END
    RETURNING count, reset_at
  `;

  const row = rows[0];
  const count = row?.count ?? 1;
  return {
    limited: count > max,
    remaining: Math.max(0, max - count),
    resetAt: row?.reset_at ?? new Date(Date.now() + windowMs),
  };
}

/** Clears a counter, e.g. after a successful login. */
export async function clearRateLimit(key: string): Promise<void> {
  await db()`DELETE FROM cms_rate_limits WHERE key = ${key}`;
}

/**
 * Removes expired sessions and stale rate-limit rows.
 *
 * Housekeeping rather than correctness: expiry is always checked on read, so a lingering row
 * is never honoured. Called opportunistically so the tables do not grow without bound, and
 * deliberately never allowed to fail a request.
 */
export async function pruneExpired(): Promise<void> {
  const sql = db();
  try {
    await sql`DELETE FROM admin_sessions WHERE expires_at < now() - interval '7 days'`;
    await sql`DELETE FROM cms_rate_limits WHERE reset_at < now() - interval '1 day'`;
  } catch (error) {
    console.warn("[cms] pruning expired rows failed:", error);
  }
}

// ─── Value helpers ───────────────────────────────────────────────────────────

/** Serialises a value for a `jsonb` column. postgres.js needs the explicit wrapper. */
export function json(value: unknown) {
  return db().json((value ?? null) as Parameters<Sql["json"]>[0]);
}

/** Reads a `timestamptz` column as an ISO string, tolerating null. */
export function isoOrNull(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** Reads a `timestamptz` column as an ISO string, falling back to the epoch-safe now. */
export function iso(value: Date | string | null | undefined): string {
  return isoOrNull(value) ?? new Date().toISOString();
}

/** Parses an ISO date from client input, returning null for anything unusable. */
export function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
