/**
 * The AI assistant knowledge base.
 *
 * Entries are the facts the PUBLIC chatbot grounds its answers in. Two shapes flow through the
 * same table: a `note` typed by an administrator, and a `pdf` whose text was extracted from an
 * uploaded document (the bytes live in object storage; only the text is stored here).
 *
 * Retrieval — `retrieveForChat` — is native Postgres full-text search over `search_text`, the
 * same mechanism `content_items` and `media_assets` use. This is a deliberate choice over vector
 * embeddings: it needs no extension (managed Postgres may refuse `CREATE EXTENSION vector`), no
 * embedding API call on every write or query, and it is more than adequate for a curated set of
 * company facts. The retrieval function is intentionally the only place the chat handler touches,
 * so a future move to embeddings would change one function, not the widget.
 */

import type {
  KnowledgeEntry,
  KnowledgeSourceKind,
  KnowledgeStatus,
} from "../../../src/lib/cms/types";
import { KNOWLEDGE_MAX_CHARS } from "../../../src/lib/cms/types";
import { sanitizeText, sanitizeMultilineText } from "../../../src/lib/cms/sanitize";
import { db, iso, newId } from "../db";
import { badRequest, notFound } from "../router";
import type { Actor } from "./content";

interface KnowledgeRow {
  id: string;
  title: string;
  body: string;
  source_kind: string;
  source_name: string | null;
  source_url: string | null;
  storage_key: string | null;
  status: string;
  tags: string[];
  created_by_email: string | null;
  updated_by_email: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Columns the API returns. `search_text` is write-only and never selected. */
const COLUMNS = `id, title, body, source_kind, source_name, source_url, storage_key,
  status, tags, created_by_email, updated_by_email, created_at, updated_at`;

function mapEntry(row: KnowledgeRow): KnowledgeEntry {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    sourceKind: row.source_kind as KnowledgeSourceKind,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    status: row.status as KnowledgeStatus,
    tags: row.tags ?? [],
    characters: row.body.length,
    createdByEmail: row.created_by_email,
    updatedByEmail: row.updated_by_email,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
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

/** `search_text` is the haystack for FTS: the title carries weight by being repeated first. */
function buildSearchText(title: string, body: string): string {
  return `${title} ${title} ${body}`.trim();
}

// ─── Reads ─────────────────────────────────────────────────────────────────

export interface ListKnowledgeQuery {
  search?: string;
  status?: KnowledgeStatus;
  limit?: number;
  offset?: number;
}

export async function listKnowledge(
  query: ListKnowledgeQuery = {},
): Promise<{ entries: KnowledgeEntry[]; total: number }> {
  const sql = db();
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim();

  const where = [
    query.status ? sql`AND status = ${query.status}` : sql``,
    search
      ? sql`AND (
            to_tsvector('english', search_text) @@ websearch_to_tsquery('english', ${search})
            OR title ILIKE ${`%${search}%`}
          )`
      : sql``,
  ];

  const rows = await sql<KnowledgeRow[]>`
    SELECT ${sql.unsafe(COLUMNS)} FROM knowledge_entries
    WHERE true ${where[0]} ${where[1]}
    ORDER BY updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const counted = await sql<{ count: string }[]>`
    SELECT count(*)::text AS count FROM knowledge_entries
    WHERE true ${where[0]} ${where[1]}
  `;

  return { entries: rows.map(mapEntry), total: Number(counted[0]?.count ?? "0") };
}

export async function getKnowledge(id: string): Promise<KnowledgeEntry | null> {
  const rows = await db()<KnowledgeRow[]>`
    SELECT ${db().unsafe(COLUMNS)} FROM knowledge_entries WHERE id = ${id}
  `;
  return rows[0] ? mapEntry(rows[0]) : null;
}

/** Count of entries eligible for retrieval, so the UI can warn when the assistant has nothing. */
export async function knowledgeStats(): Promise<{ total: number; active: number }> {
  const rows = await db()<{ total: string; active: string }[]>`
    SELECT count(*)::text AS total,
           count(*) FILTER (WHERE status = 'active')::text AS active
    FROM knowledge_entries
  `;
  return { total: Number(rows[0]?.total ?? "0"), active: Number(rows[0]?.active ?? "0") };
}

// ─── Writes ────────────────────────────────────────────────────────────────

export interface CreateKnowledgeInput {
  title?: unknown;
  body?: unknown;
  sourceKind?: KnowledgeSourceKind;
  sourceName?: string | null;
  sourceUrl?: string | null;
  storageKey?: string | null;
  tags?: unknown;
  status?: unknown;
}

function cleanStatus(value: unknown, fallback: KnowledgeStatus): KnowledgeStatus {
  return value === "active" || value === "disabled" ? value : fallback;
}

export async function createKnowledge(
  input: CreateKnowledgeInput,
  actor: Actor,
): Promise<KnowledgeEntry> {
  const title = sanitizeText(input.title, 200);
  const body = sanitizeMultilineText(input.body, KNOWLEDGE_MAX_CHARS);

  // A note needs something to teach; a PDF entry can carry an empty body only if extraction
  // genuinely produced nothing, which the ingest route rejects before reaching here.
  if (!title && !body) {
    throw badRequest("A knowledge entry needs a title or some text.");
  }

  const sql = db();
  const id = newId();
  const rows = await sql<KnowledgeRow[]>`
    INSERT INTO knowledge_entries (
      id, title, body, source_kind, source_name, source_url, storage_key,
      status, tags, search_text, created_by_email, updated_by_email
    ) VALUES (
      ${id}, ${title}, ${body}, ${input.sourceKind ?? "note"},
      ${input.sourceName ?? null}, ${input.sourceUrl ?? null}, ${input.storageKey ?? null},
      ${cleanStatus(input.status, "active")}, ${sanitizeTags(input.tags)},
      ${buildSearchText(title, body)}, ${actor.email}, ${actor.email}
    )
    RETURNING ${sql.unsafe(COLUMNS)}
  `;
  return mapEntry(rows[0]);
}

export interface UpdateKnowledgeInput {
  title?: unknown;
  body?: unknown;
  tags?: unknown;
  status?: unknown;
}

export async function updateKnowledge(
  id: string,
  input: UpdateKnowledgeInput,
  actor: Actor,
): Promise<KnowledgeEntry> {
  const existing = await getKnowledge(id);
  if (!existing) throw notFound("That knowledge entry");

  const title = input.title === undefined ? existing.title : sanitizeText(input.title, 200);
  const body =
    input.body === undefined
      ? existing.body
      : sanitizeMultilineText(input.body, KNOWLEDGE_MAX_CHARS);
  const tags = input.tags === undefined ? existing.tags : sanitizeTags(input.tags);
  const status =
    input.status === undefined ? existing.status : cleanStatus(input.status, existing.status);

  if (!title && !body) {
    throw badRequest("A knowledge entry needs a title or some text.");
  }

  const sql = db();
  const rows = await sql<KnowledgeRow[]>`
    UPDATE knowledge_entries SET
      title = ${title},
      body = ${body},
      tags = ${tags},
      status = ${status},
      search_text = ${buildSearchText(title, body)},
      updated_by_email = ${actor.email},
      updated_at = now()
    WHERE id = ${id}
    RETURNING ${sql.unsafe(COLUMNS)}
  `;
  return mapEntry(rows[0]);
}

/**
 * Deletes an entry, returning it along with the storage key of any document it owned.
 *
 * The key is surfaced so the caller can remove the orphaned object from storage; it is not part
 * of the public `KnowledgeEntry` shape because nothing else needs it.
 */
export async function deleteKnowledge(
  id: string,
): Promise<{ entry: KnowledgeEntry; storageKey: string | null }> {
  const rows = await db()<KnowledgeRow[]>`
    DELETE FROM knowledge_entries WHERE id = ${id}
    RETURNING ${db().unsafe(COLUMNS)}
  `;
  if (!rows[0]) throw notFound("That knowledge entry");
  return { entry: mapEntry(rows[0]), storageKey: rows[0].storage_key };
}

// ─── Retrieval for the public chatbot ────────────────────────────────────────

/** Per-entry cap when assembling chat context, so one long PDF cannot crowd out the rest. */
const CHAT_ENTRY_CHARS = 1_200;

export interface KnowledgeContext {
  title: string;
  body: string;
}

/**
 * Selects the entries most relevant to a chat turn.
 *
 * Full-text ranked matches come first. When the turn has no lexical overlap with anything — a
 * bare "hello", or a question phrased in words the notes do not use — it falls back to the most
 * recently updated active entries, so the assistant is still working from curated facts rather
 * than the static prompt alone. Every returned body is trimmed to a budget.
 *
 * Never throws for a caller: retrieval failing must not take the chat widget down, so the chat
 * handler wraps this, but the query itself is written to degrade to an empty list.
 */
export async function retrieveForChat(query: string, limit = 6): Promise<KnowledgeContext[]> {
  const sql = db();
  const q = query.trim().slice(0, 400);
  const cap = Math.min(Math.max(limit, 1), 12);

  const ranked = q
    ? await sql<{ title: string; body: string }[]>`
        SELECT title, body
        FROM knowledge_entries
        WHERE status = 'active'
          AND to_tsvector('english', search_text) @@ websearch_to_tsquery('english', ${q})
        ORDER BY ts_rank(to_tsvector('english', search_text), websearch_to_tsquery('english', ${q})) DESC,
                 updated_at DESC
        LIMIT ${cap}
      `
    : [];

  const rows =
    ranked.length > 0
      ? ranked
      : await sql<{ title: string; body: string }[]>`
          SELECT title, body FROM knowledge_entries
          WHERE status = 'active'
          ORDER BY updated_at DESC
          LIMIT ${cap}
        `;

  return rows.map((row) => ({
    title: row.title,
    body: row.body.length > CHAT_ENTRY_CHARS ? `${row.body.slice(0, CHAT_ENTRY_CHARS)}…` : row.body,
  }));
}
