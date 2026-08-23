import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, Palette, Save, Type } from "lucide-react";
import type { DesignSettings } from "@/lib/cms/types";
import { website, CmsError } from "@/lib/cms/admin-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { ImageField } from "@/components/admin/MediaPicker";
import {
  Button,
  Card,
  CardHeader,
  NotConfiguredNotice,
  PageHeader,
  Skeleton,
} from "@/components/admin/primitives";
import { cn } from "@/lib/utils";

type Options = {
  palettes: Record<string, { label: string; primary: string; accent: string }>;
  typography: Record<string, { label: string; display: string; body: string }>;
  buttonStyles: Record<string, { label: string; radius: string }>;
};

/**
 * Design controls.
 *
 * Brand assets (logo, favicon, default OG image) plus a *constrained* set of design choices: the
 * palette is one of a preset list, typography one of a vetted pairing, buttons one of a few radii.
 * There is no free colour picker and no arbitrary font field — those are the two fastest ways to
 * make a premium site look broken, so the model does not expose them. Editing here keeps the ENICE
 * brand identity intact by construction.
 *
 * Changing the palette or typography requires `design.write` (separately grantable from other
 * settings), so an Editor can be allowed to swap the logo without being able to restyle the site.
 */
function DesignScreen() {
  const { can } = useAdmin();
  const toast = useToast();
  const canWrite = can("design.write");

  const [design, setDesign] = useState<DesignSettings | null>(null);
  const [options, setOptions] = useState<Options | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    website
      .settings()
      .then((result) => {
        setDesign(result.settings.design);
        setOptions(result.options);
        setDirty(false);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const patch = (changes: Partial<DesignSettings>) => {
    setDesign((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
  };

  const save = async () => {
    if (!design) return;
    setSaving(true);
    try {
      const { settings } = await website.updateSettings("design", design);
      setDesign(settings.design);
      setDirty(false);
      toast.success("Design saved");
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !design || !options) {
    return (
      <>
        <PageHeader title="Design" description="Logo, favicon, palette and typography." />
        {error ? <p className="text-destructive">{error}</p> : <Skeleton className="h-96" />}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Design"
        description="Brand assets and a curated set of design choices. Options are constrained to keep the ENICE brand consistent."
        actions={
          canWrite && (
            <Button variant="primary" icon={Save} loading={saving} disabled={!dirty} onClick={save}>
              Save
            </Button>
          )
        }
      />

      {!canWrite && (
        <NotConfiguredNotice title="Read-only" className="mb-4">
          <p>
            Your role can view these settings but not change them. Design changes need the design
            permission.
          </p>
        </NotConfiguredNotice>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Brand assets"
            description="Logo, favicon and the default social share image."
          />
          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <ImageField
              label="Logo"
              value={design.logoUrl ?? ""}
              onChange={(url) => patch({ logoUrl: url || null })}
              folder="brand"
              hint="Header logo."
            />
            <ImageField
              label="Logo (dark backgrounds)"
              value={design.logoDarkUrl ?? ""}
              onChange={(url) => patch({ logoDarkUrl: url || null })}
              folder="brand"
              hint="Optional light variant."
            />
            <ImageField
              label="Favicon"
              value={design.faviconUrl ?? ""}
              onChange={(url) => patch({ faviconUrl: url || null })}
              folder="brand"
              hint="Browser tab icon."
            />
            <ImageField
              label="Default share image"
              value={design.ogImageUrl ?? ""}
              onChange={(url) => patch({ ogImageUrl: url || null })}
              folder="brand"
              hint="Site-wide OG fallback."
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Brand colours"
            icon={Palette}
            description="Choose from the approved ENICE palettes."
          />
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(options.palettes).map(([key, palette]) => {
              const active = design.palette === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!canWrite}
                  onClick={() => patch({ palette: key })}
                  className={cn(
                    "border-border relative rounded-xl border p-4 text-left transition-all",
                    active ? "border-primary ring-primary/20 ring-2" : "hover:border-primary/40",
                    !canWrite && "cursor-not-allowed opacity-70",
                  )}
                >
                  {active && (
                    <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}
                  <div className="mb-3 flex gap-1.5">
                    <span
                      className="h-8 w-8 rounded-lg"
                      style={{ background: palette.primary }}
                      aria-hidden="true"
                    />
                    <span
                      className="h-8 w-8 rounded-lg"
                      style={{ background: palette.accent }}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-foreground text-[12.5px] font-semibold">{palette.label}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Typography" icon={Type} description="A vetted font pairing." />
            <div className="space-y-2 p-4">
              {Object.entries(options.typography).map(([key, pairing]) => {
                const active = design.typography === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!canWrite}
                    onClick={() => patch({ typography: key })}
                    className={cn(
                      "border-border flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      active ? "border-primary bg-primary/[0.04]" : "hover:bg-secondary/40",
                      !canWrite && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <span>
                      <span className="text-foreground block text-[13px] font-semibold">
                        {pairing.label}
                      </span>
                      <span className="text-muted-foreground block text-[11px]">
                        Headings: {pairing.display} · Body: {pairing.body}
                      </span>
                    </span>
                    {active && <Check className="text-primary h-4 w-4" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Button style"
              description="Corner rounding for buttons across the site."
            />
            <div className="space-y-2 p-4">
              {Object.entries(options.buttonStyles).map(([key, style]) => {
                const active = design.buttonStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!canWrite}
                    onClick={() => patch({ buttonStyle: key })}
                    className={cn(
                      "border-border flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      active ? "border-primary bg-primary/[0.04]" : "hover:bg-secondary/40",
                      !canWrite && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="bg-primary h-7 w-14"
                        style={{ borderRadius: style.radius }}
                        aria-hidden="true"
                      />
                      <span className="text-foreground text-[13px] font-semibold">
                        {style.label}
                      </span>
                    </span>
                    {active && <Check className="text-primary h-4 w-4" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/admin/website/design")({
  component: function DesignRoute() {
    return (
      <AdminShell requiredPermission="settings.read">
        <DesignScreen />
      </AdminShell>
    );
  },
});
