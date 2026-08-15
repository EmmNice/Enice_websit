/**
 * PulseAssist early-access storage, backed by Resend.
 *
 * SERVER ONLY — reads `RESEND_API_KEY`. Never import this from a route or component;
 * it is consumed exclusively by the handlers in `api-src/`.
 *
 * ## Why Resend rather than a database
 *
 * The rest of this site already stores form data in Resend (the watchlist audience), and
 * `replit.md` records that as the project's preference. Keeping registrations there means
 * one vendor, one API key, no migrations, and no separate Edge Function deploy step — the
 * handlers ship with the site through `api-src/`.
 *
 * ## How a registration is represented
 *
 * One Resend contact, added to a dedicated segment, with the application stored in custom
 * Contact Properties. Contacts are global per email address, so property keys are
 * namespaced with `pulseassist_` to avoid colliding with the watchlist or anything added
 * later.
 *
 * ## Constraints this design inherits from the Resend API
 *
 * - `contacts.list()` returns only `id/email/first_name/last_name/created_at/unsubscribed`.
 *   Custom properties come back only from `contacts.get()`, so listing registrations with
 *   their business details costs one request per row (see `listRegistrations`).
 * - Pagination exposes `limit` only (max 100) with no cursor, so at most 100 registrations
 *   are readable through the API. Beyond that, use the Resend dashboard.
 * - A property key must exist before it can be set on a contact; values for unknown keys
 *   are silently dropped. `ensureProperties()` provisions them idempotently so a forgotten
 *   setup step cannot quietly discard application data.
 */
import { Resend } from "resend";
import { EARLY_ACCESS_STATUSES, type EarlyAccessStatus } from "./early-access";

export const SEGMENT_NAME = "PulseAssist Early Access";
export const PRODUCT = "PulseAssist";
export const SOURCE = "enice_website";
export const INITIAL_STATUS: EarlyAccessStatus = "EARLY_ACCESS";

/** Keys must be alphanumeric + underscore, max 50 characters. */
export const PROPERTY_KEYS = {
  status: "pulseassist_status",
  businessName: "pulseassist_business_name",
  businessType: "pulseassist_business_type",
  businessNeed: "pulseassist_business_need",
  source: "pulseassist_source",
  registeredAt: "pulseassist_registered_at",
  updatedAt: "pulseassist_updated_at",
} as const;

const ALL_PROPERTY_KEYS = Object.values(PROPERTY_KEYS);

export type Registration = {
  id: string;
  email: string;
  fullName: string;
  product: string;
  businessName: string;
  businessType: string;
  businessNeed: string;
  source: string;
  status: EarlyAccessStatus;
  createdAt: string;
  updatedAt: string;
};

export class EarlyAccessConfigError extends Error {}

function client(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EarlyAccessConfigError("RESEND_API_KEY is not configured.");
  }
  return new Resend(apiKey);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resend's default limit is around 2 requests/second. */
const THROTTLE_MS = 260;

type ResendResult<T> = {
  data: T | null;
  error: { message: string; statusCode: number | null } | null;
};

function isTransient(error: { message: string; statusCode: number | null } | null): boolean {
  if (!error) return false;
  const status = error.statusCode ?? 0;
  return status === 429 || status >= 500 || /rate.?limit|too many/i.test(error.message);
}

/**
 * Retries a Resend call on rate limiting and server errors.
 *
 * Provisioning issues nine calls in quick succession, which tripped Resend's per-second
 * limit and made the first request after a cold start fail outright — observed in
 * production on the very first live submission. Callers are retried with backoff instead.
 */
async function withRetry<T>(
  label: string,
  call: () => Promise<ResendResult<T>>,
  attempts = 3,
): Promise<ResendResult<T>> {
  let last: ResendResult<T> = { data: null, error: null };
  for (let i = 0; i < attempts; i++) {
    last = await call();
    if (!isTransient(last.error)) return last;
    if (i < attempts - 1) {
      const backoff = 400 * 2 ** i;
      console.warn(
        `[early-access] ${label} hit a transient error (${last.error?.statusCode}); retrying in ${backoff}ms`,
      );
      await sleep(backoff);
    }
  }
  return last;
}

// ── Provisioning (cached per warm instance) ──────────────────────────────────

let propertiesReady: Promise<void> | null = null;

