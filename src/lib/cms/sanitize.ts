/**
 * HTML and URL sanitisation for author-supplied content.
 *
 * ## Why this exists
 *
 * The block editor stores inline formatting as a tiny subset of HTML, because that is what a
 * `contenteditable` region natively produces and round-trips losslessly. That HTML is written
 * by an authenticated administrator and later rendered into the *public* ENICE website with
 * `dangerouslySetInnerHTML`. That crosses a trust boundary: a compromised or careless admin
 * account must not be able to plant script that runs for every visitor.
 *
 * So every string is rewritten here rather than merely inspected. The sanitiser is
 * allowlist-based and re-serialises from its own parse — nothing from the input reaches the
 * output except text and the handful of tags and attributes explicitly permitted below.
 *
 * ## Where it runs
 *
 * Server-side, on write, in `api-src/cms.ts`. That is the enforcement point: sanitising only
 * in the browser would be decorative, since the API is reachable directly. It is deliberately
 * dependency-free and DOM-free so the same code runs in the serverless function, in the
 * browser preview, and in the Node prerender script.
 */

// ─── Allowlists ──────────────────────────────────────────────────────────────

/**
 * Permitted inline tags, mapped to their canonical form.
 *
 * `document.execCommand` — still the most reliable way to apply inline formatting inside a
 * `contenteditable` across browsers — emits `<b>` and `<i>` in some engines and
 * `<strong>`/`<em>` in others. Normalising on the way in means stored content is consistent
 * regardless of which browser wrote it.
 */
const ALLOWED_TAGS: Record<string, string> = {
  strong: "strong",
  b: "strong",
  em: "em",
  i: "em",
  code: "code",
  a: "a",
  br: "br",
  s: "s",
  strike: "s",
  del: "s",
  sup: "sup",
  sub: "sub",
};

/** Tags that never have a closing partner. */
const VOID_TAGS = new Set(["br"]);

/**
 * Tags whose *contents* are discarded, not just the tag itself.
 *
 * For every other disallowed tag the inner text is kept and escaped, which is the friendly
 * behaviour — a stray `<div>` should not eat a paragraph. But keeping the body of a `<script>`
 * would dump executable-looking source into the page as visible text, and for `<svg>` and
 * `<math>` the escaped remains are noise. Dropping the subtree entirely is correct for these.
 */
const DROP_CONTENT_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "svg",
  "math",
  "template",
  "link",
  "meta",
  "base",
  "form",
  "input",
  "button",
  "textarea",
  "select",
]);

/** URL schemes permitted in a link. Everything else is rejected outright. */
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/** Ceiling on a single inline string, so one block cannot carry a megabyte of markup. */
const MAX_INLINE_LENGTH = 200_000;

/** Nesting ceiling. Legitimate inline content is two or three deep; 8 is generous. */
const MAX_NESTING = 8;

// ─── Text escaping ───────────────────────────────────────────────────────────

/**
 * Escapes a plain string for interpolation into HTML.
 *
 * Used for fields that are never formatted — titles, captions, table cells, code — where the
 * value must appear literally.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escapes a text run inside already-HTML content, preserving entities that are already there.
 *
 * A blanket `&` → `&amp;` would turn the `&amp;` the editor produced for a typed ampersand
 * into a visible `&amp;`, and every save would add another layer. The negative lookahead
 * escapes only ampersands that do not already begin a well-formed entity, so the transform is
 * idempotent — which matters because content is sanitised on every save, not just the first.
 */
function escapeTextRun(value: string): string {
  return value
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#[xX][0-9a-fA-F]{1,6});)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── URLs ────────────────────────────────────────────────────────────────────

/**
 * Validates a URL for use in an `href` or `src`, returning `null` if it is not safe.
 *
 * Relative URLs (`/about`, `#section`, `./x`) are allowed through untouched — they cannot
 * carry a scheme, so they cannot be `javascript:`. Absolute URLs are parsed and their protocol
 * checked against the allowlist, which rejects `javascript:`, `data:` and `vbscript:` however
 * they are obfuscated: parsing normalises away the tab, newline and entity tricks that defeat
 * string matching (`java\tscript:`, `java&#09;script:`).
 */
export function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 4096) return null;

  // Control characters are the raw material of scheme-obfuscation attacks.
  // eslint-disable-next-line no-control-regex
  const cleaned = trimmed.replace(/[\u0000-\u001F\u007F]/g, "");
  if (!cleaned) return null;

  // Relative, root-relative, protocol-relative and fragment URLs.
  if (/^[/#?]/.test(cleaned)) {
    // `//evil.com` is protocol-relative and therefore off-site; treat it as absolute.
    if (cleaned.startsWith("//")) {
      try {
        const url = new URL(`https:${cleaned}`);
        return SAFE_PROTOCOLS.has(url.protocol) ? url.toString() : null;
      } catch {
        return null;
      }
    }
    return cleaned;
  }

  // A bare relative path such as "about/team" — no scheme is possible without a colon.
  if (!cleaned.includes(":")) return cleaned;

  try {
    const url = new URL(cleaned);
    return SAFE_PROTOCOLS.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Convenience wrapper for optional fields: unsafe or absent both become `""`. */
export function sanitizeUrlOrEmpty(value: unknown): string {
  return sanitizeUrl(value) ?? "";
}

// ─── Inline HTML ─────────────────────────────────────────────────────────────

/** Pulls `href` out of a raw attribute string, tolerating single, double or bare quoting. */
function extractHref(rawAttributes: string): string | null {
  const match = /(?:^|\s)href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(rawAttributes);
  if (!match) return null;
  const raw = match[1] ?? match[2] ?? match[3] ?? "";
  return decodeEntities(raw);
}

/**
 * Decodes the handful of entities an editor emits inside an attribute value.
 *
 * Needed before protocol checking: `&#106;avascript:` and `&#x6a;avascript:` are both
 * `javascript:` by the time a browser reads the attribute, so the check has to see the
 * decoded form. Numeric escapes are decoded generically rather than by table.
 */
function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]{1,6});?/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d{1,7});?/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
}

