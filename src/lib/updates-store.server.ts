/**
 * Product-updates mailing list, held in the active email provider's audience.
 *
 * SERVER ONLY. Consumed by `api-src/contact.ts` when a visitor ticks "keep me updated" on either
 * contact form.
 *
 * Subscribers sit on a **Product Updates** audience, which is what a broadcast/campaign is later
 * addressed to — so announcing something means composing one campaign to this audience, with
 * unsubscribes handled by the provider rather than by us.
 *
 * Contacts are global per email address with both providers, so someone who is already an
 * early-access applicant is not duplicated: they gain the audience membership and the `updates_*`
 * attributes alongside whatever they already had. The port's `upsertContact` merges attributes
 * rather than replacing them, which is what makes that safe.
 */
import { emailProvider } from "./email/index.server";
import type { AudienceRef } from "./email/types";
import { SEGMENT_NAME as EARLY_ACCESS_SEGMENT } from "./early-access-store.server";

export const UPDATES_SEGMENT_NAME = "Product Updates";

/**
 * The audience holding product-updates subscribers.
 *
 * As with early access, the original `RESEND_UPDATES_SEGMENT_ID` still pins the Resend segment so
 * switching back is lossless, with a PulseAssist equivalent alongside it.
 */
export const UPDATES_AUDIENCE: AudienceRef = {
  name: UPDATES_SEGMENT_NAME,
  idEnvVars: {
    resend: "RESEND_UPDATES_SEGMENT_ID",
    pulseassist: "PULSEASSIST_UPDATES_LIST_ID",
  },
};

/** Keys must be alphanumeric + underscore, max 50 characters. */
export const UPDATES_PROPERTY_KEYS = {
  subscribedAt: "updates_subscribed_at",
  source: "updates_source",
} as const;

export type SubscribeResult =
  /** Newly added to the audience. */
  | { outcome: "subscribed" }
  /** Already subscribed; nothing changed. */
  | { outcome: "already_subscribed" };

/**
 * Adds an address to the product-updates audience.
 *
 * Throws on failure so the caller can decide what to do. `api-src/contact.ts` treats a failure as
 * non-fatal: the visitor's message is delivered regardless, because losing a message would be far
 * worse than losing a list subscription.
 */
export async function subscribeToUpdates(input: {
  email: string;
  name: string;
  source: string;
}): Promise<SubscribeResult> {
  const provider = emailProvider();
  const email = input.email.trim().toLowerCase();

  const existing = await provider.findContact(email);
  const existingSubscribedAt = existing?.attributes[UPDATES_PROPERTY_KEYS.subscribedAt] ?? "";
  const alreadySubscribed = Boolean(existingSubscribedAt);

  await provider.upsertContact({
    email,
    // Only supplies a name; the adapters keep the provider's existing one if it has one.
    name: input.name,
    audience: UPDATES_AUDIENCE,
    attributes: {
      // The original opt-in date is preserved — re-ticking the box must not reset the record of
      // when consent was actually given.
      [UPDATES_PROPERTY_KEYS.subscribedAt]: alreadySubscribed
        ? existingSubscribedAt
        : new Date().toISOString(),
      [UPDATES_PROPERTY_KEYS.source]: input.source,
    },
  });

  return alreadySubscribed ? { outcome: "already_subscribed" } : { outcome: "subscribed" };
}

/**
 * Re-exported so the two audience names are visible together; they are deliberately different
 * lists and a contact may belong to both.
 */
export const RELATED_SEGMENTS = {
  updates: UPDATES_SEGMENT_NAME,
  earlyAccess: EARLY_ACCESS_SEGMENT,
} as const;
