/**
 * Renders a tiny, safe inline-styling syntax used across editable site sections.
 *
 * Two markers, chosen so an administrator can style copy from a plain text field without any way
 * to inject markup (nothing here interprets HTML):
 *
 *   **bold**        →  bold text
 *   [[highlight]]   →  the section's accent colour (the brand blue)
 *
 * A newline in the text becomes a line break, so a headline can be split across lines exactly
 * where the editor puts the breaks. The accent colour is passed in per section rather than fixed,
 * because the right colour depends on the section's background — this keeps the design system in
 * control of *how* a highlight looks while letting the editor choose *what* is highlighted.
 */

import { Fragment, type ReactNode } from "react";

/**
 * Splits text into runs, honouring `**bold**`, `*italic*` and `[[highlight]]` (non-nested).
 *
 * `**` is listed before `*` in the pattern so bold wins over italic; otherwise `**x**` would match
 * as an italic run containing an asterisk.
 */
function tokenize(text: string, accentClassName: string, boldClassName: string): ReactNode[] {
  const pattern = /\*\*([^*]+)\*\*|\[\[([^\]]+)\]\]|\*([^*]+)\*/g;
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
    } else if (match[3] !== undefined) {
      nodes.push(<em key={key++}>{match[3]}</em>);
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
}: {
  text: string;
  accentClassName?: string;
  /**
   * How a `**bold**` run is styled. Overridable because the emphasis weight and colour vary by
   * band — a dark product page uses a lighter weight against its own text colour — and a single
   * hard-coded weight would visibly change those pages.
   */
  boldClassName?: string;
}) {
  return <>{tokenize(text, accentClassName, boldClassName)}</>;
}

/** Strips the styling markers, for places that need the plain string (SEO titles, alt text). */
export function plainText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}
