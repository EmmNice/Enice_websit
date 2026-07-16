import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  BarChart3,
  MessageSquare,
  FileCheck2,
  Network,
  Plus,
  Settings,
  TrendingUp,
  Clock,
  Database,
  LogOut,
  Inbox,
  BookOpen,
  UserCircle,
  Ticket,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/pulseassist")({
  head: () => ({
    meta: [
      {
        title:
          "PulseAssist | Enterprise AI Operations Platform — ENICE Group",
      },
      {
        name: "description",
        content:
          "PulseAssist by ENICE Group is a multi-tenant AI operations platform for banking, fintech, and telecom. Autonomous customer support, policy-bound agents, real-time live-agent handoff, and compliance-ready audit trails.",
      },
      {
        property: "og:title",
        content:
          "PulseAssist — Enterprise AI Operations Platform by ENICE Group",
      },
      {
        property: "og:description",
        content:
          "Multi-tenant AI operations for telecoms and financial networks. Autonomous support routing, policy-bound agents, real-time live-agent handoff. Built by ENICE Group.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      {
        property: "og:url",
        content: "https://enicegroup.com/portfolio/pulseassist",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      {
        name: "twitter:title",
        content: "PulseAssist — Enterprise AI by ENICE Group",
      },
      {
        name: "twitter:description",
        content:
          "Multi-tenant AI operations platform for banking and telecom — autonomous support, policy agents, live handoff.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://enicegroup.com/portfolio/pulseassist",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "PulseAssist",
          description:
            "ENICE Group's multi-tenant AI operations platform for banking, fintech, and telecom — autonomous customer support routing, policy-bound conversational agents, API-driven account management, and real-time handoff to live agents.",
          url: "https://enicegroup.com/portfolio/pulseassist",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            description:
              "Request enterprise integration access via corporate@enicehq.com",
          },
          author: {
            "@type": "Organization",
            name: "ENICE Group",
            url: "https://enicegroup.com",
          },
          featureList: [
            "Autonomous customer support routing",
            "Policy-bound conversational agents",
            "Real-time handoff to live agents",
            "API-driven account management",
            "Multi-tenant architecture for enterprises",
            "Compliance-ready audit trails",
          ],
        }),
      },
    ],
  }),
  component: PulseAssistPage,
});

const SHADOW_CARD =
  "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

const QUEUE_ROWS = [
  { id: "REQ_001", state: "Resolved", width: "w-full", isLive: false },
  { id: "REQ_002", state: "Routing", width: "w-[82%]", isLive: false },
  { id: "REQ_003", state: "Processing", width: "w-[64%]", isLive: true },
  { id: "REQ_004", state: "Queued", width: "w-[46%]", isLive: false },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Autonomous support routing",
    desc: "AI-driven triage and routing that resolves common queries without human intervention.",
  },
  {
    icon: ShieldCheck,
    title: "Policy-bound agents",
    desc: "Conversational agents that operate strictly within configurable organisational policies.",
  },
  {
    icon: Zap,
    title: "Real-time live-agent handoff",
    desc: "Seamless escalation to human agents mid-conversation with full context preserved.",
  },
  {
    icon: Globe,
    title: "API-driven account management",
    desc: "Agents can query and update account state through secure, scoped API integrations.",
  },
  {
    icon: Network,
    title: "Multi-tenant architecture",
    desc: "Enterprise-grade isolation between clients with dedicated model and routing configs.",
  },
  {
    icon: FileCheck2,
    title: "Compliance-ready audit trails",
    desc: "Every interaction is logged, timestamped, and exportable for regulatory review.",
  },
];

const STATS = [
  { value: "< 80ms", label: "Median response time" },
  { value: "99.99%", label: "Engine uptime SLA" },
  { value: "∞", label: "Concurrent sessions" },
  { value: "100%", label: "Audit coverage" },
];

// ─── Sectors served ────────────────────────────────────────────────────────────

const SECTORS = [
  { icon: BarChart3, label: "Banking & Fintech" },
  { icon: Users, label: "Telecom Operators" },
  { icon: Globe, label: "Insurance" },
  { icon: ShieldCheck, label: "Compliance-heavy Enterprises" },
];

function PulseAssistPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="border-b border-border bg-secondary py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          {/* Copy */}
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

            {/* Status */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Operational
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <BrainCircuit className="h-3 w-3" />
                Multi-tenant · API-native
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="mailto:corporate@enicehq.com?subject=PulseAssist%20Integration%20Request"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Request Integration Access
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

          {/* Dashboard mockup */}
          <div
            className="relative overflow-hidden rounded-xl border border-white/10"
            style={{ boxShadow: SHADOW_CARD, background: "#0b0f1a", minHeight: "340px" }}
          >
            <div className="flex h-full min-h-[340px]">

              {/* ── Sidebar ── */}
              <div className="flex w-[130px] shrink-0 flex-col border-r border-white/8 bg-[#080c15] p-3">
                {/* Logo */}
                <div className="mb-4 flex items-center gap-1.5 px-1">
                  <div className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-violet-500/25">
                    <BrainCircuit className="h-3 w-3 text-violet-400" />
                  </div>
                  <span className="text-[9px] font-bold tracking-tight text-white">PulseAssist</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-0.5">
                  <p className="mb-1 px-2 text-[7px] font-semibold uppercase tracking-[0.18em] text-white/30">Overview</p>
                  {/* Dashboard — active */}
                  <div className="flex items-center gap-1.5 rounded-md bg-white/8 px-2 py-1.5">
                    <BarChart3 className="h-2.5 w-2.5 text-white" strokeWidth={2} />
                    <span className="text-[8px] font-semibold text-white">Dashboard</span>
                    <span className="ml-auto h-1 w-1 rounded-full bg-violet-400" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5">
                    <TrendingUp className="h-2.5 w-2.5 text-white/35" strokeWidth={2} />
                    <span className="text-[8px] text-white/40">Analytics</span>
                  </div>

                  <p className="mb-1 mt-2 px-2 text-[7px] font-semibold uppercase tracking-[0.18em] text-white/30">Helpdesk</p>
                  {[
                    { label: "Tickets", Icon: Ticket },
                    { label: "Contacts", Icon: UserCircle },
                    { label: "Live Inbox", Icon: Inbox },
                    { label: "Team", Icon: Users },
                    { label: "Canned", Icon: BookOpen },
                  ].map(({ label, Icon }) => (
                    <div key={label} className="flex items-center gap-1.5 px-2 py-1.5">
                      <Icon className="h-2.5 w-2.5 text-white/35" strokeWidth={2} />
                      <span className="text-[8px] text-white/40">{label}</span>
                    </div>
                  ))}
                </nav>

                {/* Bottom */}
                <div className="border-t border-white/8 pt-3">
                  <div className="flex items-center gap-1.5 px-1 py-1">
                    <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-500/25">
                      <span className="text-[7px] font-bold text-violet-300">SA</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[8px] font-semibold text-white/80">Super Admin</p>
                      <p className="text-[7px] text-white/35">Corporate</p>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-1 px-1 py-1">
                    <LogOut className="h-2.5 w-2.5 text-white/30" />
                    <span className="text-[8px] text-white/30">Log out</span>
                  </div>
                  <p className="mt-1 px-1 text-[6px] text-white/20">by ENICE Group</p>
                </div>
              </div>

              {/* ── Main content ── */}
              <div className="flex-1 overflow-hidden p-4">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[13px] font-bold leading-tight text-white">Welcome back</h3>
                    <p className="mt-0.5 text-[8px] text-white/45">Here's what's happening with your AI agents today.</p>
                  </div>
                  <button className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[8px] font-semibold text-white">
                    <Plus className="h-2.5 w-2.5" strokeWidth={2.5} />
                    Create AI Agent
                  </button>
                </div>

                {/* Agent config banner */}
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-violet-500/20">
                    <BrainCircuit className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] text-white/55">
                      AI Agents configured for:{" "}
                      <span className="font-semibold text-violet-400">General Commercial</span>
                    </p>
                    <p className="text-[7px] text-white/35">Optimised for industry-specific tone and knowledge.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[7px] text-white/45">
                    <Settings className="h-2.5 w-2.5" strokeWidth={2} />
                    Configure
                  </div>
                </div>

                {/* Stats row 1 */}
                <div className="mb-2 grid grid-cols-3 gap-2">
                  {[
                    { label: "Active AI Agents", value: "1", sub: "+2 THIS WEEK", subOk: true, Icon: BrainCircuit, ic: "text-violet-400", ib: "bg-violet-500/15" },
                    { label: "Total Interactions", value: "7", sub: "85% AI RESOLVED", subOk: true, Icon: MessageSquare, ic: "text-blue-400", ib: "bg-blue-500/15" },
                    { label: "Human Handoffs", value: "0", sub: "REQUIRES ATTENTION", subOk: false, Icon: Users, ic: "text-red-400", ib: "bg-red-500/15" },
                  ].map(({ label, value, sub, subOk, Icon, ic, ib }) => (
                    <div key={label} className="rounded-lg border border-white/8 bg-white/[0.04] p-2.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[6.5px] font-semibold uppercase tracking-[0.1em] text-white/35 leading-tight">{label}</span>
                        <div className={`grid h-4 w-4 shrink-0 place-items-center rounded ${ib}`}>
                          <Icon className={`h-2.5 w-2.5 ${ic}`} strokeWidth={2} />
                        </div>
                      </div>
                      <p className="text-[20px] font-bold leading-none text-white">{value}</p>
                      <p className={`mt-1 text-[6.5px] font-semibold ${subOk ? "text-emerald-400" : "text-red-400"}`}>
                        ↗ {sub}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Stats row 2 */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Cost Saved", value: "₦8,400", Icon: TrendingUp, ic: "text-emerald-400", ib: "bg-emerald-500/15" },
                    { label: "Human Hrs Delegated", value: "2 hrs", Icon: Clock, ic: "text-blue-400", ib: "bg-blue-500/15" },
                    { label: "Knowledge Base", value: "0", Icon: Database, ic: "text-amber-400", ib: "bg-amber-500/15" },
                  ].map(({ label, value, Icon, ic, ib }) => (
                    <div key={label} className="rounded-lg border border-white/8 bg-white/[0.04] p-2.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[6.5px] font-semibold uppercase tracking-[0.1em] text-white/35 leading-tight">{label}</span>
                        <div className={`grid h-4 w-4 shrink-0 place-items-center rounded ${ib}`}>
                          <Icon className={`h-2.5 w-2.5 ${ic}`} strokeWidth={2} />
                        </div>
                      </div>
                      <p className="text-[20px] font-bold leading-none text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
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
              Operations that run themselves.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              PulseAssist handles the full customer operations lifecycle — from
              first contact to resolution — without requiring a human for every
              interaction.
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

      {/* ── Sectors served ── */}
      <section className="border-y border-border bg-background py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Sectors Served
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Built for compliance-heavy industries.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SECTORS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-6 text-center"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15">
                  <s.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-semibold text-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance callout ── */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border bg-background">
              <ShieldCheck
                className="h-6 w-6 text-primary"
                strokeWidth={1.75}
              />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Enterprise Compliance
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Every interaction is compliant by design.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                PulseAssist maintains comprehensive audit trails of every agent
                interaction. Policy configurations are version-controlled,
                every model decision is logged, and all data is tenant-isolated
                — meeting the regulatory requirements of banking and telecom
                in Africa and beyond.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Tenant Isolation",
                  "Audit Logs",
                  "Policy Versioning",
                  "SOC 2 Aligned",
                ].map((b) => (
                  <span
                    key={b}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground/70"
                  >
                    <Check
                      className="h-3 w-3 text-primary"
                      strokeWidth={2.5}
                    />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Get Started
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Ready to integrate PulseAssist?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Contact our enterprise team to discuss integration requirements,
            multi-tenant configuration, and SLA options.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:corporate@enicehq.com?subject=PulseAssist%20Integration%20Request"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Request Integration Access
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
