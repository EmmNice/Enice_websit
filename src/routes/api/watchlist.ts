import { createFileRoute } from "@tanstack/react-router";
import { sendWatchlistEmails } from "@/lib/api/email.server";

export const Route = createFileRoute("/api/watchlist")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json() as { email?: string };
          const email = typeof body?.email === "string" ? body.email.trim() : "";

          // Basic email validation
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(
              JSON.stringify({ ok: false, error: "Please enter a valid email address." }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const result = await sendWatchlistEmails(email);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Internal server error.";
          return new Response(
            JSON.stringify({ ok: false, error: message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
