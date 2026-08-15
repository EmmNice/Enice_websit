import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { PortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { sanityClient, POST_BY_SLUG_QUERY } from "@/lib/sanity";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  publishedAt: string;
  excerpt: string;
  mainImageUrl?: string;
  body: unknown[];
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

// ─── Portable Text component overrides ───────────────────────────────────────

const ptComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-[17px] leading-8 text-zinc-300">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-xl font-bold tracking-tight text-white">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mb-6 border-l-2 border-blue-500 pl-5 italic text-zinc-400">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-blue-300">
        {children}
      </code>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 space-y-2 pl-6 text-[17px] leading-8 text-zinc-300">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-zinc-300">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="relative pl-2 before:absolute before:-left-4 before:text-blue-400 before:content-['·']">
        {children}
      </li>
    ),
    number: ({ children }) => <li>{children}</li>,
  },
  types: {
    image: ({ value }: { value: { asset?: { url?: string }; alt?: string; caption?: string } }) => {
      if (!value?.asset?.url) return null;
      return (
        <figure className="my-8">
          <img
            src={value.asset.url}
            alt={value.alt ?? ""}
            className="w-full rounded-2xl object-cover"
          />
          {value.caption && (
            <figcaption className="mt-3 text-center text-xs text-zinc-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

function ArticlePage() {
  const post = Route.useLoaderData();

  const tagStyle =
    CATEGORY_STYLES[post.category] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />

      <main className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Back link */}
          <Link
            to="/blog/"
            className="mb-10 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
          </Link>

          <article>
            {/* Category + date */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.18em] ${tagStyle}`}
              >
                <Tag className="h-3 w-3" />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.publishedAt)}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              {post.title}
            </h1>

            {/* Excerpt lead */}
            <p className="mb-10 text-lg leading-relaxed text-zinc-400">{post.excerpt}</p>

            {/* Cover image */}
            {post.mainImageUrl && (
              <img
                src={post.mainImageUrl}
                alt={post.title}
                className="mb-10 w-full rounded-2xl object-cover"
              />
            )}

            {/* Divider */}
            <div className="mb-10 h-px bg-white/[0.07]" />

            {/* Body */}
            <div className="prose-enice">
              {post.body?.length > 0 ? (
                <PortableText
                  value={post.body as Parameters<typeof PortableText>[0]["value"]}
                  components={ptComponents}
                />
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-8 py-10 text-center">
                  <p className="text-base font-semibold text-white/80">
                    This article is being prepared.
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    The full piece will be published here shortly. Check back soon.
                  </p>
                </div>
              )}
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function slugToTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/blog/$slug")({
  /**
   * Loaded before the component renders so `head()` can build the title, description and
   * structured data from the actual post. Previously these were derived from the slug, which
   * meant search results and social cards showed a guessed title like "My Post Title" rather
   * than the real one, and never the real excerpt.
   */
  loader: async ({ params }) => {
    const post = await sanityClient.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug: params.slug });
    if (!post) throw notFound();
    return post;
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE_URL}/blog/${params.slug}`;
    // `loaderData` is undefined while the loader is pending or if it threw; fall back to a
    // slug-derived title so the tags are never empty.
    const title = loaderData?.title ?? slugToTitle(params.slug);
    const pageTitle = `${title} | ENICE Group Blog`;
    const description =
      loaderData?.excerpt?.trim() ||
      `Read "${title}" on the ENICE Group blog: product updates, changelog entries, and announcements.`;
    const image = loaderData?.mainImageUrl || `${SITE_URL}/og.png`;
    const published = loaderData?.publishedAt;

    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: description },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "ENICE Group" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: title },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@ENICEHQ" },
        { name: "twitter:image", content: image },
        { name: "twitter:title", content: pageTitle },
        { name: "twitter:description", content: description },
        { name: "robots", content: "index, follow" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            url,
            mainEntityOfPage: url,
            image,
            ...(published ? { datePublished: published, dateModified: published } : {}),
            ...(loaderData?.category ? { articleSection: loaderData.category } : {}),
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
              { "@type": "ListItem", position: 3, name: title, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: ArticlePage,
});
