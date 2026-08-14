/**
 * Admin endpoint for PulseAssist early-access registrations.
 * GET  -> list registrations
 * POST -> update a registration status  { id, status }
 * Protected by the ADMIN_PASSWORD secret sent as the `x-admin-password` header.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const STATUSES = [
  "EARLY_ACCESS",
  "UNDER_REVIEW",
  "SELECTED_FOR_BETA",
  "INVITATION_SENT",
  "BETA_USER",
  "REJECTED",
] as const;

const headers = { ...corsHeaders, "x-admin-password": "x-admin-password" };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword) return json({ ok: false, error: "Admin access is not configured." }, 500);
    if (req.headers.get("x-admin-password") !== adminPassword) {
      return json({ ok: false, error: "Invalid password." }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("early_access_registrations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) {
        console.error("[admin-early-access] list failed:", error);
        return json({ ok: false, error: "Could not load registrations." }, 500);
      }
      return json({ ok: true, registrations: data, total: data.length });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      const id = typeof body?.id === "string" ? body.id : "";
      const status = typeof body?.status === "string" ? body.status : "";
      if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) {
        return json({ ok: false, error: "Invalid id or status." }, 400);
      }
      const { error } = await supabase
        .from("early_access_registrations")
        .update({ status })
        .eq("id", id);
      if (error) {
        console.error("[admin-early-access] update failed:", error);
        return json({ ok: false, error: "Could not update status." }, 500);
      }
      return json({ ok: true });
    }

    return json({ ok: false, error: "Method not allowed." }, 405);
  } catch (err) {
    console.error("[admin-early-access] unexpected error:", err);
    return json({ ok: false, error: "An unexpected error occurred." }, 500);
  }
});
