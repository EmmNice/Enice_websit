/**
 * PulsePay waitlist storage.
 *
 * Every query here is parameterised; nothing is concatenated into SQL except the fixed column
 * list and the ORDER BY, which is chosen from an allowlist. The public signup path
 * (`joinWaitlist`) can create a row and nothing else: it cannot read, list or alter anyone.
 */

import type {
  WaitlistEntry,
  WaitlistSegment,
  WaitlistStats,
  WaitlistStatus,
} from "../../../src/lib/waitlist";
import {
  WAITLIST_INTERESTS,
  WAITLIST_SEGMENTS,
  WAITLIST_STATUSES,
} from "../../../src/lib/waitlist";
import { db, isUniqueViolation, iso, isoOrNull, newId, violatedConstraint } from "../db";
import { badRequest, notFound } from "../router";

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string;
  interests: string[];
  segment: string | null;
  status: string;
  consent: boolean;
  consent_at: Date | null;
  unsubscribed_at: Date | null;
  source: string;
  notes: string;
  last_contacted_at: Date | null;
  notified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const COLUMNS = `id, name, email, phone, interests, segment, status, consent, consent_at,
  unsubscribed_at, source, notes, last_contacted_at, notified_at, created_at, updated_at`;

function mapRow(row: Row): WaitlistEntry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    interests: row.interests ?? [],
    segment: (row.segment as WaitlistSegment | null) ?? null,
    status: row.status as WaitlistStatus,
    consent: row.consent,
    consentAt: isoOrNull(row.consent_at),
    unsubscribedAt: isoOrNull(row.unsubscribed_at),
    source: row.source,
    notes: row.notes,
    lastContactedAt: isoOrNull(row.last_contacted_at),
    notifiedAt: isoOrNull(row.notified_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

// ─── Public signup ───────────────────────────────────────────────────────────

export type JoinOutcome = "joined" | "already_joined";

/**
 * Creates a registration. A repeat of an existing email or phone is reported as
 * `already_joined` rather than as an error, and deliberately reveals nothing else about the
 * existing row: the public form must not become a way to learn who is on the list.
 */
export async function joinWaitlist(input: {
  name: string;
  email: string;
  phone: string;
  interests: string[];
  consent: boolean;
  source: string;
}): Promise<JoinOutcome> {
  const sql = db();
  try {
    await sql`
      INSERT INTO pulsepay_waitlist
        (id, name, email, phone, interests, consent, consent_at, source)
      VALUES (
        ${newId()}, ${input.name}, ${input.email.toLowerCase()}, ${input.phone},
        ${input.interests}, ${input.consent}, ${input.consent ? sql`now()` : null}, ${input.source}
      )
    `;
    return "joined";
  } catch (error) {
    if (isUniqueViolation(error)) return "already_joined";
    throw error;
  }
}

// ─── Admin: listing ──────────────────────────────────────────────────────────

export interface ListParams {
  search?: string;
  status?: string;
  segment?: string;
  interest?: string;
  consent?: string; // "yes" | "no" | "unsubscribed"
  sort?: string;
  limit?: number;
  offset?: number;
}

const SORTS: Record<string, string> = {
  newest: "created_at DESC",
  oldest: "created_at ASC",
  name: "lower(name) ASC",
};

/** Escapes LIKE wildcards so a search for `50%` matches the text, not "everything". */
function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

function filters(sql: ReturnType<typeof db>, p: ListParams) {
  const parts = [sql`TRUE`];

  const term = p.search?.trim();
  if (term) {
    const like = likePattern(term);
    // Phone is stored as +<digits>, so a search is also tried against the digits alone, which
    // lets "0803 123" and "803123" both find a +234803123... number.
    const digits = term.replace(/\D/g, "");
    /*
     * A number typed the way people write it (0803 123 4567) has to find the row stored the way
     * we keep it (+2348031234567), so every plausible spelling is tried: the digits as typed, the
     * international form, and the last ten digits — which is the part both forms share.
     */
    const variants = new Set<string>();
    if (digits.length >= 3) {
      variants.add(digits);
      if (digits.startsWith("0") && digits.length === 11) variants.add(`234${digits.slice(1)}`);
      if (digits.startsWith("234") && digits.length === 13) variants.add(`0${digits.slice(3)}`);
      if (digits.length >= 10) variants.add(digits.slice(-10));
    }
    const phoneClause = [...variants]
      .map((v) => sql`phone LIKE ${likePattern(v)}`)
      .reduce((acc, clause) => sql`${acc} OR ${clause}`, sql`FALSE`);

    parts.push(
      variants.size > 0
        ? sql`(name ILIKE ${like} OR email ILIKE ${like} OR (${phoneClause}))`
        : sql`(name ILIKE ${like} OR email ILIKE ${like})`,
    );
  }

  if (p.status && (WAITLIST_STATUSES as readonly string[]).includes(p.status)) {
    parts.push(sql`status = ${p.status}`);
  }
  if (p.segment === "none") parts.push(sql`segment IS NULL`);
  else if (p.segment && (WAITLIST_SEGMENTS as readonly string[]).includes(p.segment)) {
    parts.push(sql`segment = ${p.segment}`);
  }
  if (p.interest && WAITLIST_INTERESTS.some((i) => i.id === p.interest)) {
    parts.push(sql`${p.interest} = ANY(interests)`);
  }
  if (p.consent === "yes") parts.push(sql`consent AND unsubscribed_at IS NULL`);
  else if (p.consent === "no") parts.push(sql`NOT consent`);
  else if (p.consent === "unsubscribed") parts.push(sql`unsubscribed_at IS NOT NULL`);

  return parts.reduce((acc, part) => sql`${acc} AND ${part}`);
}

export async function listWaitlist(
  p: ListParams,
): Promise<{ entries: WaitlistEntry[]; total: number }> {
  const sql = db();
  const where = filters(sql, p);
  const order = SORTS[p.sort ?? "newest"] ?? SORTS.newest;
  const limit = Math.min(Math.max(p.limit ?? 25, 1), 200);
  const offset = Math.max(p.offset ?? 0, 0);

  const [rows, count] = await Promise.all([
    sql<Row[]>`
      SELECT ${sql.unsafe(COLUMNS)} FROM pulsepay_waitlist
      WHERE ${where}
      ORDER BY ${sql.unsafe(order)}
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql<{ n: string }[]>`SELECT count(*)::text AS n FROM pulsepay_waitlist WHERE ${where}`,
  ]);

  return { entries: rows.map(mapRow), total: Number(count[0]?.n ?? 0) };
}

/** Every row matching the filters, for CSV export. Capped so one request cannot exhaust memory. */
export async function exportWaitlist(p: ListParams): Promise<WaitlistEntry[]> {
  const sql = db();
  const where = filters(sql, p);
  const rows = await sql<Row[]>`
    SELECT ${sql.unsafe(COLUMNS)} FROM pulsepay_waitlist
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT 50000
  `;
  return rows.map(mapRow);
}

export async function waitlistStats(): Promise<WaitlistStats> {
  const sql = db();
  const [totals, byStatus, byInterest] = await Promise.all([
    sql<{ total: string; consented: string; unsub: string; week: string }[]>`
      SELECT count(*)::text AS total,
             count(*) FILTER (WHERE consent AND unsubscribed_at IS NULL)::text AS consented,
             count(*) FILTER (WHERE unsubscribed_at IS NOT NULL)::text AS unsub,
             count(*) FILTER (WHERE created_at > now() - interval '7 days')::text AS week
      FROM pulsepay_waitlist
    `,
    sql<{ status: string; n: string }[]>`
      SELECT status, count(*)::text AS n FROM pulsepay_waitlist GROUP BY status
    `,
    sql<{ interest: string; n: string }[]>`
      SELECT unnest(interests) AS interest, count(*)::text AS n
      FROM pulsepay_waitlist GROUP BY 1
    `,
  ]);

  const statusCounts = Object.fromEntries(WAITLIST_STATUSES.map((s) => [s, 0])) as Record<
    WaitlistStatus,
    number
  >;
  for (const r of byStatus) statusCounts[r.status as WaitlistStatus] = Number(r.n);

  const t = totals[0];
  return {
    total: Number(t?.total ?? 0),
    consented: Number(t?.consented ?? 0),
    unsubscribed: Number(t?.unsub ?? 0),
    last7Days: Number(t?.week ?? 0),
    byStatus: statusCounts,
    byInterest: Object.fromEntries(byInterest.map((r) => [r.interest, Number(r.n)])),
  };
}

// ─── Admin: reading and updating one ─────────────────────────────────────────

export async function getWaitlistEntry(id: string): Promise<WaitlistEntry | null> {
  const rows = await db()<Row[]>`
    SELECT ${db().unsafe(COLUMNS)} FROM pulsepay_waitlist WHERE id = ${id}
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export interface WaitlistPatch {
  status?: unknown;
  segment?: unknown;
  notes?: unknown;
  /** `true` records consent now; `false` withdraws it. Only an admin acting on a request. */
  consent?: unknown;
  markContacted?: unknown;
}

/**
 * Applies an administrator's edit. Only the fields present are changed, and each is validated
 * against the same vocabulary the database constraints enforce.
 */
export async function updateWaitlistEntry(
  id: string,
  patch: WaitlistPatch,
): Promise<WaitlistEntry> {
  const sql = db();
  const current = await getWaitlistEntry(id);
  if (!current) throw notFound("That registration");

  let status = current.status;
  if (patch.status !== undefined) {
    if (!(WAITLIST_STATUSES as readonly unknown[]).includes(patch.status)) {
      throw badRequest("That is not a valid status.");
    }
    status = patch.status as WaitlistStatus;
  }

  let segment: WaitlistSegment | null = current.segment;
  if (patch.segment !== undefined) {
    if (patch.segment === null || patch.segment === "") segment = null;
    else if ((WAITLIST_SEGMENTS as readonly unknown[]).includes(patch.segment)) {
      segment = patch.segment as WaitlistSegment;
    } else throw badRequest("That is not a valid category.");
  }

  let notes = current.notes;
  if (patch.notes !== undefined) {
    if (typeof patch.notes !== "string") throw badRequest("Notes must be text.");
    notes = patch.notes.trim().slice(0, 2000);
  }

  // Consent changes are explicit and timestamped. Withdrawing keeps the row, so the person is not
  // silently re-added on their next signup, but stops them ever being notified.
  let consent = current.consent;
  let consentAt = current.consentAt;
  let unsubscribedAt = current.unsubscribedAt;
  if (patch.consent !== undefined) {
    if (typeof patch.consent !== "boolean") throw badRequest("Consent must be true or false.");
    if (patch.consent && !current.consent) {
      consent = true;
      consentAt = new Date().toISOString();
      unsubscribedAt = null;
    } else if (!patch.consent && (current.consent || !current.unsubscribedAt)) {
      consent = false;
      unsubscribedAt = new Date().toISOString();
    }
  }

  const contactedAt =
    patch.markContacted === true ? new Date().toISOString() : current.lastContactedAt;
  // Marking someone contacted from "new" is the obvious next state; do not make the admin do both.
  if (patch.markContacted === true && status === "new" && patch.status === undefined) {
    status = "contacted";
  }

  try {
    const rows = await sql<Row[]>`
      UPDATE pulsepay_waitlist SET
        status = ${status},
        segment = ${segment},
        notes = ${notes},
        consent = ${consent},
        consent_at = ${consentAt},
        unsubscribed_at = ${unsubscribedAt},
        last_contacted_at = ${contactedAt},
        updated_at = now()
      WHERE id = ${id}
      RETURNING ${sql.unsafe(COLUMNS)}
    `;
    return mapRow(rows[0]);
  } catch (error) {
    if (isUniqueViolation(error))
      throw badRequest(`Conflicts with an existing record (${violatedConstraint(error)}).`);
    throw error;
  }
}

/**
 * Permanently removes a registration. For a person asking to be erased; withdrawing consent
 * (which keeps the row) is `updateWaitlistEntry`.
 */
export async function deleteWaitlistEntry(id: string): Promise<WaitlistEntry> {
  const entry = await getWaitlistEntry(id);
  if (!entry) throw notFound("That registration");
  await db()`DELETE FROM pulsepay_waitlist WHERE id = ${id}`;
  return entry;
}

// ─── Launch notifications ────────────────────────────────────────────────────

/**
 * The people who may be told about the launch: consented, not withdrawn, and not already told.
 * This is the only place that decides who is notifiable, so the preview count and the actual
 * send can never disagree.
 */
export async function notifiableRecipients(): Promise<
  { id: string; name: string; email: string }[]
> {
  return db()<{ id: string; name: string; email: string }[]>`
    SELECT id, name, email FROM pulsepay_waitlist
    WHERE consent AND unsubscribed_at IS NULL AND notified_at IS NULL
      AND status <> 'not_interested'
    ORDER BY created_at ASC
  `;
}

export async function markNotified(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db()`
    UPDATE pulsepay_waitlist SET notified_at = now(), updated_at = now()
    WHERE id = ANY(${ids}::uuid[])
  `;
}
