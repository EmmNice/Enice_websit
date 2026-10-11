import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { Eyebrow, Section, SectionIntro, TextLink } from "./primitives";
import { PRODUCTS } from "./navigation";
import { useSectionFields, fieldText } from "@/lib/cms/use-section";

/**
 * The homepage company band: a concise company statement followed by the product ecosystem.
 * Detailed operating-principle cards were intentionally removed to keep this section focused.
 */

export function AboutMatrix() {
  const company = useSectionFields("home.company");

  return (
    <Section id="about" spacing="tight" divider aria-labelledby="about-heading">
      <div className="max-w-3xl">
        <Reveal>
          <div>
            <SectionIntro
              id="about-heading"
              eyebrow={fieldText(company, "eyebrow", "THE COMPANY")}
              heading={fieldText(company, "heading", "ENICE Group builds digital products.")}
              lead={fieldText(
                company,
                "subheading",
                "We are the parent company behind a growing suite of software platforms. We identify real challenges across financial services, commerce, and communication, then design, launch, and operate the products that solve them.",
              )}
            />

            {/* The ecosystem as a reference list, not a third product pitch. */}
            <div className="mt-10 border-t border-border pt-7">
              <Eyebrow muted as="h3" className="text-[10px]">
                THE ECOSYSTEM
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
      </div>
    </Section>
  );
}
