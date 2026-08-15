/**
 * Vercel serverless function — POST /api/early-access
 *
 * Records a PulseAssist early-access registration in Resend and sends the applicant a
 * confirmation plus an internal notification.
 *
 * This is a registration endpoint, not an enrolment one: `status`, `source` and `product`
 * are set server-side and any client-supplied values are ignored, so submitting the form
 * can never grant product access.
 *
 * CSRF: the endpoint is intentionally public and unauthenticated, and carries no ambient
 * credential (no cookies are read), so there is nothing for a cross-site request to abuse.
 * Abuse is controlled by the honeypot and the two rate limiters below.
 */
import {
  BUSINESS_TYPES,
  EMAIL_RE,
  FIELD_LIMITS,
  type EarlyAccessFields,
  type FieldErrors,
} from "../src/lib/early-access";
import {
  EarlyAccessConfigError,
  PRODUCT,
  SOURCE,
  registerEarlyAccess,
} from "../src/lib/early-access-store.server";
import {
  clientIp,
  createRateLimiter,
  errorRef,
  escapeHtml,
  parseJsonBody,
  type ApiRequest,
  type ApiResponse,
} from "./lib/http";

const FROM = "ENICE Group <noreply@enicehq.com>";
const INTERNAL_RECIPIENT = "corporate@enicehq.com";

// Three limits, deliberately layered so that correcting a typo is never punished:
//
//   requestHits — a high ceiling on all traffic from one host, to stop hammering.
//   writeHits   — a tight limit applied only once validation passes, i.e. only to requests
//                 that will actually reach Resend and send email. A visitor who mistypes
//                 their email five times must still be able to submit.
//   emailHits   — stops one address being replayed from rotating IPs.
//
// All are module-scoped: per-instance and reset on cold start. Enough to blunt casual
// abuse, not a distributed guarantee — Upstash/Redis is the upgrade if that is needed.
const tooManyRequests = createRateLimiter(30, 10 * 60 * 1000);
const tooManyWrites = createRateLimiter(5, 10 * 60 * 1000);
const tooManyForEmail = createRateLimiter(3, 60 * 60 * 1000);

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Server-side validation. Messages are written for humans — an earlier implementation
 * leaked its schema library's internal wording ("expected string, received undefined")
 * straight into the form.
 */
