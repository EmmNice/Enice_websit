/**
 * The content editor — the writing surface for all four kinds.
 *
 * ## Layout
 *
 * A three-mode workspace (Write / Preview / SEO) with a persistent metadata sidebar. Write is the
 * block editor with the title above it; Preview is the shared `ArticleView` at desktop/mobile
 * widths; SEO is the metadata panel with live snippet previews. The sidebar carries publishing
 * controls, the cover image, author, category and tags — the things you set once and glance at,
 * kept out of the writing column.
 *
 * ## Save model
 *
 * The whole item is one piece of local state; every field edits it and marks the form dirty. Save
 * is explicit (and also fired by ⌘S), and the sidebar shows dirty state so nothing is lost
 * silently. A new item is created on first save and the route swapped to the edit URL, so the rest
 * of the session is an update against a real id.
 *
 * Publishing a dirty item saves first, so "Publish" never ships a stale version. Optimistic
 * concurrency (`expectedRevision`) means two people editing at once get a clear conflict rather
 * than a silent overwrite.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Eye,
  History,
  PenLine,
  Save,
  Search as SearchIcon,
  Tag as TagIcon,
} from "lucide-react";
import type {
  ContentExtras,
  ContentItem,
  ContentKind,
  ContentStatus,
  SeoFields,
} from "@/lib/cms/types";
import { CONTENT_CATEGORIES, CONTENT_KIND_META, CONTENT_KIND_SEGMENT } from "@/lib/cms/types";
import {
  asDoc,
  deriveExcerpt,
  emptyDoc,
  readingMinutes,
  slugify,
  type EniceDoc,
} from "@/lib/cms/doc";
import {
  content,
  CmsError,
  type ContentDraftInput,
  type RevisionSummary,
} from "@/lib/cms/admin-client";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { useAdmin } from "../AdminContext";
import { useToast } from "../Toaster";
import { describeError } from "../AdminShell";
import { BlockEditor } from "../editor/BlockEditor";
import { ImageField } from "../MediaPicker";
import { PreviewPane, type PreviewDevice } from "./PreviewPane";
import { SeoPanel } from "./SeoPanel";
import { PublishControls } from "./PublishControls";
import { ExtrasFields } from "./ExtrasFields";
import {
  Button,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  SegmentedControl,
  Spinner,
  Textarea,
} from "../primitives";

type Mode = "write" | "preview" | "seo";

/** The editable shape held in state. A superset of the fields the API round-trips. */
interface Draft {
  title: string;
  slug: string;
  excerpt: string;
  body: EniceDoc;
  coverImageUrl: string | null;
  category: string | null;
  tags: string[];
  authorName: string;
  authorRole: string;
  seo: SeoFields;
  extras: ContentExtras;
}

function toDraft(item: ContentItem): Draft {
  return {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    body: asDoc(item.body),
    coverImageUrl: item.coverImageUrl,
    category: item.category,
    tags: item.tags,
    authorName: item.author?.name ?? "",
    authorRole: item.author?.role ?? "",
    seo: item.seo,
    extras: item.extras,
  };
}

function emptyDraft(): Draft {
  return {
    title: "",
    slug: "",
    excerpt: "",
    body: emptyDoc(),
    coverImageUrl: null,
    category: null,
    tags: [],
    authorName: "",
    authorRole: "",
    seo: {},
    extras: {},
  };
}

function toInput(draft: Draft): ContentDraftInput {
  return {
    title: draft.title,
    slug: draft.slug || undefined,
    excerpt: draft.excerpt,
    body: draft.body,
    coverImageUrl: draft.coverImageUrl,
    category: draft.category,
    tags: draft.tags,
    author: draft.authorName.trim()
      ? { name: draft.authorName.trim(), role: draft.authorRole.trim() || undefined }
      : null,
    seo: draft.seo as Record<string, unknown>,
    extras: draft.extras as Record<string, unknown>,
  };
}

