import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  BrainCircuit,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  BarChart3,
  Mail,
  MessageSquare,
  FileCheck2,
  Network,
  Plus,
  Settings,
  TrendingUp,
  Clock,
  Database,
  Inbox,
  BookOpen,
  UserCircle,
  Ticket,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PulseAssistEarlyAccessButton } from "@/components/site/PulseAssistEarlyAccess";
import {
  Cta,
  Eyebrow,
  IconTile,
  Metric,
  Panel,
  Section,
  SectionIntro,
  Tag,
} from "@/components/site/primitives";
import { PRODUCTS } from "@/components/site/navigation";
import { useSectionFields, fieldItems, fieldText } from "@/lib/cms/use-section";
import { SHADOW_CARD } from "@/lib/design";
import { ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/portfolio/pulseassist")({
  head: () =>
    pageHead("/portfolio/pulseassist", [
      breadcrumbJsonLd([
        { name: "Products", path: "/portfolio" },
        { name: "PulseAssist", path: "/portfolio/pulseassist" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "PulseAssist",
        description:
          "ENICE Group's multi-tenant AI operations platform for banking, fintech, and telecom: automated customer support routing, policy-bound conversational agents, API-driven account management, and real-time handoff to live agents.",
        url: `${SITE_URL}/portfolio/pulseassist`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          description: "Request enterprise integration access via corporate@enicehq.com",
        },
        author: ORGANIZATION_REF,
        featureList: [
          "Autonomous customer support routing",
          "Policy-bound conversational agents",
          "Real-time handoff to live agents",
          "API-driven account management",
          "Multi-tenant architecture for enterprises",
          "Transactional and marketing email on a verified domain",
        ],
      },
    ]),
  component: PulseAssistPage,
});

// ─── Fallback content ─────────────────────────────────────────────────────────
//
// The four blocks below are the *fallbacks* for the page's CMS sections, not its only source of
// content. Each band reads `portfolio.pulseassist.*` and overlays whatever an administrator has
// published, so the copy here is what paints before the CMS answers and what survives an outage —
// `useSectionFields` treats a degraded bootstrap as "not loaded" on purpose. See
// `src/lib/cms/use-section.ts`.

/**
 * Icons an editor may name on a CMS-managed capability or sector card.
 *
 * A curated map rather than importing all of lucide, which would add a large amount of JavaScript
 * to the public bundle for the sake of a handful of names. Anything unrecognised falls back to a
 * neutral icon, so a typo degrades instead of leaving an empty tile. Same approach as
 * `CARD_ICONS` in src/routes/index.tsx.
 */
const CARD_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Boxes,
  BrainCircuit,
  FileCheck2,
  Globe,
  Inbox,
  Mail,
  MessageSquare,
  Network,
  ShieldCheck,
  Users,
  Zap,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

const FEATURES = [
  {
    // The platform answers on five channels from a single inbox
    // (getpulseassist.com/channels). That is the product's headline capability and the page did
    // not state it anywhere, which left the most concrete thing about PulseAssist off its own page.
    icon: Inbox,
    title: "Five channels, one inbox",
    desc: "WhatsApp, web chat, email, SMS and voice answered from a single shared inbox, so support is consistent wherever people reach you.",
  },
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
    desc: "Escalation to a human agent mid-conversation, with full context preserved.",
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
    // PulseAssist is two platforms under one roof: the AI support layer above, and PulseAssist
    // Email. The page described only the first, so the email platform is named here and gets its
    // own page at /portfolio/pulseassist-email.
    icon: Mail,
    title: "Email on your own domain",
    desc: "PulseAssist Email sends transactional and marketing email from your own verified domain, with deliverability and sending reputation managed for you.",
  },
];

/**
 * Only figures that can be checked.
 *
 * Two of the four were removed. `∞ — Concurrent sessions` is an invented capacity claim, and
 * `100% — Audit coverage` states a measured coverage figure nothing on this page measures. What
 * the platform actually does about audit trails is still described in the compliance band below,
 * where it belongs.
 */
