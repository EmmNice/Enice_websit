import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Wifi,
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  BarChart3,
  Lock,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/pulsepay")({
  head: () => ({
    meta: [
      { title: "PulsePay | Virtual Payment Platform — ENICE Group" },
      {
        name: "description",
        content:
          "PulsePay by ENICE Group: instant virtual Naira and USD card issuance, built-in KYC, programmable wallets, peer-to-peer transfers, and enterprise-grade fraud monitoring for modern commerce.",
      },
      {
        property: "og:title",
        content: "PulsePay — Virtual Payment Platform by ENICE Group",
      },
      {
        property: "og:description",
        content:
          "Instant virtual card issuance, KYC verification, programmable wallets, and fast transfers. PulsePay is ENICE Group's fintech infrastructure platform for modern commerce.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      {
        property: "og:url",
        content: "https://enicegroup.com/portfolio/pulsepay",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      {
        name: "twitter:title",
        content: "PulsePay — Fintech Infrastructure Platform",
      },
      {
        name: "twitter:description",
        content:
          "Instant virtual Naira & USD card issuance, KYC, wallets, and transfers. Built by ENICE Group.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://enicegroup.com/portfolio/pulsepay",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "PulsePay",
          description:
            "ENICE Group's virtual payment platform — instant Naira and USD card issuance, built-in KYC verification, peer-to-peer transfers, programmable spend controls, and enterprise-grade fraud monitoring.",
          url: "https://enicegroup.com/portfolio/pulsepay",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web, iOS, Android",
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            description: "Request access via corporate@enicehq.com",
          },
          author: {
            "@type": "Organization",
            name: "ENICE Group",
            url: "https://enicegroup.com",
          },
          featureList: [
            "Instant virtual Naira and USD card issuance",
            "Built-in KYC and identity verification",
            "Peer-to-peer transfers and wallet funding",
            "Programmable spend controls for teams",
            "Value-added services and bill payments",
            "Enterprise-grade fraud monitoring",
          ],
        }),
      },
    ],
  }),
  component: PulsePayPage,
});

const SHADOW_CARD =
  "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const SHADOW_LIFT =
  "0 4px 6px -1px rgba(17,24,39,0.06), 0 10px 24px -8px rgba(17,24,39,0.08)";

const FEATURES = [
  {
    icon: CreditCard,
    title: "Instant virtual card issuance",
    desc: "Issue Naira and USD virtual cards in seconds for individuals and teams.",
  },
  {
    icon: ShieldCheck,
    title: "Built-in KYC verification",
    desc: "Identity verification and compliance checks built directly into the onboarding flow.",
  },
  {
    icon: Users,
    title: "Peer-to-peer transfers",
    desc: "Move funds between users and fund wallets instantly with no friction.",
  },
  {
    icon: Lock,
    title: "Programmable spend controls",
    desc: "Set granular limits and rules for individuals, teams, and departments.",
  },
  {
    icon: Zap,
    title: "Value-added services",
    desc: "Bill payments, airtime, utilities, and more built directly into the platform.",
  },
  {
    icon: BarChart3,
    title: "Enterprise fraud monitoring",
    desc: "Real-time transaction screening and anomaly detection at every step.",
  },
];

const STATS = [
  { value: "< 5s", label: "Card issuance time" },
  { value: "99.99%", label: "Network uptime SLA" },
  { value: "2", label: "Currency rails (NGN + USD)" },
  { value: "24/7", label: "Monitoring coverage" },
];

function PulsePayPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="border-b border-border bg-secondary py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          {/* Copy */}
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

            {/* Status + platform label */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Operational
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <Globe className="h-3 w-3" />
                Nigeria · Multi-currency
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="mailto:corporate@enicehq.com?subject=PulsePay%20Access%20Request"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Request Access
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
              </a>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                All Ventures
              </Link>
            </div>
          </div>

          {/* Card visual */}
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
                  <Wifi
                    className="h-4 w-4 rotate-90 text-white/80"
                    aria-hidden
                  />
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
                  <CreditCard
                    className="h-5 w-5 text-white/80"
                    strokeWidth={1.5}
                    aria-label="Virtual payment card"
                  />
                </div>
              </div>
            </div>
            {/* Shadow card behind */}
            <div
              className="absolute left-1/2 top-1/2 w-[72%] max-w-xs -translate-x-1/2 -translate-y-[60%] rotate-[6deg] rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.25 0.08 264) 0%, oklch(0.18 0.06 264) 100%)",
                aspectRatio: "1.586/1",
                opacity: 0.35,
                boxShadow: SHADOW_LIFT,
              }}
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
            {STATS.map((s) => (
              <div key={s.label} className="p-8 text-center">
                <div className="text-3xl font-semibold tracking-tight text-foreground">
                  {s.value}
                </div>
                <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform capabilities ── */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Platform Capabilities
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Everything a modern payments stack should be.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              PulsePay delivers the full payments infrastructure stack —
              issuance, compliance, transfers, and spending controls — in one
              integrated platform.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-xl border border-border bg-background p-6"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                  <f.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance callout ── */}
      <section className="border-y border-border bg-background py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border bg-secondary">
              <ShieldCheck className="h-6 w-6 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Compliance & Regulation
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Built for regulated markets from the ground up.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                PulsePay operates within Nigeria's regulatory framework, with
                SOC 2-aligned controls, row-level security, and audit-ready
                reporting. Every transaction is screened and logged in
                compliance with NDPC and relevant financial regulations.
              </p>
            </div>
            <div className="shrink-0">
              <div className="flex flex-wrap gap-2">
                {["SOC 2 Aligned", "RLS Enforced", "Audit Ready", "NDPC"].map(
                  (b) => (
                    <span
                      key={b}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground/70"
                    >
                      <Check
                        className="h-3 w-3 text-primary"
                        strokeWidth={2.5}
                      />
                      {b}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Get Started
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Ready to integrate PulsePay?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Contact our enterprise team to discuss integration options, pricing,
            and access to the PulsePay platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:corporate@enicehq.com?subject=PulsePay%20Access%20Request"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Request Access
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-7 py-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              View All Ventures
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
