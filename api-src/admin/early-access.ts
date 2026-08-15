/**
 * Vercel serverless function — /api/admin/early-access
 *   GET  -> list PulseAssist early-access registrations
 *   POST -> move one registration to a new status  { email, status }
 *
 * Authorized by the ADMIN_PASSWORD secret in the `x-admin-password` header.
 *
 * CSRF: the credential is a custom request header, not a cookie. A cross-site form cannot
 * set custom headers, and a fetch that tries triggers a preflight — so there is no ambient
 * authority for an attacker to ride on.
 */
import { timingSafeEqual } from "node:crypto";
import { EARLY_ACCESS_STATUSES, type EarlyAccessStatus } from "../../src/lib/early-access";
import {
  EarlyAccessConfigError,
  listRegistrations,
  updateRegistrationStatus,
} from "../../src/lib/early-access-store.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReq = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRes = any;

/**
 * Constant-time credential comparison. A plain `!==` leaks the shared password one
 * character at a time through response timing.
 */
function secretsMatch(supplied: unknown, expected: string): boolean {
  if (typeof supplied !== "string") return false;
  const a = Buffer.from(supplied, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    // Still perform a comparison so a wrong-length guess costs the same as a wrong value.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

// Brute-force guard. Module-scoped, so per-instance and reset on cold start.
const attempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function clientIp(req: AnyReq): string {
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (typeof raw === "string" ? raw.split(",")[0]?.trim() : "") || "unknown";
}

function tooManyAttempts(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry || Date.now() > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return;
  }
  entry.count++;
}

function parseBody(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

export default async function handler(req: AnyReq, res: AnyRes) {
  const ref = `AD${Date.now().toString(36).toUpperCase()}`;

  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("[api/admin/early-access] ADMIN_PASSWORD is not set.");
      res.status(500).json({
        ok: false,
        error: "Admin access is not configured. The ADMIN_PASSWORD variable is missing.",
      });
      return;
    }

    const ip = clientIp(req);
    if (tooManyAttempts(ip)) {
      res.status(429).json({ ok: false, error: "Too many attempts. Try again later." });
      return;
    }

    if (!secretsMatch(req.headers["x-admin-password"], adminPassword)) {
      recordFailure(ip);
      res.status(401).json({ ok: false, error: "Invalid password." });
      return;
    }

    if (req.method === "GET") {
      const { registrations, truncated } = await listRegistrations(100);
      res.status(200).json({
        ok: true,
        registrations,
        total: registrations.length,
        // Resend's contacts API exposes `limit` only (max 100) with no cursor, so a larger
        // list cannot be paged through here. Surfaced so the UI can say so plainly.
        truncated,
      });
      return;
    }

    if (req.method === "POST") {
      const body = parseBody(req.body);
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const status = typeof body.status === "string" ? body.status : "";

      if (!email) {
        res.status(400).json({ ok: false, error: "A registration email is required." });
        return;
      }
      if (!(EARLY_ACCESS_STATUSES as readonly string[]).includes(status)) {
        res.status(400).json({
          ok: false,
          error: `Invalid status. Expected one of: ${EARLY_ACCESS_STATUSES.join(", ")}.`,
        });
        return;
      }

      // Only the status is written; the applicant's submitted details are immutable here.
      const result = await updateRegistrationStatus(email, status as EarlyAccessStatus);
      if (result.outcome === "not_found") {
        res.status(404).json({ ok: false, error: "Registration not found." });
        return;
      }
      res.status(200).json({ ok: true, email, status });
      return;
    }

    res.status(405).json({ ok: false, error: "Method not allowed." });
  } catch (err) {
    if (err instanceof EarlyAccessConfigError) {
      console.error(`[api/admin/early-access:${ref}] not configured:`, err.message);
      res.status(503).json({ ok: false, error: "Storage is not configured.", ref });
      return;
    }
    console.error(`[api/admin/early-access:${ref}]`, err);
    res.status(500).json({ ok: false, error: "An unexpected error occurred.", ref });
  }
}
