/**
 * The fields only some content kinds carry.
 *
 * Announcements have a live window and a call-to-action; updates and news can be featured and can
 * carry an icon. Rather than four editor variants, these conditional fields live here and the
 * editor renders them for every kind — each field decides whether it applies. A kind with no
 * extras renders nothing, so the sidebar simply omits the card.
 */

import { CalendarRange, MousePointerClick, Star } from "lucide-react";
import type { ContentExtras, ContentKind } from "@/lib/cms/types";
import { sanitizeUrl } from "@/lib/cms/sanitize";
import { Card, CardHeader, Field, Input, Toggle } from "../primitives";

export function ExtrasFields({
  kind,
  extras,
  onChange,
  disabled,
}: {
  kind: ContentKind;
  extras: ContentExtras;
  onChange: (extras: ContentExtras) => void;
  disabled?: boolean;
}) {
  const hasCta = kind === "announcement" || kind === "update";
  const hasWindow = kind === "announcement";
  const hasFeatured = kind === "update" || kind === "news";
  const hasIcon = kind === "update";

  if (!hasCta && !hasWindow && !hasFeatured && !hasIcon) return null;

  const set = (patch: Partial<ContentExtras>) => onChange({ ...extras, ...patch });

  return (
    <Card className="p-4">
      <CardHeader title={`${CONTENT_LABEL[kind]} options`} className="-mx-4 -mt-4 mb-4" />
      <div className="space-y-4">
        {hasFeatured && (
          <div className="border-border rounded-lg border p-3">
            <Toggle
              checked={extras.featured === true}
              onChange={(next) => set({ featured: next || undefined })}
              label="Feature this"
              description="Pinned to the top of its feed, ahead of newer entries."
              disabled={disabled}
            />
          </div>
        )}

        {hasCta && (
          <div className="space-y-3">
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
              <MousePointerClick className="h-3 w-3" aria-hidden="true" /> Call to action
            </p>
            <Field label="Button label" hint="Leave both blank for no button.">
              {(props) => (
                <Input
                  {...props}
                  value={extras.cta?.label ?? ""}
                  onChange={(event) =>
                    set({
                      cta: buildCta(event.target.value, extras.cta?.url ?? ""),
                    })
                  }
                  placeholder="e.g. Learn more"
                  disabled={disabled}
                />
              )}
            </Field>
            <Field label="Button URL">
              {(props) => (
                <Input
                  {...props}
                  value={extras.cta?.url ?? ""}
                  onChange={(event) =>
                    set({ cta: buildCta(extras.cta?.label ?? "", event.target.value) })
                  }
                  placeholder="/contact or https://…"
                  type="url"
                  disabled={disabled}
                />
              )}
            </Field>
          </div>
        )}

        {hasWindow && (
          <div className="space-y-3">
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
              <CalendarRange className="h-3 w-3" aria-hidden="true" /> Display window
            </p>
            <p className="text-muted-foreground text-[11.5px] leading-relaxed">
              Optional. Controls when this announcement shows in the site-wide banner — outside the
              window it stays in the archive but is not featured.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Starts">
                {(props) => (
                  <Input
                    {...props}
                    type="datetime-local"
                    value={toLocalInput(extras.startsAt)}
                    onChange={(event) => set({ startsAt: fromLocalInput(event.target.value) })}
                    disabled={disabled}
                  />
                )}
              </Field>
              <Field label="Ends">
                {(props) => (
                  <Input
                    {...props}
                    type="datetime-local"
                    value={toLocalInput(extras.endsAt)}
                    onChange={(event) => set({ endsAt: fromLocalInput(event.target.value) })}
                    disabled={disabled}
                  />
                )}
              </Field>
            </div>
          </div>
        )}

        {hasIcon && (
          <Field
            label="Icon"
            hint="A lucide icon name (e.g. Rocket, Zap, Sparkles). Used when there is no image."
          >
            {(props) => (
              <div className="flex items-center gap-2">
                <Star className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
                <Input
                  {...props}
                  value={extras.icon ?? ""}
                  onChange={(event) => set({ icon: event.target.value || undefined })}
                  placeholder="Zap"
                  disabled={disabled}
                />
              </div>
            )}
          </Field>
        )}
      </div>
    </Card>
  );
}

const CONTENT_LABEL: Record<ContentKind, string> = {
  blog: "Blog",
  announcement: "Announcement",
  update: "Update",
  news: "News",
};

/** Only keeps a CTA when it has both halves; a label with no URL renders as a dead control. */
function buildCta(label: string, url: string): ContentExtras["cta"] {
  const trimmedLabel = label.trim();
  const safeUrl = sanitizeUrl(url) ?? url.trim();
  if (!trimmedLabel || !safeUrl) return undefined;
  return { label: trimmedLabel, url: safeUrl };
}

/** ISO → the `YYYY-MM-DDTHH:mm` local-time string a datetime-local input expects. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
