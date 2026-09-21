import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
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
import { SiteShell } from "@/components/site/SiteShell";
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
import { useSectionFields, fieldItems, fieldText } from "@/lib/cms/use-section";
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

const WAITLIST_MAILTO =
  "mailto:corporate@enicehq.com?subject=Join%20the%20Payment%20Collection%20waitlist";

// ─── Fallback content ─────────────────────────────────────────────────────────
//
// The blocks below are the *fallbacks* for the page's CMS sections, not its only source of
// content. Each band reads `portfolio.payment-collection.*` and overlays whatever an administrator
// has published, so the copy here is what paints before the CMS answers and what survives an
// outage — `useSectionFields` treats a degraded bootstrap as "not loaded" on purpose. See
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
  CheckCircle2,
  Code2,
  Globe2,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Webhook,
  Zap,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

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
  { label: "Status", value: "Planned" },
  { label: "Launch", value: "Q1 2027" },
  { label: "Category", value: "Payments" },
];

// ─── Payment notification mockup ──────────────────────────────────────────────

/**
 * An illustration of the collection flow: a customer pays, the business is notified.
 *
 * Retoned from a navy gradient card with white-on-navy type to the surface ramp and hairlines, so
 * it sits in the same environment as the rest of the page instead of importing the old brand into
 * it. The success mark is warm rather than green: green means "available" on this site, and this
 * platform is not. Entirely decorative, so the whole card is hidden from assistive technology —
 * every fact it depicts is stated in the copy beside it.
 */
function PaymentNotificationCard() {
  return (
    <div
      aria-hidden
      className="panel-raised relative flex flex-col justify-between overflow-hidden p-5"
      style={{ width: 240, aspectRatio: "9/16" }}
    >
      <div className="type-meta flex items-center justify-between text-[10px]">
        <span className="tnum">9:41</span>
        <span className="font-mono tracking-[0.18em]">ENICE</span>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface-3 p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/[0.08]">
            <CheckCircle2 className="h-4 w-4 text-gold" strokeWidth={2} />
          </span>
          <div>
            <div className="text-[11px] font-semibold text-foreground">Payment Received</div>
            <div className="text-[9px] text-bone-faint">from Adaeze&apos;s Store</div>
          </div>
        </div>
        <div className="tnum mt-3 font-mono text-2xl font-semibold tracking-tight text-foreground">
          ₦45,000.00
        </div>
        <div className="mt-1 text-[9px] text-bone-faint">Just now</div>
      </div>

      <div className="mt-4 space-y-2">
        {["Customer pays", "Payment processed", "Business receives funds"].map((step, i) => (
          <div key={step} className="flex items-center gap-2 text-[10px] text-bone-soft">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border bg-surface-1 text-[8px] font-semibold text-bone-faint">
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
  // Page header, editable through the `portfolio.payment-collection` section.
  const header = useSectionFields("portfolio.payment-collection");
  const factsSection = useSectionFields("portfolio.payment-collection.facts");
  const audienceSection = useSectionFields("portfolio.payment-collection.audience");
  const capabilitiesSection = useSectionFields("portfolio.payment-collection.capabilities");

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

  const capabilities = fieldItems(capabilitiesSection, "items", CAPABILITIES, (row) => {
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
      <Section spacing="loose" glow="spread" grid aria-labelledby="payments-heading">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* ── Copy ── */}
          <div data-allow-select>
            <Tag tone="warm">Coming Q1 2027</Tag>

            <SectionIntro
              id="payments-heading"
              level={1}
              className="mt-8"
              heading={fieldText(header, "heading", "PulsePay Payment Collection")}
              lead={fieldText(
                header,
                "subheading",
                "Simple, reliable payment infrastructure for modern businesses. Accept and manage customer payments through a single, developer friendly integration.",
              )}
            >
              <p className="type-body mt-4 max-w-xl">
                Built for businesses that need dependable payment infrastructure without managing
                multiple payment channels: collect payments, track transactions, and connect payment
                flows directly into your product.
              </p>
            </SectionIntro>

            <dl className="mt-8 grid grid-cols-3 gap-3">
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

            <div className="mt-8 flex flex-wrap gap-3">
              <Cta to={WAITLIST_MAILTO} size="lg" icon="external">
                Join the Waitlist
              </Cta>
              <Cta to="/portfolio" variant="secondary" size="lg">
                Back to Products
              </Cta>
            </div>
          </div>

          {/* ── Decorative flow illustration ── */}
          <div className="flex items-center justify-center">
            <PaymentNotificationCard />
          </div>
        </div>
      </Section>

      {/* ═══ WHO IT'S FOR ═════════════════════════════════════════════════════ */}
      <Section divider aria-labelledby="payments-audience-heading">
        <Reveal>
          <SectionIntro
            id="payments-audience-heading"
            align="center"
            eyebrow={fieldText(audienceSection, "eyebrow", "Built For")}
            heading={fieldText(
              audienceSection,
              "heading",
              "From online businesses to growing enterprises.",
            )}
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

      {/* ═══ KEY CAPABILITIES ═════════════════════════════════════════════════ */}
      <Section tone="recessed" divider aria-labelledby="payments-capabilities-heading">
        <Reveal>
          <SectionIntro
            id="payments-capabilities-heading"
            align="center"
            eyebrow={fieldText(capabilitiesSection, "eyebrow", "Key Capabilities")}
            heading={fieldText(
              capabilitiesSection,
              "heading",
              "Payments, made easier to collect and scale.",
            )}
            lead={fieldText(
              capabilitiesSection,
              "subheading",
              "Payment Collection is being built as part of ENICE Group's broader financial infrastructure, giving businesses the tools to run modern payment experiences.",
            )}
          />
        </Reveal>

        <HairlineGrid columns={3} className="mt-14">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 60} className="flex">
              <div className="panel-interactive flex h-full flex-col p-8">
                <div className="flex items-start justify-between">
                  <IconTile icon={c.icon} size="sm" />
                  <CardIndex value={i + 1} />
                </div>
                <h3 className="mt-6 text-[15px] font-semibold text-foreground">{c.title}</h3>
                <p className="type-body mt-2 text-[13px]">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </HairlineGrid>
      </Section>

      {/* ═══ WAITLIST ═════════════════════════════════════════════════════════ */}
      <Section container="narrow" divider glow="center" aria-labelledby="payments-waitlist-heading">
        <Reveal>
          <SectionIntro
            id="payments-waitlist-heading"
            align="center"
            eyebrow="Be First In Line"
            heading="Get notified when we launch."
            lead="Join the waitlist to receive launch updates and early access when Payment Collection goes live in Q1 2027."
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
