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
 *
 * ## Two themes, and why the dark one carries `.site`
 *
 * The component renders no shell and owns no page chrome; the caller places it. Colour comes
 * entirely from the `theme` prop, and the seam is kept because /admin is a light-theme tool that
 * still needs this layout legible on light chrome.
 *
 * The dark palette (`bone`, `gold`, `surface-*`) is declared on `.site`, which `__root.tsx` puts
 * on `<html>` for public routes and removes under /admin. The dark theme therefore *scopes itself*
 * with that class: the admin preview renders `theme="dark"` outside `.site`, and without the scope
 * every token in this file would resolve to nothing and the preview would go blank-on-black. The
 * class only declares custom properties and the canvas colour, so applying it inside the public
 * site — where it is already inherited — changes nothing.
 */

import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import { asDoc, readingMinutes as computeReadingMinutes } from "@/lib/cms/doc";
import type { ContentAuthor } from "@/lib/cms/types";
import { categoryBadgeClasses, formatPublishedDate } from "@/lib/cms/public-client";
import { cn } from "@/lib/utils";
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

// ─── Theme ───────────────────────────────────────────────────────────────────

interface ViewClasses {
  /** Token scope. Dark needs `.site`; light inherits the admin theme from the document. */
  scope: string;
  backLink: string;
  meta: string;
  /** Category pills are colour-coded on the public site and neutral in the light tool. */
  badge: string | null;
  title: string;
  lead: string;
  authorName: string;
  authorRole: string;
  authorFallback: string;
  divider: string;
  empty: { frame: string; title: string; body: string };
  tags: { frame: string; chip: string };
}

const THEMES: Record<DocTheme, ViewClasses> = {
  dark: {
    scope: "site",
    backLink:
      "type-meta mb-10 inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-gold",
    meta: "type-meta tnum inline-flex items-center gap-1.5",
    badge: null, // supplied per-category by `categoryBadgeClasses`
    title: "type-display mb-5 text-foreground",
    lead: "type-lead mb-8",
    authorName: "text-sm font-semibold text-foreground",
    authorRole: "type-meta",
    authorFallback: "bg-surface-1 text-bone-soft",
    divider: "bg-border",
    empty: {
      frame: "panel-quiet px-8 py-10 text-center",
      title: "text-base font-semibold text-foreground",
      body: "mt-2 text-sm text-bone-soft",
    },
    tags: {
      frame: "border-border",
      chip: "rounded-full border border-border bg-surface-1 px-3 py-1 text-xs text-bone-soft",
    },
  },
  light: {
    scope: "",
    backLink:
      "mb-10 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground",
    meta: "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
    badge: "border-border bg-secondary text-foreground",
    title: "mb-5 text-3xl leading-tight font-extrabold tracking-tight text-foreground",
    lead: "mb-8 text-lg leading-relaxed text-muted-foreground",
    authorName: "text-sm font-semibold text-foreground",
    authorRole: "text-xs text-muted-foreground",
    authorFallback: "bg-secondary text-muted-foreground",
    divider: "bg-border",
    empty: {
      frame: "rounded-xl border border-border bg-secondary px-8 py-10 text-center",
      title: "text-base font-semibold text-foreground",
      body: "mt-2 text-sm text-muted-foreground",
    },
    tags: {
      frame: "border-border",
      chip: "rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground",
    },
  },
};

export function ArticleView({
  article,
  theme = "dark",
  backLink = null,
  footerSlot = null,
  showTableOfContents = true,
}: ArticleViewProps) {
  const t = THEMES[theme];
  const doc = asDoc(article.body);
  // Recomputed when absent so an unsaved draft still shows a reading time in preview.
  const minutes = article.readingMinutes ?? computeReadingMinutes(doc);
  const badgeClasses = t.badge ?? categoryBadgeClasses(article.category);

  return (
    // Selection is disabled globally on the site; an article a reader cannot quote is a defect,
    // so the whole reading surface opts back in here rather than block by block.
    <article data-allow-select className={t.scope || undefined}>
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
          className={t.backLink}
        >
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" /> {backLink.label}
        </a>
      )}

      {/* Metadata row. Each item renders only when it has a value, so an unfinished draft does
          not show empty labels or a stray separator. */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {article.category && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
              "text-[10px] font-semibold tracking-[0.18em]",
              badgeClasses,
            )}
          >
            <Tag aria-hidden className="h-3 w-3" />
            {article.category.toUpperCase()}
          </span>
        )}
        {article.publishedAt && (
          <span className={t.meta}>
            <Calendar aria-hidden className="h-3.5 w-3.5" />
            {formatPublishedDate(article.publishedAt)}
          </span>
        )}
        {minutes > 0 && (
          <span className={t.meta}>
            <Clock aria-hidden className="h-3.5 w-3.5" />
            {minutes} min read
          </span>
        )}
      </div>

      <h1 className={t.title}>{article.title || "Untitled"}</h1>

      {article.excerpt && <p className={t.lead}>{article.excerpt}</p>}

      {article.author?.name && (
        <div className="mb-10 flex items-center gap-3">
          {article.author.avatarUrl ? (
            <img
              src={article.author.avatarUrl}
              alt={article.author.name}
              width={36}
              height={36}
              loading="lazy"
              decoding="async"
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                t.authorFallback,
              )}
            >
              <User className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className={t.authorName}>{article.author.name}</p>
            {article.author.role && <p className={t.authorRole}>{article.author.role}</p>}
          </div>
        </div>
      )}

      {article.coverImageUrl && (
        // The ratio is fixed because the content model carries no intrinsic dimensions: without
        // one, the cover reserves no space and every article shifts its own body text on load.
        <img
          src={article.coverImageUrl}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="mb-10 aspect-[16/9] w-full rounded-lg border border-border object-cover"
        />
      )}

      <div className={cn("mb-10 h-px", t.divider)} />

      {showTableOfContents && <DocTableOfContents doc={doc} theme={theme} />}

      {doc.blocks.length > 0 ? (
        <DocRenderer doc={doc} theme={theme} />
      ) : (
        <div className={t.empty.frame}>
          <p className={t.empty.title}>This article is being prepared.</p>
          <p className={t.empty.body}>
            The full piece will be published here shortly. Check back soon.
          </p>
        </div>
      )}

      {article.tags.length > 0 && (
        <div className={cn("mt-12 flex flex-wrap items-center gap-2 border-t pt-8", t.tags.frame)}>
          {article.tags.map((tag) => (
            <span key={tag} className={t.tags.chip}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {footerSlot}
    </article>
  );
}
