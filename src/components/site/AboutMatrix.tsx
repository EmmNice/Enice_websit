import { Link } from "@tanstack/react-router";
import { Compass, Layers, Shuffle, Telescope } from "lucide-react";
import { Reveal } from "./Reveal";
import { StyledText } from "./StyledText";
import { CardIndex, Eyebrow, Section, SectionIntro, TextLink } from "./primitives";
import { PRODUCTS } from "./navigation";
import { useSectionFields, fieldText, fieldItems } from "@/lib/cms/use-section";

/**
 * The company band: what ENICE builds, the problem space, how it builds, and where it is going.
 *
 * ## What this replaced, and why
 *
 * This band used to be an animated terminal typing out a fake `curl https://api.enice.group/v1/core`
 * response — including `"status": "operational"` and an `"infrastructure"` object — beside two
 * cards repeating PulsePay and PulseAssist.
 *
 * Both halves were problems. The terminal published a hardcoded health claim on every page load
 * from an endpoint that is not the one /status checks, which is the same class of unbacked
 * assertion already stripped out of the footer and the hero. And the cards were the third
 * appearance of the same two products on one page, which flattened the hierarchy the page needs:
 * ENICE is the company, the products sit under it.
 *
 * So the space is given to what a company section is actually for and the homepage otherwise
 * lacked — the problem space and the operating philosophy — with the product ecosystem summarised
 * as a list that links out rather than re-pitched as cards.
 */

const PILLARS = [
  {
    icon: Compass,
    title: "We start from the friction",
    body: "Every product traces back to something that failed in ordinary use: a payment that should have been simple, a support queue nobody answered. We build from the specific problem outward, not from a category we want to be in.",
  },
  {
    icon: Layers,
    title: "One core, many products",
    body: "Ledgers, identity, AI orchestration and compliance are solved once and shared. A new product inherits that foundation on its first day instead of rebuilding it, which is what makes a small team's output look like a much larger one.",
  },
  {
    icon: Shuffle,
    title: "We operate what we ship",
    body: "We own the products end to end: engineering, launch, and the day-to-day running of them. Nothing is handed to someone else to keep alive, which keeps the cost of a bad decision with the people who made it.",
  },
  {
    icon: Telescope,
    title: "Built to still be here",
    body: "We design for the version of these systems that exists in ten years: versioned APIs, documented internals, and infrastructure choices made for reliability rather than novelty. Regulated markets do not reward clever.",
  },
];

export function AboutMatrix() {
  const company = useSectionFields("home.company");

  const pillars = fieldItems(company, "items", PILLARS, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    const body = typeof row.description === "string" ? row.description.trim() : "";
    const match = PILLARS.find((p) => p.title === title);
    return { icon: match?.icon ?? Compass, title, body };
  });

  return (
    <Section id="about" divider aria-labelledby="about-heading">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <SectionIntro
              id="about-heading"
              eyebrow={fieldText(company, "eyebrow", "The company")}
              heading={fieldText(company, "heading", "ENICE Group is a product company.")}
              lead={fieldText(
                company,
                "subheading",
                "We are the parent company behind a growing set of software platforms. We find real problems in financial services, commerce, and business communication, then build and run the products that solve them.",
              )}
            />

            {/* The ecosystem as a reference list, not a third product pitch. */}
            <div className="mt-10 border-t border-border pt-7">
              <Eyebrow muted as="h3" className="text-[10px]">
                The ecosystem
              </Eyebrow>
              <ul className="mt-4 space-y-2.5">
                {PRODUCTS.map((p) => (
                  <li key={p.to}>
                    <Link
                      to={p.to as "/"}
                      className="group flex items-baseline justify-between gap-4 text-[13px] transition-colors"
                    >
                      <span className="font-medium text-bone-strong group-hover:text-foreground">
                        {p.label}
                      </span>
                      <span
                        aria-hidden
                        className="rule-fade mb-1 h-px flex-1 opacity-60 transition-opacity group-hover:opacity-100"
                      />
                      <span
                        className={
                          p.stage === "available"
                            ? "text-[10px] font-semibold uppercase tracking-[0.14em] text-positive"
                            : "text-[10px] font-semibold uppercase tracking-[0.14em] text-bone-faint"
                        }
                      >
                        {p.stage === "available" ? "Available" : "Building"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <TextLink to="/about" className="mt-7">
                More about ENICE Group
              </TextLink>
            </div>
          </div>
        </Reveal>

        <div>
          <ol className="space-y-px">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <li className="group border-t border-border py-8 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="type-h3 text-foreground">
                      <StyledText text={p.title} accentClassName="text-gold" />
                    </h3>
                    <CardIndex value={i + 1} />
                  </div>
                  <p className="type-body mt-3 max-w-2xl">
                    <StyledText text={p.body} accentClassName="text-gold" />
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
