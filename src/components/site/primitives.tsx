/**
 * The public site's design-system primitives.
 *
 * ## Why these exist
 *
 * Every band on the site used to style itself: a survey found eight different section paddings,
 * five container widths, four grid-line colours and 31 spellings of the near-black background.
 * The page read as a stack of individually-designed sections rather than one product, and any
 * change to the rhythm meant editing twenty files.
 *
 * These components own that vocabulary instead. A section declares *what it is* — a band, a
 * heading group, a card, a primary action — and the system decides the spacing, radius, border
 * opacity and type scale. There is deliberately no prop for padding, colour or font size.
 *
 * ## Separation without bands
 *
 * The site is one continuous near-black environment, so sections are separated by rhythm,
 * hairlines and a slight surface lift — not by alternating light and dark blocks. `tone`
 * therefore offers only `canvas` (the default) and `recessed`, which is a ~3% lift used
 * sparingly for a band that genuinely needs to sit back.
 */

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StyledText } from "./StyledText";

// ─── Container ────────────────────────────────────────────────────────────────

type ContainerWidth = "page" | "narrow" | "prose";

const CONTAINER_CLASS: Record<ContainerWidth, string> = {
  page: "page-shell",
  narrow: "page-shell-narrow",
  prose: "page-shell-prose",
};

/**
 * The central content grid. `page` is the default 80rem column; `narrow` (64rem) is for
 * single-column editorial content and `prose` (46rem) for long-form reading.
 */
export function Container({
  width = "page",
  className,
  children,
}: {
  width?: ContainerWidth;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(CONTAINER_CLASS[width], className)}>{children}</div>;
}

// ─── Section ──────────────────────────────────────────────────────────────────

type SectionSpacing = "default" | "tight" | "loose" | "none";
type SectionTone = "canvas" | "recessed";

const SPACING_CLASS: Record<SectionSpacing, string> = {
  default: "section",
  tight: "section-tight",
  loose: "section-loose",
  none: "",
};

export interface SectionProps {
  id?: string;
  /** Vertical rhythm. Fluid; never hand-tuned per breakpoint. */
  spacing?: SectionSpacing;
  /** `recessed` lifts the surface ~3%. Use rarely — the page should read as continuous. */
  tone?: SectionTone;
  /** A hairline that fades at both ends, for an editorial break with no colour change. */
  divider?: boolean;
  /** Ambient warm lighting. `center` for a band opening, `spread` for a full-width field. */
  glow?: "none" | "center" | "spread";
  /** The technical grid backdrop. */
  grid?: boolean;
  /** Width of the inner container. Pass `null` to lay out the children yourself. */
  container?: ContainerWidth | null;
  className?: string;
  containerClassName?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
}

/**
 * One band of the page. Owns vertical rhythm, the container, and any decorative backdrop —
 * all of which are `aria-hidden` and pointer-transparent so they never affect the reading order.
 */
export function Section({
  id,
  spacing = "default",
  tone = "canvas",
  divider = false,
  glow = "none",
  grid = false,
  container = "page",
  className,
  containerClassName,
  children,
  ...rest
}: SectionProps) {
  const decorated = glow !== "none" || grid;

  return (
    <section
      id={id}
      className={cn(
        "relative",
        SPACING_CLASS[spacing],
        tone === "recessed" && "bg-surface-1",
        decorated && "overflow-hidden",
        className,
      )}
      {...rest}
    >
      {divider && <hr aria-hidden className="rule-fade absolute inset-x-0 top-0 border-0" />}
      {grid && <div aria-hidden className="tech-grid" />}
      {glow === "center" && <div aria-hidden className="mesh-glow-center" />}
      {glow === "spread" && <div aria-hidden className="mesh-glow" />}

      {container === null ? (
        children
      ) : (
        <Container width={container} className={cn("relative", containerClassName)}>
          {children}
        </Container>
      )}
    </section>
  );
}

// ─── Headings ─────────────────────────────────────────────────────────────────

/**
 * A small uppercase label. Warm by default — this is the one place the gold accent appears on
 * nearly every page, which is exactly the "small highlight" the accent is reserved for.
 */
export function Eyebrow({
  children,
  muted = false,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  muted?: boolean;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={cn("eyebrow", muted && "eyebrow-muted", className)}>
      {typeof children === "string" ? <StyledText text={children} /> : children}
    </Tag>
  );
}

/**
 * The standard section opening: label, heading, supporting copy.
 *
 * Headings render at the `type-h2` role and accept the CMS `**bold**` / `[[highlight]]` syntax,
 * so an edited heading keeps its emphasis. `level` exists so a band can sit correctly in the
 * document outline without changing how it looks — an `h3` inside an `h2` section still reads as
 * a section heading visually, which is what keeps the heading hierarchy honest.
 */
