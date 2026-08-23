/**
 * `EniceDoc` — the portable document format behind the block editor.
 *
 * ## Why a custom format
 *
 * The obvious alternatives were rejected deliberately:
 *
 *   - **Raw HTML** would put layout and typography decisions in authors' hands, which is
 *     exactly how a premium design system erodes. Here a heading block *is* a heading; how it
 *     looks is the renderer's business.
 *   - **Portable Text** (what the previous Sanity setup used) ties the shape of our content to
 *     a vendor's editor.
 *   - **A ProseMirror/TipTap schema** would work, but pulls a large dependency tree into a
 *     bundle that currently has none, for an editing surface we want full design control over.
 *
 * So: an ordered list of typed blocks. Structure is explicit and validated; only *inline*
 * formatting inside a block is HTML, and only the narrow subset `./sanitize` permits.
 *
 * ## Invariant
 *
 * Anything that reaches `body` in the database has been through `sanitizeDoc`. Renderers may
 * therefore trust block structure, but still pass inline strings through
 * `dangerouslySetInnerHTML` only — never `eval`-adjacent APIs.
 *
 * Kept free of React, DOM and Node APIs: the serverless API validates with it, the admin
 * previews with it, the public site renders with it, and the prerender script reads it.
 */

import {
  inlineHtmlToText,
  sanitizeInlineHtml,
  sanitizeMultilineText,
  sanitizeText,
  sanitizeUrl,
} from "./sanitize";

// ─── Block types ─────────────────────────────────────────────────────────────

