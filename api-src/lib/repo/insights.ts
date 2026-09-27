/**
 * Cross-cutting reads: the dashboard snapshot and global search.
 *
 * Both exist to answer a question that spans every content type at once, which is why they live
 * apart from the per-entity repositories rather than being assembled by the client.
 *
 * The dashboard is deliberately **one request**. Letting the admin panel fetch counts, recent
 * items, upcoming posts and activity separately would mean eight round trips on every load, and
 * the numbers could disagree with each other because they were read at different moments.
 *
 * ## Scope
 *
 * This module used to reach into media, pages, administrators and the AI change queue, which made
 * it the most coupled file in the API — it imported from six other modules purely to fill in
 * dashboard tiles. The Website Manager is now a publishing tool: content and assistant knowledge.
 * Keeping those reads after their screens were removed would have meant `GET /dashboard` querying
 * tables nothing can edit, and it is what forced `storage` and `ai-manager` to stay in the bundle.
 */

import type { ContentKind, DashboardSnapshot, SearchHit } from "../../../src/lib/cms/types";
import { CONTENT_KIND_META, CONTENT_KINDS } from "../../../src/lib/cms/types";
import { isDatabaseConfigured, db } from "../db";
import { recentActivity } from "../audit";
import { contentCounts, lastPublishedAt, listContent, publishDueContent } from "./content";
import { knowledgeStats } from "./knowledge";

/**
 * Everything the dashboard renders, in one round trip.
 *
 * Scheduled content is promoted first, so the counts shown are the counts *after* anything due has
 * gone live — otherwise the dashboard could report a scheduled post that the public site is
 * already serving.
 */
export async function dashboardSnapshot(): Promise<DashboardSnapshot> {
  await publishDueContent();

  const [
    counts,
    recentContent,
    recentAnnouncements,
    recentUpdates,
    upcoming,
    activity,
    knowledge,
    published,
  ] = await Promise.all([
    contentCounts(),
    listContent({ limit: 6, sort: "recent" }),
    listContent({ kind: "announcement", limit: 4, sort: "recent" }),
    listContent({ kind: "update", limit: 5, sort: "recent" }),
    listContent({ status: "scheduled", limit: 5, sort: "recent" }),
    recentActivity(10),
    knowledgeStats(),
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
      knowledge: knowledge.active,
    },
    byKind,
    recentContent: recentContent.items,
    recentAnnouncements: recentAnnouncements.items,
    recentUpdates: recentUpdates.items,
    upcoming: upcoming.items,
    activity,
    site: {
      // Reaching this code at all means the database answered, so the API is healthy.
      apiHealthy: true,
      databaseConfigured: isDatabaseConfigured(),
      lastPublishedAt: published,
    },
  };
}

// ─── Global search ───────────────────────────────────────────────────────────

/**
 * Searches content and assistant knowledge — the two things the manager owns.
 *
 * Each area is queried in parallel and capped individually, so one area with thousands of rows
 * cannot crowd the other out of the result list.
 *
 * Ranking is by area relevance then recency: content first, because that is what an administrator
 * is usually looking for, and exact title matches ahead of body matches within it.
 */
export async function globalSearch(rawQuery: string, limit = 30): Promise<SearchHit[]> {
  const query = rawQuery.trim();
  if (query.length < 2) return [];

  const sql = db();
  const like = `%${query}%`;
  const perArea = Math.max(6, Math.ceil(limit / 2));

  const [content, knowledge] = await Promise.all([
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
      LIMIT ${perArea}
    `,
    sql<{ id: string; title: string; tags: string[]; updated_at: Date }[]>`
      SELECT id, title, tags, updated_at FROM knowledge_entries
      WHERE title ILIKE ${like} OR body ILIKE ${like}
      ORDER BY updated_at DESC LIMIT ${perArea}
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
    ...knowledge.map((row) => ({
      id: row.id,
      type: "knowledge" as const,
      kind: "Knowledge",
      title: row.title || "(untitled)",
      subtitle: row.tags?.length ? row.tags.join(" · ") : "Assistant knowledge",
      status: null,
      href: "/admin/knowledge",
      updatedAt: row.updated_at.toISOString(),
    })),
  ];

  return hits.slice(0, limit);
}
