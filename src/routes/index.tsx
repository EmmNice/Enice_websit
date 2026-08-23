import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Banknote,
  BrainCircuit,
  ShieldCheck,
  Wifi,
  Lock,
  Check,
  Cpu,
  Database,
  Globe,
  FileCheck2,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AboutMatrix } from "@/components/site/AboutMatrix";
import { NetworkMetrics } from "@/components/site/NetworkMetrics";
import { Careers } from "@/components/site/Careers";
import { InfraStack } from "@/components/site/InfraStack";
import { FAQSection } from "@/components/site/FAQSection";
import { FAQS } from "@/lib/faqs";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { Reveal } from "@/components/site/Reveal";
import { PartnersStrip } from "@/components/site/PartnersStrip";
import { StyledText } from "@/components/site/StyledText";
import { useSectionFields, fieldText } from "@/lib/cms/use-section";
import { ContactSection } from "@/components/site/ContactSection";
import { faqJsonLd, organizationJsonLd, pageHead, webSiteJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead("/", [organizationJsonLd(), webSiteJsonLd(), faqJsonLd(FAQS)]),
  component: Landing,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS = [
  { value: "4", label: "Products in Ecosystem" },
  { value: "99.99%", label: "Infrastructure SLA" },
  { value: "< 14ms", label: "API Latency P50" },
  { value: "AES-256", label: "Encryption Standard" },
];

const VERTICALS = [
  {
    icon: Banknote,
    index: "01",
    kicker: "Fintech",
    title: "Financial Infrastructure Systems",
    desc: "Transaction networks, ledger databases, and virtual card infrastructure built for Nigeria's digital economy, with room to expand across the region.",
    bullets: ["Virtual Card Issuance", "Treasury and Ledger", "KYC and Compliance Tooling"],
  },
  {
    icon: BrainCircuit,
    index: "02",
    kicker: "Artificial Intelligence",
    title: "Autonomous Enterprise AI",
    desc: "Conversational AI that handles customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms.",
    bullets: ["Autonomous Customer Support", "Policy-Bound AI Agents", "Workflow Automation"],
  },
  {
    icon: Boxes,
    index: "03",
    kicker: "Product Engineering",
    title: "Products built to operate",
    desc: "We build, own, and operate full-stack products. Each platform starts from a real customer problem and goes through engineering, launch, and day-to-day operation.",
    bullets: ["Product Ownership", "Platform Engineering", "Continuous Operation"],
  },
];

const CORE_MODULES = [
  {
    icon: Cpu,
    index: "01",
    title: "Unified AI and Automation Pipeline",
    desc: "Centralized LLM orchestration and vector search routing that powers products like PulseAssist across every tenant.",
  },
  {
    icon: Database,
    index: "02",
    title: "High-Velocity Ledger and Payment Core",
    desc: "A fast transaction engine and virtual account infrastructure that anchors PulsePay and the financial products we build next.",
  },
  {
    icon: FileCheck2,
    index: "03",
    title: "Automated Compliance and KYC Layer",
    desc: "Identity verification, fraud detection, and regulatory screening, run in real time and shared across every product.",
  },
  {
    icon: Globe,
    index: "04",
    title: "Global Cloud Grid",
    desc: "Database clustering and serverless edge delivery that keep uptime at 99.99% and execution under 20ms across platforms.",
  },
];

const PORTFOLIO_PREVIEW = [
  {
    tag: "Venture · Fintech Infrastructure",
    name: "PulsePay",
    desc: "A virtual payment platform for modern commerce: instant Naira card issuance, programmable wallets, embedded KYC, and peer-to-peer transfers built for Nigerian institutions.",
    stat1: { label: "Card Issuance", value: "< 5s" },
    stat2: { label: "Uptime SLA", value: "99.99%" },
    to: "/portfolio/pulsepay" as const,
  },
  {
    tag: "Venture · Enterprise AI",
    name: "PulseAssist",
    desc: "An AI operations platform for banking, fintech, and telecoms, with automated queue handling, live agent handoff, and policy-bound workflow automation.",
    stat1: { label: "Response Latency", value: "< 80ms" },
    stat2: { label: "Concurrent Tenants", value: "∞" },
    to: "/portfolio/pulseassist" as const,
  },
  {
    tag: "Venture · Fintech Infrastructure",
    name: "PulsePay Payment Collection",
    desc: "Payment infrastructure for businesses to accept and manage customer payments through a single, developer friendly API, with real time updates and webhook notifications.",
    stat1: { label: "Launch", value: "Q1 2027" },
    stat2: { label: "Integration", value: "1 API" },
    to: "/portfolio/payment-collection" as const,
  },
];

const COMPLIANCE_BADGES = [
  { icon: Lock, label: "SOC 2 Aligned" },
  { icon: ShieldCheck, label: "RLS Enforced" },
  { icon: Wifi, label: "Active-Active" },
  { icon: Check, label: "Audit Ready" },
];

// ─── Component ────────────────────────────────────────────────────────────────

function Landing() {
  // Editable homepage sections. Each reads its CMS content and falls back to the built-in copy
  // below, so the page is identical until an administrator edits a section and reflects the edit
  // from then on. Text fields accept the **bold** / [[highlight]] styling syntax.
  const hero = useSectionFields("home.hero");

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/15">
      <ScrollProgress />
      <SiteHeader />
      <main id="main">
        {/* ══════════════════════════════════════════════════════════════
          HERO — Dark, full-screen, split layout
      ══════════════════════════════════════════════════════════════ */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#060912]">
          {/* Background grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 40%, transparent 80%)",
            }}
          />

          {/* Primary radial glow — top center */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-0 -translate-x-1/2"
            style={{
              width: "1000px",
              height: "600px",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 65%)",
            }}
          />
          {/* Secondary glow — top right */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-20"
            style={{
              width: "600px",
              height: "600px",
              background:
                "radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.10) 0%, transparent 60%)",
            }}
          />

          {/* Main content */}
          <div className="relative z-10 flex flex-1 items-center">
            <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-36">
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
                {/* ── Left: Copy ── */}
                <div className="max-w-2xl">
                  {/* Badge */}
                  <div
                    className="animate-hero-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
                    style={{ animationDelay: "0ms" }}
                  >
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                    </span>
                    <span className="whitespace-nowrap text-[11px] font-semibold tracking-[0.06em] text-white/60 sm:tracking-[0.12em]">
                      <StyledText
                        text={fieldText(hero, "eyebrow", "Technology Group · Building for Africa")}
                        accentClassName="text-blue-400"
                      />
                    </span>
                  </div>

                  {/* Headline */}
                  <h1
                    className="animate-hero-up text-[2.1rem] font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
                    style={{ animationDelay: "100ms" }}
                  >
                    <StyledText
                      text={fieldText(
                        hero,
                        "heading",
                        "We build the technology\n[[behind Africa's next]]\ngeneration of\nbusinesses.",
                      )}
                      accentClassName="text-blue-400"
                    />
                  </h1>

                  {/* Subheadline */}
                  <p
                    className="animate-hero-up mt-5 max-w-xl text-base leading-relaxed text-white/55 sm:mt-8 sm:text-lg"
                    style={{ animationDelay: "200ms" }}
                  >
                    <StyledText
                      text={fieldText(
                        hero,
                        "subheading",
                        "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
                      )}
                      accentClassName="text-blue-400"
                    />
                  </p>

                  {/* CTAs */}
                  <div
                    className="animate-hero-up mt-7 flex flex-wrap gap-3 sm:mt-10"
                    style={{ animationDelay: "300ms" }}
                  >
                    <a
                      href={fieldText(hero, "primaryCtaUrl", "/portfolio")}
                      className="group inline-flex h-11 items-center gap-2 rounded-md bg-white px-6 text-[13px] font-semibold text-[#060912] transition-all hover:bg-white/90 sm:h-12 sm:px-7"
                    >
                      {fieldText(hero, "primaryCtaLabel", "Explore our products")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                    <a
                      href={fieldText(hero, "secondaryCtaUrl", "/about")}
                      className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-6 text-[13px] font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 hover:text-white sm:h-12 sm:px-7"
                    >
                      {fieldText(hero, "secondaryCtaLabel", "What we build")}
                    </a>
                  </div>

                  {/* Trust signals */}
                  <div
                    className="animate-hero-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
                    style={{ animationDelay: "450ms" }}
                  >
                    {["SOC 2 Aligned", "RLS Enforced", "NDPC Compliant", "99.99% SLA"].map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-white/40"
                      >
                        <Check className="h-3 w-3 text-blue-400" strokeWidth={2.5} />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Right: Live ecosystem dashboard ── */}
                <div
                  className="hidden lg:flex lg:justify-end"
                  style={{ animation: "heroRight 1.1s cubic-bezier(0.16,1,0.3,1) 250ms both" }}
                >
                  <div className="relative w-full max-w-[480px]">
                    {/* Outer glow halo */}
                    <div
                      aria-hidden
                      className="absolute -inset-px rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(99,102,241,0.10) 50%, transparent 70%)",
                      }}
                    />

                    <div
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1421]"
                      style={{
                        boxShadow:
                          "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
                      }}
                    >
                      {/* Titlebar */}
                      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                          </div>
                          <span className="font-mono text-[10px] text-white/35">
                            ENICE Product Systems · Control Panel
                          </span>
                        </div>
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          </span>
                          All Systems Operational
                        </span>
                      </div>

                      <div className="space-y-3 p-5">
                        {/* Venture status rows */}
                        {[
                          {
                            name: "PulsePay",
                            sub: "Digital Financial Platform",
                            iconEl: CreditCard,
                            iconBg: "bg-blue-500/15",
                            iconColor: "text-blue-400",
                            metric: "99.99% SLA",
                          },
                          {
                            name: "PulseAssist",
                            sub: "AI Business Communication",
                            iconEl: BrainCircuit,
                            iconBg: "bg-violet-500/15",
                            iconColor: "text-violet-400",
                            metric: "< 80ms P50",
                          },
                        ].map((v) => (
                          <div
                            key={v.name}
                            className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.03] px-4 py-3.5"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`grid h-9 w-9 place-items-center rounded-lg ${v.iconBg}`}
                              >
                                <v.iconEl className={`h-4 w-4 ${v.iconColor}`} strokeWidth={1.75} />
                              </div>
                              <div>
                                <div className="text-[13px] font-semibold text-white">{v.name}</div>
                                <div className="text-[10px] text-white/35">{v.sub}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Operational
                              </div>
                              <div className="mt-0.5 font-mono text-[10px] text-white/35">
                                {v.metric}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Core metrics */}
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { label: "API Latency", value: "14ms" },
                            { label: "Uptime", value: "99.99%" },
                            { label: "Encryption", value: "AES-256" },
                          ].map((m) => (
                            <div
                              key={m.label}
                              className="rounded-lg border border-white/6 bg-white/[0.03] py-3 text-center"
                            >
                              <div className="font-mono text-[15px] font-semibold text-white">
                                {m.value}
                              </div>
                              <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/30">
                                {m.label}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* API snippet */}
                        <div className="rounded-xl border border-white/6 bg-black/40 p-4 font-mono text-[11px] leading-relaxed">
                          <div className="text-blue-400">$ GET /v1/core/status</div>
                          <div className="mt-2 text-white/20">{"{"}</div>
                          <div className="pl-4 text-white/55">
                            "status": <span className="text-emerald-400">"operational"</span>,
                          </div>
                          <div className="pl-4 text-white/55">
                            "products":{" "}
                            <span className="text-blue-300">["PulsePay", "PulseAssist"]</span>,
                          </div>
                          <div className="pl-4 text-white/55">
                            "uptime_sla": <span className="text-yellow-300/80">"99.99%"</span>
                          </div>
                          <div className="text-white/20">{"}"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip — bottom of hero */}
          <div className="relative z-10 border-t border-white/8">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="grid grid-cols-2 divide-x divide-y divide-white/8 md:grid-cols-4 md:divide-y-0">
                {HERO_STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className="animate-hero-up p-5 sm:p-7"
                    style={{ animationDelay: `${500 + i * 80}ms` }}
                  >
                    <div className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {s.value}
                    </div>
                    <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Partners marquee — right after hero */}
        <PartnersStrip />

        {/* ══════════════════════════════════════════════════════════════
          WHAT WE'RE BUILDING — Light, premium numbered cards
      ══════════════════════════════════════════════════════════════ */}
        <section id="verticals" className="bg-white py-28 sm:py-36">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <div className="mb-16 max-w-3xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                  What we're building
                </div>
                <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-[3.25rem]">
                  Products and platforms.
                  <br />
                  Built to one standard.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  ENICE Group takes hard problems in financial services and business communication
                  and turns them into products people can rely on.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3">
              {VERTICALS.map((v, i) => (
                <Reveal key={v.title} delay={i * 60}>
                  <article className="group flex h-full flex-col bg-white p-10 transition-colors hover:bg-secondary/40 xl:p-12">
                    <div className="flex items-start justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15">
                        <v.icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <span className="font-mono text-[11px] font-bold tracking-[0.22em] text-muted-foreground/40">
                        /{v.index}
                      </span>
                    </div>

                    <div className="mt-8">
                      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                        {v.kicker}
                      </div>
                      <h3 className="mt-2 text-[1.4rem] font-bold leading-snug tracking-tight text-foreground">
                        {v.title}
                      </h3>
                      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                        {v.desc}
                      </p>
                    </div>

                    <ul className="mt-8 space-y-3 border-t border-border pt-7">
                      {v.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-center gap-3 text-[13px] font-medium text-foreground/80"
                        >
                          <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/8">
                            <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                          </div>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>

            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              {[
                {
                  title: "Built around real problems",
                  desc: "We start with problems people and businesses actually face.",
                },
                {
                  title: "Built to grow",
                  desc: "Our products are designed to support users as their needs grow.",
                },
                {
                  title: "Built in Africa",
                  desc: "We understand the realities of African markets and build with those realities in mind.",
                },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="h-full bg-white p-8">
                    <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
          THE ENICE CORE — Dark, dramatic
      ══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#060912] py-28 sm:py-36">
          {/* Background grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          {/* Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
            style={{
              width: "800px",
              height: "500px",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 65%)",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <div className="mb-16 max-w-3xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-blue-400">
                  What powers our products
                </div>
                <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-[3.25rem]">
                  The ENICE Core.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/50">
                  Every product we operate runs on a shared infrastructure core, so the software
                  customers use inherits scale, compliance, and reliability from the ground up.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2">
              {CORE_MODULES.map((c, i) => (
                <Reveal key={c.title} delay={i * 90} direction={i % 2 === 0 ? "left" : "right"}>
                  <div className="group flex h-full flex-col bg-[#060912] p-10 transition-colors hover:bg-white/[0.03] xl:p-12">
                    <div className="flex items-start justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5 text-blue-400">
                        <c.icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <span className="font-mono text-[11px] font-bold tracking-[0.22em] text-white/20">
                        /{c.index}
                      </span>
                    </div>
                    <h3 className="mt-8 text-[1.2rem] font-bold leading-snug tracking-tight text-white">
                      {c.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-white/45">{c.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
          PRODUCTS — Premium cards with product visuals
      ══════════════════════════════════════════════════════════════ */}
        <section className="border-y border-border bg-secondary py-28 sm:py-36">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                    Products, built and operated by ENICE
                  </div>
                  <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl">
                    Products built for
                    <br />
                    institutional scale.
                  </h2>
                </div>
                <Link
                  to="/portfolio"
                  className="group inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-white"
                >
                  Explore all products
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>

            <div className="grid gap-6 lg:grid-cols-3">
              {PORTFOLIO_PREVIEW.map((p, i) => (
                <Reveal key={p.name} delay={i * 80}>
                  <article
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    style={{
                      boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.06)",
                    }}
                  >
                    {/* Product visual strip */}
                    <div className="relative h-72 border-b border-border bg-secondary">
                      <div
                        aria-hidden
                        className="absolute inset-0 opacity-50"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(17,24,39,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.04) 1px, transparent 1px)",
                          backgroundSize: "28px 28px",
                        }}
                      />
                      {i === 0 ? (
                        /* PulsePay card visual */
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* Shadow card — same fixed width as main card */}
                          <div
                            aria-hidden
                            className="absolute rounded-2xl"
                            style={{
                              width: 220,
                              aspectRatio: "1.586/1",
                              background: "linear-gradient(135deg, #b0b8c8 0%, #8a94a6 100%)",
                              opacity: 0.55,
                              transform: "rotate(5deg) translate(10%, -8%)",
                              boxShadow: "0 12px 30px rgba(17,24,39,0.18)",
                            }}
                          />
                          {/* Main card */}
                          <div
                            className="relative flex flex-col justify-between rounded-2xl p-4 text-white"
                            style={{
                              width: 220,
                              aspectRatio: "1.586/1",
                              background:
                                "linear-gradient(135deg, #1a2e6b 0%, #0f1f52 55%, #162560 100%)",
                              transform: "rotate(-3deg)",
                              boxShadow: "0 20px 50px rgba(17,24,39,0.35)",
                            }}
                          >
                            {/* Top row: brand + NFC */}
                            <div className="flex items-start justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/90">
                                PulsePay
                              </span>
                              <Wifi className="h-3.5 w-3.5 rotate-90 text-white/70" />
                            </div>
                            {/* Chip */}
                            <div className="h-6 w-9 rounded-md bg-gradient-to-br from-yellow-100 to-amber-400" />
                            {/* Card number */}
                            <div className="font-mono text-[9px] tracking-[0.2em] text-white/80">
                              •••• •••• •••• ••••
                            </div>
                            {/* Bottom row: name + card icon */}
                            <div className="flex items-end justify-between">
                              <div>
                                <div className="text-[6px] uppercase tracking-[0.2em] text-white/50">
                                  Cardholder
                                </div>
                                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/95">
                                  ENICE GROUP
                                </div>
                              </div>
                              <CreditCard className="h-4 w-4 text-white/60" strokeWidth={1.5} />
                            </div>
                          </div>
                        </div>
                      ) : i === 1 ? (
                        /* PulseAssist queue visual */
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                          <div className="w-full max-w-xs space-y-2">
                            {[
                              { id: "REQ_001", label: "Resolved", w: "w-full", live: false },
                              { id: "REQ_002", label: "Routing", w: "w-[78%]", live: false },
                              { id: "REQ_003", label: "Processing", w: "w-[58%]", live: true },
                              { id: "REQ_004", label: "Queued", w: "w-[38%]", live: false },
                            ].map((r) => (
                              <div
                                key={r.id}
                                className="flex items-center gap-2.5 rounded-md border border-border bg-background px-3 py-2"
                                style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
                              >
                                <span
                                  className={`relative flex h-1.5 w-1.5 shrink-0 ${!r.live && "opacity-40"}`}
                                >
                                  {r.live && (
                                    <span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                  )}
                                  <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                                </span>
                                <span className="font-mono text-[9px] tracking-wider text-muted-foreground">
                                  {r.id}
                                </span>
                                <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-border">
                                  <div className={`h-full rounded-full bg-primary ${r.w}`} />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                  {r.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* PulsePay Payment Collection notification visual */
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                          <div
                            className="w-full max-w-[260px] rounded-xl border border-border bg-background p-4"
                            style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.06)" }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                                <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                              </span>
                              <div>
                                <div className="text-[11px] font-semibold text-foreground">
                                  Payment Received
                                </div>
                                <div className="text-[9px] text-muted-foreground">
                                  from a customer
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 font-mono text-xl font-semibold tracking-tight text-foreground">
                              ₦45,000.00
                            </div>
                            <div className="mt-1 text-[9px] text-muted-foreground/70">Just now</div>
                            <div className="mt-4 space-y-1.5 border-t border-border pt-3">
                              {[
                                "Customer pays",
                                "Payment processed",
                                "Business receives funds",
                              ].map((step, i) => (
                                <div
                                  key={step}
                                  className="flex items-center gap-2 text-[10px] text-muted-foreground"
                                >
                                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-secondary text-[8px] font-semibold text-foreground/70">
                                    {i + 1}
                                  </span>
                                  {step}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="flex flex-1 flex-col p-8 sm:p-10">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        {p.tag}
                      </div>
                      <h3 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                        {p.name}
                      </h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                        {p.desc}
                      </p>

                      {/* Key stats */}
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        {[p.stat1, p.stat2].map((s) => (
                          <div
                            key={s.label}
                            className="rounded-lg border border-border bg-secondary/60 px-4 py-3"
                          >
                            <div className="font-mono text-xl font-bold tracking-tight text-foreground">
                              {s.value}
                            </div>
                            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Link
                        to={p.to}
                        className="group/btn mt-7 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                        aria-label={`View ${p.name} platform details`}
                      >
                        View Platform
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-px group-hover/btn:translate-x-px" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <AboutMatrix />

        {/* ══════════════════════════════════════════════════════════════
          FROM THE FOUNDERS
      ══════════════════════════════════════════════════════════════ */}
        <section className="border-b border-border bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/40 p-6 sm:p-16">
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-60"
                  style={{
                    background:
                      "radial-gradient(ellipse at 100% 0%, rgba(37,99,235,0.08) 0%, transparent 60%)",
                  }}
                />
                <div className="relative max-w-4xl">
                  <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary">
                    From the Founders
                  </div>
                  <div className="mt-6 space-y-5 text-[16px] leading-[1.8] text-muted-foreground">
                    <p>
                      Every good business runs on good infrastructure. That's the idea behind ENICE
                      Group. We don't build technology for its own sake. We build products that
                      solve real problems and give people and businesses infrastructure they can
                      depend on for years.
                    </p>
                    <p>
                      That idea didn't start in a boardroom. It came from everyday life in Nigeria:
                      calling a company for help and waiting too long, dealing with poor service,
                      hitting friction that shouldn't exist. It came from financial platforms that
                      failed exactly when we needed them, from declined international cards to
                      simple payments that turned into a headache.
                    </p>
                    <p>
                      We decided that shouldn't be normal. ENICE Group exists because African
                      businesses and consumers deserve technology that is reliable, secure, and
                      built to the same standard as anywhere else. Every product we launch is a step
                      toward that, for Africa first, and for the world as we grow.
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                    <div className="h-px flex-1 bg-border" />
                    <p className="font-mono text-[12px] font-medium tracking-[0.14em] text-muted-foreground/70">
                      — The Founders, ENICE Group
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
          CREDIBILITY BAR
      ══════════════════════════════════════════════════════════════ */}
        <section className="border-b border-border bg-white py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center lg:gap-8">
              <div className="flex items-center gap-4">
                <div className="grid h-13 w-13 place-items-center rounded-xl border border-border bg-secondary shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Compliance
                  </div>
                  <div className="mt-0.5 text-[15px] font-bold tracking-tight text-foreground">
                    Regulated in the Federal Republic of Nigeria
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                {COMPLIANCE_BADGES.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/80 px-4 py-2.5 text-[11px] font-semibold tracking-wide text-foreground/80"
                    style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
                  >
                    <b.icon className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} />
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
          REMAINING SECTIONS
      ══════════════════════════════════════════════════════════════ */}
        <NetworkMetrics />
        <InfraStack />
        <FAQSection />
        <Careers />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
