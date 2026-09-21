import { Link } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { CORPORATE_EMAIL, SOCIAL_PROFILES } from "@/lib/seo";
import { useSiteChrome, visibleNavItems } from "@/lib/cms/use-chrome";

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

/**
 * Four columns, mirroring the header's grouping.
 *
 * Legal was previously mixed in with the company links, which put the privacy policy at the same
 * visual weight as the About page. Splitting it also gets the column counts even.
 */
const FOOTER_COLS = [
  {
    heading: "Products",
    links: [
      { label: "PulsePay", url: "/portfolio/pulsepay" },
      { label: "PulseAssist", url: "/portfolio/pulseassist" },
      { label: "Payment Collection", url: "/portfolio/payment-collection" },
      { label: "ePulse", url: "/portfolio/epulse" },
      { label: "PulseX", url: "/portfolio/pulsex" },
      { label: "All products", url: "/portfolio" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "API documentation", url: "/docs" },
      { label: "Product roadmap", url: "/roadmap" },
      { label: "System status", url: "/status" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About ENICE Group", url: "/about" },
      { label: "Contact", url: "/contact" },
      { label: "Blog", url: "/blog/" },
      { label: "News & changelog", url: "/news/" },
      { label: "Announcements", url: "/announcements/" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", url: "/privacy" },
      { label: "Terms of service", url: "/terms" },
      { label: "Regulatory compliance", url: "/compliance" },
    ],
  },
];

/** Shown until the CMS footer settings resolve, and if they never do. */
const DEFAULT_TAGLINE =
  "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.";

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

  /*
   * Columns, tagline, copyright and the socials toggle come from Website → Footer when the CMS
   * answers, and from the built-ins until it does. Those admin screens had been editable since the
   * CMS shipped while this component rendered its own constants, so a footer edit did nothing.
   * A column with no usable links is dropped rather than rendered as a bare heading.
   */
  const { footer } = useSiteChrome();

  const columns =
    footer?.columns
      ?.map((column) => ({
        heading: column.heading?.trim() ?? "",
        links: visibleNavItems(column.links),
      }))
      .filter((column) => column.heading && column.links.length > 0) ?? null;

  const cols = columns && columns.length > 0 ? columns : FOOTER_COLS;
  const tagline = footer?.tagline?.trim() || DEFAULT_TAGLINE;
  const copyright = footer?.copyright?.trim() || `© ${year} ENICE Group. All rights reserved.`;
  const showSocials = footer?.showSocials !== false;

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* The footer is the one place the ambient warm light sits low in the frame, which closes
          the page rather than leaving it to end on a flat edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
        style={{
          background:
            "radial-gradient(48rem 18rem at 50% 100%, rgb(255 149 41 / 0.05), transparent 70%)",
        }}
      />

      {/*
        Status ribbon.

        This previously asserted "PulsePay Network: Operational" and "PulseAssist Engine:
        Operational" as hardcoded text on every page of the site — it would have claimed both
        platforms were healthy in the middle of an outage. Nothing here checks anything, so it
        no longer claims anything: it points at /status, where the checks actually run.
      */}
      <div className="relative border-b border-border">
        <div className="page-shell flex flex-col items-start gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-bone-soft">
            Platform availability is checked live on the status page.
          </p>
          <Link
            to="/status"
            className="tap text-[10px] font-semibold uppercase tracking-[0.22em] text-bone-soft transition-colors hover:text-gold"
          >
            View status page →
          </Link>
        </div>
      </div>

      <div className="page-shell relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-8">
          {/* Brand column */}
          <div className="lg:max-w-xs">
            <Logo />
            <p className="mt-5 text-[13px] leading-relaxed text-bone-soft">{tagline}</p>

            {showSocials && (
              <ul className="mt-6 flex items-center gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`ENICE Group on ${s.label}`}
                      className="grid h-11 w-11 place-items-center rounded-md border border-border text-bone-soft transition-colors hover:border-gold/40 hover:text-gold"
                    >
                      <s.Icon className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 space-y-3">
              <a
                href={`mailto:${CORPORATE_EMAIL}`}
                className="tap flex items-center gap-2.5 text-[13px] text-bone-soft transition-colors hover:text-foreground"
              >
                <Mail aria-hidden className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.75} />
                {CORPORATE_EMAIL}
              </a>
              <p className="flex items-start gap-2.5 text-[13px] text-bone-soft">
                <MapPin
                  aria-hidden
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold"
                  strokeWidth={1.75}
                />
                Abuja and Kaduna, Nigeria
              </p>
            </div>
          </div>

          {/* Navigation columns */}
          {cols.map((col) => (
            <nav key={col.heading} aria-labelledby={`footer-${col.heading}`}>
              <h2 id={`footer-${col.heading}`} className="eyebrow eyebrow-muted">
                {col.heading}
              </h2>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.url as "/"}
                      className="tap block text-[13px] text-bone-strong transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/*
        Bottom bar. The extra bottom and right padding keeps this clear of the floating
        assistant launcher, which is fixed to the bottom-right corner and was sitting on top of
        the tagline.
      */}
      <div className="relative border-t border-border">
        <div
          className="page-shell safe-bottom flex flex-col items-start justify-between gap-3 pb-24 pt-6 sm:flex-row sm:items-center sm:pb-6 sm:pr-28"
          style={{ ["--safe-pad" as string]: "6rem" }}
        >
          <p className="type-meta">{copyright}</p>
          <p className="type-meta">Registered in the Federal Republic of Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
