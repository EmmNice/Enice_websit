/**
 * Image and video selection.
 *
 * Three ways in, in one dialog:
 *
 *   1. **Library** — pick something already uploaded. The default, because reusing an asset is the
 *      common case and re-uploading the same logo four times is how a media library rots.
 *   2. **Upload** — drag or choose a file. Goes straight to object storage via a presigned PUT
 *      (see `uploadFile`), with real progress, because a large video with no feedback is
 *      indistinguishable from a frozen page.
 *   3. **External URL** — paste a link. Kept available deliberately: it means the CMS is usable for
 *      content before anyone has configured a bucket, and it is the escape hatch when an image
 *      genuinely lives elsewhere.
 *
 * When storage is unconfigured the first two tabs explain what to set rather than failing on click,
 * and the dialog opens on the URL tab so the editor still works.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Link2, Search, Upload, Video, X } from "lucide-react";
import type { MediaAsset } from "@/lib/cms/types";
import { MEDIA_LIMITS } from "@/lib/cms/types";
import { media, uploadFile, CmsError } from "@/lib/cms/admin-client";
import { sanitizeUrl } from "@/lib/cms/sanitize";
import { useAdmin } from "./AdminContext";
import { useToast } from "./Toaster";
import { Modal } from "./Modal";
import {
  Button,
  EmptyState,
  Field,
  Input,
  NotConfiguredNotice,
  SegmentedControl,
  Skeleton,
} from "./primitives";
import { cn } from "@/lib/utils";

export type MediaKind = "image" | "video";

export interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  /** Receives the chosen URL, plus alt text when the asset carries it. */
  onSelect: (value: { url: string; alt?: string }) => void;
  kind?: MediaKind;
  /** Folder new uploads land in, so assets stay organised by where they are used. */
  folder?: string;
  title?: string;
}

type Tab = "library" | "upload" | "url";

