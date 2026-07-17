/**
 * Core AI abstraction types.
 * Nothing in the application should import from a specific provider SDK.
 * All provider adapters must conform to these contracts.
 */

// ─── Canonical message format ─────────────────────────────────────────────────

export type AIRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

// ─── Canonical response format ────────────────────────────────────────────────

export interface AIResponse {
  /** The generated text reply. */
  text: string;
  /** The exact model identifier returned by the provider. */
  model: string;
  /** The provider key (matches AI_PROVIDER env value). */
  provider: string;
}

// ─── Provider interface (the single contract every adapter must implement) ────

export interface AIProvider {
  /**
   * Send a conversation to the AI and return a unified response.
   * @param messages Full message history including system prompt as the first entry.
   */
  complete(messages: AIMessage[]): Promise<AIResponse>;
}

// ─── Request/Response schema for POST /api/chat ───────────────────────────────

export interface ChatRequest {
  /** Full conversation history (role/content pairs, newest last). */
  messages: AIMessage[];
}

export interface ChatResponse {
  ok: true;
  text: string;
  model: string;
  provider: string;
}

export interface ChatErrorResponse {
  ok: false;
  error: string;
  ref?: string;
}
