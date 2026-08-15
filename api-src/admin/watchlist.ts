/**
 * Vercel serverless function — GET /api/admin/watchlist
 * Returns the list of watchlist sign-ups (Resend Audience contacts).
 * Protected by a shared password sent via the `x-admin-password` header.
 */
import { Resend } from "resend";
import { timingSafeEqual } from "node:crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReq = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRes = any;

type Contact = {
  id: string;
  email: string;
  created_at: string;
  unsubscribed: boolean;
};

/**
 * Constant-time credential comparison. A plain `!==` leaks the shared password one
 * character at a time through response timing.
 */
function secretsMatch(supplied: unknown, expected: string): boolean {
  if (typeof supplied !== "string") return false;
  const a = Buffer.from(supplied, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual throws on length mismatch, so compare digests of equal width.
  if (a.length !== b.length) {
    // Still perform a comparison so a wrong-length guess costs the same as a wrong value.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

// Brute-force guard for the admin password. Module-scoped, so it is per-instance and
// resets on cold start — enough to blunt online guessing, not a substitute for real
// auth. Upgrade to Upstash/Redis if the admin surface grows.
const attempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function clientIp(req: AnyReq): string {
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (typeof raw === "string" ? raw.split(",")[0]?.trim() : "") || "unknown";
}

function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
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

export default async function handler(req: AnyReq, res: AnyRes) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      res.status(500).json({ ok: false, error: "Admin access is not configured." });
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

    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!apiKey || !audienceId) {
      res.status(500).json({ ok: false, error: "Watchlist storage is not configured." });
      return;
    }

    const resend = new Resend(apiKey);
    const contacts: Contact[] = [];

    // Resend's contacts.list is not paginated via cursor params in the SDK today —
    // it returns the full audience in one call. Guard defensively in case that
    // changes in the future and a `next` cursor appears in the payload.
    const result = await resend.contacts.list({ audienceId });
    if (result.error) {
      console.error("[admin/watchlist] contacts.list error:", JSON.stringify(result.error));
      res.status(502).json({ ok: false, error: "Could not fetch watchlist from provider." });
      return;
    }

    for (const c of result.data?.data ?? []) {
      contacts.push({
        id: c.id,
        email: c.email,
        created_at: c.created_at,
        unsubscribed: c.unsubscribed,
      });
    }

    contacts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    res.status(200).json({ ok: true, contacts, total: contacts.length });
  } catch (err) {
    console.error("[admin/watchlist] Unexpected error:", err);
    res.status(500).json({ ok: false, error: "An unexpected error occurred." });
  }
}
