/**
 * Vercel serverless function — `/api/site/*`
 *
 * The public, read-only face of the Website Manager. This is what the ENICE website itself calls
 * to render published content. It replaces the direct Sanity queries the blog used to make from
 * the browser.
 *
 * Three properties distinguish it from `/api/cms`:
 *
 * 1. **No authentication.** Everything here is already public. There is no session, no CSRF, and
 *    no code path that can read a draft — `publishedOnly` is hard-coded true at every call site
 *    rather than driven by a parameter, so there is no flag for an attacker to flip.
 *
 * 2. **Cacheable.** Responses carry `s-maxage` with `stale-while-revalidate`, so Vercel's edge
 *    serves the vast majority of reads without invoking a function or touching Postgres. A
 *    corporate site's content changes a few times a week and is read constantly; caching is the
 *    difference between one database query per visitor and one per minute.
 *
 * 3. **It degrades instead of failing.** If `DATABASE_URL` is absent or Postgres is unreachable,
 *    every endpoint answers `200` with empty collections and `degraded: true`. The marketing site
 *    must not show an error page because the CMS is having a bad day — an empty blog list is a
 *    far better outcome, and the rest of the site is unaffected.
 */

import type { ContentKind } from "../src/lib/cms/types";
import { CONTENT_KINDS, CONTENT_KIND_META } from "../src/lib/cms/types";
import { SITE_URL } from "../src/lib/site";
import { PAGE_SEO, canonicalUrl } from "../src/lib/seo";
import { resolveSeo, FALLBACK_SEO_DEFAULTS } from "../src/lib/cms/seo-resolve";
import { errorRef, type ApiRequest, type ApiResponse } from "./lib/http";
import { ensureMigrated, isDatabaseConfigured } from "./lib/db";
import {
  Router,
  buildContext,
  enumValue,
  intParam,
  notFound,
  resolveRequestPath,
  HttpError,
} from "./lib/router";
import { getContentBySlug, listContent } from "./lib/repo/content";
import {
  getPageByPath,
  getSettings,
  listPages,
  listSections,
  publishDuePages,
} from "./lib/repo/website";

/**
 * Edge cache policy.
 *
 * `s-maxage` applies to the shared CDN cache only; `max-age=0` keeps browsers asking, so a
 * publish is visible on reload rather than being pinned in someone's local cache for an hour.
 * `stale-while-revalidate` means the one request that arrives after expiry is still served
 * instantly from cache while the refresh happens behind it.
 *
 * These are kept deliberately short. This is a CMS: an administrator who changes a heading and
 * reloads expects to see it, not to wait out a five-minute edge cache. A ~15s window still
 * absorbs traffic bursts (many hits collapse onto one origin fetch) while making an edit visible
 * almost immediately. `stale-while-revalidate` is small for the same reason — a long tail would
 * keep serving the pre-edit copy well after the change.
 */
const CACHE_CONTENT = "public, max-age=0, s-maxage=15, stale-while-revalidate=30";
/** Settings and sections are needed by every page; same short freshness so edits show quickly. */
const CACHE_SETTINGS = "public, max-age=0, s-maxage=15, stale-while-revalidate=30";

const router = new Router<null>();

/** Site-wide SEO defaults, for resolving each item's metadata. */
async function seoContext() {
  const settings = await getSettings();
  return { siteUrl: SITE_URL, defaults: settings.seo ?? FALLBACK_SEO_DEFAULTS };
}

function kindParam(value: string): ContentKind {
  return enumValue(value, CONTENT_KINDS, "Content type");
}

