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
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AboutMatrix } from "@/components/site/AboutMatrix";
import { NetworkMetrics } from "@/components/site/NetworkMetrics";
import { Roadmap } from "@/components/site/Roadmap";
import { Careers } from "@/components/site/Careers";

import { AIChatbot } from "@/components/site/AIChatbot";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ENICE Group — Engineering the Infrastructure for Global Commerce" },
      {
        name: "description",
        content:
          "ENICE Group is a technology venture studio and infrastructure holding firm building fintech platforms and enterprise AI systems — home of PulsePay and PulseAssist.",
      },
      { property: "og:title", content: "ENICE Group" },
      {
        property: "og:description",
        content:
          "An institutional venture ecosystem building fintech and operational AI infrastructure.",
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
            {
              "@type": "FinancialProduct",
              name: "PulsePay",
              description:
                "Premium fintech utility payment and digital wallet platform.",
            },
            {
              "@type": "Organization",
              name: "PulseAssist",
              description:
                "Multi-tenant, AI-driven omnichannel helpdesk SaaS solutions.",
            },
            {
              "@type": "FinancialProduct",
              name: "EPulse",
              description: "Standard premium digital banking infrastructure.",
            },
            {
              "@type": "FinancialProduct",
              name: "PulseX",
              description:
                "Elite global cryptocurrency asset trading exchange.",
            },
          ],
        }),
      },
    ],
  }),
  component: Landing,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

