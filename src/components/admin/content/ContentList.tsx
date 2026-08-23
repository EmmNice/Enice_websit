/**
 * The list screen shared by all four content kinds.
 *
 * Blog, announcements, updates and news differ in labels and columns, not in behaviour — they all
 * list, filter, search, and offer the same row actions. So one component is parameterised by
 * `kind` rather than four near-identical screens kept in sync by hand.
 *
 * Row actions (publish, duplicate, archive, delete) act in place and confirm via a toast, so
 * managing a backlog does not mean opening each item. Destructive actions route through
 * `useConfirm`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Archive,
  ArchiveRestore,
  Copy,
  ExternalLink,
  FileText,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import type { ContentKind, ContentStatus, ContentSummary } from "@/lib/cms/types";
import {
  CONTENT_KIND_META,
  CONTENT_KIND_SEGMENT,
  CONTENT_STATUS_META,
  CONTENT_STATUSES,
} from "@/lib/cms/types";
import { content, CmsError } from "@/lib/cms/admin-client";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { useAdmin } from "../AdminContext";
import { useToast } from "../Toaster";
import { useConfirm } from "../Modal";
import { describeError } from "../AdminShell";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  PageHeader,
  SegmentedControl,
  SkeletonRows,
  StatusPill,
  Table,
  Td,
  Th,
  Toolbar,
  Tr,
} from "../primitives";

const KIND_ICON = { blog: FileText, announcement: FileText, update: FileText, news: FileText };

export function ContentList({ kind }: { kind: ContentKind }) {
  const meta = CONTENT_KIND_META[kind];
  const segment = CONTENT_KIND_SEGMENT[kind];
  const { can } = useAdmin();
  const toast = useToast();
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    content
      .list({
        kind,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
        limit: 100,
      })
      .then((result) => setItems(result.items))
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, [kind, statusFilter, search]);

  // Debounce the search; run filters immediately.
  useEffect(() => {
    const timer = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const editHref = (id: string) => `/admin/content/${segment}/${id}`;

  const runAction = async (
    id: string,
    label: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    setBusyId(id);
    try {
      await action();
      toast.success(successMessage);
      load();
    } catch (caught) {
      toast.error(`Could not ${label}`, caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const tally: Record<string, number> = { all: items.length };
    for (const item of items) tally[item.status] = (tally[item.status] ?? 0) + 1;
    return tally;
  }, [items]);

  return (
    <>
      <PageHeader
        title={meta.plural}
        description={meta.description}
        actions={
          can("content.write") && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => void navigate({ to: `/admin/content/${segment}/new` })}
            >
              New {meta.singular.toLowerCase()}
            </Button>
          )
        }
      />

      <Toolbar>
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${meta.plural.toLowerCase()}…`}
            className="pl-9"
            aria-label={`Search ${meta.plural}`}
          />
        </div>

        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          size="sm"
          options={[
            { value: "all", label: `All${counts.all ? ` ${counts.all}` : ""}` },
            ...CONTENT_STATUSES.map((status) => ({
              value: status,
              label: CONTENT_STATUS_META[status].label,
            })),
          ]}
        />
      </Toolbar>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={KIND_ICON[kind]}
          title={
            search || statusFilter !== "all"
              ? "Nothing matches these filters"
              : `No ${meta.plural.toLowerCase()} yet`
          }
          description={
            search || statusFilter !== "all"
              ? "Try a different search or clear the status filter."
              : meta.description
          }
          action={
            can("content.write") &&
            !search &&
            statusFilter === "all" && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => void navigate({ to: `/admin/content/${segment}/new` })}
              >
                Create the first one
              </Button>
            )
          }
        />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th className="hidden md:table-cell">Category</Th>
                <Th>Status</Th>
                <Th className="hidden lg:table-cell">Updated</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = CONTENT_STATUS_META[item.status];
                const busy = busyId === item.id;

                return (
                  <Tr key={item.id} className={busy ? "opacity-50" : undefined}>
                    <Td>
                      <Link to={editHref(item.id)} className="group block min-w-0">
                        <span className="text-foreground group-hover:text-primary block truncate font-medium">
                          {item.title || "Untitled"}
                        </span>
                        <span className="text-muted-foreground block truncate text-[11.5px]">
                          /{item.slug}
                          {item.readingMinutes > 0 ? ` · ${item.readingMinutes} min` : ""}
                        </span>
                      </Link>
                    </Td>
                    <Td className="hidden md:table-cell">
                      {item.category ? (
                        <span className="text-muted-foreground text-[12px]">{item.category}</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </Td>
                    <Td>
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                      {item.status === "scheduled" && item.scheduledFor && (
                        <span className="text-muted-foreground mt-1 block text-[10.5px]">
                          {new Date(item.scheduledFor).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </Td>
                    <Td className="hidden lg:table-cell">
                      <span className="text-muted-foreground text-[12px]">
                        {formatRelativeTime(item.updatedAt)}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <RowActions
                        item={item}
                        canWrite={can("content.write")}
                        canPublish={can("content.publish")}
                        canDelete={can("content.delete")}
                        onEdit={() => void navigate({ to: editHref(item.id) })}
                        onPublish={() =>
                          runAction(
                            item.id,
                            "publish",
                            () => content.transition(item.id, "published"),
                            "Published",
                          )
                        }
                        onUnpublish={() =>
                          runAction(
                            item.id,
                            "unpublish",
                            () => content.transition(item.id, "draft"),
                            "Moved to draft",
                          )
                        }
                        onArchive={() =>
                          runAction(
                            item.id,
                            "archive",
                            () => content.transition(item.id, "archived"),
                            "Archived",
                          )
                        }
                        onRestore={() =>
                          runAction(
                            item.id,
                            "restore",
                            () => content.transition(item.id, "draft"),
                            "Restored to draft",
                          )
                        }
                        onDuplicate={() =>
                          runAction(
                            item.id,
                            "duplicate",
                            () => content.duplicate(item.id),
                            "Duplicated as a draft",
                          )
                        }
                        onDelete={async () => {
                          const ok = await confirm({
                            title: `Delete this ${meta.singular.toLowerCase()}?`,
                            message: `"${item.title || "Untitled"}" and its revision history will be permanently removed. This cannot be undone.`,
                            confirmLabel: "Delete",
                          });
                          if (ok) {
                            void runAction(
                              item.id,
                              "delete",
                              () => content.remove(item.id),
                              "Deleted",
                            );
                          }
                        }}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {dialog}
    </>
  );
}

/**
 * Per-row action menu.
 *
 * A dropdown rather than a row of buttons: five actions inline would dominate the table, and most
 * of the time an author wants only "edit". The menu is permission-filtered, so an Editor never sees
 * Delete.
 */
