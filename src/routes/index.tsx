import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
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
  Wallet,
  Bitcoin,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { AboutMatrix } from "@/components/site/AboutMatrix";
import { NetworkMetrics } from "@/components/site/NetworkMetrics";
import { Careers } from "@/components/site/Careers";
import { InfraStack } from "@/components/site/InfraStack";
import { FAQSection } from "@/components/site/FAQSection";
import { Reveal } from "@/components/site/Reveal";
import { PartnersStrip } from "@/components/site/PartnersStrip";
import { StyledText } from "@/components/site/StyledText";
import { ContactSection } from "@/components/site/ContactSection";
import {
  CardIndex,
  Container,
  Cta,
  Eyebrow,
  HairlineGrid,
  IconTile,
  Panel,
  Section,
  SectionIntro,
  Tag,
  TextLink,
} from "@/components/site/primitives";
import { PRODUCTS } from "@/components/site/navigation";
import { useSectionFields, fieldText, fieldItems, fieldParagraphs } from "@/lib/cms/use-section";
import { organizationJsonLd, pageHead, webSiteJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  // FAQ markup is deliberately absent here: `FAQSection` emits it from the questions it actually
  // renders, so an edited FAQ cannot end up described by stale markup. See that component.
  head: () => pageHead("/", [organizationJsonLd(), webSiteJsonLd()]),
  component: Landing,
});

// ─── Fallback content ─────────────────────────────────────────────────────────
//
// Every block below is the *fallback* for a CMS section, not the content of the page. Each band
// reads `home.*` and overlays whatever an administrator has published, so the copy here is what
// paints before the CMS answers and what survives an outage. See `src/lib/cms/use-section.ts`.

/**
 * Only figures that can be checked.
 *
 * This was `4 Products · 99.99% Infrastructure SLA · < 14ms API Latency P50 · AES-256 Encryption
 * Standard`. Three of those four were invented: there is no uptime SLA, no published latency
 * benchmark, and naming an encryption standard as a headline metric says nothing a visitor can
 * act on. The fourth was simply wrong — there are five products, not four, which is exactly the
 * failure mode of writing a count by hand, so the count is now derived from the product registry.
 */
const HERO_STATS = [
  { value: String(PRODUCTS.length), label: "Products in the ecosystem" },
  { value: "2", label: "Offices in Nigeria" },
];

/**
 * Icons an editor may name on a CMS-managed card.
 *
 * A curated map rather than importing all of lucide: the full set would add a large amount of
 * JavaScript to the public bundle for the sake of a handful of names. Anything unrecognised falls
 * back to a neutral icon, so a typo degrades to a sensible default instead of an empty box.
 */
