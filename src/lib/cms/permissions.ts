/**
 * Roles and permissions for the ENICE Website Manager.
 *
 * Authorisation is expressed as capabilities, not as role checks scattered through the code.
 * Every guard asks `can(role, "content.publish")` rather than `role === "owner"`, which is
 * what makes the system extensible: a new role is one entry in `ROLE_PERMISSIONS`, and no
 * call site changes.
 *
 * The same table is used on both sides of the API. The server enforces it — that is the only
 * enforcement that matters — and the admin panel reads it to hide controls the current
 * administrator cannot use, so the UI never offers an action that will be refused.
 */

// ─── Roles ───────────────────────────────────────────────────────────────────

/** Ordered from most to least privileged. Order is used for "can manage this admin" checks. */
export const ADMIN_ROLES = ["owner", "administrator", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface RoleMeta {
  label: string;
  description: string;
  /** Lower ranks outrank higher numbers. Used to stop an admin editing a peer or superior. */
  rank: number;
}

export const ROLE_META: Record<AdminRole, RoleMeta> = {
  owner: {
    label: "Owner",
    description:
      "Complete control, including administrators, critical website settings and deploying code changes.",
    rank: 0,
  },
  administrator: {
    label: "Administrator",
    description:
      "Manages all website content, pages, sections, media and design. Can approve AI changes but cannot deploy code or manage administrators.",
    rank: 1,
  },
  editor: {
    label: "Editor",
    description:
      "Writes and publishes blog posts, news, announcements and updates, and manages media. Cannot change website settings or deploy.",
    rank: 2,
  },
};

// ─── Permissions ─────────────────────────────────────────────────────────────

/**
 * Every capability in the system. Grouped by area, and named `<area>.<verb>` so a missing
 * grant reads clearly in an error message.
 */
export const PERMISSIONS = [
  // Editorial content: blog, announcements, updates, news.
  "content.read",
  "content.write",
  "content.publish",
  "content.delete",

  // Pages and website sections.
  "pages.read",
  "pages.write",
  "pages.publish",
  "pages.delete",
  "sections.read",
  "sections.write",

  // Media library.
  "media.read",
  "media.write",
  "media.delete",

  // Navigation, footer, SEO defaults, design controls, site settings.
  "settings.read",
  "settings.write",
  "design.write",

  // AI Website Manager.
  "ai.read",
  "ai.request",
  "ai.approve",
  "ai.deploy",

  // AI assistant knowledge base (what the public chatbot is trained on).
  "ai.knowledge.read",
  "ai.knowledge.write",

  // Administration.
  "admins.read",
  "admins.write",
  "activity.read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export interface PermissionMeta {
  label: string;
  group: string;
  /** Flagged capabilities get an extra confirmation step in the UI. */
  sensitive?: boolean;
}

export const PERMISSION_META: Record<Permission, PermissionMeta> = {
  "content.read": { label: "View content", group: "Content" },
  "content.write": { label: "Create and edit content", group: "Content" },
  "content.publish": { label: "Publish, schedule and archive content", group: "Content" },
  "content.delete": { label: "Delete content", group: "Content", sensitive: true },

  "pages.read": { label: "View pages", group: "Website" },
  "pages.write": { label: "Create and edit pages", group: "Website" },
  "pages.publish": { label: "Publish and unpublish pages", group: "Website" },
  "pages.delete": { label: "Delete pages", group: "Website", sensitive: true },
  "sections.read": { label: "View website sections", group: "Website" },
  "sections.write": { label: "Edit website sections", group: "Website" },

  "media.read": { label: "View media", group: "Media" },
  "media.write": { label: "Upload and rename media", group: "Media" },
  "media.delete": { label: "Delete media", group: "Media", sensitive: true },

  "settings.read": { label: "View website settings", group: "Configuration" },
  "settings.write": {
    label: "Change navigation, footer and SEO defaults",
    group: "Configuration",
    sensitive: true,
  },
  "design.write": { label: "Change logo, palette and typography", group: "Configuration" },

  "ai.read": { label: "View AI change requests", group: "AI" },
  "ai.request": { label: "Ask the AI for website changes", group: "AI" },
  "ai.approve": { label: "Approve AI proposals", group: "AI", sensitive: true },
  "ai.deploy": { label: "Deploy approved code changes", group: "AI", sensitive: true },
  "ai.knowledge.read": { label: "View the assistant knowledge base", group: "AI" },
  "ai.knowledge.write": {
    label: "Edit what the assistant knows (incl. uploading PDFs)",
    group: "AI",
    sensitive: true,
  },

  "admins.read": { label: "View administrators", group: "Administration" },
  "admins.write": {
    label: "Invite and manage administrators",
    group: "Administration",
    sensitive: true,
  },
  "activity.read": { label: "View the activity log", group: "Administration" },
};

// ─── Role → permission matrix ────────────────────────────────────────────────

/**
 * The authoritative grant table.
 *
 * `owner` is spread from `PERMISSIONS` rather than listed by hand, so a newly added
 * capability is never silently withheld from the account that is supposed to have all of
 * them. Every other role is an explicit allowlist: a new permission defaults to denied,
 * which is the safe direction to fail.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  owner: PERMISSIONS,

  administrator: [
    "content.read",
    "content.write",
    "content.publish",
    "content.delete",
    "pages.read",
    "pages.write",
    "pages.publish",
    "sections.read",
    "sections.write",
    "media.read",
    "media.write",
    "media.delete",
    "settings.read",
    "settings.write",
    "design.write",
    "ai.read",
    "ai.request",
    "ai.approve",
    "ai.knowledge.read",
    "ai.knowledge.write",
    "admins.read",
    "activity.read",
  ],

  editor: [
    "content.read",
    "content.write",
    "content.publish",
    "pages.read",
    "sections.read",
    "media.read",
    "media.write",
    "settings.read",
    "ai.read",
    "ai.request",
    "activity.read",
  ],
};

// ─── Checks ──────────────────────────────────────────────────────────────────

/** Whether a role holds a capability. The single question every guard should ask. */
export function can(role: AdminRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const granted = ROLE_PERMISSIONS[role];
  return granted ? granted.includes(permission) : false;
}

/** Whether a role holds every listed capability. */
export function canAll(role: AdminRole | null | undefined, permissions: Permission[]): boolean {
  return permissions.every((permission) => can(role, permission));
}

/** Whether a role holds at least one of the listed capabilities. */
export function canAny(role: AdminRole | null | undefined, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(role, permission));
}

/**
 * Whether `actor` may modify or remove an administrator holding `target`.
 *
 * Beyond the `admins.write` grant, an administrator may only act on strictly lower-ranked
 * roles. Without this an owner could be demoted by another owner, and the last privileged
 * account could be locked out of its own system.
 */
export function canManageRole(actor: AdminRole, target: AdminRole): boolean {
  if (!can(actor, "admins.write")) return false;
  return ROLE_META[actor].rank < ROLE_META[target].rank;
}

/** Roles an actor is allowed to assign — never at or above their own rank. */
export function assignableRoles(actor: AdminRole): AdminRole[] {
  return ADMIN_ROLES.filter((role) => ROLE_META[role].rank > ROLE_META[actor].rank);
}

/** Permissions grouped for display on the Roles screen. */
export function permissionsByGroup(): { group: string; permissions: Permission[] }[] {
  const groups = new Map<string, Permission[]>();
  for (const permission of PERMISSIONS) {
    const { group } = PERMISSION_META[permission];
    const list = groups.get(group);
    if (list) list.push(permission);
    else groups.set(group, [permission]);
  }
  return Array.from(groups, ([group, permissions]) => ({ group, permissions }));
}
