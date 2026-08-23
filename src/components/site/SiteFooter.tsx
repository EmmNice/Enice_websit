import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Mail, MapPin } from "lucide-react";
import { SOCIAL_PROFILES } from "@/lib/seo";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-6.99L4.6 22H1.34l8.02-9.16L1 2h6.99l4.85 6.41L18.24 2Zm-2.4 18h1.9L7.24 4H5.26l10.58 16Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
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

const FOOTER_COLS = [
  {
    heading: "Products",
    links: [
      { label: "PulsePay", to: "/portfolio/pulsepay" },
      { label: "PulseAssist", to: "/portfolio/pulseassist" },
      { label: "PulsePay Payment Collection", to: "/portfolio/payment-collection" },
      { label: "ePulse", to: "/portfolio/epulse" },
      { label: "PulseX", to: "/portfolio/pulsex" },
    ],
  },
  {
    heading: "Updates",
    links: [
      { label: "Blog", to: "/blog/" },
      { label: "News & Changelog", to: "/news/" },
      { label: "Announcements", to: "/announcements/" },
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

const ICONS: Record<string, typeof XIcon> = {
  "X (Twitter)": XIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
};

// URLs come from SOCIAL_PROFILES so the footer and the Organization `sameAs` cannot disagree.
const SOCIAL_LINKS = SOCIAL_PROFILES.map((p) => ({
  href: p.href,
  label: p.label,
  Icon: ICONS[p.label],
}));

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      {/*
        System status ribbon.

        This previously asserted "PulsePay Network: Operational" and "PulseAssist Engine:
        Operational" as hardcoded text on every page of the site — it would have claimed both
        platforms were healthy in the middle of an outage. Nothing here checks anything, so it
        no longer claims anything: it points at /status, where the checks actually run.
      */}
      <div className="border-b border-border bg-secondary/50">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-[11px] font-medium text-muted-foreground">
            Platform availability is checked live on the status page.
          </p>
          <Link
            to="/status"
            className="text-[10px] font-semibold tracking-[0.22em] text-muted-foreground uppercase transition-colors hover:text-foreground"
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
              ENICE Group is a technology company building, owning, and operating the financial and
              AI platforms that power global commerce.
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

      {/*
        Bottom bar. The extra bottom and right padding keeps this clear of the floating
        assistant launcher, which is fixed to the bottom-right corner and was sitting on top of
        the tagline.
      */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 pt-6 pb-24 sm:flex-row sm:items-center sm:px-8 sm:pt-6 sm:pb-6 sm:pr-28">
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
