import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            ENICE Group — a technology venture studio and infrastructure holding firm,
            engineering full-stack platforms for global commerce.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            SMEDAN Registered · Nano Enterprise
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Ecosystem
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
            <li>
              <Link to="/portfolio" className="transition-colors hover:text-primary">
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition-colors hover:text-primary">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Offices
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
            <li>Abuja, Nigeria</li>
            <li>Kaduna, Nigeria</li>
          </ul>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Legal
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
            <li>
              <a href="#" className="transition-colors hover:text-primary">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-primary">
                Compliance
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-primary">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 sm:flex-row sm:items-center sm:px-8">
          <p className="text-[11px] font-medium text-muted-foreground">
            © {year} ENICE Group. All rights reserved.
          </p>
          <p className="text-[11px] font-medium text-muted-foreground">
            Enterprise Infrastructure · Built with intent
          </p>
        </div>
      </div>
    </footer>
  );
}
