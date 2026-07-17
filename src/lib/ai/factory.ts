/**
 * AI provider factory.
 *
 * Reads environment variables and returns the correctly instantiated provider.
 * Adding a new provider = add one `case` here and one adapter file. Nothing else changes.
 *
 * ── Environment variables ────────────────────────────────────────────────────
 *
 *   AI_PROVIDER   One of: bedrock | openai | anthropic | gemini |
 *                          deepseek | openrouter | grok | custom
 *                 Default: "bedrock"
 *
 *   ── Amazon Bedrock ──────────────────────────────────────────────────────
 *   AI_API_KEY     AWS Access Key ID
 *   AI_API_SECRET  AWS Secret Access Key
 *   AI_REGION      AWS region  (default: us-east-1)
 *   AI_MODEL       Bedrock model ID  (default: amazon.nova-lite-v1:0)
 *                  e.g. "anthropic.claude-3-5-haiku-20241022-v1:0"
 *
 *   ── All other providers ──────────────────────────────────────────────────
 *   AI_API_KEY    API key for the chosen provider.
 *   AI_MODEL      (optional) Override the provider's default model.
 *   AI_BASE_URL   (optional) Override the API base URL (OpenAI-compatible endpoints).
 *
 * ── Swapping providers ───────────────────────────────────────────────────────
 *   Change AI_PROVIDER (and the matching credentials) in your Vercel env vars.
 *   No code changes required.
 */

import type { AIProvider } from "./types";
import { BedrockProvider }          from "./providers/bedrock";
import { OpenAIProvider }           from "./providers/openai";
import { AnthropicProvider }        from "./providers/anthropic";
import { GeminiProvider }           from "./providers/gemini";
import { OpenAICompatibleProvider } from "./providers/openai-compatible";
import { FallbackProvider }         from "./providers/fallback";

export function createAIProvider(): AIProvider {
  const provider  = (process.env.AI_PROVIDER ?? "bedrock").toLowerCase().trim();
  // Accept both AI_API_KEY and AWS_API_KEY (legacy alias)
  const apiKey    = process.env.AI_API_KEY    || process.env.AWS_API_KEY    || "";
  // Accept both AI_API_SECRET and AWS_API_SECRET (legacy alias)
  const apiSecret = process.env.AI_API_SECRET || process.env.AWS_API_SECRET || "";
  const region    = process.env.AI_REGION     ?? "us-east-1";
  const model     = process.env.AI_MODEL      || undefined;
  const baseUrl   = process.env.AI_BASE_URL   || undefined;

  // ── Amazon Bedrock (needs Access Key ID + Secret Access Key) ───────────────
  if (provider === "bedrock" || provider === "aws") {
    if (!apiKey || !apiSecret) {
      console.warn(
        "[AI] Bedrock requires AI_API_KEY (Access Key ID) and AI_API_SECRET (Secret Access Key). " +
        "Using FallbackProvider until credentials are set.",
      );
      return new FallbackProvider();
    }
    return new BedrockProvider(
      apiKey,
      apiSecret,
      region,
      model ?? "amazon.nova-lite-v1:0",
    );
  }

  // ── All other providers — gate on single API key ───────────────────────────
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
          "X-Title":      "ENICE Group",
        },
      );

    // ── Custom / self-hosted OpenAI-compatible endpoint ──────────────────────

    case "custom":
      if (!baseUrl) {
        console.error("[AI] AI_PROVIDER=custom requires AI_BASE_URL to be set.");
        return new FallbackProvider();
      }
      return new OpenAICompatibleProvider(apiKey, baseUrl, model ?? "default", "custom", model);

    default:
      console.error(
        `[AI] Unknown AI_PROVIDER="${provider}". ` +
        `Valid values: bedrock, openai, anthropic, gemini, deepseek, grok, openrouter, custom.`,
      );
      return new FallbackProvider();
  }
}
