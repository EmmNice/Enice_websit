/**
 * Shared HTTP helpers for ENICE Edge Functions.
 *
 * Directories prefixed with `_` are bundled with each function but are not themselves
 * deployed as endpoints, so this is the supported place for common code.
 */
import { corsHeaders as supabaseCorsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Browser origins permitted to call these functions.
 *
 * Restricting this stops third-party sites from wiring their own forms up to our
 * endpoints. It is defence in depth, not a primary control: CORS is enforced by browsers
 * only, so the real protections are the rate limits, honeypot and server-side validation
 * below. Anything unrecognised simply receives no `Access-Control-Allow-Origin` header.
 */
const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/(www\.)?enicehq\.com$/,
  // Vercel preview and production aliases for this project.
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  // Local development (`vite dev` binds :5000, but keep any port).
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

/**
 * Builds CORS headers for a request. `extraHeaders` adds to the request-header allow-list
 * (Supabase's canonical list covers apikey/authorization/content-type and tracing).
 */
export function buildCors(req: Request, extraHeaders: string[] = []): Record<string, string> {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = { ...supabaseCorsHeaders };

  if (extraHeaders.length > 0) {
    const base = headers["Access-Control-Allow-Headers"] ?? "";
    headers["Access-Control-Allow-Headers"] = [base, ...extraHeaders].filter(Boolean).join(", ");
  }

  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin as string;
    headers["Vary"] = "Origin";
  } else {
    delete headers["Access-Control-Allow-Origin"];
  }

  return headers;
}

export function jsonResponse(
  body: unknown,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * Fixed-window counter. State is per warm instance and lost on cold start, which is
 * enough to blunt casual abuse but not a distributed limiter — move to Upstash/Redis if
 * these endpoints ever need a hard guarantee.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function isLimited(key: string): boolean {
    const now = Date.now();

    // Opportunistic sweep so the map cannot grow without bound on a long-lived instance.
    if (hits.size > 5_000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }

    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    if (entry.count >= limit) return true;
    entry.count++;
    return false;
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Constant-time string comparison. A plain `!==` leaks a shared secret through response
 * timing one character at a time.
 */
export function secretsMatch(supplied: string | null, expected: string): boolean {
  if (typeof supplied !== "string") return false;
  const a = new TextEncoder().encode(supplied);
  const b = new TextEncoder().encode(expected);
  // Compare over a fixed width so a length mismatch is not itself a timing signal.
  const width = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < width; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

const MAX_BODY_BYTES = 16 * 1024;

/** Reads and parses a JSON body, rejecting oversized payloads before parsing. */
export async function readJsonBody(
  req: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; reason: "too_large" | "invalid" }> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { ok: false, reason: "too_large" };
  }

  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, reason: "invalid" };
  }
  // content-length can be absent or wrong; enforce on the actual bytes too.
  if (text.length > MAX_BODY_BYTES) return { ok: false, reason: "too_large" };

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