/** The public path for an item, used for canonical URLs and links. */
function publicPath(kind: ContentKind, slug: string): string {
  const prefix = CONTENT_KIND_META[kind].publicPrefix;
  // Updates have no page of their own; they surface inside the news feed.
  return prefix ? `${prefix}/${slug}` : `/news#${slug}`;
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

/**
 * Everything the site chrome needs: navigation, footer, design tokens and any live announcement.
 *
 * One request rather than three, because the header and footer render on every page and three
 * round trips on first paint is three chances to be slow.
 */
router.add("GET /bootstrap", async ({ res }) => {
  res.setHeader("Cache-Control", CACHE_SETTINGS);

  const [settings, sections] = await Promise.all([getSettings(), listSections()]);

  // Only sections that are both published and switched on are exposed. An administrator hiding a
  // band must remove it from the payload entirely, not merely from the render.
  const visible = sections
    .filter((section) => section.visible && section.status === "published")
    .map((section) => ({
      key: section.key,
      type: section.type,
      label: section.label,
      group: section.group,
      fields: section.fields,
    }));

  const announcements = await listContent({
    kind: "announcement",
    status: "published",
    limit: 3,
    sort: "published",
  });

  const now = Date.now();
  // A window-bounded announcement is only live inside its window. Filtering here rather than in
  // the client means an expired notice is never sent to a browser at all.
  const live = announcements.items.filter((item) => {
    const startsAt = item.extras.startsAt ? Date.parse(item.extras.startsAt) : null;
    const endsAt = item.extras.endsAt ? Date.parse(item.extras.endsAt) : null;
    if (startsAt && Number.isFinite(startsAt) && startsAt > now) return false;
    if (endsAt && Number.isFinite(endsAt) && endsAt < now) return false;
    return true;
  });

  return {
    header: settings.header,
    footer: settings.footer,
    design: settings.design,
    seoDefaults: settings.seo,
    announcementBarEnabled: settings.announcementBarEnabled,
    maintenanceNotice: settings.maintenanceNotice,
    sections: visible,
    announcements: live.map((item) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      slug: item.slug,
      url: publicPath("announcement", item.slug),
      cta: item.extras.cta ?? null,
      coverImageUrl: item.coverImageUrl,
      publishedAt: item.publishedAt,
    })),
  };
});

// ─── Collections ─────────────────────────────────────────────────────────────

router.add("GET /content/:kind", async ({ res, params, query }) => {
  res.setHeader("Cache-Control", CACHE_CONTENT);
  const kind = kindParam(params.kind);

  const { items, total } = await listContent({
    kind,
    status: "published",
    category: query.get("category") ?? undefined,
    tag: query.get("tag") ?? undefined,
    limit: intParam(query, "limit", 24, 100) || 24,
    offset: intParam(query, "offset", 0, 10_000),
    sort: "published",
  });

  return {
    items: items.map((item) => ({ ...item, url: publicPath(kind, item.slug) })),
    total,
    // Derived from what is actually published, so a filter bar never offers an empty category.
    categories: [...new Set(items.map((item) => item.category).filter(Boolean))],
  };
});

/**
 * The combined news feed: news entries, updates and announcements in one reverse-chronological
 * stream.
 *
 * This is what makes the Updates manager useful without giving every short notice its own page —
 * they appear here alongside the longer entries.
 */
router.add("GET /feed", async ({ res, query }) => {
  res.setHeader("Cache-Control", CACHE_CONTENT);
  const limit = intParam(query, "limit", 40, 100) || 40;

  const [news, updates, announcements] = await Promise.all([
    listContent({ kind: "news", status: "published", limit, sort: "published" }),
    listContent({ kind: "update", status: "published", limit, sort: "published" }),
    listContent({ kind: "announcement", status: "published", limit, sort: "published" }),
  ]);

  const entries = [...news.items, ...updates.items, ...announcements.items]
    .map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      excerpt: item.excerpt,
      slug: item.slug,
      url: publicPath(item.kind, item.slug),
      category: item.category,
      coverImageUrl: item.coverImageUrl,
      icon: item.extras.icon ?? null,
      cta: item.extras.cta ?? null,
      featured: item.extras.featured === true,
      publishedAt: item.publishedAt,
      readingMinutes: item.readingMinutes,
    }))
    // Featured entries pin to the top; everything else is newest-first.
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? "");
    })
    .slice(0, limit);

  return { entries, total: entries.length };
});

// ─── Single item ─────────────────────────────────────────────────────────────

router.add("GET /content/:kind/:slug", async ({ res, params }) => {
  res.setHeader("Cache-Control", CACHE_CONTENT);
  const kind = kindParam(params.kind);

  // `publishedOnly` is fixed true. There is deliberately no query parameter that relaxes it.
  const item = await getContentBySlug(kind, params.slug, true);
  if (!item) throw notFound("That article");

  const path = publicPath(kind, item.slug);
  const seo = resolveSeo(
    item.seo,
    { title: item.title, excerpt: item.excerpt, image: item.coverImageUrl, path },
    await seoContext(),
  );

  const related = await listContent({
    kind,
    status: "published",
    category: item.category ?? undefined,
    limit: 4,
    sort: "published",
  });

  return {
    item: { ...item, url: path },
    seo,
    related: related.items
      .filter((candidate) => candidate.id !== item.id)
      .slice(0, 3)
      .map((candidate) => ({ ...candidate, url: publicPath(kind, candidate.slug) })),
  };
});

