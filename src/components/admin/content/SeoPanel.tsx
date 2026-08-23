/**
 * The SEO panel.
 *
 * Every field is optional and shows the *derived* value as placeholder text, so an author can see
 * exactly what will ship — the title with its site suffix, the description taken from the excerpt,
 * the social image — before deciding whether to override anything. This mirrors `resolveSeo` on the
 * server, which applies the same precedence; the placeholders here are computed the same way so the
 * preview never lies.
 *
 * A live search-result and social-card preview sits at the top, because SEO fields are abstract
 * until you see the snippet they produce.
 */

import { useMemo } from "react";
import { Globe, Share2 } from "lucide-react";
import type { SeoFields } from "@/lib/cms/types";
import { resolveSeo, FALLBACK_SEO_DEFAULTS } from "@/lib/cms/seo-resolve";
import { SITE_URL } from "@/lib/site";
import { Field, Input, Textarea, Toggle } from "../primitives";
import { ImageField } from "../MediaPicker";

export interface SeoSourceLite {
  title: string;
  excerpt: string;
  image: string | null;
  path: string;
}

export function SeoPanel({
  seo,
  source,
  onChange,
}: {
  seo: SeoFields;
  source: SeoSourceLite;
  onChange: (next: SeoFields) => void;
}) {
  // The resolved values, used as placeholders. Recomputed as the title/excerpt/image change so the
  // preview tracks the content live.
  const resolved = useMemo(
    () =>
      resolveSeo(seo, source, {
        siteUrl: SITE_URL,
        defaults: FALLBACK_SEO_DEFAULTS,
      }),
    [seo, source],
  );

  const set = (patch: Partial<SeoFields>) => onChange({ ...seo, ...patch });

  const displayUrl = resolved.canonicalUrl.replace(/^https?:\/\//, "");

  return (
    <div className="space-y-5">
      {/* Search result preview */}
      <div className="border-border bg-secondary/40 rounded-lg border p-4">
        <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider uppercase">
          <Globe className="h-3 w-3" aria-hidden="true" /> Search result preview
        </p>
        <p className="truncate text-[12px] text-emerald-700">{displayUrl}</p>
        <p className="truncate text-[15px] leading-snug text-blue-800">{resolved.title}</p>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[12.5px] leading-snug">
          {resolved.description}
        </p>
      </div>

      {/* Social card preview */}
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="bg-secondary aspect-[1.91/1] w-full overflow-hidden">
          {resolved.ogImage ? (
            <img src={resolved.ogImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <Share2 className="h-6 w-6" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="px-3 py-2">
          <p className="text-muted-foreground text-[10.5px] uppercase">
            {displayUrl.split("/")[0]}
          </p>
          <p className="text-foreground truncate text-[12.5px] font-semibold">{resolved.ogTitle}</p>
          <p className="text-muted-foreground line-clamp-1 text-[11.5px]">
            {resolved.ogDescription}
          </p>
        </div>
      </div>

      <Field label="SEO title" hint="Leave blank to use the item's title plus the site suffix.">
        {(props) => (
          <Input
            {...props}
            value={seo.title ?? ""}
            onChange={(event) => set({ title: event.target.value || undefined })}
            placeholder={resolved.title}
            maxLength={70}
          />
        )}
      </Field>

      <Field label="Meta description" hint="Around 150 characters. Defaults to the excerpt.">
        {(props) => (
          <Textarea
            {...props}
            value={seo.description ?? ""}
            onChange={(event) => set({ description: event.target.value || undefined })}
            placeholder={resolved.description}
            rows={2}
            maxLength={200}
          />
        )}
      </Field>

      <ImageField
        label="Social share image"
        hint="Shown when the page is shared. 1200×630 works best. Defaults to the cover image."
        value={seo.ogImage ?? ""}
        onChange={(url) => set({ ogImage: url || undefined })}
        folder="social"
      />

      <Field
        label="Canonical URL"
        hint="Only set this if the definitive version of this content lives at another URL."
      >
        {(props) => (
          <Input
            {...props}
            value={seo.canonicalUrl ?? ""}
            onChange={(event) => set({ canonicalUrl: event.target.value || undefined })}
            placeholder={resolved.canonicalUrl}
            type="url"
          />
        )}
      </Field>

      <div className="border-border rounded-lg border p-3">
        <Toggle
          checked={seo.index !== false}
          onChange={(next) => set({ index: next ? undefined : false })}
          label="Allow search engines to index this"
          description={
            seo.index === false
              ? "This page will carry noindex and will not appear in search results."
              : "This page can appear in search results."
          }
        />
      </div>
    </div>
  );
}
