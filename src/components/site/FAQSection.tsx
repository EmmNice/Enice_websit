import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./Reveal";
import { StyledText } from "./StyledText";
import { Section, SectionIntro } from "./primitives";
import { FAQS } from "@/lib/faqs";
import { faqJsonLd } from "@/lib/seo";
import { useSectionFields, fieldText, fieldItems } from "@/lib/cms/use-section";

/**
 * The homepage FAQ, editable through the `home.faq` section.
 *
 * ## Why the FAQ markup is emitted here rather than in the page's `head()`
 *
 * Google requires `FAQPage` markup to describe questions and answers that are actually visible on
 * the page; declaring markup for content a visitor cannot see is a guidelines violation and risks
 * the rich result being dropped. That constraint is easy to satisfy while the questions are a
 * constant, and easy to break once they are editable: markup baked at deploy time would keep
 * describing the previous answers the moment someone edited them.
 *
 * So the schema is generated from `entries` below — the exact array this component renders. There
 * is no second copy to drift, whether the questions come from the CMS or from the built-in
 * fallback. That is also why the page's `head()` no longer declares FAQ markup: two sources could
 * disagree, and one of them would be wrong.
 */
export function FAQSection() {
  const faq = useSectionFields("home.faq");

  const entries = fieldItems(faq, "items", FAQS as { q: string; a: string }[], (row) => {
    const q = typeof row.question === "string" ? row.question.trim() : "";
    const a = typeof row.answer === "string" ? row.answer.trim() : "";
    return q && a ? { q, a } : null;
  });

  return (
    // `id` is the anchor target for the assistant fallback's "Read the FAQ" link.
    <Section id="faq" divider container="narrow" aria-labelledby="faq-heading">
      {/* Generated from `entries`, so it always describes what is rendered below. */}
      <script
        type="application/ld+json"
        // Only our own data is serialised. `<` is escaped so a stray "</script>" in an answer
        // cannot terminate the element early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(entries)).replace(/</g, "\\u003c"),
        }}
      />

      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <SectionIntro
              id="faq-heading"
              eyebrow={fieldText(faq, "eyebrow", "Frequently asked")}
              heading={fieldText(faq, "heading", "Questions, answered.")}
              lead={fieldText(
                faq,
                "subheading",
                "A plain look at the company, the products, and the technology behind them.",
              )}
            />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <Accordion type="single" collapsible className="w-full border-t border-border">
            {entries.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="gap-6 py-5 text-left text-[15px] font-medium tracking-tight text-foreground hover:text-gold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent
                  data-allow-select
                  className="pb-6 pr-8 text-[14px] leading-relaxed text-bone-soft"
                >
                  <StyledText text={f.a} accentClassName="text-gold" />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  );
}
