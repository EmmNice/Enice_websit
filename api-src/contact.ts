/**
 * Vercel serverless function — POST /api/contact
 *
 * Forwards a contact submission to corporate@enicehq.com via Resend, with the sender's
 * address as `Reply-To` so the team can reply straight from their inbox. The sender also
 * gets an automatic acknowledgement.
 *
 * Serves both the homepage section and the full /contact page. `company` and `inquiry` are
 * optional here because the homepage form asks only for what is needed to reply; the fuller
 * page requires them client-side.
 *
 * CSRF: the endpoint is intentionally public and unauthenticated and reads no cookies, so
 * there is no ambient credential for a cross-site request to abuse. Abuse is handled by the
 * honeypot, the timing gate and the rate limiters below.
 */
import { Resend } from "resend";
import {
  clientIp,
  createRateLimiter,
  errorRef,
  escapeHtml,
  parseJsonBody,
  type ApiRequest,
  type ApiResponse,
} from "./lib/http";
import { EMAIL_RE, FIELD_LIMITS } from "../src/lib/contact";

const FROM = "ENICE Contact <noreply@enicehq.com>";
const REPLY_FROM = "ENICE Group <noreply@enicehq.com>";
const TO = "corporate@enicehq.com";

// Layered so that correcting a typo is never punished: a high ceiling guards against
// hammering, while the strict per-IP and per-address limits apply only once a submission is
// well-formed and about to send mail. All are in-memory and therefore per-instance — they
// reset on cold start and are not shared across Vercel instances.
const tooManyRequests = createRateLimiter(30, 10 * 60 * 1000);
const tooManySends = createRateLimiter(5, 10 * 60 * 1000);
const tooManyForEmail = createRateLimiter(3, 60 * 60 * 1000);

type Submission = {
  name: string;
  email: string;
  company: string;
  inquiry: string;
  message: string;
  updates: boolean;
  source: string;
};

function readField(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Mirrors `validateContact` in src/lib/contact.ts for the fields the server insists on. */
function validate(fields: Submission): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (fields.name.length < 2) errors.name = ["Please enter your name."];
  if (!fields.email || !EMAIL_RE.test(fields.email) || fields.email.length > FIELD_LIMITS.email) {
    errors.email = ["Please enter a valid email address."];
  }
  if (!fields.message) errors.message = ["Please write a message."];
  else if (fields.message.length < 10) errors.message = ["Please add a little more detail."];
  return errors;
}

