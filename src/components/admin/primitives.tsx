/**
 * The Website Manager's UI primitives.
 *
 * ## Why these are hand-built
 *
 * The public site vendors only two shadcn components (`accordion`, `dialog`) — the codebase's
 * convention is to write what it needs rather than pull in a component library. That convention is
 * kept here, and it also lets the admin panel share the site's design tokens directly: every
 * colour below is a CSS custom property from `src/styles.css`, so the panel and the website cannot
 * drift apart, and a change to the brand palette moves both.
 *
 * ## The visual language
 *
 * Deliberately restrained, because the alternative reads as a template. Flat surfaces with hairline
 * borders, one elevation level for things that float, tight tracking on headings, generous vertical
 * rhythm, and a single accent colour used sparingly for primary actions and active state. No
 * gradients, no coloured panels, no drop shadows on static content.
 */

import { forwardRef, useId, type ReactNode } from "react";
import { Check, ChevronDown, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/cms/types";

// ─── Buttons ─────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-[0_1px_2px_rgba(17,24,39,0.08)]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border",
  outline: "border border-border bg-card text-foreground hover:bg-secondary/60",
  ghost: "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-2.5 text-[12px]",
  md: "h-9 gap-2 px-3.5 text-[13px]",
  lg: "h-11 gap-2 px-5 text-[14px]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Swaps the icon for a spinner and disables the button, so double-submits are impossible. */
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    loading = false,
    icon: Icon,
    iconPosition = "left",
    className,
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref,
) {
  const iconNode = loading ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
  ) : Icon ? (
    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
  ) : null;

  return (
    <button
      ref={ref}
      type={type}
      // A loading button must not be clickable again; relying on the caller to also pass
      // `disabled` would eventually be forgotten and produce duplicate writes.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold whitespace-nowrap transition-colors",
        "focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...rest}
    >
      {iconPosition === "left" && iconNode}
      {children}
      {iconPosition === "right" && iconNode}
    </button>
  );
});

/** A square icon-only button. `label` is required — it becomes the accessible name. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "children" | "icon"> & { icon: LucideIcon; label: string }
>(function IconButton(
  { icon: Icon, label, variant = "ghost", size = "md", className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md transition-colors",
        "focus-visible:ring-ring outline-none focus-visible:ring-2",
        "disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9",
        className,
      )}
      {...rest}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" />
    </button>
  );
});

// ─── Surfaces ────────────────────────────────────────────────────────────────

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-border bg-card rounded-xl border", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  actions,
  icon: Icon,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="bg-secondary text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-foreground text-[15px] font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-[12.5px] leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Page-level heading. Kept separate from `CardHeader` so the two scales stay distinct. */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-foreground text-[22px] font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 max-w-2xl text-[13px] leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

// ─── Status and badges ───────────────────────────────────────────────────────

/**
 * Tone → colour, in one place.
 *
 * Every status in the system (content states, AI request states, account states) maps to a
 * `StatusTone`, so a pill's colour is never chosen at the call site. That is what stops "published"
 * being green on one screen and blue on another.
 */
const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-secondary text-muted-foreground border-border",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
};

const TONE_DOTS: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground/50",
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

export function StatusPill({
  tone = "neutral",
  children,
  dot = true,
  className,
}: {
  tone?: StatusTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOTS[tone])} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "bg-secondary text-muted-foreground inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wide uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Form controls ───────────────────────────────────────────────────────────

/**
 * A labelled form field.
 *
 * The label is wired to the control with a generated id, and the hint or error is wired with
 * `aria-describedby`, so screen readers announce the constraint along with the field rather than
 * leaving it as unattached text nearby.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
  className,
  action,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => ReactNode;
  htmlFor?: string;
  className?: string;
  action?: ReactNode;
}) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-foreground block text-[12.5px] font-semibold">
          {label}
          {required && (
            <span className="text-destructive ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {action}
      </div>

      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-[11.5px]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-[11.5px] leading-relaxed">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL_CLASSES =
  "border-border bg-background text-foreground placeholder:text-muted-foreground/60 w-full rounded-md border px-3 text-[13px] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/15";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(CONTROL_CLASSES, "h-9", className)} {...rest} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(CONTROL_CLASSES, "resize-y py-2 leading-relaxed", className)}
      {...rest}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string }
>(function Select({ className, children, placeholder, ...rest }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(CONTROL_CLASSES, "h-9 appearance-none pr-8", className)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  );
});

/**
 * A switch.
 *
 * `role="switch"` with `aria-checked` rather than a styled checkbox: assistive technology then
 * announces "on/off" instead of "checked", which is what a visibility toggle actually means.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-foreground text-[12.5px] font-semibold">{label}</p>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-[11.5px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === "string" ? label : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[3px]",
          )}
        />
      </button>
    </div>
  );
}

/** A segmented control, for two to four mutually exclusive options. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  className,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string; icon?: LucideIcon }[];
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("border-border bg-secondary inline-flex rounded-md border p-0.5", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded font-semibold transition-colors",
              size === "sm" ? "px-2 py-1 text-[11.5px]" : "px-2.5 py-1.5 text-[12px]",
              active
                ? "bg-card text-foreground shadow-[0_1px_2px_rgba(17,24,39,0.06)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** A checkbox with a visible tick, for multi-select lists. */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 text-[12.5px]",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span className="text-foreground">{label}</span>
    </label>
  );
}

