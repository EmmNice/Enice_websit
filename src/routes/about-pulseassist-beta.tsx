import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PulseAssistEarlyAccessButton } from "@/components/site/PulseAssistEarlyAccess";
import { Cta, Panel, Section, SectionIntro, Tag } from "@/components/site/primitives";
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

/** The three qualities the beta is judged against. */
const TRAITS = ["Reliable", "Responsive", "Trusted"];

function AboutPulseAssistBetaPage() {
  return (
    <SiteShell>
      {/* ── Hero ── */}
      <Section spacing="tight" container="narrow" grid glow="spread" aria-labelledby="beta-heading">
        <Tag tone="warm" className="max-w-full">
          <Sparkles aria-hidden className="h-3 w-3 shrink-0" strokeWidth={2} />
          September 2026 · PulseAssist Beta
        </Tag>

        <SectionIntro
          level={1}
          id="beta-heading"
          heading="About the PulseAssist Beta"
          lead="Built. Tested. Now ready for the next step."
          className="mt-6"
        />

        <div className="mt-9 flex flex-wrap gap-3">
          <PulseAssistEarlyAccessButton label="Join the Beta" className="btn btn-primary" />
        </div>
      </Section>

      {/* ── What PulseAssist is ── */}
      <Section divider container="prose">
        <div data-allow-select className="type-body space-y-6">
          <p>
            PulseAssist has been developed to help businesses deliver faster, more intelligent, and
            more consistent customer support through AI-powered conversations.
          </p>
          <p>
            We are currently conducting internal testing to validate the platform, refine the
            experience, identify issues, and ensure our core systems are ready for real-world use.
          </p>
          <p className="text-foreground">
            The September 2026 Beta marks the next stage of that journey.
          </p>
          <p>
            During the beta, selected early users will get an opportunity to experience PulseAssist,
            test its capabilities in real-world scenarios, and provide valuable feedback as we
            continue improving the platform.
          </p>
        </div>
      </Section>

      {/* ── What success looks like ── */}
      <Section divider tone="recessed" container="prose" aria-labelledby="beta-success-heading">
        <SectionIntro
          id="beta-success-heading"
          eyebrow="What Success Looks Like"
          heading="A system worth trusting, not just a release."
        />

        <div data-allow-select className="type-body mt-10 space-y-6">
          <p>For us, a successful beta is not simply about releasing the product.</p>
          <p>
            It means building a system that is reliable, useful, responsive, and ready to earn the
            trust of the businesses that depend on it.
          </p>
          <p>
            The feedback and insights gathered during this phase will help us identify what works,
            improve what doesn&apos;t, strengthen the platform, and prepare PulseAssist for its
            wider launch.
          </p>
        </div>

        <Panel raised className="mt-10 grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          {TRAITS.map((trait) => (
            <div key={trait} className="flex items-center gap-2.5">
              <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
              <span className="text-[14px] font-semibold text-foreground">{trait}</span>
            </div>
          ))}
        </Panel>
      </Section>

      {/* ── CTA ── */}
      <Section divider glow="center" container="narrow" aria-labelledby="beta-cta-heading">
        <SectionIntro
          align="center"
          id="beta-cta-heading"
          eyebrow="This is the beginning of the next phase."
          heading="September 2026 · PulseAssist Beta"
          lead="Be among the first to experience what we're building."
        >
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PulseAssistEarlyAccessButton label="Join the Beta" className="btn btn-primary" />
            <Cta
              to="mailto:corporate@enicehq.com?subject=PulseAssist%20Beta%20Question"
              variant="secondary"
              icon="external"
            >
              Contact Us
            </Cta>
          </div>
        </SectionIntro>
      </Section>
    </SiteShell>
  );
}
