/**
 * Fills in SEO metadata, so an author never has to.
 *
 * Every SEO field on a content item, page or section is optional. Left blank, it is derived
 * here from what the item already has — its title, its excerpt, its cover image — layered over
 * the site-wide defaults. The result is that a post published without anyone opening the SEO
 * panel still gets a correct title, a real description and a valid preview image.
 *
 * Shared by three callers, which is why it lives in `src/lib` rather than in the API:
 *
 *   1. `api-src/site.ts`, building the public payload.
 *   2. The admin panel's SEO panel, which shows the derived value as placeholder text so an
 *      author can see exactly what will ship before deciding to override it.
 *   3. `scripts/prerender.mjs`, baking tags into static HTML at build time.
 *
 * Free of React, DOM and Node APIs for that third caller's benefit.
 */

import type { ResolvedSeo, SeoDefaults, SeoFields } from "./types";

/** Google truncates titles around 60 characters and descriptions around 160. */
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

export interface SeoSource {
  /** The item's own title, used when no SEO title is set. */
  title: string;
  /** The item's excerpt or summary, used when no meta description is set. */
  excerpt?: string;
  /** The item's cover image, used when no social image is set. */
  image?: string | null;
  /** Canonical path on the public site, e.g. `/blog/our-post`. */
  path: string;
}

export interface SeoContext {
  siteUrl: string;
  defaults: SeoDefaults;
}

/**
 * Truncates on a word boundary and appends an ellipsis.
 *
 * A hard `slice` produces titles that end mid-word, which looks broken in a search result. The
 * boundary is only honoured if it falls reasonably late, so a single very long word still gets
 * cut rather than collapsing the whole string.
 */
function truncate(value: string, maxLength: number): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;

  const window = collapsed.slice(0, maxLength - 1);
  const lastSpace = window.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? window.slice(0, lastSpace) : window).trimEnd()}…`;
}

/** Joins the site origin to a path, tolerating either or both carrying a slash. */
export function absoluteUrl(siteUrl: string, path: string): string {
  const origin = siteUrl.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}/${path.replace(/^\/+/, "")}`;
}

/**
 * Produces the complete metadata set for one item.
 *
 * Precedence is the same for every field: the explicit override, then a value derived from the
 * content, then the site default. `index` is the exception — the site-wide switch wins over an
 * item-level `true`, so turning off indexing for the whole site cannot be silently contradicted
 * by an individual post.
 */
export function resolveSeo(
  fields: SeoFields | null | undefined,
  source: SeoSource,
  context: SeoContext,
): ResolvedSeo {
  const seo = fields ?? {};
  const { defaults, siteUrl } = context;

  const baseTitle = seo.title?.trim() || source.title.trim();
  // The suffix is only appended when it is not already present, so an author who types the full
  // "Something | ENICE Group" does not end up with it twice.
  const suffix = defaults.titleSuffix?.trim() ?? "";
  const withSuffix =
    suffix && !baseTitle.toLowerCase().includes(suffix.toLowerCase().replace(/^[\s|·—-]+/, ""))
      ? `${baseTitle}${suffix.startsWith(" ") ? suffix : ` ${suffix}`}`
      : baseTitle;

  const title = truncate(withSuffix, MAX_TITLE_LENGTH + suffix.length);
  const description = truncate(
    seo.description?.trim() || source.excerpt?.trim() || defaults.defaultDescription,
    MAX_DESCRIPTION_LENGTH,
  );

  const image = seo.ogImage?.trim() || source.image || defaults.defaultOgImage;

  return {
    title,
    description,
    canonicalUrl: seo.canonicalUrl?.trim() || absoluteUrl(siteUrl, source.path),
    ogTitle: seo.ogTitle?.trim() || title,
    ogDescription: seo.ogDescription?.trim() || description,
    ogImage: absoluteUrl(siteUrl, image),
    // A site-wide noindex is authoritative; an item can only ever be more restrictive.
    index: defaults.indexSite === false ? false : seo.index !== false,
  };
}

/** The `robots` header value for a resolved item. */
export function robotsValue(seo: ResolvedSeo, extra = ""): string {
  const base = seo.index ? "index, follow" : "noindex, nofollow";
  return extra.trim() ? `${base}, ${extra.trim()}` : base;
}

/** Site defaults used before anything has been configured. */
export const FALLBACK_SEO_DEFAULTS: SeoDefaults = {
  titleSuffix: " | ENICE Group",
  defaultDescription:
    "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
  defaultOgImage: "/og.png",
  indexSite: true,
  robotsExtra: "",
};
