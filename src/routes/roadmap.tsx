import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap } from "@/components/site/Roadmap";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap | ENICE Group" },
      {
        name: "description",
        content:
          "The ENICE Group product roadmap: milestones completed, ventures in progress, and the infrastructure we are building next.",
      },
      { property: "og:title", content: "ENICE Group Roadmap" },
      {
        property: "og:description",
        content:
          "Milestones completed, ventures in progress, and the infrastructure we are building next.",
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

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
            Milestones completed, ventures in progress, and the infrastructure
            we are building next. Published openly so partners and the wider
            ecosystem can plan ahead with confidence.
          </p>
        </div>
      </div>

      <Roadmap />

      <SiteFooter />
    </div>
  );
}
