/**
 * AI abstraction layer — public API.
 * Import from here; never import directly from provider files in application code.
 */

export type {
  AIMessage,
  AIProvider,
  AIResponse,
  ChatRequest,
  ChatResponse,
  ChatErrorResponse,
} from "./types";
export { createAIProvider } from "./factory";

/*
 * `SYSTEM_PROMPT` is gone with `system-prompt.ts`.
 *
 * It was the visitor-facing chatbot's persona, and the chatbot is now PulseAssist — its knowledge
 * lives in the console as data. The prompt was also where the SOC 2 / NDPC / 99.99% SLA claims
 * removed in #35 were asserted to visitors, and a persona in a source file means a wrong answer
 * needs a deploy.
 *
 * The rest of this module stays: `createAIProvider` is what the CMS's own AI tooling uses
 * (`api-src/lib/ai-manager.ts`), which is a separate concern from talking to customers.
 */
