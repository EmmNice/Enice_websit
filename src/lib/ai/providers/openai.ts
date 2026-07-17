/**
 * OpenAI provider adapter.
 * Compatible with: OpenAI API (gpt-4o, gpt-4o-mini, gpt-4-turbo, o1, etc.)
 *
 * Environment variables:
 *   AI_API_KEY  — OpenAI API key (required)
 *   AI_MODEL    — model ID (default: gpt-4o-mini)
 */

import type { AIMessage, AIProvider, AIResponse } from "../types";

const DEFAULT_MODEL = "gpt-4o-mini";
const BASE_URL = "https://api.openai.com/v1";

interface OpenAIChoice {
  message: { content: string };
}
interface OpenAICompletionResponse {
  model: string;
  choices: OpenAIChoice[];
  error?: { message: string };
}

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
    this.baseUrl = baseUrl || BASE_URL;
  }

  async complete(messages: AIMessage[]): Promise<AIResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[OpenAI] HTTP ${res.status}: ${err}`);
    }

    const data: OpenAICompletionResponse = await res.json();
    if (data.error) throw new Error(`[OpenAI] API error: ${data.error.message}`);

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("[OpenAI] Empty response from API");

    return { text, model: data.model || this.model, provider: "openai" };
  }
}
