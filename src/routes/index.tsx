import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  Activity,
  Zap,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AboutMatrix } from "@/components/site/AboutMatrix";
import { NetworkMetrics } from "@/components/site/NetworkMetrics";
import { Careers } from "@/components/site/Careers";
import { InfraStack } from "@/components/site/InfraStack";
import { FAQSection } from "@/components/site/FAQSection";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { Reveal } from "@/components/site/Reveal";
import { AIChatbot } from "@/components/site/AIChatbot";
import { ComingSoon } from "@/components/site/ComingSoon";
import { isPreLaunch } from "@/lib/launch";

function IndexPage() {
  const isPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("preview");
  const [launched, setLaunched] = useState(() => isPreview || !isPreLaunch());
  if (!launched) return <ComingSoon onLaunched={() => setLaunched(true)} />;
  return <Landing />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ENICE Group | Infrastructure for Global Commerce" },
      {
        name: "description",
        content:
          "ENICE Group is a technology venture studio and infrastructure holding firm building fintech platforms and enterprise AI systems — PulsePay, PulseAssist, ePulse, and PulseX.",
      },
      { property: "og:title", content: "ENICE Group — Infrastructure for Global Commerce" },
      {
        property: "og:description",
        content:
          "A venture ecosystem building fintech and enterprise AI infrastructure — PulsePay, PulseAssist, ePulse, and PulseX.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      { property: "og:url", content: "https://enicegroup.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      { name: "twitter:title", content: "ENICE Group — Infrastructure for Global Commerce" },
      {
        name: "twitter:description",
        content:
          "Venture studio building fintech and enterprise AI infrastructure for institutions. PulsePay · PulseAssist · ePulse · PulseX.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://enicegroup.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ENICE Group",
          url: "https://enicegroup.com",
          logo: "/logo.png",
          subOrganization: [
            { "@type": "FinancialProduct", name: "PulsePay", description: "Virtual card issuance, programmable wallets, and embedded treasury." },
            { "@type": "Organization", name: "PulseAssist", description: "Multi-tenant AI conversational SaaS for banking and telecom." },
            { "@type": "FinancialProduct", name: "EPulse", description: "Digital banking infrastructure." },
            { "@type": "FinancialProduct", name: "PulseX", description: "Global digital asset trading exchange." },
          ],
        }),
      },
    ],
  }),
  component: IndexPage,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS = [
  { value: "02", label: "Active Ventures" },
  { value: "99.99%", label: "Infrastructure SLA" },
  { value: "14ms", label: "API Latency P50" },
  { value: "24/7", label: "Operations Coverage" },
];

const VERTICALS = [
  {
    icon: Banknote,
    index: "01",
    kicker: "Fintech",
    title: "Financial Infrastructure Systems",
    desc: "High-throughput transaction networks, secure ledger databases, and virtual card infrastructure built for Nigeria's digital-first economy and positioned for regional expansion.",
    bullets: ["Virtual Card Issuance", "Treasury and Ledger", "KYC and Compliance Tooling"],
  },
  {
    icon: BrainCircuit,
    index: "02",
    kicker: "Artificial Intelligence",
    title: "Autonomous Enterprise AI",
    desc: "Multi-tenant conversational AI that automates customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms at institutional scale.",
    bullets: ["Autonomous Customer Support", "Policy-Bound AI Agents", "Workflow Automation"],
  },
  {
    icon: Boxes,
    index: "03",
    kicker: "Venture Studio",
    title: "Product Studio and Incubation",
    desc: "We design, fund, engineer, and operate full-stack SaaS platforms — taking each venture from concept through institutional deployment, market expansion, and long-term operation.",
    bullets: ["Concept to Capitalization", "Product and Engineering", "Go-to-Market Execution"],
  },
];

const CORE_MODULES = [
  {
    icon: Cpu,
    index: "01",
    title: "Unified AI and Automation Pipeline",
    desc: "Centralized LLM orchestration and vector search routing that powers enterprise products like PulseAssist across every tenant.",
  },
  {
    icon: Database,
    index: "02",
    title: "High-Velocity Ledger and Payment Core",
    desc: "A low-latency transaction engine and virtual account infrastructure that anchors PulsePay and future financial platforms.",
  },
  {
    icon: FileCheck2,
    index: "03",
    title: "Automated Compliance and KYC Layer",
    desc: "Real-time identity verification, fraud detection, and regulatory screening shared across every product in the ecosystem.",
  },
  {
    icon: Globe,
    index: "04",
    title: "Global Cloud Grid",
    desc: "Optimised database clustering and serverless edge delivery supporting 99.99% uptime and sub-20ms execution across platforms.",
  },
];

