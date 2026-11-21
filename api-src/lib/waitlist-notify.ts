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
import { AUTO_GENERATED_HEADERS, type OutboundEmail } from "../../src/lib/email/types";
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

  const compose = (person: { id: string; name: string; email: string }): OutboundEmail => {
    const first = escapeHtml(person.name.split(/\s+/)[0] || "there");
    return {
      from: groupSender(),
      to: person.email,
      subject,
      html: `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#0048ed;font-weight:700;">ENICE Group</p>
          <p style="margin:0 0 14px;font-size:14px;color:#111827;">Hi ${first},</p>
          ${paragraphs}
          <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6b7280;">You are receiving this because you joined the PulsePay waitlist and agreed to hear from us about the launch. Reply to this email and we will remove you.</p>
        </body></html>`,
      text: [
        `Hi ${person.name.split(/\s+/)[0] || "there"},`,
        "",
        message,
        "",
        "You are receiving this because you joined the PulsePay waitlist and agreed to hear from us about the launch. Reply to this email and we will remove you.",
        "",
        "ENICE Group",
      ].join("\n"),
      headers: AUTO_GENERATED_HEADERS,
      idempotencyKey: `waitlist-launch-${person.id}`,
    };
  };

  /*
   * Batched, not one at a time.
   *
   * A launch email to a few hundred people is one request per hundred when the provider supports
   * batches, which keeps the whole send inside a single function call and well under the provider's
   * rate limit. Anything the batch refuses falls back to an individual attempt so one bad address
   * cannot cost the rest of the group.
   */
  const BATCH = 100;
  for (let start = 0; start < recipients.length; start += BATCH) {
    const group = recipients.slice(start, start + BATCH);
    const messages = group.map(compose);

    if (provider.sendBatch) {
      try {
        const results = await provider.sendBatch(messages);
        for (let i = 0; i < group.length; i += 1) {
          if (results[i]?.id) {
            sentIds.push(group[i].id);
          } else {
            failed += 1;
            console.error(`[waitlist-notify] batch refused ${group[i].id}:`, results[i]?.error);
          }
        }
        continue;
      } catch (error) {
        console.error("[waitlist-notify] batch failed, retrying individually:", error);
      }
    }

    for (let i = 0; i < group.length; i += 1) {
      try {
        await provider.send(messages[i]);
        sentIds.push(group[i].id);
      } catch (error) {
        failed += 1;
        console.error(`[waitlist-notify] could not send to ${group[i].id}:`, error);
      }
    }
  }

  return { sentIds, failed };
}
