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
import { SiteShell } from "./SiteShell";
import { ArticleView } from "./ArticleView";
import { Cta, Panel, Section } from "./primitives";
import type { ContentCta } from "@/lib/cms/types";
import {
  categoryBadgeClasses,
  formatPublishedDate,
  type PublicArticle,
} from "@/lib/cms/public-client";
import { cn } from "@/lib/utils";

/**
 * The announcement call to action.
 *
 * `Cta` resolves its own element, so an in-app path gets client-side routing and an external URL
 * gets an anchor with the right `rel` — and either way it is a real link rather than a styled
 * button, so it works before hydration and behaves like a link for right-click, middle-click and
 * the keyboard. The URL was protocol-checked on write.
 */
function CallToAction({ cta }: { cta: ContentCta }) {
  return (
    <Panel tone="quiet" className="mt-10 px-6 py-6 text-center">
      <Cta to={cta.url} icon="external">
        {cta.label}
      </Cta>
    </Panel>
  );
}

/**
 * The related list.
 *
 * One link per entry with nothing interactive inside it, and the headings continue the article's
 * outline: `h2` for the list under the article's `h1`, `h3` per entry.
 */
function Related({
  related,
  basePath,
}: {
  related: PublicArticle["related"];
  basePath: "/news/$slug" | "/announcements/$slug";
}) {
  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10" aria-labelledby="related-heading">
      <h2 id="related-heading" className="eyebrow mb-6">
        Related
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((entry) => (
          <Link
            key={entry.id}
            to={basePath}
            params={{ slug: entry.slug }}
            className="panel panel-interactive group flex flex-col p-5"
          >
            {entry.category && (
              <span
                className={cn(
                  "mb-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5",
                  "text-[10px] font-semibold tracking-[0.16em]",
                  categoryBadgeClasses(entry.category),
                )}
              >
                {entry.category.toUpperCase()}
              </span>
            )}
            <h3 className="text-sm leading-snug font-semibold tracking-tight text-foreground transition-colors group-hover:text-gold">
              {entry.title}
            </h3>
            <p className="type-meta tnum mt-1.5 mb-2">{formatPublishedDate(entry.publishedAt)}</p>
            <p className="line-clamp-2 text-[13px] leading-relaxed text-bone-soft">
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
    <SiteShell>
      {/* `prose` is the 46rem measure: the reading column, not the page width. */}
      <Section spacing="loose" container="prose">
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
      </Section>
    </SiteShell>
  );
}
