import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  Check,
  Cpu,
  CreditCard,
  Database,
  FileCheck2,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { FAQSection } from "@/components/site/FAQSection";
import { Reveal } from "@/components/site/Reveal";
import { PartnersStrip } from "@/components/site/PartnersStrip";
import { StyledText } from "@/components/site/StyledText";
import { Container, Cta, Eyebrow } from "@/components/site/primitives";
import {
  EngineConsole,
  FagaMock,
  HeroConsole,
  PulseAssistMock,
  PulsePayMock,
} from "@/components/site/home/ProductMockups";
import { useSectionFields, fieldText, fieldItems } from "@/lib/cms/use-section";
import { organizationJsonLd, pageHead, webSiteJsonLd } from "@/lib/seo";
import { isRetiredProductPath } from "@/lib/retired-products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  // FAQ markup is deliberately absent here: `FAQSection` emits it from the questions it actually
  // renders, so an edited FAQ cannot end up described by stale markup. See that component.
  head: () => pageHead("/", [organizationJsonLd(), webSiteJsonLd()]),
  component: Landing,
});

// ─── Content ──────────────────────────────────────────────────────────────────
//
// The page is laid out the way large enterprise software homepages are: a lit hero with the
// product on screen, a "pick your product" grid, one alternating feature row per product with its
// interface beside it, the shared platform on a deep band, then FAQ and a closing call to action.
//
// Copy blocks are CMS fallbacks: each band reads its `home.*` section and overlays whatever an
// administrator has published. See `src/lib/cms/use-section.ts`.

