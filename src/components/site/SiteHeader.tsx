import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

type DrawerLink = { label: string; to?: string; hash?: string };

const drawerLinks: DrawerLink[] = [
  { label: "Home", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "About Us", to: "/about" },
];

function scrollToHash(hash: string) {
  if (typeof window === "undefined") return;
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-8 sm:py-5">
          <button
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary"
          >
            <Menu className="h-4 w-4" strokeWidth={2} />
          </button>

          <div className="flex justify-center sm:justify-start sm:pl-2">
            <Logo />
          </div>

          <Link
            to="/contact"
            className="group inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3.5 py-2 text-[11px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:px-4 sm:text-[12px]"
          >
            Get in Touch
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </Link>
        </div>
      </header>

      {/* Drawer */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
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
              {drawerLinks.map((l) => (
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
          <div className="absolute bottom-0 left-0 right-0 border-t border-border px-6 py-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              ENICE Group
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Engineering the infrastructure for tomorrow.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
