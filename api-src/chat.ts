/**
 * Vercel serverless function — POST /api/chat
 * Provider-agnostic AI chat endpoint for the ENICE Group chat widget.
 */

import { createAIProvider, SYSTEM_PROMPT } from "../src/lib/ai/index";
import type { AIMessage } from "../src/lib/ai/types";
import {
  clientIp,
  createRateLimiter,
  errorRef,
  parseJsonBody,
  type ApiRequest,
  type ApiResponse,
} from "./lib/http";

const isRateLimited = createRateLimiter(10, 5 * 60 * 1000);

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    if (isRateLimited(clientIp(req))) {
      return res.status(429).json({ ok: false, error: "Too many requests. Please slow down." });
    }

    const body = parseJsonBody(req.body);

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

    const messages: AIMessage[] = [{ role: "system", content: SYSTEM_PROMPT }, ...history];

    const provider = createAIProvider();
    const result = await provider.complete(messages);

    return res
      .status(200)
      .json({ ok: true, text: result.text, model: result.model, provider: result.provider });
  } catch (err) {
    const ref = errorRef("C");
    // Provider adapters embed the upstream HTTP body in their thrown messages, so the
    // detail stays in the server log. The client only ever gets a generic message plus
    // the correlation ref.
    console.error(`[api/chat:${ref}]`, err);
    return res.status(500).json({
      ok: false,
      error: "The assistant is temporarily unavailable. Please try again shortly.",
      ref,
    });
  }
}