export function ContentEditor({ kind, itemId }: { kind: ContentKind; itemId: string | null }) {
  const meta = CONTENT_KIND_META[kind];
  const segment = CONTENT_KIND_SEGMENT[kind];
  const { can } = useAdmin();
  const toast = useToast();
  const navigate = useNavigate();

  const isNew = itemId === null;
  const [item, setItem] = useState<ContentItem | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("write");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);

  // The current draft, mirrored into a ref so the ⌘S handler and the unload guard read the latest
  // value without being re-bound on every keystroke.
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // ── Load ──
  useEffect(() => {
    if (isNew) {
      setDraft(emptyDraft());
      setItem(null);
      setDirty(false);
      return;
    }
    setLoading(true);
    content
      .read(itemId)
      .then(({ item: loaded, revisions: history }) => {
        setItem(loaded);
        setDraft(toDraft(loaded));
        setRevisions(history);
        setDirty(false);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, [itemId, isNew]);

  useEffect(() => {
    content
      .taxonomies(kind)
      .then((result) => setSuggestedCategories(result.categories))
      .catch(() => {});
  }, [kind]);

  const patch = useCallback((changes: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setDirty(true);
  }, []);

  // ── Save ──
  const save = useCallback(
    async (options: { silent?: boolean } = {}): Promise<ContentItem | null> => {
      const current = draftRef.current;
      if (!current.title.trim()) {
        toast.error("A title is required", "Add a title before saving.");
        setMode("write");
        return null;
      }

      setSaving(true);
      try {
        if (item) {
          const { item: updated } = await content.update(item.id, {
            ...toInput(current),
            revision: item.revision,
          });
          setItem(updated);
          setDraft(toDraft(updated));
          setDirty(false);
          setSavedAt(new Date());
          if (!options.silent) toast.success("Saved");
          content
            .revisions(updated.id)
            .then((r) => setRevisions(r.revisions))
            .catch(() => {});
          return updated;
        }

        const { item: created } = await content.create({ ...toInput(current), kind });
        setItem(created);
        setDraft(toDraft(created));
        setDirty(false);
        setSavedAt(new Date());
        if (!options.silent) toast.success("Draft created");
        // Swap the URL to the edit route without a reload, so subsequent saves are updates.
        void navigate({ to: `/admin/content/${segment}/${created.id}`, replace: true });
        return created;
      } catch (caught) {
        if (caught instanceof CmsError && caught.isConflict) {
          toast.error("Save conflict", caught.message);
        } else {
          toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
        }
        return null;
      } finally {
        setSaving(false);
      }
    },
    [item, kind, segment, navigate, toast],
  );

  // ⌘S / Ctrl+S saves.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirtyRef.current && can("content.write")) void save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save, can]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const transition = useCallback(
    async (status: ContentStatus, scheduledFor?: string | null) => {
      // Save pending edits first, so a transition never ships a stale version.
      let target = item;
      if (dirtyRef.current || !target) {
        target = await save({ silent: true });
        if (!target) return;
      }

      setSaving(true);
      try {
        const { item: updated } = await content.transition(target.id, status, scheduledFor);
        setItem(updated);
        setDraft(toDraft(updated));
        setDirty(false);
        const messages: Record<ContentStatus, string> = {
          published: "Published to the ENICE website",
          scheduled: "Scheduled",
          draft: "Moved to draft",
          archived: "Archived",
        };
        toast.success(messages[status]);
      } catch (caught) {
        toast.error(
          "Could not update status",
          caught instanceof CmsError ? caught.message : undefined,
        );
      } finally {
        setSaving(false);
      }
    },
    [item, save, toast],
  );

  const derivedExcerpt = useMemo(() => deriveExcerpt(draft.body), [draft.body]);
  const minutes = useMemo(() => readingMinutes(draft.body), [draft.body]);

  const previewArticle = {
    title: draft.title,
    excerpt: draft.excerpt || derivedExcerpt,
    category: draft.category,
    tags: draft.tags,
    coverImageUrl: draft.coverImageUrl,
    author: draft.authorName.trim() ? { name: draft.authorName, role: draft.authorRole } : null,
    publishedAt: item?.publishedAt ?? null,
    body: draft.body,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-foreground text-[15px] font-semibold">Could not open this item</p>
        <p className="text-muted-foreground mt-1.5 text-[13px]">{error}</p>
        <Button
          variant="outline"
          icon={ArrowLeft}
          className="mt-5"
          onClick={() => void navigate({ to: meta.route })}
        >
          Back to {meta.plural}
        </Button>
      </div>
    );
  }

  const readOnly = !can("content.write");

  return (
    <div>
      {/* Sticky editor header */}
      <div className="border-border bg-background/85 sticky top-14 z-20 -mx-4 mb-6 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton
              icon={ArrowLeft}
              label={`Back to ${meta.plural}`}
              variant="ghost"
              onClick={() => void navigate({ to: meta.route })}
            />
            <div className="min-w-0">
              <p className="text-foreground truncate text-[14px] font-semibold">
                {isNew ? `New ${meta.singular.toLowerCase()}` : draft.title || "Untitled"}
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                {saving ? (
                  <>
                    <Spinner className="h-3 w-3" /> Saving…
                  </>
                ) : dirty ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved changes
                  </>
                ) : savedAt ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" /> Saved{" "}
                    {formatRelativeTime(savedAt.toISOString())}
                  </>
                ) : (
                  <>{meta.singular}</>
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <SegmentedControl
              value={mode}
              onChange={setMode}
              size="sm"
              options={[
                { value: "write", label: "Write", icon: PenLine },
                { value: "preview", label: "Preview", icon: Eye },
                { value: "seo", label: "SEO", icon: SearchIcon },
              ]}
            />
            {!readOnly && (
              <Button
                variant="primary"
                icon={Save}
                loading={saving}
                disabled={!dirty}
                onClick={() => void save()}
              >
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="min-w-0">
          {mode === "write" && (
            <Card className="p-6 sm:p-8">
              <input
                value={draft.title}
                onChange={(event) => patch({ title: event.target.value })}
                placeholder={`${meta.singular} title`}
                aria-label="Title"
                disabled={readOnly}
                className="text-foreground placeholder:text-muted-foreground/40 mb-6 w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none"
              />
              {readOnly ? (
                <div className="pointer-events-none opacity-70">
                  <BlockEditor doc={draft.body} onChange={() => undefined} />
                </div>
              ) : (
                <BlockEditor doc={draft.body} onChange={(body) => patch({ body })} />
              )}
            </Card>
          )}

          {mode === "preview" && (
            <Card className="h-[calc(100dvh-12rem)] p-4 sm:p-5">
              <PreviewPane device={device} onDeviceChange={setDevice} article={previewArticle} />
            </Card>
          )}

          {mode === "seo" && (
            <Card className="p-6">
              <CardHeader
                title="Search and social"
                description="How this appears in search results and when shared. Blank fields use sensible defaults."
                className="-mx-6 -mt-6 mb-6"
              />
              <SeoPanel
                seo={draft.seo}
                source={{
                  title: draft.title,
                  excerpt: draft.excerpt || derivedExcerpt,
                  image: draft.coverImageUrl,
                  path: `${meta.publicPrefix ?? `/${segment}`}/${draft.slug || slugify(draft.title) || "…"}`,
                }}
                onChange={(seo) => patch({ seo })}
              />
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {item && (
            <Card className="p-4">
              <PublishControls
                item={item}
                canPublish={can("content.publish")}
                busy={saving}
                dirty={dirty}
                onTransition={transition}
              />
            </Card>
          )}

          {isNew && (
            <Card className="p-4">
              <p className="text-muted-foreground text-[12px] leading-relaxed">
                Save this as a draft to unlock preview, scheduling and publishing. Nothing is public
                until you publish it.
              </p>
              {!readOnly && (
                <Button
                  variant="primary"
                  icon={Save}
                  loading={saving}
                  className="mt-3 w-full justify-center"
                  onClick={() => void save()}
                >
                  Save draft
                </Button>
              )}
            </Card>
          )}

          <Card className="p-4">
            <CardHeader title="Details" className="-mx-4 -mt-4 mb-4" />
            <div className="space-y-4">
              <ImageField
                label="Cover image"
                value={draft.coverImageUrl ?? ""}
                onChange={(url) => patch({ coverImageUrl: url || null })}
                folder={segment}
                hint="Shown in listings and as the social share image."
              />

              <Field
                label="Excerpt"
                hint="A one or two sentence summary. Auto-generated if left blank."
              >
                {(props) => (
                  <Textarea
                    {...props}
                    value={draft.excerpt}
                    onChange={(event) => patch({ excerpt: event.target.value })}
                    placeholder={derivedExcerpt || "A short summary…"}
                    rows={3}
                    disabled={readOnly}
                  />
                )}
              </Field>

              <Field
                label="URL slug"
                hint={`${meta.publicPrefix ?? `/${segment}`}/${draft.slug || "…"}`}
              >
                {(props) => (
                  <Input
                    {...props}
                    value={draft.slug}
                    onChange={(event) => patch({ slug: slugify(event.target.value) })}
                    placeholder={slugify(draft.title) || "auto-from-title"}
                    disabled={readOnly}
                  />
                )}
              </Field>

              <Field label="Category">
                {(props) => (
                  <Input
                    {...props}
                    value={draft.category ?? ""}
                    onChange={(event) => patch({ category: event.target.value || null })}
                    placeholder="Uncategorised"
                    list={`categories-${kind}`}
                    disabled={readOnly}
                  />
                )}
              </Field>
              <datalist id={`categories-${kind}`}>
                {[...new Set([...CONTENT_CATEGORIES[kind], ...suggestedCategories])].map(
                  (category) => (
                    <option key={category} value={category} />
                  ),
                )}
              </datalist>

              <TagEditor
                tags={draft.tags}
                onChange={(tags) => patch({ tags })}
                disabled={readOnly}
              />

              <Field label="Author" hint="Shown as the byline. Optional.">
                {(props) => (
                  <Input
                    {...props}
                    value={draft.authorName}
                    onChange={(event) => patch({ authorName: event.target.value })}
                    placeholder="e.g. ENICE Group"
                    disabled={readOnly}
                  />
                )}
              </Field>

              {minutes > 0 && (
                <p className="text-muted-foreground flex items-center gap-1.5 text-[11.5px]">
                  <Clock className="h-3 w-3" aria-hidden="true" /> About {minutes} min read
                </p>
              )}
            </div>
          </Card>

          {/* Kind-specific extras: CTA, dates, featured, icon. */}
          <ExtrasFields
            kind={kind}
            extras={draft.extras}
            onChange={(extras) => patch({ extras })}
            disabled={readOnly}
          />

          {item && revisions.length > 1 && (
            <RevisionHistory
              item={item}
              revisions={revisions}
              onReverted={(updated) => {
                setItem(updated);
                setDraft(toDraft(updated));
                setDirty(false);
              }}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

/** Tag input: type-and-Enter to add, backspace on an empty field removes the last. */
function TagEditor({
  tags,
  onChange,
  disabled,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  const add = () => {
    const tag = value.trim().replace(/,$/, "").trim();
    if (tag && !tags.includes(tag) && tags.length < 20) onChange([...tags, tag]);
    setValue("");
  };

  return (
    <Field label="Tags">
      {(props) => (
        <div>
          <div className="border-border bg-background focus-within:border-primary focus-within:ring-primary/15 flex flex-wrap gap-1.5 rounded-md border px-2 py-1.5 focus-within:ring-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11.5px]"
              >
                <TagIcon className="h-2.5 w-2.5" aria-hidden="true" />
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onChange(tags.filter((t) => t !== tag))}
                    aria-label={`Remove ${tag}`}
                    className="text-muted-foreground hover:text-destructive ml-0.5"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            <input
              {...props}
              value={value}
              disabled={disabled}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  add();
                } else if (event.key === "Backspace" && !value && tags.length > 0) {
                  onChange(tags.slice(0, -1));
                }
              }}
              onBlur={add}
              placeholder={tags.length === 0 ? "Add tags…" : ""}
              className="text-foreground min-w-20 flex-1 bg-transparent text-[12.5px] outline-none"
            />
          </div>
        </div>
      )}
    </Field>
  );
}

function RevisionHistory({
  item,
  revisions,
  onReverted,
}: {
  item: ContentItem;
  revisions: RevisionSummary[];
  onReverted: (item: ContentItem) => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState<number | null>(null);

  const revert = async (revision: number) => {
    setBusy(revision);
    try {
      const { item: updated } = await content.revert(item.id, revision);
      onReverted(updated);
      toast.success(`Restored revision ${revision}`);
    } catch (caught) {
      toast.error("Could not restore", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="p-4">
      <CardHeader title="History" icon={History} className="-mx-4 -mt-4 mb-3" />
      <ul className="space-y-1.5">
        {revisions.slice(0, 8).map((revision) => (
          <li key={revision.id} className="flex items-center justify-between gap-2">
            <span className="min-w-0">
              <span className="text-foreground block truncate text-[12px]">
                Revision {revision.revision}
              </span>
              <span className="text-muted-foreground block text-[10.5px]">
                {formatRelativeTime(revision.createdAt)}
                {revision.createdByEmail ? ` · ${revision.createdByEmail}` : ""}
              </span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              loading={busy === revision.revision}
              onClick={() => revert(revision.revision)}
            >
              Restore
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
