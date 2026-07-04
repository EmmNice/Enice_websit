/**
 * Server-only email module. The `.server.ts` suffix tells Vite's TanStack
 * Start plugin to exclude this file from the client bundle entirely —
 * no Node.js / Resend code ever reaches the browser.
 */
import { Resend } from "resend";
import { LAUNCH_EMAILS } from "@/lib/launch";

const FROM = "ENICE Group <noreply@enicehq.com>";

// ─── HTML templates ──────────────────────────────────────────────────────────

function confirmationHtml(email: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>You're on the Watchlist</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 24px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
        <tr><td style="background:#0f172a;padding:32px 48px;border-bottom:1px solid #1e293b;">
          <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;font-weight:600;">ENICE GROUP · CLASSIFIED DISPATCH</p>
          <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;letter-spacing:-0.03em;color:#f8fafc;line-height:1.2;">You're on the<br><span style="color:#3b82f6;">Watchlist.</span></h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">We received your request. Your position is confirmed.</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">On <strong style="color:#f8fafc;">July 18, 2026</strong>, ENICE Group launches its full platform — a venture-grade technology ecosystem built for the next era of global commerce. You will be the first to know the moment we go live.</p>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a1a1aa;">In the meantime, we are engineering in silence. The infrastructure is being stress-tested. The systems are being locked in. When the curtain lifts, it will be permanent.</p>
          <table cellpadding="0" cellspacing="0" style="border:1px solid #27272a;border-radius:8px;overflow:hidden;width:100%;">
            <tr>
              <td style="padding:16px 24px;border-right:1px solid #27272a;text-align:center;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#52525b;">Ventures</p>
                <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#f8fafc;">4</p>
              </td>
              <td style="padding:16px 24px;border-right:1px solid #27272a;text-align:center;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#52525b;">Verticals</p>
                <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#f8fafc;">3</p>
              </td>
              <td style="padding:16px 24px;text-align:center;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#52525b;">Uptime SLA</p>
                <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#3b82f6;">99.99%</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 48px;border-top:1px solid #27272a;background:#0c0c0e;">
          <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">This message was sent to <span style="color:#71717a;">${email}</span> because you joined the ENICE Group watchlist.<br>ENICE Group · Abuja &amp; Kaduna, Nigeria · <a href="https://enicehq.com" style="color:#3b82f6;text-decoration:none;">enicehq.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function threeDayHtml(email: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>3 Days Until We Engineer the Future</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 24px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
        <tr><td style="background:#0f172a;padding:32px 48px;border-bottom:1px solid #1e293b;">
          <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;font-weight:600;">T-MINUS 72 HOURS</p>
          <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;letter-spacing:-0.03em;color:#f8fafc;line-height:1.2;">3 Days Until We<br><span style="color:#3b82f6;">Engineer the Future.</span></h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">The countdown is inside the single digits now. In exactly <strong style="color:#f8fafc;">72 hours</strong>, ENICE Group opens its platform to the world.</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">You are among a select group receiving early access to our full ecosystem — PulsePay, PulseAssist, EPulse, and PulseX. Four platforms. Three verticals. One institutional-grade infrastructure stack.</p>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a1a1aa;">Prepare accordingly.</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;"><tr><td align="center" style="padding:8px 0;">
            <div style="display:inline-block;background:#1e3a5f;border:1px solid #2563eb;border-radius:8px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:40px;font-weight:800;color:#3b82f6;letter-spacing:-0.04em;font-variant-numeric:tabular-nums;">72:00:00</p>
              <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">Hours · Minutes · Seconds</p>
            </div>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:24px 48px;border-top:1px solid #27272a;background:#0c0c0e;">
          <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">You are receiving this because you joined the ENICE watchlist at <span style="color:#71717a;">${email}</span>.<br>ENICE Group · Abuja &amp; Kaduna, Nigeria · <a href="https://enicehq.com" style="color:#3b82f6;text-decoration:none;">enicehq.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function oneDayHtml(email: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tomorrow, Everything Changes</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 24px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
        <tr><td style="background:#0f172a;padding:32px 48px;border-bottom:1px solid #1e293b;">
          <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;font-weight:600;">T-MINUS 24 HOURS</p>
          <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;letter-spacing:-0.03em;color:#f8fafc;line-height:1.2;">Tomorrow,<br><span style="color:#3b82f6;">Everything Changes.</span></h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">This is the final reminder. Tomorrow at midnight, the ENICE Group platform goes fully live. The silence ends.</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">You have been with us from the beginning of this countdown. When the curtain lifts at <strong style="color:#f8fafc;">12:00 AM on July 18, 2026</strong>, expect a single notification — the most important one we will ever send you.</p>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a1a1aa;">We will see you on the other side.</p>
          <div style="background:#18181b;border-left:3px solid #3b82f6;border-radius:4px;padding:20px 24px;">
            <p style="margin:0;font-size:13px;line-height:1.7;color:#a1a1aa;font-style:italic;">"Infrastructure is the most powerful form of leverage. It does not ask for attention — it just works, silently, at scale."</p>
            <p style="margin:10px 0 0;font-size:12px;color:#52525b;">— ENICE Group, Founding Principle</p>
          </div>
        </td></tr>
        <tr><td style="padding:24px 48px;border-top:1px solid #27272a;background:#0c0c0e;">
          <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">You are receiving this because you joined the ENICE watchlist at <span style="color:#71717a;">${email}</span>.<br>ENICE Group · Abuja &amp; Kaduna, Nigeria · <a href="https://enicehq.com" style="color:#3b82f6;text-decoration:none;">enicehq.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function launchHtml(email: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>We Are LIVE</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 24px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:48px 48px 40px;border-bottom:1px solid #1e293b;text-align:center;">
          <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#3b82f6;font-weight:700;">ENICE GROUP · LAUNCH DAY</p>
          <h1 style="margin:0;font-size:36px;font-weight:800;letter-spacing:-0.04em;color:#f8fafc;line-height:1.15;">We Are<br><span style="color:#3b82f6;">LIVE.</span></h1>
          <p style="margin:16px 0 0;font-size:14px;color:#64748b;letter-spacing:0.08em;">JULY 18, 2026 · 12:00 AM UTC</p>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">The countdown is over. The ENICE Group platform is officially live.</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a1a1aa;">You are among the first people on earth to receive this message. As a watchlist member, you have priority access to everything we have built — the full venture ecosystem, partner documentation, and our infrastructure roadmap.</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:32px 0;"><tr><td align="center">
            <a href="https://enicehq.com" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.02em;padding:16px 40px;border-radius:8px;">Enter the Platform →</a>
          </td></tr></table>
          <table cellpadding="0" cellspacing="0" style="border:1px solid #27272a;border-radius:8px;overflow:hidden;width:100%;">
            <tr style="border-bottom:1px solid #27272a;">
              <td style="padding:14px 20px;border-right:1px solid #27272a;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#f8fafc;">PulsePay</p>
                <p style="margin:3px 0 0;font-size:11px;color:#52525b;">Virtual Cards &amp; Payment Rails</p>
              </td>
              <td style="padding:14px 20px;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#f8fafc;">PulseAssist</p>
                <p style="margin:3px 0 0;font-size:11px;color:#52525b;">Enterprise AI Engine</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-right:1px solid #27272a;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#f8fafc;">EPulse</p>
                <p style="margin:3px 0 0;font-size:11px;color:#52525b;">Digital Banking Infrastructure</p>
              </td>
              <td style="padding:14px 20px;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#f8fafc;">PulseX</p>
                <p style="margin:3px 0 0;font-size:11px;color:#52525b;">Global Crypto Trading Exchange</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 48px;border-top:1px solid #27272a;background:#0c0c0e;">
          <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">You are receiving this because you joined the ENICE watchlist at <span style="color:#71717a;">${email}</span>.<br>ENICE Group · Abuja &amp; Kaduna, Nigeria · <a href="https://enicehq.com" style="color:#3b82f6;text-decoration:none;">enicehq.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Exported send function ───────────────────────────────────────────────────

export async function sendWatchlistEmails(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

  const resend = new Resend(apiKey);

  const [t1, t2, t3, t4] = await Promise.allSettled([
    // Trigger 1 — immediate confirmation
    resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're on the ENICE Watchlist",
      html: confirmationHtml(email),
    }),
    // Trigger 2 — 3 days before launch
    resend.emails.send({
      from: FROM,
      to: email,
      subject: "3 Days Until We Engineer the Future — ENICE Group",
      html: threeDayHtml(email),
      scheduledAt: LAUNCH_EMAILS.threeDayReminder,
    }),
    // Trigger 3 — 1 day before launch
    resend.emails.send({
      from: FROM,
      to: email,
      subject: "Tomorrow, Everything Changes — ENICE Group",
      html: oneDayHtml(email),
      scheduledAt: LAUNCH_EMAILS.oneDayReminder,
    }),
    // Trigger 4 — exact launch moment
    resend.emails.send({
      from: FROM,
      to: email,
      subject: "ENICE Group Is Live — You Have Early Access",
      html: launchHtml(email),
      scheduledAt: LAUNCH_EMAILS.launchMoment,
    }),
  ]);

  if (t1.status === "rejected") {
    const msg = t1.reason instanceof Error ? t1.reason.message : String(t1.reason);
    throw new Error(`Failed to send confirmation email: ${msg}`);
  }

  return {
    ok: true,
    scheduledReminders: [t2, t3, t4].filter((r) => r.status === "fulfilled").length,
  };
}