export const BLOCK_TYPES = [
  "heading",
  "paragraph",
  "list",
  "quote",
  "image",
  "video",
  "table",
  "code",
  "callout",
  "divider",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

/** Heading levels an author may choose. `h1` is reserved for the item's title. */
export const HEADING_LEVELS = [2, 3, 4] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

export const CALLOUT_VARIANTS = ["info", "success", "warning", "danger"] as const;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export interface HeadingBlock {
  id: string;
  type: "heading";
  level: HeadingLevel;
  html: string;
}
export interface ParagraphBlock {
  id: string;
  type: "paragraph";
  html: string;
}
export interface ListBlock {
  id: string;
  type: "list";
  ordered: boolean;
  items: string[];
}
export interface QuoteBlock {
  id: string;
  type: "quote";
  html: string;
  attribution: string;
}
export interface ImageBlock {
  id: string;
  type: "image";
  url: string;
  alt: string;
  caption: string;
  /** `full` breaks out of the prose column; `inset` stays within it. */
  width: "inset" | "full";
}
export interface VideoBlock {
  id: string;
  type: "video";
  url: string;
  caption: string;
  /** Resolved from the URL at write time so the renderer needs no parsing logic. */
  provider: "youtube" | "vimeo" | "file";
}
export interface TableBlock {
  id: string;
  type: "table";
  head: string[];
  rows: string[][];
  caption: string;
}
export interface CodeBlock {
  id: string;
  type: "code";
  language: string;
  code: string;
  filename: string;
}
export interface CalloutBlock {
  id: string;
  type: "callout";
  variant: CalloutVariant;
  title: string;
  html: string;
}
export interface DividerBlock {
  id: string;
  type: "divider";
}

export type DocBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | QuoteBlock
  | ImageBlock
  | VideoBlock
  | TableBlock
  | CodeBlock
  | CalloutBlock
  | DividerBlock;

export interface EniceDoc {
  version: 1;
  blocks: DocBlock[];
}

/** Editor-facing metadata for the block picker. `icon` names a lucide component. */
export const BLOCK_META: Record<BlockType, { label: string; icon: string; hint: string }> = {
  heading: { label: "Heading", icon: "Heading2", hint: "Section title" },
  paragraph: { label: "Text", icon: "Type", hint: "Body copy" },
  list: { label: "List", icon: "List", hint: "Bulleted or numbered" },
  quote: { label: "Quote", icon: "Quote", hint: "Pull quote with attribution" },
  image: { label: "Image", icon: "Image", hint: "From the media library" },
  video: { label: "Video", icon: "Video", hint: "YouTube, Vimeo or a file" },
  table: { label: "Table", icon: "Table", hint: "Rows and columns" },
  code: { label: "Code", icon: "Code", hint: "Syntax-highlighted snippet" },
  callout: { label: "Callout", icon: "Info", hint: "Highlighted note" },
  divider: { label: "Divider", icon: "Minus", hint: "Visual break" },
};

// ─── Limits ──────────────────────────────────────────────────────────────────

const MAX_BLOCKS = 600;
const MAX_LIST_ITEMS = 200;
const MAX_TABLE_COLUMNS = 10;
const MAX_TABLE_ROWS = 200;
const MAX_CODE_LENGTH = 40_000;

/** Languages offered in the code block. Labels only — highlighting is renderer-side. */
export const CODE_LANGUAGES = [
  "text",
  "bash",
  "json",
  "typescript",
  "javascript",
  "tsx",
  "python",
  "go",
  "rust",
  "sql",
  "yaml",
  "html",
  "css",
] as const;

// ─── Construction ────────────────────────────────────────────────────────────

/**
 * Generates a block id.
 *
 * `crypto.randomUUID` is present in every runtime this ships to (browsers, Node 22, the
 * Vercel function runtime), but the fallback keeps the module usable if it ever is not —
 * these ids only need to be unique within one document.
 */
export function blockId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export function emptyDoc(): EniceDoc {
  return { version: 1, blocks: [{ id: blockId(), type: "paragraph", html: "" }] };
}

/** A fresh block of the requested type, with defaults that render correctly immediately. */
export function createBlock(type: BlockType): DocBlock {
  const id = blockId();
  switch (type) {
    case "heading":
      return { id, type: "heading", level: 2, html: "" };
    case "paragraph":
      return { id, type: "paragraph", html: "" };
    case "list":
      return { id, type: "list", ordered: false, items: [""] };
    case "quote":
      return { id, type: "quote", html: "", attribution: "" };
    case "image":
      return { id, type: "image", url: "", alt: "", caption: "", width: "inset" };
    case "video":
      return { id, type: "video", url: "", caption: "", provider: "file" };
    case "table":
      return {
        id,
        type: "table",
        head: ["Column", "Column"],
        rows: [
          ["", ""],
          ["", ""],
        ],
        caption: "",
      };
    case "code":
      return { id, type: "code", language: "text", code: "", filename: "" };
    case "callout":
      return { id, type: "callout", variant: "info", title: "", html: "" };
    case "divider":
      return { id, type: "divider" };
  }
}

// ─── Video providers ─────────────────────────────────────────────────────────

/**
 * Classifies a video URL and, for the hosted providers, returns a privacy-friendly embed URL.
 *
 * `youtube-nocookie.com` is used deliberately: it avoids setting tracking cookies for visitors
 * who never press play, which keeps the site's cookie posture honest.
 */
export function resolveVideo(rawUrl: string): { provider: VideoBlock["provider"]; embed: string } {
  const safe = sanitizeUrl(rawUrl);
  if (!safe) return { provider: "file", embed: "" };

  const youtube =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/.exec(
      safe,
    );
  if (youtube) {
    return { provider: "youtube", embed: `https://www.youtube-nocookie.com/embed/${youtube[1]}` };
  }

  const vimeo = /vimeo\.com\/(?:video\/)?(\d{6,})/.exec(safe);
  if (vimeo) return { provider: "vimeo", embed: `https://player.vimeo.com/video/${vimeo[1]}` };

  return { provider: "file", embed: safe };
}

// ─── Validation and sanitisation ─────────────────────────────────────────────

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max).map((entry) => asString(entry));
}

