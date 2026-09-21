import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { SiteShell } from "@/components/site/SiteShell";
import { Roadmap } from "@/components/site/Roadmap";
import { Section, SectionIntro } from "@/components/site/primitives";
import { ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/roadmap")({
  head: () =>
    pageHead("/roadmap", [
      breadcrumbJsonLd([{ name: "Roadmap", path: "/roadmap" }]),
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "ENICE Group Product Roadmap",
        description:
          "Public product roadmap for ENICE Group: completed milestones, active products, and what we are building next.",
        url: `${SITE_URL}/roadmap`,
        publisher: ORGANIZATION_REF,
      },
    ]),
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <SiteShell>
      {/*
        The page opening. It was a `bg-secondary/40` band with a hard bottom rule — the one
        pattern the dark system deliberately drops, because a tinted strip at the top of every
        page is what made the site read as a stack of separately-designed blocks. Rhythm and the
        ambient warm light carry the break instead.
      */}
      <Section spacing="tight" glow="center" aria-labelledby="roadmap-heading">
        <SectionIntro
          level={1}
          id="roadmap-heading"
          eyebrow="Execution · Product Timeline"
          heading="Roadmap"
          lead="Milestones completed, products in progress, and what we're building next. We publish this openly so partners can plan ahead."
        />
      </Section>

      <Roadmap />
    </SiteShell>
  );
}
