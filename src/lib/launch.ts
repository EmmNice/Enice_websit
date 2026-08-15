/**
 * Single source of truth for the ENICE Group launch date.
 *
 * This module ships to BOTH client and server — no secrets here.
 * The time-gate logic in index.tsx and ComingSoon.tsx reads `isPreLaunch()`.
 */

export const LAUNCH_DATE = new Date("2026-07-18T00:00:00.000Z");

/** Returns true if we are currently in pre-launch mode. */
export function isPreLaunch(): boolean {
  return new Date() < LAUNCH_DATE;
}

/** ISO strings for Resend `scheduledAt` — server safe (no side-effects). */
export const LAUNCH_EMAILS = {
  /** 3 days before launch. */
  threeDayReminder: "2026-07-15T09:00:00.000Z",
  /** 1 day before launch. */
  oneDayReminder: "2026-07-17T09:00:00.000Z",
  /** Exact launch moment. */
  launchMoment: "2026-07-18T00:00:00.000Z",
} as const;

/**
 * Resend rejects a `scheduledAt` that is in the past, which previously caused every
 * post-launch watchlist signup to log three scheduling failures. Callers use this to
 * skip reminders whose send window has already closed.
 */
export function isFutureSchedule(iso: string, now: Date = new Date()): boolean {
  const at = new Date(iso).getTime();
  return Number.isFinite(at) && at > now.getTime();
}
