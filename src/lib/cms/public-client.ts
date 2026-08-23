/**
 * Client for the public content API (`/api/site/*`).
 *
 * Used by the public website — the blog, the news feed, managed pages — and by the build-time
 * prerender script. It replaced the browser-side Sanity client, and the shape of the change
 * matters: content is now fetched same-origin from an endpoint that can be cached at the edge,
 * rather than from a third-party CDN that had to be allowlisted in the site's Content Security
 * Policy and could not be cached alongside the rest of the site.
 *
 * ## Failure behaviour
 *
 * Every function resolves rather than rejects. A content API that is unreachable produces an empty
 * blog list, not an error boundary — and never a broken header. The API itself already degrades to
 * empty payloads (see `api-src/site.ts`); this layer covers the cases the server cannot, namely
 * the network being unavailable and the response being unparseable.
 */

import type {
  ContentItem,
  ContentKind,
  ContentSummary,
  DesignSettings,
  FooterSettings,
  HeaderSettings,
  PageSection,
  ResolvedSeo,
  SectionType,
  SeoDefaults,
} from "./types";

const BASE = "/api/site";

/** Requests are abandoned rather than left hanging if the API is slow to answer. */
const REQUEST_TIMEOUT_MS = 10_000;

async function get<T>(path: string, fallback: T): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return fallback;

    const body = (await response.json()) as { ok?: boolean } & T;
    if (body?.ok !== true) return fallback;
    return body;
  } catch {
    // Offline, aborted, or a malformed body. The caller gets its empty shape.
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Site chrome ─────────────────────────────────────────────────────────────

export interface PublicSection {
  key: string;
  type: SectionType;
  label: string;
  group: string;
  fields: Record<string, unknown>;
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  url: string;
  cta: { label: string; url: string } | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export interface SiteBootstrap {
  header: HeaderSettings | null;
  footer: FooterSettings | null;
  design: DesignSettings | null;
  seoDefaults?: SeoDefaults;
  announcementBarEnabled?: boolean;
  maintenanceNotice?: string;
  sections: PublicSection[];
  announcements: PublicAnnouncement[];
  degraded?: boolean;
}

const EMPTY_BOOTSTRAP: SiteBootstrap = {
  header: null,
  footer: null,
  design: null,
  sections: [],
  announcements: [],
  degraded: true,
};

export function fetchBootstrap(): Promise<SiteBootstrap> {
  return get<SiteBootstrap>("/bootstrap", EMPTY_BOOTSTRAP);
}

/**
 * Looks a section up by key from a bootstrap payload.
 *
 * A component calls this and falls back to its own hard-coded copy when the section is absent —
 * which is what lets the CMS be introduced without a flag day. A page renders its built-in content
 * until someone edits that section, and from then on renders the edited version.
 */
export function sectionFields(
  bootstrap: SiteBootstrap | null,
  key: string,
): Record<string, unknown> | null {
  return bootstrap?.sections.find((section) => section.key === key)?.fields ?? null;
}

/** Reads one string field from a section, with a fallback for when it is unset or unmanaged. */
export function sectionText(
  bootstrap: SiteBootstrap | null,
  key: string,
  field: string,
  fallback: string,
): string {
  const value = sectionFields(bootstrap, key)?.[field];
  return typeof value === "string" && value.trim() ? value : fallback;
}

// ─── Collections ─────────────────────────────────────────────────────────────

export interface PublicSummary extends ContentSummary {
  url: string;
}

export interface ContentList {
  items: PublicSummary[];
  total: number;
  categories: string[];
  degraded?: boolean;
}

const EMPTY_LIST: ContentList = { items: [], total: 0, categories: [], degraded: true };

export function fetchContentList(
  kind: ContentKind,
  options: { limit?: number; offset?: number; category?: string; tag?: string } = {},
): Promise<ContentList> {
  const query = new URLSearchParams();
  if (options.limit) query.set("limit", String(options.limit));
  if (options.offset) query.set("offset", String(options.offset));
  if (options.category) query.set("category", options.category);
  if (options.tag) query.set("tag", options.tag);

  const suffix = query.toString() ? `?${query}` : "";
  return get<ContentList>(`/content/${kind}${suffix}`, EMPTY_LIST);
}

export interface FeedEntry {
  id: string;
  kind: ContentKind;
  title: string;
  excerpt: string;
  slug: string;
  url: string;
  category: string | null;
  coverImageUrl: string | null;
  icon: string | null;
  cta: { label: string; url: string } | null;
  featured: boolean;
  publishedAt: string | null;
  readingMinutes: number;
}

export interface FeedResult {
  entries: FeedEntry[];
  total: number;
  degraded?: boolean;
}

/** The combined news, updates and announcements stream. */
export function fetchFeed(limit = 40): Promise<FeedResult> {
  return get<FeedResult>(`/feed?limit=${limit}`, { entries: [], total: 0, degraded: true });
}

// ─── Single item ─────────────────────────────────────────────────────────────

export interface PublicArticle {
  item: ContentItem & { url: string };
  seo: ResolvedSeo;
  related: PublicSummary[];
}

/**
 * Fetches one article, or `null` when it does not exist.
 *
 * `null` is the signal a route loader turns into a 404. It deliberately does not distinguish
 * "missing" from "the API is down": both mean this page cannot be rendered, and a visitor is
 * better served by the not-found page than by a stack trace.
 */
export async function fetchArticle(kind: ContentKind, slug: string): Promise<PublicArticle | null> {
  const result = await get<PublicArticle | null>(
    `/content/${kind}/${encodeURIComponent(slug)}`,
    null,
  );
  return result && "item" in result ? result : null;
}

// ─── Managed pages ───────────────────────────────────────────────────────────

export interface PublicPage {
  page: {
    path: string;
    title: string;
    summary: string;
    sections: PageSection[];
    publishedAt: string | null;
    updatedAt: string;
  };
  seo: ResolvedSeo;
}

export async function fetchPage(path: string): Promise<PublicPage | null> {
  const result = await get<PublicPage | null>(`/page?path=${encodeURIComponent(path)}`, null);
  return result && "page" in result ? result : null;
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

/**
 * Formats a publication date for display.
 *
 * Shared so a date is never rendered one way in a listing and another on the article. Returns an
 * empty string for a missing or unparseable date rather than "Invalid Date".
 */
export function formatPublishedDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Short form for dense lists: "23 Aug 2026". */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

/** Relative time for recency cues, falling back to an absolute date beyond a month. */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2_592_000) return `${Math.floor(seconds / 86_400)}d ago`;
  return formatShortDate(iso);
}

/** Tailwind classes per content category, matching the badges already used on the blog. */
export const CATEGORY_BADGE: Record<string, string> = {
  BLOG: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ANNOUNCEMENT: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  NEW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  UPDATE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PARTNERSHIP: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  MILESTONE: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  NEWS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  PRODUCT: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  SERVICE: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  COMPANY: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  LAUNCH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export function categoryBadgeClasses(category: string | null | undefined): string {
  if (!category) return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  return (
    CATEGORY_BADGE[category.toUpperCase()] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  );
}
