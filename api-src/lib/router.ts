/**
 * A minimal path router for the consolidated CMS functions.
 *
 * ## Why one function instead of one per endpoint
 *
 * Vercel turns each file under `api/` into its own serverless function, and the platform caps
 * how many a project may have. The Website Manager needs roughly sixty endpoints; creating
 * sixty functions would blow past that limit, and every one of them would pay its own cold
 * start and its own database connection.
 *
 * So `api-src/cms.ts` and `api-src/site.ts` are each a single function that routes internally.
 * `vercel.json` rewrites `/api/cms/:path*` onto `/api/cms?path=:path*`, and the sub-path is
 * dispatched here.
 *
 * The router is deliberately tiny — pattern matching on `:params`, no middleware stack, no
 * regex compilation cache. At this scale a linear scan over sixty routes is immeasurable next
 * to a single database round trip, and the alternative would be a framework dependency for
 * something that fits on one screen.
 */

import { parseJsonBody, type ApiRequest, type ApiResponse } from "./http";

/** What a handler receives. `params` are the matched `:segments`. */
export interface RouteContext<TIdentity = unknown> {
  req: ApiRequest;
  res: ApiResponse;
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  /** Parsed JSON body, always an object — never null, so handlers need no guard. */
  body: Record<string, unknown>;
  /** Populated by the caller once authentication has run. */
  identity: TIdentity;
}

export type RouteHandler<TIdentity = unknown> = (
  context: RouteContext<TIdentity>,
) => Promise<unknown> | unknown;

interface CompiledRoute<TIdentity> {
  method: string;
  segments: string[];
  handler: RouteHandler<TIdentity>;
}

/**
 * A route table.
 *
 * Routes are registered as `"GET /content/:id"`. Static segments beat nothing else — the table
 * is scanned in registration order, so a literal route must be registered before a
 * parameterised one that would also match. `/content/slug-available` is declared before
 * `/content/:id` for exactly that reason.
 */
export class Router<TIdentity = unknown> {
  private routes: CompiledRoute<TIdentity>[] = [];

  add(spec: string, handler: RouteHandler<TIdentity>): this {
    const [method, pattern] = spec.split(" ");
    this.routes.push({
      method: method.toUpperCase(),
      segments: pattern.split("/").filter(Boolean),
      handler,
    });
    return this;
  }

  /**
   * Finds the handler for a method and path.
   *
   * Returns `null` for no path match at all, and `"method_mismatch"` when the path exists
   * under a different verb — which lets the caller answer 405 rather than 404, so a wrong verb
   * is immediately obvious instead of looking like a missing endpoint.
   */
  match(
    method: string,
    path: string,
  ):
    | { handler: RouteHandler<TIdentity>; params: Record<string, string> }
    | "method_mismatch"
    | null {
    const parts = path.split("/").filter(Boolean);
    let pathExists = false;

    for (const route of this.routes) {
      if (route.segments.length !== parts.length) continue;

      const params: Record<string, string> = {};
      let matched = true;

      for (let index = 0; index < route.segments.length; index++) {
        const segment = route.segments[index];
        if (segment.startsWith(":")) {
          params[segment.slice(1)] = decodeURIComponent(parts[index]);
        } else if (segment !== parts[index]) {
          matched = false;
          break;
        }
      }
      if (!matched) continue;

      pathExists = true;
      if (route.method === method.toUpperCase()) return { handler: route.handler, params };
    }

    return pathExists ? "method_mismatch" : null;
  }
}

/**
 * Recovers the sub-path and query from a request, across both runtimes.
 *
 * The two environments present the same logical request differently:
 *
 *   - **Vercel**, after the `vercel.json` rewrite, sets `req.url` to
 *     `/api/cms?__route=content/blog` and pre-parses `req.query`.
 *   - **`vite dev`**, where the bridge mounts the handler on a prefix, strips that prefix and
 *     leaves `req.url` as `/content/blog`.
 *
 * Reading the routing parameter first and falling back to prefix-stripping covers both, so
 * handlers see an identical path locally and in production.
 *
 * The parameter is named `__route` rather than the obvious `path` because an endpoint may
 * legitimately take a query parameter of its own called `path` — `/api/site/page?path=/about`
 * does. With both named `path`, `searchParams.get` would return the rewrite's value and the
 * subsequent `delete` would remove the caller's too, so the endpoint would silently receive
 * nothing. Namespacing removes the possibility of that collision entirely.
 */
export const ROUTE_PARAM = "__route";

export function resolveRequestPath(
  req: ApiRequest,
  mountPrefix: string,
): {
  path: string;
  query: URLSearchParams;
} {
  const rawUrl = (req as { url?: string }).url ?? "/";
  // A dummy origin: only the path and search are used, never the host.
  const parsed = new URL(rawUrl, "http://cms.internal");

  const fromQuery = parsed.searchParams.get(ROUTE_PARAM);
  if (fromQuery !== null) {
    // The rewrite's own parameter must not leak into the handler's view of the query string.
    const query = new URLSearchParams(parsed.searchParams);
    query.delete(ROUTE_PARAM);
    return { path: normalizePath(fromQuery), query };
  }

  let path = parsed.pathname;
  if (path.startsWith(mountPrefix)) path = path.slice(mountPrefix.length);

  return { path: normalizePath(path), query: parsed.searchParams };
}

function normalizePath(value: string): string {
  const trimmed = value.replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "/";
}

/** Builds the context handed to a handler. */
export function buildContext<TIdentity>(
  req: ApiRequest,
  res: ApiResponse,
  path: string,
  query: URLSearchParams,
  params: Record<string, string>,
  identity: TIdentity,
): RouteContext<TIdentity> {
  return {
    req,
    res,
    method: (req.method ?? "GET").toUpperCase(),
    path,
    params,
    query,
    body: parseJsonBody(req.body),
    identity,
  };
}

// ─── Typed failures ──────────────────────────────────────────────────────────

/**
 * An error carrying an HTTP status.
 *
 * Handlers throw these instead of writing responses, so every route's failure path converges
 * on one place in `cms.ts`. That is what guarantees a consistent JSON error shape and that an
 * unexpected exception can never leak a stack trace to the client.
 */
export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly code = "error",
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function badRequest(message: string, details?: unknown): HttpError {
  return new HttpError(400, message, "bad_request", details);
}

export function notFound(what = "That item"): HttpError {
  return new HttpError(404, `${what} could not be found.`, "not_found");
}

export function conflict(message: string): HttpError {
  return new HttpError(409, message, "conflict");
}

// ─── Input helpers ───────────────────────────────────────────────────────────

/** Reads a required string field, rejecting blanks with a field-specific message. */
export function requiredString(
  body: Record<string, unknown>,
  field: string,
  label = field,
): string {
  const value = body[field];
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`${label} is required.`);
  }
  return value.trim();
}

/** Reads an optional string, treating absent, null and non-string alike as undefined. */
export function optionalString(body: Record<string, unknown>, field: string): string | undefined {
  const value = body[field];
  return typeof value === "string" ? value : undefined;
}

/** Reads a bounded integer from the query string. */
export function intParam(
  query: URLSearchParams,
  key: string,
  fallback: number,
  max: number,
): number {
  const raw = Number(query.get(key));
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(Math.max(Math.trunc(raw), 0), max);
}

/** Validates that a value belongs to a closed set, naming the alternatives when it does not. */
export function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value))
    return value as T;
  throw badRequest(`${label} must be one of: ${allowed.join(", ")}.`);
}
