import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PulseAssistEarlyAccessButton } from "@/components/site/PulseAssistEarlyAccess";
import { SHADOW_CARD } from "@/lib/design";
import { SITE_URL } from "@/lib/site";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about-pulseassist-beta")({
  head: () =>
    pageHead("/about-pulseassist-beta", [
      breadcrumbJsonLd([{ name: "About the PulseAssist Beta", path: "/about-pulseassist-beta" }]),
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "About the PulseAssist Beta",
        description:
          "PulseAssist has been developed to help businesses deliver faster, more intelligent, and more consistent customer support through AI-powered conversations. The September 2026 Beta marks the next stage of that journey.",
        url: `${SITE_URL}/about-pulseassist-beta`,
      },
    ]),
  component: AboutPulseAssistBetaPage,
});

function AboutPulseAssistBetaPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />
      <main id="main">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b border-border bg-[#080c15]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% -10%, rgba(59,130,246,0.20) 0%, transparent 65%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 85%)",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-1.5">
              <Sparkles className="h-3 w-3 text-blue-300" strokeWidth={2} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                September 2026 · PulseAssist Beta
              </span>
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl">
              About the PulseAssist Beta
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Built. Tested. Now ready for the next step.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <PulseAssistEarlyAccessButton
                label="Join the Beta"
                className="group inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-[13px] font-semibold text-white transition-all hover:bg-blue-500"
              />
            </div>
          </div>
        </section>

        {/* ── What PulseAssist is ── */}
        <section className="border-b border-border py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                PulseAssist has been developed to help businesses deliver faster, more intelligent,
                and more consistent customer support through AI-powered conversations.
              </p>
              <p>
                We are currently conducting internal testing to validate the platform, refine the
                experience, identify issues, and ensure our core systems are ready for real-world
                use.
              </p>
              <p className="text-foreground">
                The September 2026 Beta marks the next stage of that journey.
              </p>
              <p>
                During the beta, selected early users will get an opportunity to experience
                PulseAssist, test its capabilities in real-world scenarios, and provide valuable
                feedback as we continue improving the platform.
              </p>
            </div>
          </div>
        </section>

        {/* ── What success looks like ── */}
        <section className="border-b border-border bg-secondary py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              What Success Looks Like
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              A system worth trusting, not just a release.
            </h2>

            <div className="mt-10 space-y-6 text-[16px] leading-relaxed text-muted-foreground">
              <p>For us, a successful beta is not simply about releasing the product.</p>
              <p>
                It means building a system that is reliable, useful, responsive, and ready to earn
                the trust of the businesses that depend on it.
              </p>
              <p>
                The feedback and insights gathered during this phase will help us identify what
                works, improve what doesn&apos;t, strengthen the platform, and prepare PulseAssist
                for its wider launch.
              </p>
            </div>

            <div
              className="mt-10 grid gap-4 rounded-xl border border-border bg-background p-6 sm:grid-cols-3 sm:p-8"
              style={{ boxShadow: SHADOW_CARD }}
            >
              {["Reliable", "Responsive", "Trusted"].map((trait) => (
                <div key={trait} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                  <span className="text-[14px] font-semibold text-foreground">{trait}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-border bg-background py-20">
          <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              This is the beginning of the next phase.
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              September 2026 — PulseAssist Beta
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              Be among the first to experience what we&apos;re building.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PulseAssistEarlyAccessButton
                label="Join the Beta"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              />
              <a
                href="mailto:corporate@enicehq.com?subject=PulseAssist%20Beta%20Question"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-7 py-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Contact Us
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
