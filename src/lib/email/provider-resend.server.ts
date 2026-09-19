/**
 * The Resend provider, kept behind the port so the site can switch back.
 *
 * SERVER ONLY. Reads `RESEND_API_KEY`.
 *
 * ENICE has moved to PulseAssist Email, so this is no longer the default. It is retained rather
 * than deleted for two reasons: a provider you cannot switch back to is not really switchable,
 * and the existing Resend audience data is still reachable through it while anything is migrated.
 * `EMAIL_PROVIDER=resend` restores the previous behaviour exactly.
 *
 * ## The two Resend constraints this adapter absorbs
 *
 * - A custom property key must EXIST before a value can be set on a contact; values for unknown
 *   keys are silently dropped. `ensureProperties` provisions them so a forgotten setup step
 *   cannot quietly discard a visitor's submission. (PulseAssist has no equivalent hazard —
 *   attributes are free-form there — which is why this lives in the adapter, not the port.)
 * - `contacts.list()` omits custom properties; they come back only from `contacts.get()`. So
 *   listing an audience costs 1 + N requests, and the concurrency is bounded to stay under the
 *   roughly 2 requests/second limit.
 */
import { Resend } from "resend";
import {
  type AudienceContact,
  type AudienceRef,
  type EmailProvider,
  type ListContactsResult,
  type OutboundEmail,
  type SendResult,
  type UpsertContactInput,
  type UpsertContactResult,
  EmailProviderConfigError,
  EmailSendError,
  formatAddress,
  joinName,
  sleep,
  splitName,
  toRecipientArray,
  withRetry,
} from "./types";

/** Resend's default limit is around 2 requests/second. */
const THROTTLE_MS = 260;

type ResendResult<T> = {
  data: T | null;
  error: { message: string; statusCode?: number | null } | null;
};

function client(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new EmailProviderConfigError("RESEND_API_KEY is not configured.");
  return new Resend(apiKey);
}

function isTransient(error: ResendResult<unknown>["error"]): boolean {
  if (!error) return false;
  const status = error.statusCode ?? 0;
  return status === 429 || status >= 500 || /rate.?limit|too many/i.test(error.message);
}

/** Adapts the port's retry helper to Resend's `{ data, error }` shape. */
function retry<T>(label: string, call: () => Promise<ResendResult<T>>) {
  return withRetry(label, call, (r) => isTransient(r.error));
}

// ── Property provisioning (Resend-specific) ───────────────────────────────────

const propertyCache = new Map<string, Promise<void>>();

async function ensureProperties(resend: Resend, keys: readonly string[]): Promise<void> {
  if (keys.length === 0) return;
  const cacheKey = [...keys].sort().join(",");
  const cached = propertyCache.get(cacheKey);
  if (cached) return cached;

  const task = (async () => {
    const existing = await retry(
      "contactProperties.list",
      () =>
        resend.contactProperties.list({ limit: 100 }) as Promise<
          ResendResult<{ data: { key: string }[] }>
        >,
    );
    if (existing.error)
      throw new Error(`Could not list contact properties: ${existing.error.message}`);
    const have = new Set((existing.data?.data ?? []).map((p) => p.key));
    const missing = keys.filter((k) => !have.has(k));

    for (const [index, key] of missing.entries()) {
      if (index > 0) await sleep(THROTTLE_MS);
      const created = await retry(
        `contactProperties.create(${key})`,
        () =>
          resend.contactProperties.create({ key, type: "string", fallbackValue: null }) as Promise<
            ResendResult<unknown>
          >,
      );
      // A concurrent cold start may have created it first; that is not an error.
      if (created.error && !/exist/i.test(created.error.message)) {
        throw new Error(`Could not create contact property "${key}": ${created.error.message}`);
      }
    }
  })().catch((err) => {
    // Never cache a failure — the next request must retry provisioning.
    propertyCache.delete(cacheKey);
    throw err;
  });

  propertyCache.set(cacheKey, task);
  return task;
}

// ── Audience (segment) resolution ─────────────────────────────────────────────

const segmentCache = new Map<string, string>();

async function resolveSegmentId(resend: Resend, audience: AudienceRef): Promise<string> {
  const pinEnvVar = audience.idEnvVars?.resend;
  const pinned = pinEnvVar ? process.env[pinEnvVar]?.trim() : undefined;
  if (pinned) return pinned;

  const cached = segmentCache.get(audience.name);
  if (cached) return cached;

  const list = await retry(
    "segments.list",
    () =>
      resend.segments.list({ limit: 100 }) as Promise<
        ResendResult<{ data: { id: string; name: string }[] }>
      >,
  );
  if (list.error) throw new Error(`Could not list segments: ${list.error.message}`);

  const found = (list.data?.data ?? []).find((s) => s.name === audience.name);
  if (found) {
    segmentCache.set(audience.name, found.id);
    return found.id;
  }

  const created = await retry(
    "segments.create",
    () => resend.segments.create({ name: audience.name }) as Promise<ResendResult<{ id: string }>>,
  );
  if (created.error || !created.data?.id) {
    throw new Error(`Could not create the "${audience.name}" segment: ${created.error?.message}`);
  }
  segmentCache.set(audience.name, created.data.id);
  return created.data.id;
}

// ── Contact helpers ──────────────────────────────────────────────────────────

type RawProperties = Record<string, { type: "string" | "number"; value: string | number }>;

