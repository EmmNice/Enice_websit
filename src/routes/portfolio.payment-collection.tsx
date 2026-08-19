import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Globe2,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SHADOW_CARD } from "@/lib/design";
import { ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/portfolio/payment-collection")({
  head: () =>
    pageHead("/portfolio/payment-collection", [
      breadcrumbJsonLd([
        { name: "Products", path: "/portfolio" },
        { name: "Payment Collection", path: "/portfolio/payment-collection" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "PulsePay Payment Collection",
        description:
          "ENICE Group's upcoming payment infrastructure for businesses: accept and manage customer payments through a single API, with real time updates and webhook notifications. Launching Q1 2027.",
        url: `${SITE_URL}/portfolio/payment-collection`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        releaseNotes: "Expected Q1 2027",
        author: ORGANIZATION_REF,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/PreOrder",
          description: "Waitlist available. Platform launching Q1 2027.",
        },
        featureList: [
          "Payment collection through a unified API",
          "Developer friendly integration",
          "Real time transaction and payment status updates",
          "Webhook based payment notifications",
          "Merchant and transaction management",
          "Built for scalable digital businesses",
        ],
      },
    ]),
  component: PaymentCollectionPage,
});

// ─── Who it's for ─────────────────────────────────────────────────────────────

const FOR_WHO = [
  {
    icon: Globe2,
    label: "Online Businesses",
    desc: "Accept customer payments without stitching together separate providers.",
  },
  {
    icon: Code2,
    label: "SaaS Platforms",
    desc: "Add payment collection to your product through one integration.",
  },
  {
    icon: ShoppingCart,
    label: "Marketplaces",
    desc: "Manage payments across many sellers and transactions from one place.",
  },
  {
    icon: TrendingUp,
    label: "Growing Enterprises",
    desc: "Infrastructure built to scale with transaction volume, not against it.",
  },
];

// ─── Key capabilities ─────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: Code2,
    title: "Unified payment API",
    desc: "Accept payments through a single, developer friendly integration.",
  },
  {
    icon: Zap,
    title: "Real time status updates",
    desc: "Track transactions and payment status as they happen, not after the fact.",
  },
  {
    icon: Webhook,
    title: "Webhook notifications",
    desc: "Get notified the moment a payment is received, so your product can react instantly.",
  },
  {
    icon: Store,
    title: "Merchant management",
    desc: "View and manage merchants and transactions from a single, clear dashboard.",
  },
  {
    icon: Users,
    title: "Built for platforms",
    desc: "Designed for businesses that collect payments on behalf of others, at any scale.",
  },
  {
    icon: CheckCircle2,
    title: "Reliable by design",
    desc: "Payment infrastructure built to stay dependable as transaction volume grows.",
  },
];

// ─── Payment notification mockup ──────────────────────────────────────────────

function PaymentNotificationCard() {
  return (
    <div
      className="relative flex flex-col justify-between rounded-2xl p-5 text-white"
      style={{
        width: 240,
        aspectRatio: "9/16",
        background: "linear-gradient(160deg, #0f1f52 0%, #142666 55%, #0c1840 100%)",
        boxShadow: "0 24px 48px -12px rgba(15,31,82,0.45)",
      }}
    >
      <div className="flex items-center justify-between text-[10px] font-medium text-white/50">
        <span>9:41</span>
        <span>ENICE</span>
      </div>

      <div className="mt-8 rounded-xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={2} />
          </span>
          <div>
            <div className="text-[11px] font-semibold text-white">Payment Received</div>
            <div className="text-[9px] text-white/50">from Adaeze&apos;s Store</div>
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-semibold tracking-tight text-white">
          ₦45,000.00
        </div>
        <div className="mt-1 text-[9px] text-white/40">Just now</div>
      </div>

      <div className="mt-4 space-y-2">
        {["Customer pays", "Payment processed", "Business receives funds"].map((step, i) => (
          <div key={step} className="flex items-center gap-2 text-[10px] text-white/60">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/10 text-[8px] font-semibold text-white/70">
              {i + 1}
            </span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function PaymentCollectionPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />
      <main id="main">
        {/* ── Hero ── */}
        <section className="border-b border-border bg-secondary py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-[11px] font-semibold tracking-[0.10em] text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Coming Q1 2027
              </div>

              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
                PulsePay Payment Collection
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Simple, reliable payment infrastructure for modern businesses. Accept and manage
                customer payments through a single, developer friendly integration.
              </p>

              <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                Built for businesses that need dependable payment infrastructure without managing
                multiple payment channels: collect payments, track transactions, and connect payment
                flows directly into your product.
              </p>

              {/* Meta cards */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: "Status", value: "Planned" },
                  { label: "Launch", value: "Q1 2027" },
                  { label: "Category", value: "Payments" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-border bg-background p-3"
                    style={{ boxShadow: SHADOW_CARD }}
                  >
                    <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {m.label}
                    </div>
                    <div className="mt-1 text-[12px] font-semibold text-foreground">{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="mailto:corporate@enicehq.com?subject=Join%20the%20Payment%20Collection%20waitlist"
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
            </div>

            {/* Visual */}
            <div className="flex items-center justify-center">
              <PaymentNotificationCard />
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
                From online businesses to growing enterprises.
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
                  <h3 className="mt-4 text-[15px] font-semibold text-foreground">{f.label}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Key capabilities ── */}
        <section className="bg-secondary py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Key Capabilities
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Payments, made easier to collect and scale.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Payment Collection is being built as part of ENICE Group's broader financial
                infrastructure, giving businesses the tools to run modern payment experiences.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((c) => (
                <div
                  key={c.title}
                  className="flex gap-4 rounded-xl border border-border bg-background p-6"
                  style={{ boxShadow: SHADOW_CARD }}
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                    <c.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">{c.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                      {c.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
              Join the waitlist to receive launch updates and early access when Payment Collection
              goes live in Q1 2027.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:corporate@enicehq.com?subject=Join%20the%20Payment%20Collection%20waitlist"
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
      </main>
      <SiteFooter />
    </div>
  );
}
