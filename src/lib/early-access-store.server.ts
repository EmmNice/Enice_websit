/**
 * PulseAssist early-access storage, held in the active email provider's audience.
 *
 * SERVER ONLY — never import this from a route or component; it is consumed exclusively by the
 * handlers in `api-src/`.
 *
 * One contact per applicant on a dedicated audience, with the application held in the contact's
 * attributes. Contacts are global per email address with both providers, so attribute keys are
 * namespaced with `pulseassist_` and cannot collide with the product-updates list or anything
 * added later.
 *
 * ## Provider-agnostic by construction
 *
 * This module used to import the Resend SDK and speak in segments and contact properties. It now
 * talks only to the port in `./email` — `upsertContact`, `findContact`, `listAudienceContacts`,
 * `updateContactAttributes` — so the storage moves with `EMAIL_PROVIDER` and this file does not
 * change. The awkward parts that were Resend's (custom-property keys must be provisioned before
 * use or values are silently dropped; listing costs 1 + N requests because properties are omitted
 * from the list response) now live in that adapter, where they belong.
 *
 * The attribute KEYS are deliberately unchanged from the Resend implementation, so a migration of
 * existing applicants is a straight copy with no re-mapping.
 */
import { emailProvider } from "./email/index.server";
import type { AudienceRef } from "./email/types";
import { EARLY_ACCESS_STATUSES, type EarlyAccessStatus } from "./early-access";

export const SEGMENT_NAME = "PulseAssist Early Access";
export const PRODUCT = "PulseAssist";
export const SOURCE = "enice_website";
export const INITIAL_STATUS: EarlyAccessStatus = "EARLY_ACCESS";

/**
 * The audience holding early-access applicants.
 *
 * `idEnvVars` keeps the original `RESEND_EARLY_ACCESS_SEGMENT_ID` working so switching back to
 * Resend still pins the same segment, and adds a PulseAssist equivalent for the new list.
 */
export const EARLY_ACCESS_AUDIENCE: AudienceRef = {
  name: SEGMENT_NAME,
  idEnvVars: {
    resend: "RESEND_EARLY_ACCESS_SEGMENT_ID",
    pulseassist: "PULSEASSIST_EARLY_ACCESS_LIST_ID",
  },
};

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

/** Missing attributes read as "" so a partially-populated contact never renders `undefined`. */
function read(attributes: Record<string, string>, key: string): string {
  return attributes[key] ?? "";
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
  const provider = emailProvider();

  const existing = await provider.findContact(input.email);

  /*
   * An existing contact is only a duplicate REGISTRATION if it already carries a PulseAssist
   * status. A contact that exists for some other reason — the product-updates list, a different
   * product — must still be able to apply, which is why this checks the status attribute rather
   * than the mere existence of the contact.
   */
  if (existing && read(existing.attributes, PROPERTY_KEYS.status)) {
    return { outcome: "duplicate" };
  }

  const now = new Date().toISOString();
  await provider.upsertContact({
    email: input.email,
    name: input.fullName,
    audience: EARLY_ACCESS_AUDIENCE,
    attributes: {
      [PROPERTY_KEYS.status]: INITIAL_STATUS,
      [PROPERTY_KEYS.businessName]: input.businessName,
      [PROPERTY_KEYS.businessType]: input.businessType,
      [PROPERTY_KEYS.businessNeed]: input.businessNeed,
      [PROPERTY_KEYS.source]: SOURCE,
      [PROPERTY_KEYS.registeredAt]: now,
      [PROPERTY_KEYS.updatedAt]: now,
    },
  });

  // "created" covers both a new contact and an existing one that had never applied: from the
  // applicant's point of view the registration is new either way.
  return { outcome: "created" };
}

/**
 * Lists registrations newest-first.
 *
 * `limit` is capped at 100 by the adapters, which is the tighter of the two providers' page
 * sizes. The request cost differs by provider — one call on PulseAssist, 1 + N on Resend — and
 * that is deliberately the adapter's problem, not this module's.
 */
export async function listRegistrations(limit = 100): Promise<{
  registrations: Registration[];
  truncated: boolean;
}> {
  const { contacts, hasMore } = await emailProvider().listAudienceContacts(
    EARLY_ACCESS_AUDIENCE,
    limit,
  );

  const registrations = contacts.map((c) => {
    const registeredAt = read(c.attributes, PROPERTY_KEYS.registeredAt);
    return {
      id: c.id,
      email: c.email,
      fullName: c.name || c.email,
      product: PRODUCT,
      businessName: read(c.attributes, PROPERTY_KEYS.businessName),
      businessType: read(c.attributes, PROPERTY_KEYS.businessType),
      businessNeed: read(c.attributes, PROPERTY_KEYS.businessNeed),
      source: read(c.attributes, PROPERTY_KEYS.source) || SOURCE,
      status: toStatus(read(c.attributes, PROPERTY_KEYS.status)),
      createdAt: registeredAt || c.createdAt,
      updatedAt: read(c.attributes, PROPERTY_KEYS.updatedAt) || registeredAt || c.createdAt,
    } satisfies Registration;
  });

  registrations.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { registrations, truncated: hasMore };
}

export type UpdateStatusResult = { outcome: "updated" | "not_found" };

/**
 * Moves one registration to a new status. Only the status and its timestamp are written — the
 * applicant's submitted details are never modified here, and the adapters merge rather than
 * replace the attribute map so nothing else is lost.
 */
export async function updateRegistrationStatus(
  email: string,
  status: EarlyAccessStatus,
): Promise<UpdateStatusResult> {
  const updated = await emailProvider().updateContactAttributes(email, {
    [PROPERTY_KEYS.status]: status,
    [PROPERTY_KEYS.updatedAt]: new Date().toISOString(),
  });
  return { outcome: updated ? "updated" : "not_found" };
}