// ─── Tables ──────────────────────────────────────────────────────────────────

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <table className={cn("w-full border-collapse text-left", className)}>{children}</table>
    </div>
  );
}

export function Th({ children, className, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "bg-secondary text-muted-foreground border-border border-b px-4 py-2.5 text-[10.5px] font-bold tracking-wider whitespace-nowrap uppercase",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("border-border border-b px-4 py-3 text-[13px] align-middle", className)}
      {...rest}
    >
      {children}
    </td>
  );
}

/** A hoverable row. Rows are not clickable wholesale — see the note in `EmptyState`. */
export function Tr({ children, className, ...rest }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-secondary/40 transition-colors", className)} {...rest}>
      {children}
    </tr>
  );
}

// ─── States ──────────────────────────────────────────────────────────────────

/**
 * An empty state.
 *
 * Always says what the thing is *for* and offers the action that creates the first one. "No blog
 * posts yet" alone leaves someone hunting for the button; a described empty state is the cheapest
 * onboarding a tool can have.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <span className="bg-secondary text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-foreground text-[15px] font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1.5 max-w-sm text-[13px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/**
 * A loading placeholder.
 *
 * Shaped like the content it replaces, so the layout does not jump when data arrives. A centred
 * spinner is easier to write and worse to use.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-secondary animate-pulse rounded-md", className)} aria-hidden="true" />
  );
}

export function SkeletonRows({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("text-muted-foreground h-4 w-4 animate-spin", className)}
      aria-hidden="true"
    />
  );
}

/**
 * An error state with a retry.
 *
 * Shows the server's message verbatim. A generic "something went wrong" throws away the one piece
 * of information that would let someone resolve it themselves.
 */
export function ErrorState({
  title = "Could not load this",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "border-destructive/25 bg-destructive/[0.03] rounded-xl border px-6 py-10 text-center",
        className,
      )}
    >
      <h3 className="text-foreground text-[15px] font-semibold">{title}</h3>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/**
 * A banner explaining that an optional integration is not configured.
 *
 * Used where a capability is genuinely unavailable — media storage, the AI manager. It names the
 * environment variables to set, because the person reading it is usually also the person who can
 * set them, and "contact your administrator" is useless when you *are* the administrator.
 */
export function NotConfiguredNotice({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-4 text-[12.5px] leading-relaxed",
        className,
      )}
    >
      <p className="mb-1 font-semibold text-amber-900">{title}</p>
      <div className="space-y-1 text-amber-800">{children}</div>
    </div>
  );
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

/** A filter/action bar above a list. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-4 flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

/** A labelled statistic. Used across the dashboard and detail sidebars. */
export function Metric({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: StatusTone;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            {label}
          </p>
          <p className="text-foreground mt-1.5 text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          {hint && <p className="text-muted-foreground mt-1 text-[11.5px]">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              tone ? TONE_CLASSES[tone] : "bg-secondary text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </Card>
  );
}

/** A key/value row, for detail panels. */
export function DetailRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="border-border flex items-start justify-between gap-4 border-b py-2.5 last:border-0">
      <span className="text-muted-foreground shrink-0 text-[12px]">{label}</span>
      <span className="text-foreground min-w-0 text-right text-[12.5px] font-medium">
        {children}
      </span>
    </div>
  );
}

/** A hairline divider with an optional centred label. */
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-border my-6" />;
  return (
    <div className="my-6 flex items-center gap-3">
      <hr className="border-border flex-1" />
      <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
        {label}
      </span>
      <hr className="border-border flex-1" />
    </div>
  );
}
