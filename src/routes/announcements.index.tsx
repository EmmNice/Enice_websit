import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { IconTile, Panel, Section, SectionIntro, TextLink } from "@/components/site/primitives";
import { pageHead } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  categoryBadgeClasses,
  fetchContentList,
  formatPublishedDate,
  type PublicSummary,
} from "@/lib/cms/public-client";
import { cn } from "@/lib/utils";

/**
 * The announcements archive.
 *
 * Announcements also appear in the combined `/news` feed; this page exists so that every
 * announcement URL has a parent to navigate up to, and so the archive can be linked directly.
 */
function AnnouncementCard({ item }: { item: PublicSummary }) {
  return (
    <Link
      to="/announcements/$slug"
      params={{ slug: item.slug }}
      className="panel panel-interactive group flex gap-5 p-6"
    >
      <IconTile icon={Megaphone} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          {item.category && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5",
                "text-[9px] font-semibold tracking-[0.16em]",
                categoryBadgeClasses(item.category),
              )}
            >
              {item.category.toUpperCase()}
            </span>
          )}
          <span className="type-meta tnum">{formatPublishedDate(item.publishedAt)}</span>
        </div>

        <h2 className="mb-1.5 text-base leading-snug font-semibold tracking-tight text-foreground transition-colors group-hover:text-gold">
          {item.title}
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-bone-soft">{item.excerpt}</p>

        {/* Visible rather than hover-revealed: the card is one link, and a touch user never
            produces the hover state the affordance used to depend on. */}
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-bone-faint transition-colors group-hover:text-gold">
          Read the announcement <ArrowUpRight aria-hidden className="h-3 w-3" />
        </span>
      </div>

      {item.coverImageUrl && (
        <img
          src={item.coverImageUrl}
          alt={item.title}
          width={128}
          height={80}
          loading="lazy"
          decoding="async"
          className="hidden h-20 w-32 shrink-0 rounded-lg border border-border object-cover sm:block"
        />
      )}
    </Link>
  );
}

function AnnouncementsPage() {
  const [items, setItems] = useState<PublicSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchContentList("announcement", { limit: 60 }).then((result) => {
      if (cancelled) return;
      setItems(result.items);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteShell>
      <Section
        spacing="loose"
        container="narrow"
        grid
        glow="spread"
        aria-labelledby="announcements-heading"
      >
        <SectionIntro
          level={1}
          id="announcements-heading"
          eyebrow="ENICE Group"
          heading="Announcements"
          lead="Company announcements, product launches, new services, partnerships and events."
        />
      </Section>

      <Section container="narrow" divider>
        {loading ? (
          // The placeholders are decorative; the wait is not, so it is announced once.
          <div role="status" aria-label="Loading announcements">
            <div className="space-y-4" aria-hidden>
              {[1, 2, 3].map((index) => (
                <div key={index} className="panel-quiet h-32 animate-pulse" />
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          // Deliberate, not broken: the same panel the cards use, plus the one onward route that
          // is useful when there is nothing here yet.
          <Panel tone="quiet" className="flex flex-col items-center px-8 py-20 text-center">
            <span
              aria-hidden
              className="mb-5 grid h-14 w-14 place-items-center rounded-xl border border-gold/20 bg-gold/[0.07] text-gold"
            >
              <Megaphone className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h2 className="type-h3 text-foreground">No announcements yet</h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone-soft">
              Company and product announcements will appear here.
            </p>
            <div className="mt-7">
              <TextLink to="/news/">See all ENICE news</TextLink>
            </div>
          </Panel>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <Reveal key={item.id} delay={Math.min(index, 5) * 50}>
                <AnnouncementCard item={item} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </SiteShell>
  );
}

export const Route = createFileRoute("/announcements/")({
  head: () =>
    pageHead("/announcements/", [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "ENICE Group Announcements",
        description:
          "Company announcements, product launches, new services, partnerships and events from ENICE Group.",
        url: `${SITE_URL}/announcements/`,
        publisher: {
          "@type": "Organization",
          name: "ENICE Group",
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.png`,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Announcements",
            item: `${SITE_URL}/announcements/`,
          },
        ],
      },
    ]),
  component: AnnouncementsPage,
});
