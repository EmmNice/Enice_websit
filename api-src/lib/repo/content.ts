/**
 * Storage and the publishing workflow for editorial content — blog, announcements, updates
 * and news.
 *
 * ## Scheduling without a scheduler
 *
 * A scheduled item becomes published by `publishDueContent()`, a single `UPDATE` run at the top
 * of every read. There is no cron job and no queue.
 *
 * That is a deliberate choice. A cron-driven publisher has a failure mode that matters: if the
 * tick is missed — the platform's scheduler is degraded, the deployment is mid-rollout — the
 * post silently stays hidden, and nobody finds out until someone asks why the announcement
 * never went live. Resolving on read means the item goes live the first time *anything* looks at
 * the collection, so the worst case is publication a moment late rather than not at all.
 *
 * The cost is one cheap `UPDATE` per read, which the `content_items_due_idx` partial index
 * reduces to an index scan over just the rows still waiting.
 *
 * ## Revisions
 *
 * Every save snapshots the *previous* state into `content_revisions` before overwriting. That
 * ordering matters: snapshotting the new state would make "revert" mean "reapply what I just
 * did". Reverting is itself a normal save, so it too is snapshotted and can be undone.
 */

import type {
  ContentAuthor,
  ContentExtras,
  ContentItem,
  ContentKind,
  ContentStatus,
  ContentSummary,
  SeoFields,
} from "../../../src/lib/cms/types";
import { CONTENT_KINDS, CONTENT_STATUSES } from "../../../src/lib/cms/types";
import {
  deriveExcerpt,
  firstImageUrl,
  docToPlainText,
  readingMinutes,
  sanitizeDoc,
  slugify,
  type EniceDoc,
} from "../../../src/lib/cms/doc";
import { sanitizeMultilineText, sanitizeText, sanitizeUrl } from "../../../src/lib/cms/sanitize";
import { db, isoOrNull, iso, json, newId, parseDate } from "../db";
import { badRequest, conflict, notFound } from "../router";

// ─── Row shape ───────────────────────────────────────────────────────────────

interface ContentRow {
  id: string;
  kind: string;
  status: string;
  title: string;
  slug: string;
  excerpt: string;
  body: unknown;
  cover_image_url: string | null;
  author: ContentAuthor | null;
  category: string | null;
  tags: string[] | null;
  seo: SeoFields | null;
  extras: ContentExtras | null;
  reading_minutes: number;
  published_at: Date | null;
  scheduled_for: Date | null;
  archived_at: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by_email: string | null;
  updated_by_email: string | null;
  revision: number;
}

/** Columns for a full read. `search_text` is write-only, so it is never selected. */
const FULL_COLUMNS = `
  id, kind, status, title, slug, excerpt, body, cover_image_url, author, category, tags,
  seo, extras, reading_minutes, published_at, scheduled_for, archived_at,
  created_at, updated_at, created_by_email, updated_by_email, revision
`;

/** Columns for listings — everything except `body`, which dominates the payload size. */
const SUMMARY_COLUMNS = `
  id, kind, status, title, slug, excerpt, cover_image_url, author, category, tags,
  seo, extras, reading_minutes, published_at, scheduled_for, updated_at, updated_by_email
`;

function toKind(value: string): ContentKind {
  return (CONTENT_KINDS as readonly string[]).includes(value) ? (value as ContentKind) : "blog";
}

function toStatus(value: string): ContentStatus {
  return (CONTENT_STATUSES as readonly string[]).includes(value)
    ? (value as ContentStatus)
    : "draft";
}

