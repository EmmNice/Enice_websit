/**
 * Shared Resend plumbing for the server handlers.
 *
 * SERVER ONLY — reads `RESEND_API_KEY`. Never import this from a route or component; it is
 * consumed exclusively by the handlers in `api-src/`.
 *
 * Resend is the project's single backend for both transactional email and stored form data.
 * Two flows store contacts — PulseAssist early access and the product-updates list — and both
 * need the same three things: a client, retry-on-rate-limit, and idempotent provisioning of
 * the segment and custom property keys they depend on. That lives here so neither flow
 * reimplements it.
 *
 * ## Constraints this inherits from the Resend API
 *
 * - A custom property key must exist before it can be set on a contact; values for unknown
 *   keys are **silently dropped**. `ensureProperties` provisions them so a forgotten setup
 *   step cannot quietly discard submitted data.
 * - `contacts.list()` omits custom properties — they come back only from `contacts.get()`.
 * - Pagination exposes `limit` (max 100) with no cursor.
 * - Contacts are global per email address, so property keys are namespaced per flow.
 */
import { Resend } from "resend";

export class ResendConfigError extends Error {}

/** Throws `ResendConfigError` when unconfigured so callers can answer 503 rather than 500. */
export function resendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new ResendConfigError("RESEND_API_KEY is not configured.");
  }
  return new Resend(apiKey);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resend's default limit is around 2 requests/second. */
const THROTTLE_MS = 260;

export type ResendResult<T> = {
  data: T | null;
  error: { message: string; statusCode: number | null } | null;
};

function isTransient(error: ResendResult<unknown>["error"]): boolean {
  if (!error) return false;
  const status = error.statusCode ?? 0;
  return status === 429 || status >= 500 || /rate.?limit|too many/i.test(error.message);
}

/**
 * Retries a Resend call on rate limiting and server errors.
 *
 * Provisioning issues several calls in quick succession, which tripped Resend's per-second
 * limit and made the first request after a cold start fail outright — observed in production
 * on the very first live submission. Calls back off and retry instead.
 */
export async function withRetry<T>(
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
        `[resend] ${label} hit a transient error (${last.error?.statusCode}); retrying in ${backoff}ms`,
      );
      await sleep(backoff);
    }
  }
  return last;
}

// ── Contact property provisioning ────────────────────────────────────────────

/** Cached per warm instance, keyed by the set of properties requested. */
const propertyCache = new Map<string, Promise<void>>();

/**
 * Ensures every key exists, creating what is missing. Idempotent and safe to call on every
 * request; the steady-state cost is a single list call.
 */
export async function ensureProperties(resend: Resend, keys: readonly string[]): Promise<void> {
  const cacheKey = [...keys].sort().join(",");
  const cached = propertyCache.get(cacheKey);
  if (cached) return cached;

  const task = (async () => {
    const existing = await withRetry("contactProperties.list", () =>
      resend.contactProperties.list({ limit: 100 }),
    );
    if (existing.error) {
      throw new Error(`Could not list contact properties: ${existing.error.message}`);
    }
    const have = new Set((existing.data?.data ?? []).map((p) => p.key));
    const missing = keys.filter((k) => !have.has(k));

    // Spaced out to stay under Resend's per-second limit.
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
    propertyCache.delete(cacheKey);
    throw err;
  });

  propertyCache.set(cacheKey, task);
  return task;
}

// ── Segment resolution ───────────────────────────────────────────────────────

const segmentCache = new Map<string, string>();

/**
 * Resolves a segment id, preferring an explicit override so a specific existing segment can
 * be pinned. Otherwise the segment is looked up by name and created if absent, so deploying
 * never requires creating it by hand.
 */
export async function resolveSegmentId(
  resend: Resend,
  name: string,
  overrideEnvVar?: string,
): Promise<string> {
  const override = overrideEnvVar ? process.env[overrideEnvVar] : undefined;
  if (override) return override;

  const cached = segmentCache.get(name);
  if (cached) return cached;

  const list = await withRetry("segments.list", () => resend.segments.list({ limit: 100 }));
  if (list.error) throw new Error(`Could not list segments: ${list.error.message}`);

  const found = (list.data?.data ?? []).find((s) => s.name === name);
  if (found) {
    segmentCache.set(name, found.id);
    return found.id;
  }

  const created = await withRetry("segments.create", () => resend.segments.create({ name }));
  if (created.error || !created.data?.id) {
    throw new Error(`Could not create the "${name}" segment: ${created.error?.message}`);
  }
  segmentCache.set(name, created.data.id);
  return created.data.id;
}

// ── Contact helpers ──────────────────────────────────────────────────────────

export type ContactPropertyValue =
  { type: "string"; value: string } | { type: "number"; value: number };

export type RawProperties = Record<string, ContactPropertyValue>;

export function readProperty(properties: RawProperties | undefined, key: string): string {
  const entry = properties?.[key];
  if (!entry) return "";
  return typeof entry.value === "string" ? entry.value : String(entry.value);
}

/** `contacts.get` errors when the address is unknown; treat that as "not found". */
export async function findContact(resend: Resend, email: string) {
  try {
    const res = await withRetry("contacts.get", () => resend.contacts.get({ email }));
    if (res.error || !res.data) return null;
    return res.data;
  } catch {
    return null;
  }
}

/** Resend stores names in two fields; keep the split reversible for display. */
export function splitName(fullName: string): { firstName: string; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

export function joinName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

/** Test seam: clears the per-instance provisioning caches. */
export function __resetResendCaches(): void {
  propertyCache.clear();
  segmentCache.clear();
}
