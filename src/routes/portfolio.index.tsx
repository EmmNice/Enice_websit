import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";
import { Wifi, CreditCard, BrainCircuit, Wallet, Bitcoin, CheckCircle2, Mail } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PulseAssistEarlyAccessButton } from "@/components/site/PulseAssistEarlyAccess";
import { Cta, Eyebrow, Panel, Section, SectionIntro, Tag } from "@/components/site/primitives";
import { PRODUCTS } from "@/components/site/navigation";
import { useSectionFields, fieldText } from "@/lib/cms/use-section";
import { cn } from "@/lib/utils";
import { SHADOW_CARD, SHADOW_FLOAT, SURFACE_1, SURFACE_2, SURFACE_3 } from "@/lib/design";
import { ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";

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
            name: "PulseAssist",
            url: `${SITE_URL}/portfolio/pulseassist`,
            applicationCategory: "BusinessApplication",
          },
          {
            "@type": "SoftwareApplication",
            name: "PulsePay Payment Collection",
            url: `${SITE_URL}/portfolio/payment-collection`,
            applicationCategory: "FinanceApplication",
          },
          {
            "@type": "SoftwareApplication",
            name: "PulseX",
            url: `${SITE_URL}/portfolio/pulsex`,
            applicationCategory: "FinanceApplication",
          },
          {
            "@type": "SoftwareApplication",
            name: "ePulse",
            url: `${SITE_URL}/portfolio/epulse`,
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

const QUEUE_ROWS = [
  { id: "REQ_001", state: "Resolved", width: "w-full", isLive: false },
  { id: "REQ_002", state: "Routing", width: "w-[82%]", isLive: false },
  { id: "REQ_003", state: "Processing", width: "w-[64%]", isLive: true },
  { id: "REQ_004", state: "Queued", width: "w-[46%]", isLive: false },
];

/**
 * The asset pairs PulseX intends to list — names only.
 *
 * This was `{ symbol: "BTC", price: "67,420.00", change: "+2.41%" }`. Those were invented numbers
 * for a platform launching in 2027, typeset in the vocabulary of real market data, and they would
 * have been wrong the day after they were written. The same figures were removed from the PulseX
 * page itself; leaving them here would have put them back on the page that links to it.
 */
const TICKERS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
];

const COLLECTION_STEPS = ["Customer pays", "Payment processed", "Business receives funds"];

/**
 * Currency codes, without flag emoji.
 *
 * These were `"🇺🇸 USD"` and friends. Regional-indicator pairs have no glyph in the system font on
 * Windows — Chrome and Edge there render two empty boxes — and the codes already say everything
 * the flags did.
 */
const EPULSE_CURRENCIES = ["USD", "GBP", "EUR", "NGN"];

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
  return <Tag tone={stage === "available" ? "positive" : "warm"}>{STAGE_LABEL[stage]}</Tag>;
}

// ─── Card shell ───────────────────────────────────────────────────────────────

/** The illustration well at the top of a product card. Decorative: hidden from AT. */
function CardVisual({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden border-b border-border bg-surface-1", className)}
    >
      {children}
    </div>
  );
}

