import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";
import { Wifi, CreditCard, Bitcoin, TrendingUp } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Cta, Eyebrow, Panel, Section, SectionIntro, Tag } from "@/components/site/primitives";
import { PRODUCTS } from "@/components/site/navigation";
import { useSectionFields, fieldText } from "@/lib/cms/use-section";
import { cn } from "@/lib/utils";
import { SHADOW_CARD, SHADOW_FLOAT, SURFACE_1, SURFACE_2, SURFACE_3 } from "@/lib/design";
import { ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { PRODUCT_ACCENT_BY_PATH, PRODUCT_DEEP_ACCENT_BY_PATH } from "@/lib/product-brand";

export const Route = createFileRoute("/portfolio/")({
  head: () =>
    pageHead("/portfolio", [
      breadcrumbJsonLd([{ name: "Products", path: "/portfolio" }]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "ENICE Group Products",
        description:
          "Proprietary software products and infrastructure networks built by ENICE Group.",
        url: `${SITE_URL}/portfolio`,
        publisher: ORGANIZATION_REF,
        hasPart: [
          {
            "@type": "SoftwareApplication",
            name: "PulsePay",
            url: `${SITE_URL}/portfolio/pulsepay`,
            applicationCategory: "FinanceApplication",
          },
          {
            "@type": "SoftwareApplication",
            name: "PrideTrade",
            url: `${SITE_URL}/portfolio/pride`,
            applicationCategory: "FinanceApplication",
          },
        ],
      },
    ]),
  component: PortfolioIndexPage,
});

// ─── Decorative mock data ─────────────────────────────────────────────────────
//
// Everything below feeds a product *illustration*, not a live reading. The visuals are
// `aria-hidden` and contain nothing focusable, so they are decoration to a screen reader and to
// the keyboard — which is the only honest way to show a simulated interface on a marketing page.

/**
 * Decorative market rows for the PrideTrade illustration. Symbols only — no prices, no percentages.
 * PrideTrade is unlaunched, so a number beside a ticker would be an invented quotation.
 */
const MARKET_ROWS = [
  { symbol: "BTC", name: "Bitcoin", width: "w-[72%]" },
  { symbol: "ETH", name: "Ethereum", width: "w-[58%]" },
  { symbol: "USDT", name: "Tether", width: "w-[44%]" },
];

/**
 * The payment-card mock, retoned onto the surface ramp.
 *
 * Was `linear-gradient(135deg, #1a2e6b …)` — the old navy brand colour, which is the one thing
 * that has to go. Built from the shared surface constants rather than fresh hex literals so the
 * card cannot drift away from the panels it sits beside.
 */
const CARD_FACE = `linear-gradient(135deg, ${SURFACE_3} 0%, ${SURFACE_2} 55%, ${SURFACE_1} 100%)`;
const CARD_BEHIND = `linear-gradient(135deg, ${SURFACE_2} 0%, ${SURFACE_1} 100%)`;

// ─── Lifecycle labelling ──────────────────────────────────────────────────────

/**
 * Product lifecycle, read from the shared registry in `navigation.ts`.
 *
 * Each card used to carry its own hardcoded pill — "Operational", "Planned", "In Development" —
 * maintained by hand in five places, so the header, the homepage and this page could and did
 * disagree. The stage now comes from the one list that defines it. Lifecycle is factual and can
 * be stated; platform *health* is asserted only by `/status`, which actually checks it.
 */
const STAGE_LABEL = { available: "Available", building: "In development" } as const;

function stageOf(to: string): keyof typeof STAGE_LABEL {
  return PRODUCTS.find((p) => p.to === to)?.stage ?? "building";
}

function LifecycleTag({ to }: { to: string }) {
  const stage = stageOf(to);
  return <Tag tone={stage === "available" ? "positive" : "accent"}>{STAGE_LABEL[stage]}</Tag>;
}

// ─── Card shell ───────────────────────────────────────────────────────────────

/** A consistent enterprise preview frame for every product illustration. */
function CardVisual({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "portfolio-product-visual relative flex flex-col overflow-hidden border-b border-border",
        className,
      )}
    >
      <div className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/75 px-4 py-2.5 backdrop-blur-sm">
        <span className="truncate font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-bone-soft">
          {label}
        </span>
        <span className="shrink-0 rounded-full border border-electric/25 bg-electric/[0.08] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-electric">
          Interface preview
        </span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

function ProductCard({
  visual,
  children,
  to,
}: {
  visual: ReactNode;
  children: ReactNode;
  to: string;
}) {
  const accent = PRODUCT_ACCENT_BY_PATH[to];
  const deepAccent = PRODUCT_DEEP_ACCENT_BY_PATH[to];

  return (
    <Panel
      as="article"
      interactive
      className="portfolio-product-card product-accent-card flex flex-col overflow-hidden"
      style={{
        boxShadow: SHADOW_CARD,
        ...(accent
          ? {
              ["--electric" as string]: accent,
              ["--electric-deep" as string]: deepAccent ?? accent,
              ["--primary" as string]: accent,
              ["--ring" as string]: accent,
            }
          : {}),
      }}
    >
      {visual}
      <div className="flex flex-1 flex-col p-8 sm:p-10">{children}</div>
    </Panel>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PortfolioIndexPage() {
  // Page header, editable through the `portfolio.index` section.
  const header = useSectionFields("portfolio.index");

  return (
    <SiteShell>
      {/* ═══ PAGE HEADER ════════════════════════════════════════════════════ */}
      <Section
        spacing="loose"
        container="narrow"
        grid
        glow="spread"
        aria-labelledby="portfolio-heading"
      >
        <SectionIntro
          id="portfolio-heading"
          level={1}
          align="center"
          eyebrow={fieldText(header, "eyebrow", "ENICE Products")}
          heading={fieldText(header, "heading", "Products built by ENICE Group")}
          lead={fieldText(
            header,
            "subheading",
            "Payments and digital assets. Two products, each built and run on its own infrastructure, to operate at scale.",
          )}
        />
      </Section>

      {/* ═══ ACTIVE PRODUCTS ════════════════════════════════════════════════ */}
      {/* The eyebrow was a pill with an animated pinging dot. A pulsing live indicator reads as
          real-time telemetry, and nothing here is measuring anything — the band is a lifecycle
          grouping, so it is labelled as one. */}
      <Section id="active" divider aria-labelledby="active-heading">
        <SectionIntro
          id="active-heading"
          eyebrow="Our Products"
          heading="Two products, one platform"
          lead="PulsePay and PrideTrade, built and operated by ENICE Group. PulsePay is in pilot ahead of general availability; PrideTrade opens its waitlist ahead of launch."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* ── PulsePay ── */}
          <ProductCard
            to="/portfolio/pulsepay"
            visual={
              <CardVisual label="PulsePay wallet and cards" className="h-56 sm:h-64">
                <div className="tech-grid tech-grid-flat" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Card peeking from behind */}
                  <div
                    className="absolute rounded-2xl border border-border"
                    style={{
                      width: 220,
                      aspectRatio: "1.586/1",
                      background: CARD_BEHIND,
                      transform: "rotate(5deg) translate(10%, -8%)",
                      boxShadow: SHADOW_CARD,
                    }}
                  />
                  {/* Main card */}
                  <div
                    className="relative flex flex-col justify-between rounded-2xl border border-border p-4"
                    style={{
                      width: 220,
                      aspectRatio: "1.586/1",
                      background: CARD_FACE,
                      transform: "rotate(-3deg)",
                      boxShadow: SHADOW_FLOAT,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-bone-strong">
                        PulsePay
                      </span>
                      <Wifi className="h-3.5 w-3.5 rotate-90 text-bone-faint" />
                    </div>
                    {/* The metallic chip: the one place a small electric fill is right. */}
                    <div className="h-6 w-9 rounded-md bg-gradient-to-br from-electric to-electric-deep" />
                    <div className="tnum font-mono text-[9px] tracking-[0.2em] text-bone-soft">
                      •••• •••• •••• ••••
                    </div>
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
              </CardVisual>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>Fintech Infrastructure Platform</Eyebrow>
              <LifecycleTag to="/portfolio/pulsepay" />
            </div>
            <h3 className="type-h3 mt-4 text-foreground">PulsePay</h3>
            <p className="type-body mt-4">
              A virtual payment platform that issues Naira and USD cards, handles KYC verification,
              moves funds between users, and delivers value-added services with speed and
              reliability.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta
                to="/portfolio/pulsepay"
                size="sm"
                icon="arrow"
                aria-label="View PulsePay platform details"
              >
                View Platform
              </Cta>
              <Cta
                to="mailto:corporate@enicehq.com?subject=PulsePay%20Access%20Request"
                variant="secondary"
                size="sm"
                icon="external"
              >
                Request Access
              </Cta>
            </div>
          </ProductCard>

          {/* ── PrideTrade ── */}
          <ProductCard
            to="/portfolio/pride"
            visual={
              <CardVisual label="PrideTrade markets" className="h-56 sm:h-64">
                <div className="tech-grid tech-grid-flat" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full max-w-sm space-y-2.5">
                    {MARKET_ROWS.map((row) => (
                      <div
                        key={row.symbol}
                        className="flex items-center gap-3 rounded-md border border-border bg-surface-2 px-3 py-2"
                      >
                        <Bitcoin
                          className="h-3.5 w-3.5 shrink-0 text-electric"
                          strokeWidth={1.75}
                        />
                        <span className="font-mono text-[10px] font-semibold tracking-wider text-bone-strong">
                          {row.symbol}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-bone-faint">
                          {row.name}
                        </span>
                        <div className="relative h-1 w-16 overflow-hidden rounded-full bg-border">
                          <div className={cn("h-full rounded-full bg-electric/60", row.width)} />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <TrendingUp className="h-3 w-3 text-bone-faint" strokeWidth={1.75} />
                      <span className="text-[9px] uppercase tracking-[0.16em] text-bone-faint">
                        Simulated preview
                      </span>
                    </div>
                  </div>
                </div>
              </CardVisual>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>
                <Bitcoin aria-hidden className="h-3.5 w-3.5" />
                Digital Assets
              </Eyebrow>
              <LifecycleTag to="/portfolio/pride" />
            </div>
            <h3 className="type-h3 mt-4 text-foreground">PrideTrade</h3>
            <p className="type-body mt-4">
              ENICE Group's digital asset platform for cryptocurrency trading, secure custody and
              digital asset trading and custody, run on its own ledger and controls.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta
                to="/portfolio/pride"
                size="sm"
                icon="arrow"
                aria-label="View PrideTrade platform details"
              >
                View Platform
              </Cta>
              <Cta
                to="mailto:corporate@enicehq.com?subject=Join%20the%20PrideTrade%20waitlist"
                variant="secondary"
                size="sm"
                icon="external"
              >
                Join Waitlist
              </Cta>
            </div>
          </ProductCard>
        </div>
      </Section>
    </SiteShell>
  );
}
