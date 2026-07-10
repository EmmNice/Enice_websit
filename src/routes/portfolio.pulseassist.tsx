import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BrainCircuit, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/pulseassist")({
  head: () => ({
    meta: [
      { title: "PulseAssist | ENICE Group" },
      {
        name: "description",
        content:
          "PulseAssist is a multi-tenant AI operations platform for banking, fintech, and telecom, with autonomous support and live-agent failover.",
      },
    ],
  }),
  component: PulseAssistPage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

const QUEUE_ROWS = [
  { id: "REQ_001", state: "Resolved", width: "w-full", isLive: false },
  { id: "REQ_002", state: "Routing", width: "w-[82%]", isLive: false },
  { id: "REQ_003", state: "Processing", width: "w-[64%]", isLive: true },
  { id: "REQ_004", state: "Queued", width: "w-[46%]", isLive: false },
];

const FEATURES = [
  "Autonomous customer support routing",
  "Policy-bound conversational agents",
  "Real-time handoff to live agents",
  "API-driven account management",
  "Multi-tenant architecture for enterprises",
  "Compliance-ready audit trails",
];

function PulseAssistPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      <section className="border-b border-border bg-secondary py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <BrainCircuit className="h-3.5 w-3.5" />
              Enterprise Conversational SaaS
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
              PulseAssist
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A multi-tenant AI operations platform for telecoms and financial
              networks. It handles customer support routing, provides API-driven
              account management, and hands calls to live agents in real time
              when needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="mailto:corporate@enicehq.com"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Request Integration Access
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
              </a>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Back to Portfolio
              </Link>
            </div>
          </div>

          <div
            className="relative h-72 overflow-hidden rounded-xl border border-border bg-background"
            style={{ boxShadow: SHADOW_CARD }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.6]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-sm space-y-2.5">
                {QUEUE_ROWS.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <span className={`relative flex h-1.5 w-1.5 shrink-0 ${!row.isLive && "opacity-50"}`}>
                      {row.isLive && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      )}
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                      {row.id}
                    </span>
                    <div className="relative ml-1 h-1 flex-1 overflow-hidden rounded-full bg-border">
                      <div className={`h-full rounded-full bg-primary ${row.width}`} />
                    </div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {row.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Platform Capabilities
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Operations that run themselves.
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                <span className="text-[14px] text-foreground/85">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
