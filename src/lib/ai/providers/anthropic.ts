/**
 * Anthropic Claude provider adapter.
 * Compatible with: claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus, etc.
 *
 * Environment variables:
 *   AI_API_KEY  — Anthropic API key (required)
 *   AI_MODEL    — model ID (default: claude-3-5-haiku-20241022)
 */

import type { AIMessage, AIProvider, AIResponse } from "../types";

const DEFAULT_MODEL = "claude-3-5-haiku-20241022";
const BASE_URL = "https://api.anthropic.com/v1";
const ANTHROPIC_VERSION = "2023-06-01";

interface AnthropicContent {
  type: "text";
  text: string;
}
interface AnthropicResponse {
  model: string;
  content: AnthropicContent[];
  error?: { message: string };
}

export class AnthropicProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
  }

  async complete(messages: AIMessage[]): Promise<AIResponse> {
    // Anthropic separates the system prompt from the messages array
    const systemMsg = messages.find((m) => m.role === "system");
    const conversationMsgs = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const res = await fetch(`${BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        system: systemMsg?.content,
        messages: conversationMsgs,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[Anthropic] HTTP ${res.status}: ${err}`);
    }

    const data: AnthropicResponse = await res.json();
    if (data.error) throw new Error(`[Anthropic] API error: ${data.error.message}`);

    const text = data.content?.find((b) => b.type === "text")?.text?.trim();
    if (!text) throw new Error("[Anthropic] Empty response from API");

    return { text, model: data.model || this.model, provider: "anthropic" };
  }
}