function mapItem(row: ContentRow): ContentItem {
  return {
    id: row.id,
    kind: toKind(row.kind),
    status: toStatus(row.status),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    coverImageUrl: row.cover_image_url,
    author: row.author,
    category: row.category,
    tags: row.tags ?? [],
    seo: row.seo ?? {},
    extras: row.extras ?? {},
    publishedAt: isoOrNull(row.published_at),
    scheduledFor: isoOrNull(row.scheduled_for),
    archivedAt: isoOrNull(row.archived_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    createdByEmail: row.created_by_email,
    updatedByEmail: row.updated_by_email,
    revision: row.revision,
  };
}

function mapSummary(
  row: Omit<ContentRow, "body" | "archived_at" | "created_at" | "created_by_email" | "revision">,
): ContentSummary {
  return {
    id: row.id,
    kind: toKind(row.kind),
    status: toStatus(row.status),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    category: row.category,
    tags: row.tags ?? [],
    author: row.author,
    seo: row.seo ?? {},
    extras: row.extras ?? {},
    publishedAt: isoOrNull(row.published_at),
    scheduledFor: isoOrNull(row.scheduled_for),
    updatedAt: iso(row.updated_at),
    updatedByEmail: row.updated_by_email,
    readingMinutes: row.reading_minutes,
  };
}

// ─── Scheduling ──────────────────────────────────────────────────────────────

/**
 * Promotes every scheduled item whose time has come.
 *
 * Idempotent and safe to call concurrently: the `WHERE` clause only ever matches rows still in
 * `scheduled`, so two simultaneous callers cannot double-publish or clobber a timestamp.
 * `published_at` is coalesced so an item that was previously live keeps its original
 * publication date through an unpublish-and-reschedule cycle.
 */
export async function publishDueContent(): Promise<string[]> {
  const rows = await db()<{ id: string; title: string; kind: string }[]>`
    UPDATE content_items
    SET status = 'published',
        published_at = COALESCE(published_at, scheduled_for, now()),
        scheduled_for = NULL,
        updated_at = now()
    WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now()
    RETURNING id, title, kind
  `;
  if (rows.length > 0) {
    console.log(`[cms] auto-published ${rows.length} scheduled item(s)`);
  }
  return rows.map((row) => row.id);
}

// ─── Slugs ───────────────────────────────────────────────────────────────────

export async function isSlugAvailable(
  kind: ContentKind,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const sql = db();
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM content_items
    WHERE kind = ${kind} AND slug = ${slug}
      ${excludeId ? sql`AND id <> ${excludeId}` : sql``}
    LIMIT 1
  `;
  return rows.length === 0;
}

/**
 * Finds a free slug, appending `-2`, `-3`, … when needed.
 *
 * Used when creating and duplicating, so an author is never blocked by a collision they cannot
 * see. An explicit slug typed by a user is *not* silently changed — that path reports a conflict
 * instead, because quietly altering a URL someone chose is worse than refusing it.
 */
export async function uniqueSlug(
  kind: ContentKind,
  desired: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(desired) || "untitled";
  if (await isSlugAvailable(kind, base, excludeId)) return base;

  for (let suffix = 2; suffix <= 50; suffix++) {
    const candidate = `${base}-${suffix}`;
    if (await isSlugAvailable(kind, candidate, excludeId)) return candidate;
  }
  // Pathological case only: fall back to something guaranteed unique.
  return `${base}-${Date.now().toString(36)}`;
}

// ─── Input normalisation ─────────────────────────────────────────────────────

export interface ContentInput {
  kind?: ContentKind;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: unknown;
  coverImageUrl?: string | null;
  author?: ContentAuthor | null;
  category?: string | null;
  tags?: string[];
  seo?: SeoFields;
  extras?: ContentExtras;
  status?: ContentStatus;
  scheduledFor?: string | null;
}

function sanitizeAuthor(value: unknown): ContentAuthor | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const name = sanitizeText(source.name, 120);
  if (!name) return null;
  return {
    name,
    role: sanitizeText(source.role, 120) || undefined,
    avatarUrl: sanitizeUrl(source.avatarUrl) ?? undefined,
  };
}

function sanitizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const entry of value.slice(0, 30)) {
    const tag = sanitizeText(entry, 40);
    if (tag) seen.add(tag);
  }
  return [...seen];
}

function sanitizeSeo(value: unknown): SeoFields {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  return {
    title: sanitizeText(source.title, 200) || undefined,
    description: sanitizeMultilineText(source.description, 400) || undefined,
    canonicalUrl: sanitizeUrl(source.canonicalUrl) ?? undefined,
    ogTitle: sanitizeText(source.ogTitle, 200) || undefined,
    ogDescription: sanitizeMultilineText(source.ogDescription, 400) || undefined,
    ogImage: sanitizeUrl(source.ogImage) ?? undefined,
    index: source.index === false ? false : undefined,
  };
}

function sanitizeExtras(value: unknown): ContentExtras {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  const extras: ContentExtras = {};

  const ctaSource = source.cta;
  if (ctaSource && typeof ctaSource === "object") {
    const cta = ctaSource as Record<string, unknown>;
    const label = sanitizeText(cta.label, 80);
    const url = sanitizeUrl(cta.url);
    // A button with only half its configuration would render as a dead control.
    if (label && url) extras.cta = { label, url };
  }

  const startsAt = parseDate(source.startsAt);
  const endsAt = parseDate(source.endsAt);
  if (startsAt) extras.startsAt = startsAt.toISOString();
  if (endsAt) extras.endsAt = endsAt.toISOString();
  if (source.featured === true) extras.featured = true;
  const icon = sanitizeText(source.icon, 40);
  if (icon) extras.icon = icon;

  return extras;
}

/**
 * Reduces a request payload to a storable record.
 *
 * Nothing is trusted: every field is re-derived from the input through the sanitisers, and the
 * body goes through `sanitizeDoc`, which reconstructs the document rather than validating it in
 * place. Excerpt, cover image and reading time fall back to values derived from the body, so a
 * post saved with only a title and some prose is still complete enough to render a card.
 */
function normalizeInput(input: ContentInput, existing?: ContentItem) {
  const body: EniceDoc = sanitizeDoc(input.body ?? existing?.body ?? { version: 1, blocks: [] });
  const title = sanitizeText(input.title ?? existing?.title ?? "", 250);

  const explicitExcerpt = sanitizeMultilineText(input.excerpt ?? existing?.excerpt ?? "", 500);
  const excerpt = explicitExcerpt || deriveExcerpt(body);

  const coverFromInput =
    input.coverImageUrl === null
      ? null
      : (sanitizeUrl(input.coverImageUrl) ?? existing?.coverImageUrl ?? null);

  return {
    title,
    excerpt,
    body,
    coverImageUrl: coverFromInput ?? firstImageUrl(body),
    author: input.author === undefined ? (existing?.author ?? null) : sanitizeAuthor(input.author),
    category:
      input.category === undefined
        ? (existing?.category ?? null)
        : sanitizeText(input.category, 60) || null,
    tags: input.tags === undefined ? (existing?.tags ?? []) : sanitizeTags(input.tags),
    seo: input.seo === undefined ? (existing?.seo ?? {}) : sanitizeSeo(input.seo),
    extras: input.extras === undefined ? (existing?.extras ?? {}) : sanitizeExtras(input.extras),
    readingMinutes: readingMinutes(body),
    // Everything an administrator might search for, flattened into one indexed column.
    searchText: [
      title,
      excerpt,
      docToPlainText(body),
      input.category ?? "",
      (input.tags ?? []).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 100_000),
  };
}

// ─── Reads ───────────────────────────────────────────────────────────────────

export interface ListContentQuery {
  kind?: ContentKind;
  status?: ContentStatus;
  /** Several statuses at once, for the Publishing views. */
  statuses?: ContentStatus[];
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sort?: "recent" | "published" | "title";
}

/**
 * Lists content with filters, newest-updated first by default.
 *
 * Full-text search uses `websearch_to_tsquery`, which accepts what a person actually types —
 * quoted phrases, `or`, a leading `-` to exclude — and, unlike `to_tsquery`, does not throw a
 * syntax error on unbalanced input. A `LIKE` prefix match on the title runs alongside it so
 * partial words still match, which stemming alone would miss.
 */
export async function listContent(
  query: ListContentQuery = {},
): Promise<{ items: ContentSummary[]; total: number }> {
  await publishDueContent();

  const sql = db();
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim();

  const where = [
    query.kind ? sql`AND kind = ${query.kind}` : sql``,
    query.status ? sql`AND status = ${query.status}` : sql``,
    query.statuses?.length ? sql`AND status = ANY(${sql.array(query.statuses)})` : sql``,
    query.category ? sql`AND category = ${query.category}` : sql``,
    query.tag ? sql`AND ${query.tag} = ANY(tags)` : sql``,
    query.featured ? sql`AND extras->>'featured' = 'true'` : sql``,
    search
      ? sql`AND (
            to_tsvector('english', search_text) @@ websearch_to_tsquery('english', ${search})
            OR title ILIKE ${`%${search}%`}
          )`
      : sql``,
  ];

  const order =
    query.sort === "title"
      ? sql`ORDER BY title ASC`
      : query.sort === "published"
        ? sql`ORDER BY published_at DESC NULLS LAST, updated_at DESC`
        : sql`ORDER BY updated_at DESC`;

  const rows = await sql<ContentRow[]>`
    SELECT ${sql.unsafe(SUMMARY_COLUMNS)}
    FROM content_items
    WHERE true ${where[0]} ${where[1]} ${where[2]} ${where[3]} ${where[4]} ${where[5]} ${where[6]}
    ${order}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const counted = await sql<{ count: string }[]>`
    SELECT count(*)::text AS count
    FROM content_items
    WHERE true ${where[0]} ${where[1]} ${where[2]} ${where[3]} ${where[4]} ${where[5]} ${where[6]}
  `;

  return { items: rows.map(mapSummary), total: Number(counted[0]?.count ?? "0") };
}

export async function getContent(id: string): Promise<ContentItem | null> {
  const sql = db();
  const rows = await sql<ContentRow[]>`
    SELECT ${sql.unsafe(FULL_COLUMNS)} FROM content_items WHERE id = ${id}
  `;
  return rows[0] ? mapItem(rows[0]) : null;
}

/**
 * Fetches by slug for the public site.
 *
 * `publishedOnly` is the switch that makes preview work: the admin panel reads with it off to
 * render a draft exactly as it will appear, while the public route reads with it on. Because
 * both go through this one function, a preview cannot drift from the published rendering.
 */
export async function getContentBySlug(
  kind: ContentKind,
  slug: string,
  publishedOnly = true,
): Promise<ContentItem | null> {
  if (publishedOnly) await publishDueContent();

  const sql = db();
  const rows = await sql<ContentRow[]>`
    SELECT ${sql.unsafe(FULL_COLUMNS)} FROM content_items
    WHERE kind = ${kind} AND slug = ${slug}
      ${publishedOnly ? sql`AND status = 'published'` : sql``}
    LIMIT 1
  `;
  return rows[0] ? mapItem(rows[0]) : null;
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export interface Actor {
  id: string;
  email: string;
}

export async function createContent(
  kind: ContentKind,
  input: ContentInput,
  actor: Actor,
): Promise<ContentItem> {
  const normalized = normalizeInput(input);
  if (!normalized.title) throw badRequest("A title is required.");

  const sql = db();
  const id = newId();

  // An explicit slug is honoured or refused; a derived one is made unique automatically.
  const requestedSlug = input.slug?.trim();
  const slug = requestedSlug ? slugify(requestedSlug) : await uniqueSlug(kind, normalized.title);
  if (requestedSlug && !(await isSlugAvailable(kind, slug))) {
    throw conflict(`The URL "${slug}" is already used by another ${kind} entry.`);
  }

  await sql`
    INSERT INTO content_items (
      id, kind, status, title, slug, excerpt, body, cover_image_url, author, category, tags,
      seo, extras, reading_minutes, search_text,
      created_by, updated_by, created_by_email, updated_by_email
    ) VALUES (
      ${id}, ${kind}, ${"draft"}, ${normalized.title}, ${slug}, ${normalized.excerpt},
      ${json(normalized.body)}, ${normalized.coverImageUrl}, ${json(normalized.author)},
      ${normalized.category}, ${sql.array(normalized.tags)}, ${json(normalized.seo)},
      ${json(normalized.extras)}, ${normalized.readingMinutes}, ${normalized.searchText},
      ${actor.id}, ${actor.id}, ${actor.email}, ${actor.email}
    )
  `;

  await recordTaxonomies(kind, normalized.category, normalized.tags);

  const created = await getContent(id);
  if (!created) throw new Error("Content disappeared immediately after insert.");
  return created;
}

/**
 * Updates an item, snapshotting the previous state first.
 *
 * `expectedRevision` provides optimistic concurrency. Two administrators editing the same post
 * would otherwise have the slower save silently discard the faster one; instead the second gets
 * a 409 and can reload. It is optional so that programmatic callers — the AI manager, the
 * scheduler — are not forced to invent a revision number.
 */
export async function updateContent(
  id: string,
  input: ContentInput,
  actor: Actor,
  expectedRevision?: number,
): Promise<ContentItem> {
  const existing = await getContent(id);
  if (!existing) throw notFound("That content");

  if (expectedRevision !== undefined && expectedRevision !== existing.revision) {
    throw conflict(
      "Someone else saved this while you were editing. Reload to see their changes before saving again.",
    );
  }

  const normalized = normalizeInput(input, existing);
  if (!normalized.title) throw badRequest("A title is required.");

  const sql = db();

  let slug = existing.slug;
  const requestedSlug = input.slug?.trim();
  if (requestedSlug) {
    const candidate = slugify(requestedSlug);
    if (candidate !== existing.slug) {
      if (!(await isSlugAvailable(existing.kind, candidate, id))) {
        throw conflict(`The URL "${candidate}" is already used by another ${existing.kind} entry.`);
      }
      slug = candidate;
    }
  }

  await snapshotRevision(existing, actor.email, "Before edit");

  await sql`
    UPDATE content_items SET
      title = ${normalized.title},
      slug = ${slug},
      excerpt = ${normalized.excerpt},
      body = ${json(normalized.body)},
      cover_image_url = ${normalized.coverImageUrl},
      author = ${json(normalized.author)},
      category = ${normalized.category},
      tags = ${sql.array(normalized.tags)},
      seo = ${json(normalized.seo)},
      extras = ${json(normalized.extras)},
      reading_minutes = ${normalized.readingMinutes},
      search_text = ${normalized.searchText},
      updated_at = now(),
      updated_by = ${actor.id},
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE id = ${id}
  `;

  await recordTaxonomies(existing.kind, normalized.category, normalized.tags);

  const updated = await getContent(id);
  if (!updated) throw notFound("That content");
  return updated;
}

/**
 * Moves an item through the publishing workflow.
 *
 * Each timestamp column is set from the target state rather than patched incrementally, so a
 * sequence like publish → archive → draft → publish leaves consistent dates instead of
 * accumulating stale ones. `published_at` is preserved once set, because the date a post first
 * went live is a fact about it, not a reflection of its current state.
 */
export async function transitionContent(
  id: string,
  status: ContentStatus,
  scheduledFor: string | null,
  actor: Actor,
): Promise<ContentItem> {
  const existing = await getContent(id);
  if (!existing) throw notFound("That content");

  if (status === "scheduled") {
    const when = parseDate(scheduledFor);
    if (!when) throw badRequest("Choose the date and time this should publish.");
    if (when.getTime() < Date.now() - 60_000) {
      throw badRequest("Choose a time in the future, or publish immediately instead.");
    }
    if (!existing.title.trim()) throw badRequest("Add a title before scheduling.");
  }

  if (status === "published" && !existing.title.trim()) {
    throw badRequest("Add a title before publishing.");
  }

  const sql = db();
  const when = status === "scheduled" ? parseDate(scheduledFor) : null;

  await sql`
    UPDATE content_items SET
      status = ${status},
      published_at = ${
        status === "published"
          ? sql`COALESCE(published_at, now())`
          : status === "archived"
            ? sql`published_at`
            : status === "draft"
              ? sql`published_at`
              : sql`published_at`
      },
      scheduled_for = ${when},
      archived_at = ${status === "archived" ? sql`now()` : sql`NULL`},
      updated_at = now(),
      updated_by = ${actor.id},
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE id = ${id}
  `;

  const updated = await getContent(id);
  if (!updated) throw notFound("That content");
  return updated;
}

/**
 * Copies an item as a fresh draft.
 *
 * The copy never inherits `published_at`, `scheduled_for` or its source's status — duplicating a
 * live post must not put a second copy of it on the website.
 */
export async function duplicateContent(id: string, actor: Actor): Promise<ContentItem> {
  const existing = await getContent(id);
  if (!existing) throw notFound("That content");

  return createContent(
    existing.kind,
    {
      title: `${existing.title} (copy)`,
      slug: await uniqueSlug(existing.kind, `${existing.slug}-copy`),
      excerpt: existing.excerpt,
      body: existing.body,
      coverImageUrl: existing.coverImageUrl,
      author: existing.author,
      category: existing.category,
      tags: existing.tags,
      // The canonical URL is intentionally dropped: inheriting it would point the copy's
      // canonical tag at the original and tell search engines to ignore the new page.
      seo: { ...existing.seo, canonicalUrl: undefined },
      extras: existing.extras,
    },
    actor,
  );
}

export async function deleteContent(id: string): Promise<ContentItem> {
  const existing = await getContent(id);
  if (!existing) throw notFound("That content");
  // Revisions cascade via the foreign key.
  await db()`DELETE FROM content_items WHERE id = ${id}`;
  return existing;
}

// ─── Revisions ───────────────────────────────────────────────────────────────

async function snapshotRevision(item: ContentItem, byEmail: string, note: string): Promise<void> {
  await db()`
    INSERT INTO content_revisions (id, content_id, revision, snapshot, note, created_by_email)
    VALUES (${newId()}, ${item.id}, ${item.revision}, ${json(item)}, ${note}, ${byEmail})
    ON CONFLICT (content_id, revision) DO NOTHING
  `;
}

export interface RevisionSummary {
  id: string;
  revision: number;
  note: string;
  createdAt: string;
  createdByEmail: string | null;
  title: string;
}

export async function listRevisions(contentId: string): Promise<RevisionSummary[]> {
  const rows = await db()<
    {
      id: string;
      revision: number;
      note: string;
      created_at: Date;
      created_by_email: string | null;
      snapshot: { title?: string };
    }[]
  >`
    SELECT id, revision, note, created_at, created_by_email, snapshot
    FROM content_revisions
    WHERE content_id = ${contentId}
    ORDER BY revision DESC
    LIMIT 50
  `;

  return rows.map((row) => ({
    id: row.id,
    revision: row.revision,
    note: row.note,
    createdAt: iso(row.created_at),
    createdByEmail: row.created_by_email,
    title: row.snapshot?.title ?? "(untitled)",
  }));
}

/**
 * Restores a past revision.
 *
 * Implemented as an ordinary update, which means the state being replaced is itself snapshotted
 * — so an accidental revert is recoverable. The item's status is deliberately not restored: a
 * revert changes content, not whether the page is live.
 */
export async function revertToRevision(
  contentId: string,
  revision: number,
  actor: Actor,
): Promise<ContentItem> {
  const rows = await db()<{ snapshot: ContentItem }[]>`
    SELECT snapshot FROM content_revisions
    WHERE content_id = ${contentId} AND revision = ${revision}
  `;
  const snapshot = rows[0]?.snapshot;
  if (!snapshot) throw notFound("That revision");

  return updateContent(
    contentId,
    {
      title: snapshot.title,
      excerpt: snapshot.excerpt,
      body: snapshot.body,
      coverImageUrl: snapshot.coverImageUrl,
      author: snapshot.author,
      category: snapshot.category,
      tags: snapshot.tags,
      seo: snapshot.seo,
      extras: snapshot.extras,
    },
    actor,
  );
}

// ─── Taxonomies ──────────────────────────────────────────────────────────────

/**
 * Records categories and tags as they are used.
 *
 * The list of available categories is therefore whatever authors have actually typed, so adding
 * one never needs a deploy. `usage_count` drives ordering, which surfaces the tags a team really
 * uses ahead of one-offs.
 */
async function recordTaxonomies(
  kind: ContentKind,
  category: string | null,
  tags: string[],
): Promise<void> {
  const sql = db();
  const entries: { taxonomy: string; name: string }[] = [
    ...(category ? [{ taxonomy: "category", name: category }] : []),
    ...tags.map((tag) => ({ taxonomy: "tag", name: tag })),
  ];

  for (const entry of entries) {
    const slug = slugify(entry.name);
    if (!slug) continue;
    await sql`
      INSERT INTO content_taxonomies (id, kind, taxonomy, name, slug, usage_count)
      VALUES (${newId()}, ${kind}, ${entry.taxonomy}, ${entry.name}, ${slug}, 1)
      ON CONFLICT (kind, taxonomy, slug)
      DO UPDATE SET usage_count = content_taxonomies.usage_count + 1, name = EXCLUDED.name
    `;
  }
}

export async function listTaxonomies(
  kind?: ContentKind,
): Promise<{ categories: string[]; tags: string[] }> {
  const sql = db();
  const rows = await sql<{ taxonomy: string; name: string }[]>`
    SELECT taxonomy, name FROM content_taxonomies
    WHERE true ${kind ? sql`AND kind = ${kind}` : sql``}
    ORDER BY usage_count DESC, name ASC
    LIMIT 300
  `;

  return {
    categories: rows.filter((row) => row.taxonomy === "category").map((row) => row.name),
    tags: rows.filter((row) => row.taxonomy === "tag").map((row) => row.name),
  };
}

// ─── Aggregates ──────────────────────────────────────────────────────────────

/** Counts per status per kind, for the dashboard and the sidebar badges. */
export async function contentCounts(): Promise<{ kind: string; status: string; count: number }[]> {
  const rows = await db()<{ kind: string; status: string; count: string }[]>`
    SELECT kind, status, count(*)::text AS count FROM content_items GROUP BY kind, status
  `;
  return rows.map((row) => ({ kind: row.kind, status: row.status, count: Number(row.count) }));
}

export async function lastPublishedAt(): Promise<string | null> {
  const rows = await db()<{ published_at: Date | null }[]>`
    SELECT published_at FROM content_items
    WHERE status = 'published' AND published_at IS NOT NULL
    ORDER BY published_at DESC LIMIT 1
  `;
  return isoOrNull(rows[0]?.published_at ?? null);
}
