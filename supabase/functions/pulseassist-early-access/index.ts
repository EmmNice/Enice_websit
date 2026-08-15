/**
 * POST /functions/v1/pulseassist-early-access
 *
 * Records a PulseAssist early-access registration and sends a confirmation email.
 * This is a registration/waitlist endpoint — it never grants product access. `product`,
 * `source` and `status` are set server-side and any client-supplied values are ignored.
 *
 * CSRF: authorization is not cookie-based (this endpoint is intentionally public and
 * unauthenticated), so there is no ambient credential for a cross-site request to abuse.
 * Abuse is controlled by the origin allow-list, the honeypot, and the rate limits below.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@4";
import {
  buildCors,
  clientIp,
  createRateLimiter,
  jsonResponse,
  readJsonBody,
} from "../_shared/http.ts";
import {
  earlyAccessConfirmationHtml,
  earlyAccessNotificationHtml,
  INTERNAL_RECIPIENT,
  sendEmail,
} from "../_shared/email.ts";

const PRODUCT = "PulseAssist";
const INITIAL_STATUS = "EARLY_ACCESS";
const SOURCE = "enice_website";

/** Must stay in sync with BUSINESS_TYPES in src/lib/early-access.ts. */
const BUSINESS_TYPES = [
  "Bank or financial institution",
  "Fintech",
  "Telecom",
  "Insurance",
  "E-commerce or retail",
  "Healthcare",
  "Logistics",
  "Government or public sector",
  "Startup",
  "Other",
] as const;

/**
 * Every field carries an explicit `error` message. Without it, a missing field produced
 * Zod's internal wording ("Invalid input: expected string, received undefined") because a
 * `.min()` message only applies once the value is already a string.
 */
const BodySchema = z.object({
  fullName: z
    .string({ error: "Please enter your full name." })
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Please keep this under 120 characters."),
  email: z
    .string({ error: "Please enter your work email address." })
    .trim()
    .toLowerCase()
    .email("Please enter a valid work email address.")
    .max(254, "Please enter a valid work email address."),
  businessName: z
    .string({ error: "Please enter your business name." })
    .trim()
    .min(2, "Please enter your business name.")
    .max(160, "Please keep this under 160 characters."),
  businessType: z.enum(BUSINESS_TYPES, {
    error: "Please select your business type.",
  }),
  businessNeed: z
    .string()
    .trim()
    .max(1000, "Please keep this under 1000 characters.")
    .optional()
    .default(""),
});

// Two independent limits: one stops a single host hammering the endpoint, the other stops
// the same address being re-submitted repeatedly from rotating IPs.
const ipLimiter = createRateLimiter(5, 10 * 60 * 1000);
const emailLimiter = createRateLimiter(3, 60 * 60 * 1000);

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = buildCors(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405, cors);
  }

  try {
    if (ipLimiter(clientIp(req))) {
      return jsonResponse(
        { ok: false, error: "Too many requests. Please try again later." },
        429,
        cors,
      );
    }

    const parsedBody = await readJsonBody(req);
    if (!parsedBody.ok) {
      const status = parsedBody.reason === "too_large" ? 413 : 400;
      const error =
        parsedBody.reason === "too_large" ? "Request body too large." : "Invalid request body.";
      return jsonResponse({ ok: false, error }, status, cors);
    }
    const raw = (parsedBody.value ?? {}) as Record<string, unknown>;

    // Honeypot is checked BEFORE schema validation. Validating it first leaked a 400 that
    // told a bot exactly which field tripped it; returning a plain 200 without writing
    // anything makes a rejected submission indistinguishable from a successful one.
    if (typeof raw.website === "string" && raw.website.trim() !== "") {
      console.warn("[pulseassist-early-access] honeypot triggered — discarding submission.");
      return jsonResponse({ ok: true }, 200, cors);
    }

    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonResponse(
        {
          ok: false,
          error: "Please correct the highlighted fields.",
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        400,
        cors,
      );
    }
    const { fullName, email, businessName, businessType, businessNeed } = parsed.data;

    if (emailLimiter(email)) {
      return jsonResponse(
        { ok: false, error: "We already received a request for this email. Please check back." },
        429,
        cors,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[pulseassist-early-access] Supabase credentials are not configured.");
      return jsonResponse(
        { ok: false, error: "We could not save your request. Please try again shortly." },
        500,
        cors,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // `product`, `source` and `status` are server-controlled. The table also has RLS
    // enabled with no policies, so only the service role used here can reach it.
    const { error } = await supabase.from("early_access_registrations").insert({
      product: PRODUCT,
      full_name: fullName,
      email,
      business_name: businessName,
      business_type: businessType,
      business_need: businessNeed || null,
      source: SOURCE,
      status: INITIAL_STATUS,
    });

    if (error) {
      // 23505 = unique_violation on early_access_registrations(product, lower(email)).
      if (error.code === "23505") {
        return jsonResponse(
          {
            ok: false,
            code: "DUPLICATE",
            error: "This email is already on the PulseAssist early-access list.",
          },
          409,
          cors,
        );
      }
      console.error("[pulseassist-early-access] insert failed:", error);
      return jsonResponse(
        { ok: false, error: "We could not save your request. Please try again." },
        500,
        cors,
      );
    }

    // Email is best-effort: the registration is already durable, so a delivery failure
    // must not turn into an error the applicant sees.
    await Promise.allSettled([
      sendEmail({
        to: email,
        subject: "Your PulseAssist early-access request",
        html: earlyAccessConfirmationHtml(fullName),
      }),
      sendEmail({
        to: INTERNAL_RECIPIENT,
        subject: `PulseAssist Early Access — ${businessName}`,
        html: earlyAccessNotificationHtml({
          fullName,
          email,
          businessName,
          businessType,
          businessNeed,
        }),
        replyTo: email,
      }),
    ]);

    return jsonResponse({ ok: true }, 200, cors);
  } catch (err) {
    const ref = `EA${Date.now().toString(36).toUpperCase()}`;
    console.error(`[pulseassist-early-access:${ref}]`, err);
    return jsonResponse(
      { ok: false, error: "An unexpected error occurred. Please try again.", ref },
      500,
      cors,
    );
  }
});
