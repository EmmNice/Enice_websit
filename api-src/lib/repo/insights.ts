/**
 * Cross-cutting reads: the dashboard snapshot and global search.
 *
 * Both exist to answer a question that spans every content type at once, which is why they live
 * apart from the per-entity repositories rather than being assembled by the client.
 *
 * The dashboard is deliberately **one request**. Letting the admin panel fetch counts, recent
 * items, upcoming posts and activity separately would mean eight round trips on every load, and
 * the numbers could disagree with each other because they were read at different moments.
 */

import type {
  ContentKind,
  ContentSummary,
  DashboardSnapshot,
  SearchHit,
} from "../../../src/lib/cms/types";
import { CONTENT_KIND_META, CONTENT_KINDS } from "../../../src/lib/cms/types";
import { isDatabaseConfigured, db } from "../db";
import { isMediaStorageConfigured } from "../storage";
import { isSecretConfigured } from "../crypto";
import { recentActivity } from "../audit";
import { isAiConfigured } from "../ai-manager";
import { contentCounts, lastPublishedAt, listContent, publishDueContent } from "./content";
import { mediaCount } from "./media";
import { adminCount } from "./admins";
import { publishDuePages } from "./website";

/**
 * Everything the dashboard renders, in one round trip.
 *
 * Scheduled content and pages are promoted first, so the counts shown are the counts *after*
 * anything due has gone live — otherwise the dashboard could report a scheduled post that the
 * public site is already serving.
 */
export async function dashboardSnapshot(): Promise<DashboardSnapshot> {
  await publishDueContent();
  await publishDuePages();

  const sql = db();

  const [
    counts,
    recentContent,
    recentAnnouncements,
    recentUpdates,
    upcoming,
    activity,
    media,
    admins,
    pages,
    pendingAi,
    published,
  ] = await Promise.all([
    contentCounts(),
    listContent({ limit: 6, sort: "recent" }),
    listContent({ kind: "announcement", limit: 4, sort: "recent" }),
    listContent({ kind: "update", limit: 5, sort: "recent" }),
    listContent({ status: "scheduled", limit: 5, sort: "recent" }),
    recentActivity(10),
    mediaCount(),
    adminCount(),
    sql<{ count: string }[]>`SELECT count(*)::text AS count FROM cms_pages`,
    sql<{ count: string }[]>`
      SELECT count(*)::text AS count FROM ai_change_requests
      WHERE status IN ('proposed', 'approved')
    `,
    lastPublishedAt(),
  ]);

  const totalFor = (status: string) =>
    counts.filter((row) => row.status === status).reduce((sum, row) => sum + row.count, 0);

  // Seeded with every kind at zero so the dashboard renders a complete grid before any content
  // exists — an absent key would otherwise render as "undefined" in the UI.
  const byKind = Object.fromEntries(
    CONTENT_KINDS.map((kind) => [
      kind,
      {
        published: counts.find((r) => r.kind === kind && r.status === "published")?.count ?? 0,
        drafts: counts.find((r) => r.kind === kind && r.status === "draft")?.count ?? 0,
        scheduled: counts.find((r) => r.kind === kind && r.status === "scheduled")?.count ?? 0,
      },
    ]),
  ) as DashboardSnapshot["byKind"];

  return {
    counts: {
      published: totalFor("published"),
      drafts: totalFor("draft"),
      scheduled: totalFor("scheduled"),
      archived: totalFor("archived"),
      media,
      pages: Number(pages[0]?.count ?? "0"),
      admins,
    },
    byKind,
    recentContent: recentContent.items,
    recentAnnouncements: recentAnnouncements.items,
    recentUpdates: recentUpdates.items,
    upcoming: upcoming.items,
    activity,
    pendingAiReviews: Number(pendingAi[0]?.count ?? "0"),
    site: {
      // Reaching this code at all means the database answered, so the API is healthy.
      apiHealthy: true,
      databaseConfigured: isDatabaseConfigured(),
      mediaStorageConfigured: isMediaStorageConfigured(),
      aiConfigured: isAiConfigured() && isSecretConfigured(),
      lastPublishedAt: published,
    },
  };
}

// ─── Global search ───────────────────────────────────────────────────────────

/**
 * Searches every managed area at once.
 *
 * Each area is queried in parallel and capped individually, so one area with thousands of rows
 * cannot crowd the others out of the result list — a search for "pulse" should surface the page
 * and the section as well as the twenty blog posts.
 *
 * Ranking is by area relevance then recency: content first, because that is what an
 * administrator is usually looking for, and exact title matches ahead of body matches within it.
 */
