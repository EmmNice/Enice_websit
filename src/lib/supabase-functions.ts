/**
 * Minimal client for invoking Supabase Edge Functions over plain `fetch`.
 *
 * Why not `@supabase/supabase-js`? Importing the SDK purely to POST a form pulled a
 * ~217 kB (57 kB gzip) chunk into the product pages. These endpoints are ordinary HTTP
 * JSON, so the SDK bought us nothing but weight. This module keeps the same request
 * shape the SDK produced (verified against the deployed gateway) at zero bundle cost.
 *
 * Only the publishable key is used here. It is designed to be public and is safe to ship
 * to the browser — every Edge Function performs its own authorization server-side, and
 * the `early_access_registrations` table has RLS enabled with no policies, so it is
 * reachable exclusively by the service role from inside a function.
 */

const FUNCTIONS_TIMEOUT_MS = 15_000;

function readEnv(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

export type FunctionResult<T> =
  | { kind: "ok"; status: number; data: T }
  | { kind: "error"; status: number; data: unknown }
  /** Network failure, timeout, or missing configuration — the request never completed. */
  | { kind: "unreachable"; status: 0; data: null };

/**
 * Invokes an Edge Function and always resolves. Non-2xx responses come back as
 * `kind: "error"` with the parsed body so callers can branch on the status code and
 * server-supplied error contract instead of catching thrown exceptions.
 */
export async function invokeFunction<T>(
  name: string,
  init: { method?: "GET" | "POST"; body?: unknown; headers?: Record<string, string> } = {},
): Promise<FunctionResult<T>> {
  const env = readEnv();
  if (!env) {
    console.error(
      "[supabase-functions] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are not set.",
    );
    return { kind: "unreachable", status: 0, data: null };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FUNCTIONS_TIMEOUT_MS);

  try {
    const res = await fetch(`${env.url}/functions/v1/${name}`, {
      method: init.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.key,
        ...init.headers,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
    });

    // A platform-level failure (gateway error page, cold-start crash) can return HTML.
    // Parsing defensively keeps raw markup from ever surfacing in the UI.
    let parsed: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }

    if (!res.ok) return { kind: "error", status: res.status, data: parsed };
    return { kind: "ok", status: res.status, data: parsed as T };
  } catch {
    // Includes AbortError from the timeout above.
    return { kind: "unreachable", status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}
