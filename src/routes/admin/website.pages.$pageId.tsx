import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import * as icons from "lucide-react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Save,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type {
  ContentStatus,
  ManagedPage,
  PageSection,
  SectionSchema,
  SectionType,
  SeoFields,
} from "@/lib/cms/types";
import { SECTION_SCHEMAS, SECTION_TYPES } from "@/lib/cms/types";
import { blockId } from "@/lib/cms/doc";
import { website, CmsError } from "@/lib/cms/admin-client";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm, Modal } from "@/components/admin/Modal";
import { SectionFieldsForm } from "@/components/admin/website/SectionFieldsForm";
import { SeoPanel } from "@/components/admin/content/SeoPanel";
import { PublishControls } from "@/components/admin/content/PublishControls";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  Spinner,
  Textarea,
} from "@/components/admin/primitives";

function iconByName(name: string): LucideIcon {
  const registry = icons as unknown as Record<string, LucideIcon>;
  return registry[name] ?? icons.Square;
}

/**
 * The page editor — a structured section builder.
 *
 * A page is an ordered list of sections drawn from the design system's catalogue. You add a
 * section, fill in its fields, reorder or hide it. This is deliberately *not* a free-form layout
 * canvas: you cannot place arbitrary HTML or set positions, so a managed page cannot drift off the
 * ENICE design. Built-in pages (`systemRoute`) have their address and existence locked, but their
 * managed sections and SEO are fully editable.
 */
