import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Megaphone, Newspaper, Sparkles, Zap } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { IconTile, Panel, Section, SectionIntro, Tag } from "@/components/site/primitives";
import { pageHead } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  categoryBadgeClasses,
  fetchFeed,
  formatPublishedDate,
  type FeedEntry,
} from "@/lib/cms/public-client";
import { cn } from "@/lib/utils";

/**
 * The ENICE news and changelog feed.
 *
 * One stream combining three content kinds — news entries, announcements and short updates —
 * because that is how a reader wants to consume them, even though they are authored and managed
 * separately. The API merges and orders them (featured first, then newest); this route only
 * renders.
 *
 * Updates have no page of their own by design: a one-line "we launched a new service" note does
 * not warrant a URL, so it renders inline here and links onward only if it carries a call to
 * action.
 */
const KIND_ICON = {
  news: Newspaper,
  announcement: Megaphone,
  update: Zap,
  blog: Sparkles,
} as const;

/** The shared card treatment for a row, whether or not the row is a link. */
const ROW_CLASSES = "panel group flex gap-4 p-5";

function FeedRow({ entry }: { entry: FeedEntry }) {
  const Icon = KIND_ICON[entry.kind] ?? Newspaper;
  // Only linkable kinds get a page; an update stays inline.
  const linkable = entry.kind !== "update";

  const inner = (
    <>
      <IconTile icon={Icon} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          {entry.category && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5",
                "text-[9px] font-semibold tracking-[0.16em]",
                categoryBadgeClasses(entry.category),
              )}
            >
              {entry.category.toUpperCase()}
            </span>
          )}
          {entry.featured && (
            <Tag tone="warm" className="px-2.5 py-0.5 text-[9px] tracking-[0.16em]">
              FEATURED
            </Tag>
          )}
          <span className="type-meta tnum">{formatPublishedDate(entry.publishedAt)}</span>
        </div>

        <h2
          className={cn(
            "mb-1.5 text-base leading-snug font-semibold tracking-tight text-foreground",
            linkable && "transition-colors group-hover:text-gold",
          )}
        >
          {entry.title}
        </h2>

        {entry.excerpt && <p className="text-sm leading-relaxed text-bone-soft">{entry.excerpt}</p>}

        {/* An update's call to action is its only navigation, so it is rendered as a real link
            rather than relying on the row wrapper. */}
        {!linkable && entry.cta && (
          <a
            href={entry.cta.url}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold underline-offset-2 hover:underline"
          >
            {entry.cta.label} <ArrowUpRight aria-hidden className="h-3 w-3" />
          </a>
        )}

        {/* The read affordance stays visible rather than appearing on hover: the row is one link,
            and a touch user never produces the hover that used to reveal it. */}
        {linkable && (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-bone-faint transition-colors group-hover:text-gold">
            Read more <ArrowUpRight aria-hidden className="h-3 w-3" />
          </span>
        )}
      </div>

      {entry.coverImageUrl && (
        <img
          src={entry.coverImageUrl}
          alt={entry.title}
          width={128}
          height={80}
          loading="lazy"
          decoding="async"
          className="hidden h-20 w-32 shrink-0 rounded-lg border border-border object-cover sm:block"
        />
      )}
    </>
  );

  if (!linkable) return <div className={ROW_CLASSES}>{inner}</div>;

  return (
    <Link
      to={entry.kind === "announcement" ? "/announcements/$slug" : "/news/$slug"}
      params={{ slug: entry.slug }}
      className={cn(ROW_CLASSES, "panel-interactive")}
    >
      {inner}
    </Link>
  );
}

function NewsPage() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchFeed(60).then((result) => {
      if (cancelled) return;
      setEntries(result.entries);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteShell>
      <Section spacing="loose" container="narrow" grid glow="spread" aria-labelledby="news-heading">
        <SectionIntro
          level={1}
          id="news-heading"
          eyebrow="Company News"
          heading="News and Changelog"
          lead="Announcements, new services, partnerships, milestones, and platform updates from ENICE Group."
        />
      </Section>

      <Section container="narrow" divider>
        {loading ? (
          // The placeholders are decorative; the wait is not, so it is announced once.
          <div role="status" aria-label="Loading the news feed">
            <div className="space-y-4" aria-hidden>
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="panel-quiet h-28 animate-pulse" />
              ))}
            </div>
          </div>
        ) : entries.length === 0 ? (
          // Deliberate, not broken: the same panel the feed rows use, so an empty feed still
          // reads as a finished page.
          <Panel tone="quiet" className="flex flex-col items-center px-8 py-20 text-center">
            <span
              aria-hidden
              className="mb-5 grid h-14 w-14 place-items-center rounded-xl border border-gold/20 bg-gold/[0.07] text-gold"
            >
              <Newspaper className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h2 className="type-h3 text-foreground">Nothing to report yet</h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone-soft">
              Company news, announcements and platform updates will appear here.
            </p>
          </Panel>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Reveal key={`${entry.kind}-${entry.id}`} delay={Math.min(index, 5) * 50}>
                <FeedRow entry={entry} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </SiteShell>
  );
}

export const Route = createFileRoute("/news/")({
  head: () =>
    pageHead("/news/", [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "ENICE Group News and Changelog",
        description:
          "Announcements, new services, partnerships, milestones, and platform updates from ENICE Group.",
        url: `${SITE_URL}/news/`,
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
          { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news/` },
        ],
      },
    ]),
  component: NewsPage,
});
