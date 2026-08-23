import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { FooterColumn, FooterSettings } from "@/lib/cms/types";
import { website, CmsError } from "@/lib/cms/admin-client";
import { blockId } from "@/lib/cms/doc";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { NavItemList } from "./website.navigation";
import {
  Button,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  PageHeader,
  Skeleton,
  Textarea,
  Toggle,
} from "@/components/admin/primitives";

/**
 * Footer editor.
 *
 * Up to six link columns (each a reusable `NavItemList`), plus the tagline, copyright line and the
 * social-links toggle. The social links themselves come from `SOCIAL_PROFILES` in code — they are
 * brand identity, not routine content, so they are not editable here by design.
 */
function FooterScreen() {
  const { can } = useAdmin();
  const toast = useToast();
  const canWrite = can("settings.write");

  const [footer, setFooter] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    website
      .settings()
      .then((result) => {
        setFooter(result.settings.footer);
        setDirty(false);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const patch = (changes: Partial<FooterSettings>) => {
    setFooter((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
  };
  const patchColumn = (id: string, changes: Partial<FooterColumn>) =>
    patch({
      columns: (footer?.columns ?? []).map((column) =>
        column.id === id ? { ...column, ...changes } : column,
      ),
    });

  const save = async () => {
    if (!footer) return;
    setSaving(true);
    try {
      const { settings } = await website.updateSettings("footer", footer);
      setFooter(settings.footer);
      setDirty(false);
      toast.success("Footer saved");
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !footer) {
    return (
      <>
        <PageHeader title="Footer" description="Footer columns, tagline and copyright." />
        {error ? <p className="text-destructive">{error}</p> : <Skeleton className="h-96" />}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Footer"
        description="Footer link columns, the tagline and the copyright line."
        actions={
          canWrite && (
            <Button variant="primary" icon={Save} loading={saving} disabled={!dirty} onClick={save}>
              Save
            </Button>
          )
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader title="General" />
          <div className="space-y-4 p-4">
            <Field label="Tagline" hint="A short line about ENICE Group, shown near the logo.">
              {(props) => (
                <Textarea
                  {...props}
                  value={footer.tagline}
                  onChange={(event) => patch({ tagline: event.target.value })}
                  rows={2}
                  disabled={!canWrite}
                />
              )}
            </Field>
            <Field label="Copyright line">
              {(props) => (
                <Input
                  {...props}
                  value={footer.copyright}
                  onChange={(event) => patch({ copyright: event.target.value })}
                  disabled={!canWrite}
                />
              )}
            </Field>
            <div className="border-border rounded-lg border p-3">
              <Toggle
                checked={footer.showSocials}
                onChange={(next) => patch({ showSocials: next })}
                label="Show social media links"
                description="The profiles themselves are configured in code as part of the brand identity."
                disabled={!canWrite}
              />
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {footer.columns.map((column) => (
            <Card key={column.id}>
              <div className="border-border flex items-center gap-2 border-b px-3 py-2">
                <Input
                  value={column.heading}
                  onChange={(event) => patchColumn(column.id, { heading: event.target.value })}
                  placeholder="Column heading"
                  aria-label="Column heading"
                  className="h-8 flex-1 font-semibold"
                  disabled={!canWrite}
                />
                {canWrite && (
                  <IconButton
                    icon={Trash2}
                    label="Remove column"
                    size="sm"
                    onClick={() =>
                      patch({ columns: footer.columns.filter((c) => c.id !== column.id) })
                    }
                  />
                )}
              </div>
              <div className="p-3">
                <NavItemList
                  items={column.links}
                  onChange={(links) => patchColumn(column.id, { links })}
                  canWrite={canWrite}
                />
              </div>
            </Card>
          ))}

          {canWrite && footer.columns.length < 6 && (
            <button
              type="button"
              onClick={() =>
                patch({
                  columns: [...footer.columns, { id: blockId(), heading: "New column", links: [] }],
                })
              }
              className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex min-h-32 items-center justify-center rounded-xl border border-dashed text-[13px] transition-colors"
            >
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Add column
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/admin/website/footer")({
  component: function FooterRoute() {
    return (
      <AdminShell requiredPermission="settings.read">
        <FooterScreen />
      </AdminShell>
    );
  },
});
