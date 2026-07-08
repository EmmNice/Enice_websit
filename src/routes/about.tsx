import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | ENICE Group" },
      {
        name: "description",
        content:
          "ENICE Group is a technology venture studio and infrastructure holding firm that engineers software ecosystems for modern digital commerce.",
      },
      { property: "og:title", content: "About ENICE Group" },
      {
        property: "og:description",
        content:
          "Corporate thesis, operating standards, and ecosystem strategy of ENICE Group.",
      },
    ],
  }),
  component: AboutPage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

// ─── Column content ───────────────────────────────────────────────────────────

const COLUMNS = [
  {
    label: "01",
    title: "Corporate Thesis",
    body: "ENICE Group is a technology venture studio and infrastructure holding firm. We design, engineer, and operate the software systems that power modern digital commerce and institutional automation. Our mandate is to close the infrastructure gap facing enterprises through robust financial transaction platforms and advanced autonomous AI.",
  },
  {
    label: "02",
    title: "Operating Standards",
    body: "Infrastructure integrity is non-negotiable. Our platforms are built on zero-trust security, per-tenant database isolation, and real-time algorithmic guardrails. We build to satisfy rigorous compliance frameworks so partners in banking, fintech, and telecom can scale without carrying structural risk.",
  },
  {
    label: "03",
    title: "Ecosystem Strategy",
    body: "We do more than build software. We incubate market-defining platforms by owning the full development lifecycle, from database schema through high-throughput API gateways. Every venture in our ecosystem is engineered for institutional performance, precision, and data isolation.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* Page header */}
      <section className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            About ENICE Group
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
            A venture studio engineered for institutional scale.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We design, capitalize, and operate full-stack software ventures that
            deliver the financial and AI infrastructure modern industry runs on.
          </p>
        </div>
      </section>

      {/* Three-column detail */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {COLUMNS.map((c) => (
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
