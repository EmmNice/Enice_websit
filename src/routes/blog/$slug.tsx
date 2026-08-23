import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArticleView } from "@/components/site/ArticleView";
import { SITE_URL } from "@/lib/site";
import {
  categoryBadgeClasses,
  fetchArticle,
  formatPublishedDate,
  type PublicArticle,
} from "@/lib/cms/public-client";

/**
 * A blog article.
 *
 * Content comes from the ENICE Website Manager's public API. The layout itself lives in
 * `ArticleView`, which the admin panel's preview also renders — so what an author previews is
 * produced by the same code that serves this page.
 */
function RelatedPosts({ related }: { related: PublicArticle["related"] }) {
  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-white/[0.07] pt-10">
      <h2 className="mb-6 text-[11px] font-bold tracking-[0.22em] text-zinc-500 uppercase">
        More from ENICE Group
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((post) => (
          <Link
            key={post.id}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-blue-500/30 hover:bg-white/[0.04]"
          >
            {post.category && (
              <span
                className={`mb-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-[0.16em] ${categoryBadgeClasses(post.category)}`}
              >
                {post.category.toUpperCase()}
              </span>
            )}
            <h3 className="mb-1.5 text-sm leading-snug font-bold text-white transition-colors group-hover:text-blue-400">
              {post.title}
            </h3>
            <p className="mb-2 text-[11px] text-zinc-500">
              {formatPublishedDate(post.publishedAt)}
            </p>
            <p className="line-clamp-2 text-[13px] leading-relaxed text-zinc-400">{post.excerpt}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
              Read <ArrowUpRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ArticlePage() {
  const { item, related } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />

      <main className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <ArticleView
            article={{
              title: item.title,
              excerpt: item.excerpt,
              category: item.category,
              tags: item.tags,
              coverImageUrl: item.coverImageUrl,
              author: item.author,
              publishedAt: item.publishedAt,
              body: item.body,
            }}
            theme="dark"
            backLink={{ label: "Back to Blog", href: "/blog/" }}
            footerSlot={<RelatedPosts related={related} />}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export const Route = createFileRoute("/blog/$slug")({
  /**
   * Loaded before render so `head()` can build the title, description and structured data from the
   * real article rather than guessing from the slug.
   *
   * The API resolves SEO server-side — applying overrides, then values derived from the content,
   * then the site defaults — so this route consumes finished metadata instead of reimplementing
   * that precedence.
   */
  loader: async ({ params }) => {
    const article = await fetchArticle("blog", params.slug);
    if (!article) throw notFound();
    return article;
  },

  head: ({ params, loaderData }) => {
    // `loaderData` is absent while the loader is pending or if it threw; the slug-derived
    // fallbacks keep the tags populated rather than empty.
    const url = loaderData?.item.url
      ? `${SITE_URL}${loaderData.item.url}`
      : `${SITE_URL}/blog/${params.slug}`;
    const seo = loaderData?.seo;
    const title = seo?.title ?? params.slug.replace(/-/g, " ");
    const description = seo?.description ?? "An article from the ENICE Group blog.";
    const image = seo?.ogImage ?? `${SITE_URL}/og.png`;
    const published = loaderData?.item.publishedAt;
    const updated = loaderData?.item.updatedAt;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: seo?.index === false ? "noindex, nofollow" : "index, follow" },
        { property: "og:title", content: seo?.ogTitle ?? title },
        { property: "og:description", content: seo?.ogDescription ?? description },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "ENICE Group" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: loaderData?.item.title ?? title },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@ENICEHQ" },
        { name: "twitter:image", content: image },
        { name: "twitter:title", content: seo?.ogTitle ?? title },
        { name: "twitter:description", content: seo?.ogDescription ?? description },
      ],
      links: [{ rel: "canonical", href: seo?.canonicalUrl ?? url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData?.item.title ?? title,
            description,
            url,
            mainEntityOfPage: url,
            image,
            ...(published ? { datePublished: published } : {}),
            ...(updated ? { dateModified: updated } : {}),
            ...(loaderData?.item.category ? { articleSection: loaderData.item.category } : {}),
            ...(loaderData?.item.author?.name
              ? { author: { "@type": "Person", name: loaderData.item.author.name } }
              : {}),
            publisher: {
              "@type": "Organization",
              name: "ENICE Group",
              url: SITE_URL,
              logo: `${SITE_URL}/favicon.png`,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog/` },
              {
                "@type": "ListItem",
                position: 3,
                name: loaderData?.item.title ?? title,
                item: url,
              },
            ],
          }),
        },
      ],
    };
  },

  component: ArticlePage,
});
