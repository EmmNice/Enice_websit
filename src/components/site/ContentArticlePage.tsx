/**
 * The shared shell for a single content page.
 *
 * News entries and announcements are laid out identically — the same header, the same document
 * body, the same related list — and differ only in which kind they load, where "back" goes, and
 * whether a call-to-action button is shown. Keeping one implementation here means a change to the
 * reading experience lands on both, and there is no second copy to forget.
 *
 * Route files stay thin: they own the URL, the loader and the head tags (which TanStack Router
 * requires per file), and delegate everything visual to this component.
 */

import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ArticleView } from "./ArticleView";
import type { ContentCta } from "@/lib/cms/types";
import {
  categoryBadgeClasses,
  formatPublishedDate,
  type PublicArticle,
} from "@/lib/cms/public-client";

/**
 * The announcement call to action.
 *
 * Rendered as a real anchor rather than a styled button so it works before hydration and behaves
 * like a link — right-click, middle-click, keyboard. The URL was protocol-checked on write.
 */
function CallToAction({ cta }: { cta: ContentCta }) {
  return (
    <div className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] px-6 py-6 text-center">
      <a
        href={cta.url}
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
      >
        {cta.label}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function Related({
  related,
  basePath,
}: {
  related: PublicArticle["related"];
  basePath: "/news/$slug" | "/announcements/$slug";
}) {
  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-white/[0.07] pt-10">
      <h2 className="mb-6 text-[11px] font-bold tracking-[0.22em] text-zinc-500 uppercase">
        Related
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((entry) => (
          <Link
            key={entry.id}
            to={basePath}
            params={{ slug: entry.slug }}
            className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-blue-500/30 hover:bg-white/[0.04]"
          >
            {entry.category && (
              <span
                className={`mb-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-[0.16em] ${categoryBadgeClasses(entry.category)}`}
              >
                {entry.category.toUpperCase()}
              </span>
            )}
            <h3 className="mb-1.5 text-sm leading-snug font-bold text-white transition-colors group-hover:text-blue-400">
              {entry.title}
            </h3>
            <p className="mb-2 text-[11px] text-zinc-500">
              {formatPublishedDate(entry.publishedAt)}
            </p>
            <p className="line-clamp-2 text-[13px] leading-relaxed text-zinc-400">
              {entry.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export interface ContentArticlePageProps {
  article: PublicArticle;
  backLabel: string;
  backHref: string;
  relatedBasePath: "/news/$slug" | "/announcements/$slug";
  /** Announcements show their CTA; news entries do not carry one. */
  showCta?: boolean;
}

export function ContentArticlePage({
  article,
  backLabel,
  backHref,
  relatedBasePath,
  showCta = false,
}: ContentArticlePageProps) {
  const { item, related } = article;
  const cta = showCta ? (item.extras.cta ?? null) : null;

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
            backLink={{ label: backLabel, href: backHref }}
            footerSlot={
              <>
                {cta && <CallToAction cta={cta} />}
                <Related related={related} basePath={relatedBasePath} />
              </>
            }
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
