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
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AboutMatrix } from "@/components/site/AboutMatrix";
import { NetworkMetrics } from "@/components/site/NetworkMetrics";
import { Roadmap } from "@/components/site/Roadmap";
import { Careers } from "@/components/site/Careers";
import { EcosystemRoadmap } from "@/components/site/EcosystemRoadmap";
import { InfraStack } from "@/components/site/InfraStack";
import { FAQSection } from "@/components/site/FAQSection";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { Reveal } from "@/components/site/Reveal";
import { AIChatbot } from "@/components/site/AIChatbot";
import { ComingSoon } from "@/components/site/ComingSoon";
import { isPreLaunch } from "@/lib/launch";

// ─── Time-gate wrapper ────────────────────────────────────────────────────────
// Renders the Coming Soon page until LAUNCH_DATE; then automatically swaps
// to the real landing page with no code change required.

function IndexPage() {
  // ?preview in the URL bypasses the launch gate so the team can review
  // the full site before launch. Remove the param to return to coming soon.
  const isPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("preview");

  const [launched, setLaunched] = useState(() => isPreview || !isPreLaunch());

  if (!launched) {
    return <ComingSoon onLaunched={() => setLaunched(true)} />;
  }
  return <Landing />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ENICE Group | Infrastructure for Global Commerce" },
      {
        name: "description",
        content:
          "ENICE Group is a technology venture studio and infrastructure holding firm. We build fintech platforms and enterprise AI systems, including PulsePay and PulseAssist.",
      },
      { property: "og:title", content: "ENICE Group" },
      {
        property: "og:description",
        content:
          "A venture ecosystem building fintech and enterprise AI infrastructure for institutions.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ENICE Group",
          url: "https://enicegroup.com",
          logo: "/logo.png",
          founder: {
            "@type": "Person",
            name: "Godson Chukwukemeka",
            jobTitle: "Founder & CEO",
          },
          subOrganization: [
            { "@type": "FinancialProduct", name: "PulsePay", description: "Virtual card issuance, programmable wallets, multi-currency rails, and embedded treasury." },
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

// ─── Shared shadow ────────────────────────────────────────────────────────────

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS = [
  { value: "02", label: "Active Ventures" },
  { value: "99.99%", label: "Infrastructure SLA" },
  { value: "3", label: "Core Verticals" },
  { value: "24/7", label: "Operations Coverage" },
];

const VERTICALS = [
  {
    icon: Banknote,
    kicker: "01 · Fintech",
    title: "Financial Infrastructure Systems",
    desc: "High-throughput transaction networks, secure ledger databases, and wallet infrastructure built for regional and cross-border payments.",
    bullets: ["Issuing and Wallets", "Treasury and Ledger", "Compliance Tooling"],
  },
  {
    icon: BrainCircuit,
    kicker: "02 · AI",
    title: "Autonomous Enterprise AI",
    desc: "Multi-tenant conversational AI that automates customer support, compliance monitoring, and daily operations for banks and telecoms.",
    bullets: ["Autonomous Support", "Policy-Bound Agents", "Workflow Automation"],
  },
  {
    icon: Boxes,
    kicker: "03 · Studio",
    title: "Venture Studio and Product Lab",
    desc: "We design and launch full-stack SaaS platforms, taking each venture from concept through institutional deployment and market expansion.",
    bullets: ["Concept and Capitalization", "Product and Engineering", "Go-to-Market"],
  },
];

const CORE_MODULES = [
  {
    icon: Cpu,
    label: "01",
    title: "Unified AI and Automation Pipeline",
    desc: "Centralized LLM orchestration and vector search routing that powers products like PulseAssist.",
  },
  {
    icon: Database,
    label: "02",
    title: "High-Velocity Ledger and Payment Core",
    desc: "A low-latency transaction engine and virtual account infrastructure that anchors platforms like PulsePay.",
  },
  {
    icon: FileCheck2,
    label: "03",
    title: "Automated Compliance and KYC Layer",
    desc: "Real-time identity verification, fraud detection, and regulatory screening shared across every product.",
  },
  {
    icon: Globe,
    label: "04",
    title: "Global Cloud Grid",
    desc: "Optimised database clustering and serverless edge delivery that supports 99.99% uptime and low-latency execution.",
  },
];

const PORTFOLIO_PREVIEW = [
  {
    tag: "Venture · Fintech",
    name: "PulsePay",
    desc: "A virtual payment platform for modern commerce, offering instant issuance, programmable controls, and embedded treasury.",
  },
  {
    tag: "Venture · Enterprise AI",
    name: "PulseAssist",
    desc: "An AI operations platform for banking, fintech, and telecoms, with autonomous queue handling and policy-bound automations.",
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
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-border bg-background">

        {/* Subtle grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 80%)",
          }}
        />

        {/* Soft blue radial glow at top */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2"
          style={{
            width: "800px",
            height: "400px",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="mx-auto max-w-5xl px-5 pb-28 pt-24 text-center sm:px-8 sm:pb-36 sm:pt-32">

          {/* Pill badge */}
          <div className="mb-8 flex justify-center px-4">
            <div className="flex w-fit items-center gap-2.5 rounded-full border border-border bg-secondary px-4 py-1.5 text-[11px] font-semibold tracking-[0.10em] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="whitespace-nowrap">Enterprise Venture Ecosystem · Est. 2026</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            The infrastructure powering the{" "}
            <span className="text-primary">next era of global commerce.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            ENICE Group designs, funds, and operates full-stack software
            ventures that deliver the financial and AI infrastructure modern
            institutions depend on.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/portfolio"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto"
            >
              Explore Portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex h-12 w-full items-center justify-center rounded-md border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              Corporate Overview
            </Link>
          </div>

          {/* Stats bar */}
          <div
            className="mt-20 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-background md:grid-cols-4"
            style={{ boxShadow: SHADOW_CARD }}
          >
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className={`p-7 text-left ${
                  i !== 0 ? "border-t border-border md:border-l md:border-t-0" : ""
                } ${i === 1 ? "border-t md:border-t-0" : ""}`}
              >
                <div className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
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

      {/* ══════════════════════════════════════════════════════════════
          ECOSYSTEM ROADMAP
      ══════════════════════════════════════════════════════════════ */}
      <EcosystemRoadmap />

      {/* ══════════════════════════════════════════════════════════════
          CORE VERTICALS
      ══════════════════════════════════════════════════════════════ */}
      <section id="verticals" className="bg-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Core Verticals
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
                Three pillars. One operating standard.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                The ENICE Group portfolio is organised around three focused
                competencies, each run with institutional discipline.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {VERTICALS.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <article
                  className="group flex h-full flex-col rounded-xl border border-border bg-background p-8 transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ boxShadow: SHADOW_CARD }}
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                      <v.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {v.kicker}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                    {v.desc}
                  </p>
                  <ul className="mt-7 space-y-2.5 border-t border-border pt-6">
                    {v.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-[13px] text-foreground/85">
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
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
          THE ENICE CORE
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-border bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Shared Ecosystem Infrastructure
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
                The ENICE Core.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Every venture we operate runs on our shared high-performance
                core, so each product inherits enterprise-grade scale from day
                one.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div
              className="mt-14 grid overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-2 lg:grid-cols-4"
              style={{ boxShadow: SHADOW_CARD }}
            >
              {CORE_MODULES.map((c, i) => (
                <div
                  key={c.title}
                  className={`group flex flex-col p-8 transition-colors hover:bg-secondary/60 ${
                    i !== 0
                      ? "border-t border-border sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:border-l lg:[&:nth-child(n)]:border-t-0 lg:[&:not(:first-child)]:border-l"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                      <c.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
                      /{c.label}
                    </span>
                  </div>
                  <h3 className="mt-8 text-[17px] font-semibold leading-snug tracking-tight text-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PORTFOLIO PREVIEW
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-border bg-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                  Portfolio · Active Ventures
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
                  Platforms built for institutional scale.
                </h2>
              </div>
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                View full portfolio
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {PORTFOLIO_PREVIEW.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <article
                  className="flex h-full flex-col rounded-xl border border-border bg-background p-8 transition-all hover:-translate-y-0.5 sm:p-10"
                  style={{ boxShadow: SHADOW_CARD }}
                >
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {p.tag}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {p.name}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                  <Link
                    to="/portfolio"
                    className="group/btn mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    View details
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-px group-hover/btn:translate-x-px" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CREDIBILITY BAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-border bg-background"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Compliance
                </div>
                <div className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                  Regulated in the Federal Republic of Nigeria
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:grid-cols-4">
              {COMPLIANCE_BADGES.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2.5 rounded-md border border-border bg-background px-4 py-2.5 text-[11px] font-semibold tracking-wide text-foreground/80"
                  style={{ boxShadow: SHADOW_CARD }}
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
      <AboutMatrix />
      <NetworkMetrics />
      <Roadmap />
      <InfraStack />
      <FAQSection />
      <Careers />

      <SiteFooter />
      <AIChatbot />
    </div>
  );
}
