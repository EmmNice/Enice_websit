/**
 * Vercel serverless function — POST /api/chat
 * Provider-agnostic AI chat endpoint for the ENICE Group chat widget.
 */

import { createAIProvider, SYSTEM_PROMPT } from "../src/lib/ai/index";
import type { AIMessage } from "../src/lib/ai/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReq = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRes = any;

// ── Rate limiter (10 requests / 5 min per IP) ─────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 300_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: AnyReq, res: AnyRes) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    if (isRateLimited(ip)) {
      return res.status(429).json({ ok: false, error: "Too many requests. Please slow down." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ ok: false, error: "messages array is required." });
    }

    const history: AIMessage[] = (body.messages as unknown[])
      .filter(
        (m): m is { role: string; content: string } =>
          typeof m === "object" &&
          m !== null &&
          typeof (m as Record<string, unknown>).role === "string" &&
          typeof (m as Record<string, unknown>).content === "string",
      )
      .slice(-20)
      .map((m) => ({
        role: (["user", "assistant"].includes(m.role) ? m.role : "user") as AIMessage["role"],
        content: String(m.content).slice(0, 2000),
      }));

    if (history.length === 0) {
      return res.status(400).json({ ok: false, error: "No valid messages provided." });
    }

    const messages: AIMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    const provider = createAIProvider();
    const result = await provider.complete(messages);

    return res.status(200).json({ ok: true, text: result.text, model: result.model, provider: result.provider });
  } catch (err) {
    const ref = `C${Date.now().toString(36).toUpperCase()}`;
    console.error(`[api/chat:${ref}]`, err);
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      ref,
    });
  }
}