/** Icons an editor may name on a CMS-managed card. Unknown names fall back to a neutral icon. */
const CARD_ICONS: Record<string, LucideIcon> = {
  BrainCircuit,
  Boxes,
  Check,
  Cpu,
  CreditCard,
  Database,
  FileCheck2,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Wifi,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

interface Product {
  to: string;
  title: string;
  kicker: string;
  icon: LucideIcon;
  /** One line for the product grid. */
  summary: string;
  /** The feature row. */
  heading: string;
  desc: string;
  bullets: string[];
  facts: { label: string; value: string }[];
  mock: () => ReactNode;
}

/**
 * The three products ENICE Group runs. This list is the portfolio — the homepage shows nothing
 * else, whatever the CMS holds (see `src/lib/retired-products.ts`).
 */
const PRODUCTS: Product[] = [
  {
    to: "/portfolio/pulsepay",
    title: "PulsePay",
    kicker: "Digital payments",
    icon: CreditCard,
    summary:
      "Naira and USD virtual cards, programmable wallets, embedded KYC and instant transfers.",
    heading: "Issue cards and move money in minutes",
    desc: "A virtual payment platform for modern commerce: instant Naira and USD card issuance, programmable wallets, embedded KYC, and fast peer-to-peer transfers built for businesses and individuals.",
    bullets: [
      "Virtual Naira and USD cards on demand",
      "Wallets with spend controls and ledgers",
      "KYC and fraud checks built into every flow",
    ],
    facts: [
      { label: "Cards", value: "Naira & USD" },
      { label: "Market", value: "Nigeria" },
    ],
    mock: () => <PulsePayMock />,
  },
  {
    to: "/portfolio/pulseassist",
    title: "PulseAssist",
    kicker: "Customer support AI",
    icon: BrainCircuit,
    summary:
      "AI customer support across WhatsApp, web, email, SMS and voice, with live agent handoff.",
    heading: "Answer every customer, on every channel",
    desc: "An AI support platform built for growing businesses, startups, and digital teams, with automated queue handling, live agent handoff, and smart customer workflow tools.",
    bullets: [
      "One shared inbox for WhatsApp, web chat, email, SMS and voice",
      "AI replies grounded in your own knowledge base",
      "Hands off to a person the moment it matters",
    ],
    facts: [
      { label: "Channels", value: "WhatsApp, web & more" },
      { label: "Tenancy", value: "Multi-tenant" },
    ],
    mock: () => <PulseAssistMock />,
  },
  {
    to: "/portfolio/faga",
    title: "Faga",
    kicker: "Email infrastructure",
    icon: Mail,
    summary:
      "Transactional and marketing email with verified domains, templates, webhooks and analytics.",
    heading: "Email that reaches the inbox",
    desc: "Faga handles the same email delivery work businesses use SendGrid or Resend for: transactional and marketing messages, verified domains, templates, webhooks, analytics, and API-driven sending.",
    bullets: [
      "Verified sending domains with DKIM, SPF and DMARC",
      "Templates, automations and suppression handling",
      "Delivery analytics, webhooks and a REST API",
    ],
    facts: [
      { label: "Delivery", value: "Transactional & marketing" },
      { label: "Integration", value: "REST API & webhooks" },
    ],
    mock: () => <FagaMock />,
  },
];

const CORE_MODULES = [
  {
    icon: Cpu,
    title: "AI & Automation",
    desc: "Centralized AI tools and smart workflows that power products like PulseAssist to handle customer support and communication seamlessly.",
  },
  {
    icon: Database,
    title: "Fast Payments & Ledgers",
    desc: "A reliable transaction engine and virtual account system that powers PulsePay and future financial tools we build.",
  },
  {
    icon: FileCheck2,
    title: "Built-In Compliance & KYC",
    desc: "Identity verification, fraud checks, and security screening running automatically in real time across all our products.",
  },
];

const COMPLIANCE_BADGES = [
  { icon: ShieldCheck, label: "Row-level security" },
  { icon: Lock, label: "Per-tenant isolation" },
  { icon: Check, label: "Audit logging" },
  { icon: Wifi, label: "Encrypted in transit and at rest" },
];

/** Plain, checkable statements for the hero's trust row — no ratings we have not earned. */
const HERO_PROOF = [
  { icon: Globe, label: "Built in Nigeria", sub: "for businesses across Africa" },
  { icon: Boxes, label: "Three products", sub: "on one shared platform" },
  { icon: ShieldCheck, label: "Secure by default", sub: "isolation, audit, encryption" },
];

/** `Label: Value` lines from a CMS `bullets` field. */
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

// ─── Page ─────────────────────────────────────────────────────────────────────

function Landing() {
  const hero = useSectionFields("home.hero");
  const portfolio = useSectionFields("home.portfolio");
  const core = useSectionFields("home.core");
  const mechanisms = useSectionFields("home.mechanisms");

  // Published product copy overlays the built-in copy for the same path. The set of products and
  // their interfaces is fixed: a CMS tile for any other path (including retired products) is
  // ignored rather than rendered without an interface.
  const cmsProducts = fieldItems(portfolio, "items", [] as Record<string, unknown>[], (row) => {
    const to = typeof row.url === "string" ? row.url.trim() : "";
    return to && !isRetiredProductPath(to) ? row : null;
  });
  const products = PRODUCTS.map((p) => {
    const row = cmsProducts.find((r) => typeof r.url === "string" && r.url.trim() === p.to);
    if (!row) return p;
    const desc = typeof row.description === "string" ? row.description.trim() : "";
    const kicker = typeof row.kicker === "string" ? row.kicker.trim() : "";
    const facts = parseFacts(row.bullets);
    return {
      ...p,
      desc: desc || p.desc,
      kicker: kicker || p.kicker,
      facts: facts.length > 0 ? facts : p.facts,
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

  const badges = fieldItems(mechanisms, "items", COMPLIANCE_BADGES, (row) => {
    const label = typeof row.title === "string" ? row.title.trim() : "";
    if (!label) return null;
    return { icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""), label };
  });

  return (
    <SiteShell progress={false}>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="hero-brand relative overflow-hidden" aria-labelledby="hero-heading">
        <Container className="relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-28">
          <div>
            <div
              className="animate-hero-up inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm"
              style={{ animationDelay: "0ms" }}
            >
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bone-strong">
                <StyledText
                  text={fieldText(hero, "eyebrow", "AI, payments and email infrastructure")}
                  accentClassName="text-electric"
                />
              </span>
            </div>

            <h1
              id="hero-heading"
              className="animate-hero-up mt-7 text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.5rem]"
              style={{ animationDelay: "60ms", textWrap: "balance" }}
            >
              <StyledText
                text={fieldText(hero, "heading", "Run payments, support and email on one platform")}
                accentClassName="text-electric"
              />
            </h1>

            <p
              className="animate-hero-up mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-bone-strong sm:text-lg"
              style={{ animationDelay: "120ms" }}
            >
              <StyledText
                text={fieldText(
                  hero,
                  "subheading",
                  "PulsePay, PulseAssist and Faga give your business cards and wallets, AI customer support, and reliable email delivery, all built and operated by ENICE Group.",
                )}
                accentClassName="text-electric"
              />
            </p>

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
                to={fieldText(hero, "secondaryCtaUrl", "/contact")}
                variant="secondary"
                size="lg"
                data-cta="hero-secondary"
              >
                {fieldText(hero, "secondaryCtaLabel", "Talk to our team")}
              </Cta>
            </div>

            <p
              className="animate-hero-up mt-4 text-[11px] text-bone-faint"
              style={{ animationDelay: "200ms" }}
            >
              ENICE Group is the technology brand of ENICE Technology Limited.
            </p>

            <ul
              className="animate-hero-up mt-12 grid max-w-xl grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3"
              style={{ animationDelay: "240ms" }}
            >
              {HERO_PROOF.map((p) => (
                <li key={p.label} className="flex items-start gap-3 sm:block">
                  <p.icon
                    aria-hidden
                    className="h-5 w-5 shrink-0 text-electric"
                    strokeWidth={1.75}
                  />
                  <div className="sm:mt-3">
                    <div className="text-[14px] font-semibold text-white">{p.label}</div>
                    <div className="mt-0.5 text-[12.5px] text-bone-soft">{p.sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-hero-right relative lg:pl-6" style={{ animationDelay: "160ms" }}>
            <HeroConsole />
          </div>
        </Container>
      </section>

      <div className="theme-light">
        <PartnersStrip />

        {/* ═══ PRODUCT GRID ═══════════════════════════════════════════════ */}
        <section
          id="products"
          className="bg-surface-1 py-20 sm:py-24"
          aria-labelledby="products-heading"
        >
          <Container>
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow className="justify-center">
                  {fieldText(portfolio, "eyebrow", "Our products")}
                </Eyebrow>
                <h2 id="products-heading" className="type-h2 mt-5 text-foreground">
                  <StyledText
                    text={fieldText(
                      portfolio,
                      "heading",
                      "Start with the product you need, or run all three together",
                    )}
                    accentClassName="text-electric"
                  />
                </h2>
                <p className="type-lead mx-auto mt-5 max-w-2xl">
                  <StyledText
                    text={fieldText(
                      portfolio,
                      "subheading",
                      "Every product is built on the same ENICE Engine, so payments, conversations and email share one secure foundation.",
                    )}
                    accentClassName="text-electric"
                  />
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-3">
              {products.map((p, i) => (
                <Reveal key={p.to} delay={i * 70}>
                  <article className="group flex h-full gap-5 border-t border-border pt-7">
                    <span className="app-icon h-14 w-14 rounded-2xl">
                      <p.icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-foreground">
                          {p.title}
                        </h3>
                        <ArrowRight
                          aria-hidden
                          className="mt-1.5 h-5 w-5 shrink-0 text-bone-soft transition-transform group-hover:translate-x-1 group-hover:text-electric"
                        />
                      </div>
                      <p className="mt-2.5 text-[15px] leading-relaxed text-bone-soft">
                        {p.summary}
                      </p>
                      <div className="mt-auto pt-6">
                        <Link to={p.to as "/"} className="link-underline">
                          Learn more<span className="sr-only"> about {p.title}</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            {/* Wide banner, the platform pitch under the grid. */}
            <Reveal>
              <div className="mt-16 grid overflow-hidden rounded-2xl border border-border bg-white md:grid-cols-[18rem_1fr]">
                <div aria-hidden className="band-brand relative grid min-h-40 place-items-center">
                  <img
                    src="/brand/enice-mark.svg"
                    alt=""
                    width={112}
                    height={80}
                    className="h-20 w-auto"
                  />
                </div>
                <div className="flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <h3 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-foreground">
                      One account across the ENICE ecosystem
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-bone-soft">
                      Shared identity, permissions, compliance and billing, so adding a second
                      product is a switch, not a new integration project.
                    </p>
                  </div>
                  <div className="btn-stack flex shrink-0 flex-wrap gap-3">
                    <Cta to="/contact" icon="arrow">
                      Get in touch
                    </Cta>
                    <Cta to="/portfolio" variant="secondary">
                      All products
                    </Cta>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ═══ PRODUCT FEATURE ROWS ═══════════════════════════════════════ */}
        <section className="bg-background py-20 sm:py-28" aria-labelledby="platform-heading">
          <Container>
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h2 id="platform-heading" className="type-h2 text-foreground">
                  Software your business runs on, every day
                </h2>
                <p className="type-lead mx-auto mt-5 max-w-2xl">
                  We design, launch and operate our own products instead of handing them off after
                  release, so the tools you rely on keep getting better.
                </p>
              </div>
            </Reveal>

            <div className="mt-20 space-y-24 sm:space-y-32">
              {products.map((p, i) => (
                <FeatureRow key={p.to} product={p} reverse={i % 2 === 1} />
              ))}
            </div>
          </Container>
        </section>
      </div>

      {/* ═══ THE ENICE ENGINE ═══════════════════════════════════════════════ */}
      <section
        className="band-brand relative overflow-hidden py-20 sm:py-28"
        aria-labelledby="core-heading"
      >
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow className="justify-center">
                {fieldText(core, "eyebrow", "What powers our products")}
              </Eyebrow>
              <h2 id="core-heading" className="type-h2 mt-5 text-white">
                <StyledText
                  text={fieldText(core, "heading", "The ENICE Engine")}
                  accentClassName="text-electric"
                />
              </h2>
              <p className="type-lead mx-auto mt-5 max-w-2xl text-bone-strong">
                <StyledText
                  text={fieldText(
                    core,
                    "subheading",
                    "All of our apps share the same underlying technology, making every product faster, more reliable, and secure right out of the box.",
                  )}
                  accentClassName="text-electric"
                />
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {coreModules.map((c, i) => (
                <Reveal key={c.title} delay={i * 70}>
                  <li className="flex gap-5 py-7">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-[#0048ed]">
                      <c.icon aria-hidden className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    <div>
                      <h3 className="text-[1.0625rem] font-semibold text-white">
                        <StyledText text={c.title} accentClassName="text-electric" />
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-bone-soft">
                        <StyledText text={c.desc} accentClassName="text-electric" />
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={120}>
              <div>
                <EngineConsole />
                <ul className="mt-6 flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <li
                      key={b.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-bone-strong"
                    >
                      <b.icon aria-hidden className="h-3.5 w-3.5 text-electric" strokeWidth={2} />
                      {b.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 max-w-lg text-[13px] leading-relaxed text-bone-faint">
                  {fieldText(
                    mechanisms,
                    "subheading",
                    "Built in compliance with applicable standards in the Federal Republic of Nigeria, with strict privacy controls and security architecture across all systems.",
                  )}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <div className="theme-light">
        <FAQSection />
      </div>

      {/* ═══ CLOSING CTA ════════════════════════════════════════════════════ */}
      <section className="band-cta relative overflow-hidden" aria-labelledby="cta-heading">
        <Container className="flex flex-col items-start justify-between gap-8 py-16 sm:py-20 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 id="cta-heading" className="type-h2 text-white">
              See what ENICE can do for your business
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-white/85">
              Tell us what you are building. We will show you the right product and how to get
              started.
            </p>
          </div>
          <div className="btn-stack flex shrink-0 flex-wrap gap-3">
            <Cta to="/contact" size="lg" icon="arrow" className="btn-inverse" data-cta="closing">
              Contact our team
            </Cta>
            <Cta to="/portfolio" size="lg" variant="secondary" className="btn-outline-inverse">
              Explore products
            </Cta>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureRow({ product: p, reverse }: { product: Product; reverse: boolean }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <Reveal className={cn(reverse && "lg:order-2")}>
        <div>
          <div className="flex items-center gap-3">
            <span className="app-icon h-9 w-9 rounded-xl">
              <p.icon aria-hidden className="h-4 w-4" strokeWidth={1.9} />
            </span>
            <span className="text-[15px] font-semibold text-foreground">{p.title}</span>
            <span className="text-[13px] text-bone-faint">· {p.kicker}</span>
          </div>
          <h3 className="mt-6 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[2rem]">
            {p.heading}
          </h3>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-bone-soft">
            <StyledText text={p.desc} accentClassName="text-electric" />
          </p>

          <ul className="mt-7 space-y-3">
            {p.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[15px] text-bone-strong">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eaf0fd] text-electric">
                  <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          {p.facts.length > 0 && (
            <dl className="mt-9 grid grid-cols-2 gap-6 rounded-2xl bg-surface-1 p-6 sm:p-7">
              {p.facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-[13px] text-bone-soft">{f.label}</dt>
                  <dd className="text-[1.125rem] font-semibold tracking-tight text-foreground">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            <Link to={p.to as "/"} className="link-underline">
              Explore {p.title}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal delay={100} className={cn(reverse && "lg:order-1")}>
        {p.mock()}
      </Reveal>
    </div>
  );
}