export async function globalSearch(rawQuery: string, limit = 30): Promise<SearchHit[]> {
  const query = rawQuery.trim();
  if (query.length < 2) return [];

  const sql = db();
  const like = `%${query}%`;
  const perArea = Math.max(4, Math.ceil(limit / 4));

  const [content, pages, sections, media, admins] = await Promise.all([
    sql<
      {
        id: string;
        kind: string;
        title: string;
        slug: string;
        excerpt: string;
        status: string;
        updated_at: Date;
        exact: boolean;
      }[]
    >`
      SELECT id, kind, title, slug, excerpt, status, updated_at,
             (title ILIKE ${like}) AS exact
      FROM content_items
      WHERE title ILIKE ${like}
         OR slug ILIKE ${like}
         OR to_tsvector('english', search_text) @@ websearch_to_tsquery('english', ${query})
      ORDER BY exact DESC, updated_at DESC
      LIMIT ${perArea * 2}
    `,
    sql<
      {
        id: string;
        path: string;
        title: string;
        summary: string;
        status: string;
        updated_at: Date;
      }[]
    >`
      SELECT id, path, title, summary, status, updated_at FROM cms_pages
      WHERE title ILIKE ${like} OR path ILIKE ${like} OR summary ILIKE ${like}
      ORDER BY updated_at DESC LIMIT ${perArea}
    `,
    sql<{ key: string; label: string; group_name: string; status: string; updated_at: Date }[]>`
      SELECT key, label, group_name, status, updated_at FROM site_sections
      WHERE label ILIKE ${like} OR key ILIKE ${like} OR fields::text ILIKE ${like}
      ORDER BY sort_order ASC LIMIT ${perArea}
    `,
    sql<{ id: string; filename: string; alt: string; mime_type: string; created_at: Date }[]>`
      SELECT id, filename, alt, mime_type, created_at FROM media_assets
      WHERE filename ILIKE ${like} OR alt ILIKE ${like}
      ORDER BY created_at DESC LIMIT ${perArea}
    `,
    sql<{ id: string; email: string; name: string; role: string }[]>`
      SELECT id, email, name, role FROM admin_users
      WHERE email ILIKE ${like} OR name ILIKE ${like}
      ORDER BY name ASC LIMIT ${perArea}
    `,
  ]);

  const hits: SearchHit[] = [
    ...content.map((row) => {
      const kind = row.kind as ContentKind;
      const meta = CONTENT_KIND_META[kind];
      return {
        id: row.id,
        type: "content" as const,
        kind: meta?.singular ?? row.kind,
        title: row.title || "(untitled)",
        subtitle: row.excerpt || `/${row.slug}`,
        status: row.status as SearchHit["status"],
        href: `${meta?.route ?? "/admin/content/blog"}/${row.id}`,
        updatedAt: row.updated_at.toISOString(),
      };
    }),
    ...pages.map((row) => ({
      id: row.id,
      type: "page" as const,
      kind: "Page",
      title: row.title,
      subtitle: row.path,
      status: row.status as SearchHit["status"],
      href: `/admin/website/pages/${row.id}`,
      updatedAt: row.updated_at.toISOString(),
    })),
    ...sections.map((row) => ({
      id: row.key,
      type: "section" as const,
      kind: "Section",
      title: row.label,
      subtitle: `${row.group_name} · ${row.key}`,
      status: row.status as SearchHit["status"],
      href: `/admin/website/sections/${encodeURIComponent(row.key)}`,
      updatedAt: row.updated_at.toISOString(),
    })),
    ...media.map((row) => ({
      id: row.id,
      type: "media" as const,
      kind: row.mime_type.startsWith("video/") ? "Video" : "Image",
      title: row.filename,
      subtitle: row.alt || row.mime_type,
      status: null,
      href: `/admin/media?asset=${row.id}`,
      updatedAt: row.created_at.toISOString(),
    })),
    ...admins.map((row) => ({
      id: row.id,
      type: "admin" as const,
      kind: "Administrator",
      title: row.name || row.email,
      subtitle: row.email,
      status: null,
      href: `/admin/administration/admins`,
      updatedAt: null,
    })),
  ];

  return hits.slice(0, limit);
}

/**
 * Content grouped by publishing state, backing the four Publishing views.
 *
 * A single query per state rather than one fetch-everything-and-filter-client-side, so a site
 * with a thousand archived posts does not send them all to render a drafts list.
 */
export async function publishingQueues(): Promise<{
  drafts: ContentSummary[];
  scheduled: ContentSummary[];
  published: ContentSummary[];
  archived: ContentSummary[];
}> {
  await publishDueContent();

  const [drafts, scheduled, published, archived] = await Promise.all([
    listContent({ status: "draft", limit: 100, sort: "recent" }),
    listContent({ status: "scheduled", limit: 100, sort: "recent" }),
    listContent({ status: "published", limit: 100, sort: "published" }),
    listContent({ status: "archived", limit: 100, sort: "recent" }),
  ]);

  return {
    drafts: drafts.items,
    scheduled: scheduled.items,
    published: published.items,
    archived: archived.items,
  };
}
