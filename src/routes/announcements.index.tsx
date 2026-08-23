import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { pageHead } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  categoryBadgeClasses,
  fetchContentList,
  formatPublishedDate,
  type PublicSummary,
} from "@/lib/cms/public-client";

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
      className="group flex gap-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all duration-200 hover:border-blue-500/30 hover:bg-white/[0.04]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
        <Megaphone className="h-4.5 w-4.5 text-blue-400" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          {item.category && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] ${categoryBadgeClasses(item.category)}`}
            >
              {item.category.toUpperCase()}
            </span>
          )}
          <span className="text-[11px] text-zinc-500">{formatPublishedDate(item.publishedAt)}</span>
        </div>

        <h2 className="mb-1.5 text-base leading-snug font-bold text-white transition-colors group-hover:text-blue-400">
          {item.title}
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">{item.excerpt}</p>

        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
          Read the announcement <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>

      {item.coverImageUrl && (
        <img
          src={item.coverImageUrl}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="hidden h-20 w-32 shrink-0 rounded-lg object-cover sm:block"
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
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />

      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#0f172a] to-[#09090b] px-5 pt-28 pb-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-[11px] font-bold tracking-[0.22em] text-blue-400 uppercase">
            ENICE Group
          </p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Announcements
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400">
            Company announcements, product launches, new services, partnerships and events.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.03]"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <Megaphone className="h-7 w-7 text-zinc-500" />
              </div>
              <h2 className="mb-2 text-lg font-bold text-white">No announcements yet</h2>
              <p className="max-w-xs text-sm text-zinc-500">
                Company and product announcements will appear here.
              </p>
              <Link
                to="/news/"
                className="mt-6 text-sm font-semibold text-blue-400 hover:underline"
              >
                See all ENICE news
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <AnnouncementCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
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
