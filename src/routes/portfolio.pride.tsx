import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import type { LucideIcon } from "lucide-react";
import {
  Bitcoin,
  Boxes,
  Lock,
  Globe,
  Gift,
  ShieldCheck,
  Smartphone,
  Zap,
  BarChart3,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PrideSurface, SurfaceNote } from "@/components/site/ProductSurfaces";
import { StyledText } from "@/components/site/StyledText";
import { Reveal } from "@/components/site/Reveal";
import {
  CardIndex,
  Cta,
  HairlineGrid,
  IconTile,
  Panel,
  Section,
  SectionIntro,
  Tag,
} from "@/components/site/primitives";
import { useSectionFields, fieldItems, fieldText } from "@/lib/cms/use-section";
import { ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/portfolio/pride")({
  head: () =>
    pageHead("/portfolio/pride", [
      breadcrumbJsonLd([
        { name: "Products", path: "/portfolio" },
        { name: "PrideTrade", path: "/portfolio/pride" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "PrideTrade",
        description:
          "ENICE Group's global multi-currency and digital asset platform: USD, EUR, GBP and Naira accounts, cross-border payments, crypto and stablecoin trading, gift cards, and travel eSIMs. Launching Q3 2027.",
        url: `${SITE_URL}/portfolio/pride`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web, iOS, Android",
        releaseNotes: "Expected Q3 2027",
        author: ORGANIZATION_REF,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/PreOrder",
          description: "Waitlist available. Platform launching Q3 2027.",
        },
      },
    ]),
  component: PridePage,
});

const WAITLIST_MAILTO = "mailto:corporate@enicehq.com?subject=Join%20the%20PrideTrade%20waitlist";

// ─── The decorative markets panel ─────────────────────────────────────────────
//
// This is an illustration of the product's shape, not a data display, and it is `aria-hidden`
// throughout. Two things were removed rather than retoned:
//
//   * A "Live Preview" pill with a green dot. PrideTrade does not exist yet, so nothing was live and
//     nothing was previewing; a green dot beside the words is read as telemetry.
//   * Hardcoded market figures — "$67,420.00", "+2.41%", a per-row price and percentage change.
//     They were invented numbers for an unlaunched platform presented in the typography of real
//     market data, and they would have been stale the day after they were written.
//
// What remains is the asset pairs the platform intends to list and an abstract shape for each,
// drawn in the surface ramp. The footer caption still explains what the panel is.

// ─── Fallback content ─────────────────────────────────────────────────────────
//
// The two blocks below are the *fallbacks* for the page's CMS sections, not its only source of
// content. Each band reads `portfolio.pride.*` and overlays whatever an administrator has
// published, so the copy here is what paints before the CMS answers and what survives an outage —
// `useSectionFields` treats a degraded bootstrap as "not loaded" on purpose. See
// `src/lib/cms/use-section.ts`.

/**
 * Icons an editor may name on a CMS-managed highlight card.
 *
 * A curated map rather than importing all of lucide, which would add a large amount of JavaScript
 * to the public bundle for the sake of a handful of names. Anything unrecognised falls back to a
 * neutral icon, so a typo degrades instead of leaving an empty tile. Same approach as
 * `CARD_ICONS` in src/routes/index.tsx.
 */
const CARD_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Bitcoin,
  Boxes,
  Gift,
  Globe,
  Lock,
  ShieldCheck,
  Smartphone,
  Zap,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

// ─── Launch framing ───────────────────────────────────────────────────────────

/**
 * The accent treatment is not stored per row.
 *
 * A `statistics` section carries a value and a label and nothing else, which is correct: which
 * figure is accented is a styling decision rather than content an editor should have to make. The
 * first row is the status row, and that is the one the accent belongs to — so the emphasis is
 * derived from position at render time.
 */
const LAUNCH_FACTS = [
  { label: "Multi-Currency", value: "USD, EUR, GBP & NGN accounts" },
  { label: "Digital Assets", value: "Instant crypto & stablecoin trading" },
  { label: "Global Utility", value: "Gift cards & international travel eSIMs" },
];

// ─── Feature highlights ───────────────────────────────────────────────────────

