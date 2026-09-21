import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import type { LucideIcon } from "lucide-react";
import {
  Wifi,
  Boxes,
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  BarChart3,
  Lock,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
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
import { SHADOW_CARD, SHADOW_FLOAT, SURFACE_1, SURFACE_2, SURFACE_3 } from "@/lib/design";
import { ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/portfolio/pulsepay")({
  head: () =>
    pageHead("/portfolio/pulsepay", [
      breadcrumbJsonLd([
        { name: "Products", path: "/portfolio" },
        { name: "PulsePay", path: "/portfolio/pulsepay" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "PulsePay",
        description:
          "ENICE Group's virtual payment platform: Naira and USD card issuance, built-in KYC verification, peer-to-peer transfers, programmable spend controls, and fraud monitoring.",
        url: `${SITE_URL}/portfolio/pulsepay`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web, iOS, Android",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          description: "Request access via corporate@enicehq.com",
        },
        author: ORGANIZATION_REF,
        featureList: [
          "Instant virtual Naira and USD card issuance",
          "Built-in KYC and identity verification",
          "Peer-to-peer transfers and wallet funding",
          "Programmable spend controls for teams",
          "Value-added services and bill payments",
          "Enterprise-grade fraud monitoring",
        ],
      },
    ]),
  component: PulsePayPage,
});

/**
 * The payment-card mock, retoned onto the surface ramp.
 *
 * Was `linear-gradient(135deg, #1a2e6b …)` plus a grey `#c5cad4` card behind it — the old navy
 * brand colour and a light-theme grey. Both are built from the shared surface constants now, so
 * the card reads as the same material as the panels around it and cannot drift from them.
 */
const CARD_FACE = `linear-gradient(135deg, ${SURFACE_3} 0%, ${SURFACE_2} 55%, ${SURFACE_1} 100%)`;
const CARD_BEHIND = `linear-gradient(135deg, ${SURFACE_2} 0%, ${SURFACE_1} 100%)`;

// ─── Fallback content ─────────────────────────────────────────────────────────
//
// The three blocks below are the *fallbacks* for the page's CMS sections, not its only source of
// content. Each band reads `portfolio.pulsepay.*` and overlays whatever an administrator has
// published, so the copy here is what paints before the CMS answers and what survives an outage —
// `useSectionFields` treats a degraded bootstrap as "not loaded" on purpose. See
// `src/lib/cms/use-section.ts`.

/**
 * Icons an editor may name on a CMS-managed capability card.
 *
 * A curated map rather than importing all of lucide, which would add a large amount of JavaScript
 * to the public bundle for the sake of a handful of names. Anything unrecognised falls back to a
 * neutral icon, so a typo degrades instead of leaving an empty tile. Same approach as
 * `CARD_ICONS` in src/routes/index.tsx.
 */
const CARD_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Boxes,
  Check,
  CreditCard,
  Globe,
  Lock,
  ShieldCheck,
  Users,
  Wifi,
  Zap,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

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

/**
 * Only figures that can be checked.
 *
 * `< 5s — Card issuance time` was removed: it is a measured-sounding performance figure with no
 * published benchmark behind it, exactly the kind of claim the homepage stats strip was cleaned
 * up for. What the product does is still described in the capabilities below.
 */
const STATS = [
  { value: "Naira & USD", label: "Card currencies" },
  { value: "2", label: "Currency rails (NGN + USD)" },
  { value: "Every account", label: "KYC screening" },
];

const COMPLIANCE_MECHANISMS = [
  "Row-Level Security",
  "Tenant Isolation",
  "Audit Logging",
  "KYC Screening",
];

/** Product lifecycle, from the shared registry — never a hand-written status string. */
const STAGE_LABEL = { available: "Available", building: "In development" } as const;
const STAGE = PRODUCTS.find((p) => p.to === "/portfolio/pulsepay")?.stage ?? "building";

function PulsePayPage() {
  // Page header, editable through the `portfolio.pulsepay` section.
  const header = useSectionFields("portfolio.pulsepay");
  const factsSection = useSectionFields("portfolio.pulsepay.stats");
  const featuresSection = useSectionFields("portfolio.pulsepay.features");
  const complianceSection = useSectionFields("portfolio.pulsepay.compliance");

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
      <Section spacing="loose" grid glow="spread" aria-labelledby="pulsepay-heading">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* ── Copy ── */}
          <div>
            <SectionIntro
              id="pulsepay-heading"
              level={1}
              eyebrow={fieldText(header, "eyebrow", "Fintech Infrastructure Platform")}
              heading={fieldText(header, "heading", "PulsePay")}
              lead={fieldText(
                header,
                "subheading",
                "A virtual payment platform that issues Naira and USD cards, handles KYC verification, moves funds between users, and delivers value-added services with speed and reliability.",
              )}
            />

            {/* Lifecycle + market.

                The first pill read "Operational" with a pinging green dot. Nothing on this page
                measures whether PulsePay is up, and /status is the only surface that does — so the
                pill now states the product's lifecycle stage, read from the product registry,
                which is a fact with a source. */}
            <div className="mt-8 flex flex-wrap gap-2">
              <Tag tone={STAGE === "available" ? "positive" : "warm"}>{STAGE_LABEL[STAGE]}</Tag>
              <Tag>
                <Globe aria-hidden className="h-3 w-3 shrink-0" />
                Nigeria
              </Tag>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Cta
                to="mailto:corporate@enicehq.com?subject=PulsePay%20Access%20Request"
                icon="external"
              >
                Request Access
              </Cta>
              <Cta to="/portfolio" variant="secondary">
                All Products
              </Cta>
            </div>
          </div>

          {/* ── Card visual ──
              Decorative: `aria-hidden`, with nothing focusable inside it. */}
          <Panel
            aria-hidden
            className="relative overflow-hidden"
            style={{ boxShadow: SHADOW_CARD, minHeight: "300px" }}
          >
            <div className="tech-grid tech-grid-flat" />

            {/* Card stack — fixed pixel size so it never grows too large on mobile */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Card peeking from the upper-right */}
              <div
                className="absolute rounded-2xl border border-border"
                style={{
                  width: "200px",
                  aspectRatio: "1.586/1",
                  background: CARD_BEHIND,
                  transform: "rotate(7deg) translate(22px, -18px)",
                  boxShadow: SHADOW_CARD,
                }}
              />

              {/* Main card */}
              <div
                className="relative flex flex-col justify-between rounded-2xl border border-border p-4"
                style={{
                  width: "200px",
                  aspectRatio: "1.586/1",
                  background: CARD_FACE,
                  transform: "rotate(-4deg)",
                  boxShadow: SHADOW_FLOAT,
                }}
              >
                {/* Top: brand + NFC */}
                <div className="flex items-start justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-bone-strong">
                    PulsePay
                  </span>
                  <Wifi className="h-3.5 w-3.5 rotate-90 text-bone-faint" />
                </div>
                {/* Chip — the one place a small gold fill is right */}
                <div className="h-6 w-9 rounded-md bg-gradient-to-br from-gold to-gold-deep" />
                {/* Card number */}
                <div className="tnum font-mono text-[9px] tracking-[0.2em] text-bone-soft">
                  •••• •••• •••• ••••
                </div>
                {/* Bottom: cardholder + icon */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[6px] uppercase tracking-[0.2em] text-bone-faint">
                      Cardholder
                    </div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground">
                      ENICE GROUP
                    </div>
                  </div>
                  <CreditCard className="h-4 w-4 text-bone-faint" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </Section>

      {/* ═══ FACTS STRIP ════════════════════════════════════════════════════ */}
      {/* A wrapping row rather than a fixed four-column grid: the grid was sized for four figures
          and there are three, which left a quarter of the band empty. */}
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
          heading={fieldText(
            featuresSection,
            "heading",
            "Everything a modern payments stack should be.",
          )}
          lead={fieldText(
            featuresSection,
            "subheading",
            "PulsePay covers the full payments stack: issuance, compliance, transfers, and spending controls, in one integrated platform.",
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

      {/* ═══ COMPLIANCE ═════════════════════════════════════════════════════ */}
      <Section container="narrow" tone="recessed" divider aria-labelledby="compliance-heading">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <IconTile icon={ShieldCheck} className="h-14 w-14" />
          <div>
            <Eyebrow muted>
              {fieldText(complianceSection, "eyebrow", "Compliance & Regulation")}
            </Eyebrow>
            <h2 id="compliance-heading" className="type-h3 mt-2 text-foreground">
              {fieldText(
                complianceSection,
                "heading",
                "Built for regulated markets from the ground up.",
              )}
            </h2>
            <p data-allow-select className="type-body mt-2 max-w-2xl">
              {fieldText(
                complianceSection,
                "subheading",
                "PulsePay operates within Nigeria's regulatory framework, with row-level security, KYC screening on every account, and audit logging of privileged actions. PulsePay holds no third-party security certification today, and we will tell you so directly rather than imply otherwise.",
              )}
            </p>
          </div>
          <ul className="flex shrink-0 flex-wrap gap-2">
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
      </Section>

      {/* ═══ CTA ════════════════════════════════════════════════════════════ */}
      <Section container="prose" divider glow="center" aria-labelledby="cta-heading">
        <SectionIntro
          id="cta-heading"
          align="center"
          eyebrow="Get Started"
          heading="Ready to integrate PulsePay?"
          lead="Contact our enterprise team to discuss integration options, pricing, and access to the PulsePay platform."
        />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Cta
            to="mailto:corporate@enicehq.com?subject=PulsePay%20Access%20Request"
            size="lg"
            icon="external"
          >
            Request Access
          </Cta>
          <Cta to="/portfolio" variant="secondary" size="lg">
            View All Products
          </Cta>
        </div>
      </Section>
    </SiteShell>
  );
}
