/**
 * The media library.
 *
 * Rows here are metadata only; the bytes live in object storage (see `../storage.ts`). The two
 * are kept consistent by a deliberate ordering:
 *
 *   1. `presign` — the server validates the type and size, then signs a short-lived PUT.
 *   2. The browser uploads directly to the bucket.
 *   3. `confirm` — the server issues a HEAD against the bucket and only then writes the row.
 *
 * Step 3 is what makes the library trustworthy. Recording the asset at step 1 would leave a
 * phantom row whenever an upload was abandoned or failed, and the reported size would be
 * whatever the client claimed. Reading it back from the bucket means the row reflects the object
 * that actually exists.
 *
 * A failed upload leaves nothing behind but an unreferenced object, which is a far better
 * failure than a library full of broken thumbnails.
 */

import type { MediaAsset } from "../../../src/lib/cms/types";
import { mediaCategoryFor } from "../../../src/lib/cms/types";
import { sanitizeText } from "../../../src/lib/cms/sanitize";
import { db, iso, newId } from "../db";
import { badRequest, notFound } from "../router";
import {
  deleteObject,
  headObject,
  isMediaStorageConfigured,
  presignUpload,
  publicUrlFor,
  validateUpload,
  type PresignedUpload,
} from "../storage";
import type { Actor } from "./content";

interface MediaRow {
  id: string;
  storage_key: string;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: string | number;
  width: number | null;
  height: number | null;
  alt: string;
  folder: string;
  uploaded_by_email: string | null;
  created_at: Date;
}

function mapAsset(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    storageKey: row.storage_key,
    url: row.url,
    filename: row.filename,
    mimeType: row.mime_type,
    // `bigint` comes back as a string from the driver; the UI needs a number to format sizes.
    sizeBytes: Number(row.size_bytes),
    width: row.width,
    height: row.height,
    alt: row.alt,
    folder: row.folder,
    uploadedByEmail: row.uploaded_by_email,
    createdAt: iso(row.created_at),
  };
}

