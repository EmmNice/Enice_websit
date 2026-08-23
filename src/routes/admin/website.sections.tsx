import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as icons from "lucide-react";
import { ChevronRight, Eye, EyeOff, LayoutTemplate, type LucideIcon } from "lucide-react";
import type { SectionSchema, SectionType, SiteSectionRecord } from "@/lib/cms/types";
import { website, CmsError } from "@/lib/cms/admin-client";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { SectionFieldsForm } from "@/components/admin/website/SectionFieldsForm";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonRows,
  StatusPill,
  Toggle,
} from "@/components/admin/primitives";

function iconByName(name: string): LucideIcon {
  const registry = icons as unknown as Record<string, LucideIcon>;
  return registry[name] ?? icons.Square;
}

/**
 * Website Sections.
 *
 * The site's global bands — homepage hero, statistics, partners, FAQ — grouped by the page they
 * belong to. Selecting one opens its schema-driven form (see `SectionFieldsForm`). Editing here
 * changes the live website with no code change, but only within the structured fields each section
 * allows, so the design stays intact.
 */
function SectionsScreen() {
  const { can } = useAdmin();
  const toast = useToast();
  const canEdit = can("sections.write");

  const [sections, setSections] = useState<SiteSectionRecord[]>([]);
  const [schemas, setSchemas] = useState<Record<SectionType, SectionSchema> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    website
      .sections()
      .then((result) => {
        setSections(result.sections);
        setSchemas(result.schemas);
        setSelectedKey((current) => current ?? result.sections[0]?.key ?? null);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  // Grouped for the list, preserving the server's ordering within each group.
  const groups = useMemo(() => {
    const byGroup = new Map<string, SiteSectionRecord[]>();
    for (const section of sections) {
      const list = byGroup.get(section.group) ?? [];
      list.push(section);
      byGroup.set(section.group, list);
    }
    return [...byGroup.entries()];
  }, [sections]);

  const selected = sections.find((section) => section.key === selectedKey) ?? null;

  const onSaved = (updated: SiteSectionRecord) => {
    setSections((current) =>
      current.map((section) => (section.key === updated.key ? updated : section)),
    );
  };

  return (
    <>
      <PageHeader
        title="Website Sections"
        description="Edit the content of the bands that make up the ENICE website. Appearance is controlled by the design system — you manage the words, images and links."
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading || !schemas ? (
        <SkeletonRows rows={6} />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No sections yet"
          description="Managed sections will appear here."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Section list */}
          <div className="space-y-5">
            {groups.map(([group, groupSections]) => (
              <div key={group}>
                <p className="text-muted-foreground/70 mb-1.5 px-1 text-[10px] font-bold tracking-[0.14em] uppercase">
                  {group}
                </p>
                <div className="border-border overflow-hidden rounded-xl border">
                  {groupSections.map((section, index) => {
                    const Icon = iconByName(schemas[section.type]?.icon ?? "Square");
                    const active = section.key === selectedKey;
                    return (
                      <button
                        key={section.key}
                        type="button"
                        onClick={() => setSelectedKey(section.key)}
                        className={[
                          "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          index > 0 ? "border-border border-t" : "",
                          active ? "bg-primary/[0.06]" : "hover:bg-secondary/50",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                            active
                              ? "bg-primary/[0.12] text-primary"
                              : "bg-secondary text-muted-foreground",
                          ].join(" ")}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block truncate text-[12.5px] font-medium">
                            {section.label}
                          </span>
                          <span className="text-muted-foreground block truncate text-[10.5px]">
                            {schemas[section.type]?.label ?? section.type}
                          </span>
                        </span>
                        {!section.visible && (
                          <EyeOff
                            className="text-muted-foreground h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}
                        <ChevronRight
                          className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground/40"}`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Editor */}
          {selected && schemas[selected.type] ? (
            <SectionEditor
              key={selected.key}
              section={selected}
              schema={schemas[selected.type]}
              canEdit={canEdit}
              onSaved={onSaved}
              onError={(message) => toast.error("Could not save", message)}
              onSuccess={() => toast.success("Section updated")}
            />
          ) : (
            <Card className="flex items-center justify-center p-12">
              <p className="text-muted-foreground text-[13px]">Select a section to edit it.</p>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function SectionEditor({
  section,
  schema,
  canEdit,
  onSaved,
  onError,
  onSuccess,
}: {
  section: SiteSectionRecord;
  schema: SectionSchema;
  canEdit: boolean;
  onSaved: (section: SiteSectionRecord) => void;
  onError: (message: string) => void;
  onSuccess: () => void;
}) {
  const [fields, setFields] = useState(section.fields);
  const [visible, setVisible] = useState(section.visible);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setFields(section.fields);
    setVisible(section.visible);
    setDirty(false);
  }, [section]);

  const save = async () => {
    setSaving(true);
    try {
      const { section: updated } = await website.updateSection(section.key, { fields, visible });
      onSaved(updated);
      setDirty(false);
      onSuccess();
    } catch (caught) {
      onError(caught instanceof CmsError ? caught.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title={section.label}
        description={schema.description}
        icon={iconByName(schema.icon)}
        actions={
          <div className="flex items-center gap-3">
            <StatusPill tone={visible ? "success" : "neutral"} dot={false}>
              {visible ? "Visible" : "Hidden"}
            </StatusPill>
            <Badge>{schema.label}</Badge>
          </div>
        }
      />

      <div className="space-y-5 p-5">
        <div className="border-border rounded-lg border p-3">
          <Toggle
            checked={visible}
            onChange={(next) => {
              setVisible(next);
              setDirty(true);
            }}
            label="Show this section on the website"
            description={
              visible
                ? "This section is included on its page."
                : "This section is hidden — it will not appear on the live site."
            }
            disabled={!canEdit}
          />
        </div>

        <SectionFieldsForm
          schema={schema}
          values={fields}
          onChange={(next) => {
            setFields(next);
            setDirty(true);
          }}
          disabled={!canEdit}
        />
      </div>

      {canEdit && (
        <div className="border-border flex items-center justify-between gap-2 border-t px-5 py-3">
          <span className="text-muted-foreground text-[11.5px]">
            Updated {formatRelativeTime(section.updatedAt)}
            {section.updatedByEmail ? ` by ${section.updatedByEmail}` : ""}
          </span>
          <Button variant="primary" icon={Eye} loading={saving} disabled={!dirty} onClick={save}>
            Save changes
          </Button>
        </div>
      )}
    </Card>
  );
}

export const Route = createFileRoute("/admin/website/sections")({
  component: function SectionsRoute() {
    return (
      <AdminShell requiredPermission="sections.read">
        <SectionsScreen />
      </AdminShell>
    );
  },
});