function PageEditorScreen({ pageId }: { pageId: string }) {
  const { can } = useAdmin();
  const toast = useToast();
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const canWrite = can("pages.write");

  const [page, setPage] = useState<ManagedPage | null>(null);
  const [schemas, setSchemas] = useState<Record<SectionType, SectionSchema>>(SECTION_SCHEMAS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [seo, setSeo] = useState<SeoFields>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"content" | "seo">("content");
  const [addOpen, setAddOpen] = useState(false);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const hydrate = useCallback((loaded: ManagedPage) => {
    setPage(loaded);
    setTitle(loaded.title);
    setSummary(loaded.summary);
    setSections(loaded.sections);
    setSeo(loaded.seo);
    setDirty(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    website
      .page(pageId)
      .then((result) => {
        hydrate(result.page);
        setSchemas(result.schemas);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, [pageId, hydrate]);

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

  const save = useCallback(async (): Promise<ManagedPage | null> => {
    if (!page) return null;
    setSaving(true);
    try {
      const { page: updated } = await website.updatePage(page.id, {
        title,
        summary,
        sections,
        seo,
        revision: page.revision,
      });
      hydrate(updated);
      toast.success("Page saved");
      return updated;
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
  }, [page, title, summary, sections, seo, hydrate, toast]);

  const transition = async (status: ContentStatus, scheduledFor?: string | null) => {
    if (!page) return;
    if (dirtyRef.current) {
      const saved = await save();
      if (!saved) return;
    }
    setSaving(true);
    try {
      const { page: updated } = await website.transitionPage(page.id, status, scheduledFor);
      hydrate(updated);
      toast.success(
        status === "published"
          ? "Page published"
          : status === "archived"
            ? "Page archived"
            : "Moved to draft",
      );
    } catch (caught) {
      toast.error(
        "Could not update status",
        caught instanceof CmsError ? caught.message : undefined,
      );
    } finally {
      setSaving(false);
    }
  };

  const patchSection = (id: string, patch: Partial<PageSection>) => {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, ...patch } : section)),
    );
    setDirty(true);
  };
  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    setDirty(true);
  };
  const removeSection = (id: string) => {
    setSections((current) => current.filter((section) => section.id !== id));
    setDirty(true);
  };
  const addSection = (type: SectionType) => {
    setSections((current) => [
      ...current,
      { id: blockId(), type, label: schemas[type].label, visible: true, fields: {} },
    ]);
    setDirty(true);
    setAddOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }
  if (error || !page) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-foreground text-[15px] font-semibold">Could not open this page</p>
        <p className="text-muted-foreground mt-1.5 text-[13px]">
          {error ?? "It may have been deleted."}
        </p>
        <Button
          variant="outline"
          icon={ArrowLeft}
          className="mt-5"
          onClick={() => void navigate({ to: "/admin/website/pages" })}
        >
          Back to Pages
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="border-border bg-background/85 sticky top-14 z-20 -mx-4 mb-6 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton
              icon={ArrowLeft}
              label="Back to Pages"
              variant="ghost"
              onClick={() => void navigate({ to: "/admin/website/pages" })}
            />
            <div className="min-w-0">
              <p className="text-foreground flex items-center gap-1.5 truncate text-[14px] font-semibold">
                {title || "Untitled page"}
                {page.systemRoute && (
                  <Lock className="text-muted-foreground h-3 w-3" aria-label="Built-in route" />
                )}
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <code>{page.path}</code>
                {saving ? (
                  <>
                    <Spinner className="h-3 w-3" /> Saving…
                  </>
                ) : dirty ? (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-600" /> Saved
                  </span>
                )}
              </p>
            </div>
          </div>
          {canWrite && (
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <div className="border-border inline-flex rounded-md border p-0.5">
            {(["content", "seo"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTab(option)}
                className={[
                  "rounded px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors",
                  tab === option
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {option === "seo" ? "SEO" : "Content"}
              </button>
            ))}
          </div>

          {tab === "content" ? (
            <>
              <Card className="p-5">
                <div className="space-y-4">
                  <Field label="Page title">
                    {(props) => (
                      <Input
                        {...props}
                        value={title}
                        onChange={(event) => {
                          setTitle(event.target.value);
                          setDirty(true);
                        }}
                        disabled={!canWrite}
                      />
                    )}
                  </Field>
                  <Field
                    label="Summary"
                    hint="Shown in the page manager list, not on the page itself."
                  >
                    {(props) => (
                      <Textarea
                        {...props}
                        value={summary}
                        onChange={(event) => {
                          setSummary(event.target.value);
                          setDirty(true);
                        }}
                        rows={2}
                        disabled={!canWrite}
                      />
                    )}
                  </Field>
                </div>
              </Card>

              {sections.length === 0 ? (
                <Card className="border-dashed p-10 text-center">
                  <p className="text-foreground text-[14px] font-semibold">No sections yet</p>
                  <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-[12.5px]">
                    {page.systemRoute
                      ? "This built-in page renders from code. Add managed sections here to override or extend it."
                      : "Add sections from the design system to build this page."}
                  </p>
                  {canWrite && (
                    <Button
                      variant="primary"
                      icon={Plus}
                      className="mt-4"
                      onClick={() => setAddOpen(true)}
                    >
                      Add a section
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <PageSectionCard
                      key={section.id}
                      section={section}
                      schema={schemas[section.type]}
                      index={index}
                      total={sections.length}
                      canWrite={canWrite}
                      onChange={(patch) => patchSection(section.id, patch)}
                      onMove={(direction) => moveSection(index, direction)}
                      onRemove={async () => {
                        const ok = await confirm({
                          title: "Remove this section?",
                          message: `"${section.label}" will be removed from this page. You can add it back later.`,
                          confirmLabel: "Remove",
                        });
                        if (ok) removeSection(section.id);
                      }}
                    />
                  ))}
                  {canWrite && (
                    <Button
                      variant="outline"
                      icon={Plus}
                      className="w-full justify-center"
                      onClick={() => setAddOpen(true)}
                    >
                      Add a section
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card className="p-6">
              <CardHeader
                title="Search and social"
                description="How this page appears in search and when shared."
                className="-mx-6 -mt-6 mb-6"
              />
              <SeoPanel
                seo={seo}
                source={{ title, excerpt: summary, image: null, path: page.path }}
                onChange={(next) => {
                  setSeo(next);
                  setDirty(true);
                }}
              />
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <PublishControls
              item={{
                ...page,
                // PublishControls reads only these fields off the item.
                kind: "blog",
                slug: page.path,
                excerpt: summary,
                body: {},
                coverImageUrl: null,
                author: null,
                category: null,
                tags: [],
                extras: {},
                createdByEmail: null,
                updatedByEmail: page.updatedByEmail,
                title,
                seo,
              }}
              canPublish={can("pages.publish")}
              busy={saving}
              dirty={dirty}
              onTransition={transition}
            />
          </Card>

          <Card className="p-4">
            <p className="text-muted-foreground text-[11.5px] leading-relaxed">
              Updated {formatRelativeTime(page.updatedAt)}
              {page.updatedByEmail ? ` by ${page.updatedByEmail}` : ""}.
            </p>
            {page.status === "published" && (
              <a
                href={page.path}
                target="_blank"
                rel="noreferrer"
                className="text-primary mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold hover:underline"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" /> View on the website
              </a>
            )}
          </Card>
        </aside>
      </div>

      <AddSectionDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        schemas={schemas}
        onPick={addSection}
      />
      {dialog}
    </>
  );
}

function PageSectionCard({
  section,
  schema,
  index,
  total,
  canWrite,
  onChange,
  onMove,
  onRemove,
}: {
  section: PageSection;
  schema: SectionSchema | undefined;
  index: number;
  total: number;
  canWrite: boolean;
  onChange: (patch: Partial<PageSection>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconByName(schema?.icon ?? "Square");

  if (!schema) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 p-4">
        <p className="text-[12.5px] text-amber-900">
          Unknown section type "{section.type}". It will be preserved but cannot be edited here.
        </p>
      </Card>
    );
  }

  return (
    <Card className={section.visible ? undefined : "opacity-70"}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="bg-secondary text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="text-foreground block truncate text-[13px] font-semibold">
            {section.label}
          </span>
          <span className="text-muted-foreground block text-[11px]">{schema.label}</span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {!section.visible && <Badge>Hidden</Badge>}
          {canWrite && (
            <>
              <IconButton
                icon={ChevronUp}
                label="Move up"
                size="sm"
                disabled={index === 0}
                onClick={() => onMove(-1)}
              />
              <IconButton
                icon={ChevronDown}
                label="Move down"
                size="sm"
                disabled={index === total - 1}
                onClick={() => onMove(1)}
              />
              <IconButton
                icon={section.visible ? Eye : EyeOff}
                label={section.visible ? "Hide" : "Show"}
                size="sm"
                onClick={() => onChange({ visible: !section.visible })}
              />
              <IconButton icon={Trash2} label="Remove" size="sm" onClick={onRemove} />
            </>
          )}
          <IconButton
            icon={expanded ? ChevronUp : ChevronDown}
            label={expanded ? "Collapse" : "Expand"}
            size="sm"
            variant="ghost"
            onClick={() => setExpanded((current) => !current)}
          />
        </div>
      </div>

      {expanded && (
        <div className="border-border space-y-4 border-t p-4">
          <Field label="Label" hint="For your reference in this list — not shown on the page.">
            {(props) => (
              <Input
                {...props}
                value={section.label}
                onChange={(event) => onChange({ label: event.target.value })}
                disabled={!canWrite}
              />
            )}
          </Field>
          <SectionFieldsForm
            schema={schema}
            values={section.fields}
            onChange={(fields) => onChange({ fields })}
            disabled={!canWrite}
          />
        </div>
      )}
    </Card>
  );
}

function AddSectionDialog({
  open,
  onClose,
  schemas,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  schemas: Record<SectionType, SectionSchema>;
  onPick: (type: SectionType) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a section"
      description="Pick a section type. Each is styled by the ENICE design system."
      size="lg"
    >
      <div className="grid max-h-[60vh] gap-2 overflow-y-auto sm:grid-cols-2">
        {SECTION_TYPES.map((type) => {
          const schema = schemas[type];
          const Icon = iconByName(schema.icon);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPick(type)}
              className="border-border hover:border-primary hover:bg-secondary/40 flex items-start gap-3 rounded-lg border p-3 text-left transition-colors"
            >
              <span className="bg-secondary text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="text-foreground block text-[13px] font-semibold">
                  {schema.label}
                </span>
                <span className="text-muted-foreground block text-[11.5px] leading-snug">
                  {schema.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

export const Route = createFileRoute("/admin/website/pages/$pageId")({
  component: function PageEditorRoute() {
    const { pageId } = Route.useParams();
    return (
      <AdminShell requiredPermission="pages.read">
        <PageEditorScreen pageId={pageId} />
      </AdminShell>
    );
  },
});
