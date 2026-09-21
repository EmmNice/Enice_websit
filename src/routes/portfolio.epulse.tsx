import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
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
import { SiteShell } from "@/components/site/SiteShell";
import { StyledText } from "@/components/site/StyledText";
import { Reveal } from "@/components/site/Reveal";
import {
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

export const Route = createFileRoute("/portfolio/epulse")({
  head: () =>
    pageHead("/portfolio/epulse", [
      breadcrumbJsonLd([
        { name: "Products", path: "/portfolio" },
        { name: "ePulse", path: "/portfolio/epulse" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "ePulse",
        description:
          "ENICE Group's upcoming global financial platform for people who earn, send, and spend money across borders. Multi-currency accounts, dedicated US/UK/EU receiving accounts, international transfers, gift cards, and lifestyle services.",
        url: `${SITE_URL}/portfolio/epulse`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web, iOS, Android",
        author: ORGANIZATION_REF,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/PreOrder",
          description: "Waitlist available. Platform in active development.",
        },
      },
    ]),
  component: EPulsePage,
});

const WAITLIST_MAILTO = "mailto:corporate@enicehq.com?subject=Join%20the%20ePulse%20waitlist";

// ─── Fallback content ─────────────────────────────────────────────────────────
//
// The blocks below are the *fallbacks* for the page's CMS sections, not its only source of
// content. Each band reads `portfolio.epulse.*` and overlays whatever an administrator has
// published, so the copy here is what paints before the CMS answers and what survives an outage —
// `useSectionFields` treats a degraded bootstrap as "not loaded" on purpose. See
// `src/lib/cms/use-section.ts`.

/**
 * Icons an editor may name on a CMS-managed card.
 *
 * A curated map rather than importing all of lucide, which would add a large amount of JavaScript
 * to the public bundle for the sake of a handful of names. Anything unrecognised falls back to a
 * neutral icon, so a typo degrades instead of leaving an empty tile. Same approach as
 * `CARD_ICONS` in src/routes/index.tsx.
 */
const CARD_ICONS: Record<string, LucideIcon> = {
  Boxes,
  Briefcase,
  Building2,
  CreditCard,
  Gift,
  Globe2,
  Plane,
  Send,
  Users,
  Wallet,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

// ─── Vision feature list ───────────────────────────────────────────────────────

const VISION = [
  {
    icon: Wallet,
    title: "Multi-currency accounts",
    desc: "Hold and manage balances in the currencies that matter to you: NGN, USD, GBP, EUR and more, from a single account.",
  },
  {
    icon: Building2,
    title: "Dedicated receiving accounts",
    desc: "Local account details for supported countries, including the US, UK, and Europe. Get paid like a local from anywhere.",
  },
  {
    icon: Send,
    title: "Fast international transfers",
    desc: "Send money across borders with predictable timing, transparent fees, and clear pricing. No surprises.",
  },
  {
    icon: Globe2,
    title: "Global payment solutions",
    desc: "Pay and get paid anywhere your work takes you, from client invoices to vendor payments across continents.",
  },
  {
    icon: Gift,
    title: "Gift card marketplace",
    desc: "Buy and redeem gift cards from trusted global and local brands, all within the ePulse platform.",
  },
  {
    icon: Plane,
    title: "Lifestyle services",
    desc: "Book hotels, plan travel, and access premium experiences. Good finance should make life easier too.",
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

/**
 * Launch framing, as facts rather than a status light.
 *
 * ePulse has no launch date, so the pair below says exactly that. The previous treatment wrapped
 * the same words in a pulsing dot borrowed from live-status indicators, which read as telemetry on
 * a product that does not exist yet. The stage label is warm because "in development" is a
 * lifecycle state; `positive` is reserved for things that are genuinely available.
 *
 * The gold treatment is no longer stored per row. A `statistics` section carries a value and a
 * label and nothing else, which is correct: which figure is accented is a styling decision, not
 * content an editor should have to make. The first row is the status row, and that is the one the
 * accent belongs to — so the emphasis is derived from position at render time.
 */
const LAUNCH_FACTS = [
  { label: "Status", value: "In Development" },
  { label: "Expected Launch", value: "To Be Announced" },
];

/**
 * The currencies named in the page copy, as a decorative supporting row.
 *
 * Flag emoji were dropped: regional-indicator pairs have no glyph in the system font on Windows,
 * where Chrome and Edge render them as two empty boxes, and the ISO code carries the meaning.
 */
const CURRENCIES = ["USD", "GBP", "EUR", "NGN", "CAD", "AUD"];

// ─── Component ────────────────────────────────────────────────────────────────

function EPulsePage() {
  // Page header, editable through the `portfolio.epulse` section.
  const header = useSectionFields("portfolio.epulse");
  const factsSection = useSectionFields("portfolio.epulse.facts");
  const audienceSection = useSectionFields("portfolio.epulse.audience");
  const visionSection = useSectionFields("portfolio.epulse.vision");

  // Launch facts. Rows without a value are skipped rather than rendered blank; the first row takes
  // the accent, see `LAUNCH_FACTS`.
  const launchFacts = fieldItems(factsSection, "items", LAUNCH_FACTS, (row) => {
    const value = typeof row.value === "string" ? row.value.trim() : "";
    const label = typeof row.label === "string" ? row.label.trim() : "";
    return value ? { value, label } : null;
  });

  // Who the platform is for. A row's `title` is the tile's label.
  const forWho = fieldItems(audienceSection, "items", FOR_WHO, (row) => {
    const label = typeof row.title === "string" ? row.title.trim() : "";
    if (!label) return null;
    return {
      icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""),
      label,
      desc: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  const vision = fieldItems(visionSection, "items", VISION, (row) => {
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
      <Section
        spacing="loose"
        container="narrow"
        glow="spread"
        grid
        aria-labelledby="epulse-heading"
      >
        <div className="flex flex-col items-center text-center" data-allow-select>
          <Tag tone="warm">Coming Soon</Tag>

          {/*
            Hand-built rather than `SectionIntro` for one reason: the CMS fallback heading is
            `e[[Pulse]]`, and `SectionIntro` renders a `[[highlight]]` in gold. At display size that
            would put almost the whole product name in the accent colour, which is the one thing the
            warm palette is not for. The highlight run therefore resolves to bone here — the same
            decision the homepage hero documents — so the heading stays a heading and the accent
            stays an accent. Nothing about the editable string changes.
          */}
          <h1 id="epulse-heading" className="type-display mt-8 max-w-3xl text-foreground">
            <StyledText
              text={fieldText(header, "heading", "e[[Pulse]]")}
              accentClassName="text-foreground"
            />
          </h1>

          <p className="type-lead mt-6 max-w-2xl">
            <StyledText
              text={fieldText(
                header,
                "subheading",
                "ePulse is ENICE Group's upcoming global financial platform, built for people who **earn, send, and spend money across borders**. Designed for freelancers, remote workers, creators, and global businesses, ePulse aims to make international finance *simple and accessible*.",
              )}
              accentClassName="text-gold"
              boldClassName="font-semibold text-foreground"
            />
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Cta to={WAITLIST_MAILTO} size="lg" icon="external">
              Join the Waitlist
            </Cta>
            <Cta to="/portfolio" variant="secondary" size="lg">
              Back to Products
            </Cta>
          </div>

          <dl className="mt-14 grid w-full max-w-2xl grid-cols-2 gap-3 text-left">
            {launchFacts.map((f, i) => (
              <Panel key={`${f.label}-${i}`} tone="quiet" className="p-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                  {f.label}
                </dt>
                <dd
                  className={`mt-1 text-sm font-semibold ${i === 0 ? "text-gold" : "text-foreground"}`}
                >
                  {f.value}
                </dd>
              </Panel>
            ))}
          </dl>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {CURRENCIES.map((code) => (
              <li key={code}>
                <Tag>{code}</Tag>
              </li>
            ))}
            <li>
              <Tag className="text-bone-faint">+ more</Tag>
            </li>
          </ul>
        </div>
      </Section>

      {/* ═══ WHO IT'S FOR ═════════════════════════════════════════════════════ */}
      <Section divider aria-labelledby="epulse-audience-heading">
        <Reveal>
          <SectionIntro
            id="epulse-audience-heading"
            align="center"
            eyebrow={fieldText(audienceSection, "eyebrow", "Built For")}
            heading={fieldText(audienceSection, "heading", "People who live and work globally.")}
          />
        </Reveal>

        <HairlineGrid columns={4} className="mt-14">
          {forWho.map((f, i) => (
            <Reveal key={f.label} delay={i * 60} className="flex">
              <div className="panel-interactive flex h-full flex-col p-8 text-center">
                <IconTile icon={f.icon} className="mx-auto" />
                <h3 className="mt-5 text-[15px] font-semibold text-foreground">{f.label}</h3>
                <p className="type-body mt-2 text-[13px]">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </HairlineGrid>
      </Section>

      {/* ═══ THE VISION ═══════════════════════════════════════════════════════ */}
      <Section tone="recessed" divider aria-labelledby="epulse-vision-heading">
        <Reveal>
          <SectionIntro
            id="epulse-vision-heading"
            align="center"
            eyebrow={fieldText(visionSection, "eyebrow", "The Vision")}
            heading={fieldText(visionSection, "heading", "International finance, made simple.")}
            lead={fieldText(
              visionSection,
              "subheading",
              "The ePulse platform includes everything you need to live your financial life without borders, from day-to-day spending to long-distance transfers to lifestyle services.",
            )}
          />
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vision.map((v, i) => (
            <Reveal key={v.title} as="li" delay={i * 60} className="flex">
              <Panel interactive className="flex h-full w-full flex-col p-6">
                <IconTile icon={v.icon} size="sm" />
                <h3 className="type-h3 mt-5 text-[16px] text-foreground">{v.title}</h3>
                <p className="type-body mt-2">{v.desc}</p>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ═══ WAITLIST ═════════════════════════════════════════════════════════ */}
      <Section container="narrow" divider glow="center" aria-labelledby="epulse-waitlist-heading">
        <Reveal>
          <SectionIntro
            id="epulse-waitlist-heading"
            align="center"
            eyebrow="Be First In Line"
            heading="Get notified when we launch."
            lead="Join the ePulse waitlist to receive launch updates, early access opportunities, and priority onboarding as we build toward launch."
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
