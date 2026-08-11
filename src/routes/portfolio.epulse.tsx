import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import {
  ArrowUpRight,
  Wallet,
  Send,
  Gift,
  Plane,
  Globe2,
  Building2,
  CreditCard,
  Users,
  Briefcase,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/epulse")({
  head: () => ({
    meta: [
      { title: "ePulse | Global Financial Platform — ENICE Group" },
      {
        name: "description",
        content:
          "ePulse is ENICE Group's upcoming global financial platform built for freelancers, remote workers, creators, and global businesses. Multi-currency accounts, international transfers, gift cards, and lifestyle services.",
      },
      {
        property: "og:title",
        content: "ePulse — Global Financial Platform by ENICE Group",
      },
      {
        property: "og:description",
        content:
          "ePulse makes international finance simple. Multi-currency accounts, dedicated receiving accounts (US, UK, Europe), fast transfers, gift cards, and lifestyle services.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      {
        property: "og:url",
        content: `${SITE_URL}/portfolio/epulse`,
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      {
        name: "twitter:title",
        content: "ePulse — Global Financial Platform by ENICE Group",
      },
      {
        name: "twitter:description",
        content:
          "ePulse: global finance for freelancers, remote workers, and creators. Multi-currency, international transfers, lifestyle services. Coming soon.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${SITE_URL}/portfolio/epulse`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "ePulse",
          description:
            "ENICE Group's upcoming global financial platform for people who earn, send, and spend money across borders. Multi-currency accounts, dedicated US/UK/EU receiving accounts, international transfers, gift cards, and lifestyle services.",
          url: `${SITE_URL}/portfolio/epulse`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web, iOS, Android",
          author: {
            "@type": "Organization",
            name: "ENICE Group",
            url: SITE_URL,
          },
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/PreOrder",
            description:
              "Waitlist available. Platform in active development.",
          },
        }),
      },
    ],
  }),
  component: EPulsePage,
});

const SHADOW_CARD =
  "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

// ─── Vision feature list ───────────────────────────────────────────────────────

const VISION = [
  {
    icon: Wallet,
    title: "Multi-currency accounts",
    desc: "Hold and manage balances in the currencies that matter to you — NGN, USD, GBP, EUR and more from a single account.",
  },
  {
    icon: Building2,
    title: "Dedicated receiving accounts",
    desc: "Local account details for supported countries, including the US, UK, and Europe — get paid like a local from anywhere.",
  },
  {
    icon: Send,
    title: "Fast international transfers",
    desc: "Send money across borders with predictable timing, transparent fees, and clear pricing — no surprises.",
  },
  {
    icon: Globe2,
    title: "Global payment solutions",
    desc: "Pay and get paid anywhere your work takes you — from client invoices to vendor payments across continents.",
  },
  {
    icon: Gift,
    title: "Gift card marketplace",
    desc: "Buy and redeem gift cards from trusted global and local brands — all within the ePulse platform.",
  },
  {
    icon: Plane,
    title: "Lifestyle services",
    desc: "Book hotels, plan travel, and access premium experiences — because great finance enables a great life.",
  },
];

// ─── Who it is built for ──────────────────────────────────────────────────────

const FOR_WHO = [
  {
    icon: Briefcase,
    label: "Freelancers",
    desc: "Get paid in USD, GBP, or EUR directly from international clients.",
  },
  {
    icon: Users,
    label: "Remote Workers",
    desc: "Receive your salary, save in multiple currencies, spend globally.",
  },
  {
    icon: CreditCard,
    label: "Creators",
    desc: "Monetise your content globally and manage earnings in one place.",
  },
  {
    icon: Globe2,
    label: "Global Businesses",
    desc: "Pay international suppliers and accept payments from anywhere.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function EPulsePage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-32">
          {/* Status badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-[11px] font-semibold tracking-[0.10em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Coming Soon
          </div>

          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl md:text-7xl">
            e<span className="text-primary">Pulse</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            ePulse is ENICE Group's upcoming global financial platform, built
            for people who{" "}
            <strong className="font-semibold text-foreground">
              earn, send, and spend money across borders
            </strong>
            . Designed for freelancers, remote workers, creators, and global
            businesses, ePulse aims to make international finance{" "}
            <em>simple and accessible</em>.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:corporate@enicehq.com?subject=Join%20the%20ePulse%20waitlist"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Join the Waitlist
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Back to Products
            </Link>
          </div>

          {/* Status meta */}
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-3">
            <div
              className="rounded-lg border border-border bg-background p-4 text-left"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                In Development
              </div>
            </div>
            <div
              className="rounded-lg border border-border bg-background p-4 text-left"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Expected Launch
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                To Be Announced
              </div>
            </div>
          </div>

          {/* Currency pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {[
              { flag: "🇺🇸", code: "USD" },
              { flag: "🇬🇧", code: "GBP" },
              { flag: "🇪🇺", code: "EUR" },
              { flag: "🇳🇬", code: "NGN" },
              { flag: "🇨🇦", code: "CAD" },
              { flag: "🇦🇺", code: "AUD" },
            ].map((c) => (
              <span
                key={c.code}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-semibold text-foreground/80"
              >
                {c.flag} {c.code}
              </span>
            ))}
            <span className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
              + more
            </span>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="border-b border-border bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Built For
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              People who live and work globally.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FOR_WHO.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-border bg-background p-6 text-center"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15">
                  <f.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                  {f.label}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Vision ── */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              The Vision
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              International finance, made simple.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              The ePulse platform includes everything you need to live your
              financial life without borders — from day-to-day spending to
              long-distance transfers to lifestyle services.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VISION.map((v) => (
              <li
                key={v.title}
                className="rounded-xl border border-border bg-background p-6"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                  <v.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-[16px] font-semibold text-foreground">
                  {v.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  {v.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Be First In Line
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Get notified when we launch.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Join the ePulse waitlist to receive launch updates, early access
            opportunities, and priority onboarding as we build toward launch.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:corporate@enicehq.com?subject=Join%20the%20ePulse%20waitlist"
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