function ProductCard({ visual, children }: { visual: ReactNode; children: ReactNode }) {
  return (
    <Panel
      as="article"
      className="flex flex-col overflow-hidden"
      style={{ boxShadow: SHADOW_CARD }}
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
            "Payments, financial services, business communication, and digital commerce. Each product runs on the same infrastructure and is built to operate at scale.",
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
          eyebrow="Active Products"
          heading="Operational platforms"
          lead="Products currently being built and operated by ENICE Group."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* ── PulsePay ── */}
          <ProductCard
            visual={
              <CardVisual className="h-56 sm:h-64">
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
                    {/* The metallic chip: the one place a small gold fill is right. */}
                    <div className="h-6 w-9 rounded-md bg-gradient-to-br from-gold to-gold-deep" />
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

          {/* ── PulseAssist ── */}
          <ProductCard
            visual={
              <CardVisual className="h-56 sm:h-64">
                <div className="tech-grid tech-grid-flat" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full max-w-sm space-y-2.5">
                    {QUEUE_ROWS.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center gap-3 rounded-md border border-border bg-surface-2 px-3 py-2"
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            row.isLive ? "bg-gold" : "bg-surface-3",
                          )}
                        />
                        <span className="font-mono text-[10px] tracking-wider text-bone-soft">
                          {row.id}
                        </span>
                        <div className="relative ml-1 h-1 flex-1 overflow-hidden rounded-full bg-border">
                          <div className={cn("h-full rounded-full bg-gold/60", row.width)} />
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                          {row.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardVisual>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>
                <BrainCircuit aria-hidden className="h-3.5 w-3.5" />
                Enterprise Conversational SaaS
              </Eyebrow>
              <LifecycleTag to="/portfolio/pulseassist" />
            </div>
            <h3 className="type-h3 mt-4 text-foreground">PulseAssist</h3>
            <p className="type-body mt-4">
              A multi-tenant AI operations platform for telecoms and financial networks. It handles
              customer support routing, provides API-driven account management, and hands calls to
              live agents in real time when needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {/* Opens the early-access modal in place, so it stays a button rather than a Cta. */}
              <PulseAssistEarlyAccessButton className="btn btn-primary btn-sm group" />
              <Cta
                to="/portfolio/pulseassist"
                variant="secondary"
                size="sm"
                icon="arrow"
                aria-label="View PulseAssist platform details"
              >
                Learn More
              </Cta>
            </div>
          </ProductCard>

          {/* ── PulseAssist Email ── */}
          <ProductCard
            visual={
              <CardVisual className="h-56 sm:h-64">
                <div className="tech-grid tech-grid-flat" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="panel w-full max-w-sm" style={{ boxShadow: SHADOW_CARD }}>
                    <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
                        <span className="text-[11px] font-semibold text-bone-strong">
                          Sending domain
                        </span>
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-positive">
                        Verified
                      </span>
                    </div>
                    <ul className="divide-y divide-border">
                      {["DKIM", "SPF", "MAIL FROM"].map((record) => (
                        <li
                          key={record}
                          className="flex items-center justify-between px-4 py-2 text-[10px]"
                        >
                          <span className="font-mono font-semibold tracking-[0.12em] text-bone-strong">
                            {record}
                          </span>
                          <span className="font-semibold uppercase tracking-[0.14em] text-positive">
                            Resolving
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardVisual>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>
                <Mail aria-hidden className="h-3.5 w-3.5" />
                Email Infrastructure
              </Eyebrow>
              <LifecycleTag to="/portfolio/pulseassist-email" />
            </div>
            <h3 className="type-h3 mt-4 text-foreground">PulseAssist Email</h3>
            <p className="type-body mt-4">
              Transactional and marketing email on your own verified domain, with inbound routing,
              templates, automations, suppression handling and delivery analytics — from a console
              or a REST API. Part of the PulseAssist platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta
                to="/portfolio/pulseassist-email"
                size="sm"
                icon="arrow"
                aria-label="View PulseAssist Email platform details"
              >
                View Platform
              </Cta>
              <Cta
                to="mailto:corporate@enicehq.com?subject=PulseAssist%20Email%20Access%20Request"
                variant="secondary"
                size="sm"
                icon="external"
              >
                Request Access
              </Cta>
            </div>
          </ProductCard>
        </div>
      </Section>

      {/* ═══ PRODUCTS IN DEVELOPMENT ════════════════════════════════════════ */}
      <Section id="upcoming" tone="recessed" divider aria-labelledby="upcoming-heading">
        <SectionIntro
          id="upcoming-heading"
          eyebrow="Coming Soon"
          heading="Products in development"
          lead="Platforms in development and planning, expanding what ENICE Group builds."
        />

        {/* Three columns, not two: at `lg:grid-cols-2` the third card sat alone beside an empty
            cell, which reads as a missing product rather than a deliberate layout. These are the
            secondary, not-yet-launched set, so a tighter three-up is also the right weight. */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* ── PulsePay Payment Collection ── */}
          <ProductCard
            visual={
              <CardVisual className="h-56 sm:h-64">
                <div className="mesh-glow-center" />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div
                    className="panel w-full max-w-[240px] p-4"
                    style={{ boxShadow: SHADOW_CARD }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/[0.08] text-gold">
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div>
                        <div className="text-[11px] font-semibold text-foreground">
                          Payment Received
                        </div>
                        <div className="text-[9px] text-bone-faint">from a customer</div>
                      </div>
                    </div>
                    <div className="tnum mt-3 font-mono text-xl font-semibold tracking-tight text-foreground">
                      ₦45,000.00
                    </div>
                    <div className="mt-1 text-[9px] text-bone-faint">Just now</div>
                    <div className="mt-4 space-y-1.5 border-t border-border pt-3">
                      {COLLECTION_STEPS.map((step, i) => (
                        <div
                          key={step}
                          className="flex items-center gap-2 text-[10px] text-bone-soft"
                        >
                          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-surface-3 text-[8px] font-semibold text-bone-strong">
                            {i + 1}
                          </span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardVisual>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <LifecycleTag to="/portfolio/payment-collection" />
              <span className="type-meta">Launch: Q1 2027</span>
            </div>
            <h3 className="type-h3 mt-4 text-foreground">PulsePay Payment Collection</h3>
            <p className="type-body mt-4">
              Simple, reliable payment infrastructure that lets businesses accept and manage
              customer payments through a single, developer friendly integration.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta
                to="/portfolio/payment-collection"
                size="sm"
                icon="arrow"
                aria-label="Learn more about PulsePay Payment Collection"
              >
                View Details
              </Cta>
              <Cta
                to="mailto:corporate@enicehq.com?subject=Join%20the%20Payment%20Collection%20waitlist"
                variant="secondary"
                size="sm"
                icon="external"
              >
                Join Waitlist
              </Cta>
            </div>
          </ProductCard>

          {/* ── PulseX ── */}
          <ProductCard
            visual={
              <CardVisual className="h-56 sm:h-64">
                <div className="mesh-glow-center" />
                <div className="tech-grid tech-grid-flat" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/25 bg-gold/[0.08] text-gold">
                      <Bitcoin className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <div className="text-xl font-bold tracking-tight text-foreground">
                      Pulse<span className="text-gold">X</span>
                    </div>
                  </div>
                  <div className="w-full max-w-xs space-y-1.5">
                    {TICKERS.map((t) => (
                      <div
                        key={t.symbol}
                        className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-1.5"
                      >
                        <span className="font-mono text-[11px] font-semibold text-bone-strong">
                          {t.symbol}
                        </span>
                        <span className="text-[10px] text-bone-faint">{t.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="type-meta">Digital Assets · Crypto · DeFi</div>
                </div>
              </CardVisual>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <LifecycleTag to="/portfolio/pulsex" />
              <span className="type-meta">Launch: Q3 2027</span>
            </div>
            <h3 className="type-h3 mt-4 text-foreground">PulseX</h3>
            <p className="type-body mt-4">
              ENICE Group's digital asset platform, designed to make cryptocurrency and digital
              finance simple, secure, and accessible within the ENICE ecosystem.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta
                to="/portfolio/pulsex"
                size="sm"
                icon="arrow"
                aria-label="Learn more about PulseX"
              >
                View Details
              </Cta>
              <Cta
                to="mailto:corporate@enicehq.com?subject=Join%20the%20PulseX%20waitlist"
                variant="secondary"
                size="sm"
                icon="external"
              >
                Join Waitlist
              </Cta>
            </div>
          </ProductCard>

          {/* ── ePulse ── */}
          <ProductCard
            visual={
              <CardVisual className="h-56 sm:h-64">
                <div className="mesh-glow-center" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/25 bg-gold/[0.08] text-gold">
                      <Wallet className="h-7 w-7" strokeWidth={1.5} />
                    </span>
                    <div className="text-left">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                        Global Finance
                      </div>
                      <div className="text-xl font-bold tracking-tight text-foreground">
                        e<span className="text-gold">Pulse</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full max-w-xs flex-wrap justify-center gap-2">
                    {EPULSE_CURRENCIES.map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-border bg-surface-2 px-3 py-1 text-[11px] font-semibold text-bone-strong"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="type-meta">Multi-currency · Cross-border · Lifestyle</div>
                </div>
              </CardVisual>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <LifecycleTag to="/portfolio/epulse" />
              <span className="type-meta">Launch: TBA</span>
            </div>
            <h3 className="type-h3 mt-4 text-foreground">ePulse</h3>
            <p className="type-body mt-4">
              ENICE Group's upcoming global financial platform, built for freelancers, remote
              workers, creators, and global businesses who earn, send, and spend across borders.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta
                to="/portfolio/epulse"
                size="sm"
                icon="arrow"
                aria-label="Learn more about ePulse"
              >
                View Details
              </Cta>
              <Cta
                to="mailto:corporate@enicehq.com?subject=Join%20the%20ePulse%20waitlist"
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
