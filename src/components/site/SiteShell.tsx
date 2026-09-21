/**
 * The public site's page frame: scroll indicator, header, `<main>` landmark, footer.
 *
 * Seventeen route files each assembled this themselves, and they had drifted — some wrapped
 * `<main>` and some did not, the wrapper classes differed, and `/portfolio/*` pages carried a
 * slightly different background than `/about`. Anything true of every public page belongs here
 * once, which is also what guarantees exactly one `<main id="main">` for the skip link to target.
 *
 * The dark theme itself is *not* applied here. `.site` lives on `<html>` — set statically in
 * `index.html` and maintained by `__root.tsx` — so the canvas covers the viewport before React
 * boots and during overscroll, rather than appearing as a dark box on a white page.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ScrollProgress } from "./ScrollProgress";

export function SiteShell({
  children,
  /** The homepage hides the reading indicator's competition with the hero; everything else shows it. */
  progress = true,
  className,
}: {
  children: ReactNode;
  progress?: boolean;
  className?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
      {progress && <ScrollProgress />}
      <SiteHeader />
      <main id="main" className={cn("flex-1", className)}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
