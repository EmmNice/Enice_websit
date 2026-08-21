/**
 * Single source of truth for the PulseAssist Beta launch announcement, and for anything else
 * tied to the same launch window — currently the PulseAssist "Get Early Access" CTA, which
 * retires the moment the announcement does.
 *
 * The cutoff is enforced here, in code, and re-evaluated against the visitor's clock on every
 * render. There is deliberately no localStorage/cookie "already seen" flag: the announcement is
 * expected to reappear on every fresh page load for as long as this window is active, and the
 * *only* thing that permanently stops it from appearing again is the expiry date below. A
 * visitor who dismissed it a minute ago will see it again the next time they load the site,
 * right up until the deadline.
 *
 * To retire the announcement (and the linked CTA) immediately, for any reason: flip
 * `BETA_ANNOUNCEMENT_ENABLED` to `false`. To change the cutoff, edit `BETA_ANNOUNCEMENT_EXPIRY`.
 * Both take effect on next load — no visitor-side data needs to change.
 */

/** Manual kill switch, independent of the date below. */
export const BETA_ANNOUNCEMENT_ENABLED = true;

/**
 * The announcement — and the PulseAssist early-access CTA — must never appear from this instant
 * onward. Read as "September 13, 2026, 00:00, in the visitor's local time": the announcement is
 * visible through the end of September 12, 2026, and gone as soon as a visitor's own clock
 * rolls into September 13.
 *
 * `Date` month is 0-indexed, so 8 is September.
 */
export const BETA_ANNOUNCEMENT_EXPIRY = new Date(2026, 8, 13, 0, 0, 0);

/** True once the reference clock has reached or passed the cutoff above. */
export function isPastBetaAnnouncementExpiry(reference: Date = new Date()): boolean {
  return reference.getTime() >= BETA_ANNOUNCEMENT_EXPIRY.getTime();
}

/** Whether the beta announcement modal is allowed to appear right now. */
export function isBetaAnnouncementActive(): boolean {
  return BETA_ANNOUNCEMENT_ENABLED && !isPastBetaAnnouncementExpiry();
}

/**
 * The PulseAssist "Get Early Access" CTA is part of the same beta launch window: once the
 * announcement retires, the early-access request flow retires with it. Kept as its own function
 * (rather than a direct alias) so the two can be pointed at different conditions later without
 * touching every call site.
 */
export function isPulseAssistEarlyAccessActive(): boolean {
  return isBetaAnnouncementActive();
}
