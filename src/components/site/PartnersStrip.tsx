/**
 * PartnersStrip — moving row of ecosystem and infrastructure providers.
 *
 * Content comes from the CMS section `home.partners` (admin → Website → Website Sections →
 * Partners strip). Each partner has a name, an optional sub-line (tagline), an optional uploaded
 * logo and an optional link, so the site owner curates this band themselves.
 *
 * What shows is exactly what is in the CMS — the infrastructure providers are seeded there as real
 * entries, so they can be edited, reordered or removed individually, and adding a new partner adds
 * to the strip rather than replacing anything. The built-in list below is only a paint-time and
 * outage fallback; once the section loads, the CMS is authoritative, including when it is empty.
 *
 * Logos render as bone silhouettes and reveal their brand colours on hover — see `.logo-mono` in
 * `styles.css` for why that is a correctness fix as much as a stylistic one.
 */

import { useEffect, useState } from "react";
import { fetchBootstrap, sectionFields } from "@/lib/cms/public-client";
import { Container } from "./primitives";

interface Partner {
  name: string;
  tagline: string;
  logo: string;
  url: string;
}

/**
 * Shown before the CMS section has loaded, and if it can't be reached, so the homepage is never
 * blank. Mirrors the seeded section content, so the common case has no visible change on load.
 *
 * PulseAssist remains in the list because the site assistant runs on its AI platform. Email
 * delivery is now a separate ENICE product, Faga, and is presented in the product portfolio rather
 * than folded into PulseAssist's infrastructure label.
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
    name: "PulseAssist",
    tagline: "AI Customer Operations",
    logo: "/partners/pulseassist.svg",
    url: "https://getpulseassist.com",
  },
];

const DEFAULT_HEADING = "Infrastructure and platform providers";

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

/** Repeat a short list enough times for a continuous, gap-free loop. */
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
    <section aria-labelledby="partners-heading" className="overflow-hidden border-y border-border">
      <Container>
        <h2
          id="partners-heading"
          className="eyebrow eyebrow-muted justify-center py-6 text-center sm:py-7"
          style={{ display: "flex" }}
        >
          {heading}
        </h2>
      </Container>

      <div className="edge-fade relative pb-8">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {track.map((partner, index) => {
            const duplicate = index >= track.length / 2;
            return (
              <PartnerTile
                key={`${partner.name}-${index}`}
                partner={partner}
                aria-hidden={duplicate || undefined}
                tabIndex={duplicate ? -1 : undefined}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** A single partner: logo (or monogram), a name, and an optional sub-line. */
function PartnerTile({
  partner,
  ...rest
}: {
  partner: Partner;
  "aria-hidden"?: true;
  tabIndex?: number;
}) {
  const body = (
    <>
      {partner.logo ? (
        <img
          src={partner.logo}
          alt=""
          loading="lazy"
          decoding="async"
          width={24}
          height={24}
          className="logo-mono h-6 w-6 shrink-0 object-contain"
        />
      ) : (
        <span
          aria-hidden
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-electric/20 bg-electric/[0.07] text-[10px] font-semibold text-electric"
        >
          {monogram(partner.name)}
        </span>
      )}
      <span className="min-w-0 text-left">
        <span className="block text-[13px] font-medium leading-snug text-bone-strong transition-colors group-hover:text-foreground">
          {partner.name}
        </span>
        {partner.tagline && (
          <span className="mt-1 block text-[10px] font-medium uppercase leading-relaxed tracking-[0.12em] text-bone-faint">
            {partner.tagline}
          </span>
        )}
      </span>
    </>
  );

  const shell = "group inline-flex shrink-0 items-center gap-3";

  return partner.url ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" className={shell} {...rest}>
      {body}
    </a>
  ) : (
    <span className={shell} {...rest}>
      {body}
    </span>
  );
}