async function ensureProperties(resend: Resend): Promise<void> {
  if (propertiesReady) return propertiesReady;

  propertiesReady = (async () => {
    const existing = await withRetry("contactProperties.list", () =>
      resend.contactProperties.list({ limit: 100 }),
    );
    if (existing.error) {
      throw new Error(`Could not list contact properties: ${existing.error.message}`);
    }
    const have = new Set((existing.data?.data ?? []).map((p) => p.key));
    const missing = ALL_PROPERTY_KEYS.filter((k) => !have.has(k));

    // Spaced out to stay under Resend's per-second limit. This only runs until every key
    // exists, so the steady-state cost is the single list call above.
    for (const [index, key] of missing.entries()) {
      if (index > 0) await sleep(THROTTLE_MS);
      const created = await withRetry(`contactProperties.create(${key})`, () =>
        resend.contactProperties.create({ key, type: "string", fallbackValue: null }),
      );
      // A concurrent cold start may have created it first; that is not an error.
      if (created.error && !/exist/i.test(created.error.message)) {
        throw new Error(`Could not create contact property "${key}": ${created.error.message}`);
      }
    }
  })().catch((err) => {
    // Do not cache a failure — the next request should retry provisioning.
    propertiesReady = null;
    throw err;
  });

  return propertiesReady;
}

let segmentIdCache: string | null = null;

