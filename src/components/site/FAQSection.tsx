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
    q: "How does ENICE Group incubate ventures?",
    a: "Every venture begins inside the studio with shared access to the ENICE Core — the AI, ledger, and compliance backbone. From concept and capitalization through engineering and go-to-market, a venture graduates from incubation only after meeting institutional thresholds for security, reliability, and unit economics.",
  },
  {
    q: "Which industries does ENICE Group serve?",
    a: "Our primary verticals are financial services, telecommunications, and enterprise operations. PulsePay targets payment infrastructure; PulseAssist serves regulated support operations; EPulse and PulseX extend the ecosystem into digital banking and global digital asset trading.",
  },
  {
    q: "What does the ENICE Core provide?",
    a: "A unified AI and automation pipeline, a high-velocity ledger and payment core, an automated KYC and compliance layer, and a global cloud grid. Each is shared infrastructure — ventures inherit enterprise-grade scale, security posture, and observability from day one.",
  },
  {
    q: "How does ENICE Group approach security and compliance?",
    a: "We operate a zero-trust architecture with per-tenant database isolation, row-level security enforcement, audit logging, and continuous controls monitoring. Every system is designed for regulatory readiness from inception, aligned with SOC 2 control objectives.",
  },
  {
    q: "How can partners or institutions engage with ENICE Group?",
    a: "Institutional partners, regulators, and enterprise customers can reach our partnerships desk via the Contact page. Qualified inquiries are reviewed by a partner and responded to within two business days.",
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
              A precise look at how ENICE Group operates, builds, and partners.
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
