import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import type { ActivityEntry } from "@/lib/cms/types";
import { activity } from "@/lib/cms/admin-client";
import { formatRelativeTime, formatShortDate } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import {
  ACTIVITY_FILTER_GROUPS,
  ACTIVITY_LABELS,
  ACTIVITY_TONE,
} from "@/components/admin/activity-labels";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  SkeletonRows,
  StatusPill,
  Toolbar,
} from "@/components/admin/primitives";

const PAGE_SIZE = 50;

/**
 * The activity / audit log.
 *
 * A reverse-chronological, filterable, paginated view of every recorded action — who did what to
 * which item, when, from where, and whether it succeeded. The table is append-only server-side, so
 * this is a genuine audit trail. Failed and destructive actions are toned so a scan surfaces the
 * security-relevant lines (failed logins, deletions, suspensions) without reading every row.
 */
function ActivityScreen() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    activity
      .list({
        limit: PAGE_SIZE,
        offset,
        action: action || undefined,
        search: search.trim() || undefined,
      })
      .then((result) => {
        setEntries(result.entries);
        setTotal(result.total);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, [offset, action, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  // Reset to the first page whenever a filter changes.
  useEffect(() => {
    setOffset(0);
  }, [action, search]);

  return (
    <>
      <PageHeader
        title="Activity"
        description="An audit trail of every change made in the Website Manager."
      />

      <Toolbar>
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by administrator or item…"
            aria-label="Search activity"
          />
        </div>
        <Select
          value={action}
          onChange={(event) => setAction(event.target.value)}
          className="sm:w-56"
          aria-label="Filter by action"
        >
          <option value="">All actions</option>
          {ACTIVITY_FILTER_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.actions.map((option) => (
                <option key={option} value={option}>
                  {ACTIVITY_LABELS[option]}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Toolbar>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={8} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No activity"
          description="Actions will be recorded here as administrators work."
        />
      ) : (
        <Card className="divide-border divide-y">
          {entries.map((entry) => {
            const tone = entry.outcome === "failure" ? "danger" : ACTIVITY_TONE[entry.action];
            return (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={[
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    tone === "danger"
                      ? "bg-red-500"
                      : tone === "warning"
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  ].join(" ")}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-[13px] leading-snug">
                    <span className="font-medium">
                      {entry.actorName || entry.actorEmail || "System"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {ACTIVITY_LABELS[entry.action] ?? entry.action}
                    </span>
                    {entry.entityLabel && <span className="font-medium"> {entry.entityLabel}</span>}
                    {entry.outcome === "failure" && (
                      <StatusPill tone="danger" dot={false} className="ml-2">
                        failed
                      </StatusPill>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    <time
                      dateTime={entry.createdAt}
                      title={new Date(entry.createdAt).toLocaleString()}
                    >
                      {formatRelativeTime(entry.createdAt)} · {formatShortDate(entry.createdAt)}
                    </time>
                    {entry.ipAddress ? ` · ${entry.ipAddress}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-[12px]">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset((current) => current + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute("/admin/administration/activity")({
  component: function ActivityRoute() {
    return (
      <AdminShell requiredPermission="activity.read">
        <ActivityScreen />
      </AdminShell>
    );
  },
});
