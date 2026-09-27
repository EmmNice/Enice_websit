import { useState } from "react";
import { ImageOff, Link2, X } from "lucide-react";
import { Button, Field, Input } from "./primitives";

/**
 * An image chosen by URL, with a live preview.
 *
 * This replaces the media library picker that used to sit here. The library needed object storage
 * — `MEDIA_S3_*` or a Vercel Blob token — and the Website Manager is deliberately configured with
 * nothing beyond `DATABASE_URL` and `CMS_SECRET`, so an upload button would have been a control
 * that is disabled in every environment the site actually runs in. A URL field is the honest
 * version of the same feature: it always works, and the images it points at are already on a CDN.
 *
 * The preview is the part that matters. A pasted URL is easy to get wrong — a private Drive link, an
 * expired signed URL, a 404 — and without a preview that mistake ships to a published post and is
 * only noticed on the live page. `onError` swaps in an explicit "image did not load" state rather
 * than leaving the browser's broken-image glyph, which is easy to miss against a pale panel.
 */
export function ImageUrlField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [broken, setBroken] = useState(false);

  return (
    <Field
      label={label}
      hint={hint}
      action={
        value ? (
          <Button
            size="sm"
            variant="ghost"
            icon={X}
            onClick={() => {
              onChange("");
              setBroken(false);
            }}
          >
            Remove
          </Button>
        ) : null
      }
    >
      {(props) => (
        <div className="space-y-2">
          <div className="relative">
            <Link2
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            />
            <Input
              {...props}
              type="url"
              inputMode="url"
              value={value}
              placeholder="https://…"
              className="pl-8"
              onChange={(event) => {
                setBroken(false);
                onChange(event.target.value.trim());
              }}
            />
          </div>

          {value ? (
            <div className="border-border bg-secondary relative overflow-hidden rounded-lg border">
              {broken ? (
                <div className="text-muted-foreground flex items-center gap-2 px-3 py-6 text-[12px]">
                  <ImageOff aria-hidden="true" className="h-4 w-4 shrink-0" />
                  That URL did not load an image. Check it is public and points directly at a file.
                </div>
              ) : (
                <img
                  src={value}
                  alt=""
                  loading="lazy"
                  onError={() => setBroken(true)}
                  className="max-h-44 w-full object-contain"
                />
              )}
            </div>
          ) : null}
        </div>
      )}
    </Field>
  );
}
