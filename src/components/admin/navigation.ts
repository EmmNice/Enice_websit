/**
 * The Website Manager's navigation map.
 *
 * Kept as data rather than JSX so three consumers can share one definition: the sidebar, the
 * command palette, and the breadcrumb builder. A route added here appears in all three at once,
 * which is what stops the palette from drifting out of step with the sidebar.
 *
 * Each item declares the permission required to see it. The sidebar filters on that, so an Editor
 * signing in simply does not see Administration — rather than seeing it and being refused, which
 * reads as a broken tool.
 */

import type { Permission } from "@/lib/cms/permissions";

export interface NavEntry {
  label: string;
  /** Concrete admin path. */
  to: string;
  /** Lucide icon name, resolved by the sidebar. */
  icon: string;
  /** Hidden unless the administrator holds this. */
  permission?: Permission;
  /** Extra terms the command palette should match on. */
  keywords?: string[];
  /** Shown in the palette under the label. */
  description?: string;
  /**
   * Treat a deeper path as this item being active. Needed because an editor screen lives at
   * `/admin/content/blog/<id>` and the sidebar entry is `/admin/content/blog`.
   */
  matchPrefix?: boolean;
}

export interface NavGroup {
  label: string;
  entries: NavEntry[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    entries: [
      {
        label: "Dashboard",
        to: "/admin",
        icon: "LayoutDashboard",
        description: "Publishing activity and what is queued to go out",
        keywords: ["home", "overview", "start"],
      },
    ],
  },
  {
    label: "Content",
    entries: [
      {
        label: "Blog",
        to: "/admin/content/blog",
        icon: "FileText",
        permission: "content.read",
        matchPrefix: true,
        description: "Long-form articles",
        keywords: ["post", "article", "write"],
      },
      {
        label: "Announcements",
        to: "/admin/content/announcements",
        icon: "Megaphone",
        permission: "content.read",
        matchPrefix: true,
        description: "Company and product announcements",
        keywords: ["notice", "launch"],
      },
      {
        label: "Updates",
        to: "/admin/content/updates",
        icon: "Zap",
        permission: "content.read",
        matchPrefix: true,
        description: "Short notices about new services and features",
        keywords: ["changelog", "small"],
      },
      {
        label: "News",
        to: "/admin/content/news",
        icon: "Newspaper",
        permission: "content.read",
        matchPrefix: true,
        description: "News feed and company changelog",
        keywords: ["press", "milestone"],
      },
    ],
  },
  {
    label: "AI training",
    entries: [
      {
        label: "Assistant knowledge",
        to: "/admin/knowledge",
        icon: "Sparkles",
        permission: "ai.knowledge.read",
        matchPrefix: true,
        description: "Notes the assistant is trained on",
        keywords: ["ai", "training", "knowledge", "assistant", "chatbot", "notes"],
      },
    ],
  },
  {
    label: "Account",
    entries: [
      {
        label: "Settings",
        to: "/admin/administration/settings",
        icon: "Settings",
        description: "Your profile, password, two-factor authentication and sessions",
        keywords: ["account", "password", "2fa", "profile", "security", "sign out"],
      },
    ],
  },
];

/** Every entry, flattened. Backs the command palette and breadcrumbs. */
export const NAV_ENTRIES: NavEntry[] = NAV_GROUPS.flatMap((group) => group.entries);

/**
 * Finds the navigation entry a pathname belongs to.
 *
 * The longest match wins, so `/admin/content/blog/abc` resolves to Blog rather than to Dashboard —
 * `/admin` is a prefix of everything and would otherwise always win.
 */
export function activeEntry(pathname: string): NavEntry | null {
  let best: NavEntry | null = null;

  for (const entry of NAV_ENTRIES) {
    const matches =
      entry.to === pathname || (entry.matchPrefix && pathname.startsWith(`${entry.to}/`));
    if (!matches) continue;
    if (!best || entry.to.length > best.to.length) best = entry;
  }

  // `/admin` only matches exactly; as a prefix it would shadow every child route.
  if (!best && pathname === "/admin") return NAV_ENTRIES[0];
  return best;
}

/** The group an entry sits in, for the breadcrumb's first segment. */
export function groupFor(entry: NavEntry | null): string | null {
  if (!entry) return null;
  return NAV_GROUPS.find((group) => group.entries.includes(entry))?.label ?? null;
}
