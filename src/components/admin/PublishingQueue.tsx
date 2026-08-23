/**
 * The four Publishing views (Drafts, Scheduled, Published, Archived).
 *
 * All four are the same table over a different slice of content, so one component takes the status
 * and renders accordingly. The data comes from a single `GET /publishing` call, sliced client-side
 * — cheaper than four requests, and it means switching tabs is instant.
 *
 * Unlike the per-kind content lists, these span every kind at once: the question a Publishing view
 * answers is "what is in this state across the whole site", regardless of type.
 */

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Archive, CalendarClock, Globe, PencilLine } from "lucide-react";
import type { ContentStatus, ContentSummary } from "@/lib/cms/types";
import { CONTENT_KIND_META, CONTENT_STATUS_META } from "@/lib/cms/types";
import { insights } from "@/lib/cms/admin-client";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { describeError } from "./AdminShell";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonRows,
  StatusPill,
  Table,
  Td,
  Th,
  Tr,
} from "./primitives";

const VIEW_META: Record<
  ContentStatus,
  { title: string; description: string; icon: typeof Globe; emptyLabel: string }
> = {
  draft: {
    title: "Drafts",
    description: "Everything written but not yet visible on the ENICE website.",
    icon: PencilLine,
    emptyLabel: "No drafts",
  },
  scheduled: {
    title: "Scheduled",
    description: "Content set to publish automatically at a chosen time.",
    icon: CalendarClock,
    emptyLabel: "Nothing scheduled",
  },
  published: {
    title: "Published",
    description: "Live on the ENICE website right now.",
    icon: Globe,
    emptyLabel: "Nothing published yet",
  },
  archived: {
    title: "Archived",
    description: "Removed from the website but kept on record.",
    icon: Archive,
    emptyLabel: "Nothing archived",
  },
};

export function PublishingQueue({ status }: { status: ContentStatus }) {
  const navigate = useNavigate();
  const meta = VIEW_META[status];
  const [items, setItems] = useState<ContentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    insights
      .publishing()
      .then((queues) =>
        setItems(queues[`${status}s` as "drafts" | "scheduled" | "published" | "archived"]),
      )
      .catch((caught) => setError(describeError(caught)));
  }, [status]);

  useEffect(load, [load]);

  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items === null ? (
        <SkeletonRows rows={5} />
      ) : items.length === 0 ? (
        <EmptyState icon={meta.icon} title={meta.emptyLabel} description={meta.description} />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th className="hidden md:table-cell">
                  {status === "scheduled"
                    ? "Publishes"
                    : status === "published"
                      ? "Published"
                      : "Updated"}
                </Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const kindMeta = CONTENT_KIND_META[item.kind];
                const when =
                  status === "scheduled"
                    ? item.scheduledFor
                    : status === "published"
                      ? item.publishedAt
                      : item.updatedAt;

                return (
                  <Tr
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => void navigate({ to: `${kindMeta.route}/${item.id}` })}
                  >
                    <Td>
                      <Link
                        to={`${kindMeta.route}/${item.id}`}
                        className="text-foreground hover:text-primary font-medium"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {item.title || "Untitled"}
                      </Link>
                    </Td>
                    <Td>
                      <Badge>{kindMeta.singular}</Badge>
                    </Td>
                    <Td className="hidden md:table-cell">
                      <span className="text-muted-foreground text-[12px]">
                        {status === "scheduled" && when
                          ? new Date(when).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : formatRelativeTime(when)}
                      </span>
                    </Td>
                    <Td>
                      <StatusPill tone={CONTENT_STATUS_META[item.status].tone}>
                        {CONTENT_STATUS_META[item.status].label}
                      </StatusPill>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}
    </>
  );
}
