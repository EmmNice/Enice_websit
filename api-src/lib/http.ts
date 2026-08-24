/**
 * Minimal request/response contract for the Vercel serverless handlers.
 *
 * Vercel injects Node's `IncomingMessage`/`ServerResponse` augmented with a body parser and
 * the Express-style `status().json()` helpers. Rather than depending on `@vercel/node` just
 * for two interfaces, this describes exactly the surface these handlers use — which also
 * keeps the Vite dev bridge (see vite.config.ts) honest about what it has to provide.
 */

export interface ApiRequest {
  method?: string;
  /** Pre-parsed by Vercel when the content type is JSON; a raw string otherwise. */
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(payload: unknown): void;
  headersSent?: boolean;
  /**
   * Both Vercel's response object and the dev bridge's decorated `ServerResponse` inherit this
   * from Node, so it is safe to require. The Website Manager needs it to issue `Set-Cookie` for
   * session and CSRF cookies, and `Cache-Control` on public content responses.
   */
  setHeader(name: string, value: string | string[]): void;
  /**
   * Writes a raw body. Inherited from Node by both Vercel's response and the dev bridge's
   * decorated `ServerResponse`, so it is safe to require. Needed for responses that are not
   * JSON — the sitemap is XML.
   */
  end(body?: string): void;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void> | void;

/** Resolves the caller's IP from the proxy chain, preferring the first hop. */
export function clientIp(req: ApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const fromHeader = typeof first === "string" ? first.split(",")[0]?.trim() : undefined;
  return fromHeader || req.socket?.remoteAddress || "unknown";
}

/** Reads a header as a single string, collapsing the array form Node can produce. */
export function header(req: ApiRequest, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Normalises a request body to a plain object. Vercel parses JSON for us, but the dev
 * bridge and non-JSON content types can both yield a string.
 */
export function parseJsonBody(body: unknown): Record<string, unknown> {
  if (typeof body === "string") {
    try {
      const parsed: unknown = JSON.parse(body);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (body && typeof body === "object") return body as Record<string, unknown>;
  return {};
}

/** Fixed-window rate limiter shared by the public endpoints. */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function isLimited(key: string): boolean {
    const now = Date.now();

    // Opportunistic sweep so the map cannot grow without bound on a long-lived instance.
    if (hits.size > 5_000) {
      for (const [k, entry] of hits) if (now > entry.resetAt) hits.delete(k);
    }

    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    if (entry.count >= max) return true;
    entry.count++;
    return false;
  };
}

/**
 * Brute-force guard that counts only failed attempts, so a legitimate operator working
 * normally never approaches the limit. Separate from `createRateLimiter`, which counts
 * every request.
 */
export function createAttemptLimiter(max: number, windowMs: number) {
  const attempts = new Map<string, { count: number; resetAt: number }>();

  return {
    isLocked(key: string): boolean {
      const entry = attempts.get(key);
      if (!entry || Date.now() > entry.resetAt) return false;
      return entry.count >= max;
    },
    recordFailure(key: string): void {
      const now = Date.now();
      const entry = attempts.get(key);
      if (!entry || now > entry.resetAt) {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return;
      }
      entry.count++;
    },
  };
}

/** Escapes text for safe interpolation into an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Short correlation id included in error responses so a report maps to a log line. */
export function errorRef(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}
