import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ENICE Group" },
      {
        name: "description",
        content:
          "ENICE Group operates as a specialized technology venture studio and infrastructure holding firm — engineering software ecosystems that power modern digital commerce.",
      },
      { property: "og:title", content: "About ENICE Group" },
      {
        property: "og:description",
        content:
          "Corporate thesis, operational standards, and ecosystem strategy of ENICE Group.",
      },
    ],
  }),
  component: AboutPage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

function AboutPage() {
  const columns = [
    {
      label: "01",
      title: "Corporate Thesis",
      body: "ENICE Group operates as a specialized technology venture studio and infrastructure holding firm. We design, engineer, and deploy high-capacity software ecosystems that power modern digital commerce and institutional automation. Our mission is to bridge operational gaps for enterprises through robust financial transaction architecture and advanced autonomous AI systems.",
    },
    {
      label: "02",
      title: "Operational Excellence & Security Standards",
      body: "At ENICE Group, infrastructure integrity is paramount. Our proprietary software platforms are engineered on foundations of zero-trust security architectures, absolute multi-tenant database isolation, and real-time algorithmic guardrails. We build to satisfy rigorous compliance frameworks, ensuring that our corporate partners in banking, financial technology, and telecommunications can scale their operations with zero structural risk.",
    },
    {
      label: "03",
      title: "Ecosystem Strategy",
      body: "We do not merely build software; we incubate market-defining platforms. By controlling the entire development lifecycle — from low-level database schemas to high-throughput external API integration gateways — ENICE Group ensures every venture in our ecosystem operates with institutional-grade speed, premium usability, and flawless data isolation.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      <section className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            About ENICE Group
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
            A venture studio engineered for institutional scale.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We architect, capitalize, and operate full-stack software ventures —
            building the financial and AI infrastructure that powers modern industry.
          </p>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {columns.map((c) => (
              <article
                key={c.title}
                className="flex flex-col rounded-xl border border-border bg-background p-8 sm:p-10"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">
                  /{c.label}
                </span>
                <h2 className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-foreground">
                  {c.title}
                </h2>
                <p className="mt-5 text-[14.5px] leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
