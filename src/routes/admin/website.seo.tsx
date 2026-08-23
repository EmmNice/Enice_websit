import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Save, Search, TriangleAlert } from "lucide-react";
import type { SeoDefaults } from "@/lib/cms/types";
import { website, CmsError } from "@/lib/cms/admin-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm } from "@/components/admin/Modal";
import { ImageField } from "@/components/admin/MediaPicker";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Skeleton,
  Textarea,
  Toggle,
} from "@/components/admin/primitives";

/**
 * Site-wide SEO defaults.
 *
 * These are the fallbacks every page and article uses when it does not set its own — the title
 * suffix, the default description, the default social image. The one dangerous control, "allow
 * search engines to index the site", carries a typed confirmation: turning it off makes the entire
 * site `noindex`, which is occasionally wanted (a staging deploy) and catastrophic by accident.
 */
function SeoDefaultsScreen() {
  const { can } = useAdmin();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const canWrite = can("settings.write");

  const [seo, setSeo] = useState<SeoDefaults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    website
      .settings()
      .then((result) => {
        setSeo(result.settings.seo);
        setDirty(false);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const patch = (changes: Partial<SeoDefaults>) => {
    setSeo((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
  };

  const save = async () => {
    if (!seo) return;

    // Turning off site-wide indexing is a foot-gun; require an explicit confirmation.
    if (!seo.indexSite) {
      const ok = await confirm({
        title: "Hide the entire site from search engines?",
        message:
          "Every page will carry noindex and will be removed from Google and other search engines. Only do this for a staging site. This affects the whole of enicehq.com.",
        confirmLabel: "Yes, hide the site",
        requireTyped: "NOINDEX",
      });
      if (!ok) return;
    }

    setSaving(true);
    try {
      const { settings } = await website.updateSettings("seo", seo);
      setSeo(settings.seo);
      setDirty(false);
      toast.success("SEO defaults saved");
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !seo) {
    return (
      <>
        <PageHeader title="SEO" description="Site-wide search metadata defaults." />
        {error ? <p className="text-destructive">{error}</p> : <Skeleton className="h-96" />}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="SEO defaults"
        description="Fallback metadata for pages and articles that don't set their own. Each item can override these."
        actions={
          canWrite && (
            <Button variant="primary" icon={Save} loading={saving} disabled={!dirty} onClick={save}>
              Save
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Defaults" icon={Search} />
          <div className="space-y-4 p-4">
            <Field label="Title suffix" hint="Appended to page titles, e.g. ' | ENICE Group'.">
              {(props) => (
                <Input
                  {...props}
                  value={seo.titleSuffix}
                  onChange={(event) => patch({ titleSuffix: event.target.value })}
                  disabled={!canWrite}
                />
              )}
            </Field>
            <Field
              label="Default meta description"
              hint="Used when a page or article has no description of its own."
            >
              {(props) => (
                <Textarea
                  {...props}
                  value={seo.defaultDescription}
                  onChange={(event) => patch({ defaultDescription: event.target.value })}
                  rows={3}
                  maxLength={200}
                  disabled={!canWrite}
                />
              )}
            </Field>
            <Field
              label="Extra robots directives"
              hint="Advanced. Appended to the robots meta tag, e.g. 'max-image-preview:large'."
            >
              {(props) => (
                <Input
                  {...props}
                  value={seo.robotsExtra}
                  onChange={(event) => patch({ robotsExtra: event.target.value })}
                  disabled={!canWrite}
                />
              )}
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Default social image"
            description="Shown when a page is shared and has no image of its own."
          />
          <div className="space-y-4 p-4">
            <ImageField
              label="Default share image"
              hint="1200×630 works best."
              value={seo.defaultOgImage}
              onChange={(url) => patch({ defaultOgImage: url })}
              folder="social"
            />

            <div
              className={`rounded-lg border p-3 ${seo.indexSite ? "border-border" : "border-red-300 bg-red-50"}`}
            >
              <Toggle
                checked={seo.indexSite}
                onChange={(next) => patch({ indexSite: next })}
                label="Allow search engines to index the site"
                description={
                  seo.indexSite
                    ? "The website can appear in search results."
                    : "The ENTIRE site is hidden from search engines. Only appropriate for staging."
                }
                disabled={!canWrite}
              />
              {!seo.indexSite && (
                <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-red-700">
                  <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  This will remove the whole site from Google.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {dialog}
    </>
  );
}

export const Route = createFileRoute("/admin/website/seo")({
  component: function SeoRoute() {
    return (
      <AdminShell requiredPermission="settings.read">
        <SeoDefaultsScreen />
      </AdminShell>
    );
  },
});
