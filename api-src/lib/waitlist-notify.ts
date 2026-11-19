/**
 * Sends the launch notification to consenting waitlist members.
 *
 * Recipients arrive already filtered by `notifiableRecipients()`, the single place that decides
 * who may be contacted (consented, not withdrawn, not already told). This module only delivers.
 *
 * Each person is sent their own message, so no recipient sees another's address, and a failure for
 * one does not stop the rest. Only the ones that actually went out are returned, so only they are
 * marked as notified and a retry reaches the remainder rather than telling anyone twice.
 */

import { escapeHtml } from "./http";
import { emailProvider } from "../../src/lib/email/index.server";
import { AUTO_GENERATED_HEADERS } from "../../src/lib/email/types";
import { groupSender } from "../../src/lib/email/senders";

export async function sendLaunchNotification(
  recipients: { id: string; name: string; email: string }[],
  subject: string,
  message: string,
): Promise<{ sentIds: string[]; failed: number }> {
  const provider = emailProvider();
  const sentIds: string[] = [];
  let failed = 0;

  const paragraphs = message
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#111827;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  for (const person of recipients) {
    const first = escapeHtml(person.name.split(/\s+/)[0] || "there");
    try {
      await provider.send({
        from: groupSender(),
        to: person.email,
        subject,
        html: `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#0048ed;font-weight:700;">ENICE Group</p>
          <p style="margin:0 0 14px;font-size:14px;color:#111827;">Hi ${first},</p>
          ${paragraphs}
          <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6b7280;">You are receiving this because you joined the PulsePay waitlist and agreed to hear from us about the launch. Reply to this email and we will remove you.</p>
        </body></html>`,
        headers: AUTO_GENERATED_HEADERS,
        idempotencyKey: `waitlist-launch-${person.id}`,
      });
      sentIds.push(person.id);
    } catch (error) {
      failed += 1;
      console.error(`[waitlist-notify] could not send to ${person.id}:`, error);
    }
  }

  return { sentIds, failed };
}
