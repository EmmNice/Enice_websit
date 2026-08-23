/**
 * PartnersStrip — infinite marquee of ecosystem & infrastructure partners.
 *
 * Content comes from the CMS section `home.partners` (admin → Website → Website Sections →
 * Partners strip). Each partner has a name, an optional sub-line (tagline), an optional uploaded
 * logo and an optional link, so the site owner curates this band themselves.
 *
 * What shows is exactly what is in the CMS — the infrastructure providers are seeded there as real
 * entries, so they can be edited, reordered or removed individually, and adding a new partner adds
 * to the strip rather than replacing anything. The built-in list below is only a paint-time and
 * outage fallback; once the section loads, the CMS is authoritative, including when it is empty.
 */

import { useEffect, useState } from "react";
import { fetchBootstrap, sectionFields } from "@/lib/cms/public-client";

interface Partner {
  name: string;
  tagline: string;
  logo: string;
  url: string;
}

/**
 * Shown before the CMS section has loaded, and if it can't be reached, so the homepage is never
 * blank. Mirrors the seeded section content, so the common case has no visible change on load.
 */
const DEFAULT_PARTNERS: Partner[] = [
  {
    name: "Amazon Web Services",
    tagline: "Cloud Infrastructure",
    logo: "/partners/aws.svg",
    url: "https://aws.amazon.com",
  },
  {
    name: "Google Cloud",
    tagline: "AI & Compute",
    logo: "/partners/googlecloud.svg",
    url: "https://cloud.google.com",
  },
  {
    name: "Supabase",
    tagline: "Database & Auth",
    logo: "/partners/supabase.svg",
    url: "https://supabase.com",
  },
  {
    name: "Vercel",
    tagline: "Edge Delivery",
    logo: "/partners/vercel.svg",
    url: "https://vercel.com",
  },
  {
    name: "AWS Activate",
    tagline: "Startup Program",
    logo: "/partners/aws-activate.svg",
    url: "https://aws.amazon.com/activate/",
  },
  {
    name: "Resend",
    tagline: "Transactional Email",
    logo: "/partners/resend.svg",
    url: "https://resend.com",
  },
];

const DEFAULT_HEADING = "Built on trusted infrastructure partners";

function readPartners(fields: Record<string, unknown> | null): Partner[] {
  const items = fields?.items;
  if (!Array.isArray(items)) return [];
  return items
    .map((raw) => {
      const row = (raw ?? {}) as Record<string, unknown>;
      return {
        name: typeof row.name === "string" ? row.name.trim() : "",
        tagline: typeof row.tagline === "string" ? row.tagline.trim() : "",
        logo: typeof row.logo === "string" ? row.logo.trim() : "",
        url: typeof row.url === "string" ? row.url.trim() : "",
      };
    })
    .filter((p) => p.name.length > 0);
}

/** Two initials from a name, for partners with no uploaded logo. */
function monogram(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * Repeats the source list until there are enough tiles for a smooth loop, then doubles it so the
 * marquee wraps seamlessly. Without this, one or two partners would leave large gaps.
 */
function buildTrack(items: Partner[]): Partner[] {
  if (items.length === 0) return [];
  const filled = [...items];
  while (filled.length < 8) filled.push(...items);
  return [...filled, ...filled];
}

export function PartnersStrip() {
  // null → not loaded yet (or unreachable): show the built-in set. An array → the CMS has spoken,
  // including an empty array, which means the owner removed every partner and the strip hides.
  const [cmsItems, setCmsItems] = useState<Partner[] | null>(null);
  const [heading, setHeading] = useState(DEFAULT_HEADING);

  useEffect(() => {
    let active = true;
    fetchBootstrap()
      .then((bootstrap) => {
        if (!active) return;
        // A failed/degraded bootstrap must not be treated as "empty" — that would wrongly hide the
        // strip during an outage. Only a real, non-degraded payload is authoritative.
        if (bootstrap.degraded) return;
        const fields = sectionFields(bootstrap, "home.partners");
        setCmsItems(readPartners(fields));
        const h = fields?.heading;
        if (typeof h === "string" && h.trim()) setHeading(h.trim());
      })
      .catch(() => {
        // Keep the built-in set on any failure; the strip must never break the homepage.
      });
    return () => {
      active = false;
    };
  }, []);

  const partners = cmsItems ?? DEFAULT_PARTNERS;

  // The owner has deliberately removed every partner: respect that and render nothing.
  if (partners.length === 0) return null;

  const track = buildTrack(partners);

  return (
    <section className="overflow-hidden border-b border-border bg-background py-12">
      <p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/60">
        {heading}
      </p>

      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div className="flex animate-marquee gap-4 whitespace-nowrap">
          {track.map((partner, i) => {
            const tile = <PartnerTile partner={partner} />;
            return partner.url ? (
              <a
                key={i}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={partner.name}
                className="shrink-0"
              >
                {tile}
              </a>
            ) : (
              <div key={i} className="shrink-0">
                {tile}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** A single partner: logo (or monogram), a main name, and an optional sub-line. */
function PartnerTile({ partner }: { partner: Partner }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-secondary/60 px-5 py-3 transition-colors hover:border-primary/20 hover:bg-secondary">
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.name}
          loading="lazy"
          className="h-7 w-7 shrink-0 object-contain"
        />
      ) : (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/8 text-[11px] font-bold text-primary ring-1 ring-primary/10">
          {monogram(partner.name)}
        </div>
      )}
      <div>
        <p className="text-[12px] font-semibold leading-none tracking-tight text-foreground">
          {partner.name}
        </p>
        {partner.tagline && (
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{partner.tagline}</p>
        )}
      </div>
    </div>
  );
}
