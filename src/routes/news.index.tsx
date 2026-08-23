import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Megaphone, Newspaper, Sparkles, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { pageHead } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  categoryBadgeClasses,
  fetchFeed,
  formatPublishedDate,
  type FeedEntry,
} from "@/lib/cms/public-client";

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

function FeedRow({ entry }: { entry: FeedEntry }) {
  const Icon = KIND_ICON[entry.kind] ?? Newspaper;
  // Only linkable kinds get a page; an update stays inline.
  const linkable = entry.kind !== "update";

  const inner = (
    <>
      <div className="flex shrink-0 flex-col items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
          <Icon className="h-4 w-4 text-blue-400" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          {entry.category && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] ${categoryBadgeClasses(entry.category)}`}
            >
              {entry.category.toUpperCase()}
            </span>
          )}
          {entry.featured && (
            <span className="inline-flex items-center rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-blue-300">
              FEATURED
            </span>
          )}
          <span className="text-[11px] text-zinc-500">
            {formatPublishedDate(entry.publishedAt)}
          </span>
        </div>

        <h2
          className={`mb-1.5 text-base leading-snug font-bold text-white ${linkable ? "transition-colors group-hover:text-blue-400" : ""}`}
        >
          {entry.title}
        </h2>

        {entry.excerpt && <p className="text-sm leading-relaxed text-zinc-400">{entry.excerpt}</p>}

        {/* An update's call to action is its only navigation, so it is rendered as a real link
            rather than relying on the row wrapper. */}
        {!linkable && entry.cta && (
          <a
            href={entry.cta.url}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
          >
            {entry.cta.label} <ArrowUpRight className="h-3 w-3" />
          </a>
        )}

        {linkable && (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
            Read more <ArrowUpRight className="h-3 w-3" />
          </span>
        )}
      </div>

      {entry.coverImageUrl && (
        <img
          src={entry.coverImageUrl}
          alt={entry.title}
          loading="lazy"
          decoding="async"
          className="hidden h-20 w-32 shrink-0 rounded-lg object-cover sm:block"
        />
      )}
    </>
  );

  const className =
    "group flex gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-200";

  if (!linkable) return <div className={className}>{inner}</div>;

  return (
    <Link
      to={entry.kind === "announcement" ? "/announcements/$slug" : "/news/$slug"}
      params={{ slug: entry.slug }}
      className={`${className} hover:border-blue-500/30 hover:bg-white/[0.04]`}
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
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />

      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#0f172a] to-[#09090b] px-5 pt-28 pb-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-[11px] font-bold tracking-[0.22em] text-blue-400 uppercase">
            Company News
          </p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            News and Changelog
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400">
            Announcements, new services, partnerships, milestones, and platform updates from ENICE
            Group.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.03]"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <Newspaper className="h-7 w-7 text-zinc-500" />
              </div>
              <h2 className="mb-2 text-lg font-bold text-white">Nothing to report yet</h2>
              <p className="max-w-xs text-sm text-zinc-500">
                Company news, announcements and platform updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <FeedRow key={`${entry.kind}-${entry.id}`} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
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
