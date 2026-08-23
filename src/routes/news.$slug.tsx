import { createFileRoute, notFound } from "@tanstack/react-router";
import { ContentArticlePage } from "@/components/site/ContentArticlePage";
import { contentPageHead } from "@/lib/cms/content-seo";
import { fetchArticle } from "@/lib/cms/public-client";
import { SITE_URL } from "@/lib/site";

/** A single ENICE news entry or changelog item. */
export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const article = await fetchArticle("news", params.slug);
    if (!article) throw notFound();
    return article;
  },

  head: ({ params, loaderData }) =>
    contentPageHead({
      article: loaderData,
      slug: params.slug,
      siteUrl: SITE_URL,
      fallbackPrefix: "/news",
      breadcrumbLabel: "News",
      breadcrumbPath: "/news/",
      // NewsArticle is the correct type here and is what enables news-specific rich results.
      articleType: "NewsArticle",
    }),

  component: function NewsArticleRoute() {
    return (
      <ContentArticlePage
        article={Route.useLoaderData()}
        backLabel="Back to News"
        backHref="/news/"
        relatedBasePath="/news/$slug"
      />
    );
  },
});
