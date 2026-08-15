/**
 * Product-updates mailing list, backed by Resend.
 *
 * SERVER ONLY — reads `RESEND_API_KEY`. Consumed by `api-src/contact.ts` when a visitor
 * ticks "keep me updated" on either contact form.
 *
 * Subscribers are Resend contacts in a **Product Updates** segment, which is what Resend
 * Broadcasts send to — so announcing something later means composing one broadcast to this
 * segment, with unsubscribes handled by Resend rather than by us.
 *
 * Contacts are global per email address in Resend, so someone who is already an early-access
 * applicant is not duplicated: they gain the segment membership and the `updates_*`
 * properties alongside whatever they already had.
 */
import { SEGMENT_NAME as EARLY_ACCESS_SEGMENT } from "./early-access-store.server";
import {
  ensureProperties,
  findContact,
  readProperty,
  resendClient,
  resolveSegmentId,
  splitName,
  withRetry,
  type RawProperties,
} from "./resend.server";

export const UPDATES_SEGMENT_NAME = "Product Updates";

/** Keys must be alphanumeric + underscore, max 50 characters. */
export const UPDATES_PROPERTY_KEYS = {
  subscribedAt: "updates_subscribed_at",
  source: "updates_source",
} as const;

const ALL_KEYS = Object.values(UPDATES_PROPERTY_KEYS);

export type SubscribeResult =
  /** Newly added to the segment. */
  | { outcome: "subscribed" }
  /** Already subscribed; nothing changed. */
  | { outcome: "already_subscribed" };

/**
 * Adds an address to the product-updates segment.
 *
 * Throws on failure so the caller can decide what to do. `api-src/contact.ts` treats a
 * failure as non-fatal: the visitor's message is delivered regardless, because losing a
 * message would be far worse than losing a list subscription.
 */
export async function subscribeToUpdates(input: {
  email: string;
  name: string;
  source: string;
}): Promise<SubscribeResult> {
  const resend = resendClient();
  await ensureProperties(resend, ALL_KEYS);
  const segmentId = await resolveSegmentId(
    resend,
    UPDATES_SEGMENT_NAME,
    "RESEND_UPDATES_SEGMENT_ID",
  );

  const email = input.email.trim().toLowerCase();
  const existing = await findContact(resend, email);
  const alreadySubscribed = Boolean(
    existing &&
    readProperty(existing.properties as RawProperties, UPDATES_PROPERTY_KEYS.subscribedAt),
  );

  const properties = {
    // Preserve the original opt-in date if there already is one.
    [UPDATES_PROPERTY_KEYS.subscribedAt]: alreadySubscribed
      ? readProperty(existing?.properties as RawProperties, UPDATES_PROPERTY_KEYS.subscribedAt)
      : new Date().toISOString(),
    [UPDATES_PROPERTY_KEYS.source]: input.source,
  };

  const { firstName, lastName } = splitName(input.name);

  if (existing) {
    const updated = await withRetry("contacts.update(updates)", () =>
      resend.contacts.update({
        email,
        // Only fill in a name if Resend does not already hold one.
        firstName: existing.first_name ?? firstName,
        lastName: existing.last_name ?? lastName,
        properties,
      }),
    );
    if (updated.error) throw new Error(`Could not update contact: ${updated.error.message}`);
  } else {
    const created = await withRetry("contacts.create(updates)", () =>
      resend.contacts.create({
        email,
        firstName,
        // `create` accepts `string | undefined` while `update` accepts `string | null`.
        lastName: lastName ?? undefined,
        properties,
        segments: [{ id: segmentId }],
      }),
    );
    if (created.error) throw new Error(`Could not create contact: ${created.error.message}`);
    return { outcome: "subscribed" };
  }

  // An existing contact — which may have arrived via early access — still needs the segment.
  const added = await withRetry("contacts.segments.add(updates)", () =>
    resend.contacts.segments.add({ email, segmentId }),
  );
  if (added.error && !/exist|already/i.test(added.error.message)) {
    throw new Error(`Could not add contact to the segment: ${added.error.message}`);
  }

  return alreadySubscribed ? { outcome: "already_subscribed" } : { outcome: "subscribed" };
}

/**
 * Re-exported so the two segment names are visible together; they are deliberately
 * different lists and a contact may belong to both.
 */
export const RELATED_SEGMENTS = {
  updates: UPDATES_SEGMENT_NAME,
  earlyAccess: EARLY_ACCESS_SEGMENT,
} as const;
