/**
 * Single source of truth for the ENICE Group launch date.
 * July 18, 2026 at 00:00:00 UTC (midnight, 14 days from July 4 2026).
 *
 * This module ships to BOTH client and server — no secrets here.
 * The time-gate logic in index.tsx and ComingSoon.tsx reads this constant.
 */

export const LAUNCH_DATE = new Date("2026-07-18T00:00:00.000Z");

/** Returns true if we are currently in pre-launch mode. */
export function isPreLaunch(): boolean {
  return new Date() < LAUNCH_DATE;
}

/** ISO strings for Resend scheduledAt — server safe (no side-effects). */
export const LAUNCH_EMAILS = {
  /** 3 days before launch: July 15 2026 09:00 UTC */
  threeDayReminder: "2026-07-15T09:00:00.000Z",
  /** 1 day before launch: July 17 2026 09:00 UTC */
  oneDayReminder: "2026-07-17T09:00:00.000Z",
  /** Exact launch moment: July 18 2026 00:00 UTC */
  launchMoment: "2026-07-18T00:00:00.000Z",
} as const;
