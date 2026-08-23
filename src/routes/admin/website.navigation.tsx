import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Menu, Plus, Save, Trash2 } from "lucide-react";
import type { HeaderSettings, NavItem } from "@/lib/cms/types";
import { website, CmsError } from "@/lib/cms/admin-client";
import { blockId } from "@/lib/cms/doc";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import {
  Button,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  PageHeader,
  Skeleton,
  Toggle,
} from "@/components/admin/primitives";

/**
 * Header navigation editor.
 *
 * The primary menu plus the header call-to-action. Items reorder, toggle visibility, and edit in
 * place. One level of nesting is supported because that is what the header design accommodates —
 * the model allows children, the UI here keeps it to the flat primary menu for clarity.
 */
function NavigationScreen() {
  const { can } = useAdmin();
  const toast = useToast();
  const canWrite = can("settings.write");

  const [header, setHeader] = useState<HeaderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    website
      .settings()
      .then((result) => {
        setHeader(result.settings.header);
        setDirty(false);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const patch = (changes: Partial<HeaderSettings>) => {
    setHeader((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
  };

  const save = async () => {
    if (!header) return;
    setSaving(true);
    try {
      const { settings } = await website.updateSettings("header", header);
      setHeader(settings.header);
      setDirty(false);
      toast.success("Navigation saved");
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !header) {
    return (
      <>
        <PageHeader title="Navigation" description="The header menu and call to action." />
        {error ? <p className="text-destructive">{error}</p> : <Skeleton className="h-96" />}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Navigation"
        description="The header menu and its call-to-action button."
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
          <CardHeader
            title="Menu items"
            icon={Menu}
            description="Shown in the header, left to right."
          />
          <div className="p-4">
            <NavItemList
              items={header.items}
              onChange={(items) => patch({ items })}
              canWrite={canWrite}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Call to action" description="The prominent button in the header." />
          <div className="space-y-4 p-4">
            <div className="border-border rounded-lg border p-3">
              <Toggle
                checked={header.showCta}
                onChange={(next) => patch({ showCta: next })}
                label="Show the call-to-action button"
                disabled={!canWrite}
              />
            </div>
            <Field label="Button label">
              {(props) => (
                <Input
                  {...props}
                  value={header.ctaLabel}
                  onChange={(event) => patch({ ctaLabel: event.target.value })}
                  disabled={!canWrite || !header.showCta}
                />
              )}
            </Field>
            <Field label="Button URL">
              {(props) => (
                <Input
                  {...props}
                  value={header.ctaUrl}
                  onChange={(event) => patch({ ctaUrl: event.target.value })}
                  placeholder="/contact"
                  disabled={!canWrite || !header.showCta}
                />
              )}
            </Field>
            <div className="border-border rounded-lg border p-3">
              <Toggle
                checked={header.sticky}
                onChange={(next) => patch({ sticky: next })}
                label="Sticky header"
                description="The header stays visible as visitors scroll."
                disabled={!canWrite}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

/** A reorderable list of navigation items. Reused by the footer editor's columns. */
export function NavItemList({
  items,
  onChange,
  canWrite,
}: {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  canWrite: boolean;
}) {
  const patch = (id: string, changes: Partial<NavItem>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));
  const add = () =>
    onChange([...items, { id: blockId(), label: "New link", url: "/", visible: true }]);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.id} className="border-border rounded-lg border p-2.5">
          <div className="flex items-center gap-2">
            <GripVertical
              className="text-muted-foreground/40 h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            <Input
              value={item.label}
              onChange={(event) => patch(item.id, { label: event.target.value })}
              placeholder="Label"
              aria-label="Link label"
              className="h-8 flex-1"
              disabled={!canWrite}
            />
            <Input
              value={item.url}
              onChange={(event) => patch(item.id, { url: event.target.value })}
              placeholder="/path"
              aria-label="Link URL"
              className="h-8 flex-1 font-mono text-[11.5px]"
              disabled={!canWrite}
            />
            {canWrite && (
              <div className="flex shrink-0 items-center gap-0.5">
                <IconButton
                  icon={item.visible ? ChevronUp : ChevronUp}
                  label="Move up"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                />
                <IconButton
                  icon={ChevronDown}
                  label="Move down"
                  size="sm"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                />
                <IconButton
                  icon={Trash2}
                  label="Remove"
                  size="sm"
                  onClick={() => remove(item.id)}
                />
              </div>
            )}
          </div>
          {!item.visible && (
            <button
              type="button"
              onClick={() => patch(item.id, { visible: true })}
              className="text-muted-foreground mt-1.5 ml-6 text-[11px] hover:underline"
              disabled={!canWrite}
            >
              Hidden — click to show
            </button>
          )}
          {item.visible && canWrite && (
            <button
              type="button"
              onClick={() => patch(item.id, { visible: false })}
              className="text-muted-foreground mt-1.5 ml-6 text-[11px] hover:underline"
            >
              Visible — click to hide
            </button>
          )}
        </div>
      ))}

      {canWrite && (
        <Button variant="outline" icon={Plus} size="sm" onClick={add}>
          Add link
        </Button>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/website/navigation")({
  component: function NavigationRoute() {
    return (
      <AdminShell requiredPermission="settings.read">
        <NavigationScreen />
      </AdminShell>
    );
  },
});
