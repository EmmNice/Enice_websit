/**
 * The article layout, shared by the public site and the admin preview.
 *
 * ## Why this is one component
 *
 * A preview is only worth having if it is truthful. The usual failure is a preview screen that
 * reimplements the article layout, drifts from the real one, and quietly stops telling the author
 * what their post will look like. So the public route and the Website Manager's preview pane
 * render *this* component, from the same document, through the same `DocRenderer`. The preview
 * differs from production in exactly two respects, both explicit props: the colour `theme`, and
 * the viewport it is constrained to.
 *
 * It accepts a loose `ArticleViewModel` rather than a `ContentItem` so the preview can pass
 * in-progress editor state — including a draft that has never been saved — without inventing the
 * fields a stored record would have.
 */

import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import { asDoc, readingMinutes as computeReadingMinutes } from "@/lib/cms/doc";
import type { ContentAuthor } from "@/lib/cms/types";
import { categoryBadgeClasses, formatPublishedDate } from "@/lib/cms/public-client";
import { DocRenderer, DocTableOfContents, type DocTheme } from "./DocRenderer";

export interface ArticleViewModel {
  title: string;
  excerpt: string;
  category: string | null;
  tags: string[];
  coverImageUrl: string | null;
  author: ContentAuthor | null;
  publishedAt: string | null;
  /** An `EniceDoc`, or anything `asDoc` can repair into one. */
  body: unknown;
  /** Supplied by the API; recomputed from the body when previewing unsaved work. */
  readingMinutes?: number;
}

export interface ArticleViewProps {
  article: ArticleViewModel;
  theme?: DocTheme;
  /** The back link is suppressed in the preview, where there is nowhere to navigate to. */
  backLink?: { label: string; onClick?: () => void; href?: string } | null;
  /** Rendered below the article — related posts on the public page, nothing in preview. */
  footerSlot?: React.ReactNode;
  showTableOfContents?: boolean;
}

export function ArticleView({
  article,
  theme = "dark",
  backLink = null,
  footerSlot = null,
  showTableOfContents = true,
}: ArticleViewProps) {
  const isDark = theme === "dark";
  const doc = asDoc(article.body);
  // Recomputed when absent so an unsaved draft still shows a reading time in preview.
  const minutes = article.readingMinutes ?? computeReadingMinutes(doc);

  const mutedText = isDark ? "text-zinc-500" : "text-muted-foreground";
  const leadText = isDark ? "text-zinc-400" : "text-muted-foreground";
  const titleText = isDark ? "text-white" : "text-foreground";
  const dividerColor = isDark ? "bg-white/[0.07]" : "bg-border";

  return (
    <article>
      {backLink && (
        <a
          href={backLink.href ?? "#"}
          onClick={
            backLink.onClick
              ? (event) => {
                  event.preventDefault();
                  backLink.onClick?.();
                }
              : undefined
          }
          className={`mb-10 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            isDark
              ? "text-zinc-500 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {backLink.label}
        </a>
      )}

      {/* Metadata row. Each item renders only when it has a value, so an unfinished draft does
          not show empty labels or a stray separator. */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {article.category && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.18em] ${categoryBadgeClasses(article.category)}`}
          >
            <Tag className="h-3 w-3" />
            {article.category.toUpperCase()}
          </span>
        )}
        {article.publishedAt && (
          <span className={`inline-flex items-center gap-1.5 text-xs ${mutedText}`}>
            <Calendar className="h-3.5 w-3.5" />
            {formatPublishedDate(article.publishedAt)}
          </span>
        )}
        {minutes > 0 && (
          <span className={`inline-flex items-center gap-1.5 text-xs ${mutedText}`}>
            <Clock className="h-3.5 w-3.5" />
            {minutes} min read
          </span>
        )}
      </div>

      <h1
        className={`mb-5 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl ${titleText}`}
      >
        {article.title || "Untitled"}
      </h1>

      {article.excerpt && (
        <p className={`mb-8 text-lg leading-relaxed ${leadText}`}>{article.excerpt}</p>
      )}

      {article.author?.name && (
        <div className="mb-10 flex items-center gap-3">
          {article.author.avatarUrl ? (
            <img
              src={article.author.avatarUrl}
              alt={article.author.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isDark ? "bg-white/[0.06] text-zinc-400" : "bg-secondary text-muted-foreground"
              }`}
            >
              <User className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${titleText}`}>{article.author.name}</p>
            {article.author.role && <p className={`text-xs ${mutedText}`}>{article.author.role}</p>}
          </div>
        </div>
      )}

      {article.coverImageUrl && (
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="mb-10 w-full rounded-2xl object-cover"
        />
      )}

      <div className={`mb-10 h-px ${dividerColor}`} />

      {showTableOfContents && <DocTableOfContents doc={doc} theme={theme} />}

      {doc.blocks.length > 0 ? (
        <DocRenderer doc={doc} theme={theme} />
      ) : (
        <div
          className={`rounded-xl border px-8 py-10 text-center ${
            isDark ? "border-white/10 bg-white/[0.03]" : "border-border bg-secondary"
          }`}
        >
          <p
            className={`text-base font-semibold ${isDark ? "text-white/80" : "text-foreground/80"}`}
          >
            This article is being prepared.
          </p>
          <p className={`mt-2 text-sm ${mutedText}`}>
            The full piece will be published here shortly. Check back soon.
          </p>
        </div>
      )}

      {article.tags.length > 0 && (
        <div
          className={`mt-12 flex flex-wrap items-center gap-2 border-t pt-8 ${isDark ? "border-white/[0.07]" : "border-border"}`}
        >
          {article.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 text-xs ${
                isDark ? "bg-white/[0.05] text-zinc-400" : "bg-secondary text-muted-foreground"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {footerSlot}
    </article>
  );
}
