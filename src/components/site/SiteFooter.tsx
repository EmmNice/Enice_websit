import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Mail, MapPin } from "lucide-react";

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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

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
      { label: "Announcements", to: "/blog/" },
      { label: "Roadmap", to: "/roadmap" },
      { label: "System Status", to: "/status" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About ENICE Group", to: "/about" },
      { label: "Contact", to: "/contact" },
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
  { href: "https://www.linkedin.com/company/enicehq", label: "LinkedIn", Icon: LinkedInIcon },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">

      {/* System status ribbon */}
      <div className="border-b border-border bg-secondary/50">
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
          <Link
            to="/status"
            className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            View Status Page →
          </Link>
        </div>
      </div>

      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.8fr_repeat(3,1fr)]">

          {/* Brand column */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              A technology venture studio and infrastructure holding company —
              building the financial and AI platforms that power global
              commerce.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-foreground/60 transition-colors hover:border-primary hover:text-primary"
                >
                  <s.Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-6 space-y-2.5">
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
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                {col.heading}
              </div>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to as "/"}
                      className="text-[13px] text-foreground/65 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
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