// ─── Managed pages ───────────────────────────────────────────────────────────

/**
 * A managed page's content and SEO by path.
 *
 * Built-in React routes call this to pick up their editable sections and SEO overrides; a page
 * created entirely in the Website Manager is rendered by the catch-all route from the same shape.
 */
router.add("GET /page", async ({ res, query }) => {
  res.setHeader("Cache-Control", CACHE_SETTINGS);
  await publishDuePages();

  const path = query.get("path") ?? "/";
  const page = await getPageByPath(path, true);
  if (!page) throw notFound("That page");

  const seo = resolveSeo(
    page.seo,
    { title: page.title, excerpt: page.summary, path: page.path },
    await seoContext(),
  );

  return {
    page: {
      path: page.path,
      title: page.title,
      summary: page.summary,
      // Hidden sections are filtered out server-side, as with global sections.
      sections: page.sections.filter((section) => section.visible),
      publishedAt: page.publishedAt,
      updatedAt: page.updatedAt,
    },
    seo,
  };
});

// ─── Sitemap data ────────────────────────────────────────────────────────────

/**
 * Every published URL the CMS owns.
 *
 * Consumed by the prerender step at build time and available at runtime for sitemap generation,
 * so a newly published post becomes discoverable without anyone editing `public/sitemap.xml`.
 */
/**
 * `sitemap.xml`, generated from the routes in code plus everything published in the CMS.
 *
 * This replaces a hand-maintained `public/sitemap.xml`, which listed only the static routes and
 * carried a fixed `lastmod`. The consequence was that publishing an article — the whole point of
 * the Website Manager — never told Google the page existed, and every stated modification date was
 * a lie. Serving it from a function means a post is discoverable the moment it is published, with
 * no rebuild.
 *
 * `lastmod` is the item's real `updatedAt`, which is what search engines actually use to decide
 * whether to recrawl. `changefreq` and `priority` are deliberately omitted: Google states it
 * ignores them, and inventing values adds noise to a file that should be trustworthy.
 *
 * If the database is unreachable, the static routes are still emitted. A partial sitemap is far
 * better than a 500, which would tell a crawler the site is broken.
 */
/**
 * The routes defined in code. A route marked `noindex` is excluded — listing a page in the sitemap
 * while telling robots to skip it is contradictory.
 */
function staticEntries(): { url: string; lastmod?: string }[] {
  return Object.entries(PAGE_SEO)
    .filter(([, seo]) => !seo.robots?.includes("noindex"))
    .map(([path]) => ({ url: canonicalUrl(path) }));
}

/** Routes only, for when the database cannot be read. Always valid, never empty. */
function staticSitemap(): string {
  return renderSitemap(staticEntries());
}

function renderSitemap(entries: { url: string; lastmod?: string }[]): string {
  // De-duplicate, keeping the first occurrence, so a managed page at a static route cannot appear
  // twice — a duplicate <loc> makes the document invalid to some validators.
  const seen = new Set<string>();
  const unique = entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...unique.map((entry) => {
      const lastmod = entry.lastmod ? `    <lastmod>${entry.lastmod.slice(0, 10)}</lastmod>\n` : "";
      return `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n${lastmod}  </url>`;
    }),
    "</urlset>",
    "",
  ].join("\n");
}

async function buildSitemap(): Promise<string> {
  const entries = staticEntries();

  if (isDatabaseConfigured()) {
    try {
      await ensureMigrated();
      const [content, pages, settings] = await Promise.all([
        Promise.all(
          (["blog", "news", "announcement"] as const).map((kind) =>
            listContent({ kind, status: "published", limit: 500, sort: "published" }),
          ),
        ),
        listPages(),
        getSettings(),
      ]);

      const context = { siteUrl: SITE_URL, defaults: settings.seo };

      for (const item of content.flatMap((result) => result.items)) {
        const path = publicPath(item.kind, item.slug);
        const seo = resolveSeo(
          item.seo,
          { title: item.title, excerpt: item.excerpt, image: item.coverImageUrl, path },
          context,
        );
        // Honour a per-item or site-wide noindex, exactly as the page's own meta tags do.
        if (!seo.index) continue;
        entries.push({
          url: canonicalUrl(path),
          lastmod: item.updatedAt ?? item.publishedAt ?? undefined,
        });
      }

      // Managed pages the administrator created, which have no entry in PAGE_SEO.
      for (const page of pages) {
        if (page.status !== "published" || page.systemRoute) continue;
        entries.push({ url: canonicalUrl(page.path), lastmod: page.updatedAt ?? undefined });
      }
    } catch (error) {
      console.error("[api/site] sitemap content omitted:", error);
    }
  }

  return renderSitemap(entries);
}

