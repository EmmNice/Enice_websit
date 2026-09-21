/**
 * Renders an `EniceDoc` on the public website.
 *
 * This replaces `@portabletext/react`. Because the document format is ours, the renderer can be a
 * plain switch over block types with the ENICE typography baked in — no component-override map,
 * no vendor schema to satisfy.
 *
 * ## Two themes, one renderer
 *
 * The public site is dark; the admin preview needs the same layout to be legible on light chrome.
 * Rather than duplicate the renderer, every block reads its classes from a theme object. That is
 * what guarantees the admin's preview is structurally identical to what a visitor sees — the only
 * thing that differs is colour. The two class sets stay separate on purpose: collapsing them would
 * mean one of the two surfaces silently renders for the wrong background.
 *
 * The dark set is written in the public design-system tokens (`bone`, `gold`, `surface-*`), which
 * are declared on `.site` — a class `__root.tsx` keeps on `<html>` for public routes and removes
 * under /admin. So the dark theme scopes itself with that class, because the admin preview renders
 * `theme="dark"` outside `.site` and would otherwise resolve every one of those tokens to nothing.
 *
 * ## Reading typography
 *
 * Body copy is 1.0625rem / 1.75 in `bone-strong` rather than full bone: long-form text at full
 * brightness on a near-black canvas is fatiguing to read, and the article body is the one surface
 * on the site where someone stays for several minutes. Code blocks and tables scroll on their own
 * axis so a wide sample or a wide table can never push the page sideways on a phone.
 *
 * ## On `dangerouslySetInnerHTML`
 *
 * Inline content is HTML, and it is injected directly. That is safe here for one specific reason:
 * every string was rewritten by `sanitizeInlineHtml` on the server before it was stored, and that
 * function is allowlist-based and re-serialises from its own parse. See `src/lib/cms/sanitize.ts`.
 * The client deliberately does *not* re-sanitise — a second, different implementation running
 * here would be a second thing to get wrong, and would mask a failure of the real gate.
 */

import { useMemo } from "react";
import type {
  CalloutBlock,
  CodeBlock,
  DocBlock,
  EniceDoc,
  HeadingLevel,
  ImageBlock,
  ListBlock,
  QuoteBlock,
  TableBlock,
  VideoBlock,
} from "@/lib/cms/doc";
import { docHeadings, resolveVideo, slugify } from "@/lib/cms/doc";
import { inlineHtmlToText } from "@/lib/cms/sanitize";

// ─── Theme ───────────────────────────────────────────────────────────────────

export type DocTheme = "dark" | "light";

interface ThemeClasses {
  /** Token scope. Dark needs `.site`; light inherits the admin theme from the document. */
  scope: string;
  paragraph: string;
  heading: Record<HeadingLevel, string>;
  strongList: string;
  listItem: string;
  quote: string;
  quoteAttribution: string;
  caption: string;
  divider: string;
  media: string;
  code: {
    frame: string;
    filename: string;
    body: string;
  };
  table: {
    frame: string;
    head: string;
    cell: string;
  };
  callout: Record<CalloutBlock["variant"], string>;
  calloutTitle: string;
}