const PORTFOLIO_PREVIEW = [
  {
    tag: "Venture · Fintech Infrastructure",
    name: "PulsePay",
    desc: "A virtual payment platform for modern commerce — offering instant Naira card issuance, programmable wallets, embedded KYC, and peer-to-peer transfers built for Nigerian institutions.",
    stat1: { label: "Card Issuance", value: "< 5s" },
    stat2: { label: "Uptime SLA", value: "99.99%" },
    to: "/portfolio/pulsepay" as const,
  },
  {
    tag: "Venture · Enterprise AI",
    name: "PulseAssist",
    desc: "An AI operations platform for banking, fintech, and telecoms — with autonomous queue handling, real-time agent handoff, and policy-bound workflow automations at scale.",
    stat1: { label: "Response Latency", value: "< 80ms" },
    stat2: { label: "Concurrent Tenants", value: "∞" },
    to: "/portfolio/pulseassist" as const,
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
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/15">
      <ScrollProgress />
      <SiteHeader />

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
            background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 65%)",
          }}
        />
        {/* Secondary glow — top right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-20"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.10) 0%, transparent 60%)",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-1 items-center">
          <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-36">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">

              {/* ── Left: Copy ── */}
              <div className="max-w-2xl">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-semibold tracking-[0.06em] text-white/60 sm:tracking-[0.12em]">
                    Enterprise Venture Ecosystem<span className="hidden sm:inline"> · Est. 2026</span>
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-[2.1rem] font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                  The infrastructure
                  <br />
                  <span className="text-blue-400">powering the next</span>
                  <br />
                  era of global
                  <br />
                  commerce.
                </h1>

                {/* Subheadline */}
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/55 sm:mt-8 sm:text-lg">
                  ENICE Group designs, funds, and operates full-stack software
                  ventures that deliver the financial and AI infrastructure
                  modern institutions depend on.
                </p>

                {/* CTAs */}
                <div className="mt-7 flex flex-wrap gap-3 sm:mt-10">
                  <Link
                    to="/portfolio"
                    className="group inline-flex h-11 items-center gap-2 rounded-md bg-white px-6 text-[13px] font-semibold text-[#060912] transition-all hover:bg-white/90 sm:h-12 sm:px-7"
                  >
                    Explore Portfolio
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-6 text-[13px] font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 hover:text-white sm:h-12 sm:px-7"
                  >
                    Corporate Overview
                  </Link>
                </div>

                {/* Trust signals */}
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {["SOC 2 Aligned", "RLS Enforced", "NDPC Compliant", "99.99% SLA"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 text-[11px] font-medium text-white/40">
                      <Check className="h-3 w-3 text-blue-400" strokeWidth={2.5} />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Right: Live ecosystem dashboard ── */}
              <div className="hidden lg:flex lg:justify-end">
                <div className="relative w-full max-w-[480px]">
                  {/* Outer glow halo */}
                  <div
                    aria-hidden
                    className="absolute -inset-px rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(99,102,241,0.10) 50%, transparent 70%)",
                    }}
                  />

                  <div
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1421]"
                    style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)" }}
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
                          ENICE Core · Control Panel
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
                          sub: "Fintech Infrastructure",
                          iconEl: CreditCard,
                          iconBg: "bg-blue-500/15",
                          iconColor: "text-blue-400",
                          metric: "99.99% SLA",
                        },
                        {
                          name: "PulseAssist",
                          sub: "Enterprise AI Platform",
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
                            <div className={`grid h-9 w-9 place-items-center rounded-lg ${v.iconBg}`}>
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
                            <div className="mt-0.5 font-mono text-[10px] text-white/35">{v.metric}</div>
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
                            <div className="font-mono text-[15px] font-semibold text-white">{m.value}</div>
                            <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/30">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* API snippet */}
                      <div className="rounded-xl border border-white/6 bg-black/40 p-4 font-mono text-[11px] leading-relaxed">
                        <div className="text-blue-400">$ GET /v1/core/status</div>
                        <div className="mt-2 text-white/20">{"{"}</div>
                        <div className="pl-4 text-white/55">
                          "status":{" "}
                          <span className="text-emerald-400">"operational"</span>,
                        </div>
                        <div className="pl-4 text-white/55">
                          "ventures":{" "}
                          <span className="text-blue-300">["PulsePay", "PulseAssist"]</span>,
                        </div>
                        <div className="pl-4 text-white/55">
                          "uptime_sla":{" "}
                          <span className="text-yellow-300/80">"99.99%"</span>
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
              {HERO_STATS.map((s) => (
                <div
                  key={s.label}
                  className="p-5 sm:p-7"
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

      {/* ══════════════════════════════════════════════════════════════
          CORE VERTICALS — Light, premium numbered cards
      ══════════════════════════════════════════════════════════════ */}
      <section id="verticals" className="bg-white py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-16 max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                Core Verticals
              </div>
              <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-[3.25rem]">
                Three pillars.
                <br />
                One operating standard.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                The ENICE Group portfolio is organised around three focused
                competencies, each operated with institutional discipline and
                built to compound over time.
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
                      <li key={b} className="flex items-center gap-3 text-[13px] font-medium text-foreground/80">
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
            background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-16 max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-blue-400">
                Shared Ecosystem Infrastructure
              </div>
              <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-[3.25rem]">
                The ENICE Core.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/50">
                Every venture we operate runs on our shared high-performance
                infrastructure core — so each product inherits enterprise-grade
                scale, compliance, and reliability from day one.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2">
              {CORE_MODULES.map((c, i) => (
                <div
                  key={c.title}
                  className="group flex flex-col bg-[#060912] p-10 transition-colors hover:bg-white/[0.03] xl:p-12"
                >
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
                  <p className="mt-3 text-[14px] leading-relaxed text-white/45">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PORTFOLIO PREVIEW — Premium cards with product visuals
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-border bg-secondary py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                  Portfolio · Active Ventures
                </div>
                <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl">
                  Platforms built for
                  <br />
                  institutional scale.
                </h2>
              </div>
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-white"
              >
                View full portfolio
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2">
            {PORTFOLIO_PREVIEW.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <article
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.06)" }}
                >
                  {/* Product visual strip */}
                  <div className="relative h-72 overflow-hidden border-b border-border bg-secondary">
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
                        {/* Shadow card */}
                        <div
                          aria-hidden
                          className="absolute rounded-2xl"
                          style={{
                            width: "62%",
                            maxWidth: "250px",
                            aspectRatio: "1.586/1",
                            background: "linear-gradient(135deg, #b0b8c8 0%, #8a94a6 100%)",
                            opacity: 0.55,
                            transform: "rotate(6deg) translate(12%, -16%)",
                            boxShadow: "0 12px 30px rgba(17,24,39,0.18)",
                          }}
                        />
                        {/* Main card */}
                        <div
                          className="relative flex flex-col justify-between rounded-2xl p-4 text-white"
                          style={{
                            width: "62%",
                            maxWidth: "250px",
                            aspectRatio: "1.586/1",
                            background: "linear-gradient(135deg, #1a2e6b 0%, #0f1f52 55%, #162560 100%)",
                            transform: "rotate(-4deg)",
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
                              <div className="text-[6px] uppercase tracking-[0.2em] text-white/50">Cardholder</div>
                              <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/95">
                                ENICE GROUP
                              </div>
                            </div>
                            <CreditCard className="h-4 w-4 text-white/60" strokeWidth={1.5} />
                          </div>
                        </div>
                      </div>
                    ) : (
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
                              <span className={`relative flex h-1.5 w-1.5 shrink-0 ${!r.live && "opacity-40"}`}>
                                {r.live && <span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-75" />}
                                <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                              </span>
                              <span className="font-mono text-[9px] tracking-wider text-muted-foreground">{r.id}</span>
                              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-border">
                                <div className={`h-full rounded-full bg-primary ${r.w}`} />
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{r.label}</span>
                            </div>
                          ))}
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
                        <div key={s.label} className="rounded-lg border border-border bg-secondary/60 px-4 py-3">
                          <div className="font-mono text-xl font-bold tracking-tight text-foreground">{s.value}</div>
                          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
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
                style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(37,99,235,0.08) 0%, transparent 60%)" }}
              />
              <div className="relative max-w-4xl">
                <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary">From the Founders</div>
                <div className="mt-6 space-y-5 text-[16px] leading-[1.8] text-muted-foreground">
                  <p>
                    Every great business depends on great infrastructure. That's the belief that inspired ENICE Group. We aren't here to build technology for its own sake — we're here to build products that solve meaningful problems, empower businesses to grow, and create the digital infrastructure that people and organizations can rely on for years to come.
                  </p>
                  <p>
                    That vision wasn't born in a boardroom. It came from lived experience. We experienced the frustrations of everyday life in Nigeria — reaching out to companies for help only to face long wait times, poor customer service, and unnecessary friction. We experienced financial platforms that failed when they mattered most, from declined international cards to everyday payment challenges that made simple tasks unnecessarily difficult.
                  </p>
                  <p>
                    We refused to accept that these experiences should be normal. ENICE Group was founded on the belief that African businesses and consumers deserve technology that is reliable, secure, and built to global standards. Every venture we launch is another step toward making that belief a reality — not only for Africa, but for the world.
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

      <SiteFooter />
      <AIChatbot />
    </div>
  );
}
