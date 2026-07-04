import { createFileRoute } from "@tanstack/react-router";

// Simple in-memory rate limiter: max 3 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

// Clean up stale entries periodically (every 100 requests)
let cleanupCounter = 0;
function maybeCleanup() {
  if (++cleanupCounter % 100 !== 0) return;
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/api/watchlist")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          // Rate limiting
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            "unknown";
          maybeCleanup();
          if (isRateLimited(ip)) {
            return new Response(
              JSON.stringify({ ok: false, error: "Too many requests. Please try again later." }),
              { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "600" } }
            );
          }

          // Parse + validate
          const body = (await request.json()) as { email?: unknown };
          const email =
            typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
          if (!email || !EMAIL_RE.test(email) || email.length > 320) {
            return new Response(
              JSON.stringify({ ok: false, error: "Please enter a valid email address." }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          // Dynamic import keeps Resend/Node code out of the client bundle entirely.
          // @ts-expect-error — vite-ignore prevents static analysis bundling
          const { sendWatchlistEmails } = await import(/* @vite-ignore */ "@/lib/api/email.server");
          const result = await sendWatchlistEmails(email);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          // Never leak internal error details to the client
          console.error("[watchlist] POST error:", err);
          return new Response(
            JSON.stringify({ ok: false, error: "We could not process your request. Please try again." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
