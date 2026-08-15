/**
 * Resend delivery for Edge Functions.
 *
 * The Resend Node SDK is not used here — Deno functions talk to the REST API directly,
 * matching how the rest of this project's email is sent. The API key is read from the
 * environment on every call and never logged.
 */
import { escapeHtml } from "./http.ts";

/**
 * Overridable so local verification can point at a stub instead of sending real mail.
 * Unset in every deployed environment.
 */
function resendEndpoint(): string {
  return Deno.env.get("RESEND_BASE_URL") ?? "https://api.resend.com/emails";
}

export const FROM_ADDRESS = "ENICE Group <noreply@enicehq.com>";
export const INTERNAL_RECIPIENT = "corporate@enicehq.com";

type SendResult = { ok: boolean; skipped?: boolean };

/**
 * Sends one email. Never throws: transactional email is best-effort relative to the
 * database write, so a Resend outage must not lose a registration that already persisted.
 */
export async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set — skipping send.");
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch(resendEndpoint(), {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      // Body may contain provider detail; keep it in logs only.
      console.error("[email] Resend rejected the send:", res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] Resend request failed:", err);
    return { ok: false };
  }
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

/** Confirmation sent to the applicant. Explicitly does not promise product access. */
export function earlyAccessConfirmationHtml(fullName: string): string {
  const firstName = escapeHtml(fullName.trim().split(/\s+/)[0] || "there");
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

/** Internal notification so the team sees new registrations without opening the admin UI. */
export function earlyAccessNotificationHtml(fields: {
  fullName: string;
  email: string;
  businessName: string;
  businessType: string;
  businessNeed: string;
}): string {
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:6px 12px 6px 0;font-size:12px;color:#6b7280;white-space:nowrap;vertical-align:top;">${label}</td>
       <td style="padding:6px 0;font-size:13px;color:#111827;">${escapeHtml(value || "—")}</td>
     </tr>`;

  return layout(
    "PulseAssist &middot; Early Access",
    "New early-access registration",
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
       ${row("Name", fields.fullName)}
       ${row("Email", fields.email)}
       ${row("Business", fields.businessName)}
       ${row("Business type", fields.businessType)}
       ${row("Need", fields.businessNeed)}
       ${row("Source", "enice_website")}
       ${row("Status", "EARLY_ACCESS")}
     </table>`,
  );
}
