/**
 * Built-in homepage FAQ content.
 *
 * The questions are editable through the `home.faq` section; this array is the fallback shown
 * before that section loads, and if it is empty or unreachable. `FAQSection` renders whichever
 * source applies and generates the `FAQPage` markup from the same array it renders, so the markup
 * always describes what a visitor can actually see — declaring FAQ markup for content that is not
 * on the page violates search guidelines.
 *
 * Keep answers factual and precise. Avoid promotional language.
 */
export const FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What does ENICE Group build?",
    a: "ENICE Group builds and operates technology products for financial services, commerce, and business communication. PulsePay is our digital financial platform. PulseAssist handles AI-powered business communication and customer support.",
  },
  {
    q: "Which problems are ENICE products built to solve?",
    a: "Our products focus on financial services, telecommunications, and business operations. PulsePay covers digital finance, PulseAssist covers business communication and customer support, and ePulse and PulseX extend the ecosystem into digital banking and digital assets.",
  },
  {
    q: "What does the ENICE Core provide?",
    a: "A shared AI and automation pipeline, a fast ledger and payment core, an automated KYC and compliance layer, and a global cloud grid. Every product inherits the same scale, security, and observability from day one.",
  },
  {
    q: "How does ENICE Group approach security and compliance?",
    a: "Every platform uses per-tenant database isolation with row-level security enforced at the database layer, encryption in transit and at rest, and audit logging of privileged actions. We hold no security certification today and do not claim one — if you need a compliance review for a procurement process, contact us and we will tell you exactly where we stand.",
  },
  {
    q: "How can businesses access ENICE products?",
    a: "Businesses and institutions can reach the ENICE team through the Contact page to ask about product access, licensing, or integration requirements.",
  },
];
