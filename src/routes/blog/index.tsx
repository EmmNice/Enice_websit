import { createFileRoute, Link } from "@tanstack/react-router";

import { useEffect, useState } from "react";
import { ArrowUpRight, Rss } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { sanityClient, ALL_POSTS_QUERY } from "@/lib/sanity";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  publishedAt: string;
  excerpt: string;
  mainImageUrl?: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  BLOG: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CHANGELOG: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  UPDATE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ANNOUNCEMENT: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  PRODUCT: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PostCard({ post }: { post: Post }) {
  const tag = CATEGORY_STYLES[post.category] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug.current }}
      className="group flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 transition-all duration-200 hover:border-blue-500/30 hover:bg-white/[0.05]"
    >
      {/* Cover image */}
      {post.mainImageUrl && (
        <div className="mb-5 overflow-hidden rounded-lg">
          <img
            src={post.mainImageUrl}
            alt={post.title}
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* Category tag */}
      <span
        className={`mb-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-[0.18em] ${tag}`}
      >
        {post.category}
      </span>

      {/* Title */}
      <h2 className="mb-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-blue-400">
        {post.title}
      </h2>

      {/* Date */}
      <p className="mb-3 text-[11px] font-medium tracking-wide text-zinc-500">
        {formatDate(post.publishedAt)}
      </p>

      {/* Excerpt — 2 lines */}
      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-400">
        {post.excerpt}
      </p>

      {/* Read more */}
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  useEffect(() => {
    sanityClient
      .fetch<Post[]>(ALL_POSTS_QUERY)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["ALL", ...Array.from(new Set(posts.map((p) => p.category)))];
  const filtered =
    activeCategory === "ALL" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#0f172a] to-[#09090b] px-5 pb-16 pt-28 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-[11px] font-bold tracking-[0.22em] text-blue-400 uppercase">
            ENICE Group Dispatch
          </p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Blog and Changelog
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400">
            Updates on our ventures, infrastructure changes, product launches,
            and everything happening inside ENICE Group.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#09090b]/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-3">
          {!loading &&
            categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </section>

      {/* Grid */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
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
                <PostCard key={post._id} post={post} />
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
  component: BlogPage,
});
