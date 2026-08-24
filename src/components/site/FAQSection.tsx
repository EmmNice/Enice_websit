import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./Reveal";
import { StyledText } from "./StyledText";
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
    <section className="border-t border-border bg-secondary py-24 sm:py-32">
      {/* Generated from `entries`, so it always describes what is rendered below. */}
      <script
        type="application/ld+json"
        // Only our own data is serialised. `<` is escaped so a stray "</script>" in an answer
        // cannot terminate the element early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(entries)).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              {fieldText(faq, "eyebrow", "Frequently asked")}
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
              <StyledText text={fieldText(faq, "heading", "Questions, answered.")} />
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              <StyledText
                text={fieldText(
                  faq,
                  "subheading",
                  "A plain look at the company, the products, and the technology behind them.",
                )}
              />
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-12 rounded-xl border border-border bg-background px-2 sm:px-4">
            <Accordion type="single" collapsible className="w-full">
              {entries.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className={i === entries.length - 1 ? "border-b-0" : ""}
                >
                  <AccordionTrigger className="px-3 py-5 text-left text-[15px] font-semibold tracking-tight text-foreground hover:no-underline sm:px-4">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-6 text-[14px] leading-relaxed text-muted-foreground sm:px-4">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
