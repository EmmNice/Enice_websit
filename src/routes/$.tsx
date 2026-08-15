import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "@/components/site/NotFound";

/** Root-level splat route: catches any URL that matches no other route. */
export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found — ENICE Group" },
      {
        name: "description",
        content: "The page you requested doesn't exist on the ENICE Group site.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: NotFound,
});
