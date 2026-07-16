import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

type NavLink = { label: string; to?: string; hash?: string };

const navLinks: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Blog", to: "/blog/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

function scrollToHash(hash: string) {
  if (typeof window === "undefined") return;
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const goToHash = (hash: string) => {
    setOpen(false);
    if (pathname === "/") {
      setTimeout(() => scrollToHash(hash), 180);
    } else {
      navigate({ to: "/", hash: hash.replace("#", "") }).then(() => {
        setTimeout(() => scrollToHash(hash), 220);
      });
    }
  };

  const goToRoute = (to: string) => {
    setOpen(false);
    setTimeout(() => {
      if (pathname === to && to === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate({ to });
      }
    }, 140);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md transition-shadow duration-200 ${scrolled ? "shadow-sm" : ""}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Logo />
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to ?? "/"}
                className="rounded-md px-3.5 py-2 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground [&.active]:text-foreground [&.active]:font-semibold"
                activeProps={{ className: "active" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="group hidden items-center gap-1.5 rounded-md border border-primary bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 md:inline-flex"
            >
              Get in Touch
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </Link>

            {/* Mobile hamburger */}
            <button
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary md:hidden"
            >
              <Menu className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-50 md:hidden ${
          open
            ? "pointer-events-auto opacity-100 transition-opacity duration-300"
            : "pointer-events-none invisible opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[88%] max-w-sm border-r border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <Logo />
            <button
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="px-3 py-6">
            <div className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Navigate
            </div>
            <ul className="space-y-1">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => (l.to ? goToRoute(l.to) : goToHash(l.hash!))}
                    className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-[15px] font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {l.label}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="px-6 pt-2 pb-6">
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="group flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Get in Touch
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-border px-6 py-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              ENICE Group
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Building infrastructure for what's next.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
