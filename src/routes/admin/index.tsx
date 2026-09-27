import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  Megaphone,
  Newspaper,
  PencilLine,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ContentSummary, DashboardSnapshot } from "@/lib/cms/types";
import { CONTENT_KIND_META, CONTENT_STATUS_META } from "@/lib/cms/types";
import { insights } from "@/lib/cms/admin-client";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Metric,
  NotConfiguredNotice,
  PageHeader,
  Skeleton,
  StatusPill,
} from "@/components/admin/primitives";
import { ACTIVITY_LABELS } from "@/components/admin/activity-labels";

/**
 * The dashboard.
 *
 * Answers the three questions an administrator opens the panel with: what is live, what is waiting
 * to go out, and what changed recently. Everything comes from a single `GET /api/cms/dashboard` —
 * see `dashboardSnapshot()` for why it is one request rather than eight.
 *
 * It used to also report media storage, page counts, administrator counts and the AI review queue.
 * Those screens are gone, and a tile reporting a subsystem you cannot open is just noise, so the
 * panel now reports only what it can act on. That is also what let `repo/insights.ts` stop importing
 * half the API.
 */

const KIND_ICONS = {
  blog: FileText,
  announcement: Megaphone,
  update: Zap,
  news: Newspaper,
} as const;

function DashboardPage() {
  const { can, config } = useAdmin();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    insights
      .dashboard()
      .then(setSnapshot)
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (!config.databaseConfigured) {
    return (
      <>
        <PageHeader title="Dashboard" description="Publishing activity for the ENICE website." />
        <NotConfiguredNotice title="A database is required">
          The Website Manager stores everything it publishes in Postgres. Set{" "}
          <code>DATABASE_URL</code> and <code>CMS_SECRET</code>, then redeploy.
        </NotConfiguredNotice>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Publishing activity and what is queued to go out."
        actions={
          <>
            <Button
              variant="outline"
              icon={ExternalLink}
              onClick={() => window.open("/", "_blank", "noopener")}
            >
              Preview website
            </Button>
            {can("content.write") && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => void navigate({ to: "/admin/content/blog/new" })}
              >
                New blog post
              </Button>
            )}
          </>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading || !snapshot ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Metric
              label="Published"
              value={snapshot.counts.published}
              icon={CheckCircle2}
              tone="success"
              hint={
                snapshot.site.lastPublishedAt
                  ? `Last ${formatRelativeTime(snapshot.site.lastPublishedAt)}`
                  : "Nothing published yet"
              }
            />
            <Metric label="Drafts" value={snapshot.counts.drafts} icon={PencilLine} />
            <Metric
              label="Scheduled"
              value={snapshot.counts.scheduled}
              icon={CalendarClock}
              tone={snapshot.counts.scheduled > 0 ? "warning" : undefined}
            />
            <Metric label="Archived" value={snapshot.counts.archived} icon={Archive} />
            <Metric
              label="Assistant knowledge"
              value={snapshot.counts.knowledge}
              icon={Sparkles}
              hint="Active entries"
            />
          </div>

          {/* Per-kind counts double as the primary navigation into each library. */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(KIND_ICONS) as (keyof typeof KIND_ICONS)[]).map((kind) => {
              const meta = CONTENT_KIND_META[kind];
              const counts = snapshot.byKind[kind];
              const Icon = KIND_ICONS[kind];
              return (
                <Link
                  key={kind}
                  to={meta.route}
                  className="border-border bg-card hover:border-primary/40 group rounded-xl border p-4 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/[0.08] text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-foreground text-[13px] font-semibold">{meta.plural}</span>
                  </div>
                  <dl className="text-muted-foreground mt-3 flex items-center gap-3 text-[12px]">
                    <div>
                      <dt className="sr-only">Published</dt>
                      <dd className="text-foreground tabular-nums font-semibold">
                        {counts.published}
                      </dd>
                      <dd>live</dd>
                    </div>
                    <div>
                      <dt className="sr-only">Drafts</dt>
                      <dd className="text-foreground tabular-nums font-semibold">
                        {counts.drafts}
                      </dd>
                      <dd>draft</dd>
                    </div>
                    <div>
                      <dt className="sr-only">Scheduled</dt>
                      <dd className="text-foreground tabular-nums font-semibold">
                        {counts.scheduled}
                      </dd>
                      <dd>queued</dd>
                    </div>
                  </dl>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader
                  title="Recently edited"
                  description="Across every content type."
                  icon={FileText}
                />
                <ContentRows
                  items={snapshot.recentContent}
                  empty="Nothing yet. Create your first post and it will appear here."
                />
              </Card>

              <Card>
                <CardHeader
                  title="Announcements"
                  description="The newest first."
                  icon={Megaphone}
                />
                <ContentRows items={snapshot.recentAnnouncements} empty="No announcements yet." />
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Going out next"
                  description="Scheduled posts publish themselves."
                  icon={CalendarClock}
                />
                <ContentRows items={snapshot.upcoming} empty="Nothing scheduled." showSchedule />
              </Card>

              <Card>
                <CardHeader title="Recent activity" icon={PencilLine} />
                {snapshot.activity.length === 0 ? (
                  <p className="text-muted-foreground px-4 pb-4 text-[12.5px]">
                    No activity recorded yet.
                  </p>
                ) : (
                  <ul className="divide-border divide-y">
                    {snapshot.activity.map((entry) => (
                      <li key={entry.id} className="px-4 py-2.5">
                        <p className="text-foreground text-[12.5px]">
                          {ACTIVITY_LABELS[entry.action] ?? entry.action}
                          {entry.entityLabel ? (
                            <span className="text-muted-foreground"> · {entry.entityLabel}</span>
                          ) : null}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[11.5px]">
                          {entry.actorName || entry.actorEmail} ·{" "}
                          {formatRelativeTime(entry.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** A compact list of content rows, linking straight into the editor. */
function ContentRows({
  items,
  empty,
  showSchedule = false,
}: {
  items: ContentSummary[];
  empty: string;
  showSchedule?: boolean;
}) {
  if (items.length === 0) {
    return <EmptyState icon={FileText} title={empty} className="border-0 px-4 pb-4" />;
  }

  return (
    <ul className="divide-border divide-y">
      {items.map((item) => {
        const meta = CONTENT_KIND_META[item.kind];
        const status = CONTENT_STATUS_META[item.status];
        return (
          <li key={item.id}>
            <Link
              to={`${meta.route}/${item.id}`}
              className="hover:bg-secondary/60 flex items-center gap-3 px-4 py-2.5 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-[13px] font-medium">
                  {item.title || "(untitled)"}
                </p>
                <p className="text-muted-foreground mt-0.5 truncate text-[11.5px]">
                  {meta.singular} ·{" "}
                  {showSchedule && item.scheduledFor
                    ? `publishes ${formatRelativeTime(item.scheduledFor)}`
                    : formatRelativeTime(item.updatedAt)}
                </p>
              </div>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-[104px]" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[96px]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-[260px]" />
          <Skeleton className="h-[240px]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[240px]" />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/")({
  component: function AdminDashboardRoute() {
    return (
      <AdminShell>
        <DashboardPage />
      </AdminShell>
    );
  },
});