function acknowledgementHtml(name: string): string {
  const firstName = escapeHtml(name.split(/\s+/)[0] || "there");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 24px;"><tr><td align="center">
  <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
    <tr><td style="padding:0 0 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1e3a8a;font-weight:700;">ENICE Group</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#111827;">We received your message, ${firstName}.</h1>
    </td></tr>
    <tr><td>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#111827;">
        Thanks for reaching out to ENICE Group. Your message has been routed to the right team and
        you can expect a reply within one business day.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">
        If you need to add anything, reply directly to this email.
      </p>
    </td></tr>
    <tr><td style="padding:24px 0 0;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
        ENICE Group &middot; Abuja &amp; Kaduna, Nigeria &middot; corporate@enicehq.com
      </p>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

function notificationHtml(fields: Submission): string {
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:8px 14px;background:#f8fafc;border:1px solid #e2e8f0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-weight:600;width:170px;vertical-align:top;">${escapeHtml(label)}</td>
       <td style="padding:10px 14px;border:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${escapeHtml(value || "—")}</td>
     </tr>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 24px;"><tr><td align="center">
  <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
    <tr><td style="padding:0 0 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1e3a8a;font-weight:700;">ENICE Group &middot; Contact</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#111827;">New message from ${escapeHtml(fields.name)}</h1>
      <p style="margin:10px 0 0;font-size:13px;color:#6b7280;">Reply to this email to respond directly to the sender.</p>
    </td></tr>
    <tr><td>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${row("Name", fields.name)}
        ${row("Email", fields.email)}
        ${row("Company", fields.company)}
        ${row("Inquiry", fields.inquiry || "General")}
        ${row("Wants updates", fields.updates ? "Yes" : "No")}
        ${row("Submitted from", fields.source)}
      </table>
    </td></tr>
    <tr><td style="padding:24px 0 0;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-weight:600;">Message</p>
      <div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;font-size:14px;line-height:1.7;color:#0f172a;white-space:pre-wrap;">${escapeHtml(fields.message)}</div>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const ref = errorRef("CT");

  try {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "Method not allowed." });
      return;
    }

    const ip = clientIp(req);
    if (tooManyRequests(ip)) {
      res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
      return;
    }

    const body = parseJsonBody(req.body);

    // Honeypot: a hidden field only a bot would fill. Answering 200 without sending makes a
    // rejected submission indistinguishable from a successful one.
    if (readField(body.website, 200).length > 0) {
      console.warn(`[api/contact:${ref}] honeypot triggered — discarding submission.`);
      res.status(200).json({ ok: true });
      return;
    }

    // Timing gate: a genuine person cannot complete this form in under two seconds.
    const startedAt = Number(body.startedAt);
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 2_000) {
      console.warn(`[api/contact:${ref}] submitted too fast — discarding submission.`);
      res.status(200).json({ ok: true });
      return;
    }

    const fields: Submission = {
      name: readField(body.name, FIELD_LIMITS.name),
      email: readField(body.email, FIELD_LIMITS.email).toLowerCase(),
      company: readField(body.company, FIELD_LIMITS.company),
      inquiry: readField(body.inquiry, FIELD_LIMITS.inquiry),
      message: readField(body.message, FIELD_LIMITS.message),
      updates: body.updates === true,
      source: readField(body.source, 40) || "website",
    };

    const fieldErrors = validate(fields);
    if (Object.keys(fieldErrors).length > 0) {
      res
        .status(400)
        .json({ ok: false, error: "Please correct the highlighted fields.", fieldErrors });
      return;
    }

    // Only now, with a well-formed submission, spend the strict budgets.
    if (tooManySends(ip) || tooManyForEmail(fields.email)) {
      res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(`[api/contact:${ref}] RESEND_API_KEY is not configured.`);
      res.status(503).json({
        ok: false,
        error: "Our contact form is temporarily unavailable. Please email corporate@enicehq.com.",
        ref,
      });
      return;
    }

    const resend = new Resend(apiKey);
    const subject = fields.company
      ? `Contact: ${fields.inquiry || "General"} — ${fields.name} (${fields.company})`
      : `Contact: ${fields.inquiry || "General"} — ${fields.name}`;

    // The notification is the one delivery that matters; it is awaited and its failure is
    // reported, because a message the team never receives must not look like a success.
    const notification = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: fields.email,
      subject,
      html: notificationHtml(fields),
    });

    if (notification.error) {
      console.error(`[api/contact:${ref}] Resend rejected the notification:`, notification.error);
      res.status(502).json({
        ok: false,
        error: "We could not deliver your message. Please email corporate@enicehq.com directly.",
        ref,
      });
      return;
    }

    // The sender's acknowledgement is best-effort: the team already has the message, so a
    // failure here must not be reported as a failed submission.
    try {
      const ack = await resend.emails.send({
        from: REPLY_FROM,
        to: fields.email,
        subject: "We received your message",
        html: acknowledgementHtml(fields.name),
      });
      if (ack.error) {
        console.error(`[api/contact:${ref}] acknowledgement rejected:`, ack.error);
      }
    } catch (err) {
      console.error(`[api/contact:${ref}] acknowledgement failed:`, err);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(`[api/contact:${ref}]`, err);
    if (!res.headersSent) {
      res.status(500).json({
        ok: false,
        error: "Unexpected error. Please email corporate@enicehq.com directly.",
        ref,
      });
    }
  }
}
