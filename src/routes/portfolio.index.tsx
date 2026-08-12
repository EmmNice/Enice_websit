import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import {
  ArrowUpRight,
  Wifi,
  CreditCard,
  BrainCircuit,
  Wallet,
  Bitcoin,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
       { title: "Products | ENICE Group" },
      {
        name: "description",
        content:
           "PulsePay, PulseAssist, ePulse, and PulseX: the products built and operated by ENICE Group.",
      },
      {
        property: "og:title",
         content: "ENICE Group Products",
      },
      {
        property: "og:description",
        content:
           "PulsePay, PulseAssist, ePulse, and PulseX: products built by ENICE Group.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      { property: "og:url", content: `${SITE_URL}/portfolio` },
      { property: "og:image", content: `${SITE_URL}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "ENICE Group Products" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      { name: "twitter:image", content: `${SITE_URL}/og.png` },
       { name: "twitter:title", content: "ENICE Group Products" },
      {
        name: "twitter:description",
        content:
           "PulsePay, PulseAssist, ePulse, and PulseX, products built by ENICE Group.",
      },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/portfolio` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
           name: "ENICE Group Products",
          description:
            "Proprietary software products and infrastructure networks built by ENICE Group.",
          url: `${SITE_URL}/portfolio`,
          publisher: {
            "@type": "Organization",
            name: "ENICE Group",
            url: SITE_URL,
          },
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
              name: "ePulse",
              url: `${SITE_URL}/portfolio/epulse`,
              applicationCategory: "FinanceApplication",
            },
            {
              "@type": "SoftwareApplication",
              name: "PulseX",
              url: `${SITE_URL}/portfolio/pulsex`,
              applicationCategory: "FinanceApplication",
            },
          ],
        }),
      },
    ],
  }),
  component: PortfolioIndexPage,
});

const SHADOW_CARD =
  "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const SHADOW_LIFT =
  "0 4px 6px -1px rgba(17,24,39,0.06), 0 10px 24px -8px rgba(17,24,39,0.08)";

const QUEUE_ROWS = [
  { id: "REQ_001", state: "Resolved", width: "w-full", isLive: false },
  { id: "REQ_002", state: "Routing", width: "w-[82%]", isLive: false },
  { id: "REQ_003", state: "Processing", width: "w-[64%]", isLive: true },
  { id: "REQ_004", state: "Queued", width: "w-[46%]", isLive: false },
];

function PortfolioIndexPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />
      <main id="main">

      {/* ── Page header ── */}
      <section className="border-b border-border bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
             ENICE Products
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
             Products built by ENICE Group
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
             Payments, financial services, business communication, and digital
             commerce. Each product runs on the same infrastructure and is
             built to operate at scale.
          </p>
        </div>
      </section>

       {/* ── Active Products ── */}
      <section className="bg-secondary py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
               Active Products
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Operational platforms
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
               Products currently being built and operated by ENICE Group.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* ── PulsePay ── */}
            <article
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-background"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="relative aspect-[4/3] border-b border-border bg-secondary sm:aspect-[8/5]">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.6]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                {/* Two-card stack — shadow + main */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Shadow card */}
                  <div
                    aria-hidden
                    className="absolute rounded-2xl"
                    style={{
                      width: 220,
                      aspectRatio: "1.586/1",
                      background: "linear-gradient(135deg, #b0b8c8 0%, #8a94a6 100%)",
                      opacity: 0.55,
                      transform: "rotate(5deg) translate(10%, -8%)",
                      boxShadow: "0 12px 30px rgba(17,24,39,0.18)",
                    }}
                  />
                  {/* Main card */}
                  <div
                    className="relative flex flex-col justify-between rounded-2xl p-4 text-white"
                    style={{
                      width: 220,
                      aspectRatio: "1.586/1",
                      background: "linear-gradient(135deg, #1a2e6b 0%, #0f1f52 55%, #162560 100%)",
                      transform: "rotate(-3deg)",
                      boxShadow: "0 20px 50px rgba(17,24,39,0.35)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/90">
                        PulsePay
                      </span>
                      <Wifi className="h-3.5 w-3.5 rotate-90 text-white/70" aria-hidden />
                    </div>
                    <div className="h-6 w-9 rounded-md bg-gradient-to-br from-yellow-100 to-amber-400" />
                    <div className="font-mono text-[9px] tracking-[0.2em] text-white/80">
                      •••• •••• •••• ••••
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[6px] uppercase tracking-[0.2em] text-white/50">Cardholder</div>
                        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/95">
                          ENICE GROUP
                        </div>
                      </div>
                      <CreditCard className="h-4 w-4 text-white/60" strokeWidth={1.5} aria-label="Virtual payment card" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                  Fintech Infrastructure Platform
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  PulsePay
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  A virtual payment platform that issues Naira and USD cards,
                  handles KYC verification, moves funds between users, and
                  delivers value-added services with speed and reliability.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/portfolio/pulsepay"
                    className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    aria-label="View PulsePay platform details"
                  >
                    View Platform
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="mailto:corporate@enicehq.com?subject=PulsePay%20Access%20Request"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    Request Access
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>

            {/* ── PulseAssist ── */}
            <article
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-background"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="relative h-64 overflow-hidden border-b border-border bg-secondary">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.6]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full max-w-sm space-y-2.5">
                    {QUEUE_ROWS.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
                        style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
                      >
                        <span
                          className={`relative flex h-1.5 w-1.5 shrink-0 ${!row.isLive && "opacity-50"}`}
                        >
                          {row.isLive && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                          )}
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                          {row.id}
                        </span>
                        <div className="relative ml-1 h-1 flex-1 overflow-hidden rounded-full bg-border">
                          <div
                            className={`h-full rounded-full bg-primary ${row.width}`}
                          />
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {row.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Enterprise Conversational SaaS
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  PulseAssist
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  A multi-tenant AI operations platform for telecoms and
                  financial networks. It handles customer support routing,
                  provides API-driven account management, and hands calls to
                  live agents in real time when needed.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="https://www.getpulseassist.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    aria-label="Visit PulseAssist platform"
                  >
                    Visit Platform
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
                  </a>
                  <Link
                    to="/portfolio/pulseassist"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary"
                    aria-label="View PulseAssist platform details"
                  >
                    Learn More
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

       {/* ── Products in development ── */}
      <section className="border-t border-border bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Coming Soon
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
               Products in development
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Platforms in development and planning, expanding what ENICE Group
              builds.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* ── ePulse ── */}
            <article
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-background"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="relative h-64 overflow-hidden border-b border-border bg-secondary">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(37,99,235,0.10) 0%, transparent 70%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="flex items-center gap-3">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                      <Wallet className="h-7 w-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Global Finance
                      </div>
                      <div className="text-xl font-bold tracking-tight text-foreground">
                        e<span className="text-primary">Pulse</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full max-w-xs flex-wrap justify-center gap-2">
                    {["🇺🇸 USD", "🇬🇧 GBP", "🇪🇺 EUR", "🇳🇬 NGN"].map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-border bg-background px-3 py-1 text-[11px] font-semibold text-foreground/80"
                        style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.06)" }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70">
                    Multi-currency · Cross-border · Lifestyle
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    In Development
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Launch: TBA
                  </span>
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  ePulse
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  ENICE Group's upcoming global financial platform, built for
                  freelancers, remote workers, creators, and global businesses
                  who earn, send, and spend across borders.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/portfolio/epulse"
                    className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    aria-label="Learn more about ePulse"
                  >
                    View Details
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="mailto:corporate@enicehq.com?subject=Join%20the%20ePulse%20waitlist"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    Join Waitlist
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>

            {/* ── PulseX ── */}
            <article
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-background"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="relative h-64 overflow-hidden border-b border-border bg-[#080810]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 70%)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30">
                      <Bitcoin className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
                    </div>
                    <div className="font-bold text-xl tracking-tight text-white">
                      Pulse<span className="text-blue-400">X</span>
                    </div>
                  </div>
                  <div className="w-full max-w-xs space-y-1.5">
                    {[
                      { symbol: "BTC", price: "67,420.00", change: "+2.41%", up: true },
                      { symbol: "ETH", price: "3,521.80", change: "+1.82%", up: true },
                      { symbol: "SOL", price: "182.40", change: "-0.63%", up: false },
                    ].map((t) => (
                      <div
                        key={t.symbol}
                        className="flex items-center justify-between rounded-md border border-white/8 bg-white/5 px-3 py-1.5"
                      >
                        <span className="font-mono text-[11px] font-semibold text-white/80">
                          {t.symbol}
                        </span>
                        <span className="font-mono text-[11px] text-white/70">
                          ${t.price}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${t.up ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {t.change}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-medium text-white/30">
                    Digital Assets · Crypto · DeFi
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-600">
                    <span className="h-1 w-1 rounded-full bg-amber-500" />
                    Planned
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Launch: Q3 2027
                  </span>
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  PulseX
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  ENICE Group's digital asset platform, designed to make
                  cryptocurrency and digital finance simple, secure, and
                  accessible within the ENICE ecosystem.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/portfolio/pulsex"
                    className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    aria-label="Learn more about PulseX"
                  >
                    View Details
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="mailto:corporate@enicehq.com?subject=Join%20the%20PulseX%20waitlist"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    Join Waitlist
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