const THEMES: Record<DocTheme, ThemeClasses> = {
  dark: {
    scope: "site",
    paragraph: "mb-6 text-[1.0625rem] leading-[1.75] text-bone-strong",
    // Generous space above a heading, tight below it: the gap belongs to the section that
    // follows, which is what makes a long article scannable without rules between parts.
    heading: {
      2: "type-h3 mt-14 mb-4 scroll-mt-24 text-foreground",
      3: "mt-10 mb-3 scroll-mt-24 text-[1.1875rem] font-semibold tracking-[-0.018em] text-foreground",
      4: "mt-8 mb-2 scroll-mt-24 text-[1.0625rem] font-semibold tracking-[-0.012em] text-foreground",
    },
    strongList: "mb-6 space-y-2 pl-6 text-[1.0625rem] leading-[1.75] text-bone-strong",
    listItem: "text-bone-strong marker:text-bone-faint",
    quote:
      "my-9 border-l border-gold/40 pl-5 text-[1.0625rem] leading-[1.75] italic text-bone-strong",
    quoteAttribution: "type-meta mt-3 not-italic",
    caption: "type-meta mt-3 text-center",
    divider: "my-12 h-px border-0 bg-border",
    media: "rounded-lg border border-border",
    code: {
      frame: "my-8 overflow-hidden rounded-lg border border-border bg-surface-1",
      filename:
        "border-b border-border bg-surface-2 px-4 py-2 font-mono text-[11px] text-bone-soft",
      body: "overflow-x-auto p-4 font-mono text-[13px] leading-6 text-bone-strong",
    },
    table: {
      frame: "my-8 overflow-x-auto rounded-lg border border-border",
      head: "bg-surface-1 px-4 py-3 text-left text-[11px] font-semibold tracking-[0.14em] text-bone-soft uppercase",
      cell: "border-t border-border px-4 py-3 text-sm text-bone-strong",
    },
    // The warm accent carries "warning" and the one non-warm accent carries "success"; info is
    // deliberately neutral so the common case does not colour an article.
    callout: {
      info: "border-border bg-surface-1 text-bone-strong",
      success: "border-positive/25 bg-positive/[0.07] text-bone-strong",
      warning: "border-gold/25 bg-gold/[0.07] text-bone-strong",
      danger: "border-destructive/30 bg-destructive/[0.07] text-bone-strong",
    },
    calloutTitle: "mb-1.5 text-sm font-semibold text-foreground",
  },
  light: {
    scope: "",
    paragraph: "mb-6 text-[17px] leading-8 text-foreground/85",
    heading: {
      2: "mt-12 mb-4 scroll-mt-24 text-2xl font-bold tracking-tight text-foreground",
      3: "mt-9 mb-3 scroll-mt-24 text-xl font-bold tracking-tight text-foreground",
      4: "mt-7 mb-2 scroll-mt-24 text-lg font-semibold tracking-tight text-foreground",
    },
    strongList: "mb-6 space-y-2 pl-6 text-[17px] leading-8 text-foreground/85",
    listItem: "text-foreground/85",
    quote: "my-8 border-l-2 border-primary pl-5 text-lg italic leading-8 text-foreground/80",
    quoteAttribution: "mt-3 text-sm font-medium not-italic text-muted-foreground",
    caption: "mt-3 text-center text-xs text-muted-foreground",
    divider: "my-12 h-px border-0 bg-border",
    media: "rounded-xl border border-border",
    code: {
      frame: "my-8 overflow-hidden rounded-xl border border-border bg-secondary",
      filename:
        "border-b border-border bg-background px-4 py-2 font-mono text-[11px] text-muted-foreground",
      body: "overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground",
    },
    table: {
      frame: "my-8 overflow-x-auto rounded-xl border border-border",
      head: "bg-secondary px-4 py-3 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase",
      cell: "border-t border-border px-4 py-3 text-sm text-foreground/85",
    },
    callout: {
      info: "border-blue-500/30 bg-blue-50 text-foreground/85",
      success: "border-emerald-500/30 bg-emerald-50 text-foreground/85",
      warning: "border-amber-500/30 bg-amber-50 text-foreground/85",
      danger: "border-red-500/30 bg-red-50 text-foreground/85",
    },
    calloutTitle: "mb-1.5 text-sm font-bold text-foreground",
  },
};

/**
 * Link, inline-code and strong styling, applied to the container rather than per element.
 *
 * Inline content arrives as raw HTML, so it cannot carry Tailwind classes of its own. A descendant
 * selector on the wrapper styles it without needing to rewrite the markup.
 */
const LINK_CLASSES: Record<DocTheme, string> = {
  dark: "[&_a]:font-medium [&_a]:text-gold [&_a]:underline [&_a]:decoration-gold/40 [&_a]:underline-offset-2 [&_a:hover]:decoration-gold [&_code]:rounded [&_code]:border [&_code]:border-border [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-gold [&_strong]:font-semibold [&_strong]:text-foreground",
  light:
    "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a]:underline-offset-2 [&_a:hover]:decoration-primary [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-primary [&_strong]:font-bold [&_strong]:text-foreground",
};

