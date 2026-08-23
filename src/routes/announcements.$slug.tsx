import { createFileRoute, notFound } from "@tanstack/react-router";
import { ContentArticlePage } from "@/components/site/ContentArticlePage";
import { contentPageHead } from "@/lib/cms/content-seo";
import { fetchArticle } from "@/lib/cms/public-client";
import { SITE_URL } from "@/lib/site";

/**
 * A single ENICE announcement.
 *
 * Differs from a news entry only in showing the call-to-action button an announcement may carry —
 * the layout and metadata handling are shared.
 */
export const Route = createFileRoute("/announcements/$slug")({
  loader: async ({ params }) => {
    const article = await fetchArticle("announcement", params.slug);
    if (!article) throw notFound();
    return article;
  },

  head: ({ params, loaderData }) =>
    contentPageHead({
      article: loaderData,
      slug: params.slug,
      siteUrl: SITE_URL,
      fallbackPrefix: "/announcements",
      breadcrumbLabel: "Announcements",
      breadcrumbPath: "/announcements/",
      articleType: "Article",
    }),

  component: function AnnouncementRoute() {
    return (
      <ContentArticlePage
        article={Route.useLoaderData()}
        backLabel="Back to News"
        backHref="/news/"
        relatedBasePath="/announcements/$slug"
        showCta
      />
    );
  },
});
