import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Database,
  FileText,
  Pencil,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  Trash2,
  Upload,
} from "lucide-react";
import type { KnowledgeEntry, KnowledgeStatus } from "@/lib/cms/types";
import { KNOWLEDGE_PDF_MAX_BYTES } from "@/lib/cms/types";
import { knowledge, uploadKnowledgePdf, CmsError } from "@/lib/cms/admin-client";
import { formatShortDate } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm, Modal } from "@/components/admin/Modal";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  Metric,
  NotConfiguredNotice,
  PageHeader,
  SegmentedControl,
  SkeletonRows,
  StatusPill,
  Textarea,
  Toolbar,
} from "@/components/admin/primitives";

type StatusFilter = "all" | KnowledgeStatus;

interface EditorState {
  id: string | null;
  title: string;
  body: string;
  tags: string;
  status: KnowledgeStatus;
}

const EMPTY_EDITOR: EditorState = {
  id: null,
  title: "",
  body: "",
  tags: "",
  status: "active",
};

/**
 * The AI assistant knowledge base.
 *
 * This is where the website chatbot is taught. Each entry — a typed note or the text extracted
 * from an uploaded PDF — becomes material the assistant retrieves and grounds its answers in, so
 * the owner can expand what it knows without a developer changing code. Only `active` entries are
 * surfaced to the assistant; disabling one parks it without losing it.
 */
