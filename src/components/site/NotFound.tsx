import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/**
 * The site's single 404 experience.
 *
 * Two different ones used to exist: the designed page below (reached via the `/$` splat
 * route for unmatched URLs) and a bare unstyled fallback in `__root.tsx` used whenever a
 * loader threw `notFound()` — for example a blog slug with no matching Sanity document.
 * Both paths now render this component.
 */
export function NotFound() {
  return (
    <main id="main" className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 80%)",
        }}
      />
      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Error · 404
        </div>
        <h1 className="mt-8 font-mono text-7xl font-semibold tracking-[-0.04em] text-foreground sm:text-8xl">
          404
        </h1>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Page not found.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Return to Home
          </Link>
          <Link
            to="/portfolio"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Explore Products
          </Link>
        </div>
      </div>
    </main>
  );
}