export function MediaPicker({
  open,
  onClose,
  onSelect,
  kind = "image",
  folder = "",
  title,
}: MediaPickerProps) {
  const { config } = useAdmin();
  const toast = useToast();
  const storageReady = config.mediaStorageConfigured;

  // Without a bucket the only usable tab is the URL one, so start there rather than on an
  // explanation the editor has to click past.
  const [tab, setTab] = useState<Tab>(storageReady ? "library" : "url");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const loadLibrary = useCallback(
    (search: string) => {
      if (!storageReady) return;
      setLoading(true);
      media
        .list({ search: search || undefined, category: kind, limit: 60 })
        .then((result) => setAssets(result.assets))
        .catch(() => setAssets([]))
        .finally(() => setLoading(false));
    },
    [kind, storageReady],
  );

  useEffect(() => {
    if (!open) return;
    setTab(storageReady ? "library" : "url");
    setTerm("");
    setExternalUrl("");
    setUrlError(null);
    loadLibrary("");
  }, [open, storageReady, loadLibrary]);

  // Debounced so typing a word is one request rather than one per keystroke.
  useEffect(() => {
    if (!open || tab !== "library") return;
    const timer = setTimeout(() => loadLibrary(term.trim()), 250);
    return () => clearTimeout(timer);
  }, [term, open, tab, loadLibrary]);

  const choose = (asset: MediaAsset) => {
    onSelect({ url: asset.url, alt: asset.alt || undefined });
    onClose();
  };

  const submitUrl = () => {
    const safe = sanitizeUrl(externalUrl);
    if (!safe) {
      // The same check the server applies, run here so the message is immediate and specific.
      setUrlError("Enter a valid http(s) URL.");
      return;
    }
    onSelect({ url: safe });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={title ?? (kind === "video" ? "Choose a video" : "Choose an image")}
      description={
        kind === "video"
          ? "Pick a video from the library, upload one, or paste a YouTube, Vimeo or file URL."
          : "Pick an image from the library, upload one, or paste an external URL."
      }
    >
      <SegmentedControl
        value={tab}
        onChange={setTab}
        className="mb-4"
        options={[
          { value: "library", label: "Library", icon: kind === "video" ? Video : ImageIcon },
          { value: "upload", label: "Upload", icon: Upload },
          { value: "url", label: "External URL", icon: Link2 },
        ]}
      />

      {tab === "library" && (
        <>
          {!storageReady ? (
            <StorageNotice />
          ) : (
            <>
              <div className="relative mb-4">
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Search by filename or description…"
                  className="pl-9"
                  aria-label="Search media"
                />
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 8 }, (_, index) => (
                    <Skeleton key={index} className="aspect-[4/3]" />
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <EmptyState
                  icon={kind === "video" ? Video : ImageIcon}
                  title={term ? "Nothing matches that search" : `No ${kind}s in the library yet`}
                  description={
                    term
                      ? "Try a different term, or upload a new file."
                      : "Upload your first file and it will be available to reuse anywhere."
                  }
                  action={
                    <Button variant="primary" icon={Upload} onClick={() => setTab("upload")}>
                      Upload a file
                    </Button>
                  }
                  className="py-10"
                />
              ) : (
                <div className="grid max-h-[46vh] grid-cols-2 gap-3 overflow-y-auto p-0.5 sm:grid-cols-4">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => choose(asset)}
                      className="border-border hover:border-primary focus-visible:ring-ring group overflow-hidden rounded-lg border text-left transition-colors outline-none focus-visible:ring-2"
                    >
                      <span className="bg-secondary block aspect-[4/3] overflow-hidden">
                        {asset.mimeType.startsWith("video/") ? (
                          <span className="text-muted-foreground flex h-full w-full items-center justify-center">
                            <Video className="h-6 w-6" aria-hidden="true" />
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
                          {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === "upload" &&
        (!storageReady ? (
          <StorageNotice />
        ) : (
          <UploadPanel
            kind={kind}
            folder={folder}
            onUploaded={(asset) => {
              toast.success("File uploaded", asset.filename);
              choose(asset);
            }}
            onError={(message) => toast.error("Upload failed", message)}
          />
        ))}

      {tab === "url" && (
        <div className="space-y-4">
          <Field
            label={kind === "video" ? "Video URL" : "Image URL"}
            hint={
              kind === "video"
                ? "A YouTube or Vimeo link, or a direct .mp4 / .webm URL."
                : "A direct link to an image file, ending in .png, .jpg, .webp or similar."
            }
            error={urlError}
          >
            {(props) => (
              <Input
                {...props}
                value={externalUrl}
                onChange={(event) => {
                  setExternalUrl(event.target.value);
                  setUrlError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitUrl();
                  }
                }}
                placeholder="https://…"
                autoFocus
              />
            )}
          </Field>

          {/* A live preview is the cheapest way to catch a typo or a link that 404s. */}
          {kind === "image" && sanitizeUrl(externalUrl) && (
            <div className="border-border bg-secondary overflow-hidden rounded-lg border">
              <img
                src={sanitizeUrl(externalUrl) ?? ""}
                alt=""
                className="max-h-48 w-full object-contain"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitUrl} disabled={!externalUrl.trim()}>
              Use this URL
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function StorageNotice() {
  return (
    <NotConfiguredNotice title="Media storage is not configured">
      <p>
        Uploads need an S3-compatible bucket. Set <code className="font-mono">MEDIA_S3_BUCKET</code>
        , <code className="font-mono">MEDIA_S3_ACCESS_KEY_ID</code> and{" "}
        <code className="font-mono">MEDIA_S3_SECRET_ACCESS_KEY</code> (plus{" "}
        <code className="font-mono">MEDIA_S3_ENDPOINT</code> for a non-AWS provider).
      </p>
      <p>In the meantime you can paste an external URL on the last tab.</p>
    </NotConfiguredNotice>
  );
}

/**
 * The upload surface, with drag-and-drop.
 *
 * Validated against `MEDIA_LIMITS` before anything is sent, so an oversized file is rejected
 * instantly rather than after a long upload that the server then refuses.
 */
function UploadPanel({
  kind,
  folder,
  onUploaded,
  onError,
}: {
  kind: MediaKind;
  folder: string;
  onUploaded: (asset: MediaAsset) => void;
  onError: (message: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [currentName, setCurrentName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const spec = MEDIA_LIMITS[kind];
  const accept = spec.mimeTypes.join(",");
  const maxMb = Math.round(spec.maxBytes / (1024 * 1024));

  const handle = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!(spec.mimeTypes as readonly string[]).includes(file.type)) {
      onError(
        `${file.type || "That file type"} is not supported. Accepted: ${spec.mimeTypes.join(", ")}.`,
      );
      return;
    }
    if (file.size > spec.maxBytes) {
      onError(`That file is ${formatBytes(file.size)}, over the ${maxMb} MB limit.`);
      return;
    }

    setCurrentName(file.name);
    setProgress(0);

    try {
      const asset = await uploadFile(file, { folder, onProgress: setProgress });
      onUploaded(asset);
    } catch (error) {
      onError(error instanceof CmsError ? error.message : "The upload did not complete.");
    } finally {
      setProgress(null);
      setCurrentName("");
      // Cleared so choosing the same file again still fires a change event.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (progress !== null) {
    return (
      <div className="border-border rounded-xl border px-6 py-10 text-center">
        <p className="text-foreground truncate text-[13px] font-medium">{currentName}</p>
        <div className="bg-secondary mt-4 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-200"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-[11.5px] tabular-nums">
          {Math.round(progress * 100)}%
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void handle(event.dataTransfer.files);
      }}
      className={cn(
        "rounded-xl border border-dashed px-6 py-12 text-center transition-colors",
        dragging ? "border-primary bg-primary/[0.04]" : "border-border",
      )}
    >
      <span className="bg-secondary text-muted-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
        <Upload className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-foreground text-[14px] font-semibold">
        Drag a {kind} here, or choose a file
      </p>
      <p className="text-muted-foreground mt-1.5 text-[12px]">
        Up to {maxMb} MB · {spec.mimeTypes.map((type) => type.split("/")[1]).join(", ")}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => void handle(event.target.files)}
        className="sr-only"
        id="media-upload-input"
      />
      <Button
        variant="primary"
        className="mt-5"
        onClick={() => inputRef.current?.click()}
        icon={Upload}
      >
        Choose a file
      </Button>
    </div>
  );
}

/** Human-readable file size. Shared by the picker and the media library screen. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value < 10 && exponent > 0 ? value.toFixed(1) : Math.round(value)} ${units[exponent]}`;
}

/**
 * An image field with a thumbnail, used by section forms and the cover-image control.
 *
 * Shows the current image rather than its URL: an administrator choosing a hero image needs to see
 * what they picked, and a 90-character CDN URL in a text input tells them nothing.
 */
export function ImageField({
  value,
  onChange,
  label,
  hint,
  folder,
  kind = "image",
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  hint?: string;
  folder?: string;
  kind?: MediaKind;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <Field label={label} hint={hint}>
        {() =>
          value ? (
            <div className="border-border overflow-hidden rounded-lg border">
              <div className="bg-secondary relative">
                {kind === "video" ? (
                  <div className="text-muted-foreground flex h-28 items-center justify-center">
                    <Video className="h-6 w-6" aria-hidden="true" />
                  </div>
                ) : (
                  <img src={value} alt="" className="max-h-40 w-full object-contain" />
                )}
                <button
                  type="button"
                  onClick={() => onChange("")}
                  aria-label={`Remove ${label}`}
                  className="text-foreground absolute top-2 right-2 rounded-md bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-muted-foreground min-w-0 truncate text-[11px]">{value}</span>
                <Button size="sm" variant="ghost" onClick={() => setPickerOpen(true)}>
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              icon={kind === "video" ? Video : ImageIcon}
              onClick={() => setPickerOpen(true)}
              className="w-full justify-center"
            >
              Choose {kind === "video" ? "a video" : "an image"}
            </Button>
          )
        }
      </Field>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={({ url }) => onChange(url)}
        kind={kind}
        folder={folder}
      />
    </>
  );
}