export interface ListMediaQuery {
  search?: string;
  folder?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export async function listMedia(
  query: ListMediaQuery = {},
): Promise<{ assets: MediaAsset[]; total: number; folders: string[] }> {
  const sql = db();
  const limit = Math.min(Math.max(query.limit ?? 60, 1), 200);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim();

  const where = [
    query.folder ? sql`AND folder = ${query.folder}` : sql``,
    search
      ? sql`AND (
            to_tsvector('english', filename || ' ' || alt) @@ websearch_to_tsquery('english', ${search})
            OR filename ILIKE ${`%${search}%`}
            OR alt ILIKE ${`%${search}%`}
          )`
      : sql``,
    // Matching on the MIME prefix keeps the filter working for any subtype we later accept.
    query.category ? sql`AND mime_type LIKE ${`${query.category}/%`}` : sql``,
  ];

  const rows = await sql<MediaRow[]>`
    SELECT id, storage_key, url, filename, mime_type, size_bytes, width, height,
           alt, folder, uploaded_by_email, created_at
    FROM media_assets
    WHERE true ${where[0]} ${where[1]} ${where[2]}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const counted = await sql<{ count: string }[]>`
    SELECT count(*)::text AS count FROM media_assets
    WHERE true ${where[0]} ${where[1]} ${where[2]}
  `;

  const folderRows = await sql<{ folder: string }[]>`
    SELECT DISTINCT folder FROM media_assets WHERE folder <> '' ORDER BY folder ASC LIMIT 100
  `;

  return {
    assets: rows.map(mapAsset),
    total: Number(counted[0]?.count ?? "0"),
    folders: folderRows.map((row) => row.folder),
  };
}

export async function getMedia(id: string): Promise<MediaAsset | null> {
  const rows = await db()<MediaRow[]>`
    SELECT id, storage_key, url, filename, mime_type, size_bytes, width, height,
           alt, folder, uploaded_by_email, created_at
    FROM media_assets WHERE id = ${id}
  `;
  return rows[0] ? mapAsset(rows[0]) : null;
}

/**
 * Validates a requested upload and returns a signed PUT.
 *
 * Nothing is written to the database here — see the note at the top of the module.
 */
export async function requestUpload(input: {
  filename?: unknown;
  mimeType?: unknown;
  sizeBytes?: unknown;
  folder?: unknown;
}): Promise<PresignedUpload> {
  if (!isMediaStorageConfigured()) {
    throw badRequest(
      "Media storage is not configured yet. Connect a Vercel Blob store to this project, add " +
        "the MEDIA_S3_* environment variables, or paste an external image URL instead.",
    );
  }

  const filename = typeof input.filename === "string" ? input.filename.trim() : "";
  const mimeType = typeof input.mimeType === "string" ? input.mimeType.trim() : "";
  const sizeBytes = Number(input.sizeBytes);
  if (!filename) throw badRequest("A filename is required.");

  const validation = validateUpload(mimeType, sizeBytes);
  if (!validation.ok) throw badRequest(validation.error);

  return presignUpload({
    filename,
    mimeType,
    sizeBytes,
    folder: typeof input.folder === "string" ? input.folder : "",
  });
}

/**
 * Records an asset after its bytes have landed.
 *
 * The HEAD request is the gate: if the object is not there, the upload did not succeed and no
 * row is created. The size is taken from the bucket's response rather than from the client.
 */
export async function confirmUpload(
  input: {
    storageKey?: unknown;
    filename?: unknown;
    mimeType?: unknown;
    alt?: unknown;
    folder?: unknown;
    width?: unknown;
    height?: unknown;
  },
  actor: Actor,
): Promise<MediaAsset> {
  const storageKey = typeof input.storageKey === "string" ? input.storageKey : "";
  if (!storageKey) throw badRequest("The upload reference is missing.");

  const head = await headObject(storageKey);
  if (!head.exists) {
    throw badRequest("That upload did not complete. Please try again.");
  }

  const mimeType =
    (typeof input.mimeType === "string" ? input.mimeType : "") ||
    head.mimeType ||
    "application/octet-stream";
  if (!mediaCategoryFor(mimeType)) {
    // The object exists but is not a type we accept; remove it rather than leaving it orphaned.
    await deleteObject(storageKey).catch(() => {});
    throw badRequest(`Unsupported file type "${mimeType}".`);
  }

  const id = newId();
  const width = Number(input.width);
  const height = Number(input.height);

  await db()`
    INSERT INTO media_assets (
      id, storage_key, url, filename, mime_type, size_bytes, width, height,
      alt, folder, uploaded_by_email
    ) VALUES (
      ${id}, ${storageKey}, ${head.url ?? publicUrlFor(storageKey)},
      ${sanitizeText(input.filename, 200) || storageKey.split("/").pop() || "file"},
      ${mimeType}, ${head.sizeBytes},
      ${Number.isFinite(width) && width > 0 ? Math.trunc(width) : null},
      ${Number.isFinite(height) && height > 0 ? Math.trunc(height) : null},
      ${sanitizeText(input.alt, 300)},
      ${sanitizeText(input.folder, 60)},
      ${actor.email}
    )
    ON CONFLICT (storage_key) DO NOTHING
  `;

  const asset = await getMedia(id);
  if (!asset) throw badRequest("That file has already been added to the library.");
  return asset;
}

/**
 * Renames or re-describes an asset.
 *
 * Only the metadata changes. The storage key is immutable, because renaming the object would
 * break every page already referencing its URL — the displayed filename and the stored key are
 * deliberately separate concerns.
 */
export async function updateMedia(
  id: string,
  input: { filename?: unknown; alt?: unknown; folder?: unknown },
  _actor: Actor,
): Promise<MediaAsset> {
  const existing = await getMedia(id);
  if (!existing) throw notFound("That file");

  await db()`
    UPDATE media_assets SET
      filename = ${input.filename === undefined ? existing.filename : sanitizeText(input.filename, 200)},
      alt = ${input.alt === undefined ? existing.alt : sanitizeText(input.alt, 300)},
      folder = ${input.folder === undefined ? existing.folder : sanitizeText(input.folder, 60)}
    WHERE id = ${id}
  `;

  const updated = await getMedia(id);
  if (!updated) throw notFound("That file");
  return updated;
}

/**
 * Deletes an asset and its object.
 *
 * The row goes first. If the bucket delete then fails, the result is an unreferenced object —
 * wasted storage, but nothing broken. The reverse order could leave a row pointing at bytes that
 * no longer exist, which renders as a broken image on the live site.
 */
export async function deleteMedia(id: string): Promise<MediaAsset> {
  const existing = await getMedia(id);
  if (!existing) throw notFound("That file");

  await db()`DELETE FROM media_assets WHERE id = ${id}`;

  try {
    await deleteObject(existing.storageKey);
  } catch (error) {
    console.error(
      `[cms] media row ${id} removed but object ${existing.storageKey} remains:`,
      error,
    );
  }

  return existing;
}

/** Where an asset is used, so a delete can warn before breaking a live page. */
export async function findMediaUsage(url: string): Promise<{ type: string; label: string }[]> {
  const sql = db();
  const usage: { type: string; label: string }[] = [];

  // `body::text` catches the URL wherever it appears in a block document — as an image block,
  // inside a callout, in a table cell — without needing to know the document's shape.
  const content = await sql<{ title: string; kind: string }[]>`
    SELECT title, kind FROM content_items
    WHERE cover_image_url = ${url} OR body::text LIKE ${`%${url}%`} OR seo::text LIKE ${`%${url}%`}
    LIMIT 20
  `;
  for (const row of content) usage.push({ type: row.kind, label: row.title });

  const pages = await sql<{ title: string }[]>`
    SELECT title FROM cms_pages WHERE sections::text LIKE ${`%${url}%`} OR seo::text LIKE ${`%${url}%`}
    LIMIT 20
  `;
  for (const row of pages) usage.push({ type: "page", label: row.title });

  const sections = await sql<{ label: string }[]>`
    SELECT label FROM site_sections WHERE fields::text LIKE ${`%${url}%`} LIMIT 20
  `;
  for (const row of sections) usage.push({ type: "section", label: row.label });

  return usage;
}

export async function mediaCount(): Promise<number> {
  const rows = await db()<{ count: string }[]>`SELECT count(*)::text AS count FROM media_assets`;
  return Number(rows[0]?.count ?? "0");
}
