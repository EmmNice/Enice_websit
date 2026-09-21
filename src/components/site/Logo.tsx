import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useSiteChrome } from "@/lib/cms/use-chrome";
import { cn } from "@/lib/utils";

/**
 * The committed brand mark — the dark-background variant, since the public site is dark throughout.
 *
 * A static asset rather than a CMS value on purpose. Production runs without a `DATABASE_URL`, so
 * `bootstrap.design` comes back `null` and a CMS-only logo would never appear on the live site.
 * Shipping the mark in `public/` means the identity survives both an empty database and an API
 * outage; the CMS URL is layered on top as an override.
 *
 * If the file is absent, `onError` drops back to the wordmark, so a missing asset degrades to the
 * previous identity instead of a broken-image icon.
 *
 * See `scripts/brand-mark.mjs` for the other colourways and where the geometry came from.
 */
const BUILT_IN_MARK = "/brand/enice-mark.svg";

/**
 * The ENICE Group logo: brand mark plus wordmark.
 *
 * ## Why the wordmark stays
 *
 * The mark is an `EN` monogram — it does not spell the company name. Used alone in the header it
 * would read as bare initials to a first-time visitor, so it sits in a lockup with the wordmark. The
 * mark alone is reserved for square contexts — favicon, app icon, social avatar — where the name
 * comes from the surrounding chrome.
 *
 * There is an unavoidable stutter in this arrangement: the mark reads "EN" and the wordmark then
 * reads "ENICE". It survives because the mark is angular and two-tone enough to register as a
 * graphic rather than as two letters, which is the usual reason monogram-plus-wordmark lockups work.
 *
 * ## Why the gradient `E` switches off
 *
 * Without a mark, the four-stop brand gradient (`--mark-1` → `--mark-4`) runs on the `E` alone via
 * `.enice-mark`, because the identity needs one piece of overt colour somewhere. Once the mark is
 * present the mark *is* that piece — and the mark's blue is a stronger accent than the gradient ever
 * was. Keeping both would put two competing focal points two centimetres apart, so the lettering
 * goes flat bone.
 *
 * `aria-label` carries the readable name because the mark is decorative and the wordmark is split
 * across styled spans, which a screen reader would otherwise announce as "E NICE".
 */
export function Logo({ size = "md", className }: { size?: "md" | "sm"; className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { design } = useSiteChrome();
  const [markFailed, setMarkFailed] = useState(false);

  // The public site is dark everywhere, so the light variant is the correct default when an
  // administrator has supplied one.
  const markSrc = design?.logoDarkUrl || design?.logoUrl || BUILT_IN_MARK;
  const showMark = !markFailed;

  const wordmark = size === "md" ? "text-[1.3rem]" : "text-base";
  const tag = size === "md" ? "text-[10px]" : "text-[9px]";
  // The mark runs slightly larger than the wordmark's cap height. The glyphs are inset within their
  // tile, so matching cap heights makes the mark read as the smaller of the two.
  const markSize = size === "md" ? "h-8" : "h-7";

  // Already home: scroll to the top instead of a no-op navigation.
  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      aria-label="ENICE Group — home"
      className={cn("tap group flex items-center gap-2.5 rounded-sm", className)}
    >
      {showMark && (
        <img
          src={markSrc}
          alt=""
          aria-hidden
          // Width is intentionally unset: the mark's own aspect ratio decides it, so swapping in a
          // differently proportioned asset via the CMS cannot stretch it.
          className={cn("w-auto shrink-0", markSize)}
          onError={() => setMarkFailed(true)}
        />
      )}
      <span aria-hidden className={cn("flex items-baseline tracking-tight", wordmark)}>
        <span className={cn("font-extrabold", showMark ? "text-foreground" : "enice-mark")}>E</span>
        <span className="-ml-px font-light tracking-[0.28em] text-foreground">NICE</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "border-l border-border pl-2.5 font-semibold uppercase tracking-[0.32em] text-bone-faint",
          "transition-colors duration-200 group-hover:text-bone-soft",
          tag,
        )}
      >
        Group
      </span>
    </Link>
  );
}
