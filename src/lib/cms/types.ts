/**
 * The ENICE Website Manager content model.
 *
 * This module is the single contract shared by three consumers:
 *
 *   1. The admin panel (`src/routes/admin/*`) — builds and edits these shapes.
 *   2. The serverless API (`api-src/cms.ts`, `api-src/site.ts`) — validates and stores them.
 *   3. The public site (`src/routes/blog/*`, section components) — renders them.
 *
 * It must stay free of React, browser APIs and Node APIs so that `scripts/prerender.mjs`
 * can import it at build time to bake article metadata into static HTML.
 */

// ─── Content kinds ───────────────────────────────────────────────────────────

/**
 * The four editorial content types. They deliberately share one storage table and one
 * editing pipeline: a blog post, an announcement, an update and a news entry differ in
 * where they surface and which extra fields they carry, not in how they are written,
 * previewed, scheduled or audited.
 *
 * Adding a kind means adding it here, to `CONTENT_KIND_META`, and giving it a list route.
 */
export const CONTENT_KINDS = ["blog", "announcement", "update", "news"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

export interface ContentKindMeta {
  /** Singular label, used in buttons and dialogs: "New blog post". */
  singular: string;
  /** Plural label, used in navigation and page titles. */
  plural: string;
  /** Admin list route for this kind. */
  route: string;
  /** Public URL prefix, or `null` when the kind has no standalone page of its own. */
  publicPrefix: string | null;
  /** One-line description shown on empty states. */
  description: string;
}

export const CONTENT_KIND_META: Record<ContentKind, ContentKindMeta> = {
  blog: {
    singular: "Blog post",
    plural: "Blog",
    route: "/admin/content/blog",
    publicPrefix: "/blog",
    description: "Long-form articles published to the ENICE Group blog.",
  },
  announcement: {
    singular: "Announcement",
    plural: "Announcements",
    route: "/admin/content/announcements",
    publicPrefix: "/announcements",
    description: "Company, product and partnership announcements, with an optional call to action.",
  },
  update: {
    singular: "Update",
    plural: "Updates",
    route: "/admin/content/updates",
    publicPrefix: null,
    description: "Short notices about new services, features and expansions.",
  },
  news: {
    singular: "News entry",
    plural: "News",
    route: "/admin/content/news",
    publicPrefix: "/news",
    description: "The ENICE news feed and changelog of milestones and platform changes.",
  },
};

// ─── Publishing workflow ─────────────────────────────────────────────────────

/**
 * The publishing state machine. Every piece of content — editorial items, pages and
 * website sections alike — moves through these four states, which is what makes a single
 * "Publishing" area in the admin panel possible.
 *
 *   draft ──▶ scheduled ──▶ published ──▶ archived
 *     ▲           │             │            │
 *     └───────────┴─────────────┴────────────┘   (any state can return to draft)
 *
 * Only `published` is visible to the public. `scheduled` becomes `published` once
 * `scheduledFor` has passed — resolved at read time rather than by a cron job, so a
 * missed tick can never hold back a release.
 */
export const CONTENT_STATUSES = ["draft", "scheduled", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_STATUS_META: Record<
  ContentStatus,
  { label: string; description: string; tone: StatusTone }
> = {
  draft: {
    label: "Draft",
    description: "Only visible inside the Website Manager.",
    tone: "neutral",
  },
  scheduled: {
    label: "Scheduled",
    description: "Publishes automatically at the chosen date and time.",
    tone: "info",
  },
  published: { label: "Published", description: "Live on the ENICE website.", tone: "success" },
  archived: {
    label: "Archived",
    description: "Removed from the website but kept on record.",
    tone: "warning",
  },
};

/** Semantic colour bands for status pills, so tone never gets hard-coded per screen. */
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

// ─── SEO ─────────────────────────────────────────────────────────────────────

/**
 * Per-item SEO overrides. Every field is optional: the API derives a sensible default
 * from the content itself (title, excerpt, cover image) whenever a field is blank, so an
 * author never has to fill this in to get correct metadata.
 */
export interface SeoFields {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** `false` emits `noindex, nofollow`. Defaults to true. */
  index?: boolean;
}

/** SEO with every field resolved — what the public API returns and the renderer uses. */
export interface ResolvedSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  index: boolean;
}

// ─── Editorial content ───────────────────────────────────────────────────────

/** Author attribution. Stored on the item so a post keeps its byline if an admin leaves. */
export interface ContentAuthor {
  name: string;
  role?: string;
  avatarUrl?: string;
}

/** Call-to-action used by announcements and updates. */
export interface ContentCta {
  label: string;
  url: string;
}

/**
 * Fields that only some kinds use. Kept in one optional bag rather than four near-identical
 * record types, because the editor renders them conditionally from `CONTENT_KIND_META`.
 */
export interface ContentExtras {
  /** Announcements and updates: an optional button below the content. */
  cta?: ContentCta;
  /** Announcements: the window during which the notice is live. */
  startsAt?: string | null;
  endsAt?: string | null;
  /** Updates and news: pin to the top of its feed. */
  featured?: boolean;
  /** Updates: a lucide icon name rendered when no image is set. */
  icon?: string;
}

/**
 * A single editorial item, as stored and as returned to the admin panel.
 *
 * `body` is an `EniceDoc` (see `./doc`). Dates are ISO 8601 strings rather than `Date`
 * objects so the record survives `JSON.stringify` across the API boundary unchanged.
 */
export interface ContentItem {
  id: string;
  kind: ContentKind;
  status: ContentStatus;
  title: string;
  slug: string;
  /** Subtitle on the page, summary in listings, and the SEO description fallback. */
  excerpt: string;
  body: unknown;
  coverImageUrl: string | null;
  author: ContentAuthor | null;
  category: string | null;
  tags: string[];
  seo: SeoFields;
  extras: ContentExtras;
  /** Set when the item first goes live; preserved through archive and republish. */
  publishedAt: string | null;
  scheduledFor: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdByEmail: string | null;
  updatedByEmail: string | null;
  /** Increments on every save. Used for optimistic-concurrency checks and revisions. */
  revision: number;
}

/** The trimmed projection used by listings, feeds and search — no body, so it stays light. */
export interface ContentSummary {
  id: string;
  kind: ContentKind;
  status: ContentStatus;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: string | null;
  tags: string[];
  author: ContentAuthor | null;
  extras: ContentExtras;
  /**
   * SEO overrides. Carried on the summary because sitemap and feed generation need to honour a
   * per-item override, and re-reading each row in full just to get this field would turn one
   * query into hundreds.
   */
  seo: SeoFields;
  publishedAt: string | null;
  scheduledFor: string | null;
  updatedAt: string;
  updatedByEmail: string | null;
  /** Estimated minutes to read, derived from the body at write time. */
  readingMinutes: number;
}

/**
 * Categories offered per kind. These are suggestions surfaced in the editor, not a
 * constraint — the field accepts any string so a new category never needs a deploy.
 */
/**
 * URL segment per kind, for the admin panel's routes.
 *
 * Deliberately not the kind name: an editor navigates to `/admin/content/announcements`, which
 * reads correctly, while the kind itself is singular (`announcement`) because it describes one
 * item. Keeping the mapping explicit here means the route and the model can differ without either
 * one being guessed at a call site.
 */
export const CONTENT_KIND_SEGMENT: Record<ContentKind, string> = {
  blog: "blog",
  announcement: "announcements",
  update: "updates",
  news: "news",
};

const KIND_BY_SEGMENT = new Map(
  Object.entries(CONTENT_KIND_SEGMENT).map(([kind, segment]) => [segment, kind as ContentKind]),
);

/** Resolves a URL segment to a kind, or null for anything unrecognised (→ a 404 screen). */
export function kindFromSegment(segment: string): ContentKind | null {
  return KIND_BY_SEGMENT.get(segment) ?? null;
}

export const CONTENT_CATEGORIES: Record<ContentKind, readonly string[]> = {
  blog: ["Engineering", "Product", "Company", "Industry", "Research"],
  announcement: ["Company", "Product", "Service", "Launch", "Partnership", "Event", "Notice"],
  update: ["Service", "Feature", "Partnership", "Expansion", "Platform"],
  news: ["Announcement", "New", "Update", "Partnership", "Milestone", "News"],
};

// ─── Pages ───────────────────────────────────────────────────────────────────

/**
 * A managed website page.
 *
 * `sections` is an ordered list of structured blocks drawn from the ENICE design system —
 * deliberately not free-form layout. An administrator picks a section type and fills in its
 * fields; the rendering, spacing and typography stay under the design system's control. That
 * is the difference between a page manager and a drag-and-drop builder that erodes the brand.
 */
export interface ManagedPage {
  id: string;
  /** Public path, always leading-slash normalised: "/about", "/services". */
  path: string;
  title: string;
  /** Shown in the page manager list, not on the page itself. */
  summary: string;
  status: ContentStatus;
  sections: PageSection[];
  seo: SeoFields;
  /**
   * True for pages that exist as hand-built React routes. Their SEO and managed sections
   * are editable, but the path is locked and the page cannot be deleted — removing it here
   * would leave a route in the bundle pointing at nothing.
   */
  systemRoute: boolean;
  publishedAt: string | null;
  scheduledFor: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  updatedByEmail: string | null;
  revision: number;
}

/** An instance of a section type on a page, with its field values and visibility. */
export interface PageSection {
  id: string;
  type: SectionType;
  /** Admin-facing label so a page with three CTA bands stays navigable. */
  label: string;
  visible: boolean;
  fields: Record<string, unknown>;
}

/**
 * The section types an administrator can place. Each maps to a vetted component in the
 * ENICE design system; the schema in `SECTION_SCHEMAS` drives the admin form.
 */
export const SECTION_TYPES = [
  "hero",
  "richText",
  "featureGrid",
  "statistics",
  "logoStrip",
  "testimonials",
  "cta",
  "faq",
  "contact",
  "mediaSplit",
  "pricing",
  "steps",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

/** A field in a section schema. Drives which control the admin panel renders. */
export interface SectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "image" | "url" | "boolean" | "select" | "repeater";
  help?: string;
  required?: boolean;
  options?: readonly string[];
  /** For `repeater`: the shape of each row. */
  of?: readonly SectionField[];
  /** For `repeater`: guardrails so a stats band cannot hold fourteen numbers. */
  max?: number;
}

export interface SectionSchema {
  type: SectionType;
  label: string;
  description: string;
  /** Lucide icon name for the section picker. */
  icon: string;
  fields: readonly SectionField[];
}

/**
 * Structured schemas for every placeable section.
 *
 * This is the guardrail that keeps the website on-brand: an administrator supplies copy,
 * images and links, and the design system decides everything visual. There is no field for
 * colour, font size, padding or column count anywhere in here, by design.
 */
export const SECTION_SCHEMAS: Record<SectionType, SectionSchema> = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Page-opening headline with supporting copy and up to two actions.",
    icon: "Sparkles",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", help: "Small label above the headline." },
      { key: "heading", label: "Headline", type: "text", required: true },
      { key: "subheading", label: "Supporting copy", type: "textarea" },
      { key: "primaryCtaLabel", label: "Primary button label", type: "text" },
      { key: "primaryCtaUrl", label: "Primary button URL", type: "url" },
      { key: "secondaryCtaLabel", label: "Secondary button label", type: "text" },
      { key: "secondaryCtaUrl", label: "Secondary button URL", type: "url" },
      { key: "image", label: "Accompanying image", type: "image" },
    ],
  },
  richText: {
    type: "richText",
    label: "Rich text",
    description: "A block of formatted prose, using the full editor.",
    icon: "AlignLeft",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Content", type: "richtext", required: true },
    ],
  },
  featureGrid: {
    type: "featureGrid",
    label: "Feature grid",
    description: "A grid of capabilities, services or products.",
    icon: "LayoutGrid",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text", required: true },
      { key: "subheading", label: "Supporting copy", type: "textarea" },
      {
        key: "items",
        label: "Features",
        type: "repeater",
        max: 12,
        of: [
          {
            key: "icon",
            label: "Icon name",
            type: "text",
            help: "A lucide icon, e.g. ShieldCheck",
          },
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" },
          { key: "url", label: "Link", type: "url" },
        ],
      },
    ],
  },
  statistics: {
    type: "statistics",
    label: "Company statistics",
    description: "A band of headline numbers.",
    icon: "BarChart3",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Statistics",
        type: "repeater",
        max: 6,
        of: [
          { key: "value", label: "Value", type: "text", required: true },
          { key: "label", label: "Label", type: "text", required: true },
        ],
      },
    ],
  },
  logoStrip: {
    type: "logoStrip",
    label: "Partners",
    description: "A strip of partner or customer logos.",
    icon: "Handshake",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Partners",
        type: "repeater",
        max: 24,
        of: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "logo", label: "Logo", type: "image" },
          { key: "url", label: "Website", type: "url" },
        ],
      },
    ],
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Quotes from customers or partners.",
    icon: "Quote",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Testimonials",
        type: "repeater",
        max: 9,
        of: [
          { key: "quote", label: "Quote", type: "textarea", required: true },
          { key: "name", label: "Name", type: "text", required: true },
          { key: "role", label: "Role and company", type: "text" },
          { key: "avatar", label: "Photo", type: "image" },
        ],
      },
    ],
  },
  cta: {
    type: "cta",
    label: "Call to action",
    description: "A closing band that drives one action.",
    icon: "MousePointerClick",
    fields: [
      { key: "heading", label: "Heading", type: "text", required: true },
      { key: "subheading", label: "Supporting copy", type: "textarea" },
      { key: "ctaLabel", label: "Button label", type: "text", required: true },
      { key: "ctaUrl", label: "Button URL", type: "url", required: true },
      {
        key: "style",
        label: "Emphasis",
        type: "select",
        options: ["standard", "prominent"],
        help: "Both styles are brand-approved.",
      },
    ],
  },
  faq: {
    type: "faq",
    label: "FAQ",
    description: "Expandable questions and answers.",
    icon: "CircleHelp",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Questions",
        type: "repeater",
        max: 30,
        of: [
          { key: "question", label: "Question", type: "text", required: true },
          { key: "answer", label: "Answer", type: "textarea", required: true },
        ],
      },
    ],
  },
  contact: {
    type: "contact",
    label: "Contact",
    description: "Contact details alongside the enquiry form.",
    icon: "Mail",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Supporting copy", type: "textarea" },
      { key: "email", label: "Email address", type: "text" },
      { key: "showForm", label: "Show the enquiry form", type: "boolean" },
    ],
  },
  mediaSplit: {
    type: "mediaSplit",
    label: "Media and text",
    description: "An image beside a block of copy.",
    icon: "Columns2",
    fields: [
      { key: "heading", label: "Heading", type: "text", required: true },
      { key: "body", label: "Content", type: "richtext" },
      { key: "image", label: "Image", type: "image", required: true },
      { key: "imageSide", label: "Image side", type: "select", options: ["left", "right"] },
      { key: "ctaLabel", label: "Button label", type: "text" },
      { key: "ctaUrl", label: "Button URL", type: "url" },
    ],
  },
  pricing: {
    type: "pricing",
    label: "Plans",
    description: "Comparable plans or packages.",
    icon: "CreditCard",
    fields: [
      { key: "heading", label: "Heading", type: "text", required: true },
      { key: "subheading", label: "Supporting copy", type: "textarea" },
      {
        key: "items",
        label: "Plans",
        type: "repeater",
        max: 4,
        of: [
          { key: "name", label: "Plan name", type: "text", required: true },
          { key: "price", label: "Price", type: "text" },
          { key: "cadence", label: "Billing cadence", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "features", label: "Features, one per line", type: "textarea" },
          { key: "ctaLabel", label: "Button label", type: "text" },
          { key: "ctaUrl", label: "Button URL", type: "url" },
          { key: "highlighted", label: "Highlight this plan", type: "boolean" },
        ],
      },
    ],
  },
  steps: {
    type: "steps",
    label: "Process steps",
    description: "A numbered sequence explaining how something works.",
    icon: "ListOrdered",
    fields: [
      { key: "heading", label: "Heading", type: "text", required: true },
      { key: "subheading", label: "Supporting copy", type: "textarea" },
      {
        key: "items",
        label: "Steps",
        type: "repeater",
        max: 8,
        of: [
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
};

// ─── Global website sections ─────────────────────────────────────────────────

/**
 * Sections that belong to the site rather than to one page — the homepage hero, the
 * partners strip, the FAQ. Each is addressed by a stable `key` that a React component
 * looks up, so editing content here never touches source code.
 */
export interface SiteSectionRecord {
  key: string;
  label: string;
  /** Where this section appears, for grouping in the admin list. */
  group: string;
  type: SectionType;
  visible: boolean;
  status: ContentStatus;
  fields: Record<string, unknown>;
  updatedAt: string;
  updatedByEmail: string | null;
  revision: number;
}

// ─── Navigation, footer, design and settings ─────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  /** One level of nesting only, matching the header's design. */
  children?: NavItem[];
}

export interface FooterColumn {
  id: string;
  heading: string;
  links: NavItem[];
}

/**
 * Design controls exposed to administrators.
 *
 * Deliberately narrow. Brand colours are constrained to a preset palette and typography to
 * a vetted pairing list, because a free colour picker and an arbitrary font stack are the
 * two fastest ways to make a premium site look broken. Anything structural stays in CSS.
 */
export interface DesignSettings {
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  /** Key into `BRAND_PALETTES`. */
  palette: string;
  /** Key into `TYPE_PAIRINGS`. */
  typography: string;
  /** Key into `BUTTON_STYLES`. */
  buttonStyle: string;
}

export const BRAND_PALETTES: Record<string, { label: string; primary: string; accent: string }> = {
  "enice-navy": { label: "ENICE Navy (default)", primary: "#1E3A8A", accent: "#334155" },
  "enice-midnight": { label: "ENICE Midnight", primary: "#0F172A", accent: "#1E3A8A" },
  "enice-slate": { label: "ENICE Slate", primary: "#334155", accent: "#475569" },
  "enice-indigo": { label: "ENICE Indigo", primary: "#3730A3", accent: "#4F46E5" },
};

export const TYPE_PAIRINGS: Record<string, { label: string; display: string; body: string }> = {
  inter: { label: "Inter (default)", display: "Inter", body: "Inter" },
  "inter-tight": { label: "Inter Tight headings", display: "Inter Tight", body: "Inter" },
  "geist-inter": { label: "Geist headings", display: "Geist", body: "Inter" },
};

export const BUTTON_STYLES: Record<string, { label: string; radius: string }> = {
  standard: { label: "Standard (6px)", radius: "0.375rem" },
  soft: { label: "Soft (10px)", radius: "0.625rem" },
  pill: { label: "Pill", radius: "9999px" },
};

export interface HeaderSettings {
  items: NavItem[];
  ctaLabel: string;
  ctaUrl: string;
  showCta: boolean;
  /** Sticky header with a blur backdrop. */
  sticky: boolean;
}

export interface FooterSettings {
  columns: FooterColumn[];
  tagline: string;
  copyright: string;
  showSocials: boolean;
}

/** Site-wide SEO defaults, used whenever an item leaves its own SEO fields blank. */
export interface SeoDefaults {
  titleSuffix: string;
  defaultDescription: string;
  defaultOgImage: string;
  /** Emergency switch: `false` puts `noindex` on everything. Guarded in the UI. */
  indexSite: boolean;
  robotsExtra: string;
}

/** Everything under Website → Settings, stored as one JSON document per key. */
export interface SiteSettings {
  design: DesignSettings;
  header: HeaderSettings;
  footer: FooterSettings;
  seo: SeoDefaults;
  announcementBarEnabled: boolean;
  maintenanceNotice: string;
}

// ─── Media ───────────────────────────────────────────────────────────────────

export interface MediaAsset {
  id: string;
  /** Object-storage key. Stable, and what a delete acts on. */
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string;
  folder: string;
  uploadedByEmail: string | null;
  createdAt: string;
}

/** Types accepted by the media library, with per-type size ceilings. */
export const MEDIA_LIMITS = {
  image: {
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"],
    maxBytes: 12 * 1024 * 1024,
  },
  video: {
    mimeTypes: ["video/mp4", "video/webm"],
    maxBytes: 200 * 1024 * 1024,
  },
  document: {
    mimeTypes: ["application/pdf"],
    maxBytes: 25 * 1024 * 1024,
  },
} as const;

export type MediaCategory = keyof typeof MEDIA_LIMITS;

export function mediaCategoryFor(mimeType: string): MediaCategory | null {
  for (const [category, spec] of Object.entries(MEDIA_LIMITS)) {
    if ((spec.mimeTypes as readonly string[]).includes(mimeType)) return category as MediaCategory;
  }
  return null;
}

// ─── Activity log ────────────────────────────────────────────────────────────

/**
 * Auditable actions. A closed list rather than free text, so the activity view can filter
 * and colour reliably and a typo cannot create a phantom action type.
 */
export const ACTIVITY_ACTIONS = [
  "login.success",
  "login.failed",
  "login.locked",
  "logout",
  "logout.all",
  "twofactor.enabled",
  "twofactor.disabled",
  "password.changed",
  "content.created",
  "content.updated",
  "content.published",
  "content.scheduled",
  "content.unpublished",
  "content.archived",
  "content.restored",
  "content.duplicated",
  "content.deleted",
  "page.created",
  "page.updated",
  "page.published",
  "page.unpublished",
  "page.archived",
  "page.deleted",
  "section.updated",
  "settings.updated",
  "design.updated",
  "media.uploaded",
  "media.updated",
  "media.deleted",
  "admin.invited",
  "admin.updated",
  "admin.suspended",
  "admin.removed",
  "ai.requested",
  "ai.proposed",
  "ai.approved",
  "ai.rejected",
  "ai.applied",
  "ai.deployed",
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export interface ActivityEntry {
  id: string;
  actorEmail: string | null;
  actorName: string | null;
  action: ActivityAction;
  entityType: string | null;
  entityId: string | null;
  /** Human-readable name of the affected thing, captured at write time. */
  entityLabel: string | null;
  outcome: "success" | "failure";
  ipAddress: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─── AI Website Manager ──────────────────────────────────────────────────────

/**
 * An AI-assisted change, from request through to deployment.
 *
 * Two classes of change flow through the same review pipeline:
 *
 *   `content` — the AI edits structured content the CMS already owns (a section's copy, a
 *               new page built from existing section types). Approval applies it to the
 *               database directly; no deploy needed.
 *
 *   `code`    — the change needs real source edits. The AI produces a plan and a patch;
 *               approval opens a pull request, which is what runs CI and produces a preview
 *               deployment. A human merges. Nothing reaches production unattended.
 */
export const AI_CHANGE_KINDS = ["content", "code"] as const;
export type AiChangeKind = (typeof AI_CHANGE_KINDS)[number];

export const AI_CHANGE_STATUSES = [
  "queued",
  "analyzing",
  "proposed",
  "changes_requested",
  "approved",
  "applied",
  "pr_open",
  "deployed",
  "rejected",
  "failed",
] as const;
export type AiChangeStatus = (typeof AI_CHANGE_STATUSES)[number];

export const AI_CHANGE_STATUS_META: Record<
  AiChangeStatus,
  { label: string; tone: StatusTone; description: string }
> = {
  queued: { label: "Queued", tone: "neutral", description: "Waiting to be analysed." },
  analyzing: {
    label: "Analysing",
    tone: "info",
    description: "Inspecting the website structure and design system.",
  },
  proposed: {
    label: "Awaiting review",
    tone: "info",
    description: "A proposal is ready for an administrator to review.",
  },
  changes_requested: {
    label: "Changes requested",
    tone: "warning",
    description: "Sent back with feedback for another pass.",
  },
  approved: { label: "Approved", tone: "success", description: "Approved and ready to apply." },
  applied: {
    label: "Applied",
    tone: "success",
    description: "Content changes are live on the website.",
  },
  pr_open: {
    label: "Pull request open",
    tone: "info",
    description: "Awaiting checks and a merge on GitHub.",
  },
  deployed: { label: "Deployed", tone: "success", description: "Shipped to production." },
  rejected: { label: "Rejected", tone: "danger", description: "Declined; nothing was changed." },
  failed: {
    label: "Failed",
    tone: "danger",
    description: "Could not be completed. Nothing was changed.",
  },
};

/** One step of the AI's plan, surfaced so a reviewer sees intent before diffs. */
export interface AiPlanStep {
  title: string;
  detail: string;
}

/** A single proposed change to CMS-owned data, with before and after for review. */
export interface AiContentEdit {
  /** What is being changed: "site_section", "page", "content_item", "settings". */
  target: string;
  targetId: string;
  targetLabel: string;
  operation: "create" | "update" | "delete";
  before: unknown;
  after: unknown;
}

/** A proposed source edit, held as a unified diff until a pull request is opened. */
export interface AiCodeEdit {
  path: string;
  operation: "create" | "update" | "delete";
  diff: string;
  /** Full file contents after the change, used to build the pull request. */
  contents?: string;
}

export interface AiValidationCheck {
  name: string;
  status: "pending" | "passed" | "failed" | "skipped";
  detail: string;
}

export interface AiChangeRequest {
  id: string;
  prompt: string;
  kind: AiChangeKind;
  status: AiChangeStatus;
  /** The AI's reading of the request and the existing architecture. */
  summary: string;
  plan: AiPlanStep[];
  contentEdits: AiContentEdit[];
  codeEdits: AiCodeEdit[];
  checks: AiValidationCheck[];
  /** Where a reviewer can see the change rendered before approving. */
  previewUrl: string | null;
  branch: string | null;
  pullRequestUrl: string | null;
  reviewNote: string | null;
  errorMessage: string | null;
  requestedByEmail: string | null;
  reviewedByEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** The aggregate the dashboard renders in one request. */
export interface DashboardSnapshot {
  counts: {
    published: number;
    drafts: number;
    scheduled: number;
    archived: number;
    media: number;
    pages: number;
    admins: number;
  };
  byKind: Record<ContentKind, { published: number; drafts: number; scheduled: number }>;
  recentContent: ContentSummary[];
  recentAnnouncements: ContentSummary[];
  recentUpdates: ContentSummary[];
  upcoming: ContentSummary[];
  activity: ActivityEntry[];
  pendingAiReviews: number;
  site: {
    /** Whether the public site's API dependencies are answering. */
    apiHealthy: boolean;
    databaseConfigured: boolean;
    mediaStorageConfigured: boolean;
    aiConfigured: boolean;
    lastPublishedAt: string | null;
  };
}

// ─── Global search ───────────────────────────────────────────────────────────

export interface SearchHit {
  id: string;
  /** Which area the hit belongs to, used for grouping and the route. */
  type: "content" | "page" | "section" | "media" | "admin";
  kind: string;
  title: string;
  subtitle: string;
  status: ContentStatus | null;
  /** Admin route that opens this result. */
  href: string;
  updatedAt: string | null;
}