const STATS = [
  { value: "WhatsApp · Web · Email · SMS · Voice", label: "Channels" },
  { value: "Multi-tenant", label: "Architecture" },
];

// ─── Sectors served ────────────────────────────────────────────────────────────

const SECTORS = [
  { icon: BarChart3, label: "Banking & Fintech" },
  { icon: Users, label: "Telecom Operators" },
  { icon: Globe, label: "Insurance" },
  { icon: ShieldCheck, label: "Compliance-heavy Enterprises" },
];

const COMPLIANCE_MECHANISMS = ["Tenant Isolation", "Policy Versioning", "Row-Level Security"];

/** Product lifecycle, from the shared registry — never a hand-written status string. */
const STAGE_LABEL = { available: "Available", building: "In development" } as const;
const STAGE = PRODUCTS.find((p) => p.to === "/portfolio/pulseassist")?.stage ?? "building";

// ─── Dashboard mock ───────────────────────────────────────────────────────────
//
// A product illustration, not a reading. It is `aria-hidden` and contains nothing focusable —
// the "Create AI Agent" control used to be a real `<button>`, which put a dead tab stop inside a
// decorative image. Every tile is warm-toned: the mock previously ran violet, blue, emerald and
// amber icons at once, which read as clip art against a near-black and bone page.

const NAV_SECONDARY = [
  { label: "Tickets", Icon: Ticket },
  { label: "Contacts", Icon: UserCircle },
  { label: "Live Inbox", Icon: Inbox },
  { label: "Team", Icon: Users },
  { label: "Canned", Icon: BookOpen },
];

const MOCK_STATS_PRIMARY = [
  { label: "Active AI Agents", value: "12", sub: "+3 WEEK", Icon: BrainCircuit },
  { label: "Total Interactions", value: "4.2K", sub: "91% AI", Icon: MessageSquare },
  { label: "Human Handoffs", value: "9", sub: "↓ 62%", Icon: Users },
];

const MOCK_STATS_SECONDARY = [
  { label: "Cost Saved", value: "₦4.2M", Icon: TrendingUp },
  { label: "Hrs Delegated", value: "1,240", Icon: Clock },
  { label: "Knowledge Base", value: "48", Icon: Database },
];

const MOCK_TILE =
  "grid h-3.5 w-3.5 shrink-0 place-items-center rounded bg-gold/[0.1] sm:h-4 sm:w-4";
const MOCK_LABEL =
  "text-[5.5px] font-semibold uppercase leading-tight tracking-[0.06em] text-bone-faint sm:text-[6px]";
const MOCK_VALUE = "tnum text-[15px] font-bold leading-none text-foreground sm:text-[18px]";
const MOCK_CARD = "rounded-lg border border-border bg-surface-2 p-1.5 sm:p-2";

