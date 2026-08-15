/**
 * Single source of truth for per-page SEO metadata.
 *
 * Two consumers read this, which is the whole point:
 *
 *  1. Each route's `head()` calls `pageHead()`, so the browser gets the right tags.
 *  2. `scripts/prerender.mjs` writes the same tags into a static HTML file per route at build
 *     time, so crawlers that do not execute JavaScript — Facebook, LinkedIn, Slack, WhatsApp,
 *     X — see the correct title, description and preview image.
 *
 * Before this existed, every route repeated ~30 lines of near-identical Open Graph and
 * Twitter boilerplate, and link previews fell back to one generic card for the whole site.
 *
 * This module must stay free of React and browser APIs so the Node build script can import it.
 */
import { SITE_URL } from "./site";

export const SITE_NAME = "ENICE Group";
export const TWITTER_HANDLE = "@ENICEHQ";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;

export type PageSeo = {
  title: string;
  description: string;
  /** Defaults to "website". Articles set this to "article". */
  ogType?: string;
  /** Absolute URL. Defaults to the site-wide preview image. */
  image?: string;
  /** Set for pages that should not be indexed. Defaults to "index, follow". */
  robots?: string;
};

/**
 * Every indexable route. Keys are the canonical pathname, matching `public/sitemap.xml`.
 * Adding a page means adding it here and to the sitemap.
 */
export const PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    title: "ENICE Group | Technology Products for Africa",
    description:
      "ENICE Group builds, owns, and operates products for financial services, commerce, and business communication.",
  },
  "/about": {
    title: "About ENICE Group | A Technology Company Building African Infrastructure",
    description:
      "ENICE Group builds and operates software platforms for digital commerce, financial services, and enterprise AI. Here is our story, our mission, and how we work.",
  },
  "/contact": {
    title: "Contact ENICE Group",
    description:
      "Reach ENICE Group about product access, platform integration, enterprise licensing, partnerships, or general inquiries at corporate@enicehq.com.",
  },
  "/portfolio": {
    title: "Products | ENICE Group",
    description:
      "PulsePay, PulseAssist, ePulse, and PulseX: the products built and operated by ENICE Group.",
  },
  "/portfolio/pulsepay": {
    title: "PulsePay | Virtual Payment Platform by ENICE Group",
    description:
      "PulsePay by ENICE Group: virtual Naira and USD card issuance, built-in KYC, programmable wallets, peer-to-peer transfers, and fraud monitoring for modern commerce.",
  },
  "/portfolio/pulseassist": {
    title: "PulseAssist | Enterprise AI Operations Platform by ENICE Group",
    description:
      "PulseAssist by ENICE Group is a multi-tenant AI operations platform for banking, fintech, and telecom. It handles customer support, runs policy-bound agents, hands off to live agents in real time, and keeps compliance-ready audit trails.",
  },
  "/portfolio/epulse": {
    title: "ePulse | Global Financial Platform by ENICE Group",
    description:
      "ePulse is ENICE Group's upcoming global financial platform built for freelancers, remote workers, creators, and global businesses. Multi-currency accounts, international transfers, gift cards, and lifestyle services.",
  },
  "/portfolio/pulsex": {
    title: "PulseX | Digital Asset Platform by ENICE Group",
    description:
      "PulseX is ENICE Group's digital asset platform launching Q3 2027. Trade cryptocurrency, manage digital assets, and access DeFi, kept simple, secure, and integrated with the ENICE ecosystem.",
  },
  "/roadmap": {
    title: "Product Roadmap | ENICE Group",
    description:
      "The ENICE Group product roadmap: milestones completed, PulsePay and PulseAssist live, and what we are building next, including ePulse, PulseX, and the ENICE Core.",
  },
  "/blog/": {
    title: "Blog and Updates | ENICE Group",
    description:
      "Product updates, changelog entries, and announcements from ENICE Group across PulsePay, PulseAssist, and the rest of our platform.",
  },
  "/docs": {
    title: "API Documentation · ENICE Group",
    description:
      "ENICE Core API reference: authentication, endpoints, rate limits, and webhooks for verified integrators.",
  },
  "/status": {
    title: "System Status | ENICE Group",
    description:
      "Live availability of the ENICE Group public API and website, checked from your browser.",
  },
  "/privacy": {
    title: "Privacy Policy · ENICE Group",
    description:
      "How ENICE Group collects, processes, and protects personal and corporate data across its product ecosystem.",
  },
  "/terms": {
    title: "Terms of Service · ENICE Group",
    description:
      "Terms governing access to and use of ENICE Group platforms, APIs, and infrastructure services.",
  },
  "/compliance": {
    title: "Regulatory Compliance · ENICE Group",
    description: "Regulatory posture, registrations, and compliance program of ENICE Group.",
  },
};

export type MetaTag = Record<string, string>;

/** Absolute canonical URL for a pathname. The root is kept as a bare trailing slash. */
export function canonicalUrl(pathname: string): string {
  return pathname === "/" ? `${SITE_URL}/` : `${SITE_URL}${pathname}`;
}

/**
 * Builds the complete meta tag list for a page. Shared by the router's `head()` and the
 * prerender script so the two can never disagree.
 */
export function buildMeta(seo: PageSeo, url: string): MetaTag[] {
  const image = seo.image ?? DEFAULT_OG_IMAGE;
  return [
    { title: seo.title },
    { name: "description", content: seo.description },
    { name: "robots", content: seo.robots ?? "index, follow" },

    { property: "og:title", content: seo.title },
    { property: "og:description", content: seo.description },
    { property: "og:type", content: seo.ogType ?? "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: seo.title },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:title", content: seo.title },
    { name: "twitter:description", content: seo.description },
    { name: "twitter:image", content: image },
  ];
}

/**
 * Produces a route `head()` object for a known page.
 *
 * `jsonLd` entries are rendered as `application/ld+json` script tags. They are only consumed
 * by crawlers that execute JavaScript (Google does), so they deliberately live here rather
 * than in the prerendered HTML, where they would add weight for no benefit to social crawlers.
 */
export function pageHead(pathname: string, jsonLd: unknown[] = []) {
  const seo = PAGE_SEO[pathname];
  if (!seo) {
    throw new Error(
      `No SEO entry for "${pathname}". Add it to PAGE_SEO in src/lib/seo.ts and to public/sitemap.xml.`,
    );
  }
  const url = canonicalUrl(pathname);

  return {
    meta: buildMeta(seo, url),
    links: [{ rel: "canonical", href: url }],
    scripts: jsonLd.map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
  };
}

/** Convenience for pages with no structured data. */
export function simplePageHead(pathname: string) {
  return pageHead(pathname);
}
