/**
 * Renders an `EniceDoc` on the public website.
 *
 * This replaces `@portabletext/react`. Because the document format is ours, the renderer can be a
 * plain switch over block types with the ENICE typography baked in — no component-override map,
 * no vendor schema to satisfy.
 *
 * ## Two themes, one renderer
 *
 * The public blog is dark (`#09090b`); the admin preview needs the same layout to be legible on
 * light chrome. Rather than duplicate the renderer, every block reads its classes from a theme
 * object. That is what guarantees the admin's preview is structurally identical to what a visitor
 * sees — the only thing that differs is colour.
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
  paragraph: string;
  heading: Record<HeadingLevel, string>;
  strongList: string;
  listItem: string;
  quote: string;
  quoteAttribution: string;
  caption: string;
  divider: string;
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
    paragraph: "mb-6 text-[17px] leading-8 text-zinc-300",
    heading: {
      2: "mt-12 mb-4 scroll-mt-24 text-2xl font-bold tracking-tight text-white",
      3: "mt-9 mb-3 scroll-mt-24 text-xl font-bold tracking-tight text-white",
      4: "mt-7 mb-2 scroll-mt-24 text-lg font-semibold tracking-tight text-white",
    },
    strongList: "mb-6 space-y-2 pl-6 text-[17px] leading-8 text-zinc-300",
    listItem: "text-zinc-300",
    quote: "my-8 border-l-2 border-blue-500 pl-5 text-lg italic leading-8 text-zinc-300",
    quoteAttribution: "mt-3 text-sm font-medium not-italic text-zinc-500",
    caption: "mt-3 text-center text-xs text-zinc-500",
    divider: "my-12 h-px border-0 bg-white/[0.08]",
    code: {
      frame: "my-8 overflow-hidden rounded-xl border border-white/[0.08] bg-black/40",
      filename:
        "border-b border-white/[0.08] bg-white/[0.02] px-4 py-2 font-mono text-[11px] text-zinc-400",
      body: "overflow-x-auto p-4 font-mono text-[13px] leading-6 text-zinc-200",
    },
    table: {
      frame: "my-8 overflow-x-auto rounded-xl border border-white/[0.08]",
      head: "bg-white/[0.03] px-4 py-3 text-left text-[11px] font-bold tracking-wider text-zinc-400 uppercase",
      cell: "border-t border-white/[0.06] px-4 py-3 text-sm text-zinc-300",
    },
    callout: {
      info: "border-blue-500/25 bg-blue-500/[0.07] text-zinc-200",
      success: "border-emerald-500/25 bg-emerald-500/[0.07] text-zinc-200",
      warning: "border-amber-500/25 bg-amber-500/[0.07] text-zinc-200",
      danger: "border-red-500/25 bg-red-500/[0.07] text-zinc-200",
    },
    calloutTitle: "mb-1.5 text-sm font-bold text-white",
  },
  light: {
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
 * Link styling, applied to the container rather than per anchor.
 *
 * Inline links arrive as raw HTML, so they cannot carry Tailwind classes of their own. A
 * descendant selector on the wrapper styles them without needing to rewrite the markup.
 */
const LINK_CLASSES: Record<DocTheme, string> = {
  dark: "[&_a]:font-medium [&_a]:text-blue-400 [&_a]:underline [&_a]:decoration-blue-400/30 [&_a]:underline-offset-2 [&_a:hover]:decoration-blue-400 [&_code]:rounded [&_code]:bg-white/[0.07] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-blue-300 [&_strong]:font-bold [&_strong]:text-white",
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
      <img
        src={block.url}
        alt={block.alt}
        // Lazy + async decoding: body images are almost always below the fold, and this keeps
        // them off the critical path without any per-image decision by the author.
        loading="lazy"
        decoding="async"
        className="w-full rounded-2xl object-cover"
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
          className="w-full rounded-2xl"
          // Poster frames are not part of the block schema; metadata preload gives the browser
          // enough to show a first frame without downloading the whole file.
        />
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
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
      className={`my-8 flex gap-3 rounded-xl border px-5 py-4 ${theme.callout[block.variant]}`}
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
    <div className={`${LINK_CLASSES[theme]} ${className}`} data-allow-select>
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
      className={`mb-10 rounded-xl border px-5 py-4 ${
        isDark ? "border-white/[0.07] bg-white/[0.02]" : "border-border bg-secondary"
      }`}
    >
      <p
        className={`mb-3 text-[11px] font-bold tracking-[0.18em] uppercase ${
          isDark ? "text-zinc-500" : "text-muted-foreground"
        }`}
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
                  ? "text-zinc-400 hover:text-blue-400"
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
