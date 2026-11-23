import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowRight, Bitcoin, CreditCard, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { FAQSection } from "@/components/site/FAQSection";
import { Reveal } from "@/components/site/Reveal";
import { StyledText } from "@/components/site/StyledText";
import { Container, Cta, Eyebrow } from "@/components/site/primitives";
import { useSectionFields, fieldText, fieldItems } from "@/lib/cms/use-section";
import { organizationJsonLd, pageHead, webSiteJsonLd } from "@/lib/seo";
import { isRetiredProductPath } from "@/lib/retired-products";

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

/**
 * The two plain-English bands under the product grid.
 *
 * Written to be read by someone deciding whether to trust the company with money, not by someone
 * comparing feature tables: no platform language, no "solutions", no counts of capabilities. The
 * About band states where the company is, what it has live, and what it is for.
 */
const FOCUS = [
  {
    icon: CreditCard,
    title: "Payments & Cards",
    body: "Simple Naira and USD virtual cards and fast transfers through PulsePay.",
  },
  {
    icon: Bitcoin,
    title: "Digital Assets",
    body: "Straightforward digital asset trading and account management through PrideTrade.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    body: "Built to Nigerian regulatory and data protection standards with strict account security.",
  },
];

const ABOUT_FACTS = [
  { title: "Founded in Nigeria", detail: "Nigerian owned and operated" },
  { title: "2 live platforms", detail: "PulsePay & PrideTrade" },
  { title: "Built for everyday use", detail: "And business operations" },
];

interface Product {
  to: string;
  title: string;
  kicker: string;
  /** Optional product mark, shown beside the name. */
  mark?: string;
  /** The product's own accent, used on its label, rule and link. */
  accent: string;
  icon: LucideIcon;
  /** The one-line position under the product name. */
  summary: string;
  /** What the product does, in plain terms. */
  desc: string;
  bullets: string[];
  facts: { label: string; value: string }[];
}

/**
 * The products ENICE Group runs today. The portfolio is expected to grow, so nothing here assumes
 * else, whatever the CMS holds (see `src/lib/retired-products.ts`).
 */
const PRODUCTS: Product[] = [
  {
    to: "/portfolio/pulsepay",
    title: "PulsePay",
    kicker: "Digital payments",
    mark: "/brand/pulsepay-mark.png",
    accent: "accent-pulsepay",
    icon: CreditCard,
    summary:
      "Naira and USD virtual cards, programmable wallets, embedded KYC and instant transfers.",
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
  },
  {
    to: "/portfolio/pride",
    title: "PrideTrade",
    kicker: "Digital assets",
    accent: "accent-pride",
    icon: Bitcoin,
    summary: "Trading and custody for digital assets, with its own ledger and controls.",
    desc: "PrideTrade is ENICE Group's digital asset platform: trading, custody and transfers in one account, run on its own ledger and compliance controls.",
    bullets: [
      "Digital asset trading in one account",
      "Custody and transfers built on the ENICE ledger",
      "KYC and monitoring built in from day one",
    ],
    facts: [
      { label: "Launch", value: "2027" },
      { label: "Category", value: "Digital assets" },
    ],
  },
];

