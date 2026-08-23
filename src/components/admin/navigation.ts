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
        description: "Publishing activity and website status",
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
    label: "Website",
    entries: [
      {
        label: "Pages",
        to: "/admin/website/pages",
        icon: "Files",
        permission: "pages.read",
        matchPrefix: true,
        description: "Create and manage website pages",
      },
      {
        label: "Sections",
        to: "/admin/website/sections",
        icon: "LayoutTemplate",
        permission: "sections.read",
        matchPrefix: true,
        description: "Hero, statistics, partners, FAQ and other bands",
        keywords: ["hero", "block", "band"],
      },
      {
        label: "Navigation",
        to: "/admin/website/navigation",
        icon: "Menu",
        permission: "settings.read",
        description: "Header links and the primary call to action",
        keywords: ["header", "menu", "nav"],
      },
      {
        label: "Footer",
        to: "/admin/website/footer",
        icon: "PanelBottom",
        permission: "settings.read",
        description: "Footer columns, tagline and copyright",
      },
      {
        label: "SEO",
        to: "/admin/website/seo",
        icon: "Search",
        permission: "settings.read",
        description: "Site-wide metadata defaults and indexing",
        keywords: ["meta", "google", "robots", "sitemap"],
      },
      {
        label: "Design",
        to: "/admin/website/design",
        icon: "Palette",
        permission: "settings.read",
        description: "Logo, favicon, brand palette and typography",
        keywords: ["brand", "logo", "colour", "color", "font"],
      },
    ],
  },
  {
    label: "Media",
    entries: [
      {
        label: "Media Library",
        to: "/admin/media",
        icon: "Image",
        permission: "media.read",
        matchPrefix: true,
        description: "Images, video and documents",
        keywords: ["upload", "file", "asset", "photo"],
      },
    ],
  },
  {
    label: "AI",
    entries: [
      {
        label: "AI Website Manager",
        to: "/admin/ai",
        icon: "Sparkles",
        permission: "ai.read",
        matchPrefix: true,
        description: "Ask for larger website changes and review proposals",
        keywords: ["assistant", "generate", "propose"],
      },
      {
        label: "Assistant knowledge",
        to: "/admin/knowledge",
        icon: "BookOpen",
        permission: "ai.knowledge.read",
        matchPrefix: true,
        description: "Teach the website chatbot facts and upload PDFs",
        keywords: ["chatbot", "train", "knowledge base", "pdf", "faq", "context"],
      },
    ],
  },
  {
    label: "Publishing",
    entries: [
      {
        label: "Drafts",
        to: "/admin/publishing/drafts",
        icon: "PencilLine",
        permission: "content.read",
        description: "Everything not yet visible publicly",
      },
      {
        label: "Scheduled",
        to: "/admin/publishing/scheduled",
        icon: "CalendarClock",
        permission: "content.read",
        description: "Waiting to publish automatically",
      },
      {
        label: "Published",
        to: "/admin/publishing/published",
        icon: "Globe",
        permission: "content.read",
        description: "Live on the ENICE website",
      },
      {
        label: "Archived",
        to: "/admin/publishing/archived",
        icon: "Archive",
        permission: "content.read",
        description: "Removed from the website but kept on record",
      },
    ],
  },
  {
    label: "Administration",
    entries: [
      {
        label: "Administrators",
        to: "/admin/administration/admins",
        icon: "Users",
        permission: "admins.read",
        description: "Invite and manage who can sign in",
        keywords: ["team", "user", "invite", "people"],
      },
      {
        label: "Roles",
        to: "/admin/administration/roles",
        icon: "ShieldCheck",
        permission: "admins.read",
        description: "What each role is permitted to do",
        keywords: ["permission", "access"],
      },
      {
        label: "Activity",
        to: "/admin/administration/activity",
        icon: "ScrollText",
        permission: "activity.read",
        description: "Audit log of every change",
        keywords: ["audit", "log", "history"],
      },
      {
        label: "Settings",
        to: "/admin/administration/settings",
        icon: "Settings",
        description: "Your account, two-factor authentication and sessions",
        keywords: ["account", "password", "2fa", "profile", "security"],
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
