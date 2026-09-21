import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import type { LucideIcon } from "lucide-react";
import { Bitcoin, Boxes, Lock, Globe, Layers, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
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
import { PRODUCTS } from "@/components/site/navigation";
import { useSectionFields, fieldItems, fieldText } from "@/lib/cms/use-section";
import { ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/portfolio/pulsex")({
  head: () =>
    pageHead("/portfolio/pulsex", [
      breadcrumbJsonLd([
        { name: "Products", path: "/portfolio" },
        { name: "PulseX", path: "/portfolio/pulsex" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "PulseX",
        description:
          "ENICE Group's digital asset platform for cryptocurrency trading, secure custody, and cross-ecosystem digital finance. Launching Q3 2027.",
        url: `${SITE_URL}/portfolio/pulsex`,
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
  component: PulseXPage,
});

const WAITLIST_MAILTO = "mailto:corporate@enicehq.com?subject=Join%20the%20PulseX%20waitlist";

// ─── The decorative markets panel ─────────────────────────────────────────────
//
// This is an illustration of the product's shape, not a data display, and it is `aria-hidden`
// throughout. Two things were removed rather than retoned:
//
//   * A "Live Preview" pill with a green dot. PulseX does not exist yet, so nothing was live and
//     nothing was previewing; a green dot beside the words is read as telemetry.
//   * Hardcoded market figures — "$67,420.00", "+2.41%", a per-row price and percentage change.
//     They were invented numbers for an unlaunched platform presented in the typography of real
//     market data, and they would have been stale the day after they were written.
//
// What remains is the asset pairs the platform intends to list and an abstract shape for each,
// drawn in the surface ramp. The footer caption still explains what the panel is.

const TICKER_DATA = [
  {
    symbol: "BTC/USDT",
    name: "Bitcoin",
    up: true,
    shape: [62, 61, 64, 68, 65, 70, 72, 71, 74, 73, 76, 74],
  },
  {
    symbol: "ETH/USDT",
    name: "Ethereum",
    up: true,
    shape: [38, 36, 37, 40, 39, 42, 41, 43, 44, 43, 45, 44],
  },
  {
    symbol: "SOL/USDT",
    name: "Solana",
    up: false,
    shape: [20, 21, 22, 20, 19, 21, 20, 18, 19, 18, 18, 17],
  },
  {
    symbol: "BNB/USDT",
    name: "BNB",
    up: true,
    shape: [55, 54, 56, 57, 56, 58, 59, 60, 58, 61, 62, 61],
  },
];

/**
 * An abstract trend line.
 *
 * Direction is drawn in the site's own palette — warm for rising, bone-faint for falling — rather
 * than the green/red of a trading terminal. Green on this site means one thing, "available", and
 * spending it on a decorative line would make the one honest availability signal meaningless.
 */
function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "var(--gold)" : "var(--bone-faint)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The candle field behind the panel header. Purely a texture; same two-tone discipline. */
function CandlestickChart() {
  const bars = [
    { h: 48, open: 30, close: 42, up: true },
    { h: 36, open: 25, close: 18, up: false },
    { h: 56, open: 20, close: 48, up: true },
    { h: 40, open: 35, close: 28, up: false },
    { h: 64, open: 22, close: 58, up: true },
    { h: 44, open: 38, close: 30, up: false },
    { h: 72, open: 18, close: 66, up: true },
    { h: 52, open: 42, close: 34, up: false },
    { h: 60, open: 26, close: 54, up: true },
    { h: 48, open: 40, close: 32, up: false },
    { h: 80, open: 20, close: 74, up: true },
    { h: 56, open: 48, close: 36, up: false },
    { h: 88, open: 22, close: 82, up: true },
  ];

  return (
    <div className="flex h-20 items-end gap-1.5 px-2" aria-hidden>
      {bars.map((bar, i) => {
        const bodyH = Math.abs(bar.close - bar.open);
        const bodyTop = bar.up ? bar.h - bar.close : bar.h - bar.open;
        return (
          <div key={i} className="relative flex flex-1 flex-col items-center">
            <div
              className={`w-px ${bar.up ? "bg-gold/35" : "bg-bone-faint/30"}`}
              style={{ height: bar.h + "px" }}
            />
            <div
              className={`absolute w-full max-w-[8px] rounded-sm ${
                bar.up ? "bg-gold/70" : "bg-bone-faint/45"
              }`}
              style={{ height: Math.max(bodyH, 4) + "px", top: bodyTop + "px" }}
            />
          </div>
        );
      })}
    </div>
  );
}

function MarketsPanel() {
  return (
    <Panel raised aria-hidden className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="flex items-center gap-2">
          <Bitcoin className="h-4 w-4 text-gold" strokeWidth={1.5} />
          <span className="text-[12px] font-semibold text-bone-strong">PulseX Markets</span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-faint">
          Digital Assets
        </span>
      </div>

      <div className="border-b border-border bg-surface-1 px-4 pt-4 pb-2">
        <div className="px-1 pb-2">
          <span className="font-mono text-[11px] tracking-[0.14em] text-bone-faint">BTC/USDT</span>
        </div>
        <CandlestickChart />
        {/* No `/60` on the day token: that landed at 1.12:1 against the panel, i.e. invisible.
            Decorative is not a licence to be illegible — it just means it is not announced. */}
        <div className="mt-1 flex justify-between px-1 pb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d} className="text-[10px] font-medium text-bone-faint">
              {d}
            </span>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border">
        {TICKER_DATA.map((t) => (
          <li key={t.symbol} className="flex items-center gap-3 px-5 py-3">
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span className="text-[12px] font-semibold text-bone-strong">{t.symbol}</span>
              <span className="text-[10px] text-bone-faint">{t.name}</span>
            </span>
            <Sparkline data={t.shape} up={t.up} />
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center border-t border-border px-5 py-3">
        <span className="type-meta text-[10px]">Simulated preview · Real-time data at launch</span>
      </div>
    </Panel>
  );
}

// ─── Fallback content ─────────────────────────────────────────────────────────
//
// The two blocks below are the *fallbacks* for the page's CMS sections, not its only source of
// content. Each band reads `portfolio.pulsex.*` and overlays whatever an administrator has
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
  Globe,
  Layers,
  Lock,
  ShieldCheck,
  Zap,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

// ─── Launch framing ───────────────────────────────────────────────────────────

/**
 * The gold treatment is not stored per row.
 *
 * A `statistics` section carries a value and a label and nothing else, which is correct: which
 * figure is accented is a styling decision rather than content an editor should have to make. The
 * first row is the status row, and that is the one the accent belongs to — so the emphasis is
 * derived from position at render time.
 */
const LAUNCH_FACTS = [
  { label: "Status", value: "Planned Project" },
  { label: "Launch", value: "Q3 2027" },
  { label: "Category", value: "Digital Assets" },
];

// ─── Feature highlights ───────────────────────────────────────────────────────

const HIGHLIGHTS = [
  {
    icon: BarChart3,
    title: "Multi-asset trading",
    desc: "Trade major digital assets with deep liquidity and institutional-grade execution: Bitcoin, Ethereum, and beyond.",
  },
  {
    icon: Lock,
    title: "Secure custody",
    desc: "Cold storage, multi-signature protection, and continuous on-chain monitoring for every asset in your portfolio.",
  },
  {
    icon: Layers,
    title: "Ecosystem-native",
    desc: "Move between PulseX, PulsePay, and ePulse without leaving the ENICE stack: one account, every service.",
  },
  {
    icon: Globe,
    title: "Built for scale",
    desc: "Global access with compliance and reporting designed for regulated markets from day one, in Africa, Europe, and beyond.",
  },
  {
    icon: Zap,
    title: "Instant settlement",
    desc: "Near-instant on-chain and off-chain settlement rails so your capital moves as fast as the market does.",
  },
  {
    icon: ShieldCheck,
    title: "Regulatory-ready",
    desc: "Compliance built in from the ground up: KYC, AML, and transaction monitoring at the core.",
  },
];

/**
 * The ecosystem strip, read from the shared product registry.
 *
 * The three cards used to be a hand-written copy of `PRODUCTS` — label, one-line description and
 * link, maintained in this file — which is exactly the kind of duplicate that drifts away from the
 * header, the footer and the product pages themselves. The strip now names the same three routes
 * and takes their labels, descriptions and lifecycle stage from `navigation.ts`, so there is one
 * place a product is described.
 */
const ECOSYSTEM_ROUTES = ["/portfolio/pulsepay", "/portfolio/epulse", "/portfolio/pulsex"];

const ECOSYSTEM = ECOSYSTEM_ROUTES.map((route) => PRODUCTS.find((p) => p.to === route)).filter(
  (p): p is (typeof PRODUCTS)[number] => p !== undefined,
);

// ─── Component ────────────────────────────────────────────────────────────────

function PulseXPage() {
  // Page header, editable through the `portfolio.pulsex` section.
  const header = useSectionFields("portfolio.pulsex");
  const factsSection = useSectionFields("portfolio.pulsex.facts");
  const highlightsSection = useSectionFields("portfolio.pulsex.highlights");

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
    <SiteShell>
      {/* ═══ HERO ═════════════════════════════════════════════════════════════ */}
      <Section spacing="loose" glow="spread" grid aria-labelledby="pulsex-heading">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* ── Copy ── */}
          <div data-allow-select>
            <Tag tone="warm">Coming Q3 2027</Tag>

            {/*
              Hand-built rather than `SectionIntro`: the editable heading is `Pulse[[X]]`, and
              `SectionIntro` paints a `[[highlight]]` gold. A display-size word in the accent colour
              is the one thing the warm palette is not for, so the highlight resolves to bone and the
              gold stays where it belongs — the eyebrow, the icons and the hairlines.
            */}
            <h1 id="pulsex-heading" className="type-display mt-8 text-foreground">
              <StyledText
                text={fieldText(header, "heading", "Pulse[[X]]")}
                accentClassName="text-foreground"
              />
            </h1>

            <p className="type-lead mt-6 max-w-lg">
              <StyledText
                text={fieldText(
                  header,
                  "subheading",
                  "PulseX is ENICE Group's digital asset platform, designed to make cryptocurrency and digital finance **simple, secure, and accessible**. The platform will let users manage digital assets easily, while staying connected to the broader ENICE ecosystem.",
                )}
                accentClassName="text-gold"
                boldClassName="font-semibold text-foreground"
              />
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-3">
              {launchFacts.map((m, i) => (
                <Panel key={`${m.label}-${i}`} tone="quiet" className="p-3">
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-bone-faint">
                    {m.label}
                  </dt>
                  <dd
                    className={`tnum mt-1 text-[12px] font-semibold ${
                      i === 0 ? "text-gold" : "text-foreground"
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

          {/* ── Decorative markets panel ── */}
          <MarketsPanel />
        </div>
      </Section>

      {/* ═══ WHAT TO EXPECT ═══════════════════════════════════════════════════ */}
      <Section tone="recessed" divider aria-labelledby="pulsex-capabilities-heading">
        <Reveal>
          <SectionIntro
            id="pulsex-capabilities-heading"
            align="center"
            eyebrow={fieldText(highlightsSection, "eyebrow", "Platform Capabilities")}
            heading={fieldText(
              highlightsSection,
              "heading",
              "Digital assets, without the friction.",
            )}
            lead={fieldText(
              highlightsSection,
              "subheading",
              "PulseX will let users manage digital assets easily, fully integrated across the broader ENICE Group ecosystem.",
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

      {/* ═══ ECOSYSTEM ════════════════════════════════════════════════════════ */}
      <Section
        spacing="tight"
        container="narrow"
        divider
        aria-labelledby="pulsex-ecosystem-heading"
      >
        <Reveal>
          <SectionIntro
            id="pulsex-ecosystem-heading"
            align="center"
            eyebrow="ENICE Ecosystem"
            heading="One ecosystem. Every financial need."
            lead="PulseX is deeply integrated with PulsePay and ePulse. Move between crypto and traditional finance from a single account."
          />
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {ECOSYSTEM.map((p) => (
            <li key={p.to} className="flex">
              {/* `PRODUCTS.to` is a plain string; TanStack validates `to` against the route tree,
                  so the cast is the same one the design-system primitives make. */}
              <Link
                to={p.to as "/"}
                className="panel panel-interactive flex w-full flex-col gap-1.5 p-5"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold text-foreground">{p.label}</span>
                  {p.stage === "available" ? (
                    <Tag tone="positive">Available</Tag>
                  ) : (
                    <Tag tone="warm">In development</Tag>
                  )}
                </span>
                <span className="type-body text-[12px]">{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ═══ WAITLIST ═════════════════════════════════════════════════════════ */}
      <Section container="narrow" divider glow="center" aria-labelledby="pulsex-waitlist-heading">
        <Reveal>
          <SectionIntro
            id="pulsex-waitlist-heading"
            align="center"
            eyebrow="Be First In Line"
            heading="Get early access when we launch."
            lead="Join the PulseX waitlist to receive launch updates, early access opportunities, and priority onboarding when the platform goes live in Q3 2027."
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
