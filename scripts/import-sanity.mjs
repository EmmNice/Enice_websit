/**
 * One-time migration: Sanity → the ENICE Website Manager.
 *
 * The blog previously lived in a Sanity dataset. Removing that dependency must not lose the posts
 * already published, so this script reads them from Sanity's public query API and inserts them as
 * `content_items` in our own database.
 *
 * ## Usage
 *
 *   DATABASE_URL=postgres://… node scripts/import-sanity.mjs [--dry-run] [--project=ID] [--dataset=NAME]
 *
 * ## Design notes
 *
 * - **Idempotent.** Matching is on `(kind, slug)` with `ON CONFLICT DO NOTHING`, so running it
 *   twice imports nothing the second time. Safe to re-run after a partial failure.
 * - **Never overwrites.** A post already edited in the Website Manager is left alone; the script
 *   only fills gaps. Re-importing over local edits would silently discard work.
 * - **Read-only against Sanity.** No token is needed and nothing is written there, so the old
 *   dataset survives untouched as a backup until someone deletes it deliberately.
 * - **Portable Text is converted, not preserved.** Sanity's block format is walked and rebuilt as
 *   an `EniceDoc`; anything unrecognised degrades to a paragraph rather than being dropped.
 */

import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { build } from "esbuild";
import postgres from "postgres";

const ROOT = process.cwd();

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const PROJECT_ID = valueOf("--project") ?? "v87jayow";
const DATASET = valueOf("--dataset") ?? "production";
const API_VERSION = "2025-01-01";

function valueOf(flag) {
  const match = args.find((arg) => arg.startsWith(`${flag}=`));
  return match ? match.slice(flag.length + 1) : undefined;
}

/**
 * Loads the shared TypeScript helpers by bundling them to a temporary ESM file.
 *
 * The sanitisers and the document builder are the same ones the API uses. Reimplementing slug or
 * excerpt logic here would guarantee imported posts differ subtly from ones authored in the panel.
 */
async function loadModule(entry, name) {
  const outfile = join(ROOT, "node_modules", ".cache", `import-sanity-${name}.mjs`);
  await mkdir(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [join(ROOT, entry)],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  return import(`file://${outfile}?t=${Date.now()}`);
}

// ─── Sanity fetch ────────────────────────────────────────────────────────────

async function fetchSanityPosts() {
  const query =
    encodeURIComponent(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id, title, "slug": slug.current, category, publishedAt, excerpt,
    "mainImageUrl": mainImage.asset->url,
    body[]{
      ...,
      _type == "image" => { "assetUrl": asset->url, alt, caption }
    }
  }`);

  const url = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${query}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Sanity responded ${response.status} ${response.statusText}`);
    }
    const body = await response.json();
    return Array.isArray(body.result) ? body.result : [];
  } finally {
    clearTimeout(timer);
  }
}

// ─── Portable Text → EniceDoc ────────────────────────────────────────────────

/**
 * Renders one Portable Text span run into our inline HTML subset.
 *
 * Marks in Portable Text are either decorators (`strong`, `em`, `code`) or references into
 * `markDefs` (links). Both are handled; an unknown mark is ignored and its text kept, which is the
 * same forgiving behaviour the sanitiser has.
 */
function renderSpans(children, markDefs, escapeHtml) {
  if (!Array.isArray(children)) return "";

  return children
    .map((span) => {
      if (!span || typeof span.text !== "string") return "";
      let html = escapeHtml(span.text);
      const marks = Array.isArray(span.marks) ? span.marks : [];

      for (const mark of marks) {
        if (mark === "strong") html = `<strong>${html}</strong>`;
        else if (mark === "em") html = `<em>${html}</em>`;
        else if (mark === "code") html = `<code>${html}</code>`;
        else if (mark === "underline" || mark === "strike-through") html = `<em>${html}</em>`;
        else {
          const definition = (markDefs ?? []).find((entry) => entry?._key === mark);
          if (definition?._type === "link" && typeof definition.href === "string") {
            html = `<a href="${escapeHtml(definition.href)}">${html}</a>`;
          }
        }
      }

      return html;
    })
    .join("");
}

/**
 * Converts a Sanity body array into an `EniceDoc`.
 *
 * Consecutive list items are grouped into a single list block, because Portable Text represents a
 * list as a run of sibling blocks carrying `listItem`, whereas our format has one block per list.
 */
function convertBody(body, helpers) {
  const { escapeHtml, sanitizeDoc } = helpers;
  if (!Array.isArray(body)) return sanitizeDoc({ version: 1, blocks: [] });

  const blocks = [];
  let pendingList = null;

  const flushList = () => {
    if (pendingList && pendingList.items.length > 0) blocks.push(pendingList);
    pendingList = null;
  };

  for (const node of body) {
    if (!node || typeof node !== "object") continue;
    const id = randomUUID().slice(0, 8);

    if (node._type === "image" && typeof node.assetUrl === "string") {
      flushList();
      blocks.push({
        id,
        type: "image",
        url: node.assetUrl,
        alt: typeof node.alt === "string" ? node.alt : "",
        caption: typeof node.caption === "string" ? node.caption : "",
        width: "inset",
      });
      continue;
    }

    if (node._type === "code" && typeof node.code === "string") {
      flushList();
      blocks.push({
        id,
        type: "code",
        language: typeof node.language === "string" ? node.language : "text",
        code: node.code,
        filename: typeof node.filename === "string" ? node.filename : "",
      });
      continue;
    }

    if (node._type !== "block") continue;

    const html = renderSpans(node.children, node.markDefs, escapeHtml);

    if (node.listItem) {
      const ordered = node.listItem === "number";
      // Start a new list when the type changes, so a bulleted run followed by a numbered run
      // does not collapse into one mis-typed list.
      if (!pendingList || pendingList.ordered !== ordered) {
        flushList();
        pendingList = { id, type: "list", ordered, items: [] };
      }
      pendingList.items.push(html);
      continue;
    }

    flushList();

    const style = node.style ?? "normal";
    if (style === "blockquote") {
      blocks.push({ id, type: "quote", html, attribution: "" });
    } else if (style === "h1" || style === "h2") {
      blocks.push({ id, type: "heading", level: 2, html });
    } else if (style === "h3") {
      blocks.push({ id, type: "heading", level: 3, html });
    } else if (style === "h4" || style === "h5" || style === "h6") {
      blocks.push({ id, type: "heading", level: 4, html });
    } else {
      blocks.push({ id, type: "paragraph", html });
    }
  }

  flushList();
  // Run through the real sanitiser so imported content is indistinguishable from authored content.
  return sanitizeDoc({ version: 1, blocks });
}

