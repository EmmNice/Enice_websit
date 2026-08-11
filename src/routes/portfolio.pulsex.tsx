import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import {
  ArrowUpRight,
  Bitcoin,
  Lock,
  Globe,
  Layers,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/pulsex")({
  head: () => ({
    meta: [
      { title: "PulseX | Digital Asset Platform — ENICE Group" },
      {
        name: "description",
        content:
          "PulseX is ENICE Group's next-generation digital asset platform launching Q3 2027. Trade cryptocurrency, manage digital assets, and access DeFi — simple, secure, and integrated with the ENICE ecosystem.",
      },
      {
        property: "og:title",
        content: "PulseX — Digital Asset Platform by ENICE Group",
      },
      {
        property: "og:description",
        content:
          "PulseX is ENICE Group's next-generation digital asset platform, making cryptocurrency simple, secure, and accessible. Launching Q3 2027.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      {
        property: "og:url",
        content: `${SITE_URL}/portfolio/pulsex`,
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      {
        name: "twitter:title",
        content: "PulseX — Digital Asset Platform by ENICE Group",
      },
      {
        name: "twitter:description",
        content:
          "Next-generation cryptocurrency and digital asset platform from ENICE Group. Launching Q3 2027.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${SITE_URL}/portfolio/pulsex`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "PulseX",
          description:
            "ENICE Group's next-generation digital asset platform for cryptocurrency trading, secure custody, and cross-ecosystem digital finance. Launching Q3 2027.",
          url: `${SITE_URL}/portfolio/pulsex`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web, iOS, Android",
          releaseNotes: "Expected Q3 2027",
          author: {
            "@type": "Organization",
            name: "ENICE Group",
            url: SITE_URL,
          },
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/PreOrder",
            description: "Waitlist available. Platform launching Q3 2027.",
          },
        }),
      },
    ],
  }),
  component: PulseXPage,
});

const SHADOW_CARD =
  "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

// ─── Fake market data for the visual ─────────────────────────────────────────

const TICKER_DATA = [
  { symbol: "BTC/USDT", name: "Bitcoin", price: "67,420.00", change: "+2.41%", up: true, sparkline: [62, 61, 64, 68, 65, 70, 72, 71, 74, 73, 76, 74] },
  { symbol: "ETH/USDT", name: "Ethereum", price: "3,521.80", change: "+1.82%", up: true, sparkline: [38, 36, 37, 40, 39, 42, 41, 43, 44, 43, 45, 44] },
  { symbol: "SOL/USDT", name: "Solana", price: "182.40", change: "-0.63%", up: false, sparkline: [20, 21, 22, 20, 19, 21, 20, 18, 19, 18, 18, 17] },
  { symbol: "BNB/USDT", name: "BNB", price: "588.20", change: "+0.94%", up: true, sparkline: [55, 54, 56, 57, 56, 58, 59, 60, 58, 61, 62, 61] },
];