/**
 * Rebuilds a document from untrusted input, discarding anything that does not fit the schema.
 *
 * This is the write-path gate. It is a *reconstruction*, not a validation pass: every field is
 * read individually, coerced and sanitised, and blocks with unrecognised types are dropped. A
 * malformed or hostile payload therefore cannot smuggle extra properties into storage, and the
 * value that comes out is guaranteed to satisfy `EniceDoc` for the renderer.
 *
 * Blocks that carry no content — an empty paragraph, an image with no URL — are dropped, so
 * trailing editor scaffolding never reaches the published page.
 */
export function sanitizeDoc(input: unknown): EniceDoc {
  const raw = input as { blocks?: unknown } | null | undefined;
  const rawBlocks = Array.isArray(raw?.blocks) ? raw.blocks : [];
  const blocks: DocBlock[] = [];
  const seenIds = new Set<string>();

  for (const entry of rawBlocks.slice(0, MAX_BLOCKS)) {
    if (!entry || typeof entry !== "object") continue;
    const source = entry as Record<string, unknown>;
    const type = asString(source.type) as BlockType;
    if (!(BLOCK_TYPES as readonly string[]).includes(type)) continue;

    // Duplicate ids break React keys and the editor's focus tracking; reissue rather than drop.
    let id = sanitizeText(source.id, 40) || blockId();
    if (seenIds.has(id)) id = blockId();
    seenIds.add(id);

    switch (type) {
      case "heading": {
        const html = sanitizeInlineHtml(source.html);
        if (!inlineHtmlToText(html)) break;
        const rawLevel = Number(source.level);
        const level = (HEADING_LEVELS as readonly number[]).includes(rawLevel)
          ? (rawLevel as HeadingLevel)
          : 2;
        blocks.push({ id, type, level, html });
        break;
      }

      case "paragraph": {
        const html = sanitizeInlineHtml(source.html);
        if (!inlineHtmlToText(html)) break;
        blocks.push({ id, type, html });
        break;
      }

      case "list": {
        const items = asStringArray(source.items, MAX_LIST_ITEMS)
          .map((item) => sanitizeInlineHtml(item))
          .filter((item) => inlineHtmlToText(item).length > 0);
        if (items.length === 0) break;
        blocks.push({ id, type, ordered: source.ordered === true, items });
        break;
      }

      case "quote": {
        const html = sanitizeInlineHtml(source.html);
        if (!inlineHtmlToText(html)) break;
        blocks.push({ id, type, html, attribution: sanitizeText(source.attribution, 200) });
        break;
      }

      case "image": {
        const url = sanitizeUrl(source.url);
        if (!url) break;
        blocks.push({
          id,
          type,
          url,
          alt: sanitizeText(source.alt, 300),
          caption: sanitizeText(source.caption, 300),
          width: source.width === "full" ? "full" : "inset",
        });
        break;
      }

      case "video": {
        const url = sanitizeUrl(source.url);
        if (!url) break;
        const { provider } = resolveVideo(url);
        blocks.push({ id, type, url, caption: sanitizeText(source.caption, 300), provider });
        break;
      }

      case "table": {
        const head = asStringArray(source.head, MAX_TABLE_COLUMNS).map((cell) =>
          sanitizeText(cell, 200),
        );
        const columns = head.length;
        if (columns === 0) break;
        const rawRows = Array.isArray(source.rows) ? source.rows.slice(0, MAX_TABLE_ROWS) : [];
        const rows = rawRows
          .map((row) => {
            const cells = asStringArray(row, MAX_TABLE_COLUMNS).map((cell) =>
              sanitizeText(cell, 500),
            );
            // Pad or trim so every row matches the header width — the renderer assumes this.
            return Array.from({ length: columns }, (_, index) => cells[index] ?? "");
          })
          .filter((row) => row.some((cell) => cell.length > 0));
        if (rows.length === 0) break;
        blocks.push({ id, type, head, rows, caption: sanitizeText(source.caption, 300) });
        break;
      }

      case "code": {
        const code = asString(source.code).slice(0, MAX_CODE_LENGTH);
        if (!code.trim()) break;
        const language = asString(source.language);
        blocks.push({
          id,
          type,
          language: (CODE_LANGUAGES as readonly string[]).includes(language) ? language : "text",
          code,
          filename: sanitizeText(source.filename, 120),
        });
        break;
      }

      case "callout": {
        const html = sanitizeInlineHtml(source.html);
        const title = sanitizeText(source.title, 200);
        if (!inlineHtmlToText(html) && !title) break;
        const variant = asString(source.variant) as CalloutVariant;
        blocks.push({
          id,
          type,
          variant: CALLOUT_VARIANTS.includes(variant) ? variant : "info",
          title,
          html,
        });
        break;
      }

      case "divider":
        blocks.push({ id, type });
        break;
    }
  }

  return { version: 1, blocks };
}

