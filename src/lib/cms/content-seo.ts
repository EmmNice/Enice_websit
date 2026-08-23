/**
 * Head-tag construction for content pages.
 *
 * Lives in `lib` rather than beside the components because it is a pure data transform, and
 * because TanStack Router calls it from a route's `head()` — outside the React tree entirely.
 * Co-locating it with a component also trips the react-refresh rule, which exists for a real
 * reason: a module that exports both a component and a helper cannot be hot-reloaded cleanly.
 *
 * The SEO values themselves are resolved server-side by `/api/site` (see
 * `src/lib/cms/seo-resolve.ts` for the precedence rules), so this only formats what it is given
 * and supplies slug-derived fallbacks for the window where the loader has not resolved yet.
 */

import type { PublicArticle } from "./public-client";

/**
 * Builds the head tags for a content page.
 *
 * Shared because the two route files would otherwise contain the same forty lines of Open Graph
 * boilerplate twice. The SEO values are already resolved by the API, so this only formats them.
 */
export function contentPageHead(options: {
  article: PublicArticle | undefined;
  slug: string;
  siteUrl: string;
  fallbackPrefix: string;
  breadcrumbLabel: string;
  breadcrumbPath: string;
  articleType: "NewsArticle" | "Article";
}) {
  const { article, slug, siteUrl, fallbackPrefix, breadcrumbLabel, breadcrumbPath, articleType } =
    options;

  const url = article?.item.url
    ? `${siteUrl}${article.item.url}`
    : `${siteUrl}${fallbackPrefix}/${slug}`;
  const seo = article?.seo;
  const title = seo?.title ?? slug.replace(/-/g, " ");
  const description = seo?.description ?? "An update from ENICE Group.";
  const image = seo?.ogImage ?? `${siteUrl}/og.png`;

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
      { property: "og:image:alt", content: article?.item.title ?? title },
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
          "@type": articleType,
          headline: article?.item.title ?? title,
          description,
          url,
          mainEntityOfPage: url,
          image,
          ...(article?.item.publishedAt ? { datePublished: article.item.publishedAt } : {}),
          ...(article?.item.updatedAt ? { dateModified: article.item.updatedAt } : {}),
          ...(article?.item.category ? { articleSection: article.item.category } : {}),
          publisher: {
            "@type": "Organization",
            name: "ENICE Group",
            url: siteUrl,
            logo: `${siteUrl}/favicon.png`,
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            {
              "@type": "ListItem",
              position: 2,
              name: breadcrumbLabel,
              item: `${siteUrl}${breadcrumbPath}`,
            },
            { "@type": "ListItem", position: 3, name: article?.item.title ?? title, item: url },
          ],
        }),
      },
    ],
  };
}