function Landing() {
  const verticals = [
    {
      icon: Banknote,
      kicker: "01 — Fintech",
      title: "Financial Infrastructure Systems",
      desc: "Architecting high-throughput virtual transaction networks, secure ledger databases, and automated wallet infrastructures optimized for regional and cross-border payment deployment.",
      bullets: ["Issuing & Wallets", "Treasury & Ledger", "Compliance Tooling"],
    },
    {
      icon: BrainCircuit,
      kicker: "02 — AI",
      title: "Autonomous Enterprise AI",
      desc: "Developing high-capacity, multi-tenant voice and digital conversational AI systems tailored to automate customer relations, compliance tracking, and operations within telecommunications and banking.",
      bullets: ["Autonomous Support", "Policy-Bound Agents", "Workflow Automation"],
    },
    {
      icon: Boxes,
      kicker: "03 — Studio",
      title: "Venture Studio & Project Lab",
      desc: "Incubating, engineering, and launching highly disruptive full-stack SaaS applications, driving technology ventures from conceptual proof-of-concept to global market expansion.",
      bullets: ["Concept & Capitalization", "Product & Engineering", "Go-to-Market"],
    },
  ];

  const core = [
    {
      icon: Cpu,
      label: "01",
      title: "Unified AI & Automation Pipeline",
      desc: "Centralized, secure LLM orchestration and vector search routing that powers predictive tools like PulseAssist.",
    },
    {
      icon: Database,
      label: "02",
      title: "High-Velocity Ledger & Payment Core",
      desc: "Our secure, low-latency transaction processing engine and virtual account infrastructure that anchors platforms like PulsePay.",
    },
    {
      icon: FileCheck2,
      label: "03",
      title: "Automated Compliance & KYC Layer",
      desc: "Built-in, real-time identity verification, fraud detection, and regulatory screening shared across all sub-platforms.",
    },
    {
      icon: Globe,
      label: "04",
      title: "Global Cloud Grid",
      desc: "Optimized database clustering and serverless edge delivery networks yielding 99.99% uptime and microsecond execution.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/15">
      <SiteHeader />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(17,24,39,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-5 pb-28 pt-24 text-center sm:px-8 sm:pb-36 sm:pt-32">
          <div className="mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Enterprise Venture Ecosystem · Est. 2024
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Engineering the Infrastructure for the{" "}
            <span className="text-primary">Future of Global Commerce.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            ENICE Group develops, scales, and deploys high-capacity full-stack
            software architectures, virtual payment systems, and autonomous
            enterprise AI ecosystems for modern industries.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/portfolio"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto"
            >
              Explore Portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#verticals"
              className="inline-flex h-12 w-full items-center justify-center rounded-md border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              Corporate Overview
            </a>
          </div>

          <div
            className="mt-20 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-background md:grid-cols-4"
            style={{ boxShadow: SHADOW_CARD }}
          >
            {[
              ["02", "Active Ventures"],
              ["99.99%", "Infrastructure SLA"],
              ["3", "Core Verticals"],
              ["24/7", "Operational Posture"],
            ].map(([k, v], i) => (
              <div
                key={v}
                className={`p-6 text-left ${i !== 0 ? "border-t border-border md:border-l md:border-t-0" : ""} ${i === 1 ? "border-t md:border-t-0" : ""}`}
              >
                <div className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {k}
                </div>
                <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CORE VERTICALS ============ */}
      <section id="verticals" className="bg-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Industrial Core Verticals
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
              Three pillars. One operating standard.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              The ENICE Group portfolio is organized around three deliberate
              competencies — each operated with institutional discipline.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {verticals.map((v) => (
              <article
                key={v.title}
                className="group relative flex flex-col rounded-xl border border-border bg-background p-8 transition-all hover:-translate-y-0.5"
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
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                <ul className="mt-7 space-y-2.5 border-t border-border pt-6">
                  {v.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2.5 text-[13px] text-foreground/85"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ THE ENICE CORE ============ */}
      <section className="border-t border-border bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Shared Ecosystem Infrastructure
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
              The ENICE Core
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              How we power our portfolio. Every venture under the ENICE Group ecosystem is
              built on top of our proprietary, high-performance core infrastructure,
              ensuring enterprise-grade scale from day one.
            </p>
          </div>

          <div
            className="mt-14 grid overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-2 lg:grid-cols-4"
            style={{ boxShadow: SHADOW_CARD }}
          >
            {core.map((c, i) => (
              <div
                key={c.title}
                className={`group relative flex flex-col p-8 transition-colors hover:bg-secondary/60 ${
                  i !== 0
                    ? "border-t border-border sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:border-l lg:[&:nth-child(n)]:border-t-0 lg:[&:not(:first-child)]:border-l"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                    <c.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-[10px] font-mono font-semibold tracking-[0.18em] text-muted-foreground">
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
        </div>
      </section>

      {/* ============ PORTFOLIO PREVIEW ============ */}
      <section className="border-t border-border bg-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Portfolio · Active Ventures
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
                Operating ventures with their own gravity.
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

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {[
              {
                tag: "Venture · Fintech",
                name: "PulsePay",
                desc: "Next-generation virtual payment infrastructure and digital wallet ecosystem — instant issuance, programmable controls, and embedded treasury.",
              },
              {
                tag: "Venture · Enterprise AI",
                name: "PulseAssist",
                desc: "AI-driven operational support SaaS for banking, fintech, and telecommunications — autonomous queue handling and policy-bound automations.",
              },
            ].map((p) => (
              <article
                key={p.name}
                className="flex flex-col rounded-xl border border-border bg-background p-8 sm:p-10"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  <span className="h-1 w-1 rounded-full bg-primary" /> {p.tag}
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
                  Learn more
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-px group-hover/btn:translate-x-px" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CREDIBILITY BAR ============ */}
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
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Compliance
                </div>
                <div className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                  SMEDAN Registered Nano Enterprise
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:grid-cols-4">
              {[
                { icon: Lock, label: "SOC2-Aligned" },
                { icon: ShieldCheck, label: "RLS Enforced" },
                { icon: Wifi, label: "Active-Active" },
                { icon: Check, label: "Audit Ready" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2.5 rounded-md border border-border bg-background px-4 py-2.5 text-[11px] font-semibold tracking-wide text-foreground/80"
                  style={{ boxShadow: SHADOW_CARD }}
                >
                  <b.icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AboutMatrix />
      <NetworkMetrics />
      <Roadmap />
      <Careers />
      

      <SiteFooter />
      <AIChatbot />
    </div>
  );
}