function RowActions({
  item,
  canWrite,
  canPublish,
  canDelete,
  onEdit,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  onDuplicate,
  onDelete,
}: {
  item: ContentSummary;
  canWrite: boolean;
  canPublish: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const publicPrefix = CONTENT_KIND_META[item.kind].publicPrefix;

  const options: {
    label: string;
    icon: typeof Send;
    onClick: () => void;
    show: boolean;
    tone?: "danger";
  }[] = [
    { label: "Edit", icon: PencilLine, onClick: onEdit, show: true },
    {
      label: "Publish now",
      icon: Send,
      onClick: onPublish,
      show: canPublish && item.status !== "published",
    },
    {
      label: "Move to draft",
      icon: PencilLine,
      onClick: onUnpublish,
      show: canPublish && item.status === "published",
    },
    { label: "Duplicate", icon: Copy, onClick: onDuplicate, show: canWrite },
    {
      label: "Archive",
      icon: Archive,
      onClick: onArchive,
      show: canPublish && item.status !== "archived",
    },
    {
      label: "Restore",
      icon: ArchiveRestore,
      onClick: onRestore,
      show: canPublish && item.status === "archived",
    },
    { label: "Delete", icon: Trash2, onClick: onDelete, show: canDelete, tone: "danger" },
  ];

  const visible = options.filter((option) => option.show);

  return (
    <div className="relative inline-flex items-center justify-end gap-1">
      {item.status === "published" && publicPrefix && (
        <IconButton
          icon={ExternalLink}
          label="View on the website"
          size="sm"
          onClick={() => window.open(`${publicPrefix}/${item.slug}`, "_blank", "noopener")}
        />
      )}
      <IconButton
        icon={MoreHorizontal}
        label="More actions"
        size="sm"
        onClick={() => setOpen((current) => !current)}
      />

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="border-border bg-popover absolute top-9 right-0 z-20 w-44 overflow-hidden rounded-lg border p-1 shadow-[0_12px_32px_-8px_rgba(17,24,39,0.24)]"
          >
            {visible.map((option) => (
              <button
                key={option.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  option.onClick();
                }}
                className={cnMenu(option.tone)}
              >
                <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function cnMenu(tone?: "danger") {
  return [
    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors",
    tone === "danger"
      ? "text-destructive hover:bg-destructive/5"
      : "text-foreground hover:bg-secondary",
  ].join(" ");
}