/** Narrows an untyped value from the database into a document, repairing it if necessary. */
export function asDoc(value: unknown): EniceDoc {
  if (value && typeof value === "object" && Array.isArray((value as EniceDoc).blocks)) {
    return value as EniceDoc;
  }
  return emptyDoc();
}

export function isDocEmpty(doc: EniceDoc): boolean {
  return doc.blocks.filter((block) => block.type !== "divider").length === 0;
}

// ─── Derived values ──────────────────────────────────────────────────────────

/** Flattens a document to prose. Backs excerpt generation, search and word counts. */
export function docToPlainText(doc: EniceDoc): string {
  const parts: string[] = [];
  for (const block of doc.blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
        parts.push(inlineHtmlToText(block.html));
        break;
      case "list":
        parts.push(block.items.map((item) => inlineHtmlToText(item)).join(" "));
        break;
      case "quote":
        parts.push(inlineHtmlToText(block.html));
        if (block.attribution) parts.push(block.attribution);
        break;
      case "callout":
        if (block.title) parts.push(block.title);
        parts.push(inlineHtmlToText(block.html));
        break;
      case "image":
      case "video":
        if (block.caption) parts.push(block.caption);
        break;
      case "table":
        parts.push(block.head.join(" "));
        for (const row of block.rows) parts.push(row.join(" "));
        break;
      // Code is excluded: it would skew reading time and pollute search with syntax.
      case "code":
      case "divider":
        break;
    }
  }
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function wordCount(doc: EniceDoc): number {
  const text = docToPlainText(doc);
  return text ? text.split(/\s+/).length : 0;
}

/** Reading time in whole minutes at 225 wpm, floored at 1 for any non-empty document. */
export function readingMinutes(doc: EniceDoc): number {
  const words = wordCount(doc);
  if (words === 0) return 0;
  return Math.max(1, Math.round(words / 225));
}

/**
 * Derives an excerpt from the first substantial paragraph.
 *
 * Truncation lands on a word boundary, and prefers to end at a sentence break when one falls
 * in the last third of the window — an excerpt that ends mid-clause reads like a bug.
 */
export function deriveExcerpt(doc: EniceDoc, maxLength = 200): string {
  const paragraph = doc.blocks.find(
    (block): block is ParagraphBlock =>
      block.type === "paragraph" && inlineHtmlToText(block.html).length > 40,
  );
  const text = paragraph ? inlineHtmlToText(paragraph.html) : docToPlainText(doc);
  if (!text) return "";
  if (text.length <= maxLength) return text;

  const window = text.slice(0, maxLength);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! "),
  );
  if (sentenceEnd > maxLength * 0.6) return window.slice(0, sentenceEnd + 1);

  const lastSpace = window.lastIndexOf(" ");
  return `${(lastSpace > 0 ? window.slice(0, lastSpace) : window).trimEnd()}…`;
}

/** The first image in a document, used as a cover-image fallback. */
export function firstImageUrl(doc: EniceDoc): string | null {
  const image = doc.blocks.find((block): block is ImageBlock => block.type === "image");
  return image?.url ?? null;
}

/**
 * Headings, for an article's table of contents.
 *
 * Anchors are slugified from the heading text and de-duplicated with a numeric suffix, so two
 * sections called "Overview" still get distinct, stable links.
 */
