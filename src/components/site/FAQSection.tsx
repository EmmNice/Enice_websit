import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

// ─── FAQ entries ──────────────────────────────────────────────────────────────
// Keep answers factual and precise. Avoid promotional language.

const FAQS = [
  {
    q: "What does ENICE Group build?",
    a: "ENICE Group builds and operates technology products for financial services, commerce, and business communication. PulsePay is our digital financial platform, and PulseAssist is our AI-powered business communication and customer support platform.",
  },
  {
    q: "Which problems are ENICE products built to solve?",
    a: "Our products focus on financial services, telecommunications, and enterprise operations. PulsePay is our digital financial platform, PulseAssist serves business communication and customer support, and ePulse and PulseX extend the ecosystem into digital banking and digital assets.",
  },
  {
    q: "What does the ENICE Core provide?",
    a: "A unified AI and automation pipeline, a high-velocity ledger and payment core, an automated KYC and compliance layer, and a global cloud grid. Each is shared infrastructure, so every venture inherits enterprise-grade scale, security, and observability from day one.",
  },
  {
    q: "How does ENICE Group approach security and compliance?",
    a: "We operate a zero-trust architecture with per-tenant database isolation, row-level security, audit logging, and continuous controls monitoring. Every system is designed for regulatory readiness from day one and aligned with SOC 2 control objectives.",
  },
  {
    q: "How can businesses access ENICE products?",
    a: "Businesses and institutions can reach the ENICE team through the Contact page to ask about product access, enterprise licensing, or integration requirements.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FAQSection() {
  return (
    <section className="border-t border-border bg-secondary py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">

        <Reveal>
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Frequently Asked
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
              Questions, answered.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              A clear look at the company, products, and technology behind ENICE Group.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-12 rounded-xl border border-border bg-background px-2 sm:px-4">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className={i === FAQS.length - 1 ? "border-b-0" : ""}
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
