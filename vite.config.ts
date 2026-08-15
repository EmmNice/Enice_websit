import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * ─── Dev-mode /api/* bridge ──────────────────────────────────────────────────
 *
 * In production these routes are Vercel serverless functions built from `api-src/`
 * by `npm run build:api`. `vite dev` doesn't run them, so this bridge loads the
 * *same* handler modules through Vite's SSR pipeline and adapts Node's
 * (IncomingMessage, ServerResponse) to the Vercel handler signature.
 *
 * This previously existed as three hand-written middlewares that re-implemented the
 * validation, rate limiting and email logic. They drifted from the real handlers and
 * left `/api/contact` and `/api/ping` returning 404 locally. Delegating instead means
 * dev and production execute identical code, and new endpoints only need a line in
 * API_ROUTES below.
 */

type VercelLikeResponse = ServerResponse & {
  status: (code: number) => VercelLikeResponse;
  json: (payload: unknown) => void;
  send: (payload: unknown) => void;
};

type VercelLikeRequest = IncomingMessage & { body?: unknown; query: Record<string, string> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiHandler = (req: any, res: any) => unknown;

/** Endpoint path → module that default-exports the handler. */
const API_ROUTES: Record<string, string> = {
  "/api/early-access": "/api-src/early-access.ts",
  "/api/admin/early-access": "/api-src/admin/early-access.ts",
  "/api/contact": "/api-src/contact.ts",
  "/api/chat": "/api-src/chat.ts",
  "/api/ping": "/api-src/ping.ts",
};

const MAX_BODY_BYTES = 100 * 1024;

async function readBody(req: IncomingMessage): Promise<string | undefined> {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(buf);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function decorateResponse(res: ServerResponse): VercelLikeResponse {
  const out = res as VercelLikeResponse;
  out.status = (code: number) => {
    out.statusCode = code;
    return out;
  };
  out.json = (payload: unknown) => {
    if (!out.headersSent) out.setHeader("Content-Type", "application/json; charset=utf-8");
    out.end(JSON.stringify(payload));
  };
  out.send = (payload: unknown) => {
    if (typeof payload === "object" && payload !== null) return out.json(payload);
    out.end(String(payload));
  };
  return out;
}

function apiBridgePlugin(): Plugin {
  return {
    name: "enice-dev-api-bridge",
    configureServer(server: ViteDevServer) {
      for (const [route, modulePath] of Object.entries(API_ROUTES)) {
        server.middlewares.use(route, async (req, res, next) => {
          // Only handle an exact match; anything deeper falls through to the SPA.
          const path = (req.url ?? "/").split("?")[0];
          if (path !== "/" && path !== "") return next();

          const response = decorateResponse(res);

          let rawBody: string | undefined;
          try {
            rawBody = await readBody(req);
          } catch {
            response.status(413).json({ ok: false, error: "Request body too large." });
            return;
          }

          const request = req as VercelLikeRequest;
          request.query = Object.fromEntries(
            new URL(req.url ?? "/", "http://localhost").searchParams,
          );
          if (rawBody) {
            // Vercel pre-parses JSON bodies; mirror that so handlers behave identically.
            try {
              request.body = JSON.parse(rawBody);
            } catch {
              request.body = rawBody;
            }
          }

          try {
            // `ssrLoadModule` compiles the TypeScript source on demand. The previous
            // implementation used `await import("./src/.../x.js")`, which only resolved
            // under Bun and threw ERR_MODULE_NOT_FOUND under Node.
            const mod = await server.ssrLoadModule(modulePath);
            const handler = (mod.default ?? mod.handler) as ApiHandler | undefined;
            if (typeof handler !== "function") {
              throw new Error(`${modulePath} does not default-export a handler`);
            }
            await handler(request, response);
          } catch (err) {
            const ref = `DEV${Date.now().toString(36).toUpperCase()}`;
            server.config.logger.error(`[dev-api ${route}:${ref}] ${String(err)}`);
            if (!res.writableEnded) {
              response
                .status(500)
                .json({ ok: false, error: "Local API handler failed. See server logs.", ref });
            }
          }
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tsconfigPaths({ ignoreConfigErrors: true }),
    apiBridgePlugin(),
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    watch: {
      // Exclude the Sanity studio directory from Vite file-watching
      // to avoid ENOSPC (too many file watchers) errors.
      ignored: ["**/studio-enice-group/**", "**/.cache/**"],
    },
  },
  build: {
    // The default 500 kB warning was firing on a single ~854 kB entry chunk. Splitting the
    // stable third-party layers out means a copy change no longer invalidates the vendor
    // bundles in visitors' caches.
    //
    // A function is used rather than the object form because the object form matches only
    // a package's main entry — listing "react-dom" missed `react-dom/client` and produced
    // an empty chunk while React stayed in the entry bundle.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "vendor-react";
          if (/node_modules[\\/]@tanstack[\\/]/.test(id)) return "vendor-tanstack";
          if (/node_modules[\\/](@sanity|@portabletext|groq|get-it)[\\/]/.test(id)) {
            return "vendor-sanity";
          }
          if (/node_modules[\\/]lucide-react[\\/]/.test(id)) return "vendor-icons";
          if (/node_modules[\\/]@radix-ui[\\/]/.test(id)) return "vendor-radix";
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-router",
    ],
  },
});