export function docHeadings(doc: EniceDoc): { id: string; level: HeadingLevel; text: string }[] {
  const used = new Map<string, number>();
  const headings: { id: string; level: HeadingLevel; text: string }[] = [];
  for (const block of doc.blocks) {
    if (block.type !== "heading") continue;
    const text = inlineHtmlToText(block.html);
    if (!text) continue;
    const base = slugify(text) || "section";
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    headings.push({ id: seen === 0 ? base : `${base}-${seen + 1}`, level: block.level, text });
  }
  return headings;
}

// ─── Slugs ───────────────────────────────────────────────────────────────────

/**
 * URL-safe slug from arbitrary text.
 *
 * Accented Latin characters are decomposed to their base letters via NFD so "Café" becomes
 * "cafe" rather than "caf", which is what a naive strip produces.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

/** Normalises a page path: leading slash, no trailing slash, slugified segments. */
export function normalizePath(value: string): string {
  const segments = value
    .split("/")
    .map((segment) => slugify(segment))
    .filter(Boolean);
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

// ─── Plain-text → document ───────────────────────────────────────────────────

/**
 * Converts markdown-ish plain text into blocks.
 *
 * Two callers: the AI Website Manager, whose model output is prose with `##` headings and `-`
 * bullets, and the one-time Sanity import. Deliberately a small subset — this is a convenience
 * for machine-generated input, not a markdown editor.
 */
export function docFromPlainText(input: string): EniceDoc {
  const blocks: DocBlock[] = [];
  const lines = sanitizeMultilineText(input, 200_000).split("\n");

  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;
  let codeLines: string[] | null = null;
  let codeLanguage = "text";

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ id: blockId(), type: "paragraph", html: escapeInline(paragraph.join(" ")) });
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({
      id: blockId(),
      type: "list",
      ordered: listOrdered,
      items: listItems.map(escapeInline),
    });
    listItems = [];
  };

  for (const line of lines) {
    const fence = /^```(\w*)\s*$/.exec(line.trim());
    if (fence) {
      if (codeLines) {
        blocks.push({
          id: blockId(),
          type: "code",
          language: (CODE_LANGUAGES as readonly string[]).includes(codeLanguage)
            ? codeLanguage
            : "text",
          code: codeLines.join("\n"),
          filename: "",
        });
        codeLines = null;
      } else {
        flushParagraph();
        flushList();
        codeLines = [];
        codeLanguage = fence[1] || "text";
      }
      continue;
    }
    if (codeLines) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ id: blockId(), type: "divider" });
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        id: blockId(),
        type: "heading",
        level: heading[1].length as HeadingLevel,
        html: escapeInline(heading[2]),
      });
      continue;
    }

    const bullet = /^[-*•]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      if (listOrdered && listItems.length > 0) flushList();
      listOrdered = false;
      listItems.push(bullet[1]);
      continue;
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    if (numbered) {
      flushParagraph();
      if (!listOrdered && listItems.length > 0) flushList();
      listOrdered = true;
      listItems.push(numbered[1]);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(trimmed);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push({
        id: blockId(),
        type: "quote",
        html: escapeInline(quote[1]),
        attribution: "",
      });
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  if (codeLines) {
    blocks.push({
      id: blockId(),
      type: "code",
      language: codeLanguage,
      code: codeLines.join("\n"),
      filename: "",
    });
  }

  return sanitizeDoc({ version: 1, blocks });
}

/**
 * Renders the inline markdown subset (`**bold**`, `*italic*`, `` `code` ``, `[text](url)`)
 * into the permitted HTML subset.
 *
 * Text is escaped first, then markers are converted, so a literal `<` in the source can never
 * become a tag. The output still goes through `sanitizeDoc`, which is the real guarantee.
 */
function escapeInline(value: string): string {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, text: string, href: string) => {
      const safe = sanitizeUrl(href);
      return safe ? `<a href="${safe}">${text}</a>` : text;
    });
}
