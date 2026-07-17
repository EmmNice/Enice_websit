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

// ── AWS SigV4 helpers (Web Crypto — no SDK) ───────────────────────────────────

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(data: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data),
  );
  return toHex(hash);
}

async function hmacSHA256(
  key: ArrayBuffer | Uint8Array,
  data: string,
): Promise<ArrayBuffer> {
  const raw = key instanceof Uint8Array ? key.buffer : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function deriveSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kSecret = new TextEncoder().encode("AWS4" + secretKey);
  const kDate    = await hmacSHA256(kSecret, dateStamp);
  const kRegion  = await hmacSHA256(kDate, region);
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
  const amzDate  = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = await sha256Hex(opts.body);

  // Canonical headers (must be sorted, lower-cased)
  const canonicalHeaders =
    `content-type:application/json\n` +
    `host:${opts.host}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = "content-type;host;x-amz-date";

  const canonicalRequest = [
    opts.method,
    opts.path,
    "",                  // no query string
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
    "Content-Type":  "application/json",
    "x-amz-date":    amzDate,
    "Authorization": authHeader,
  };
}

// ── Bedrock Converse API types ────────────────────────────────────────────────

interface BedrockContentBlock  { text: string }
interface BedrockMessage       { role: "user" | "assistant"; content: BedrockContentBlock[] }
interface BedrockConverseBody  {
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
  private readonly accessKeyId:     string;
  private readonly secretAccessKey: string;
  private readonly region:          string;
  private readonly modelId:         string;

  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    region  = "us-east-1",
    modelId = "amazon.nova-lite-v1:0",
  ) {
    this.accessKeyId     = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region          = region;
    this.modelId         = modelId;
  }

  async complete(messages: AIMessage[]): Promise<AIResponse> {
    // Separate system messages from conversation turns
    const systemMessages = messages.filter((m) => m.role === "system");
    const turns          = messages.filter((m) => m.role !== "system");

    // Bedrock Converse requires first turn to be "user"
    // (our API always prepends system then user, so this should hold naturally)
    const bedrockMessages: BedrockMessage[] = turns.map((m) => ({
      role:    m.role as "user" | "assistant",
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
    const host    = `bedrock-runtime.${this.region}.amazonaws.com`;
    const path    = `/model/${encodeURIComponent(this.modelId)}/converse`;
    const url     = `https://${host}${path}`;

    const headers = await signRequest({
      method:          "POST",
      host,
      path,
      region:          this.region,
      service:         "bedrock",
      accessKeyId:     this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      body:            bodyStr,
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
