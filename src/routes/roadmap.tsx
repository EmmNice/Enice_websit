import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap } from "@/components/site/Roadmap";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Product Roadmap | ENICE Group" },
      {
        name: "description",
        content:
          "The ENICE Group product roadmap: milestones completed, PulsePay and PulseAssist live, and what we are building next, including ePulse, PulseX, and the ENICE Core.",
      },
      { property: "og:title", content: "ENICE Group Product Roadmap" },
      {
        property: "og:description",
        content:
          "From PulsePay and PulseAssist today to ePulse and PulseX next: our public product roadmap.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      { property: "og:url", content: `${SITE_URL}/roadmap` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      { name: "twitter:title", content: "ENICE Group Product Roadmap" },
      {
        name: "twitter:description",
        content:
          "Milestones completed and what we are building next, in our public product roadmap.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/roadmap` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "ENICE Group Product Roadmap",
          description:
            "Public product roadmap for ENICE Group: completed milestones, active products, and what we are building next.",
          url: `${SITE_URL}/roadmap`,
          publisher: {
            "@type": "Organization",
            name: "ENICE Group",
            url: SITE_URL,
          },
        }),
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />
      <main id="main">
        {/* Page header */}
        <div className="border-b border-border bg-secondary/40 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Execution · Product Timeline
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl md:text-5xl">
              Roadmap
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Milestones completed, products in progress, and what we're building next. We publish
              this openly so partners can plan ahead.
            </p>
          </div>
        </div>

        <Roadmap />
      </main>
      <SiteFooter />
    </div>
  );
}
