/**
 * Vercel serverless function — GET /api/admin/watchlist
 * Returns the list of watchlist sign-ups (Resend Audience contacts).
 * Protected by a shared password sent via the `x-admin-password` header.
 */
import { Resend } from "resend";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReq = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRes = any;

type Contact = {
  id: string;
  email: string;
  created_at: string;
  unsubscribed: boolean;
};

export default async function handler(req: AnyReq, res: AnyRes) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      res.status(500).json({ ok: false, error: "Admin access is not configured." });
      return;
    }

    const supplied = req.headers["x-admin-password"];
    if (supplied !== adminPassword) {
      res.status(401).json({ ok: false, error: "Invalid password." });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!apiKey || !audienceId) {
      res.status(500).json({ ok: false, error: "Watchlist storage is not configured." });
      return;
    }

    const resend = new Resend(apiKey);
    const contacts: Contact[] = [];

    // Resend's contacts.list is not paginated via cursor params in the SDK today —
    // it returns the full audience in one call. Guard defensively in case that
    // changes in the future and a `next` cursor appears in the payload.
    const result = await resend.contacts.list({ audienceId });
    if (result.error) {
      console.error("[admin/watchlist] contacts.list error:", JSON.stringify(result.error));
      res.status(502).json({ ok: false, error: "Could not fetch watchlist from provider." });
      return;
    }

    for (const c of result.data?.data ?? []) {
      contacts.push({
        id: c.id,
        email: c.email,
        created_at: c.created_at,
        unsubscribed: c.unsubscribed,
      });
    }

    contacts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    res.status(200).json({ ok: true, contacts, total: contacts.length });
  } catch (err) {
    console.error("[admin/watchlist] Unexpected error:", err);
    res.status(500).json({ ok: false, error: "An unexpected error occurred." });
  }
}
