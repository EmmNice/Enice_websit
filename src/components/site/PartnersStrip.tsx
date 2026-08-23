/**
 * PartnersStrip — infinite marquee of ecosystem & infrastructure partners.
 *
 * Content comes from the CMS section `home.partners` (admin → Website → Website Sections →
 * Partners strip). Each partner is a name, an optional uploaded logo, and an optional link, so the
 * site owner curates this band themselves without a code change.
 *
 * Until a partner is added, the strip renders the built-in infrastructure set below, so the
 * homepage looks complete out of the box. As soon as the section has one or more partners, that
 * managed list takes over. The design — sizing, the marquee, the fade edges — stays fixed here;
 * the CMS only supplies words, logos and links.
 */

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Cpu, Cloud, Database, Zap, Globe, Building2 } from "lucide-react";
import { fetchBootstrap, sectionFields } from "@/lib/cms/public-client";

/** The built-in set, shown until the CMS section has partners of its own. */
const DEFAULT_PARTNERS: { icon: LucideIcon; label: string; sub: string }[] = [
  { icon: Cloud, label: "Amazon Web Services", sub: "Cloud Infrastructure" },
  { icon: Cpu, label: "Google Cloud", sub: "AI & Compute" },
  { icon: Database, label: "Supabase", sub: "Database & Auth" },
  { icon: Globe, label: "Vercel", sub: "Edge Delivery" },
  { icon: Building2, label: "AWS Activate", sub: "Startup Program" },
  { icon: Zap, label: "Resend", sub: "Transactional Email" },
];

const DEFAULT_HEADING = "Built on trusted infrastructure partners";

interface Partner {
  name: string;
  logo: string;
  url: string;
}

/** Reads the repeater rows from the section's `items` field, keeping only usable ones. */
function readPartners(fields: Record<string, unknown> | null): Partner[] {
  const items = fields?.items;
  if (!Array.isArray(items)) return [];
  return items
    .map((raw) => {
      const row = (raw ?? {}) as Record<string, unknown>;
      return {
        name: typeof row.name === "string" ? row.name.trim() : "",
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
function buildTrack<T>(items: T[]): T[] {
  if (items.length === 0) return [];
  const filled = [...items];
  while (filled.length < 8) filled.push(...items);
  return [...filled, ...filled];
}

export function PartnersStrip() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [heading, setHeading] = useState(DEFAULT_HEADING);

  useEffect(() => {
    let active = true;
    fetchBootstrap()
      .then((bootstrap) => {
        if (!active) return;
        const fields = sectionFields(bootstrap, "home.partners");
        const managed = readPartners(fields);
        if (managed.length > 0) {
          setPartners(managed);
          const h = fields?.heading;
          if (typeof h === "string" && h.trim()) setHeading(h.trim());
        }
      })
      .catch(() => {
        // Degrade silently to the built-in set; the strip must never break the homepage.
      });
    return () => {
      active = false;
    };
  }, []);

  const managed = partners.length > 0;
  const track = managed ? buildTrack(partners) : buildTrack(DEFAULT_PARTNERS);

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
          {track.map((entry, i) => {
            const tile = managed ? (
              <PartnerTile partner={entry as Partner} />
            ) : (
              <DefaultTile item={entry as (typeof DEFAULT_PARTNERS)[number]} />
            );

            const url = managed ? (entry as Partner).url : "";
            return url ? (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={(entry as Partner).name}
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

/** A CMS-managed partner: uploaded logo when present, otherwise a monogram. */
function PartnerTile({ partner }: { partner: Partner }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-secondary/60 px-5 py-3 transition-colors hover:border-primary/20 hover:bg-secondary">
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.name}
          loading="lazy"
          className="h-7 w-auto max-w-[120px] shrink-0 object-contain"
        />
      ) : (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/8 text-[11px] font-bold text-primary ring-1 ring-primary/10">
          {monogram(partner.name)}
        </div>
      )}
      <p className="text-[12px] font-semibold leading-none tracking-tight text-foreground">
        {partner.name}
      </p>
    </div>
  );
}

/** A built-in infrastructure partner, shown before any are added in the CMS. */
function DefaultTile({ item }: { item: (typeof DEFAULT_PARTNERS)[number] }) {
  const Icon = item.icon;
  return (
    <div className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-secondary/60 px-5 py-3 transition-colors hover:border-primary/20 hover:bg-secondary">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/10">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[12px] font-semibold leading-none tracking-tight text-foreground">
          {item.label}
        </p>
        <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{item.sub}</p>
      </div>
    </div>
  );
}
