import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-6.99L4.6 22H1.34l8.02-9.16L1 2h6.99l4.85 6.41L18.24 2Zm-2.4 18h1.9L7.24 4H5.26l10.58 16Z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.93.26-1.56 1.6-1.56h1.7V4.25C16.5 4.18 15.48 4 14.27 4 11.74 4 10 5.54 10 8.36V10.8H7.3V14H10v8h3.5Z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background">
      {/* Live status ribbon */}
      <div className="border-b border-border bg-secondary/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              PulsePay Network: <span className="text-foreground font-semibold">Operational (99.9%)</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              PulseAssist Engine: <span className="text-foreground font-semibold">Operational</span>
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            status.enice.group
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
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

          <div className="mt-6 flex items-center gap-2">
            {[
              { href: "https://x.com", label: "X", Icon: XIcon },
              { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
              { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-foreground/70 transition-colors hover:border-primary hover:text-primary"
              >
                <s.Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Legal
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
            <li><Link to="/compliance" className="hover:text-primary">Regulatory Compliance</Link></li>
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
