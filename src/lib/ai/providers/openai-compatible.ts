/**
 * OpenAI-compatible provider adapter.
 * Many providers (DeepSeek, Grok/xAI, OpenRouter, Together AI, Fireworks, etc.)
 * expose an OpenAI-compatible `/chat/completions` endpoint.
 * This base adapter covers all of them — subclasses only set the base URL, default
 * model, and provider label.
 */

import type { AIMessage, AIProvider, AIResponse } from "../types";

interface OAIChoice {
  message: { content: string };
}
interface OAIResponse {
  model: string;
  choices: OAIChoice[];
  error?: { message: string };
}

export class OpenAICompatibleProvider implements AIProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly defaultModel: string,
    private readonly providerLabel: string,
    private readonly model?: string,
    /** Extra headers some providers require (e.g. OpenRouter's HTTP-Referer). */
    private readonly extraHeaders: Record<string, string> = {},
  ) {}

  async complete(messages: AIMessage[]): Promise<AIResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...this.extraHeaders,
      },
      body: JSON.stringify({
        model: this.model || this.defaultModel,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[${this.providerLabel}] HTTP ${res.status}: ${err}`);
    }

    const data: OAIResponse = await res.json();
    if (data.error) {
      throw new Error(`[${this.providerLabel}] API error: ${data.error.message}`);
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error(`[${this.providerLabel}] Empty response from API`);

    return { text, model: data.model || this.model || this.defaultModel, provider: this.providerLabel };
  }
}