const CARD_ICONS: Record<string, LucideIcon> = {
  Banknote,
  BrainCircuit,
  Boxes,
  Check,
  Cpu,
  Database,
  Globe,
  FileCheck2,
  CreditCard,
  ShieldCheck,
  Wifi,
  Lock,
  Wallet,
  Bitcoin,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

const VERTICALS = [
  {
    icon: Banknote,
    kicker: "Fintech",
    title: "Financial Infrastructure Systems",
    desc: "Transaction networks, ledger databases, and virtual card infrastructure built for Nigeria's digital economy, with room to expand across the region.",
    bullets: ["Virtual Card Issuance", "Treasury and Ledger", "KYC and Compliance Tooling"],
  },
  {
    icon: BrainCircuit,
    kicker: "Artificial Intelligence",
    title: "Autonomous Enterprise AI",
    desc: "Conversational AI that handles customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms.",
    bullets: ["Autonomous Customer Support", "Policy-Bound AI Agents", "Workflow Automation"],
  },
  {
    icon: Boxes,
    kicker: "Product Engineering",
    title: "Products built to operate",
    desc: "We build, own, and operate full-stack products. Each platform starts from a real customer problem and goes through engineering, launch, and day-to-day operation.",
    bullets: ["Product Ownership", "Platform Engineering", "Continuous Operation"],
  },
];

const CORE_MODULES = [
  {
    icon: Cpu,
    title: "Unified AI and Automation Pipeline",
    desc: "Centralized LLM orchestration and vector search routing that powers products like PulseAssist across every tenant.",
  },
  {
    icon: Database,
    title: "High-Velocity Ledger and Payment Core",
    desc: "A fast transaction engine and virtual account infrastructure that anchors PulsePay and the financial products we build next.",
  },
  {
    icon: FileCheck2,
    title: "Automated Compliance and KYC Layer",
    desc: "Identity verification, fraud detection, and regulatory screening, run in real time and shared across every product.",
  },
  {
    icon: Globe,
    title: "Global Cloud Grid",
    desc: "Managed database clustering and serverless edge delivery, so the same infrastructure serves every product without each one reinventing it.",
  },
];

/**
 * The three products the homepage leads with.
 *
 * `facts` are the two or three checkable specifics that turn a card from a feature blurb into a
 * product: what it issues, who it is for, when it ships. In the CMS these are the `bullets`
 * field, one `Label: Value` pair per line.
 */
const PORTFOLIO_PREVIEW = [
  {
    icon: CreditCard,
    kicker: "Fintech infrastructure",
    title: "PulsePay",
    desc: "A virtual payment platform for modern commerce: instant Naira card issuance, programmable wallets, embedded KYC, and peer-to-peer transfers built for Nigerian institutions.",
    facts: [
      { label: "Cards", value: "Naira & USD" },
      { label: "Market", value: "Nigeria" },
    ],
    to: "/portfolio/pulsepay",
  },
  {
    icon: BrainCircuit,
    kicker: "Enterprise AI",
    title: "PulseAssist",
    desc: "An AI operations platform for banking, fintech, and telecoms, with automated queue handling, live agent handoff, and policy-bound workflow automation.",
    facts: [
      { label: "Channels", value: "WhatsApp, web, email, SMS, voice" },
      { label: "Tenancy", value: "Multi-tenant" },
    ],
    to: "/portfolio/pulseassist",
  },
  {
    icon: Banknote,
    kicker: "Fintech infrastructure",
    title: "PulsePay Payment Collection",
    desc: "Payment infrastructure for businesses to accept and manage customer payments through a single, developer friendly API, with real time updates and webhook notifications.",
    facts: [
      { label: "Launch", value: "Q1 2027" },
      { label: "Integration", value: "One API" },
    ],
    to: "/portfolio/payment-collection",
  },
];

/**
 * Mechanisms that exist, not certifications that do not.
 *
 * Was `SOC 2 Aligned · RLS Enforced · Active-Active · Audit Ready`. ENICE holds no SOC 2 audit,
 * does not run active-active infrastructure, and "Audit Ready" asserts nothing checkable. Each of
 * the four below is a thing the code actually does, which is why they can stay.
 *
 * One list, two places. The hero's trust-signal strip was a second hardcoded copy of the first
 * three of these strings — "Row-level security", "Per-tenant isolation", "Audit logging" — so it
 * now renders the first three rows of this same `home.mechanisms` section rather than its own
 * literal. `hero` carries no repeater and every one of its text fields is already spoken for, so
 * folding the strip in here is what makes it editable at all; the alternative was leaving it in
 * code. The hero shows a fixed `Check` for each row because that icon is the strip's design, not
 * content — the per-row icons below are only used by the mechanisms band itself.
 */
/** How many mechanisms the hero's trust strip shows. Three, as it always has. */
const HERO_MECHANISMS = 3;

const COMPLIANCE_BADGES = [
  { icon: ShieldCheck, label: "Row-level security" },
  { icon: Lock, label: "Per-tenant isolation" },
  { icon: Check, label: "Audit logging" },
  { icon: Wifi, label: "Encrypted in transit and at rest" },
];

const FOUNDERS_LETTER = [
  "Every good business runs on good infrastructure. That's the idea behind ENICE Group. We don't build technology for its own sake. We build products that solve real problems and give people and businesses infrastructure they can depend on for years.",
  "That idea didn't start in a boardroom. It came from everyday life in Nigeria: calling a company for help and waiting too long, dealing with poor service, hitting friction that shouldn't exist. It came from financial platforms that failed exactly when we needed them, from declined international cards to simple payments that turned into a headache.",
  "We decided that shouldn't be normal. ENICE Group exists because African businesses and consumers deserve technology that is reliable, secure, and built to the same standard as anywhere else. Every product we launch is a step toward that, for Africa first, and for the world as we grow.",
];

/**
 * The three short principles under the product band.
 *
 * Mapped onto the `featureGrid` row shape: `title` is the heading, `description` the line beneath
 * it. The band renders no heading of its own, so `home.principles` seeds one for the admin list
 * only — nothing on the page reads it.
 */
const BUILD_PRINCIPLES = [
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
];

/** `Label: Value` lines from a CMS `bullets` field, for the product fact lists. */
function parseFacts(raw: unknown): { label: string; value: string }[] {
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      return value ? { label: label.trim(), value } : null;
    })
    .filter((f): f is { label: string; value: string } => f !== null);
}