/**
 * Reduces a string to the permitted inline subset.
 *
 * The parse is a single forward pass over tag boundaries. Text between tags is escaped;
 * allowed tags are re-emitted in canonical form from a tracked stack, so the result is always
 * well-formed and balanced even when the input is not. Because the output is built from the
 * sanitiser's own model rather than by deleting parts of the input, there is no
 * "mutation-XSS" seam where a partially-stripped string re-parses into something dangerous.
 *
 * Links additionally gain `rel="noopener noreferrer nofollow"` and `target="_blank"` when they
 * point off-site.
 */
export function sanitizeInlineHtml(input: unknown): string {
  if (typeof input !== "string" || !input) return "";

  const source = input.length > MAX_INLINE_LENGTH ? input.slice(0, MAX_INLINE_LENGTH) : input;

  const out: string[] = [];
  const stack: string[] = [];
  // Matches an HTML comment, a CDATA section, or an opening/closing tag.
  const tokenPattern =
    /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?\]\]>|<\/?([a-zA-Z][\w:-]*)([^>]*)>/g;

  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(source)) !== null) {
    if (match.index > cursor) {
      out.push(escapeTextRun(source.slice(cursor, match.index)));
    }
    cursor = match.index + match[0].length;

    const tagName = match[1]?.toLowerCase();
    // Comments and CDATA have no capture group: drop them entirely.
    if (!tagName) continue;

    const isClosing = match[0].startsWith("</");

    // A subtree to discard wholesale. Skip ahead to its closing tag; if there isn't one,
    // the rest of the string goes with it.
    if (!isClosing && DROP_CONTENT_TAGS.has(tagName)) {
      const closePattern = new RegExp(`</\\s*${tagName}\\s*>`, "i");
      const rest = source.slice(cursor);
      const closeMatch = closePattern.exec(rest);
      cursor = closeMatch ? cursor + closeMatch.index + closeMatch[0].length : source.length;
      tokenPattern.lastIndex = cursor;
      continue;
    }
    if (isClosing && DROP_CONTENT_TAGS.has(tagName)) continue;

    const canonical = ALLOWED_TAGS[tagName];
    // Disallowed but harmless (a `<div>`, a `<span>`): drop the tag, keep the text.
    if (!canonical) continue;

    if (VOID_TAGS.has(canonical)) {
      if (!isClosing) out.push(`<${canonical}>`);
      continue;
    }

    if (isClosing) {
      const depth = stack.lastIndexOf(canonical);
      // A close with no matching open is noise; ignore it rather than emitting a stray tag.
      if (depth === -1) continue;
      // Close anything opened inside it first, so the output nests correctly.
      while (stack.length > depth) {
        out.push(`</${stack.pop()}>`);
      }
      continue;
    }

    if (stack.length >= MAX_NESTING) continue;

    if (canonical === "a") {
      const href = sanitizeUrl(extractHref(match[2] ?? ""));
      // A link with nothing safe to point at becomes plain text rather than a dead anchor.
      if (!href) continue;
      const external = /^https?:/i.test(href) && !href.includes("enicehq.com");
      const attributes = external
        ? ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer nofollow"`
        : ` href="${escapeHtml(href)}"`;
      out.push(`<a${attributes}>`);
      stack.push("a");
      continue;
    }

    out.push(`<${canonical}>`);
    stack.push(canonical);
  }

  if (cursor < source.length) out.push(escapeTextRun(source.slice(cursor)));

  // Balance anything left open.
  while (stack.length > 0) out.push(`</${stack.pop()}>`);

  return out.join("");
}

/**
 * Strips all markup, yielding readable text.
 *
 * Used for excerpts, search indexing, word counts and reading-time estimates — anywhere the
 * prose matters and the formatting does not.
 */
export function inlineHtmlToText(input: unknown): string {
  if (typeof input !== "string" || !input) return "";
  return decodeEntities(
    input
      .replace(/<\s*br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " "),
  ).trim();
}

/**
 * Normalises a single-line plain-text field: collapses whitespace, strips control characters
 * and enforces a length ceiling. Applied to titles, labels and captions on write.
 */
export function sanitizeText(value: unknown, maxLength = 300): string {
  if (typeof value !== "string") return "";
  return (
    value
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength)
  );
}

/** As `sanitizeText`, but newlines survive. For textarea-backed fields. */
export function sanitizeMultilineText(value: unknown, maxLength = 5_000): string {
  if (typeof value !== "string") return "";
  return (
    value
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+$/gm, "")
      .trim()
      .slice(0, maxLength)
  );
}