// ─── Block renderers ─────────────────────────────────────────────────────────

function Heading({
  block,
  theme,
}: {
  block: Extract<DocBlock, { type: "heading" }>;
  theme: ThemeClasses;
}) {
  // The id is derived the same way `docHeadings` derives it, so a table of contents anchors here.
  const id = slugify(inlineHtmlToText(block.html)) || undefined;
  const className = theme.heading[block.level];
  const html = { __html: block.html };

  // A document's top level is `h2`: the page's single `h1` is the article title, so starting the
  // body any higher would skip a level in the outline.
  if (block.level === 2) return <h2 id={id} className={className} dangerouslySetInnerHTML={html} />;
  if (block.level === 3) return <h3 id={id} className={className} dangerouslySetInnerHTML={html} />;
  return <h4 id={id} className={className} dangerouslySetInnerHTML={html} />;
}

function List({ block, theme }: { block: ListBlock; theme: ThemeClasses }) {
  const items = block.items.map((item, index) => (
    <li key={index} className={theme.listItem} dangerouslySetInnerHTML={{ __html: item }} />
  ));

  return block.ordered ? (
    <ol className={`${theme.strongList} list-decimal`}>{items}</ol>
  ) : (
    <ul className={`${theme.strongList} list-disc`}>{items}</ul>
  );
}

function Quote({ block, theme }: { block: QuoteBlock; theme: ThemeClasses }) {
  return (
    <blockquote className={theme.quote}>
      <div dangerouslySetInnerHTML={{ __html: block.html }} />
      {block.attribution && (
        <footer className={theme.quoteAttribution}>— {block.attribution}</footer>
      )}
    </blockquote>
  );
}

function Figure({ block, theme }: { block: ImageBlock; theme: ThemeClasses }) {
  return (
    <figure className={block.width === "full" ? "my-10 lg:-mx-24" : "my-8"}>
      {/*
        Lazy + async decoding: body images are almost always below the fold, and this keeps them
        off the critical path without any per-image decision by the author.

        The ratio is fixed rather than intrinsic because the block schema carries no dimensions —
        without it, every image in a post shifts the paragraphs below it as it loads, which is at
        its worst for the reader who is already part-way down the article.
      */}
      <img
        src={block.url}
        alt={block.alt}
        loading="lazy"
        decoding="async"
        className={`aspect-[16/9] w-full object-cover ${theme.media}`}
      />
      {block.caption && <figcaption className={theme.caption}>{block.caption}</figcaption>}
    </figure>
  );
}

function Video({ block, theme }: { block: VideoBlock; theme: ThemeClasses }) {
  const { provider, embed } = resolveVideo(block.url);

  return (
    <figure className="my-8">
      {provider === "file" ? (
        <video
          src={embed}
          controls
          preload="metadata"
          className={`aspect-video w-full ${theme.media}`}
          // Poster frames are not part of the block schema; metadata preload gives the browser
          // enough to show a first frame without downloading the whole file.
        />
      ) : (
        <div className={`relative aspect-video w-full overflow-hidden ${theme.media}`}>
          <iframe
            src={embed}
            title={block.caption || "Embedded video"}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      )}
      {block.caption && <figcaption className={theme.caption}>{block.caption}</figcaption>}
    </figure>
  );
}

