/**
 * AI abstraction layer — public API.
 * Import from here; never import directly from provider files in application code.
 */

export type { AIMessage, AIProvider, AIResponse, ChatRequest, ChatResponse, ChatErrorResponse } from "./types";
export { createAIProvider } from "./factory";
export { SYSTEM_PROMPT } from "./system-prompt";
