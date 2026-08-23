/**
 * Vercel serverless function — POST /api/chat
 * Provider-agnostic AI chat endpoint for the ENICE Group chat widget.
 */

import { createAIProvider, SYSTEM_PROMPT } from "../src/lib/ai/index";
import type { AIMessage } from "../src/lib/ai/types";
import { ensureMigrated, isDatabaseConfigured } from "./lib/db";
import { retrieveForChat } from "./lib/repo/knowledge";
import {
  clientIp,
  createRateLimiter,
  errorRef,
  parseJsonBody,
  type ApiRequest,
  type ApiResponse,
} from "./lib/http";

const isRateLimited = createRateLimiter(10, 5 * 60 * 1000);

/**
 * Builds the system prompt for a turn, grounding it in the curated knowledge base.
 *
 * The static `SYSTEM_PROMPT` is the assistant's persona and baseline facts. On top of it we add
 * the knowledge-base entries most relevant to what the visitor just asked, so the site owner can
 * teach the assistant new facts without a code change.
 *
 * This must never break the widget. If the database is not configured, is unreachable, or holds
 * nothing relevant, the assistant simply answers from the static prompt alone — exactly as it did
 * before the knowledge base existed. Every failure here is swallowed for that reason.
 */
async function buildSystemPrompt(history: AIMessage[]): Promise<string> {
  if (!isDatabaseConfigured()) return SYSTEM_PROMPT;

  try {
    // The chat function is separate from the admin API, so the knowledge table may not have been
    // created yet on a brand-new database. Running migrations here makes the endpoint
    // self-sufficient; it is memoised per instance, so this is cheap after the first call.
    await ensureMigrated();

    const latestQuestion = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
    const entries = await retrieveForChat(latestQuestion);
    if (entries.length === 0) return SYSTEM_PROMPT;

    const block = entries
      .map((entry, i) => `[${i + 1}] ${entry.title || "Untitled"}\n${entry.body}`)
      .join("\n\n");

    return `${SYSTEM_PROMPT}

---

# CURATED KNOWLEDGE
The following facts have been provided by ENICE Group specifically to inform your answers. Treat
them as authoritative: when they add to or conflict with anything above, prefer them. Do not
mention "the knowledge base" or that this information was supplied to you — simply answer from it.

${block}`;
  } catch (err) {
    // Retrieval is best-effort. Log for diagnosis, then answer from the static prompt.
    console.error("[api/chat] knowledge retrieval skipped:", err);
    return SYSTEM_PROMPT;
  }
}

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

    const systemPrompt = await buildSystemPrompt(history);
    const messages: AIMessage[] = [{ role: "system", content: systemPrompt }, ...history];

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
