/**
 * CSV export for the PulsePay waitlist.
 *
 * Two things matter here beyond joining strings with commas.
 *
 * 1. Quoting. A name or a note can contain commas, quotes and newlines; every cell is quoted and
 *    internal quotes doubled, so a row can never spill into the next one.
 *
 * 2. Formula injection. A cell that begins with `=`, `+`, `-` or `@` is executed as a formula when
 *    the file is opened in Excel or Sheets. The values here are typed by the public, so a
 *    registration named `=HYPERLINK(...)` would run on an administrator's machine. Such cells are
 *    prefixed with a single quote, which spreadsheets treat as "this is text". Phone numbers
 *    begin with `+` legitimately, so they are written in a form that stays text after the guard.
 */

import type { WaitlistEntry } from "../../src/lib/waitlist";
import { interestLabel, WAITLIST_STATUS_LABEL } from "../../src/lib/waitlist";

const HEADERS = [
  "Name",
  "Email",
  "Phone",
  "Interests",
  "Category",
  "Status",
  "Consent to contact",
  "Consent given",
  "Unsubscribed",
  "Registered",
  "Last contacted",
  "Launch notified",
  "Source",
  "Notes",
];

/** Neutralises a leading formula character, then quotes the cell. */
export function csvCell(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export function waitlistCsv(entries: WaitlistEntry[]): string {
  const rows = entries.map((e) =>
    [
      e.name,
      e.email,
      e.phone,
      e.interests.map(interestLabel).join("; "),
      e.segment ?? "",
      WAITLIST_STATUS_LABEL[e.status],
      e.consent && !e.unsubscribedAt ? "Yes" : "No",
      e.consentAt ?? "",
      e.unsubscribedAt ?? "",
      e.createdAt,
      e.lastContactedAt ?? "",
      e.notifiedAt ?? "",
      e.source,
      e.notes,
    ]
      .map(csvCell)
      .join(","),
  );
  // A BOM so Excel reads the file as UTF-8 and names with accents are not mangled.
  return `\uFEFF${[HEADERS.map(csvCell).join(","), ...rows].join("\r\n")}\r\n`;
}