function readProperties(raw: RawProperties | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(raw ?? {})) {
    if (!entry) continue;
    out[key] = typeof entry.value === "string" ? entry.value : String(entry.value);
  }
  return out;
}

type ResendContact = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  properties?: RawProperties;
};

/** `contacts.get` errors when the address is unknown; treat that as "not found". */
async function getContact(resend: Resend, email: string): Promise<ResendContact | null> {
  try {
    const res = await retry(
      "contacts.get",
      () => resend.contacts.get({ email }) as Promise<ResendResult<ResendContact>>,
    );
    if (res.error || !res.data) return null;
    return res.data;
  } catch {
    return null;
  }
}

function toAudienceContact(c: ResendContact): AudienceContact {
  return {
    id: c.id,
    email: c.email,
    name: joinName(c.first_name, c.last_name) || c.email,
    attributes: readProperties(c.properties),
    createdAt: c.created_at,
  };
}

// ── The provider ─────────────────────────────────────────────────────────────

export const resendProvider: EmailProvider = {
  name: "resend",

  async send(message: OutboundEmail): Promise<SendResult> {
    const resend = client();
    // Resend takes a fully-formed address, which is what `formatAddress` is for.
    const res = await retry(
      "emails.send",
      () =>
        resend.emails.send({
          from: formatAddress(message.from),
          to: toRecipientArray(message.to),
          ...(message.replyTo ? { replyTo: message.replyTo } : {}),
          subject: message.subject,
          html: message.html,
          ...(message.text ? { text: message.text } : {}),
        }) as Promise<ResendResult<{ id: string }>>,
    );
    if (res.error) {
      throw new EmailSendError(res.error.message, res.error.statusCode ?? null, "resend");
    }
    return { id: res.data?.id ?? null, provider: "resend" };
  },

  async findContact(email: string): Promise<AudienceContact | null> {
    const contact = await getContact(client(), email);
    return contact ? toAudienceContact(contact) : null;
  },

  async upsertContact(input: UpsertContactInput): Promise<UpsertContactResult> {
    const resend = client();
    const keys = Object.keys(input.attributes);
    await ensureProperties(resend, keys);
    const segmentId = await resolveSegmentId(resend, input.audience);

    const email = input.email.trim().toLowerCase();
    const existing = await getContact(resend, email);
    const { firstName, lastName } = splitName(input.name);

    if (existing) {
      const updated = await retry(
        "contacts.update",
        () =>
          resend.contacts.update({
            email,
            // Only fill in a name if Resend does not already hold one.
            firstName: existing.first_name ?? firstName,
            lastName: existing.last_name ?? lastName,
            properties: input.attributes,
          }) as Promise<ResendResult<unknown>>,
      );
      if (updated.error) throw new Error(`Could not update contact: ${updated.error.message}`);

      const added = await retry(
        "contacts.segments.add",
        () => resend.contacts.segments.add({ email, segmentId }) as Promise<ResendResult<unknown>>,
      );
      // Already-a-member is a success for our purposes.
      if (added.error && !/exist|already/i.test(added.error.message)) {
        throw new Error(`Could not add contact to the segment: ${added.error.message}`);
      }
      return { outcome: "updated" };
    }

    const created = await retry(
      "contacts.create",
      () =>
        resend.contacts.create({
          email,
          firstName,
          // `create` accepts `string | undefined` while `update` accepts `string | null`.
          lastName: lastName ?? undefined,
          properties: input.attributes,
          segments: [{ id: segmentId }],
        }) as Promise<ResendResult<unknown>>,
    );
    if (created.error) throw new Error(`Could not create contact: ${created.error.message}`);
    return { outcome: "created" };
  },

  async updateContactAttributes(
    email: string,
    attributes: Record<string, string>,
  ): Promise<boolean> {
    const resend = client();
    await ensureProperties(resend, Object.keys(attributes));
    const existing = await getContact(resend, email);
    if (!existing) return false;
    const res = await retry(
      "contacts.update(attributes)",
      () =>
        resend.contacts.update({ email, properties: attributes }) as Promise<ResendResult<unknown>>,
    );
    if (res.error) throw new Error(`Could not update status: ${res.error.message}`);
    return true;
  },

  async listAudienceContacts(audience: AudienceRef, limit: number): Promise<ListContactsResult> {
    const resend = client();
    const segmentId = await resolveSegmentId(resend, audience);
    const capped = Math.min(Math.max(limit, 1), 100);

    const list = await retry(
      "contacts.list",
      () =>
        resend.contacts.list({ segmentId, limit: capped }) as Promise<
          ResendResult<{ data: ResendContact[]; has_more?: boolean }>
        >,
    );
    if (list.error) throw new Error(`Could not list contacts: ${list.error.message}`);

    const rows = list.data?.data ?? [];
    const contacts: AudienceContact[] = [];

    /*
     * 1 + N, because the list response omits custom properties. Concurrency is kept low so a
     * page of reads cannot trip the per-second limit. The PulseAssist adapter needs none of this.
     */
    const CONCURRENCY = 3;
    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const batch = rows.slice(i, i + CONCURRENCY);
      const details = await Promise.all(
        batch.map(async (row) => {
          const full = await getContact(resend, row.email);
          return toAudienceContact(full ?? row);
        }),
      );
      contacts.push(...details);
    }

    return { contacts, hasMore: Boolean(list.data?.has_more) };
  },
};

/** Test seam: clears the per-instance provisioning caches. */
export function __resetResendCaches(): void {
  propertyCache.clear();
  segmentCache.clear();
}
