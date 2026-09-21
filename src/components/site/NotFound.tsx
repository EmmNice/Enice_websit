import { Cta, Container, Eyebrow } from "./primitives";

/**
 * The site's single 404 experience.
 *
 * Two different ones used to exist: the designed page below (reached via the `/$` splat
 * route for unmatched URLs) and a bare unstyled fallback in `__root.tsx` used whenever a
 * loader threw `notFound()` — for example a blog slug with no matching published article.
 * Both paths now render this component.
 *
 * It renders its own `<main>` rather than going through `SiteShell`: a 404 has no use for the
 * navigation chrome, and `SiteShell` would give the page a second `<main>` landmark when this is
 * used as the root route's `notFoundComponent`.
 */
export function NotFound() {
  return (
    <main
      id="main"
      className="relative flex min-h-dvh items-center overflow-hidden bg-background text-foreground antialiased"
    >
      <div aria-hidden className="tech-grid" />
      <div aria-hidden className="mesh-glow" />

      <Container className="relative py-24">
        <div className="mx-auto max-w-xl text-center">
          <Eyebrow className="justify-center">Error · 404</Eyebrow>
          <p aria-hidden className="tnum mt-8 font-mono text-7xl font-semibold tracking-[-0.04em]">
            404
          </p>
          <h1 className="type-h2 mt-6 text-foreground">Page not found.</h1>
          <p className="type-lead mx-auto mt-5">
            The page you are looking for does not exist, or it has moved. Let us get you back on
            track.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Cta to="/" icon="arrow">
              Return home
            </Cta>
            <Cta to="/portfolio" variant="secondary">
              Explore products
            </Cta>
          </div>
        </div>
      </Container>
    </main>
  );
}