function KnowledgeScreen() {
  const { can, config } = useAdmin();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const canWrite = can("ai.knowledge.write");

  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number }>({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ name: string; progress: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    knowledge
      .list({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        limit: 200,
      })
      .then((result) => {
        setEntries(result.entries);
        setStats(result.stats);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const disabledCount = useMemo(() => Math.max(stats.total - stats.active, 0), [stats]);

  const saveEditor = async () => {
    if (!editor) return;
    const title = editor.title.trim();
    const body = editor.body.trim();
    if (!title && !body) {
      toast.error("Nothing to save", "Give the entry a title or some text first.");
      return;
    }
    const tags = editor.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (editor.id) {
        await knowledge.update(editor.id, { title, body, tags, status: editor.status });
        toast.success("Saved", "The assistant will use the updated entry.");
      } else {
        await knowledge.createNote({ title, body, tags });
        toast.success("Added to the knowledge base", "The assistant can now use this.");
      }
      setEditor(null);
      load();
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const uploadPdf = async (files: FileList | null) => {
    const file = files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Not a PDF", "Only PDF files can be added this way.");
      return;
    }
    if (file.size > KNOWLEDGE_PDF_MAX_BYTES) {
      toast.error(
        "Too large",
        `PDFs must be under ${Math.round(KNOWLEDGE_PDF_MAX_BYTES / 1024 / 1024)} MB.`,
      );
      return;
    }

    setUploading({ name: file.name, progress: 0 });
    try {
      const result = await uploadKnowledgePdf(file, {
        onProgress: (fraction) => setUploading({ name: file.name, progress: fraction }),
      });
      toast.success(
        "PDF added",
        `Read ${result.pages} page(s) into the knowledge base${result.truncated ? " (truncated to the size limit)" : ""}.`,
      );
      load();
    } catch (caught) {
      toast.error(
        "Could not add that PDF",
        caught instanceof CmsError ? caught.message : "The upload failed.",
      );
    } finally {
      setUploading(null);
    }
  };

  const toggleStatus = async (entry: KnowledgeEntry) => {
    const next: KnowledgeStatus = entry.status === "active" ? "disabled" : "active";
    try {
      await knowledge.update(entry.id, { status: next });
      toast.success(
        next === "active" ? "Enabled" : "Disabled",
        next === "active"
          ? "The assistant will use this again."
          : "The assistant will no longer use this.",
      );
      load();
    } catch (caught) {
      toast.error("Could not update", caught instanceof CmsError ? caught.message : undefined);
    }
  };

  const removeEntry = async (entry: KnowledgeEntry) => {
    const ok = await confirm({
      title: "Delete this entry?",
      message:
        entry.sourceKind === "pdf"
          ? "The uploaded PDF and its extracted text will be removed. This cannot be undone."
          : "This note will be removed from the assistant's knowledge. This cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await knowledge.remove(entry.id);
      toast.success("Deleted", entry.title || "Entry removed.");
      load();
    } catch (caught) {
      toast.error("Could not delete", caught instanceof CmsError ? caught.message : undefined);
    }
  };

  // The knowledge base is stored in the database; without it there is nothing to manage.
  if (!config.databaseConfigured) {
    return (
      <>
        <PageHeader
          title="Assistant knowledge"
          description="Teach the website chatbot facts it should know, and upload PDFs to train it further."
        />
        <NotConfiguredNotice title="A database is required">
          The knowledge base is stored in the Website Manager database. Set{" "}
          <code>DATABASE_URL</code> (or connect a Postgres store in Vercel) and redeploy, then this
          screen will be ready to use.
        </NotConfiguredNotice>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Assistant knowledge"
        description="Everything here is fed to the website chatbot so it can answer from facts you control. Type a note, or upload a PDF and its text is extracted automatically."
        actions={
          canWrite ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => uploadPdf(e.target.files)}
              />
              <Button
                variant="outline"
                icon={Upload}
                disabled={!config.mediaStorageConfigured || Boolean(uploading)}
                loading={Boolean(uploading)}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? `Uploading ${Math.round(uploading.progress * 100)}%` : "Upload PDF"}
              </Button>
              <Button icon={Plus} onClick={() => setEditor({ ...EMPTY_EDITOR })}>
                Add note
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Entries" value={stats.total} icon={BookOpen} />
        <Metric label="Used by the assistant" value={stats.active} icon={Sparkles} tone="success" />
        <Metric label="Disabled" value={disabledCount} icon={Database} tone="neutral" />
      </div>

      {canWrite && !config.mediaStorageConfigured && (
        <NotConfiguredNotice title="PDF upload needs file storage" className="mb-6">
          You can add typed notes right now. To upload PDFs, connect a Vercel Blob store (or set the{" "}
          <code>MEDIA_S3_*</code> variables) and redeploy — the same storage the media library uses.
        </NotConfiguredNotice>
      )}

      <Toolbar className="mb-4">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the knowledge base…"
            className="pl-8"
          />
        </div>
        <SegmentedControl
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
      </Toolbar>

      {loading ? (
        <SkeletonRows rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search ? "No matches" : "The assistant has no custom knowledge yet"}
          description={
            search
              ? "Try a different search."
              : "Add a note or upload a PDF, and the website chatbot will start answering from it."
          }
          action={
            canWrite && !search ? (
              <Button icon={Plus} onClick={() => setEditor({ ...EMPTY_EDITOR })}>
                Add the first entry
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => (
            <Card key={entry.id} className="flex items-start gap-4 p-4">
              <span className="bg-secondary text-muted-foreground mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                {entry.sourceKind === "pdf" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <StickyNote className="h-4 w-4" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-foreground truncate text-[14px] font-semibold">
                    {entry.title || "Untitled entry"}
                  </h3>
                  <StatusPill tone={entry.status === "active" ? "success" : "neutral"}>
                    {entry.status === "active" ? "Active" : "Disabled"}
                  </StatusPill>
                </div>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-[12.5px] leading-relaxed">
                  {entry.body || "No text."}
                </p>
                <p className="text-muted-foreground/80 mt-1.5 text-[11.5px]">
                  {entry.sourceKind === "pdf"
                    ? `PDF${entry.sourceName ? ` · ${entry.sourceName}` : ""}`
                    : "Note"}{" "}
                  · {entry.characters.toLocaleString()} characters · updated{" "}
                  {formatShortDate(entry.updatedAt)}
                </p>
              </div>

              {canWrite && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(entry)}>
                    {entry.status === "active" ? "Disable" : "Enable"}
                  </Button>
                  <IconButton
                    label="Edit"
                    icon={Pencil}
                    onClick={() =>
                      setEditor({
                        id: entry.id,
                        title: entry.title,
                        body: entry.body,
                        tags: entry.tags.join(", "),
                        status: entry.status,
                      })
                    }
                  />
                  <IconButton label="Delete" icon={Trash2} onClick={() => removeEntry(entry)} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={editor !== null}
        onClose={() => (saving ? undefined : setEditor(null))}
        title={editor?.id ? "Edit entry" : "Add a note"}
        description="Write it as plain facts. The assistant reads this to answer visitors — clear, specific statements work best."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditor(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveEditor} loading={saving}>
              {editor?.id ? "Save changes" : "Add to knowledge base"}
            </Button>
          </>
        }
      >
        {editor && (
          <div className="space-y-4">
            <Field label="Title" hint="A short label, e.g. “Refund policy” or “Office locations”.">
              {(props) => (
                <Input
                  {...props}
                  value={editor.title}
                  onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                  placeholder="What is this about?"
                  maxLength={200}
                />
              )}
            </Field>

            <Field
              label="Facts"
              hint="The information the assistant should know and be able to say."
            >
              {(props) => (
                <Textarea
                  {...props}
                  value={editor.body}
                  onChange={(e) => setEditor({ ...editor, body: e.target.value })}
                  placeholder="e.g. ENICE offers a dedicated onboarding concierge for enterprise clients…"
                  rows={10}
                />
              )}
            </Field>

            <Field label="Tags" hint="Optional, comma-separated. For your own organisation.">
              {(props) => (
                <Input
                  {...props}
                  value={editor.tags}
                  onChange={(e) => setEditor({ ...editor, tags: e.target.value })}
                  placeholder="pricing, onboarding"
                />
              )}
            </Field>

            {editor.id && (
              <Field label="Status" hint="Disabled entries are kept but not used by the assistant.">
                {() => (
                  <SegmentedControl
                    value={editor.status}
                    onChange={(value) => setEditor({ ...editor, status: value })}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "disabled", label: "Disabled" },
                    ]}
                  />
                )}
              </Field>
            )}
          </div>
        )}
      </Modal>

      {dialog}
    </>
  );
}

export const Route = createFileRoute("/admin/knowledge")({
  component: function KnowledgeRoute() {
    return (
      <AdminShell requiredPermission="ai.knowledge.read">
        <KnowledgeScreen />
      </AdminShell>
    );
  },
});
