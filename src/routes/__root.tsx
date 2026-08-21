import {
  HeadContent,
  Outlet,
  createRootRoute,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { NotFound } from "@/components/site/NotFound";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  // Log privately — never surfaced to the user
  console.error("[RouteErrorBoundary]", error);
  const router = useRouter();

  return (
    <main
      id="main"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5"
      style={{ background: "#080810" }}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #1d4ed8 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#080810] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        {/* Wordmark */}
        <div className="mb-10 flex items-center gap-3">
          <span className="font-mono text-xl font-black tracking-[0.12em] text-white">
            <span className="text-blue-500">E</span>NICE
          </span>
          <span className="h-5 w-px bg-white/20" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Group
          </span>
        </div>

        {/* Status pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
            System Notice
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-5 text-3xl font-bold leading-[1.15] tracking-[-0.03em] text-white sm:text-4xl">
          Something went wrong
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            on our end.
          </span>
        </h1>

        {/* Copy — exact text requested */}
        <p className="mb-10 max-w-sm text-[15px] leading-relaxed text-white/45">
          We are fixing it right now — please refresh the page or try again shortly.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-95"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            Refresh page
          </button>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Try again
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-[11px] text-white/20">
          If this keeps happening, contact us at{" "}
          <a href="mailto:corporate@enicehq.com" className="transition-colors hover:text-white/50">
            corporate@enicehq.com
          </a>
        </p>
      </div>
    </main>
  );
}

/**
 * The assistant is a floating widget that is never part of first paint, so it is code-split
 * and fetched after hydration. It lives here rather than on the homepage so a visitor reading
 * a product page can ask a question without navigating away — but it is kept off the admin
 * screens, where it would only be in the way.
 */
const AIChatbot = lazy(() =>
  import("@/components/site/AIChatbot").then((m) => ({ default: m.AIChatbot })),
);

/**
 * The PulseAssist Beta announcement is a one-time interruption, not part of first paint, so it
 * is code-split the same way as the assistant. It renders `null` on its own once the beta launch
 * window has passed (see `src/lib/beta-announcement.ts`), so no route-level check is needed here
 * beyond keeping it off the admin screens.
 */
const BetaLaunchAnnouncement = lazy(() =>
  import("@/components/site/BetaLaunchAnnouncement").then((m) => ({
    default: m.BetaLaunchAnnouncement,
  })),
);

/**
 * Injects each route's `head()` output — title, meta, canonical link and JSON-LD — into the
 * document head.
 *
 * Without this, every route's `head()` was computed and then discarded: the whole site served
 * the single static title and description from index.html, with no canonical links and no
 * structured data on any page.
 */
function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showAssistant = !pathname.startsWith("/admin");

  return (
    <>
      <HeadContent />
      <Outlet />
      {showAssistant && (
        <Suspense fallback={null}>
          <BetaLaunchAnnouncement />
          <AIChatbot />
        </Suspense>
      )}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  // Rendered when a route throws `notFound()` (e.g. a blog slug with no Sanity document).
  // Shares the designed 404 with the `/$` splat route so both paths look identical.
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});
