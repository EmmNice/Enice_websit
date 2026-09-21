import {
  HeadContent,
  Outlet,
  createRootRoute,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { NotFound } from "@/components/site/NotFound";
import { CORPORATE_EMAIL } from "@/lib/seo";

/**
 * The last-resort error screen, shown when a route throws.
 *
 * Deliberately self-contained: it must render correctly even if the failure is in the design
 * system or the CMS bootstrap, so it relies only on the brand tokens and no site components. It
 * also cannot assume `.site` is on the document element — a route error under /admin would reach
 * here with the light theme active — so the canvas and bone are set explicitly.
 *
 * Typed with the router's own `ErrorComponentProps` rather than a hand-written `{ error: Error }`.
 * The router passes `error` as `unknown` — a thrown value is not guaranteed to be an `Error` — and
 * the local annotation was tight enough to fail `tsc` against the installed router version.
 */
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  // Log privately — never surfaced to the user.
  console.error("[RouteErrorBoundary]", error);
  const router = useRouter();

  return (
    <main
      id="main"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5"
      style={{ background: "#080c0e", color: "#f4f1eb" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 30rem at 50% -10%, rgb(255 149 41 / 0.05), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex items-baseline text-xl tracking-tight">
            <span
              className="font-extrabold"
              style={{
                backgroundImage:
                  "linear-gradient(108deg,#f4f1eb 0%,#d8a45c 42%,#a8702f 74%,#5c3a18)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              E
            </span>
            <span className="-ml-px font-light tracking-[0.28em]">NICE</span>
          </span>
          <span className="h-5 w-px" style={{ background: "rgb(244 241 235 / 0.16)" }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: "#727371" }}
          >
            Group
          </span>
        </div>

        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            border: "1px solid rgb(216 164 92 / 0.25)",
            background: "rgb(216 164 92 / 0.08)",
          }}
        >
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "#d8a45c" }}
          />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#d8a45c" }}
          >
            System notice
          </span>
        </div>

        <h1 className="mb-5 text-3xl font-semibold leading-[1.15] tracking-[-0.03em] sm:text-4xl">
          Something went wrong on our end.
        </h1>

        <p className="mb-10 max-w-sm text-[15px] leading-relaxed" style={{ color: "#a1a09e" }}>
          We are fixing it right now. Please refresh the page or try again shortly.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-md px-6 text-sm font-semibold"
            style={{ background: "#f4f1eb", color: "#080c0e" }}
          >
            <RefreshCw
              aria-hidden
              className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180"
            />
            Refresh page
          </button>
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium"
            style={{
              border: "1px solid rgb(244 241 235 / 0.16)",
              background: "rgb(244 241 235 / 0.04)",
              color: "#f4f1eb",
            }}
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Try again
          </button>
        </div>

        <p className="mt-12 text-[12px]" style={{ color: "#727371" }}>
          If this keeps happening, contact us at{" "}
          <a href={`mailto:${CORPORATE_EMAIL}`} className="underline underline-offset-2">
            {CORPORATE_EMAIL}
          </a>
        </p>
      </div>
    </main>
  );
}

/**
 * The assistant is PulseAssist — ENICE's own product — loaded from the platform rather than
 * reimplemented here. See `PulseAssistWidget` for what it replaced and why.
 *
 * Still code-split and still off the admin screens: it is never part of first paint, and on
 * /admin it would only be in the way.
 */
const PulseAssistWidget = lazy(() =>
  import("@/components/site/PulseAssistWidget").then((m) => ({ default: m.PulseAssistWidget })),
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
 * document head, and keeps the theme scope in step with the route.
 *
 * Without HeadContent, every route's `head()` was computed and then discarded: the whole site
 * served the single static title and description from index.html, with no canonical links and no
 * structured data on any page.
 */
function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  /*
   * `.site` is the public site's dark theme, declared on <html> in index.html so it is active
   * before the first paint. The Website Manager is a light-theme tool sharing the same token
   * names, so the class is removed while an /admin route is mounted and restored on the way out.
   * Doing it here — rather than in the admin layout — keeps one owner for the class and handles
   * navigation in both directions.
   */
  useEffect(() => {
    document.documentElement.classList.toggle("site", !isAdmin);
  }, [isAdmin]);

  return (
    <>
      <HeadContent />
      <Outlet />
      {!isAdmin && (
        <Suspense fallback={null}>
          <BetaLaunchAnnouncement />
          <PulseAssistWidget />
        </Suspense>
      )}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  // Rendered when a route throws `notFound()` (e.g. a blog slug with no published article).
  // Shares the designed 404 with the `/$` splat route so both paths look identical.
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});
