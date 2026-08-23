import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  CalendarClock,
  Database,
  ExternalLink,
  FileText,
  Globe,
  HardDrive,
  Image as ImageIcon,
  LayoutTemplate,
  Megaphone,
  Newspaper,
  PencilLine,
  Plus,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { DashboardSnapshot } from "@/lib/cms/types";
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
  PageHeader,
  Skeleton,
  StatusPill,
} from "@/components/admin/primitives";
import { ACTIVITY_LABELS } from "@/components/admin/activity-labels";

/**
 * The dashboard.
 *
 * Answers the four questions an administrator opens the panel with: what is live, what is waiting,
 * what changed recently, and is anything wrong. Everything comes from a single
 * `GET /api/cms/dashboard` — see `dashboardSnapshot()` for why it is one request rather than eight.
 */
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

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Publishing activity, upcoming releases and the state of the ENICE website."
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
          <QuickActions />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Published"
              value={snapshot.counts.published}
              hint={
                snapshot.site.lastPublishedAt
                  ? `Last published ${formatRelativeTime(snapshot.site.lastPublishedAt)}`
                  : "Nothing published yet"
              }
              icon={Globe}
              tone="success"
            />
            <Metric
              label="Drafts"
              value={snapshot.counts.drafts}
              hint="Not visible publicly"
              icon={PencilLine}
              tone="neutral"
            />
            <Metric
              label="Scheduled"
              value={snapshot.counts.scheduled}
              hint={
                snapshot.upcoming.length > 0
                  ? `Next: ${formatRelativeTime(snapshot.upcoming[0].scheduledFor)}`
                  : "Nothing queued"
              }
              icon={CalendarClock}
              tone="info"
            />
            <Metric
              label="Archived"
              value={snapshot.counts.archived}
              hint="Kept on record"
              icon={Archive}
              tone="warning"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ContentByKind snapshot={snapshot} />
              <RecentContent snapshot={snapshot} />
              <div className="grid gap-6 md:grid-cols-2">
                <RecentList
                  title="Recent announcements"
                  icon={Megaphone}
                  items={snapshot.recentAnnouncements}
                  emptyLabel="No announcements yet"
                  href="/admin/content/announcements"
                />
                <RecentList
                  title="Recent updates"
                  icon={Zap}
                  items={snapshot.recentUpdates}
                  emptyLabel="No updates yet"
                  href="/admin/content/updates"
                />
              </div>
            </div>

            <div className="space-y-6">
              <WebsiteStatus snapshot={snapshot} config={config} />
              {snapshot.upcoming.length > 0 && <Upcoming snapshot={snapshot} />}
              <RecentActivity snapshot={snapshot} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * The quick actions band.
 *
 * Filtered by permission, so an Editor sees the four content actions and not "Manage website".
 * A row of buttons that refuse to work would be worse than a shorter row.
 */
