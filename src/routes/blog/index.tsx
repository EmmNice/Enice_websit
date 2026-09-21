import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Rss } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { Container, Panel, Section, SectionIntro } from "@/components/site/primitives";
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
 * The blog index.
 *
 * Reads from `/api/site/content/blog` — the ENICE Website Manager's own public API — rather than
 * from an external CMS. Same-origin, so it needs no CSP allowance, and edge-cached, so the common
 * case never reaches the database.
 */

/**
 * One post card.
 *
 * The whole card is a single link, and nothing inside it is interactive: a card with a nested
 * "Read article" anchor gives a keyboard user two stops for one destination and makes the hit area
 * ambiguous for everyone else. The read affordance is therefore a `span` that the card's own hover
 * lights up.
 */
function PostCard({ post }: { post: PublicSummary }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="panel panel-interactive group flex h-full w-full flex-col p-6"
    >
      {post.coverImageUrl && (
        <div className="mb-5 overflow-hidden rounded-lg border border-border">
          {/* A fixed ratio, because the content model stores no dimensions: without one, every
              card resizes as its cover arrives and the whole grid reflows under the pointer. */}
          <img
            src={post.coverImageUrl}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {post.category && (
        <span
          className={cn(
            "mb-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5",
            "text-[10px] font-semibold tracking-[0.18em]",
            categoryBadgeClasses(post.category),
          )}
        >
          {post.category.toUpperCase()}
        </span>
      )}

      {/* `h2`, one level below the page title — the card grid is the page's only content level. */}
      <h2 className="text-base leading-snug font-semibold tracking-tight text-foreground transition-colors group-hover:text-gold">
        {post.title}
      </h2>

      <p className="type-meta tnum mt-2 mb-3 flex items-center gap-2">
        <span>{formatPublishedDate(post.publishedAt)}</span>
        {post.readingMinutes > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
          </>
        )}
      </p>

      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-bone-soft">{post.excerpt}</p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-bone-faint transition-colors group-hover:text-gold">
        Read article
        <ArrowUpRight
          aria-hidden
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
        />
      </span>
    </Link>
  );
}

/**
 * The empty state.
 *
 * Deliberate rather than broken: the same panel treatment as a post card, so a blog with nothing
 * in it yet still looks like a finished page.
 */
function EmptyState() {
  return (
    <Panel tone="quiet" className="flex flex-col items-center px-8 py-20 text-center">
      <span
        aria-hidden
        className="mb-5 grid h-14 w-14 place-items-center rounded-xl border border-gold/20 bg-gold/[0.07] text-gold"
      >
        <Rss className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h2 className="type-h3 text-foreground">No posts yet</h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone-soft">
        Content is on the way. Check back soon for the first update.
      </p>
    </Panel>
  );
}

/**
 * The loading grid. Same card footprint, so the page does not jump when the posts arrive.
 *
 * The placeholders are decorative, but the wait itself is information: the status role announces it
 * once instead of leaving a screen-reader user on a page that reads as permanently empty.
 */
function LoadingGrid() {
  return (
    <div role="status" aria-label="Loading posts">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
        {[1, 2, 3].map((index) => (
          <div key={index} className="panel-quiet h-72 animate-pulse" />
        ))}
      </div>
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
    <SiteShell>
      <Section spacing="loose" grid glow="spread" aria-labelledby="blog-heading">
        <SectionIntro
          level={1}
          id="blog-heading"
          eyebrow="ENICE Group Dispatch"
          heading="Blog and Changelog"
          lead="Updates on our products, infrastructure changes, and platform launches, and everything happening inside ENICE Group."
        />
      </Section>

      {/* The filter bar is only worth showing once there is more than one category to pick.
          It is a toolbar rather than a band — hence a plain sticky strip around `Container`, not a
          `Section`: it sits under the 4rem header and separates with a hairline and the canvas
          behind it rather than a colour of its own. */}
      {!loading && categories.length > 1 && (
        <div className="sticky top-16 z-30 border-y border-border bg-background/85 backdrop-blur-xl">
          <Container>
            <div
              role="group"
              aria-label="Filter posts by category"
              className="flex gap-1 overflow-x-auto py-3"
            >
              {["ALL", ...categories].map((category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={active}
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-1.5",
                      "text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
                      active
                        ? "border-gold/25 bg-gold/[0.08] text-gold"
                        : "border-transparent text-bone-soft hover:text-foreground",
                    )}
                  >
                    {category === "ALL" ? "ALL" : category.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </Container>
        </div>
      )}

      <Section>
        {loading ? (
          <LoadingGrid />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, index) => (
              <Reveal key={post.id} delay={Math.min(index, 5) * 50} className="flex">
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </SiteShell>
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