/** XML-escapes a URL. Ampersands in a query string would otherwise break the document. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.add("GET /urls", async ({ res }) => {
  res.setHeader("Cache-Control", CACHE_SETTINGS);

  const [blog, news, announcements, pagesSettings] = await Promise.all([
    listContent({ kind: "blog", status: "published", limit: 200, sort: "published" }),
    listContent({ kind: "news", status: "published", limit: 200, sort: "published" }),
    listContent({ kind: "announcement", status: "published", limit: 200, sort: "published" }),
    getSettings(),
  ]);

  const context = { siteUrl: SITE_URL, defaults: pagesSettings.seo };

  const entries = [...blog.items, ...news.items, ...announcements.items].map((item) => {
    const path = publicPath(item.kind, item.slug);
    const seo = resolveSeo(
      item.seo,
      { title: item.title, excerpt: item.excerpt, image: item.coverImageUrl, path },
      context,
    );
    return {
      path,
      kind: item.kind,
      title: item.title,
      excerpt: item.excerpt,
      image: seo.ogImage,
      seoTitle: seo.title,
      seoDescription: seo.description,
      index: seo.index,
      publishedAt: item.publishedAt,
      updatedAt: item.updatedAt,
    };
  });

  return { urls: entries };
});

// ─── Handler ─────────────────────────────────────────────────────────────────

/**
 * Empty-but-valid payloads for when storage is unavailable.
 *
 * Shaped identically to the real responses so the client needs no special case: it renders an
 * empty state, which is exactly what it would do for a site with no content yet.
 */
function degradedPayload(path: string): Record<string, unknown> {
  const base = { degraded: true };
  if (path === "/bootstrap") {
    return { ...base, header: null, footer: null, design: null, sections: [], announcements: [] };
  }
  if (path === "/feed") return { ...base, entries: [], total: 0 };
  if (path === "/urls") return { ...base, urls: [] };
  if (path.startsWith("/content")) return { ...base, items: [], total: 0, categories: [] };
  return base;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const ref = errorRef("SITE");
  const { path, query } = resolveRequestPath(req, "/api/site");
  const method = (req.method ?? "GET").toUpperCase();

  // Read-only by construction. Rejecting other verbs up front means no handler has to consider
  // the possibility of a write.
  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("Cache-Control", "no-store");
    res.status(405).json({ ok: false, error: "This endpoint is read-only." });
    return;
  }

  // The sitemap is handled ahead of everything below because it is the one response that is not
  // JSON. Falling into the degraded or error paths would emit a JSON body under an XML content
  // type — an unparseable sitemap, which is worse for search engines than a stale one. It builds
  // its own content and never throws: with no database, or a failure while reading it, the static
  // routes are still served.
  if (path === "/sitemap") {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", CACHE_CONTENT);
    let body: string;
    try {
      body = await buildSitemap();
    } catch (error) {
      console.error(`[api/site:${ref}] sitemap fell back to static routes:`, error);
      body = staticSitemap();
    }
    res.status(200).end(body);
    return;
  }

  try {
    if (!isDatabaseConfigured()) {
      // Short cache rather than none: a site awaiting configuration should not send every
      // visitor's request through to a function that will do nothing.
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30");
      res.status(200).json({ ok: true, ...degradedPayload(path) });
      return;
    }

    await ensureMigrated();

    const matched = router.match(method, path);
    if (matched === null || matched === "method_mismatch") {
      res.setHeader("Cache-Control", "no-store");
      res.status(404).json({ ok: false, error: `No such endpoint: ${method} ${path}` });
      return;
    }

    const context = buildContext(req, res, path, query, matched.params, null);
    const payload = await matched.handler(context);

    if (!res.headersSent) res.status(200).json({ ok: true, ...(payload as object) });
  } catch (error) {
    if (res.headersSent) return;

    if (error instanceof HttpError) {
      res.setHeader("Cache-Control", "no-store");
      res.status(error.statusCode).json({ ok: false, error: error.message, code: error.code });
      return;
    }

    // Anything unexpected — including Postgres being unreachable — degrades rather than serving
    // a 500 into the public site. The cause is logged for diagnosis.
    console.error(`[api/site:${ref}] falling back to a degraded response:`, error);
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=15");
    res.status(200).json({ ok: true, ...degradedPayload(path), ref });
  }
}