// ─── Component ────────────────────────────────────────────────────────────────

function Landing() {
  const hero = useSectionFields("home.hero");
  const statistics = useSectionFields("home.statistics");
  const products = useSectionFields("home.products");
  const core = useSectionFields("home.core");
  const portfolio = useSectionFields("home.portfolio");
  const founders = useSectionFields("home.founders");
  const principles = useSectionFields("home.principles");
  const mechanisms = useSectionFields("home.mechanisms");

  // The hero's stats strip. Rows missing a value are skipped rather than rendered blank.
  const stats = fieldItems(statistics, "items", HERO_STATS, (row) => {
    const value = typeof row.value === "string" ? row.value.trim() : "";
    const label = typeof row.label === "string" ? row.label.trim() : "";
    return value ? { value, label } : null;
  });

  // The three capability cards. `index` is derived from position, so an editor never maintains
  // numbering by hand, and bullets are one per line in a single field.
  const verticals = fieldItems(products, "items", VERTICALS, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return {
      icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""),
      kicker: typeof row.kicker === "string" ? row.kicker.trim() : "",
      title,
      desc: typeof row.description === "string" ? row.description.trim() : "",
      bullets:
        typeof row.bullets === "string"
          ? row.bullets
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          : [],
    };
  });

  const coreModules = fieldItems(core, "items", CORE_MODULES, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return {
      icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""),
      title,
      desc: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  const featured = fieldItems(portfolio, "items", PORTFOLIO_PREVIEW, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const to = typeof row.url === "string" ? row.url.trim() : "";
    if (!title || !to) return null;
    return {
      icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""),
      kicker: typeof row.kicker === "string" ? row.kicker.trim() : "",
      title,
      desc: typeof row.description === "string" ? row.description.trim() : "",
      facts: parseFacts(row.bullets),
      to,
    };
  });

  // The three principles under the product band. Rows without a title are skipped.
  const buildPrinciples = fieldItems(principles, "items", BUILD_PRINCIPLES, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return { title, desc: typeof row.description === "string" ? row.description.trim() : "" };
  });

  // The mechanisms the Core implements. `title` is the pill's label; the hero's trust strip reads
  // the first three rows of this same list — see `COMPLIANCE_BADGES`.
  const mechanismList = fieldItems(mechanisms, "items", COMPLIANCE_BADGES, (row) => {
    const label = typeof row.title === "string" ? row.title.trim() : "";
    if (!label) return null;
    return { icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""), label };
  });

  const letter = fieldParagraphs(founders, "body", FOUNDERS_LETTER);

  return (
    <SiteShell>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
        <div aria-hidden className="tech-grid" />
        <div aria-hidden className="mesh-glow" />

        <div className="relative flex flex-1 items-center">
          <Container className="py-16 sm:py-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 xl:gap-20">
              {/* ── Copy ── */}
              <div>
                <div
                  className="animate-hero-up inline-flex items-center gap-2.5 rounded-full border border-border bg-surface-1/80 px-4 py-1.5 backdrop-blur-sm"
                  style={{ animationDelay: "0ms" }}
                >
                  <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-bone-strong sm:text-[11px] sm:tracking-[0.16em]">
                    <StyledText
                      text={fieldText(hero, "eyebrow", "Technology Group · Building for Africa")}
                      accentClassName="text-gold"
                    />
                  </span>
                </div>

                {/*
                  No manual line breaks and no [[highlight]] in the default copy.

                  The breaks were tuned for one viewport and broke at every other, and the
                  highlight put two lines of ~60px gold at the top of the page — the accent is for
                  small emphasis, and at that size it stopped reading as an accent and started
                  reading as a gold website. `text-wrap: balance` handles the ragging. The
                  capability is still there for an editor who wants to emphasise a short phrase.
                */}
                <h1
                  className="animate-hero-up type-display mt-8 text-foreground lg:max-w-[19ch]"
                  style={{ animationDelay: "60ms" }}
                >
                  <StyledText
                    text={fieldText(
                      hero,
                      "heading",
                      "We build the technology behind Africa's next generation of businesses.",
                    )}
                    accentClassName="text-gold"
                  />
                </h1>

                <p
                  className="animate-hero-up type-lead mt-7 max-w-xl"
                  style={{ animationDelay: "120ms" }}
                >
                  <StyledText
                    text={fieldText(
                      hero,
                      "subheading",
                      "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
                    )}
                    accentClassName="text-gold"
                  />
                </p>

                {/* `btn-stack` makes these full-width equal-height targets below 40rem. Sized to
                    their labels, the primary and secondary CTAs ended up different widths on a
                    phone, which reads as an accident rather than a hierarchy. */}
                <div
                  className="animate-hero-up btn-stack mt-9 flex flex-wrap gap-3"
                  style={{ animationDelay: "180ms" }}
                >
                  <Cta
                    to={fieldText(hero, "primaryCtaUrl", "/portfolio")}
                    size="lg"
                    icon="arrow"
                    data-cta="hero-primary"
                  >
                    {fieldText(hero, "primaryCtaLabel", "Explore our products")}
                  </Cta>
                  <Cta
                    to={fieldText(hero, "secondaryCtaUrl", "/about")}
                    variant="secondary"
                    size="lg"
                    data-cta="hero-secondary"
                  >
                    {fieldText(hero, "secondaryCtaLabel", "What we build")}
                  </Cta>
                </div>

                <ul
                  className="animate-hero-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
                  style={{ animationDelay: "280ms" }}
                >
                  {mechanismList.slice(0, HERO_MECHANISMS).map((m) => (
                    <li
                      key={m.label}
                      className="flex items-center gap-2 text-[11px] font-medium text-bone-soft"
                    >
                      <Check aria-hidden className="h-3 w-3 text-gold" strokeWidth={2.5} />
                      {m.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Product ecosystem panel ──
                  Rendered on every viewport. It used to be `hidden lg:block`, which meant a phone
                  got the hero as a column of text and nothing else — the single clearest sign that
                  the page was a desktop layout reflowed rather than a design. On mobile it sits
                  below the copy.
                  Was a mock "Control Panel" asserting "All Systems Operational" and a
                  `GET /v1/core/status` response of `"status": "operational"` — a hardcoded
                  health claim on every page load, contradicting /status, which is the only
                  surface that actually checks anything. It now shows the product ecosystem and
                  each product's lifecycle stage, read from the shared product registry in
                  `navigation.ts`, so it cannot drift from the header, the footer or reality. */}
              <div className="animate-hero-up lg:animate-none" style={{ animationDelay: "320ms" }}>
                <EcosystemPanel />
              </div>
            </div>
          </Container>
        </div>

        {/* Stats strip */}
        {/* Stats strip.

            Laid out as a wrapping flex row rather than a 4-column grid. The grid was sized for
            four figures and there are two, which left half the band empty — and the count is
            editable, so any fixed column count is wrong for some valid content. */}
        <div className="relative border-t border-border">
          <Container>
            <dl className="flex flex-wrap gap-x-16 gap-y-8 py-8 sm:gap-x-24">
              {stats.map((s, i) => (
                <div
                  key={`${s.label}-${i}`}
                  className="animate-hero-up"
                  style={{ animationDelay: `${340 + i * 70}ms` }}
                >
                  <dd className="tnum text-3xl font-semibold tracking-tight text-foreground">
                    {s.value}
                  </dd>
                  <dt className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-bone-faint">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Container>
        </div>
      </section>

      <PartnersStrip />

      {/* ═══ WHAT WE'RE BUILDING ════════════════════════════════════════════ */}
      <Section id="verticals" divider aria-labelledby="verticals-heading">
        <Reveal>
          <SectionIntro
            id="verticals-heading"
            eyebrow={fieldText(products, "eyebrow", "What we're building")}
            heading={fieldText(
              products,
              "heading",
              "Products and platforms.\nBuilt to one standard.",
            )}
            lead={fieldText(
              products,
              "subheading",
              "ENICE Group takes hard problems in financial services and business communication and turns them into products people can rely on.",
            )}
          />
        </Reveal>

        <HairlineGrid columns={3} className="mt-14">
          {verticals.map((v, i) => (
            <Reveal key={v.title} delay={i * 60} className="flex">
              <article className="panel-interactive flex h-full flex-col p-8 xl:p-10">
                <div className="flex items-start justify-between">
                  <IconTile icon={v.icon} />
                  <CardIndex value={i + 1} />
                </div>

                <div className="mt-8">
                  {v.kicker && (
                    <Eyebrow className="text-[10px] tracking-[0.2em]">{v.kicker}</Eyebrow>
                  )}
                  <h3 className="type-h3 mt-2.5 text-foreground">
                    <StyledText text={v.title} accentClassName="text-gold" />
                  </h3>
                  <p className="type-body mt-3.5">
                    <StyledText text={v.desc} accentClassName="text-gold" />
                  </p>
                </div>

                {v.bullets.length > 0 && (
                  <ul className="mt-7 space-y-3 border-t border-border pt-6">
                    {v.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-2.5 text-[13px] font-medium text-bone-strong"
                      >
                        <Check aria-hidden className="h-3 w-3 shrink-0 text-gold" strokeWidth={3} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          ))}
        </HairlineGrid>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {buildPrinciples.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div className="h-full border-t border-gold/25 pt-5">
                <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-bone-soft">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ PRODUCTS ═══════════════════════════════════════════════════════ */}
      <Section id="products" tone="recessed" divider aria-labelledby="products-heading">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionIntro
              id="products-heading"
              eyebrow={fieldText(portfolio, "eyebrow", "Built and operated by ENICE")}
              heading={fieldText(
                portfolio,
                "heading",
                "The products we run.\nNot a services menu.",
              )}
              lead={fieldText(
                portfolio,
                "subheading",
                "Each one began as a problem we hit ourselves, and each one is a platform we operate day to day rather than hand over.",
              )}
            />
            <TextLink to="/portfolio" className="shrink-0 pb-2">
              All products
            </TextLink>
          </div>
        </Reveal>

        <div className="mt-14 space-y-5">
          {featured.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <Panel
                as="article"
                interactive
                className="grid gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-12 xl:p-10"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <IconTile icon={p.icon} size="sm" />
                    {p.kicker && (
                      <Eyebrow className="text-[10px] tracking-[0.2em]">{p.kicker}</Eyebrow>
                    )}
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-[1.75rem]">
                    <StyledText text={p.title} accentClassName="text-gold" />
                  </h3>
                  <p className="type-body mt-3.5 max-w-xl">
                    <StyledText text={p.desc} accentClassName="text-gold" />
                  </p>
                  <Cta to={p.to} variant="secondary" size="sm" icon="external" className="mt-7">
                    View {p.title}
                  </Cta>
                </div>

                {p.facts.length > 0 && (
                  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                    {p.facts.map((f) => (
                      <div key={f.label} className="bg-surface-1 px-5 py-4">
                        <dd className="tnum text-[15px] font-semibold tracking-tight text-foreground">
                          {f.value}
                        </dd>
                        <dt className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                          {f.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                )}
              </Panel>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ THE ENICE CORE ═════════════════════════════════════════════════ */}
      <Section glow="center" divider aria-labelledby="core-heading">
        <Reveal>
          <SectionIntro
            id="core-heading"
            eyebrow={fieldText(core, "eyebrow", "What powers our products")}
            heading={fieldText(core, "heading", "The ENICE Core.")}
            lead={fieldText(
              core,
              "subheading",
              "Every product we operate runs on a shared infrastructure core, so the software customers use inherits scale, compliance, and reliability from the ground up.",
            )}
          />
        </Reveal>

        <HairlineGrid columns={2} className="mt-14">
          {coreModules.map((c, i) => (
            <Reveal key={c.title} delay={i * 70} className="flex">
              <div className="panel-interactive flex h-full flex-col p-8 xl:p-10">
                <div className="flex items-start justify-between">
                  <IconTile icon={c.icon} />
                  <CardIndex value={i + 1} />
                </div>
                <h3 className="type-h3 mt-8 text-foreground">
                  <StyledText text={c.title} accentClassName="text-gold" />
                </h3>
                <p className="type-body mt-3">
                  <StyledText text={c.desc} accentClassName="text-gold" />
                </p>
              </div>
            </Reveal>
          ))}
        </HairlineGrid>

        {/* The mechanisms the Core actually implements. Previously a separate full-width
            "credibility bar" band that repeated the same four claims a screen later. */}
        <Reveal>
          <div className="mt-12 flex flex-col gap-5 border-t border-border pt-8 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-md text-[13px] leading-relaxed text-bone-soft">
              {fieldText(
                mechanisms,
                "subheading",
                "Regulated in the Federal Republic of Nigeria. These are mechanisms the platform implements, not certifications we hold.",
              )}
            </p>
            <ul className="flex flex-wrap gap-2">
              {mechanismList.map((b) => (
                <li key={b.label}>
                  <Tag>
                    <b.icon aria-hidden className="h-3 w-3 shrink-0 text-gold" strokeWidth={2} />
                    {b.label}
                  </Tag>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      <NetworkMetrics />
      <InfraStack />
      <AboutMatrix />

      {/* ═══ FROM THE FOUNDERS ══════════════════════════════════════════════ */}
      <Section container="narrow" divider aria-labelledby="founders-heading">
        <Reveal>
          <div className="mx-auto max-w-3xl">
            <Eyebrow>{fieldText(founders, "eyebrow", "From the founders")}</Eyebrow>
            <h2 id="founders-heading" className="sr-only">
              A letter from the founders
            </h2>
            <div
              data-allow-select
              className="mt-7 space-y-6 text-[1.0625rem] leading-[1.8] text-bone-strong"
            >
              {letter.map((paragraph, i) => (
                <p key={i} className={i === 0 ? "text-foreground" : undefined}>
                  <StyledText text={paragraph} accentClassName="text-gold" />
                </p>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-5">
              <span aria-hidden className="rule-fade h-px flex-1" />
              <p className="font-mono text-[12px] tracking-[0.14em] text-bone-faint">
                — The Founders, ENICE Group
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <FAQSection />
      <Careers />
      <ContactSection />
    </SiteShell>
  );
}

// ─── Hero panel ───────────────────────────────────────────────────────────────

/** Lifecycle stages, in the order a visitor cares about them. */
const STAGE_LABEL = { available: "Available", building: "In development" } as const;

/**
 * The hero's supporting visual: the product ecosystem, drawn from the shared registry.
 *
 * It describes what exists and what is being built — facts with a source — rather than
 * simulating telemetry. A mock dashboard on a marketing page is read as real by exactly the
 * people who matter most, and this one previously claimed uptime nothing measured.
 */
function EcosystemPanel() {
  return (
    <Panel raised className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <span className="flex items-center gap-2.5">
          <span aria-hidden className="flex items-baseline text-[13px] tracking-tight">
            <span className="enice-mark font-extrabold">E</span>
            <span className="-ml-px font-light tracking-[0.24em] text-foreground">NICE</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-faint">
            Product ecosystem
          </span>
        </span>
        <span className="tnum font-mono text-[10px] text-bone-faint">
          {PRODUCTS.length} products
        </span>
      </div>

      {/* Descriptions wrap rather than truncate. `truncate` was clipping three of the five to
          "…paym…", and an ellipsis in the first viewport reads as a layout that ran out of room. */}
      <ul className="divide-y divide-border">
        {PRODUCTS.map((p) => (
          <li key={p.to} className="flex items-start justify-between gap-4 px-5 py-3.5">
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-foreground">{p.label}</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-bone-soft">
                {p.description}
              </span>
            </span>
            <span
              className={`mt-px shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                p.stage === "available" ? "text-positive" : "text-gold"
              }`}
            >
              {STAGE_LABEL[p.stage ?? "building"]}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-3 gap-px border-t border-border bg-border">
        {[
          { label: "Isolation", value: "Per-tenant" },
          { label: "Database", value: "Row-level" },
          { label: "Transport", value: "TLS" },
        ].map((m) => (
          <div key={m.label} className="bg-surface-2 px-3 py-4 text-center">
            <div className="font-mono text-[13px] font-semibold text-foreground">{m.value}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-bone-faint">
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
