import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Mail, MapPin } from "lucide-react";

// ─── Social icon components ───────────────────────────────────────────────────

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

// ─── Navigation columns ───────────────────────────────────────────────────────

const FOOTER_COLS = [
  {
    heading: "Ventures",
    links: [
      { label: "PulsePay", to: "/portfolio/pulsepay" },
      { label: "PulseAssist", to: "/portfolio/pulseassist" },
      { label: "ePulse", to: "/portfolio/epulse" },
      { label: "PulseX", to: "/portfolio/pulsex" },
    ],
  },
  {
    heading: "Updates",
    links: [
      { label: "Blog", to: "/blog/" },
      { label: "Announcement", to: "/blog/" },
      { label: "Roadmap", to: "/roadmap" },
      { label: "System Status", to: "/status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Regulatory Compliance", to: "/compliance" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "https://x.com/ENICEHQ", label: "X (Twitter)", Icon: XIcon },
  { href: "https://www.instagram.com/enicehq", label: "Instagram", Icon: InstagramIcon },
  { href: "https://www.facebook.com/share/1Nx7q11BZK/", label: "Facebook", Icon: FacebookIcon },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">

      {/* System status ribbon */}
      <div className="border-b border-border bg-secondary/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              PulsePay Network:{" "}
              <span className="font-semibold text-foreground">Operational</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              PulseAssist Engine:{" "}
              <span className="font-semibold text-foreground">Operational</span>
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            status.enice.group
          </span>
        </div>
      </div>

      {/* Main body */}
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(3,1fr)]">

          {/* Brand column */}
          <div>
            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
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

            {/* Contact */}
            <div className="mt-8 space-y-2.5">
              <a
                href="mailto:corporate@enicehq.com"
                className="flex items-center gap-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} />
                corporate@enicehq.com
              </a>
              <div className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} />
                Abuja and Kaduna, Nigeria
              </div>
            </div>
          </div>

          {/* Navigation columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {col.heading}
              </div>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {"href" in l ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[13px] text-foreground/75 transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.to as "/"}
                        className="text-[13px] text-foreground/75 transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 sm:flex-row sm:items-center sm:px-8">
          <p className="text-[11px] font-medium text-muted-foreground">
            © {year} ENICE Group. All rights reserved.
          </p>
          <p className="text-[11px] font-medium text-muted-foreground">
            Enterprise infrastructure, built with intent.
          </p>
        </div>
      </div>

    </footer>
  );
}
