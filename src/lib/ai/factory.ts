/**
 * AI provider factory.
 *
 * Reads environment variables and returns the correctly instantiated provider.
 * Adding a new provider = add one `case` here and one adapter file. Nothing else changes.
 *
 * ── Environment variables ────────────────────────────────────────────────────
 *
 *   AI_PROVIDER   One of: openai | anthropic | gemini | deepseek | openrouter | grok
 *                 Default: "openai" (falls back to FallbackProvider if no key set)
 *
 *   AI_API_KEY    API key for the chosen provider. Required for live responses.
 *
 *   AI_MODEL      (optional) Override the provider's default model.
 *                 e.g. "gpt-4o", "claude-3-opus-20240229", "gemini-1.5-pro"
 *
 *   AI_BASE_URL   (optional) Override the API base URL (useful for self-hosted
 *                 or proxy endpoints that are OpenAI-compatible).
 */

import type { AIProvider } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { OpenAICompatibleProvider } from "./providers/openai-compatible";
import { FallbackProvider } from "./providers/fallback";

export function createAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase().trim();
  const apiKey = process.env.AI_API_KEY ?? "";
  const model = process.env.AI_MODEL || undefined;
  const baseUrl = process.env.AI_BASE_URL || undefined;

  if (!apiKey) {
    console.warn(
      `[AI] No AI_API_KEY set — using FallbackProvider. ` +
      `Set AI_PROVIDER and AI_API_KEY to enable live responses.`,
    );
    return new FallbackProvider();
  }

  switch (provider) {
    // ── Native implementations ───────────────────────────────────────────────

    case "openai":
      return new OpenAIProvider(apiKey, model, baseUrl);

    case "anthropic":
    case "claude":
      return new AnthropicProvider(apiKey, model);

    case "gemini":
    case "google":
      return new GeminiProvider(apiKey, model);

    // ── OpenAI-compatible providers ──────────────────────────────────────────

    case "deepseek":
      return new OpenAICompatibleProvider(
        apiKey,
        baseUrl ?? "https://api.deepseek.com/v1",
        "deepseek-chat",
        "deepseek",
        model,
      );

    case "grok":
    case "xai":
      return new OpenAICompatibleProvider(
        apiKey,
        baseUrl ?? "https://api.x.ai/v1",
        "grok-3-mini",
        "grok",
        model,
      );

    case "openrouter":
      return new OpenAICompatibleProvider(
        apiKey,
        baseUrl ?? "https://openrouter.ai/api/v1",
        "openai/gpt-4o-mini",
        "openrouter",
        model,
        // OpenRouter recommends these headers for usage tracking
        {
          "HTTP-Referer": "https://enicehq.com",
          "X-Title": "ENICE Group",
        },
      );

    // ── Custom / self-hosted OpenAI-compatible endpoint ──────────────────────

    case "custom":
      if (!baseUrl) {
        console.error("[AI] AI_PROVIDER=custom requires AI_BASE_URL to be set.");
        return new FallbackProvider();
      }
      return new OpenAICompatibleProvider(
        apiKey,
        baseUrl,
        model ?? "default",
        "custom",
        model,
      );

    default:
      console.error(
        `[AI] Unknown AI_PROVIDER="${provider}". ` +
        `Valid values: openai, anthropic, gemini, deepseek, grok, openrouter, custom.`,
      );
      return new FallbackProvider();
  }
}
