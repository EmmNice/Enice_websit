/**
 * Renders a tiny, safe inline-styling syntax used across editable site sections.
 *
 * Four markers, chosen so an administrator can style copy from a plain text field without any way
 * to inject markup (nothing here interprets HTML):
 *
 *   **bold**            →  bold text
 *   *italic*            →  italic text
 *   [[highlight]]       →  the section's accent colour (the brand blue)
 *   [label](url)        →  a link
 *
 * A newline in the text becomes a line break, so a headline can be split across lines exactly
 * where the editor puts the breaks. The accent colour is passed in per section rather than fixed,
 * because the right colour depends on the section's background — this keeps the design system in
 * control of *how* a highlight looks while letting the editor choose *what* is highlighted.
 */

import { Fragment, type ReactNode } from "react";

/**
 * Link targets a section is allowed to point at: absolute web URLs, email and phone links, and
 * same-site paths or anchors.
 *
 * A deny-by-default check rather than a blocklist, so `javascript:` and `data:` URLs cannot be
 * smuggled into an href through a content field. Anything that fails renders as plain text — the
 * words still read correctly, they simply are not clickable.
 */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/|#)/i;

/**
 * Splits text into runs, honouring `**bold**`, `*italic*`, `[[highlight]]` and `[label](url)`
 * (non-nested).
 *
 * `**` is listed before `*` in the pattern so bold wins over italic; otherwise `**x**` would match
 * as an italic run containing an asterisk. `[[…]]` is listed before `[…](…)` so a highlight is
 * never mistaken for a link label.
 */
function tokenize(
  text: string,
  accentClassName: string,
  boldClassName: string,
  linkClassName: string,
): ReactNode[] {
  const pattern = /\*\*([^*]+)\*\*|\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*]+)\*/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  const pushPlain = (value: string) => {
    if (!value) return;
    // Turn newlines into <br/> so multi-line headings keep their breaks.
    const lines = value.split("\n");
    lines.forEach((line, i) => {
      if (line) nodes.push(<Fragment key={key++}>{line}</Fragment>);
      if (i < lines.length - 1) nodes.push(<br key={key++} />);
    });
  };

  while ((match = pattern.exec(text)) !== null) {
    pushPlain(text.slice(last, match.index));
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={key++} className={boldClassName}>
          {match[1]}
        </strong>,
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <span key={key++} className={accentClassName}>
          {match[2]}
        </span>,
      );
    } else if (match[3] !== undefined && match[4] !== undefined) {
      const label = match[3];
      const href = match[4];
      if (SAFE_HREF.test(href)) {
        // Only a link that leaves the site opens a new tab; mailto, tel and same-site paths keep
        // the current one, which is what those are expected to do.
        const external = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={key++}
            href={href}
            className={linkClassName}
            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
          >
            {label}
          </a>,
        );
      } else {
        pushPlain(label);
      }
    } else if (match[5] !== undefined) {
      nodes.push(<em key={key++}>{match[5]}</em>);
    }
    last = pattern.lastIndex;
  }
  pushPlain(text.slice(last));
  return nodes;
}

export function StyledText({
  text,
  accentClassName = "text-primary",
  boldClassName = "font-bold",
  linkClassName = "font-medium text-foreground underline-offset-2 hover:underline",
}: {
  text: string;
  accentClassName?: string;
  /**
   * How a `**bold**` run is styled. Overridable because the emphasis weight and colour vary by
   * band — a dark product page uses a lighter weight against its own text colour — and a single
   * hard-coded weight would visibly change those pages.
   */
  boldClassName?: string;
  /** How a `[label](url)` run is styled. Overridable for the same reason as `boldClassName`. */
  linkClassName?: string;
}) {
  return <>{tokenize(text, accentClassName, boldClassName, linkClassName)}</>;
}

/** Strips the styling markers, for places that need the plain string (SEO titles, alt text). */
export function plainText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}