export function SectionIntro({
  eyebrow,
  heading,
  lead,
  level = 2,
  align = "start",
  id,
  className,
  children,
}: {
  eyebrow?: string;
  heading: string;
  lead?: string;
  level?: 1 | 2 | 3;
  align?: "start" | "center";
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  const Heading = `h${level}` as ElementType;
  const centered = align === "center";

  return (
    <div
      className={cn(
        "max-w-3xl",
        centered && "mx-auto text-center",
        eyebrow || lead ? "" : "",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Heading
        id={id}
        className={cn(
          level === 1 ? "type-display" : "type-h2",
          "text-foreground",
          eyebrow && "mt-5",
        )}
      >
        <StyledText text={heading} accentClassName="text-gold" />
      </Heading>
      {lead && (
        <p className={cn("type-lead mt-5 max-w-2xl", centered && "mx-auto")}>
          <StyledText text={lead} accentClassName="text-gold" />
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Surfaces ─────────────────────────────────────────────────────────────────

/**
 * The single card treatment. `interactive` adds a tonal hover — colour and border only, never a
 * lift, so a grid of cards does not bob as the pointer crosses it.
 */
export function Panel({
  as: Tag = "div",
  tone = "default",
  interactive = false,
  raised = false,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  tone?: "default" | "quiet";
  interactive?: boolean;
  raised?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">) {
  return (
    <Tag
      className={cn(
        raised ? "panel-raised" : tone === "quiet" ? "panel-quiet" : "panel",
        interactive && "panel-interactive",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * A grid whose cells are separated by exact 1px hairlines.
 *
 * Children sit on the border colour and paint their own background. Because the section behind
 * them may be `recessed`, cells inherit `bg-background` by default and can be overridden.
 *
 * Cards stack on a phone and pick up columns from `sm`. This deliberately does NOT become a
 * horizontal swipe row: an earlier version did, and it trapped vertical scrolling on Android —
 * see the note on `.card-row` in `styles.css`.
 */
export function HairlineGrid({
  columns = 3,
  className,
  children,
}: {
  columns?: 2 | 3 | 4;
  className?: string;
  children: ReactNode;
}) {
  const cols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return <div className={cn("grid-hairline", cols, className)}>{children}</div>;
}

/** The small monospaced index that numbers a card within its grid. */
export function CardIndex({ value }: { value: string | number }) {
  return (
    <span className="font-mono text-[11px] font-semibold tracking-[0.22em] text-bone-faint">
      /{typeof value === "number" ? String(value).padStart(2, "0") : value}
    </span>
  );
}

/**
 * A bordered icon tile. Warm-tinted, at the small scale the accent is meant for.
 */
export function IconTile({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: ElementType;
  size?: "sm" | "md";
  className?: string;
}) {
  const box = size === "sm" ? "h-10 w-10 rounded-lg" : "h-12 w-12 rounded-xl";
  const glyph = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center border border-gold/20 bg-gold/[0.07] text-gold",
        box,
        className,
      )}
    >
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  );
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type CtaVariant = "primary" | "secondary" | "ghost";
type CtaSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<CtaSize, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

/**
 * A call to action.
 *
 * Resolves its own element: an in-app path becomes a TanStack `Link` (client navigation, no full
 * reload) and anything else an anchor with the right `rel`. The homepage hero previously used raw
 * `<a href="/portfolio">` for both CTAs, which tore down and rebooted the whole application on
 * the most-clicked link on the site.
 *
 * `icon` is limited to the two arrows the brand uses: forward for "continue here", up-right for
 * "this goes somewhere else".
 */
export function Cta({
  to,
  variant = "primary",
  size = "md",
  icon = "none",
  className,
  children,
  ...rest
}: {
  to: string;
  variant?: CtaVariant;
  size?: CtaSize;
  icon?: "none" | "arrow" | "external";
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">) {
  const classes = cn("btn", `btn-${variant}`, SIZE_CLASS[size], "group", className);

  const glyph =
    icon === "arrow" ? (
      <ArrowRight
        aria-hidden
        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    ) : icon === "external" ? (
      <ArrowUpRight
        aria-hidden
        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
      />
    ) : null;

  const body = (
    <>
      {children}
      {glyph}
    </>
  );

  // Site-relative paths get client-side routing; hashes, mailto:, tel: and absolute URLs do not.
  const isInternal = to.startsWith("/") && !to.startsWith("//");

  if (isInternal) {
    return (
      // TanStack validates `to` against the generated route tree. CMS-editable URLs are strings,
      // so the cast is unavoidable; an unknown path renders and simply 404s, which is correct.
      <Link to={to as "/"} className={classes} {...rest}>
        {body}
      </Link>
    );
  }

  const external = /^https?:\/\//.test(to);

  return (
    <a
      href={to}
      className={classes}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...rest}
    >
      {body}
    </a>
  );
}

/**
 * A quieter text link with a trailing arrow, for "see all" affordances beside a heading.
 */
export function TextLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  const classes = cn(
    "group inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground",
    "transition-colors hover:text-gold",
    className,
  );
  const body = (
    <>
      {children}
      <ArrowRight
        aria-hidden
        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </>
  );

  if (to.startsWith("/") && !to.startsWith("//")) {
    return (
      <Link to={to as "/"} className={classes}>
        {body}
      </Link>
    );
  }
  return (
    <a href={to} className={classes} target="_blank" rel="noreferrer noopener">
      {body}
    </a>
  );
}

// ─── Data display ─────────────────────────────────────────────────────────────

/**
 * A label/value pair, as used for product facts and capability tiles.
 *
 * Values are tabular-figured so a row of them aligns on the digits rather than drifting.
 */
export function Metric({
  label,
  value,
  align = "start",
  className,
}: {
  label: string;
  value: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <div className="tnum text-[1.0625rem] font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
        {label}
      </div>
    </div>
  );
}

/**
 * A small pill for state and category.
 *
 * `positive` is the one non-warm accent on the site and is reserved for genuine availability
 * signals — it must never be used to assert a status nothing has checked.
 */
export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "warm" | "positive";
  className?: string;
}) {
  const tones = {
    neutral: "border-border bg-surface-1 text-bone-strong",
    warm: "border-gold/25 bg-gold/[0.08] text-gold",
    positive: "border-positive/25 bg-positive/[0.08] text-positive",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1",
        "text-[10px] font-semibold uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
