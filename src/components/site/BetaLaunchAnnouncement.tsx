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
 * `PulseAssistEarlyAccessModal` — full focus trap, escape-to-close, and click-outside-to-close
 * for free — with its own overlay (blurred rather than opaque black) and its own entrance
 * animation so it reads as an announcement, not a form.
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
          // Own overlay treatment (blurred, tinted navy rather than the shared flat black) and
          // own close control, so this reads as a considered announcement rather than the
          // generic form-dialog shell used elsewhere on the site.
          overlayClassName="backdrop-blur-sm bg-[#050810]/70"
          hideDefaultClose
          className="w-[calc(100vw-2rem)] max-w-md gap-0 overflow-hidden rounded-2xl border-none bg-transparent p-0 shadow-none duration-300 sm:max-w-lg"
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10"
            style={{
              background: "linear-gradient(160deg, #0a1230 0%, #0c1740 45%, #0a1230 100%)",
              boxShadow: "0 32px 80px -16px rgba(8,12,32,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 55% at 50% -10%, rgba(59,130,246,0.28) 0%, transparent 65%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 85%)",
              }}
            />

            {/* Close button */}
            <DialogClose
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <X className="h-4 w-4" />
            </DialogClose>

            <div className="relative px-6 pb-8 pt-9 sm:px-9 sm:pb-10 sm:pt-11">
              {/* Badge */}
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3.5 py-1.5">
                <Sparkles className="h-3 w-3 shrink-0 text-blue-300" strokeWidth={2} />
                <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                  PulseAssist Beta Launch
                </span>
              </div>

              <DialogHeader className="mt-6 text-left">
                <DialogTitle className="text-[1.6rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-3xl">
                  We&apos;re entering our next phase.
                </DialogTitle>
                <DialogDescription className="mt-4 text-[14px] leading-relaxed text-white/60 sm:text-[15px]">
                  Following our ongoing internal testing, we&apos;re preparing to open PulseAssist
                  Beta in the second week of September 2026.
                </DialogDescription>
              </DialogHeader>

              <p className="mt-4 text-[13.5px] leading-relaxed text-white/45">
                Our team is currently refining the platform, testing core systems, and preparing for
                a limited beta experience with selected early users.
              </p>

              {/* Timeline card */}
              <div className="mt-7 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                    September 2026 · Beta Phase
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-white/50">
                    Be among the first to experience what we&apos;re building.
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isPulseAssistEarlyAccessActive() && (
                  <button
                    type="button"
                    onClick={joinBeta}
                    className="group inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:bg-blue-500"
                  >
                    Join the Beta
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
                  </button>
                )}
                <Link
                  to="/about-pulseassist-beta"
                  onClick={() => setOpen(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Learn More
                  <ArrowUpRight className="h-3.5 w-3.5" />
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
