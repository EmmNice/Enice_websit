/**
 * The activity log.
 *
 * Every consequential action in the Website Manager is recorded here: who did it, what it
 * affected, when, from where, and whether it succeeded. The table is append-only by
 * construction — the API exposes no update or delete for it — which is what makes it usable as
 * an audit trail rather than merely a feed.
 *
 * ## Two rules that matter
 *
 * 1. **Logging never fails a request.** A write error is reported to the function logs and
 *    swallowed. An administrator publishing a post should not see it fail because the audit
 *    insert timed out; losing one log line is strictly better than losing the publish.
 *
 * 2. **Labels are captured at write time.** `entity_label` stores the affected thing's name as
 *    it was, so the log still reads correctly after the item is renamed or deleted. A log that
 *    only holds ids becomes unreadable exactly when it is most needed.
 */

import type { ActivityAction, ActivityEntry } from "../../src/lib/cms/types";
import type { AdminIdentity } from "./auth";
import { db, isoOrNull, json, newId } from "./db";
import { clientIp, type ApiRequest } from "./http";

/** Fields describing what an action affected. */
export interface AuditTarget {
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  metadata?: Record<string, unknown>;
  outcome?: "success" | "failure";
}

/**
 * Records an action.
 *
 * `actor` is nullable because failed logins are the most security-relevant entries of all and
 * there is no authenticated identity at that point — the attempted email is carried in
 * `metadata` instead.
 */
export async function recordActivity(
  req: ApiRequest,
  actor: AdminIdentity | { id?: string; email?: string; name?: string } | null,
  action: ActivityAction,
  target: AuditTarget = {},
): Promise<void> {
  try {
    await db()`
      INSERT INTO activity_log (
        id, actor_id, actor_email, actor_name, action,
        entity_type, entity_id, entity_label, outcome, ip_address, metadata
      ) VALUES (
        ${newId()}, ${actor?.id ?? null}, ${actor?.email ?? null}, ${actor?.name ?? null},
        ${action}, ${target.entityType ?? null}, ${target.entityId ?? null},
        ${target.entityLabel ?? null}, ${target.outcome ?? "success"},
        ${clientIp(req)}, ${json(target.metadata ?? {})}
      )
    `;
  } catch (error) {
    // Deliberately swallowed — see the note at the top of this module.
    console.error(`[cms] failed to record activity "${action}":`, error);
  }
}

interface ActivityRow {
  id: string;
  actor_email: string | null;
  actor_name: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  outcome: string;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

function toEntry(row: ActivityRow): ActivityEntry {
  return {
    id: row.id,
    actorEmail: row.actor_email,
    actorName: row.actor_name,
    action: row.action as ActivityAction,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityLabel: row.entity_label,
    outcome: row.outcome === "failure" ? "failure" : "success",
    ipAddress: row.ip_address,
    metadata: row.metadata ?? {},
    createdAt: isoOrNull(row.created_at) ?? new Date().toISOString(),
  };
}

export interface ActivityQuery {
  limit?: number;
  offset?: number;
  action?: string;
  actorEmail?: string;
  entityId?: string;
  /** Free-text match across actor, action and the affected item's label. */
  search?: string;
}

/**
 * Reads the log, newest first.
 *
 * Filters are applied as optional SQL fragments rather than by building a string, so the values
 * remain parameterised. The limit is clamped: an unbounded query against an append-only table
 * is a slow, memory-hungry way to take the function down.
 */
export async function listActivity(
  query: ActivityQuery = {},
): Promise<{ entries: ActivityEntry[]; total: number }> {
  const sql = db();
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim();

  const filters = [
    query.action ? sql`AND action = ${query.action}` : sql``,
    query.actorEmail ? sql`AND actor_email = ${query.actorEmail}` : sql``,
    query.entityId ? sql`AND entity_id = ${query.entityId}` : sql``,
    search
      ? sql`AND (
            actor_email ILIKE ${`%${search}%`}
            OR entity_label ILIKE ${`%${search}%`}
            OR action ILIKE ${`%${search}%`}
          )`
      : sql``,
  ];

  const rows = await sql<ActivityRow[]>`
    SELECT id, actor_email, actor_name, action, entity_type, entity_id, entity_label,
           outcome, ip_address, metadata, created_at
    FROM activity_log
    WHERE true ${filters[0]} ${filters[1]} ${filters[2]} ${filters[3]}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const counted = await sql<{ count: string }[]>`
    SELECT count(*)::text AS count
    FROM activity_log
    WHERE true ${filters[0]} ${filters[1]} ${filters[2]} ${filters[3]}
  `;

  return { entries: rows.map(toEntry), total: Number(counted[0]?.count ?? "0") };
}

/** The most recent entries, for the dashboard. */
export async function recentActivity(limit = 8): Promise<ActivityEntry[]> {
  const { entries } = await listActivity({ limit });
  return entries;
}

/** The history of one item, for the "Activity" tab on an editor screen. */
export async function activityForEntity(entityId: string, limit = 20): Promise<ActivityEntry[]> {
  const { entries } = await listActivity({ entityId, limit });
  return entries;
}