function Table({ block, theme }: { block: TableBlock; theme: ThemeClasses }) {
  // The frame scrolls on its own axis: a wide table is common in a changelog, and without this
  // one it widens the document and breaks the whole page on a phone.
  return (
    <figure className={theme.table.frame}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {block.head.map((cell, index) => (
              <th key={index} scope="col" className={theme.table.head}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={theme.table.cell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {block.caption && (
        <figcaption className={`${theme.caption} pb-3`}>{block.caption}</figcaption>
      )}
    </figure>
  );
}

function Code({ block, theme }: { block: CodeBlock; theme: ThemeClasses }) {
  return (
    <figure className={theme.code.frame}>
      {block.filename && <div className={theme.code.filename}>{block.filename}</div>}
      {/* Rendered as a text child, never as HTML — a code sample is the one place where markup
          must be shown literally rather than interpreted. */}
      <pre className={theme.code.body}>
        <code data-language={block.language}>{block.code}</code>
      </pre>
    </figure>
  );
}

const CALLOUT_ICONS: Record<CalloutBlock["variant"], string> = {
  info: "i",
  success: "✓",
  warning: "!",
  danger: "!",
};

function Callout({ block, theme }: { block: CalloutBlock; theme: ThemeClasses }) {
  return (
    <aside
      className={`my-8 flex gap-3 rounded-lg border px-5 py-4 ${theme.callout[block.variant]}`}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold opacity-70"
      >
        {CALLOUT_ICONS[block.variant]}
      </span>
      <div className="min-w-0 flex-1">
        {block.title && <p className={theme.calloutTitle}>{block.title}</p>}
        {block.html && (
          <div
            className="text-[15px] leading-7 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        )}
      </div>
    </aside>
  );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export interface DocRendererProps {
  doc: EniceDoc;
  theme?: DocTheme;
  className?: string;
}

export function DocRenderer({ doc, theme = "dark", className = "" }: DocRendererProps) {
  const classes = THEMES[theme];

  return (
    // `data-allow-select` is not optional: selection is disabled globally on the site, and prose a
    // reader cannot copy out of is a real defect rather than a styling detail.
    <div
      className={`${classes.scope} ${LINK_CLASSES[theme]} ${className}`.trim()}
      data-allow-select
    >
      {doc.blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return <Heading key={block.id} block={block} theme={classes} />;
          case "paragraph":
            return (
              <p
                key={block.id}
                className={classes.paragraph}
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            );
          case "list":
            return <List key={block.id} block={block} theme={classes} />;
          case "quote":
            return <Quote key={block.id} block={block} theme={classes} />;
          case "image":
            return <Figure key={block.id} block={block} theme={classes} />;
          case "video":
            return <Video key={block.id} block={block} theme={classes} />;
          case "table":
            return <Table key={block.id} block={block} theme={classes} />;
          case "code":
            return <Code key={block.id} block={block} theme={classes} />;
          case "callout":
            return <Callout key={block.id} block={block} theme={classes} />;
          case "divider":
            return <hr key={block.id} className={classes.divider} />;
          default:
            // Unreachable for a sanitised document. Rendering nothing rather than throwing means a
            // future block type deployed to the API before the client cannot break a live page.
            return null;
        }
      })}
    </div>
  );
}

// ─── Table of contents ───────────────────────────────────────────────────────

/**
 * In-page navigation, shown only when an article is long enough to need it.
 *
 * The two-heading threshold matters: a contents list with one entry is visual noise, and on a
 * short post it is worse than nothing.
 */
export function DocTableOfContents({
  doc,
  theme = "dark",
  minHeadings = 3,
}: {
  doc: EniceDoc;
  theme?: DocTheme;
  minHeadings?: number;
}) {
  const headings = useMemo(() => docHeadings(doc), [doc]);
  if (headings.length < minHeadings) return null;

  const isDark = theme === "dark";

  return (
    <nav
      aria-label="On this page"
      className={
        isDark
          ? "site panel-quiet mb-10 px-5 py-4"
          : "mb-10 rounded-xl border border-border bg-secondary px-5 py-4"
      }
    >
      <p
        className={
          isDark
            ? "eyebrow mb-3"
            : "mb-3 text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase"
        }
      >
        On this page
      </p>
      <ol className="space-y-1.5">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}>
            <a
              href={`#${heading.id}`}
              className={`text-sm transition-colors ${
                isDark
                  ? "text-bone-soft hover:text-gold"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
