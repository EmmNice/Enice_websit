/**
 * Vercel serverless function: POST /api/waitlist
 *
 * Records a PulsePay waitlist registration. The row in `pulsepay_waitlist` is the record that
 * matters; it survives a change of email provider and is readable from the admin dashboard even
 * when no provider is configured.
 *
 * What this endpoint can do is deliberately narrow: it creates a registration and nothing else.
 * It cannot list, read or change anyone, so the public form is not a route to the data.
 *
 * Emails are best-effort. A failed receipt is recoverable (the row is in the database); failing
 * the signup because a mailbox could not be reached would lose the person.
 *
 * CSRF: the endpoint is public and unauthenticated and reads no cookies, so there is no ambient
 * credential for a cross-site request to abuse. Abuse is handled by the honeypot, the timing gate
 * and the database-backed rate limits below, which hold across serverless instances.
 */
import {
  clientIp,
  errorRef,
  escapeHtml,
  parseJsonBody,
  type ApiRequest,
  type ApiResponse,
} from "./lib/http";
import {
  consumeRateLimit,
  DatabaseNotConfiguredError,
  ensureMigrated,
  isDatabaseConfigured,
} from "./lib/db";
import { joinWaitlist } from "./lib/repo/waitlist";
import { emailProvider, EmailProviderConfigError } from "../src/lib/email/index.server";
import { AUTO_GENERATED_HEADERS, AUTO_REPLY_HEADERS } from "../src/lib/email/types";
import { contactFormSender, groupSender, INTERNAL_RECIPIENT } from "../src/lib/email/senders";
import {
  interestLabel,
  normalizePhone,
  validateWaitlist,
  WAITLIST_LIMITS,
} from "../src/lib/waitlist";

/** A form filled in faster than this was filled in by a script. */
const MIN_FILL_MS = 2500;

const UNAVAILABLE = "The waitlist is not available right now. Please email corporate@enicehq.com.";

function readField(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function readInterests(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  // Deduplicated and bounded: the list is a fixed vocabulary, so anything long is not genuine.
  return [...new Set(value.filter((v): v is string => typeof v === "string"))].slice(0, 20);
}

function notificationHtml(f: {
  name: string;
  email: string;
  phone: string;
  interests: string[];
  source: string;
}): string {
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:8px 14px;background:#f8fafc;border:1px solid #e2e8f0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-weight:600;width:170px;vertical-align:top;">${escapeHtml(label)}</td>
       <td style="padding:10px 14px;border:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${escapeHtml(value || "-")}</td>
     </tr>`;

  return `<!DOCTYPE html>
<html lang="en"><body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;">
  <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#0048ed;font-weight:700;">ENICE Group &middot; PulsePay waitlist</p>
  <h1 style="margin:0 0 20px;font-size:20px;color:#111827;">${escapeHtml(f.name)} joined the waitlist</h1>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;border-collapse:collapse;">
    ${row("Name", f.name)}${row("Email", f.email)}${row("Phone", f.phone)}
    ${row("Interested in", f.interests.map(interestLabel).join(", "))}
    ${row("Joined from", f.source)}
  </table>
  <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">Manage this registration in the admin dashboard under Waitlist.</p>
</body></html>`;
}

function receiptHtml(name: string): string {
  const firstName = escapeHtml(name.split(/\s+/)[0] || "there");
  return `<!DOCTYPE html>
<html lang="en"><body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;">
  <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#0048ed;font-weight:700;">ENICE Group</p>
  <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">You are on the PulsePay waitlist, ${firstName}.</h1>
  <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#111827;">
    Thank you for your interest. We will write to this address when PulsePay opens, with early
    access details and the next steps. There is nothing to pay and nothing more you need to do.
  </p>
  <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
    You agreed to hear from us about the PulsePay launch. If you change your mind, reply to this
    email and we will remove you.
  </p>
</body></html>`;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const ref = errorRef("waitlist");

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const body = parseJsonBody(req.body);

  // Honeypot: a hidden field no human fills in. Answer as if it worked so a bot learns nothing.
  if (readField(body.website, 200)) {
    res.status(200).json({ ok: true, status: "joined" });
    return;
  }

  const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    res.status(400).json({ ok: false, error: "Please take a moment and submit the form again." });
    return;
  }

  const fields = {
    name: readField(body.name, WAITLIST_LIMITS.name),
    email: readField(body.email, WAITLIST_LIMITS.email),
    phone: readField(body.phone, WAITLIST_LIMITS.phone),
    interests: readInterests(body.interests),
    consent: body.consent === true,
    source: readField(body.source, 200) || "waitlist",
  };

  const errors = validateWaitlist(fields);
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ ok: false, error: Object.values(errors)[0], fields: errors });
    return;
  }

  if (!isDatabaseConfigured()) {
    console.error(`[api/waitlist:${ref}] DATABASE_URL is not set`);
    res.status(503).json({ ok: false, error: UNAVAILABLE });
    return;
  }

  let outcome: "joined" | "already_joined";
  try {
    await ensureMigrated();

    // Rate limits live in the database so they hold across serverless instances, where an
    // in-memory counter would reset on every cold start.
    const ip = await consumeRateLimit(`waitlist:ip:${clientIp(req)}`, 20, 10 * 60 * 1000);
    const addr = await consumeRateLimit(
      `waitlist:email:${fields.email.toLowerCase()}`,
      5,
      24 * 60 * 60 * 1000,
    );
    if (ip.limited || addr.limited) {
      res.status(429).json({ ok: false, error: "Too many attempts. Please try again later." });
      return;
    }

    outcome = await joinWaitlist({ ...fields, phone: normalizePhone(fields.phone) });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      res.status(503).json({ ok: false, error: UNAVAILABLE });
      return;
    }
    console.error(`[api/waitlist:${ref}] could not record the signup:`, error);
    res.status(502).json({
      ok: false,
      error: "We could not save your details right now. Please try again in a moment.",
      ref,
    });
    return;
  }

  // The signup is safe from here. Neither email failing undoes it.
  try {
    const provider = emailProvider();
    if (outcome === "joined") {
      await provider.send({
        from: contactFormSender(),
        to: INTERNAL_RECIPIENT,
        replyTo: fields.email,
        subject: `Waitlist: PulsePay, ${fields.name}`,
        html: notificationHtml(fields),
        headers: AUTO_GENERATED_HEADERS,
        idempotencyKey: `waitlist-notification-${ref}`,
      });
      await provider.send({
        from: groupSender(),
        to: fields.email,
        subject: "You are on the PulsePay waitlist",
        html: receiptHtml(fields.name),
        headers: AUTO_REPLY_HEADERS,
        idempotencyKey: `waitlist-receipt-${ref}`,
      });
    }
  } catch (error) {
    if (error instanceof EmailProviderConfigError) {
      console.error(`[api/waitlist:${ref}] email provider is not configured:`, error.message);
    } else {
      console.error(`[api/waitlist:${ref}] mail failed after the signup was recorded:`, error);
    }
  }

  res.status(200).json({ ok: true, status: outcome });
}
