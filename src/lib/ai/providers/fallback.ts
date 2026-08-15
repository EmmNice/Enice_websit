/**
 * Fallback provider — used when no AI_PROVIDER or AI_API_KEY is configured.
 * Returns a static message so the widget degrades gracefully instead of crashing.
 */

import type { AIMessage, AIProvider, AIResponse } from "../types";

const FALLBACK_TEXT =
  "Thanks for reaching out. A member of our team will follow up shortly. For urgent matters, write to corporate@enicehq.com.";

export class FallbackProvider implements AIProvider {
  async complete(_messages: AIMessage[]): Promise<AIResponse> {
    return { text: FALLBACK_TEXT, model: "fallback", provider: "fallback" };
  }
}
