import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  FileText,
  ImagePlus,
  Info,
  Search,
  Trash2,
  Upload,
  Video as VideoIcon,
} from "lucide-react";
import type { MediaAsset } from "@/lib/cms/types";
import { media, uploadFile, CmsError } from "@/lib/cms/admin-client";
import { formatShortDate } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm, Modal } from "@/components/admin/Modal";
import { formatBytes } from "@/components/admin/MediaPicker";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  NotConfiguredNotice,
  PageHeader,
  SegmentedControl,
  Skeleton,
  Toolbar,
} from "@/components/admin/primitives";

/**
 * The media library.
 *
 * A grid of everything uploaded, with search, an upload dropzone that reports progress, and a
 * detail drawer for renaming, copying the URL, and deleting. Delete first checks where the asset
 * is used — removing an image that a live page references would break that page, so the
 * confirmation names the usages rather than deleting blind.
 */
function MediaLibraryScreen() {
  const { can, config } = useAdmin();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "image" | "video">("all");
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState<{ name: string; progress: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    media
      .list({
        search: search.trim() || undefined,
        category: category === "all" ? undefined : category,
        limit: 120,
      })
      .then((result) => setAssets(result.assets))
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const upload = async (files: FileList | null) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;

    // Sequentially, so progress is meaningful and one failure does not abort the rest.
    for (const file of list) {
      setUploading({ name: file.name, progress: 0 });
      try {
        await uploadFile(file, {
          folder: "library",
          onProgress: (fraction) => setUploading({ name: file.name, progress: fraction }),
        });
        toast.success("Uploaded", file.name);
      } catch (caught) {
        toast.error(
          `Could not upload ${file.name}`,
          caught instanceof CmsError ? caught.message : undefined,
        );
      }
    }
    setUploading(null);
    if (inputRef.current) inputRef.current.value = "";
    load();
  };

  const remove = async (asset: MediaAsset) => {
    let usageNote = "This cannot be undone.";
    try {
      const { usage } = await media.usage(asset.id);
      if (usage.length > 0) {
        usageNote = `This file is used in ${usage.length} place(s): ${usage
          .slice(0, 5)
          .map((u) => u.label)
          .join(
            ", ",
          )}${usage.length > 5 ? "…" : ""}. Deleting it will break those. This cannot be undone.`;
      }
    } catch {
      // Usage lookup is advisory; a failure must not block the delete.
    }

    const ok = await confirm({
      title: "Delete this file?",
      message: usageNote,
      confirmLabel: "Delete",
    });
    if (!ok) return;

    try {
      await media.remove(asset.id);
      toast.success("File deleted");
      setSelected(null);
      load();
    } catch (caught) {
      toast.error("Could not delete", caught instanceof CmsError ? caught.message : undefined);
    }
  };

  const canUpload = can("media.write") && config.mediaStorageConfigured;

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Images, video and documents used across the ENICE website."
        actions={
          canUpload && (
            <Button variant="primary" icon={Upload} onClick={() => inputRef.current?.click()}>
              Upload
            </Button>
          )
        }
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/mp4,video/webm,application/pdf"
        className="sr-only"
        onChange={(event) => void upload(event.target.files)}
      />

      {!config.mediaStorageConfigured && (
        <NotConfiguredNotice title="Media storage is not configured" className="mb-4">
          <p>
            Set <code className="font-mono">MEDIA_S3_BUCKET</code>,{" "}
            <code className="font-mono">MEDIA_S3_ACCESS_KEY_ID</code> and{" "}
            <code className="font-mono">MEDIA_S3_SECRET_ACCESS_KEY</code> to enable uploads. Content
            can still reference external image URLs without this.
          </p>
        </NotConfiguredNotice>
      )}

      <Toolbar>
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by filename or description…"
            className="pl-9"
            aria-label="Search media"
          />
        </div>
        <SegmentedControl
          value={category}
          onChange={setCategory}
          size="sm"
          options={[
            { value: "all", label: "All" },
            { value: "image", label: "Images" },
            { value: "video", label: "Video" },
          ]}
        />
      </Toolbar>

      {uploading && (
        <Card className="mb-4 p-4">
          <p className="text-foreground truncate text-[12.5px] font-medium">
            Uploading {uploading.name}…
          </p>
          <div className="bg-secondary mt-2 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-[width]"
              style={{ width: `${Math.round(uploading.progress * 100)}%` }}
            />
          </div>
        </Card>
      )}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="aspect-square" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div
          onDragOver={(event) => {
            if (canUpload) {
              event.preventDefault();
              setDragging(true);
            }
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (canUpload) void upload(event.dataTransfer.files);
          }}
        >
          <EmptyState
            icon={ImagePlus}
            title={search || category !== "all" ? "Nothing matches" : "No media yet"}
            description={
              canUpload
                ? "Drag files here, or use the Upload button. Uploaded files can be reused anywhere on the site."
                : "Uploaded images and video will appear here."
            }
            action={
              canUpload && !search && category === "all" ? (
                <Button variant="primary" icon={Upload} onClick={() => inputRef.current?.click()}>
                  Upload your first file
                </Button>
              ) : undefined
            }
            className={dragging ? "border-primary bg-primary/[0.04]" : undefined}
          />
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            if (canUpload) {
              event.preventDefault();
              setDragging(true);
            }
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (canUpload) void upload(event.dataTransfer.files);
          }}
          className={dragging ? "ring-primary rounded-xl ring-2 ring-offset-4" : undefined}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelected(asset)}
                className="border-border hover:border-primary group overflow-hidden rounded-lg border text-left transition-colors"
              >
                <span className="bg-secondary block aspect-square overflow-hidden">
                  {asset.mimeType.startsWith("video/") ? (
                    <span className="text-muted-foreground flex h-full w-full items-center justify-center">
                      <VideoIcon className="h-7 w-7" aria-hidden="true" />
                    </span>
                  ) : asset.mimeType === "application/pdf" ? (
                    <span className="text-muted-foreground flex h-full w-full items-center justify-center">
                      <FileText className="h-7 w-7" aria-hidden="true" />
                    </span>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                </span>
                <span className="block px-2 py-1.5">
                  <span className="text-foreground block truncate text-[11.5px] font-medium">
                    {asset.filename}
                  </span>
                  <span className="text-muted-foreground block text-[10.5px]">
                    {formatBytes(asset.sizeBytes)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <MediaDetail
        asset={selected}
        onClose={() => setSelected(null)}
        canWrite={can("media.write")}
        canDelete={can("media.delete")}
        onSaved={(updated) => {
          setAssets((current) => current.map((a) => (a.id === updated.id ? updated : a)));
          setSelected(updated);
        }}
        onDelete={remove}
      />

      {dialog}
    </>
  );
}

/** The detail drawer: preview, editable metadata, copy-URL, file facts, delete. */
function MediaDetail({
  asset,
  onClose,
  canWrite,
  canDelete,
  onSaved,
  onDelete,
}: {
  asset: MediaAsset | null;
  onClose: () => void;
  canWrite: boolean;
  canDelete: boolean;
  onSaved: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
}) {
  const toast = useToast();
  const [filename, setFilename] = useState("");
  const [alt, setAlt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (asset) {
      setFilename(asset.filename);
      setAlt(asset.alt);
    }
  }, [asset]);

  if (!asset) return null;

  const dirty = filename !== asset.filename || alt !== asset.alt;

  const save = async () => {
    setSaving(true);
    try {
      const { asset: updated } = await media.update(asset.id, { filename, alt });
      onSaved(updated);
      toast.success("Saved");
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy", "Copy it manually from the field below.");
    }
  };

  return (
    <Modal open={Boolean(asset)} onClose={onClose} title="Media details" size="lg">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="bg-secondary flex items-center justify-center overflow-hidden rounded-lg">
          {asset.mimeType.startsWith("video/") ? (
            <video src={asset.url} controls className="max-h-64 w-full" />
          ) : asset.mimeType === "application/pdf" ? (
            <div className="text-muted-foreground flex h-48 w-full items-center justify-center">
              <FileText className="h-10 w-10" aria-hidden="true" />
            </div>
          ) : (
            <img src={asset.url} alt={asset.alt} className="max-h-64 w-full object-contain" />
          )}
        </div>

        <div className="space-y-4">
          <Field label="Filename">
            {(props) => (
              <Input
                {...props}
                value={filename}
                onChange={(event) => setFilename(event.target.value)}
                disabled={!canWrite}
              />
            )}
          </Field>
          <Field label="Description (alt text)" hint="Improves accessibility and SEO.">
            {(props) => (
              <Input
                {...props}
                value={alt}
                onChange={(event) => setAlt(event.target.value)}
                disabled={!canWrite}
              />
            )}
          </Field>

          <Field label="URL">
            {(props) => (
              <div className="flex gap-1.5">
                <Input {...props} value={asset.url} readOnly className="font-mono text-[11px]" />
                <IconButton icon={Copy} label="Copy URL" variant="outline" onClick={copyUrl} />
              </div>
            )}
          </Field>

          <div className="border-border text-muted-foreground space-y-1 rounded-lg border p-3 text-[11.5px]">
            <p className="text-foreground flex items-center gap-1.5 font-semibold">
              <Info className="h-3 w-3" aria-hidden="true" /> File information
            </p>
            <p>Type: {asset.mimeType}</p>
            <p>Size: {formatBytes(asset.sizeBytes)}</p>
            {asset.width && asset.height && (
              <p>
                Dimensions: {asset.width} × {asset.height}
              </p>
            )}
            <p>
              Uploaded: {formatShortDate(asset.createdAt)}
              {asset.uploadedByEmail ? ` by ${asset.uploadedByEmail}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        {canDelete ? (
          <Button
            variant="ghost"
            icon={Trash2}
            onClick={() => onDelete(asset)}
            className="text-destructive"
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {canWrite && (
            <Button variant="primary" loading={saving} disabled={!dirty} onClick={save}>
              Save changes
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export const Route = createFileRoute("/admin/media")({
  component: function MediaRoute() {
    return (
      <AdminShell requiredPermission="media.read">
        <MediaLibraryScreen />
      </AdminShell>
    );
  },
});
