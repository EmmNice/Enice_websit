import { Link, useRouterState } from "@tanstack/react-router";

export function Logo({ size = "md" }: { size?: "md" | "sm" }) {
  const big = size === "md" ? "text-[1.35rem]" : "text-base";
  const tag = size === "md" ? "text-[9px]" : "text-[8px]";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <Link to="/" onClick={handleClick} className="flex items-center gap-2.5">
      <div className={`flex items-baseline ${big} tracking-tight`}>
        <span className="font-extrabold text-foreground">E</span>
        <span className="font-light tracking-[0.28em] text-foreground/85 -ml-px">NICE</span>
      </div>
      <span
        className={`${tag} font-semibold uppercase tracking-[0.32em] text-muted-foreground border-l border-border pl-2.5`}
      >
        Group
      </span>
    </Link>
  );
}
