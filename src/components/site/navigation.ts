/**
 * The public site's information architecture, in one place.
 *
 * The header and the mobile drawer render from the same data, so the two cannot present different
 * navigation — they previously shared a flat four-item list (`Home · Products · About · Contact`)
 * that named "Contact" twice on desktop, once as a nav item and again as the primary CTA, and left
 * ten real pages reachable only from the footer.
 *
 * Descriptions are the one-line summaries already used on the product and resource pages
 * themselves, so nothing here is a new claim about a product.
 */

import type { NavItem as CmsNavItem } from "@/lib/cms/types";

export interface NavItem {
  label: string;
  to: string;
  /** Shown in the desktop menu and the mobile drawer. */
  description?: string;
  /** Product lifecycle, not availability. `/status` is the only place health is asserted. */
  stage?: "available" | "building";
}

export interface NavGroup {
  label: string;
  /** Where the group's own landing page lives, if it has one. */
  to?: string;
  items: NavItem[];
  /** Optional link at the foot of the menu panel. */
  footer?: { label: string; to: string };
}

/** A nav entry that goes straight to one page, with no menu. */
export interface NavLeaf {
  label: string;
  to: string;
}

export type NavEntry = NavGroup | NavLeaf;

export function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

/** The inverse guard, so `filter(isLeaf)` narrows and `to` is known to be present. */
export function isLeaf(entry: NavEntry): entry is NavLeaf {
  return !("items" in entry);
}

export const PRODUCTS: NavItem[] = [
  {
    // Still being built, not generally available. The roadmap agrees: the extended pilot is
    // complete and the developer API is in public beta, but nothing on it has launched.
    label: "PulsePay",
    to: "/portfolio/pulsepay",
    description: "Virtual card issuance, programmable wallets and embedded treasury.",
    stage: "building",
  },
  {
    // Channels per the product's own site (getpulseassist.com/channels): WhatsApp, web chat,
    // email, SMS and voice, answered from one shared inbox.
    label: "PulseAssist",
    to: "/portfolio/pulseassist",
    description: "AI customer support across WhatsApp, web, email, SMS and voice.",
    stage: "available",
  },
  {
    // A PulseAssist product, the same way DevaPay is a PulsePay product — its own page
    // presents it as part of the PulseAssist platform. Shipping today: this site's own
    // transactional mail goes through it.
    label: "PulseAssist Email",
    to: "/portfolio/pulseassist-email",
    description: "Transactional and marketing email on your own verified domain.",
    stage: "available",
  },
  {
    label: "DevaPay",
    to: "/portfolio/devapay",
    description: "One developer-friendly API for accepting and reconciling payments.",
    stage: "building",
  },
  {
    label: "ePulse",
    to: "/portfolio/epulse",
    description: "Multi-currency accounts and international transfers for global work.",
    stage: "building",
  },
  {
    label: "PulseX",
    to: "/portfolio/pulsex",
    description: "Digital asset trading and custody, integrated with the ecosystem.",
    stage: "building",
  },
];

export const RESOURCES: NavItem[] = [
  {
    label: "Documentation",
    to: "/docs",
    description: "ENICE Core API reference: authentication, endpoints and webhooks.",
  },
  {
    label: "Roadmap",
    to: "/roadmap",
    description: "What is shipped, in progress, and planned next.",
  },
  {
    label: "Blog",
    to: "/blog/",
    description: "Engineering and product writing from the team.",
  },
  {
    label: "News & Changelog",
    to: "/news/",
    description: "Platform updates and company news.",
  },
  {
    label: "System Status",
    to: "/status",
    description: "Live availability of the public API and website.",
  },
];

export const NAV_ENTRIES: NavEntry[] = [
  {
    label: "Products",
    to: "/portfolio",
    items: PRODUCTS,
    footer: { label: "All products", to: "/portfolio" },
  },
  { label: "Company", to: "/about" },
  {
    label: "Resources",
    items: RESOURCES,
  },
];

/** The header's single primary action. */
export const NAV_CTA = { label: "Contact", to: "/contact" } as const;

// ─── CMS ──────────────────────────────────────────────────────────────────────

/**
 * One-line summaries, keyed by path.
 *
 * The CMS `NavItem` carries a label and a URL but no description, and the menus show one. Rather
 * than add a field to the shared settings model for it, the copy above is reused: a CMS item is
 * matched to its path and inherits the description already written for it. An item pointing
 * somewhere new simply renders without one, which the menu handles.
 */
const DESCRIPTIONS = new Map(
  [...PRODUCTS, ...RESOURCES].map((item) => [
    item.to,
    { desc: item.description, stage: item.stage },
  ]),
);

/**
 * Converts the Website Manager's navigation into the header's own shape.
 *
 * The header and the mobile drawer were reading the constants above directly, which meant
 * Website → Navigation had no effect on the live site even though it had been editable all along.
 * An item with children becomes a menu group; everything else is a plain link. Returns `null` when
 * the CMS list is empty or unusable, so the caller keeps the built-in IA rather than rendering a
 * site with no navigation.
 */
export function navFromCms(items: CmsNavItem[] | undefined): NavEntry[] | null {
  const usable = (items ?? []).filter(
    (item) => item && item.visible !== false && item.label?.trim() && item.url?.trim(),
  );
  if (usable.length === 0) return null;

  return usable.map((item): NavEntry => {
    const children = (item.children ?? []).filter(
      (child) => child && child.visible !== false && child.label?.trim() && child.url?.trim(),
    );

    if (children.length === 0) {
      return { label: item.label.trim(), to: item.url.trim() };
    }

    return {
      label: item.label.trim(),
      // A group whose own URL is a real page keeps it as the "see all" link; one that exists only
      // to hold children (`#`, or the same URL as a child) does not get a redundant footer link.
      to: item.url.trim(),
      items: children.map((child) => {
        const known = DESCRIPTIONS.get(child.url.trim());
        return {
          label: child.label.trim(),
          to: child.url.trim(),
          description: known?.desc,
          stage: known?.stage,
        };
      }),
      footer: /^\/[^#]/.test(item.url.trim())
        ? { label: `All ${item.label.trim().toLowerCase()}`, to: item.url.trim() }
        : undefined,
    };
  });
}
