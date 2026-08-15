/**
 * Amazon Bedrock provider — AWS Signature V4, native fetch, zero dependencies.
 *
 * Uses the Bedrock Converse API (unified across all models).
 * Default model: amazon.nova-lite-v1:0 (fast, cheap, no access-approval needed).
 *
 * Env vars consumed by the factory:
 *   AI_PROVIDER   = bedrock
 *   AI_API_KEY    = your AWS Access Key ID
 *   AI_API_SECRET = your AWS Secret Access Key
 *   AI_REGION     = AWS region (default: us-east-1)
 *   AI_MODEL      = Bedrock model ID (optional override)
 */

import type { AIMessage, AIProvider, AIResponse } from "../types";

// Use the Web Crypto global — available in Node.js 18+ (stable in 20+),
// Vercel Edge Runtime, and all modern browsers.  Avoids a module-level
// crash on runtimes where `import { webcrypto } from "node:crypto"` may
// resolve but `webcrypto` is undefined (e.g. Node 14/16 or restricted envs).
function getSubtle(): SubtleCrypto {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error(
    "[BedrockProvider] Web Crypto API (globalThis.crypto.subtle) is not available " +
      "in this runtime. Ensure Node.js >= 18 is being used.",
  );
}

// ── AWS SigV4 helpers (Web Crypto — no SDK) ───────────────────────────────────

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(data: string): Promise<string> {
  const hash = await getSubtle().digest("SHA-256", new TextEncoder().encode(data));
  return toHex(hash);
}

async function hmacSHA256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  // Pass key directly — both Uint8Array and ArrayBuffer are valid BufferSource.
  // Using key.buffer on a Uint8Array can reference a larger shared buffer in some
  // Node.js builds (e.g. Vercel's runtime), corrupting the HMAC with extra bytes.
  const subtle = getSubtle();
  const cryptoKey = await subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function deriveSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kSecret = new TextEncoder().encode("AWS4" + secretKey);
  const kDate = await hmacSHA256(kSecret, dateStamp);
  const kRegion = await hmacSHA256(kDate, region);
  const kService = await hmacSHA256(kRegion, service);
  return hmacSHA256(kService, "aws4_request");
}

// ── SigV4 request signer ──────────────────────────────────────────────────────

async function signRequest(opts: {
  method: string;
  host: string;
  path: string;
  region: string;
  service: string;
  accessKeyId: string;
  secretAccessKey: string;
  body: string;
}): Promise<Record<string, string>> {
  const now = new Date();
  const amzDate =
    now
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")
      .slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = await sha256Hex(opts.body);

  // Canonical headers (must be sorted, lower-cased)
  const canonicalHeaders =
    `content-type:application/json\n` + `host:${opts.host}\n` + `x-amz-date:${amzDate}\n`;

  const signedHeaders = "content-type;host;x-amz-date";

  // Per AWS SigV4 spec, each path segment must be URI-encoded (unreserved chars exempt).
  // The colon in model IDs like "amazon.nova-lite-v1:0" must be encoded as %3A here,
  // even though the actual HTTP URL can carry the raw colon.
  const canonicalUri = opts.path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");

  const canonicalRequest = [
    opts.method,
    canonicalUri,
    "", // no query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${opts.region}/${opts.service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await deriveSigningKey(
    opts.secretAccessKey,
    dateStamp,
    opts.region,
    opts.service,
  );
  const signature = toHex(await hmacSHA256(signingKey, stringToSign));

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${opts.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    "Content-Type": "application/json",
    "x-amz-date": amzDate,
    Authorization: authHeader,
  };
}

// ── Bedrock Converse API types ────────────────────────────────────────────────

interface BedrockContentBlock {
  text: string;
}
interface BedrockMessage {
  role: "user" | "assistant";
  content: BedrockContentBlock[];
}
interface BedrockConverseBody {
  messages: BedrockMessage[];
  system?: { text: string }[];
  inferenceConfig?: { maxTokens?: number; temperature?: number };
}

interface BedrockConverseResponse {
  output?: { message?: { content?: BedrockContentBlock[] } };
  usage?: { inputTokens: number; outputTokens: number };
}

// ── Provider class ────────────────────────────────────────────────────────────

export class BedrockProvider implements AIProvider {
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly region: string;
  private readonly modelId: string;

  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    region = "us-east-1",
    modelId = "amazon.nova-lite-v1:0",
  ) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
    this.modelId = modelId;
  }

  async complete(messages: AIMessage[]): Promise<AIResponse> {
    // Separate system messages from conversation turns
    const systemMessages = messages.filter((m) => m.role === "system");
    const turns = messages.filter((m) => m.role !== "system");

    // Bedrock Converse requires the conversation to start with a "user" message.
    // Drop any leading assistant turns (e.g. a synthetic greeting prepended by
    // the frontend) so we never violate this constraint.
    const userFirstTurns = turns.slice(turns.findIndex((m) => m.role === "user"));

    const bedrockMessages: BedrockMessage[] = (
      userFirstTurns.length > 0 ? userFirstTurns : turns
    ).map((m) => ({
      role: m.role as "user" | "assistant",
      content: [{ text: m.content }],
    }));

    const body: BedrockConverseBody = {
      messages: bedrockMessages,
      inferenceConfig: { maxTokens: 1024, temperature: 0.7 },
    };

    if (systemMessages.length > 0) {
      body.system = systemMessages.map((m) => ({ text: m.content }));
    }

    const bodyStr = JSON.stringify(body);
    const host = `bedrock-runtime.${this.region}.amazonaws.com`;
    // Do NOT use encodeURIComponent — Bedrock model IDs contain colons and dots
    // that AWS expects unencoded in the URL path (e.g. amazon.nova-lite-v1:0)
    const path = `/model/${this.modelId}/converse`;
    const url = `https://${host}${path}`;

    const headers = await signRequest({
      method: "POST",
      host,
      path,
      region: this.region,
      service: "bedrock",
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      body: bodyStr,
    });

    const res = await fetch(url, { method: "POST", headers, body: bodyStr });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`[BedrockProvider] HTTP ${res.status}: ${errText}`);
    }

    const data: BedrockConverseResponse = await res.json();
    const text = data.output?.message?.content?.[0]?.text ?? "";

    if (!text) throw new Error("[BedrockProvider] Empty response from Bedrock.");

    return { text, model: this.modelId, provider: "bedrock" };
  }
}