async function resolveSegmentId(resend: Resend): Promise<string> {
  if (segmentIdCache) return segmentIdCache;

  const configured = process.env.RESEND_EARLY_ACCESS_SEGMENT_ID;
  if (configured) {
    segmentIdCache = configured;
    return configured;
  }

  // Self-provision by name so deploying does not require creating the segment by hand.
  const list = await withRetry("segments.list", () => resend.segments.list({ limit: 100 }));
  if (list.error) throw new Error(`Could not list segments: ${list.error.message}`);

  const found = (list.data?.data ?? []).find((s) => s.name === SEGMENT_NAME);
  if (found) {
    segmentIdCache = found.id;
    return found.id;
  }

  const created = await withRetry("segments.create", () =>
    resend.segments.create({ name: SEGMENT_NAME }),
  );
  if (created.error || !created.data?.id) {
    throw new Error(`Could not create the "${SEGMENT_NAME}" segment: ${created.error?.message}`);
  }
  segmentIdCache = created.data.id;
  return created.data.id;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Resend stores names in two fields; keep the split reversible for display. */
export function splitName(fullName: string): { firstName: string; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

function joinName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

type RawProperties = Record<
  string,
  { type: "string"; value: string } | { type: "number"; value: number }
>;

function readProperty(properties: RawProperties | undefined, key: string): string {
  const entry = properties?.[key];
  if (!entry) return "";
  return typeof entry.value === "string" ? entry.value : String(entry.value);
}

function toStatus(raw: string): EarlyAccessStatus {
  return (EARLY_ACCESS_STATUSES as readonly string[]).includes(raw)
    ? (raw as EarlyAccessStatus)
    : INITIAL_STATUS;
}

/** `contacts.get` errors when the address is unknown; treat that as "not found". */
async function findContact(resend: Resend, email: string) {
  try {
    const res = await withRetry("contacts.get", () => resend.contacts.get({ email }));
    if (res.error || !res.data) return null;
    return res.data;
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export type RegisterResult = { outcome: "created" | "duplicate" };

export async function registerEarlyAccess(input: {
  fullName: string;
  email: string;
  businessName: string;
  businessType: string;
  businessNeed: string;
}): Promise<RegisterResult> {
  const resend = client();
  await ensureProperties(resend);
  const segmentId = await resolveSegmentId(resend);

  const existing = await findContact(resend, input.email);

  // An existing contact is only a duplicate *registration* if it already carries a
  // PulseAssist status. Someone who merely joined the launch watchlist must still be able
  // to apply.
  if (existing && readProperty(existing.properties as RawProperties, PROPERTY_KEYS.status)) {
    return { outcome: "duplicate" };
  }

  const now = new Date().toISOString();
  const { firstName, lastName } = splitName(input.fullName);
  const properties = {
    [PROPERTY_KEYS.status]: INITIAL_STATUS,
    [PROPERTY_KEYS.businessName]: input.businessName,
    [PROPERTY_KEYS.businessType]: input.businessType,
    [PROPERTY_KEYS.businessNeed]: input.businessNeed,
    [PROPERTY_KEYS.source]: SOURCE,
    [PROPERTY_KEYS.registeredAt]: now,
    [PROPERTY_KEYS.updatedAt]: now,
  };

  if (existing) {
    const updated = await withRetry("contacts.update", () =>
      resend.contacts.update({ email: input.email, firstName, lastName, properties }),
    );
    if (updated.error) {
      throw new Error(`Could not update contact: ${updated.error.message}`);
    }
    const added = await withRetry("contacts.segments.add", () =>
      resend.contacts.segments.add({ email: input.email, segmentId }),
    );
    // Already-a-member is a success for our purposes.
    if (added.error && !/exist|already/i.test(added.error.message)) {
      throw new Error(`Could not add contact to the segment: ${added.error.message}`);
    }
    return { outcome: "created" };
  }

  const created = await withRetry("contacts.create", () =>
    resend.contacts.create({
      email: input.email,
      firstName,
      // `create` accepts `string | undefined` while `update` accepts `string | null`.
      lastName: lastName ?? undefined,
      properties,
      segments: [{ id: segmentId }],
    }),
  );
  if (created.error) {
    throw new Error(`Could not create contact: ${created.error.message}`);
  }
  return { outcome: "created" };
}

/**
 * Lists registrations newest-first.
 *
 * Costs 1 + N requests because properties are not included in the list response. `limit`
 * is capped at the API maximum of 100, and concurrency is bounded so a large list cannot
 * exhaust the function's execution window.
 */
export async function listRegistrations(limit = 100): Promise<{
  registrations: Registration[];
  truncated: boolean;
}> {
  const resend = client();
  const segmentId = await resolveSegmentId(resend);

  const capped = Math.min(Math.max(limit, 1), 100);
  const list = await withRetry("contacts.list", () =>
    resend.contacts.list({ segmentId, limit: capped }),
  );
  if (list.error) throw new Error(`Could not list contacts: ${list.error.message}`);

  const contacts = list.data?.data ?? [];
  const registrations: Registration[] = [];

  // Kept low so a page of reads cannot trip Resend's per-second limit.
  const CONCURRENCY = 3;
  for (let i = 0; i < contacts.length; i += CONCURRENCY) {
    const batch = contacts.slice(i, i + CONCURRENCY);
    const details = await Promise.all(
      batch.map(async (c) => {
        const full = await findContact(resend, c.email);
        const properties = (full?.properties ?? {}) as RawProperties;
        const registeredAt = readProperty(properties, PROPERTY_KEYS.registeredAt);
        return {
          id: c.id,
          email: c.email,
          fullName: joinName(c.first_name, c.last_name) || c.email,
          product: PRODUCT,
          businessName: readProperty(properties, PROPERTY_KEYS.businessName),
          businessType: readProperty(properties, PROPERTY_KEYS.businessType),
          businessNeed: readProperty(properties, PROPERTY_KEYS.businessNeed),
          source: readProperty(properties, PROPERTY_KEYS.source) || SOURCE,
          status: toStatus(readProperty(properties, PROPERTY_KEYS.status)),
          createdAt: registeredAt || c.created_at,
          updatedAt: readProperty(properties, PROPERTY_KEYS.updatedAt) || registeredAt,
        } satisfies Registration;
      }),
    );
    registrations.push(...details);
  }

  registrations.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { registrations, truncated: Boolean(list.data?.has_more) };
}

export type UpdateStatusResult = { outcome: "updated" | "not_found" };

/**
 * Moves one registration to a new status. Only the status and its timestamp are written —
 * the applicant's submitted details are never modified here.
 */
export async function updateRegistrationStatus(
  email: string,
  status: EarlyAccessStatus,
): Promise<UpdateStatusResult> {
  const resend = client();
  await ensureProperties(resend);

  const existing = await findContact(resend, email);
  if (!existing) return { outcome: "not_found" };

  const res = await withRetry("contacts.update(status)", () =>
    resend.contacts.update({
      email,
      properties: {
        [PROPERTY_KEYS.status]: status,
        [PROPERTY_KEYS.updatedAt]: new Date().toISOString(),
      },
    }),
  );
  if (res.error) throw new Error(`Could not update status: ${res.error.message}`);
  return { outcome: "updated" };
}

/** Test seam: clears the per-instance provisioning caches. */
export function __resetCaches(): void {
  propertiesReady = null;
  segmentIdCache = null;
}
