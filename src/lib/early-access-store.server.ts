/**
 * PulseAssist early-access storage, backed by Resend.
 *
 * SERVER ONLY — reads `RESEND_API_KEY`. Never import this from a route or component; it is
 * consumed exclusively by the handlers in `api-src/`.
 *
 * One Resend contact per applicant, added to a dedicated segment, with the application held
 * in custom Contact Properties. Contacts are global per email address, so property keys are
 * namespaced with `pulseassist_` and cannot collide with the product-updates list or
 * anything added later.
 *
 * The client, retry and provisioning helpers live in `resend.server.ts`, shared with the
 * updates list. See that module for the API constraints this design works around.
 */
import {
  ensureProperties,
  findContact,
  joinName,
  readProperty,
  resendClient,
  resolveSegmentId,
  splitName,
  withRetry,
  type RawProperties,
} from "./resend.server";
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

function toStatus(raw: string): EarlyAccessStatus {
  return (EARLY_ACCESS_STATUSES as readonly string[]).includes(raw)
    ? (raw as EarlyAccessStatus)
    : INITIAL_STATUS;
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
  const resend = resendClient();
  await ensureProperties(resend, ALL_PROPERTY_KEYS);
  const segmentId = await resolveSegmentId(resend, SEGMENT_NAME, "RESEND_EARLY_ACCESS_SEGMENT_ID");

  const existing = await findContact(resend, input.email);

  // An existing contact is only a duplicate *registration* if it already carries a
  // PulseAssist status. A contact that already exists for some other reason — an earlier
  // mailing list, a different product — must still be able to apply.
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
  const resend = resendClient();
  const segmentId = await resolveSegmentId(resend, SEGMENT_NAME, "RESEND_EARLY_ACCESS_SEGMENT_ID");

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
  const resend = resendClient();
  await ensureProperties(resend, ALL_PROPERTY_KEYS);

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
