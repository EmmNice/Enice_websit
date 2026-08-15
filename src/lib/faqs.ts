/**
 * Homepage FAQ content.
 *
 * Lives apart from the component so three consumers can share one copy: the accordion that
 * renders it, `faqJsonLd()` which turns it into FAQ markup, and the prerender script which
 * bakes that markup into the static HTML.
 *
 * Declaring FAQ markup for content that is not visible on the page violates search guidelines,
 * so the schema must always be generated from this array rather than a second copy of it.
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
    a: "We run a zero-trust architecture with per-tenant database isolation, row-level security, audit logging, and continuous monitoring. Every system is built for regulatory readiness from day one and aligned with SOC 2 control objectives.",
  },
  {
    q: "How can businesses access ENICE products?",
    a: "Businesses and institutions can reach the ENICE team through the Contact page to ask about product access, licensing, or integration requirements.",
  },
];