// ─── Sparkline SVG helper ─────────────────────────────────────────────────────

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
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      className="overflow-visible"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "#10b981" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Candlestick bar component ────────────────────────────────────────────────

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
            {/* Wick */}
            <div
              className={`w-px ${bar.up ? "bg-emerald-500/50" : "bg-red-500/50"}`}
              style={{ height: bar.h + "px" }}
            />
            {/* Body */}
            <div
              className={`absolute w-full max-w-[8px] rounded-sm ${bar.up ? "bg-emerald-500" : "bg-red-500"}`}
              style={{
                height: Math.max(bodyH, 4) + "px",
                top: bodyTop + "px",
                opacity: 0.85,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Feature highlights ───────────────────────────────────────────────────────

const HIGHLIGHTS = [
  {
    icon: BarChart3,
    title: "Multi-asset trading",
    desc: "Trade major digital assets with deep liquidity and institutional-grade execution — Bitcoin, Ethereum, and beyond.",
  },
  {
    icon: Lock,
    title: "Secure custody",
    desc: "Cold storage, multi-signature protection, and continuous on-chain monitoring for every asset in your portfolio.",
  },
  {
    icon: Layers,
    title: "Ecosystem-native",
    desc: "Move seamlessly between PulseX, PulsePay, and ePulse without leaving the ENICE stack — one account, every service.",
  },
  {
    icon: Globe,
    title: "Built for scale",
    desc: "Global access with compliance and reporting designed for regulated markets from day one — Africa, Europe, and beyond.",
  },
  {
    icon: Zap,
    title: "Instant settlement",
    desc: "Near-instant on-chain and off-chain settlement rails so your capital moves as fast as the market does.",
  },
  {
    icon: ShieldCheck,
    title: "Regulatory-ready",
    desc: "Compliance infrastructure built in from the ground up — KYC, AML, and transaction monitoring baked into the core.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function PulseXPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-[#080810]">
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(37,99,235,0.22) 0%, transparent 65%)",
          }}
        />
        {/* Grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 80%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left — copy */}
            <div>
              {/* Status badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-blue-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                </span>
                Coming Q3 2027
              </div>

              <h1 className="text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.03em] text-white sm:text-6xl">
                Pulse<span className="text-blue-400">X</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
                PulseX is ENICE Group's next-generation digital asset platform,
                designed to make cryptocurrency and digital finance{" "}
                <strong className="font-semibold text-white/80">
                  simple, secure, and accessible
                </strong>
                . The platform will enable users to manage digital assets with a
                seamless experience while integrating with the broader ENICE
                ecosystem.
              </p>

              {/* Meta cards */}
              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { label: "Status", value: "Planned Project" },
                  { label: "Launch", value: "Q3 2027" },
                  { label: "Category", value: "Digital Assets" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-white/8 bg-white/5 p-3"
                  >
                    <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      {m.label}
                    </div>
                    <div className="mt-1 text-[12px] font-semibold text-white/80">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="mailto:corporate@enicehq.com?subject=Join%20the%20PulseX%20waitlist"
                  className="group inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-[13px] font-semibold text-white transition-all hover:bg-blue-500"
                >
                  Join the Waitlist
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
                </a>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/6 px-6 py-3 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Back to Products
                </Link>
              </div>
            </div>

            {/* Right — crypto trading visual */}
            <div
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d1a]"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px -12px rgba(0,0,0,0.6)",
              }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
                  <span className="text-[12px] font-semibold text-white/70">
                    PulseX Markets
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium text-white/40">
                    Live Preview
                  </span>
                </div>
              </div>

              {/* Chart area */}
              <div className="border-b border-white/8 bg-[#0a0a14] px-4 pt-4 pb-2">
                <div className="flex items-start justify-between px-1 pb-2">
                  <div>
                    <div className="text-[11px] font-medium text-white/40">BTC/USDT</div>
                    <div className="mt-0.5 font-mono text-xl font-bold text-white">
                      $67,420.00
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-[11px] font-semibold text-emerald-400">
                      +2.41%
                    </span>
                  </div>
                </div>
                <CandlestickChart />
                {/* X-axis labels */}
                <div className="mt-1 flex justify-between px-1 pb-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <span
                        key={d}
                        className="text-[8px] font-medium text-white/20"
                      >
                        {d}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Ticker list */}
              <div className="divide-y divide-white/6">
                {TICKER_DATA.map((t) => (
                  <div
                    key={t.symbol}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-white/80">
                          {t.symbol}
                        </span>
                        <span className="text-[10px] text-white/30">{t.name}</span>
                      </div>
                    </div>
                    <Sparkline data={t.sparkline} up={t.up} />
                    <div className="text-right">
                      <div className="font-mono text-[12px] font-semibold text-white/70">
                        ${t.price}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${t.up ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {t.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Panel footer */}
              <div className="flex items-center justify-center border-t border-white/6 px-5 py-3">
                <span className="text-[10px] font-medium text-white/20">
                  Simulated preview · Real-time data at launch
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What to Expect ── */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Platform Capabilities
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Digital assets, without the friction.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              PulseX will let users manage digital assets with a seamless
              experience, fully integrated across the broader ENICE Group
              ecosystem.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="flex gap-4 rounded-xl border border-border bg-background p-6"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                  <h.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">
                    {h.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ecosystem integration strip ── */}
      <section className="border-y border-border bg-background py-16">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            ENICE Ecosystem
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            One ecosystem. Every financial need.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            PulseX is deeply integrated with PulsePay and ePulse — move between
            crypto and traditional finance without friction, all from a single
            account.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: "PulsePay", sub: "Virtual Cards & Wallets", to: "/portfolio/pulsepay" as const },
              { label: "ePulse", sub: "Global Banking", to: "/portfolio/epulse" as const },
              { label: "PulseX", sub: "Digital Assets", to: "/portfolio/pulsex" as const },
            ].map((v, i) => (
              <div key={v.label} className="flex items-center gap-4">
                <Link
                  to={v.to}
                  className="rounded-xl border border-border bg-background px-6 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40"
                  style={{ boxShadow: SHADOW_CARD }}
                >
                  <div className="text-[15px] font-semibold text-foreground">
                    {v.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {v.sub}
                  </div>
                </Link>
                {i < 2 && (
                  <div className="hidden text-muted-foreground/40 sm:block">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Be First In Line
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Get early access when we launch.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Join the PulseX waitlist to receive launch updates, early access
            opportunities, and priority onboarding when the platform goes live
            in Q3 2027.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:corporate@enicehq.com?subject=Join%20the%20PulseX%20waitlist"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Join the Waitlist
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-7 py-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
