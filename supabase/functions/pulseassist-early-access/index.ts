/**
 * POST /functions/v1/pulseassist-early-access
 * Stores a PulseAssist early-access registration and sends a confirmation email.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@4";

const BodySchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid work email address.").max(254),
  businessName: z.string().trim().min(2, "Please enter your business name.").max(160),
  businessType: z.string().trim().min(2, "Please select your business type.").max(80),
  businessNeed: z.string().trim().max(1000).optional().or(z.literal("")),
  // Honeypot — must stay empty.
  website: z.string().max(0).optional().or(z.literal("")),
});

const FROM = "ENICE Group <noreply@enicehq.com>";
const NOTIFY_TO = "corporate@enicehq.com";

// In-memory IP rate limiting (5 requests / 10 min per warm instance).
const rateLimit = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 600_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function confirmationHtml(fullName: string) {
  const firstName = escapeHtml(fullName.split(/\s+/)[0] || "there");
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 24px;"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
    <tr><td style="padding:0 0 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1e3a8a;font-weight:700;">ENICE Group · PulseAssist</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#111827;">You're on the list, ${firstName}.</h1>
    </td></tr>
    <tr><td>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#111827;">
        Thank you for your interest in PulseAssist. We have received your early-access request.
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#374151;">
        Our team reviews every request. We will contact you by email when you are eligible for early access.
        Submitting this form does not grant product access yet.
      </p>
    </td></tr>
    <tr><td style="padding:24px 0 0;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
        ENICE Group · Abuja &amp; Kaduna, Nigeria · corporate@enicehq.com
      </p>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return json({ ok: false, error: "Too many requests. Please try again later." }, 429);
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json({ ok: false, error: "Invalid request body." }, 400);
    }

    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return json({ ok: false, fieldErrors: parsed.error.flatten().fieldErrors }, 400);
    }
    const { fullName, email, businessName, businessType, businessNeed, website } = parsed.data;
    if (website) return json({ ok: true }); // silently accept bots

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { error } = await supabase.from("early_access_registrations").insert({
      product: "PulseAssist",
      full_name: fullName,
      email,
      business_name: businessName,
      business_type: businessType,
      business_need: businessNeed || null,
      source: "enice_website",
      status: "EARLY_ACCESS",
    });

    if (error) {
      if (error.code === "23505") {
        return json(
          {
            ok: false,
            code: "DUPLICATE",
            error: "This email is already on the PulseAssist early-access list.",
          },
          409,
        );
      }
      console.error("[pulseassist-early-access] insert failed:", error);
      return json({ ok: false, error: "We could not save your request. Please try again." }, 500);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const send = (payload: Record<string, unknown>) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }).then(async (r) => {
          if (!r.ok) console.error("[pulseassist-early-access] resend error:", r.status, await r.text());
        });

      await Promise.allSettled([
        send({
          from: FROM,
          to: email,
          subject: "Your PulseAssist early-access request",
          html: confirmationHtml(fullName),
        }),
        send({
          from: FROM,
          to: NOTIFY_TO,
          subject: `PulseAssist Early Access — ${businessName}`,
          html: `<p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Business:</strong> ${escapeHtml(businessName)}</p>
<p><strong>Business type:</strong> ${escapeHtml(businessType)}</p>
<p><strong>Need:</strong> ${escapeHtml(businessNeed || "-")}</p>
<p><strong>Source:</strong> enice_website</p>`,
        }),
      ]);
    } else {
      console.warn("[pulseassist-early-access] RESEND_API_KEY missing — confirmation email skipped.");
    }

    return json({ ok: true });
  } catch (err) {
    console.error("[pulseassist-early-access] unexpected error:", err);
    return json({ ok: false, error: "An unexpected error occurred. Please try again." }, 500);
  }
});
