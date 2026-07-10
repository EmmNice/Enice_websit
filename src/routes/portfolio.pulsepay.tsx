import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Wifi, CreditCard, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/pulsepay")({
  head: () => ({
    meta: [
      { title: "PulsePay | ENICE Group" },
      {
        name: "description",
        content:
          "PulsePay is ENICE Group's virtual payment platform: instant card issuance, KYC, wallets, and transfers built for modern commerce.",
      },
    ],
  }),
  component: PulsePayPage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const SHADOW_LIFT = "0 4px 6px -1px rgba(17,24,39,0.06), 0 10px 24px -8px rgba(17,24,39,0.08)";

const FEATURES = [
  "Instant virtual Naira and USD card issuance",
  "Built-in KYC and identity verification",
  "Peer-to-peer transfers and wallet funding",
  "Programmable spend controls for teams",
  "Value-added services and bill payments",
  "Enterprise-grade fraud monitoring",
];

function PulsePayPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      <section className="border-b border-border bg-secondary py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Fintech Infrastructure Platform
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
              PulsePay
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A virtual payment platform that issues Naira and USD cards,
              handles KYC verification, moves funds between users, and delivers
              value-added services with speed and reliability.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="mailto:corporate@enicehq.com"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Request Access
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
                  •••• •••• •••• ••••
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.28em] text-white/60">
                      Cardholder
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/95">
                      ENICE GROUP
                    </div>
                  </div>
                  <CreditCard className="h-5 w-5 text-white/80" strokeWidth={1.5} />
                </div>
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
            Everything a modern payments stack should be.
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