function validate(fields: EarlyAccessFields): FieldErrors {
  const errors: FieldErrors = {};
  if (fields.fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (!fields.email || !EMAIL_RE.test(fields.email) || fields.email.length > FIELD_LIMITS.email) {
    errors.email = "Please enter a valid work email address.";
  }
  if (fields.businessName.length < 2) errors.businessName = "Please enter your business name.";
  if (!fields.businessType) errors.businessType = "Please select your business type.";
  else if (!(BUSINESS_TYPES as readonly string[]).includes(fields.businessType)) {
    errors.businessType = "Please select a business type from the list.";
  }
  return errors;
}

function layout(kicker: string, heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 24px;"><tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
    <tr><td style="padding:0 0 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1e3a8a;font-weight:700;">${kicker}</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#111827;">${heading}</h1>
    </td></tr>
    <tr><td>${bodyHtml}</td></tr>
    <tr><td style="padding:24px 0 0;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
        ENICE Group &middot; Abuja &amp; Kaduna, Nigeria &middot; corporate@enicehq.com
      </p>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

function confirmationHtml(fullName: string): string {
  const firstName = escapeHtml(fullName.split(/\s+/)[0] || "there");
  return layout(
    "ENICE Group &middot; PulseAssist",
    `You're on the list, ${firstName}.`,
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#111827;">
       Thank you for your interest in PulseAssist. We have received your early-access request.
     </p>
     <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#374151;">
       Our team reviews every request individually. We will contact you by email when you are
       eligible for early access. Submitting this form does not grant product access yet.
     </p>
     <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">
       No action is needed from you in the meantime.
     </p>`,
  );
}

/**
 * Internal notification. When `storageFailure` is non-null the write to Resend did not
 * succeed, so this email is the only record of the application and says so prominently.
 */
function notificationHtml(fields: EarlyAccessFields, storageFailure: unknown): string {
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:6px 12px 6px 0;font-size:12px;color:#6b7280;white-space:nowrap;vertical-align:top;">${label}</td>
       <td style="padding:6px 0;font-size:13px;color:#111827;">${escapeHtml(value || "—")}</td>
     </tr>`;

  const warning =
    storageFailure === null
      ? ""
      : `<div style="margin:0 0 20px;padding:12px 14px;border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;">
           <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#991b1b;">
             This registration was NOT saved to Resend.
           </p>
           <p style="margin:0;font-size:12px;line-height:1.6;color:#7f1d1d;">
             It will not appear in the admin list, so keep this email as the record. Most
             likely the RESEND_API_KEY lacks contacts/segments access. Reason:
             ${escapeHtml(storageFailure instanceof Error ? storageFailure.message : String(storageFailure))}
           </p>
         </div>`;

  return layout(
    "PulseAssist &middot; Early Access",
    "New early-access registration",
    `${warning}
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
       ${row("Name", fields.fullName)}
       ${row("Email", fields.email)}
       ${row("Business", fields.businessName)}
       ${row("Business type", fields.businessType)}
       ${row("Need", fields.businessNeed)}
       ${row("Product", PRODUCT)}
       ${row("Source", SOURCE)}
       ${row("Status", storageFailure === null ? "EARLY_ACCESS" : "not stored")}
     </table>`,
  );
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const ref = errorRef("EA");

  try {
    const ip = clientIp(req);
    if (tooManyRequests(ip)) {
      res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
      return;
    }

    const body = parseJsonBody(req.body);

    // The honeypot is checked before validation. Validating it first would return a 400
    // naming the hidden field, telling a bot exactly which trap it fell into. A plain 200
    // with no write makes a rejected submission indistinguishable from a successful one.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      console.warn(`[api/early-access:${ref}] honeypot triggered — discarding submission.`);
      res.status(200).json({ ok: true });
      return;
    }

    const fields: EarlyAccessFields = {
      fullName: str(body.fullName, FIELD_LIMITS.fullName),
      email: str(body.email, FIELD_LIMITS.email).toLowerCase(),
      businessName: str(body.businessName, FIELD_LIMITS.businessName),
      businessType: str(body.businessType, FIELD_LIMITS.businessType),
      businessNeed: str(body.businessNeed, FIELD_LIMITS.businessNeed),
    };

    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      const fieldErrors: Record<string, string[]> = {};
      for (const [key, message] of Object.entries(errors)) {
        if (message) fieldErrors[key] = [message];
      }
      res
        .status(400)
        .json({ ok: false, error: "Please correct the highlighted fields.", fieldErrors });
      return;
    }

    // Only now, with a well-formed submission in hand, spend the strict budget.
    if (tooManyWrites(ip)) {
      res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
      return;
    }
    if (tooManyForEmail(fields.email)) {
      res.status(429).json({
        ok: false,
        error: "We already received a request for this email. Please check back.",
      });
      return;
    }

    // Storage is attempted first, but a failure here must not cost us the lead.
    //
    // Writing a registration needs contacts/segments/contact-properties access, whereas
    // sending needs only sending access — so a narrowly-scoped RESEND_API_KEY can send mail
    // while being unable to store anything. Rather than turning that into a dead end for
    // the applicant, the internal notification email doubles as the durable record: it is
    // always sent, and it is clearly flagged when the write failed so the team knows the
    // application is not in the admin list.
    let stored = false;
    let storageFailure: unknown = null;

    try {
      const result = await registerEarlyAccess(fields);
      if (result.outcome === "duplicate") {
        res.status(409).json({
          ok: false,
          code: "DUPLICATE",
          error: "This email is already on the PulseAssist early-access list.",
        });
        return;
      }
      stored = true;
    } catch (err) {
      storageFailure = err;
      console.error(`[api/early-access:${ref}] storage failed, falling back to email:`, err);
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const internalSubject = stored
      ? `PulseAssist Early Access — ${fields.businessName}`
      : `[ACTION REQUIRED — not saved] PulseAssist Early Access — ${fields.businessName}`;

    const sends = await Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: fields.email,
        subject: "Your PulseAssist early-access request",
        html: confirmationHtml(fields.fullName),
      }),
      resend.emails.send({
        from: FROM,
        to: INTERNAL_RECIPIENT,
        replyTo: fields.email,
        subject: internalSubject,
        html: notificationHtml(fields, stored ? null : storageFailure),
      }),
    ]);

    // The internal notification is the one that must land if storage did not.
    const internal = sends[1];
    const internalDelivered =
      internal.status === "fulfilled" && !(internal.value as { error?: unknown }).error;

    for (const outcome of sends) {
      if (outcome.status === "rejected") {
        console.error(`[api/early-access:${ref}] email send failed:`, outcome.reason);
      } else if ((outcome.value as { error?: unknown }).error) {
        console.error(
          `[api/early-access:${ref}] email rejected:`,
          JSON.stringify((outcome.value as { error?: unknown }).error),
        );
      }
    }

    // Only a total loss — neither stored nor emailed — is reported as a failure, because
    // only then is the application actually gone.
    if (!stored && !internalDelivered) {
      res.status(500).json({
        ok: false,
        error: "We could not save your request. Please try again.",
        ref,
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof EarlyAccessConfigError) {
      // Misconfiguration, not the visitor's fault — log the detail, return a safe message.
      console.error(`[api/early-access:${ref}] not configured:`, err.message);
      res.status(503).json({
        ok: false,
        error: "Early access is temporarily unavailable. Please try again shortly.",
        ref,
      });
      return;
    }
    console.error(`[api/early-access:${ref}]`, err);
    res.status(500).json({
      ok: false,
      error: "We could not save your request. Please try again.",
      ref,
    });
  }
}
