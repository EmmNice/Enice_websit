import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

const nav = [
  { label: "Portfolio", to: "/portfolio" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-8 lg:grid-cols-[auto_1fr_auto]">
        <Logo />
        <nav className="hidden justify-center lg:flex">
          <ul className="flex items-center gap-12 text-[12px] font-medium text-muted-foreground">
            {nav.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="transition-colors hover:text-foreground"
                  activeProps={{ className: "text-foreground" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          to="/contact"
          className="group inline-flex items-center gap-1.5 rounded-md border border-foreground bg-foreground px-4 py-2 text-[12px] font-semibold text-background transition-all hover:bg-foreground/90"
        >
          Get in Touch
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
        </Link>
      </div>
    </header>
  );
}
