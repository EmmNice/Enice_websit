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
import { subscribeToUpdates } from "../src/lib/updates-store.server";
import { emailProvider, EmailProviderConfigError } from "../src/lib/email/index.server";
import { AUTO_GENERATED_HEADERS, AUTO_REPLY_HEADERS } from "../src/lib/email/types";
import { contactFormSender, groupSender, INTERNAL_RECIPIENT } from "../src/lib/email/senders";

const TO = INTERNAL_RECIPIENT;

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

/** What happened to the "keep me updated" opt-in, reported in the notification email. */
type UpdatesOutcome = "not_requested" | "subscribed" | "already_subscribed" | "failed";

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
        This is an automated confirmation and replies to it are not received. If you need to add
        anything, email
        <a href="mailto:corporate@enicehq.com" style="color:#1e3a8a;">corporate@enicehq.com</a>.
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

function describeUpdates(outcome: UpdatesOutcome): string {
  switch (outcome) {
    case "subscribed":
      return "Yes — added to the Product Updates list";
    case "already_subscribed":
      return "Yes — already on the Product Updates list";
    case "failed":
      return "Yes — but subscribing failed, add them manually in Resend";
    default:
      return "No";
  }
}

function notificationHtml(fields: Submission, updates: UpdatesOutcome): string {
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
        ${row("Product updates", describeUpdates(updates))}
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

    // Opt-in is handled before the notification is composed so its outcome can be reported
    // in the email. It is deliberately best-effort: failing to add someone to a mailing list
    // must never stop their message reaching the team.
    let updatesOutcome: UpdatesOutcome = "not_requested";
    if (fields.updates) {
      try {
        const result = await subscribeToUpdates({
          email: fields.email,
          name: fields.name,
          source: fields.source,
        });
        updatesOutcome = result.outcome;
      } catch (err) {
        updatesOutcome = "failed";
        console.error(`[api/contact:${ref}] updates subscription failed:`, err);
      }
    }

    const provider = emailProvider();
    const subject = fields.company
      ? `Contact: ${fields.inquiry || "General"} — ${fields.name} (${fields.company})`
      : `Contact: ${fields.inquiry || "General"} — ${fields.name}`;

    /*
     * The notification is the one delivery that matters; it is awaited and its failure is
     * reported, because a message the team never receives must not look like a success.
     *
     * Two failure shapes, two answers. An unconfigured provider (missing key, or a plan without
     * API access) is OUR fault and will not fix itself on a retry, so it answers 503 with the
     * direct address — the same outcome the old missing-RESEND_API_KEY check produced. A refused
     * message is 502.
     */
    try {
      await provider.send({
        /*
         * Sent from the fixed `noreply@enicehq.com`, deliberately unchanged.
         *
         * enicehq.com is the only domain ENICE has verified, so the enquiry cannot be sent as the
         * visitor's own address — mail may only leave under a domain proven by DKIM/SPF. Putting the
         * visitor's name in the From display name instead was tried and rejected: the form
         * notification is an automated message and should read as one. Who wrote in is in the
         * subject line and in the body, and `replyTo` below is their address, so replying from the
         * team's inbox reaches them directly.
         */
        from: contactFormSender(),
        to: TO,
        replyTo: fields.email,
        subject,
        html: notificationHtml(fields, updatesOutcome),
        // Machine-generated, so a holiday responder on the team mailbox cannot answer it and a
        // helpdesk watching that mailbox does not log it as a customer email.
        headers: AUTO_GENERATED_HEADERS,
        // Makes a retried submission safe on providers that honour it.
        idempotencyKey: `contact-notification-${ref}`,
      });
    } catch (err) {
      if (err instanceof EmailProviderConfigError) {
        console.error(`[api/contact:${ref}] email provider is not configured:`, err.message);
        res.status(503).json({
          ok: false,
          error: "Our contact form is temporarily unavailable. Please email corporate@enicehq.com.",
          ref,
        });
        return;
      }
      console.error(`[api/contact:${ref}] the provider rejected the notification:`, err);
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
      await provider.send({
        from: groupSender(),
        to: fields.email,
        /*
         * Deliberately NO Reply-To: this is a receipt, not a conversation.
         *
         * It used to say "reply directly to this email" while being sent from `noreply@` with no
         * Reply-To, so a reply reached a mailbox nobody reads — the invitation was simply false.
         *
         * Of the two ways to make it true, ENICE chose to keep the email one-way: its whole job is
         * to tell someone their message arrived, and the team answers from the notification copy
         * instead, where Reply-To is already the sender's own address. So the copy now states that
         * replies are not received and gives corporate@enicehq.com, rather than quietly routing a
         * reply somewhere the sender did not choose.
         *
         * If a Reply-To is ever added here, the "replies are not received" line in
         * `acknowledgementHtml` has to go in the same change.
         */
        subject: "We received your message",
        html: acknowledgementHtml(fields.name),
        /*
         * The other half of "this mailbox is not monitored".
         *
         * Saying it in the body tells a human; these headers tell a machine. Without them a visitor
         * whose address has an out-of-office or a ticketing autoresponder answers this receipt, the
         * answer arrives at an unread `noreply@`, and the moment anything of ours ever replies
         * automatically the two sides loop. It also stops "We received your message" opening a
         * spurious ticket in the recipient's own helpdesk.
         */
        headers: AUTO_REPLY_HEADERS,
        idempotencyKey: `contact-ack-${ref}`,
      });
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
