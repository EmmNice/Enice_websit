import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Rss } from "lucide-react";
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
 * The blog index.
 *
 * Reads from `/api/site/content/blog` — the ENICE Website Manager's own public API — rather than
 * from an external CMS. Same-origin, so it needs no CSP allowance, and edge-cached, so the common
 * case never reaches the database.
 */
function PostCard({ post }: { post: PublicSummary }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 transition-all duration-200 hover:border-blue-500/30 hover:bg-white/[0.05]"
    >
      {post.coverImageUrl && (
        <div className="mb-5 overflow-hidden rounded-lg">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {post.category && (
        <span
          className={`mb-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-[0.18em] ${categoryBadgeClasses(post.category)}`}
        >
          {post.category.toUpperCase()}
        </span>
      )}

      <h2 className="mb-2 text-base leading-snug font-bold text-white transition-colors group-hover:text-blue-400">
        {post.title}
      </h2>

      <p className="mb-3 flex items-center gap-2 text-[11px] font-medium tracking-wide text-zinc-500">
        <span>{formatPublishedDate(post.publishedAt)}</span>
        {post.readingMinutes > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
          </>
        )}
      </p>

      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-400">{post.excerpt}</p>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
        Read article <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
        <Rss className="h-7 w-7 text-zinc-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">No posts yet</h3>
      <p className="max-w-xs text-sm text-zinc-500">
        Content is on the way. Check back soon for the first update.
      </p>
    </div>
  );
}

function BlogPage() {
  const [posts, setPosts] = useState<PublicSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    let cancelled = false;

    fetchContentList("blog", { limit: 60 }).then((result) => {
      // Guarded so a navigation away mid-flight cannot set state on an unmounted component.
      if (cancelled) return;
      setPosts(result.items);
      setCategories(result.categories);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    activeCategory === "ALL" ? posts : posts.filter((post) => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />

      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#0f172a] to-[#09090b] px-5 pt-28 pb-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-[11px] font-bold tracking-[0.22em] text-blue-400 uppercase">
            ENICE Group Dispatch
          </p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Blog and Changelog
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400">
            Updates on our products, infrastructure changes, and platform launches, and everything
            happening inside ENICE Group.
          </p>
        </div>
      </section>

      {/* The filter bar is only worth showing once there is more than one category to pick. */}
      {!loading && categories.length > 1 && (
        <section className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#09090b]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-3">
            {["ALL", ...categories].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  activeCategory === category
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {category === "ALL" ? "ALL" : category.toUpperCase()}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.03]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <EmptyState />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export const Route = createFileRoute("/blog/")({
  head: () =>
    pageHead("/blog/", [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "ENICE Group Blog",
        description: "Product updates, changelog entries, and announcements from ENICE Group.",
        url: `${SITE_URL}/blog`,
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
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        ],
      },
    ]),
  component: BlogPage,
});
