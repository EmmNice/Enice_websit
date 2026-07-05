/**
 * Vercel serverless function — POST /api/watchlist
 * Validates the submitted email and dispatches 4 Resend emails:
 *   1. Immediate confirmation
 *   2. 3-day reminder (scheduled)
 *   3. 1-day reminder (scheduled)
 *   4. Launch moment (scheduled)
 */
import { Resend } from "resend";
import { withErrorHandling } from "./lib/handler";

const FROM = "ENICE Group <noreply@enicehq.com>";
const LAUNCH = {
  threeDayReminder: "2026-07-15T09:00:00.000Z",
  oneDayReminder: "2026-07-17T09:00:00.000Z",
  launchMoment: "2026-07-18T00:00:00.000Z",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter (3 requests / 10 min per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 600_000 });
    return false;
  }
  if (entry.count >= 3) return true;
  entry.count++;
  return false;
}

/**
 * Checks all pages of a Resend Audience for a given email address.
 * Returns true  → email already exists (duplicate)
 * Returns false → email not found (new subscriber)
 * Returns null  → check failed (API error); caller should fail closed
 *
 * Uses the Resend REST API directly so we control pagination fully.
 * The SDK's contacts.list() does not expose page/cursor params.
 */
async function isEmailInAudience(
  apiKey: string,
  audienceId: string,
  email: string
): Promise<boolean | null> {
  const BASE = "https://api.resend.com";
  let page = 1;
  const PAGE_SIZE = 100; // Resend default max per page

  try {
    while (true) {
      const url = `${BASE}/audiences/${audienceId}/contacts?page=${page}&per_page=${PAGE_SIZE}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        console.error(
          `[watchlist] Audience contacts fetch failed: ${response.status} ${response.statusText}`
        );
        return null; // fail closed
      }

      const json = (await response.json()) as {
        data: Array<{ email: string }>;
      };

      const contacts: Array<{ email: string }> = json.data ?? [];

      if (contacts.some((c) => c.email.toLowerCase() === email)) {
        return true; // found duplicate
      }

      // If we got fewer results than the page size, we've seen everything
      if (contacts.length < PAGE_SIZE) {
        return false;
      }

      page++;
    }
  } catch (err) {
    console.error("[watchlist] Exception while checking audience:", err);
    return null; // fail closed
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

function confirmationHtml(email: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>You're on the Watchlist</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 24px;"><tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
      <tr><td style="background:#0f172a;padding:32px 48px;border-bottom:1px solid #1e293b;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;font-weight:600;">ENICE GROUP · CLASSIFIED DISPATCH</p>
        <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;letter-spacing:-0.03em;color:#f8fafc;line-height:1.2;">You're on the<br><span style="color:#3b82f6;">Watchlist.</span></h1>
      </td></tr>
      <tr><td style="padding:40px 48px;">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">We received your request. Your position is confirmed.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">On <strong style="color:#f8fafc;">July 18, 2026</strong>, ENICE Group launches its full platform — a venture-grade technology ecosystem built for the next era of global commerce. You will be the first to know the moment we go live.</p>
        <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a1a1aa;">We are engineering in silence. When the curtain lifts, it will be permanent.</p>
        <table cellpadding="0" cellspacing="0" style="border:1px solid #27272a;border-radius:8px;overflow:hidden;width:100%;"><tr>
          <td style="padding:16px 24px;border-right:1px solid #27272a;text-align:center;"><p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#52525b;">Ventures</p><p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#f8fafc;">4</p></td>
          <td style="padding:16px 24px;border-right:1px solid #27272a;text-align:center;"><p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#52525b;">Verticals</p><p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#f8fafc;">3</p></td>
          <td style="padding:16px 24px;text-align:center;"><p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#52525b;">Uptime SLA</p><p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#3b82f6;">99.99%</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #27272a;background:#0c0c0e;">
        <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">Sent to <span style="color:#71717a;">${email}</span> · ENICE Group · Abuja &amp; Kaduna, Nigeria · <a href="https://enicehq.com" style="color:#3b82f6;text-decoration:none;">enicehq.com</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function threeDayHtml(email: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>3 Days Until We Engineer the Future</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 24px;"><tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
      <tr><td style="background:#0f172a;padding:32px 48px;border-bottom:1px solid #1e293b;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;font-weight:600;">T-MINUS 72 HOURS</p>
        <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;letter-spacing:-0.03em;color:#f8fafc;line-height:1.2;">3 Days Until We<br><span style="color:#3b82f6;">Engineer the Future.</span></h1>
      </td></tr>
      <tr><td style="padding:40px 48px;">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">The countdown is inside the single digits now. In exactly <strong style="color:#f8fafc;">72 hours</strong>, ENICE Group opens its platform to the world.</p>
        <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a1a1aa;">You are among a select group receiving early access — PulsePay, PulseAssist, EPulse, and PulseX. Four platforms. Three verticals. One institutional-grade infrastructure stack.</p>
        <div style="background:#1e3a5f;border:1px solid #2563eb;border-radius:8px;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:40px;font-weight:800;color:#3b82f6;letter-spacing:-0.04em;">72:00:00</p>
          <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">Hours · Minutes · Seconds</p>
        </div>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #27272a;background:#0c0c0e;">
        <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">Sent to <span style="color:#71717a;">${email}</span> · ENICE Group · <a href="https://enicehq.com" style="color:#3b82f6;text-decoration:none;">enicehq.com</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function oneDayHtml(email: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Tomorrow, Everything Changes</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 24px;"><tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
      <tr><td style="background:#0f172a;padding:32px 48px;border-bottom:1px solid #1e293b;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;font-weight:600;">T-MINUS 24 HOURS</p>
        <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;letter-spacing:-0.03em;color:#f8fafc;line-height:1.2;">Tomorrow,<br><span style="color:#3b82f6;">Everything Changes.</span></h1>
      </td></tr>
      <tr><td style="padding:40px 48px;">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">This is the final reminder. Tomorrow at midnight, the ENICE Group platform goes fully live.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">When the curtain lifts at <strong style="color:#f8fafc;">12:00 AM on July 18, 2026</strong>, expect one final notification — the most important one we will ever send you.</p>
        <div style="background:#18181b;border-left:3px solid #3b82f6;border-radius:4px;padding:20px 24px;">
          <p style="margin:0;font-size:13px;line-height:1.7;color:#a1a1aa;font-style:italic;">"Infrastructure is the most powerful form of leverage. It does not ask for attention — it just works, silently, at scale."</p>
          <p style="margin:10px 0 0;font-size:12px;color:#52525b;">— ENICE Group, Founding Principle</p>
        </div>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #27272a;background:#0c0c0e;">
        <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">Sent to <span style="color:#71717a;">${email}</span> · ENICE Group · <a href="https://enicehq.com" style="color:#3b82f6;text-decoration:none;">enicehq.com</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function launchHtml(email: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>We Are LIVE</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 24px;"><tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:48px 48px 40px;border-bottom:1px solid #1e293b;text-align:center;">
        <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#3b82f6;font-weight:700;">ENICE GROUP · LAUNCH DAY</p>
        <h1 style="margin:0;font-size:36px;font-weight:800;letter-spacing:-0.04em;color:#f8fafc;line-height:1.15;">We Are<br><span style="color:#3b82f6;">LIVE.</span></h1>
        <p style="margin:16px 0 0;font-size:14px;color:#64748b;letter-spacing:0.08em;">JULY 18, 2026 · 12:00 AM UTC</p>
      </td></tr>
      <tr><td style="padding:40px 48px;">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">The countdown is over. The ENICE Group platform is officially live.</p>
        <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a1a1aa;">You are among the first people on earth to receive this message. As a watchlist member, you have priority access to the full venture ecosystem.</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 32px;"><tr><td align="center">
          <a href="https://enicehq.com" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:8px;">Enter the Platform →</a>
        </td></tr></table>
        <table cellpadding="0" cellspacing="0" style="border:1px solid #27272a;border-radius:8px;overflow:hidden;width:100%;">
          <tr style="border-bottom:1px solid #27272a;">
            <td style="padding:14px 20px;border-right:1px solid #27272a;"><p style="margin:0;font-size:12px;font-weight:700;color:#f8fafc;">PulsePay</p><p style="margin:3px 0 0;font-size:11px;color:#52525b;">Virtual Cards &amp; Payment Rails</p></td>
            <td style="padding:14px 20px;"><p style="margin:0;font-size:12px;font-weight:700;color:#f8fafc;">PulseAssist</p><p style="margin:3px 0 0;font-size:11px;color:#52525b;">Enterprise AI Engine</p></td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-right:1px solid #27272a;"><p style="margin:0;font-size:12px;font-weight:700;color:#f8fafc;">EPulse</p><p style="margin:3px 0 0;font-size:11px;color:#52525b;">Digital Banking Infrastructure</p></td>
            <td style="padding:14px 20px;"><p style="margin:0;font-size:12px;font-weight:700;color:#f8fafc;">PulseX</p><p style="margin:3px 0 0;font-size:11px;color:#52525b;">Global Crypto Trading Exchange</p></td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #27272a;background:#0c0c0e;">
        <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">Sent to <span style="color:#71717a;">${email}</span> · ENICE Group · <a href="https://enicehq.com" style="color:#3b82f6;text-decoration:none;">enicehq.com</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withErrorHandling(async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    "unknown";
  if (isRateLimited(ip)) {
    res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
    return;
  }

  let body: { email?: unknown };
  try {
    // body-parser may already have parsed it (Vercel injects it)
    body = typeof req.body === "object" && req.body !== null ? req.body : JSON.parse(req.body ?? "{}");
  } catch {
    res.status(400).json({ ok: false, error: "Invalid request body." });
    return;
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email) || email.length > 320) {
    res.status(400).json({ ok: false, error: "Please enter a valid email address." });
    return;
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[watchlist] RESEND_API_KEY is not configured");
      res.status(500).json({ ok: false, error: "We could not process your request. Please try again shortly." });
      return;
    }

    const resend = new Resend(apiKey);

    // Step 1: Duplicate check via Resend Contacts (all pages).
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      const isDuplicate = await isEmailInAudience(apiKey, audienceId, email);
      if (isDuplicate === null) {
        // Could not verify — fail closed rather than risk a duplicate send
        res.status(500).json({ ok: false, error: "We could not verify your subscription status. Please try again." });
        return;
      }
      if (isDuplicate) {
        res.status(409).json({ ok: false, code: "DUPLICATE" });
        return;
      }
    }

    // Step 2: Send the required confirmation email first.
    // Resend v6 SDK returns { data, error } — it does NOT throw on API errors.
    let confirmation: { data: unknown; error: { message: string; name: string } | null };
    try {
      confirmation = await resend.emails.send({
        from: FROM,
        to: email,
        subject: "You're on the ENICE Watchlist",
        html: confirmationHtml(email),
      }) as typeof confirmation;
    } catch (sendErr) {
      // Network-level throw (rare)
      console.error("[watchlist] Confirmation throw:", sendErr);
      res.status(500).json({ ok: false, error: "We could not process your request. Please try again." });
      return;
    }

    if (confirmation.error) {
      // Log full provider detail privately — never expose to the client
      console.error("[watchlist] Confirmation SDK error:", JSON.stringify(confirmation.error));
      res.status(500).json({ ok: false, error: "We could not process your request. Please try again shortly." });
      return;
    }

    // Step 2: Schedule the 3 reminder emails. These are best-effort —
    // if the Resend plan doesn't support scheduled sends, we still succeed.
    const reminders = await Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: email,
        subject: "3 Days Until We Engineer the Future — ENICE Group",
        html: threeDayHtml(email),
        scheduledAt: LAUNCH.threeDayReminder,
      }),
      resend.emails.send({
        from: FROM,
        to: email,
        subject: "Tomorrow, Everything Changes — ENICE Group",
        html: oneDayHtml(email),
        scheduledAt: LAUNCH.oneDayReminder,
      }),
      resend.emails.send({
        from: FROM,
        to: email,
        subject: "ENICE Group Is Live — You Have Early Access",
        html: launchHtml(email),
        scheduledAt: LAUNCH.launchMoment,
      }),
    ]);

    const scheduled = reminders.filter(
      (r) => r.status === "fulfilled" && !(r.value as { error?: unknown }).error
    ).length;

    if (scheduled < 3) {
      console.warn("[watchlist] Some scheduled sends failed:", JSON.stringify(
        reminders.map((r) => r.status === "fulfilled" ? (r.value as { error?: unknown }).error : r.reason)
      ));
    }

    // Step 4: Record the contact so future submissions are caught as duplicates.
    if (audienceId) {
      await resend.contacts.create({ audienceId, email, unsubscribeOnClick: false }).catch((err) => {
        console.warn("[watchlist] Could not save contact to audience:", err);
      });
    }

    res.status(200).json({ ok: true, scheduledReminders: scheduled });
  } catch (err) {
    console.error("[watchlist] Unexpected error:", err);
    res.status(500).json({ ok: false, error: "We could not process your request. Please try again." });
  }
});
