import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * The ENICE Group wordmark.
 *
 * The four-stop brand gradient (`--mark-1` → `--mark-4`) is applied to the `E` alone, via the
 * `.enice-mark` class. That restraint is deliberate: the gradient is the one piece of overt metal
 * in the identity, and running it across the whole wordmark turns the header into a gold banner —
 * the opposite of what the palette is for. The remaining letters stay bone.
 *
 * `aria-label` carries the readable name because the mark is split across styled spans, which a
 * screen reader would otherwise announce as "E NICE".
 */
export function Logo({ size = "md", className }: { size?: "md" | "sm"; className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const wordmark = size === "md" ? "text-[1.3rem]" : "text-base";
  const tag = size === "md" ? "text-[10px]" : "text-[9px]";

  // Already home: scroll to the top instead of a no-op navigation.
  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      aria-label="ENICE Group — home"
      className={cn("tap group flex items-center gap-2.5 rounded-sm", className)}
    >
      <span aria-hidden className={cn("flex items-baseline tracking-tight", wordmark)}>
        <span className="enice-mark font-extrabold">E</span>
        <span className="-ml-px font-light tracking-[0.28em] text-foreground">NICE</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "border-l border-border pl-2.5 font-semibold uppercase tracking-[0.32em] text-bone-faint",
          "transition-colors duration-200 group-hover:text-bone-soft",
          tag,
        )}
      >
        Group
      </span>
    </Link>
  );
}
