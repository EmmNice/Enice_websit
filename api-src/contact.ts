/**
 * Vercel serverless function — POST /api/contact
 * Receives a contact form submission and forwards it to corporate@enicehq.com
 * via Resend.
 */
import { Resend } from "resend";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReq = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRes = any;

const FROM = "ENICE Contact <noreply@enicehq.com>";
const TO = "corporate@enicehq.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// IP-based rate limiter (5 submissions / 10 min per IP).
// Note: in-memory — resets on cold start and is not shared across Vercel
// instances. For production-grade distributed rate limiting, replace this
// with an Upstash/Redis-backed solution. The email-based limiter below
// provides a complementary per-address guard within each warm instance.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 600_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

// Email-based rate limiter (3 submissions per address per 60 min per instance).
// Guards against the same sender submitting the contact form repeatedly.
const emailRateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isEmailRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = emailRateLimitMap.get(email);
  if (!entry || now > entry.resetAt) {
    emailRateLimitMap.set(email, { count: 1, resetAt: now + 3_600_000 });
    return false;
  }
  if (entry.count >= 3) return true;
  entry.count++;
  return false;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildAutoReplyHtml(data: { name: string }) {
  const firstName = escapeHtml(data.name.trim().split(/\s+/)[0] || "there");
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 24px;"><tr><td align="center">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
      <tr><td style="padding:0 0 24px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#3b82f6;font-weight:700;">ENICE Group</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#0f172a;">We received your message, ${firstName}.</h1>
      </td></tr>
      <tr><td>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#0f172a;">
          Thanks for reaching out to ENICE Group. Your inquiry has been routed to the right team and
          you can expect a response within one business day.
        </p>
      </td></tr>
      <tr><td style="padding:24px 0 0;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
          This is an automated confirmation. If you need to add anything, reply directly to this email
          or reach us at corporate@enicehq.com.
        </p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function buildHtml(data: {
  name: string;
  email: string;
  company: string;
  inquiry: string;
  message: string;
}) {
  const rows = [
    ["Full Name", data.name],
    ["Corporate Email", data.email],
    ["Company / Institution", data.company],
    ["Nature of Inquiry", data.inquiry || "–"],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 14px;background:#f8fafc;border:1px solid #e2e8f0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;font-weight:600;width:180px;">${escapeHtml(
          k,
        )}</td><td style="padding:10px 14px;border:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${escapeHtml(
          v,
        )}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 24px;"><tr><td align="center">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
      <tr><td style="padding:0 0 24px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#3b82f6;font-weight:700;">ENICE Group · Corporate Inquiry</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#0f172a;">New inquiry from ${escapeHtml(
          data.name,
        )}</h1>
      </td></tr>
      <tr><td>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rows}</table>
      </td></tr>
      <tr><td style="padding:24px 0 0;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;font-weight:600;">Message</p>
        <div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;font-size:14px;line-height:1.6;color:#0f172a;white-space:pre-wrap;">${escapeHtml(
          data.message,
        )}</div>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export default async function handler(req: AnyReq, res: AnyRes) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    if (isRateLimited(ip)) {
      res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    // Honeypot: bots that fill hidden fields get a silent success.
    if (String(body.website || "").trim().length > 0) {
      res.status(200).json({ ok: true });
      return;
    }

    // Timing check: reject submissions filled out in under 2 seconds.
    const startedAt = Number(body.startedAt);
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 2_000) {
      res.status(200).json({ ok: true });
      return;
    }

    const name = String(body.name || "")
      .trim()
      .slice(0, 200);
    const email = String(body.email || "")
      .trim()
      .slice(0, 200);
    const company = String(body.company || "")
      .trim()
      .slice(0, 200);
    const inquiry = String(body.inquiry || "")
      .trim()
      .slice(0, 200);
    const message = String(body.message || "")
      .trim()
      .slice(0, 2000);

    if (!name || !company || !message) {
      res.status(400).json({ ok: false, error: "Missing required fields." });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ ok: false, error: "Invalid email address." });
      return;
    }

    if (isEmailRateLimited(email)) {
      res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[api/contact] Missing RESEND_API_KEY");
      res.status(500).json({ ok: false, error: "Email service not configured." });
      return;
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `Inquiry: ${inquiry || "General"} — ${name} (${company})`,
      html: buildHtml({ name, email, company, inquiry, message }),
    });

    if (result.error) {
      console.error("[api/contact] Resend error:", result.error);
      res.status(502).json({ ok: false, error: "Failed to deliver message." });
      return;
    }

    try {
      const autoReply = await resend.emails.send({
        from: "ENICE Group <noreply@enicehq.com>",
        to: email,
        subject: "We received your message",
        html: buildAutoReplyHtml({ name }),
      });
      if (autoReply.error) {
        console.error("[api/contact] Auto-reply error:", autoReply.error);
      }
    } catch (err) {
      console.error("[api/contact] Auto-reply unhandled error:", err);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    const ref = `E${Date.now().toString(36).toUpperCase()}`;
    console.error(`[api/contact:unhandled:${ref}]`, err);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: "Unexpected error.", ref });
    }
  }
}