const HIGHLIGHTS = [
  {
    icon: Globe,
    title: "Multi-Currency Accounts & Cross-Border Payments",
    desc: "Hold and convert USD, EUR, GBP, and NGN in dedicated virtual accounts, send international payouts, and receive global payments seamlessly.",
  },
  {
    icon: BarChart3,
    title: "Cryptocurrency & Stablecoin Trading",
    desc: "Buy, sell, and swap BTC, ETH, USDT, and major digital assets with transparent live rates, instant Naira settlement, and allowlisted withdrawal security.",
  },
  {
    icon: Gift,
    title: "Gift Card Exchange",
    desc: "Buy and redeem major international retail, gaming, and lifestyle gift cards at competitive rates with instant wallet payout.",
  },
  {
    icon: Smartphone,
    title: "Global Travel eSIMs & Compliance",
    desc: "Activate instant international mobile data plans in 150+ countries with zero roaming fees, backed by built-in KYC, AML, and real-time transaction screening.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function PridePage() {
  // Page header, editable through the `portfolio.pride` section.
  const header = useSectionFields("portfolio.pride");
  const factsSection = useSectionFields("portfolio.pride.facts");
  const highlightsSection = useSectionFields("portfolio.pride.highlights");

  // Launch facts. Rows without a value are skipped rather than rendered blank; the first row takes
  // the accent, see `LAUNCH_FACTS`.
  const launchFacts = fieldItems(factsSection, "items", LAUNCH_FACTS, (row) => {
    const value = typeof row.value === "string" ? row.value.trim() : "";
    const label = typeof row.label === "string" ? row.label.trim() : "";
    return value ? { value, label } : null;
  });

  // The capability cards. `icon` is a lucide name resolved through the curated map above.
  const highlights = fieldItems(highlightsSection, "items", HIGHLIGHTS, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return {
      icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""),
      title,
      desc: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  return (
    <SiteShell className="product-theme-pride">
      {/* ═══ HERO ═════════════════════════════════════════════════════════════ */}
      <Section spacing="loose" glow="spread" grid aria-labelledby="pride-heading">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* ── Copy ── */}
          <div data-allow-select>
            <Tag tone="accent">Coming Q3 2027</Tag>

            {/* PrideTrade keeps the same display treatment as the rest of the product family. */}
            <h1 id="pride-heading" className="type-display mt-8 text-foreground">
              <StyledText
                text={fieldText(header, "heading", "PrideTrade")}
                accentClassName="text-foreground"
              />
            </h1>

            <p className="type-lead mt-6 max-w-lg">
              <StyledText
                text={fieldText(
                  header,
                  "subheading",
                  "ENICE Group's global multi-currency and digital asset platform—hold USD, EUR, GBP, and Naira accounts, send cross-border payments, trade cryptocurrencies, buy and sell gift cards, and stay connected worldwide with instant travel eSIMs.",
                )}
                accentClassName="text-electric"
                boldClassName="font-semibold text-foreground"
              />
            </p>

            <dl className="mt-10 grid gap-3 sm:grid-cols-3">
              {launchFacts.map((m, i) => (
                <Panel key={`${m.label}-${i}`} tone="quiet" className="p-3">
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-bone-faint">
                    {m.label}
                  </dt>
                  <dd
                    className={`mt-1 text-[11.5px] leading-snug font-semibold ${
                      i === 0 ? "text-electric" : "text-foreground"
                    }`}
                  >
                    {m.value}
                  </dd>
                </Panel>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <Cta to={WAITLIST_MAILTO} size="lg" icon="external">
                Join the Waitlist
              </Cta>
              <Cta to="/portfolio" variant="secondary" size="lg">
                Back to Products
              </Cta>
            </div>
          </div>

          {/* ── Product surface ──
              The exchange as it actually works: a naira wallet funded by bank transfer, the pairs
              it quotes, and the two controls that matter (allowlisted withdrawal addresses, a
              payment PIN kept separate). Replaced a candlestick chart and sparklines drawn from
              invented data, which is the fastest way to make a real product look fake. */}
          <div aria-hidden>
            <PrideSurface />
            <SurfaceNote />
          </div>
        </div>
      </Section>

      {/* ═══ WHAT TO EXPECT ═══════════════════════════════════════════════════ */}
      <Section tone="recessed" divider aria-labelledby="pride-capabilities-heading">
        <Reveal>
          <SectionIntro
            id="pride-capabilities-heading"
            align="center"
            eyebrow={fieldText(highlightsSection, "eyebrow", "Platform Capabilities")}
            heading={fieldText(
              highlightsSection,
              "heading",
              "A global account, not just a trading desk.",
            )}
            lead={fieldText(
              highlightsSection,
              "subheading",
              "PrideTrade lets users manage digital assets easily, from one account.",
            )}
          />
        </Reveal>

        <HairlineGrid columns={3} className="mt-14">
          {highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 60} className="flex">
              <div className="panel-interactive flex h-full flex-col p-8">
                <div className="flex items-start justify-between">
                  <IconTile icon={h.icon} size="sm" />
                  <CardIndex value={i + 1} />
                </div>
                <h3 className="mt-6 text-[15px] font-semibold text-foreground">{h.title}</h3>
                <p className="type-body mt-2 text-[13px]">{h.desc}</p>
              </div>
            </Reveal>
          ))}
        </HairlineGrid>
      </Section>

      {/* ═══ WAITLIST ═════════════════════════════════════════════════════════ */}
      <Section container="narrow" divider glow="center" aria-labelledby="pride-waitlist-heading">
        <Reveal>
          <SectionIntro
            id="pride-waitlist-heading"
            align="center"
            eyebrow="Be First In Line"
            heading="Get early access when we launch."
            lead="Join the PrideTrade waitlist to receive launch updates, early access opportunities, and priority onboarding when the platform goes live in Q3 2027."
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Cta to={WAITLIST_MAILTO} size="lg" icon="external">
              Join the Waitlist
            </Cta>
            <Cta to="/portfolio" variant="secondary" size="lg">
              View All Products
            </Cta>
          </div>
        </Reveal>
      </Section>
    </SiteShell>
  );
}
