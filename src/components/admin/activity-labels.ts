/**
 * Human-readable phrasing for audit-log actions.
 *
 * The log stores machine-readable action keys (`content.published`), which are right for filtering
 * and wrong for reading. This maps each to a verb phrase that completes the sentence
 * "{actor} {phrase} {entity}" — so an entry renders as "Ada published Owning our platform" rather
 * than "Ada content.published Owning our platform".
 *
 * Kept beside the components that render it, and typed against `ActivityAction`, so adding an
 * action to the closed list in `src/lib/cms/types.ts` without giving it a phrase is a type error
 * rather than a raw key leaking into the interface.
 */

import type { ActivityAction } from "@/lib/cms/types";

export const ACTIVITY_LABELS: Record<ActivityAction, string> = {
  "login.success": "signed in",
  "login.failed": "failed to sign in",
  "login.locked": "was locked out after repeated failures",
  logout: "signed out",
  "logout.all": "signed out of all other devices",
  "twofactor.enabled": "turned on two-factor authentication",
  "twofactor.disabled": "turned off two-factor authentication",
  "password.changed": "changed a password",

  "content.created": "created",
  "content.updated": "edited",
  "content.published": "published",
  "content.scheduled": "scheduled",
  "content.unpublished": "unpublished",
  "content.archived": "archived",
  "content.restored": "restored",
  "content.duplicated": "duplicated",
  "content.deleted": "deleted",

  "page.created": "created the page",
  "page.updated": "edited the page",
  "page.published": "published the page",
  "page.unpublished": "unpublished the page",
  "page.archived": "archived the page",
  "page.deleted": "deleted the page",

  "section.updated": "edited the section",
  "settings.updated": "changed website settings",
  "design.updated": "changed the design settings",

  "media.uploaded": "uploaded",
  "media.updated": "renamed",
  "media.deleted": "deleted the file",

  "admin.invited": "invited",
  "admin.updated": "updated the administrator",
  "admin.suspended": "suspended",
  "admin.removed": "removed",

  "ai.requested": "asked the AI for",
  "ai.proposed": "received an AI proposal for",
  "ai.approved": "approved the AI change",
  "ai.rejected": "rejected the AI change",
  "ai.applied": "applied the AI change",
  "ai.deployed": "opened a pull request for",
};

/**
 * Groups actions for the activity screen's filter.
 *
 * Grouped rather than a flat list of forty options: "Show me security events" is a question people
 * actually ask, and "Show me content.unpublished" is not.
 */
export const ACTIVITY_FILTER_GROUPS: { label: string; actions: ActivityAction[] }[] = [
  {
    label: "Security and sign-in",
    actions: [
      "login.success",
      "login.failed",
      "login.locked",
      "logout",
      "logout.all",
      "twofactor.enabled",
      "twofactor.disabled",
      "password.changed",
    ],
  },
  {
    label: "Content",
    actions: [
      "content.created",
      "content.updated",
      "content.published",
      "content.scheduled",
      "content.unpublished",
      "content.archived",
      "content.restored",
      "content.duplicated",
      "content.deleted",
    ],
  },
  {
    label: "Website",
    actions: [
      "page.created",
      "page.updated",
      "page.published",
      "page.unpublished",
      "page.archived",
      "page.deleted",
      "section.updated",
      "settings.updated",
      "design.updated",
    ],
  },
  { label: "Media", actions: ["media.uploaded", "media.updated", "media.deleted"] },
  {
    label: "Administration",
    actions: ["admin.invited", "admin.updated", "admin.suspended", "admin.removed"],
  },
  {
    label: "AI Website Manager",
    actions: [
      "ai.requested",
      "ai.proposed",
      "ai.approved",
      "ai.rejected",
      "ai.applied",
      "ai.deployed",
    ],
  },
];

/** Actions worth colouring as a warning or a failure in the log. */
export const ACTIVITY_TONE: Partial<Record<ActivityAction, "danger" | "warning">> = {
  "login.failed": "warning",
  "login.locked": "danger",
  "content.deleted": "danger",
  "page.deleted": "danger",
  "media.deleted": "warning",
  "admin.removed": "danger",
  "admin.suspended": "warning",
  "twofactor.disabled": "warning",
  "ai.rejected": "warning",
};
