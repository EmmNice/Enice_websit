import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tag } from "@/components/site/primitives";
import { isBetaAnnouncementActive, isPulseAssistEarlyAccessActive } from "@/lib/beta-announcement";
import { PulseAssistEarlyAccessModal } from "@/components/site/PulseAssistEarlyAccess";

/**
 * Site-wide "PulseAssist Beta Launch" announcement.
 *
 * Appears on every fresh page load while the announcement window is active — including when a
 * visitor who already dismissed it simply refreshes the page. There is intentionally no
 * "already seen" flag in localStorage/cookies suppressing it: closing the modal dismisses that
 * one viewing only. The *only* thing that stops it from appearing again is
 * `isBetaAnnouncementActive()` turning false — the hardcoded September 13, 2026 cutoff in
 * `src/lib/beta-announcement.ts`, checked fresh on every mount and every render.
 *
 * Deliberately built on the same Radix `Dialog` primitives as
 * `PulseAssistEarlyAccessModal` — full focus trap, escape-to-close, scroll lock and
 * click-outside-to-close for free — with a heavier backdrop blur and its own entrance animation
 * so it reads as an announcement, not a form.
 */
export function BetaLaunchAnnouncement() {
  const [open, setOpen] = useState(false);
  // The early-access modal is a separate, top-level `Dialog` instance (see below), not nested
  // inside this one's `DialogContent`. Radix unmounts a dialog's portal contents as soon as it
  // closes, so nesting the early-access modal here meant closing this announcement — which
  // "Join the Beta" had to do first, to avoid stacking two overlays — tore the early-access
  // modal's subtree down before it ever got to render. Keeping them as siblings, each with its
  // own `open` state, lets this one close and the other open in the same tick without either
  // instance destroying the other.
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(false);

  useEffect(() => {
    if (!isBetaAnnouncementActive()) return;

    // A brief delay lets the page paint first, so the modal feels like a considered moment
    // rather than something slamming the visitor before the site has even appeared.
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  function joinBeta() {
    setOpen(false);
    setEarlyAccessOpen(true);
  }

  // Re-check on every render pass rather than only once on mount, so if the deadline is
  // crossed while this component is already mounted in an open tab, it closes itself instead
  // of continuing to display a stale announcement.
  if (!isBetaAnnouncementActive()) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          // A deeper blur than the shared scrim, plus its own close control, so this reads as a
          // considered announcement rather than the generic form-dialog shell used elsewhere.
          overlayClassName="backdrop-blur-md"
          hideDefaultClose
          className="w-[calc(100vw-2rem)] max-w-md gap-0 overflow-hidden border-none bg-transparent p-0 shadow-none duration-300 sm:max-w-lg"
        >
          <div className="panel-raised relative overflow-hidden">
            {/* Ambient warm lighting and the technical grid — decorative, never in reading order. */}
            <div aria-hidden className="mesh-glow-center" />
            <div aria-hidden className="tech-grid" />

            {/* Close button */}
            <DialogClose
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-8 w-8 cursor-pointer place-items-center rounded-full text-bone-faint transition-colors hover:bg-surface-3 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </DialogClose>

            <div className="relative px-6 pb-8 pt-9 sm:px-9 sm:pb-10 sm:pt-11">
              {/* Badge */}
              <Tag tone="warm" className="max-w-full">
                <Sparkles aria-hidden className="h-3 w-3 shrink-0" strokeWidth={2} />
                <span className="whitespace-nowrap">PulseAssist Beta Launch</span>
              </Tag>

              <DialogHeader className="mt-6 text-left">
                <DialogTitle className="text-[1.6rem] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-3xl">
                  We&apos;re entering our next phase.
                </DialogTitle>
                <DialogDescription className="mt-4 text-[14px] leading-relaxed text-bone-soft sm:text-[15px]">
                  Following our ongoing internal testing, we&apos;re preparing to open PulseAssist
                  Beta in the second week of September 2026.
                </DialogDescription>
              </DialogHeader>

              <p className="mt-4 text-[13.5px] leading-relaxed text-bone-soft">
                Our team is currently refining the platform, testing core systems, and preparing for
                a limited beta experience with selected early users.
              </p>

              {/* Timeline card */}
              <div className="panel-quiet mt-7 flex items-center gap-3 px-4 py-3.5">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                    September 2026 · Beta Phase
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-bone-soft">
                    Be among the first to experience what we&apos;re building.
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isPulseAssistEarlyAccessActive() && (
                  <button type="button" onClick={joinBeta} className="btn btn-primary group flex-1">
                    Join the Beta
                    <ArrowUpRight
                      aria-hidden
                      className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                    />
                  </button>
                )}
                <Link
                  to="/about-pulseassist-beta"
                  onClick={() => setOpen(false)}
                  className="btn btn-secondary group flex-1"
                >
                  Learn More
                  <ArrowUpRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                  />
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sibling, not a descendant of the dialog above — see the comment on `earlyAccessOpen`. */}
      <PulseAssistEarlyAccessModal open={earlyAccessOpen} onOpenChange={setEarlyAccessOpen} />
    </>
  );
}
