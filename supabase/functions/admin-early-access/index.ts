/**
 * Admin endpoint for PulseAssist early-access registrations.
 *   GET  -> list registrations
 *   POST -> update one registration's status  { id, status }
 *
 * Authorized by the ADMIN_PASSWORD secret in the `x-admin-password` header.
 *
 * CSRF: the credential is a custom request header, not a cookie. A cross-site form cannot
 * set custom headers, and any fetch that tries triggers a CORS preflight which the origin
 * allow-list rejects — so there is no ambient authority for an attacker to ride on.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  buildCors,
  clientIp,
  createRateLimiter,
  jsonResponse,
  readJsonBody,
  secretsMatch,
} from "../_shared/http.ts";

/**
 * The only statuses an operator may assign. A value outside this list is rejected, so the
 * column can never hold an unknown state.
 */
const STATUSES = [
  "EARLY_ACCESS",
  "UNDER_REVIEW",
  "SELECTED_FOR_BETA",
  "INVITATION_SENT",
  "BETA_USER",
  "REJECTED",
] as const;

type Status = (typeof STATUSES)[number];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Brute-force guard on the shared password.
const authLimiter = createRateLimiter(10, 15 * 60 * 1000);

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = buildCors(req, ["x-admin-password"]);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword) {
      console.error(
        "[admin-early-access] ADMIN_PASSWORD is not set. Configure it with: " +
          "supabase secrets set ADMIN_PASSWORD=<value>",
      );
      return jsonResponse(
        {
          ok: false,
          error: "Admin access is not configured. The ADMIN_PASSWORD secret is missing.",
        },
        500,
        cors,
      );
    }

    const ip = clientIp(req);
    if (authLimiter(ip)) {
      return jsonResponse(
        { ok: false, error: "Too many attempts. Please try again later." },
        429,
        cors,
      );
    }

    if (!secretsMatch(req.headers.get("x-admin-password"), adminPassword)) {
      return jsonResponse({ ok: false, error: "Invalid password." }, 401, cors);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[admin-early-access] Supabase credentials are not configured.");
      return jsonResponse({ ok: false, error: "Storage is not configured." }, 500, cors);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("early_access_registrations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) {
        console.error("[admin-early-access] list failed:", error);
        return jsonResponse({ ok: false, error: "Could not load registrations." }, 500, cors);
      }
      return jsonResponse(
        { ok: true, registrations: data ?? [], total: data?.length ?? 0 },
        200,
        cors,
      );
    }

    if (req.method === "POST") {
      const parsedBody = await readJsonBody(req);
      if (!parsedBody.ok) {
        return jsonResponse({ ok: false, error: "Invalid request body." }, 400, cors);
      }
      const body = (parsedBody.value ?? {}) as Record<string, unknown>;

      const id = typeof body.id === "string" ? body.id : "";
      const status = typeof body.status === "string" ? body.status : "";

      if (!UUID_RE.test(id)) {
        return jsonResponse({ ok: false, error: "Invalid registration id." }, 400, cors);
      }
      if (!STATUSES.includes(status as Status)) {
        return jsonResponse(
          { ok: false, error: `Invalid status. Expected one of: ${STATUSES.join(", ")}.` },
          400,
          cors,
        );
      }

      // Only `status` is writable here; the applicant's submitted data is immutable.
      const { data, error } = await supabase
        .from("early_access_registrations")
        .update({ status })
        .eq("id", id)
        .select("id");

      if (error) {
        console.error("[admin-early-access] update failed:", error);
        return jsonResponse({ ok: false, error: "Could not update status." }, 500, cors);
      }
      if (!data || data.length === 0) {
        return jsonResponse({ ok: false, error: "Registration not found." }, 404, cors);
      }
      return jsonResponse({ ok: true, id, status }, 200, cors);
    }

    return jsonResponse({ ok: false, error: "Method not allowed." }, 405, cors);
  } catch (err) {
    const ref = `AD${Date.now().toString(36).toUpperCase()}`;
    console.error(`[admin-early-access:${ref}]`, err);
    return jsonResponse({ ok: false, error: "An unexpected error occurred.", ref }, 500, cors);
  }
});
