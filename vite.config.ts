import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const devWatchlistEmails = new Set<string>();

function watchlistDevPlugin(): Plugin {
  return {
    name: "watchlist-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/watchlist", async (req, res, next) => {
        if (req.method !== "POST") return next();

        // Rate limit (3 per IP per 10 min)
        const ip =
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
          "unknown";
        const now = Date.now();
        const entry = rateLimitMap.get(ip);
        if (!entry || now > entry.resetAt) {
          rateLimitMap.set(ip, { count: 1, resetAt: now + 600_000 });
        } else if (entry.count >= 3) {
          res.writeHead(429, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Too many requests. Please try again later." }));
          return;
        } else {
          entry.count++;
        }

        // Parse body
        let raw = "";
        for await (const chunk of req) raw += chunk;
        let email = "";
        try {
          const body = JSON.parse(raw);
          email =
            typeof body.email === "string"
              ? body.email.trim().toLowerCase()
              : "";
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Invalid request body." }));
          return;
        }

        if (!email || !EMAIL_RE.test(email) || email.length > 320) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Please enter a valid email address." }));
          return;
        }

        // Duplicate check (in-memory for dev)
        if (devWatchlistEmails.has(email)) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, code: "DUPLICATE" }));
          return;
        }

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          // No key in dev — return success so the form can be tested
          devWatchlistEmails.add(email);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, scheduledReminders: 0, dev: true }));
          return;
        }

        try {
          // Dynamically load the shared email module (Node/Bun context, no bundling)
          const { sendWatchlistEmails } = await import(
            "./src/lib/api/email.server.js"
          );
          const result = await sendWatchlistEmails(email);
          devWatchlistEmails.add(email);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } catch (err) {
          console.error("[watchlist-dev] error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              ok: false,
              error: "We could not process your request. Please try again.",
            })
          );
        }
      });
    },
  };
}

function adminWatchlistDevPlugin(): Plugin {
  return {
    name: "admin-watchlist-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/admin/watchlist", async (req, res, next) => {
        if (req.method !== "GET") return next();

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Admin access is not configured." }));
          return;
        }

        if (req.headers["x-admin-password"] !== adminPassword) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Invalid password." }));
          return;
        }

        const apiKey = process.env.RESEND_API_KEY;
        const audienceId = process.env.RESEND_AUDIENCE_ID;
        if (!apiKey || !audienceId) {
          // No Resend key in dev — return the in-memory dev sign-ups instead
          const contacts = Array.from(devWatchlistEmails).map((email, i) => ({
            id: `dev-${i}`,
            email,
            created_at: new Date().toISOString(),
            unsubscribed: false,
          }));
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, contacts, total: contacts.length, dev: true }));
          return;
        }

        try {
          const { Resend } = await import("resend");
          const resend = new Resend(apiKey);
          const result = await resend.contacts.list({ audienceId });
          if (result.error) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Could not fetch watchlist from provider." }));
            return;
          }
          const contacts = (result.data?.data ?? [])
            .map((c) => ({
              id: c.id,
              email: c.email,
              created_at: c.created_at,
              unsubscribed: c.unsubscribed,
            }))
            .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, contacts, total: contacts.length }));
        } catch (err) {
          console.error("[admin-watchlist-dev] error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "An unexpected error occurred." }));
        }
      });
    },
  };
}

// ── /api/chat dev middleware ──────────────────────────────────────────────────

const chatRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function chatDevPlugin(): Plugin {
  return {
    name: "chat-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res, next) => {
        if (req.method !== "POST") return next();

        // Rate limit (10 req / 5 min per IP)
        const ip =
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
          "unknown";
        const now = Date.now();
        const entry = chatRateLimitMap.get(ip);
        if (!entry || now > entry.resetAt) {
          chatRateLimitMap.set(ip, { count: 1, resetAt: now + 300_000 });
        } else if (entry.count >= 10) {
          res.writeHead(429, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Too many requests. Please slow down." }));
          return;
        } else {
          entry.count++;
        }

        // Parse body
        let raw = "";
        for await (const chunk of req) raw += chunk;
        let body: Record<string, unknown> = {};
        try {
          body = JSON.parse(raw || "{}");
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Invalid request body." }));
          return;
        }

        // Validate messages
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "messages array is required." }));
          return;
        }

        const history = (body.messages as unknown[])
          .filter(
            (m): m is { role: string; content: string } =>
              typeof m === "object" &&
              m !== null &&
              typeof (m as Record<string, unknown>).role === "string" &&
              typeof (m as Record<string, unknown>).content === "string",
          )
          .slice(-20)
          .map((m) => ({
            role: (["user", "assistant"].includes(m.role) ? m.role : "user") as "user" | "assistant" | "system",
            content: String(m.content).slice(0, 2000),
          }));

        if (history.length === 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "No valid messages provided." }));
          return;
        }

        try {
          const { createAIProvider, SYSTEM_PROMPT } = await import("./src/lib/ai/index.js");
          const provider = createAIProvider();
          const messages = [{ role: "system" as const, content: SYSTEM_PROMPT }, ...history];
          const result = await provider.complete(messages);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, text: result.text, model: result.model, provider: result.provider }));
        } catch (err) {
          const ref = `C${Date.now().toString(36).toUpperCase()}`;
          console.error(`[chat-dev:${ref}]`, err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Unexpected error.", ref }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    tsconfigPaths({ ignoreConfigErrors: true }),
    mcpPlugin(),
    watchlistDevPlugin(),
    adminWatchlistDevPlugin(),
    chatDevPlugin(),
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
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-router",
      "@tanstack/react-query",
    ],
    force: true,
  },
});
