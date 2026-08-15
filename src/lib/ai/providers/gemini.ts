/**
 * Google Gemini provider adapter.
 * Compatible with: gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash, etc.
 *
 * Environment variables:
 *   AI_API_KEY  — Google AI API key (required)
 *   AI_MODEL    — model ID (default: gemini-2.0-flash)
 */

import type { AIMessage, AIProvider, AIResponse } from "../types";

const DEFAULT_MODEL = "gemini-2.0-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiPart {
  text: string;
}
interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}
interface GeminiResponse {
  candidates?: Array<{ content: { parts: GeminiPart[] } }>;
  error?: { message: string };
}

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
  }

  async complete(messages: AIMessage[]): Promise<AIResponse> {
    // Gemini uses "model" instead of "assistant" for the AI role
    // and handles system instructions separately
    const systemMsg = messages.find((m) => m.role === "system");
    const conversationMsgs: GeminiContent[] = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const body: Record<string, unknown> = {
      contents: conversationMsgs,
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    };

    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    const url = `${BASE_URL}/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[Gemini] HTTP ${res.status}: ${err}`);
    }

    const data: GeminiResponse = await res.json();
    if (data.error) throw new Error(`[Gemini] API error: ${data.error.message}`);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("[Gemini] Empty response from API");

    return { text, model: this.model, provider: "gemini" };
  }
}
