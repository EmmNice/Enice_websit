import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Wifi, CreditCard, BrainCircuit } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — ENICE Group Ecosystem" },
      {
        name: "description",
        content:
          "Explore the ENICE Group portfolio of active, proprietary software products and infrastructure networks running live operations — PulsePay and PulseAssist.",
      },
      { property: "og:title", content: "ENICE Group Portfolio" },
      {
        property: "og:description",
        content:
          "Active proprietary software products and infrastructure networks built by ENICE Group.",
      },
    ],
  }),
  component: PortfolioPage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const SHADOW_LIFT = "0 4px 6px -1px rgba(17,24,39,0.06), 0 10px 24px -8px rgba(17,24,39,0.08)";

function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      <section className="border-b border-border bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Ecosystem Portfolio
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
            The ENICE Group Ecosystem Portfolio
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Explore our active, proprietary software products and infrastructure
            networks running live operations.
          </p>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* PulsePay */}
            <article
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-background"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="relative h-64 overflow-hidden border-b border-border bg-secondary">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.6]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="absolute left-1/2 top-1/2 w-[78%] max-w-sm -translate-x-1/2 -translate-y-1/2 rotate-[-6deg]">
                  <div
                    className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl p-5 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.32 0.13 264) 0%, oklch(0.22 0.09 264) 60%, oklch(0.28 0.11 264) 100%)",
                      boxShadow: SHADOW_LIFT,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                        PulsePay
                      </div>
                      <Wifi className="h-4 w-4 rotate-90 text-white/80" />
                    </div>
                    <div className="mt-8 h-7 w-10 rounded-sm bg-gradient-to-br from-yellow-100 to-amber-300" />
                    <div className="mt-5 font-mono text-sm tracking-[0.18em] text-white/95">
                      4242 •••• •••• 0421
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-[8px] uppercase tracking-[0.28em] text-white/60">
                          Cardholder
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/95">
                          E. NICE GROUP
                        </div>
                      </div>
                      <CreditCard className="h-5 w-5 text-white/80" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                  Fintech Infrastructure Platform
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  PulsePay — Digital Payment Hub
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  A comprehensive virtual payment infrastructure system enabling
                  seamless Naira/USD virtual card issuance, automated KYC verification
                  loops, peer-to-peer asset transfers, and optimized value-added
                  services (VTU/Data delivery routing).
                </p>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Launch Platform Interface
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
                </a>
              </div>
            </article>

            {/* PulseAssist */}
            <article
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-background"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="relative h-64 overflow-hidden border-b border-border bg-secondary">
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
                    {[
                      { id: "REQ_0421", state: "Resolved", w: "w-full", live: false },
                      { id: "REQ_0422", state: "Routing", w: "w-[82%]", live: false },
                      { id: "REQ_0423", state: "Processing", w: "w-[64%]", live: true },
                      { id: "REQ_0424", state: "Queued", w: "w-[46%]", live: false },
                    ].map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
                        style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
                      >
                        <span
                          className={`relative flex h-1.5 w-1.5 shrink-0 ${r.live ? "" : "opacity-50"}`}
                        >
                          {r.live && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                          )}
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                          {r.id}
                        </span>
                        <div className="relative ml-1 h-1 flex-1 overflow-hidden rounded-full bg-border">
                          <div className={`h-full rounded-full bg-primary ${r.w}`} />
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {r.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Enterprise Conversational SaaS
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  PulseAssist — B2B Operational AI
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  An advanced, multi-tenant AI operations platform providing
                  telecommunication companies and financial networks with fully
                  autonomous customer support routing, API-driven account management,
                  and real-time live-agent failover capabilities.
                </p>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Request Integration Access
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