function DashboardMock() {
  return (
    <Panel tone="quiet" aria-hidden className="overflow-hidden" style={{ boxShadow: SHADOW_CARD }}>
      <div className="flex" style={{ minHeight: "clamp(260px, 45vw, 340px)" }}>
        {/* ── Sidebar ── */}
        {/* Mobile: icon-only narrow strip · Desktop: icons + labels */}
        <div className="flex w-9 shrink-0 flex-col border-r border-border bg-background py-3 sm:w-[130px] sm:p-3">
          {/* Logo */}
          <div className="mb-3 flex items-center justify-center sm:mb-4 sm:justify-start sm:gap-1.5 sm:px-1">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-gold/25 bg-gold/[0.08] text-gold">
              <BrainCircuit className="h-3 w-3" />
            </span>
            <span className="hidden text-[9px] font-bold tracking-tight text-foreground sm:block">
              PulseAssist
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col items-center gap-0.5 sm:items-stretch sm:space-y-0.5">
            {/* section label desktop only */}
            <p className="mb-1 hidden px-2 text-[7px] font-semibold uppercase tracking-[0.18em] text-bone-faint sm:block">
              Overview
            </p>

            {/* Dashboard — active */}
            <div className="flex w-full items-center justify-center rounded-md bg-surface-3 py-1.5 sm:justify-start sm:gap-1.5 sm:px-2">
              <BarChart3 className="h-3 w-3 text-foreground sm:h-2.5 sm:w-2.5" strokeWidth={2} />
              <span className="hidden text-[8px] font-semibold text-foreground sm:block">
                Dashboard
              </span>
              <span className="ml-auto hidden h-1 w-1 rounded-full bg-gold sm:block" />
            </div>

            <div className="flex w-full items-center justify-center py-1.5 sm:justify-start sm:gap-1.5 sm:px-2">
              <TrendingUp className="h-3 w-3 text-bone-faint sm:h-2.5 sm:w-2.5" strokeWidth={2} />
              <span className="hidden text-[8px] text-bone-faint sm:block">Analytics</span>
            </div>

            <p className="mb-1 mt-1 hidden px-2 text-[7px] font-semibold uppercase tracking-[0.18em] text-bone-faint sm:block">
              Helpdesk
            </p>

            {NAV_SECONDARY.map(({ label, Icon }) => (
              <div
                key={label}
                className="flex w-full items-center justify-center py-1.5 sm:justify-start sm:gap-1.5 sm:px-2"
              >
                <Icon className="h-3 w-3 text-bone-faint sm:h-2.5 sm:w-2.5" strokeWidth={2} />
                <span className="hidden text-[8px] text-bone-faint sm:block">{label}</span>
              </div>
            ))}
          </nav>

          <div className="border-t border-border pt-2 sm:pt-3">
            <p className="hidden px-1 text-[6px] text-bone-faint sm:block">by ENICE Group</p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 overflow-hidden p-2.5 sm:p-4">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-[11px] font-bold leading-tight text-foreground sm:text-[13px]">
                Welcome back
              </p>
              <p className="mt-0.5 hidden text-[8px] text-bone-soft sm:block">
                Here's what's happening with your AI agents today.
              </p>
            </div>
            {/* A span, not a button: this is a picture of a control, so it must not be a tab stop. */}
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-2 py-1 text-[7px] font-semibold text-primary-foreground sm:px-2.5 sm:py-1.5 sm:text-[8px]">
              <Plus className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Create AI Agent</span>
              <span className="sm:hidden">New Agent</span>
            </span>
          </div>

          {/* Agent config banner */}
          <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 py-1.5 sm:mb-3 sm:gap-2 sm:px-2.5 sm:py-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-gold/25 bg-gold/[0.08] text-gold sm:h-6 sm:w-6">
              <BrainCircuit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </span>
            <p className="min-w-0 flex-1 truncate text-[7px] text-bone-soft sm:text-[8px]">
              Configured for: <span className="font-semibold text-gold">General Commercial</span>
            </p>
            <div className="flex shrink-0 items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[6px] text-bone-faint sm:px-2 sm:py-1 sm:text-[7px]">
              <Settings className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={2} />
              <span className="hidden sm:inline">Configure</span>
            </div>
          </div>

          {/* Stats row 1 */}
          <div className="mb-1.5 grid grid-cols-3 gap-1.5">
            {MOCK_STATS_PRIMARY.map(({ label, value, sub, Icon }) => (
              <div key={label} className={MOCK_CARD}>
                <div className="mb-1 flex items-start justify-between gap-1">
                  <span className={MOCK_LABEL}>{label}</span>
                  <span className={MOCK_TILE}>
                    <Icon className="h-2 w-2 text-gold sm:h-2.5 sm:w-2.5" strokeWidth={2} />
                  </span>
                </div>
                <p className={MOCK_VALUE}>{value}</p>
                <p className="mt-0.5 text-[5.5px] font-semibold text-positive sm:mt-1 sm:text-[6px]">
                  ↗ {sub}
                </p>
              </div>
            ))}
          </div>

          {/* Stats row 2 */}
          <div className="grid grid-cols-3 gap-1.5">
            {MOCK_STATS_SECONDARY.map(({ label, value, Icon }) => (
              <div key={label} className={MOCK_CARD}>
                <div className="mb-1 flex items-start justify-between gap-1">
                  <span className={MOCK_LABEL}>{label}</span>
                  <span className={MOCK_TILE}>
                    <Icon className="h-2 w-2 text-gold sm:h-2.5 sm:w-2.5" strokeWidth={2} />
                  </span>
                </div>
                <p className={MOCK_VALUE}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PulseAssistPage() {
  // Page header, editable through the `portfolio.pulseassist` section.
  const header = useSectionFields("portfolio.pulseassist");
  const factsSection = useSectionFields("portfolio.pulseassist.stats");
  const featuresSection = useSectionFields("portfolio.pulseassist.features");
  const sectorsSection = useSectionFields("portfolio.pulseassist.sectors");
  const complianceSection = useSectionFields("portfolio.pulseassist.compliance");

  // The facts strip. Rows without a value are skipped rather than rendered blank.
  const stats = fieldItems(factsSection, "items", STATS, (row) => {
    const value = typeof row.value === "string" ? row.value.trim() : "";
    const label = typeof row.label === "string" ? row.label.trim() : "";
    return value ? { value, label } : null;
  });

  // The capability cards. `icon` is a lucide name resolved through the curated map above.
  const features = fieldItems(featuresSection, "items", FEATURES, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return {
      icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""),
      title,
      desc: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  // Sector tiles carry an icon and a name only, so a row's `title` is its label.
  const sectors = fieldItems(sectorsSection, "items", SECTORS, (row) => {
    const label = typeof row.title === "string" ? row.title.trim() : "";
    if (!label) return null;
    return { icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""), label };
  });

  // The compliance pills are a plain list of mechanism names, so only each row's title is read.
  const complianceMechanisms = fieldItems<string>(
    complianceSection,
    "items",
    COMPLIANCE_MECHANISMS,
    (row) => (typeof row.title === "string" && row.title.trim() ? row.title.trim() : null),
  );

  return (
    <SiteShell>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <Section spacing="loose" grid glow="spread" aria-labelledby="pulseassist-heading">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* ── Copy ── */}
          <div>
            <SectionIntro
              id="pulseassist-heading"
              level={1}
              eyebrow={fieldText(header, "eyebrow", "Enterprise Conversational SaaS")}
              heading={fieldText(header, "heading", "PulseAssist")}
              lead={fieldText(
                header,
                "subheading",
                "A multi-tenant AI operations platform for telecoms and financial networks. It handles customer support routing, provides API-driven account management, and hands calls to live agents in real time when needed.",
              )}
            />

            {/* Lifecycle + shape of the platform.

                The first pill read "Operational" with a pinging green dot. Nothing here measures
                whether PulseAssist is up, and /status is the only surface that does — so the pill
                now states the product's lifecycle stage, read from the product registry, which is
                a fact with a source. */}
            <div className="mt-8 flex flex-wrap gap-2">
              <Tag tone={STAGE === "available" ? "positive" : "warm"}>{STAGE_LABEL[STAGE]}</Tag>
              <Tag>
                <BrainCircuit aria-hidden className="h-3 w-3 shrink-0" />
                Multi-tenant · API-native
              </Tag>
              <Tag>
                <Globe aria-hidden className="h-3 w-3 shrink-0" />
                Global
              </Tag>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {/* Opens the early-access modal in place, so it stays a button rather than a Cta. */}
              <PulseAssistEarlyAccessButton className="btn btn-primary group" />
              <Cta
                to="mailto:corporate@enicehq.com?subject=PulseAssist%20Integration%20Request"
                variant="secondary"
                icon="external"
              >
                Request Integration
              </Cta>
            </div>
          </div>

          {/* ── Dashboard mockup ── */}
          <DashboardMock />
        </div>
      </Section>

      {/* ═══ FACTS STRIP ════════════════════════════════════════════════════ */}
      {/* A wrapping row rather than a fixed four-column grid, which left half the band empty once
          the two unverifiable figures came out. */}
      <Section spacing="tight" container="narrow" divider>
        <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 sm:gap-x-24">
          {stats.map((s, i) => (
            <Metric key={`${s.label}-${i}`} value={s.value} label={s.label} align="center" />
          ))}
        </div>
      </Section>

      {/* ═══ PLATFORM CAPABILITIES ══════════════════════════════════════════ */}
      <Section divider glow="center" aria-labelledby="capabilities-heading">
        <SectionIntro
          id="capabilities-heading"
          align="center"
          eyebrow={fieldText(featuresSection, "eyebrow", "Platform Capabilities")}
          heading={fieldText(featuresSection, "heading", "Operations that run themselves.")}
          lead={fieldText(
            featuresSection,
            "subheading",
            "PulseAssist covers the full customer operations lifecycle, from first contact to resolution, without needing a human for every interaction.",
          )}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Panel key={f.title} interactive className="flex gap-4 p-6">
              <IconTile icon={f.icon} size="sm" className="h-11 w-11" />
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-bone-soft">{f.desc}</p>
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      {/* ═══ SECTORS SERVED ═════════════════════════════════════════════════ */}
      <Section container="narrow" divider aria-labelledby="sectors-heading">
        <SectionIntro
          id="sectors-heading"
          align="center"
          eyebrow={fieldText(sectorsSection, "eyebrow", "Sectors Served")}
          heading={fieldText(sectorsSection, "heading", "Built for compliance-heavy industries.")}
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {sectors.map((s) => (
            <Panel
              key={s.label}
              interactive
              className="flex flex-col items-center gap-3 p-6 text-center"
            >
              <IconTile icon={s.icon} className="h-12 w-12" />
              <span className="text-[13px] font-semibold text-foreground">{s.label}</span>
            </Panel>
          ))}
        </div>
      </Section>

      {/* ═══ COMPLIANCE ═════════════════════════════════════════════════════ */}
      <Section container="narrow" tone="recessed" divider aria-labelledby="compliance-heading">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <IconTile icon={ShieldCheck} className="h-14 w-14" />
          <div>
            <Eyebrow muted>
              {fieldText(complianceSection, "eyebrow", "Enterprise Compliance")}
            </Eyebrow>
            <h2 id="compliance-heading" className="type-h3 mt-2 text-foreground">
              {fieldText(complianceSection, "heading", "Every interaction is compliant by design.")}
            </h2>
            <p data-allow-select className="type-body mt-2 max-w-2xl">
              {fieldText(
                complianceSection,
                "subheading",
                "Policy configurations are version-controlled and every conversation runs with per-tenant data isolation and row-level security, built to meet the regulatory requirements of banking and telecom in Africa and beyond.",
              )}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {complianceMechanisms.map((b) => (
                <li key={b}>
                  <Tag>
                    <Check aria-hidden className="h-3 w-3 shrink-0 text-gold" strokeWidth={2.5} />
                    {b}
                  </Tag>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ═══ CTA ════════════════════════════════════════════════════════════ */}
      <Section container="prose" divider glow="center" aria-labelledby="cta-heading">
        <SectionIntro
          id="cta-heading"
          align="center"
          eyebrow="Get Started"
          heading="Ready to integrate PulseAssist?"
          lead="Contact our enterprise team to discuss integration requirements, multi-tenant configuration, and SLA options."
        />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PulseAssistEarlyAccessButton className="btn btn-primary btn-lg group" />
          <Cta
            to="mailto:corporate@enicehq.com?subject=PulseAssist%20Integration%20Request"
            variant="secondary"
            size="lg"
            icon="external"
          >
            Request Integration
          </Cta>
        </div>
      </Section>
    </SiteShell>
  );
}