function QuickActions() {
  const { can } = useAdmin();

  const actions = [
    {
      label: "Create blog post",
      to: "/admin/content/blog/new",
      icon: FileText,
      permission: "content.write",
    },
    {
      label: "Create announcement",
      to: "/admin/content/announcements/new",
      icon: Megaphone,
      permission: "content.write",
    },
    {
      label: "Create update",
      to: "/admin/content/updates/new",
      icon: Zap,
      permission: "content.write",
    },
    {
      label: "Create news entry",
      to: "/admin/content/news/new",
      icon: Newspaper,
      permission: "content.write",
    },
    {
      label: "Manage pages",
      to: "/admin/website/pages",
      icon: LayoutTemplate,
      permission: "pages.read",
    },
    { label: "Media library", to: "/admin/media", icon: ImageIcon, permission: "media.read" },
    { label: "AI Website Manager", to: "/admin/ai", icon: Sparkles, permission: "ai.read" },
  ] as const;

  const visible = actions.filter((action) => can(action.permission));
  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-7">
      {visible.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="border-border bg-card hover:border-primary/30 hover:bg-secondary/40 group flex flex-col items-start gap-2.5 rounded-xl border p-3.5 transition-all"
        >
          <span className="bg-secondary text-muted-foreground group-hover:bg-primary/[0.08] group-hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
            <action.icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-foreground text-[12px] leading-tight font-semibold">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

function ContentByKind({ snapshot }: { snapshot: DashboardSnapshot }) {
  const icons = { blog: FileText, announcement: Megaphone, update: Zap, news: Newspaper };

  return (
    <Card>
      <CardHeader title="Content by type" description="Published, drafts and scheduled per area." />
      <div className="divide-border divide-y">
        {Object.entries(snapshot.byKind).map(([kind, counts]) => {
          const meta = CONTENT_KIND_META[kind as keyof typeof CONTENT_KIND_META];
          const Icon = icons[kind as keyof typeof icons];

          return (
            <Link
              key={kind}
              to={meta.route}
              className="hover:bg-secondary/40 flex items-center gap-4 px-5 py-3 transition-colors"
            >
              <span className="bg-secondary text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-foreground block text-[13px] font-semibold">
                  {meta.plural}
                </span>
                <span className="text-muted-foreground block truncate text-[11.5px]">
                  {meta.description}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-[12px] tabular-nums">
                <span className="text-emerald-700" title="Published">
                  {counts.published}
                </span>
                <span className="text-muted-foreground" title="Drafts">
                  {counts.drafts}
                </span>
                <span className="text-blue-700" title="Scheduled">
                  {counts.scheduled}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function RecentContent({ snapshot }: { snapshot: DashboardSnapshot }) {
  if (snapshot.recentContent.length === 0) {
    return (
      <Card>
        <CardHeader title="Recently edited" />
        <div className="p-5">
          <EmptyState
            icon={FileText}
            title="No content yet"
            description="Create your first blog post, announcement, update or news entry to see it here."
            action={
              <Button variant="primary" icon={Plus} onClick={() => undefined}>
                <Link to="/admin/content/blog/new">New blog post</Link>
              </Button>
            }
            className="border-0 py-8"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recently edited"
        description="The last few things anyone changed."
        actions={
          <Link
            to="/admin/publishing/drafts"
            className="text-primary text-[12px] font-semibold hover:underline"
          >
            View all
          </Link>
        }
      />
      <ul className="divide-border divide-y">
        {snapshot.recentContent.map((item) => {
          const meta = CONTENT_KIND_META[item.kind];
          const status = CONTENT_STATUS_META[item.status];

          return (
            <li key={item.id}>
              <Link
                to={`${meta.route}/${item.id}`}
                className="hover:bg-secondary/40 flex items-center gap-3 px-5 py-3 transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block truncate text-[13px] font-medium">
                    {item.title || "Untitled"}
                  </span>
                  <span className="text-muted-foreground block truncate text-[11.5px]">
                    {meta.singular} · edited {formatRelativeTime(item.updatedAt)}
                    {item.updatedByEmail ? ` by ${item.updatedByEmail}` : ""}
                  </span>
                </span>
                <StatusPill tone={status.tone}>{status.label}</StatusPill>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function RecentList({
  title,
  icon: Icon,
  items,
  emptyLabel,
  href,
}: {
  title: string;
  icon: typeof Megaphone;
  items: DashboardSnapshot["recentAnnouncements"];
  emptyLabel: string;
  href: string;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        icon={Icon}
        actions={
          <Link to={href} className="text-primary text-[12px] font-semibold hover:underline">
            All
          </Link>
        }
      />
      {items.length === 0 ? (
        <p className="text-muted-foreground px-5 py-6 text-center text-[12.5px]">{emptyLabel}</p>
      ) : (
        <ul className="divide-border divide-y">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-2.5">
              <Link
                to={`${CONTENT_KIND_META[item.kind].route}/${item.id}`}
                className="hover:text-primary block"
              >
                <span className="text-foreground block truncate text-[12.5px] font-medium">
                  {item.title || "Untitled"}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  {CONTENT_STATUS_META[item.status].label} ·{" "}
                  {formatRelativeTime(item.publishedAt ?? item.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Upcoming({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <Card>
      <CardHeader title="Publishing next" icon={CalendarClock} />
      <ul className="divide-border divide-y">
        {snapshot.upcoming.map((item) => (
          <li key={item.id} className="px-5 py-3">
            <Link
              to={`${CONTENT_KIND_META[item.kind].route}/${item.id}`}
              className="hover:text-primary block"
            >
              <span className="text-foreground block truncate text-[12.5px] font-medium">
                {item.title || "Untitled"}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[11px]">
                {item.scheduledFor
                  ? new Date(item.scheduledFor).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/**
 * Website and integration status.
 *
 * Each row is a real check rather than a decorative green tick: the flags come from the server's
 * view of its own configuration, so "Media storage — not configured" is trustworthy and actionable.
 */
function WebsiteStatus({
  snapshot,
  config,
}: {
  snapshot: DashboardSnapshot;
  config: {
    mediaStorageConfigured: boolean;
    aiConfigured: boolean;
    codeDeliveryConfigured: boolean;
  };
}) {
  const rows = [
    { label: "Website API", ok: snapshot.site.apiHealthy, icon: Globe, required: true },
    { label: "Database", ok: snapshot.site.databaseConfigured, icon: Database, required: true },
    { label: "Media storage", ok: config.mediaStorageConfigured, icon: HardDrive, required: false },
    { label: "AI manager", ok: config.aiConfigured, icon: Sparkles, required: false },
  ];

  return (
    <Card>
      <CardHeader title="Website status" />
      <ul className="divide-border divide-y">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 px-5 py-2.5">
            <span className="text-foreground flex items-center gap-2 text-[12.5px]">
              <row.icon className="text-muted-foreground h-3.5 w-3.5" aria-hidden="true" />
              {row.label}
            </span>
            <StatusPill tone={row.ok ? "success" : row.required ? "danger" : "warning"}>
              {row.ok ? "Ready" : row.required ? "Unavailable" : "Not configured"}
            </StatusPill>
          </li>
        ))}
      </ul>

      {snapshot.pendingAiReviews > 0 && (
        <div className="border-border border-t p-4">
          <Link
            to="/admin/ai"
            className="border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.07] flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors"
          >
            <Sparkles className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-foreground text-[12px] font-medium">
              {snapshot.pendingAiReviews} AI{" "}
              {snapshot.pendingAiReviews === 1 ? "proposal" : "proposals"} awaiting review
            </span>
          </Link>
        </div>
      )}
    </Card>
  );
}

function RecentActivity({ snapshot }: { snapshot: DashboardSnapshot }) {
  const { can } = useAdmin();

  return (
    <Card>
      <CardHeader
        title="Recent activity"
        icon={Users}
        actions={
          can("activity.read") ? (
            <Link
              to="/admin/administration/activity"
              className="text-primary text-[12px] font-semibold hover:underline"
            >
              All
            </Link>
          ) : undefined
        }
      />
      {snapshot.activity.length === 0 ? (
        <p className="text-muted-foreground px-5 py-6 text-center text-[12.5px]">
          Nothing recorded yet.
        </p>
      ) : (
        <ul className="divide-border divide-y">
          {snapshot.activity.map((entry) => (
            <li key={entry.id} className="px-5 py-2.5">
              <p className="text-foreground text-[12px] leading-snug">
                <span className="font-medium">
                  {entry.actorName || entry.actorEmail || "System"}
                </span>{" "}
                <span className="text-muted-foreground">
                  {ACTIVITY_LABELS[entry.action] ?? entry.action}
                </span>{" "}
                {entry.entityLabel && <span className="font-medium">{entry.entityLabel}</span>}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {formatRelativeTime(entry.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading the dashboard">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-7">
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="h-[86px]" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[104px]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-[260px]" />
          <Skeleton className="h-[280px]" />
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