/** Plain, checkable statements for the hero's trust row — no ratings we have not earned. */

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

  return (
    <SiteShell progress={false}>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="hero-brand relative overflow-hidden" aria-labelledby="hero-heading">
        <Container className="relative flex min-h-[68vh] flex-col justify-center py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="animate-hero-up text-[11px] font-semibold uppercase tracking-[0.16em] text-electric sm:text-[11.5px]"
              style={{ animationDelay: "20ms" }}
            >
              {fieldText(hero, "eyebrow", "Financial technology & digital infrastructure")}
            </p>

            <h1
              id="hero-heading"
              className="animate-hero-up mt-5 text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-[2.875rem] lg:text-[3.5rem]"
              style={{ animationDelay: "60ms", textWrap: "balance" }}
            >
              <StyledText
                text={fieldText(
                  hero,
                  "heading",
                  "Building the infrastructure behind modern finance.",
                )}
                accentClassName="text-electric"
              />
            </h1>

            <p
              className="animate-hero-up mx-auto mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-bone-strong sm:text-lg"
              style={{ animationDelay: "120ms" }}
            >
              <StyledText
                text={fieldText(
                  hero,
                  "subheading",
                  "ENICE develops financial technology and digital asset infrastructure through PulsePay and PrideTrade, creating solutions that simplify payments and expand access to digital financial services.",
                )}
                accentClassName="text-electric"
              />
            </p>

            <div
              className="animate-hero-up btn-stack mt-9 flex flex-wrap justify-center gap-3"
              style={{ animationDelay: "180ms" }}
            >
              <Cta
                to={fieldText(hero, "primaryCtaUrl", "/portfolio")}
                size="lg"
                icon="arrow"
                data-cta="hero-primary"
              >
                {fieldText(hero, "primaryCtaLabel", "Discover our solutions")}
              </Cta>
              <Cta
                to={fieldText(hero, "secondaryCtaUrl", "/contact")}
                variant="secondary"
                size="lg"
                data-cta="hero-secondary"
              >
                {fieldText(hero, "secondaryCtaLabel", "Contact ENICE")}
              </Cta>
            </div>

            <p
              className="animate-hero-up mt-6 text-[11.5px] text-bone-faint"
              style={{ animationDelay: "220ms" }}
            >
              ENICE Group is the technology brand of ENICE Technology Limited.
            </p>
          </div>

          <a
            href="#products"
            aria-label="See our products"
            className="animate-hero-up mx-auto mt-14 grid h-11 w-11 place-items-center rounded-full border border-white/12 text-bone-soft transition-colors hover:border-electric/40 hover:text-electric"
            style={{ animationDelay: "280ms" }}
          >
            <ArrowDown aria-hidden className="h-4 w-4" strokeWidth={1.8} />
          </a>
        </Container>
      </section>

      {/* ═══ PRODUCTS & TECHNOLOGY ══════════════════════════════════════ */}
      <section
        id="products"
        className="bg-background py-24 sm:py-32 lg:py-36"
        aria-labelledby="products-heading"
      >
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>{fieldText(portfolio, "eyebrow", "Products & technology")}</Eyebrow>
              <h2 id="products-heading" className="type-h2 mt-5 text-foreground">
                <StyledText
                  text={fieldText(
                    portfolio,
                    "heading",
                    "A growing portfolio, held to one standard of engineering",
                  )}
                  accentClassName="text-electric"
                />
              </h2>
              <p className="type-lead mt-5">
                <StyledText
                  text={fieldText(
                    portfolio,
                    "subheading",
                    "PulsePay and PrideTrade are the first. Each is designed, built and operated by ENICE on its own infrastructure, and the portfolio is built to grow.",
                  )}
                  accentClassName="text-electric"
                />
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-2">
              {products.map((p) => (
                <article
                  key={p.to}
                  className="flex h-full flex-col bg-surface-1 p-8 sm:p-10 lg:p-12"
                >
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${p.accent}`}
                  >
                    {p.kicker}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    {p.mark && (
                      <img
                        src={p.mark}
                        alt=""
                        aria-hidden
                        width={34}
                        height={40}
                        className="h-9 w-auto"
                      />
                    )}
                    <h3 className="text-[1.75rem] font-semibold tracking-[-0.025em] text-foreground">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-bone-soft">
                    {p.summary}
                  </p>

                  <ul className="mt-8 space-y-3.5 border-t border-border pt-7">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-[14.5px] leading-relaxed text-bone-strong"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-electric"
                        />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={p.to as "/"}
                    className={`group mt-auto inline-flex items-center gap-2 pt-9 text-[14.5px] font-semibold text-foreground transition-colors hover:opacity-80 ${p.accent}`}
                  >
                    Explore {p.title}
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.9}
                    />
                  </Link>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-[14px] leading-relaxed text-bone-soft">
                Each product runs its own identity, compliance and settlement stack, built to
                applicable standards in the Federal Republic of Nigeria with strict privacy and
                security controls.
              </p>
              <Link to="/portfolio" className="link-underline shrink-0 text-[14px] font-medium">
                All products
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ═══ WHAT WE FOCUS ON ═══════════════════════════════════════════════ */}
      <section
        id="focus"
        className="border-t border-border bg-background py-24 sm:py-32 lg:py-36"
        aria-labelledby="focus-heading"
      >
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>What we focus on</Eyebrow>
              <h2 id="focus-heading" className="type-h2 mt-5 text-foreground">
                Built for reliability
              </h2>
              <p className="type-lead mt-5">
                Three things we spend our time on. Everything else follows from them.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FOCUS.map((f) => (
                <div key={f.title} className="panel flex h-full flex-col p-7 sm:p-8">
                  <f.icon aria-hidden className="h-5 w-5 text-electric" strokeWidth={1.6} />
                  <h3 className="mt-6 text-[16px] font-semibold text-foreground">{f.title}</h3>
                  <p className="type-body mt-2.5 text-[14px]">{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ═══ ABOUT ══════════════════════════════════════════════════════════ */}
      <section
        id="about"
        className="border-t border-border bg-surface-1 py-24 sm:py-32 lg:py-36"
        aria-labelledby="about-heading"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
            <Reveal>
              <div>
                <Eyebrow>About us</Eyebrow>
                <h2 id="about-heading" className="type-h2 mt-5 text-foreground">
                  About ENICE Group
                </h2>
                <p className="type-lead mt-6 max-w-xl">
                  ENICE Technology Limited is a Nigerian technology company. We build practical
                  financial and digital software—including PulsePay and PrideTrade—designed to make
                  everyday payments, virtual cards, and digital asset management simple and
                  reliable.
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {ABOUT_FACTS.map((fact) => (
                  <div key={fact.title} className="panel p-6">
                    <dt className="text-[11px] font-semibold tracking-[0.16em] text-bone-faint uppercase">
                      {fact.title}
                    </dt>
                    <dd className="mt-2 text-[15px] font-semibold text-foreground">
                      {fact.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>

      <FAQSection />

      {/* ═══ CLOSING CTA ════════════════════════════════════════════════════ */}
      <section className="band-cta relative overflow-hidden" aria-labelledby="cta-heading">
        <Container className="flex flex-col items-start justify-between gap-8 py-20 sm:py-24 lg:flex-row lg:items-center lg:py-28">
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