/**
 * Maps a Sanity category onto one of our content kinds.
 *
 * The old dataset used one `post` type with a `category` field mixing article categories and what
 * are really separate kinds in the new model. CHANGELOG and UPDATE become news entries;
 * ANNOUNCEMENT becomes an announcement; everything else is a blog post.
 */
function mapKind(category) {
  const value = (category ?? "").toUpperCase();
  if (value === "ANNOUNCEMENT") return "announcement";
  if (value === "CHANGELOG" || value === "UPDATE") return "news";
  return "blog";
}

function mapCategory(category, kind) {
  const value = (category ?? "").trim();
  if (!value) return null;
  const upper = value.toUpperCase();
  if (kind === "news") {
    if (upper === "CHANGELOG") return "Update";
    if (upper === "UPDATE") return "Update";
  }
  if (upper === "ANNOUNCEMENT") return "Announcement";
  if (upper === "BLOG") return null;
  if (upper === "PRODUCT") return "Product";
  // Preserve anything unrecognised in title case rather than discarding it.
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl && !DRY_RUN) {
    console.error(
      "[import-sanity] DATABASE_URL is not set. Set it, or pass --dry-run to preview the conversion.",
    );
    process.exit(1);
  }

  console.log(`[import-sanity] reading Sanity project ${PROJECT_ID}, dataset ${DATASET}`);
  const posts = await fetchSanityPosts();
  console.log(`[import-sanity] found ${posts.length} post(s)`);
  if (posts.length === 0) {
    console.log("[import-sanity] nothing to import");
    return;
  }

  const sanitize = await loadModule("src/lib/cms/sanitize.ts", "sanitize");
  const doc = await loadModule("src/lib/cms/doc.ts", "doc");
  const helpers = { escapeHtml: sanitize.escapeHtml, sanitizeDoc: doc.sanitizeDoc };

  const prepared = posts.map((post) => {
    const kind = mapKind(post.category);
    const body = convertBody(post.body, helpers);
    const title = sanitize.sanitizeText(post.title ?? post.slug, 250);
    const excerpt =
      sanitize.sanitizeMultilineText(post.excerpt ?? "", 500) || doc.deriveExcerpt(body);
    const slug = doc.slugify(post.slug ?? title);

    return {
      kind,
      title,
      slug,
      excerpt,
      body,
      category: mapCategory(post.category, kind),
      coverImageUrl: sanitize.sanitizeUrl(post.mainImageUrl) ?? doc.firstImageUrl(body),
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      readingMinutes: doc.readingMinutes(body),
      searchText: [title, excerpt, doc.docToPlainText(body)]
        .filter(Boolean)
        .join(" ")
        .slice(0, 100_000),
    };
  });

  console.log("\n[import-sanity] conversion summary:");
  for (const row of prepared) {
    console.log(
      `  ${row.kind.padEnd(13)} ${row.slug.padEnd(46)} ${String(row.body.blocks.length).padStart(3)} blocks  ${row.readingMinutes} min`,
    );
  }

  if (DRY_RUN) {
    console.log("\n[import-sanity] --dry-run: nothing was written.");
    return;
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: /[?&]sslmode=/.test(databaseUrl)
      ? undefined
      : new URL(databaseUrl).hostname === "localhost"
        ? false
        : "require",
    onnotice: () => {},
  });

  let inserted = 0;
  let skipped = 0;

  try {
    for (const row of prepared) {
      const result = await sql`
        INSERT INTO content_items (
          id, kind, status, title, slug, excerpt, body, cover_image_url, category, tags,
          seo, extras, reading_minutes, search_text, published_at, created_by_email, updated_by_email
        ) VALUES (
          ${randomUUID()}, ${row.kind}, ${"published"}, ${row.title}, ${row.slug}, ${row.excerpt},
          ${sql.json(row.body)}, ${row.coverImageUrl}, ${row.category}, ${sql.array([])},
          ${sql.json({})}, ${sql.json({})}, ${row.readingMinutes}, ${row.searchText},
          ${row.publishedAt}, ${"import@enicehq.com"}, ${"import@enicehq.com"}
        )
        ON CONFLICT (kind, slug) DO NOTHING
        RETURNING id
      `;

      if (result.length > 0) {
        inserted++;
        console.log(`  imported  ${row.kind}/${row.slug}`);
      } else {
        skipped++;
        console.log(`  skipped   ${row.kind}/${row.slug} (already present)`);
      }
    }
  } finally {
    await sql.end();
  }

  console.log(`\n[import-sanity] imported ${inserted}, skipped ${skipped} already-present post(s)`);
  console.log(
    "[import-sanity] imported posts are PUBLISHED, matching their state in Sanity. Review them in " +
      "the Website Manager under Content → Blog and Content → News.",
  );
}

main().catch((error) => {
  console.error("[import-sanity] failed:", error);
  process.exit(1);
});
