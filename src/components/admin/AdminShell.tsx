/**
 * The Website Manager's application shell: sidebar, top bar, global search and the account menu.
 *
 * Also the authorisation gate. A screen wraps itself in `<AdminShell>` and is therefore guaranteed
 * to render only for a fully authenticated administrator — and only one holding the permission the
 * screen declares. That keeps the check adjacent to the screen it protects instead of in a routing
 * table someone has to remember to update.
 *
 * ## Responsive behaviour
 *
 * Above `lg` the sidebar is a fixed rail. Below it, the same markup becomes an overlay drawer, so
 * there is one navigation implementation rather than a desktop one and a mobile one that drift.
 * The drawer closes on navigation, because leaving it open over the page someone just chose is a
 * classic mobile-admin annoyance.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import * as icons from "lucide-react";
import {
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  Search,
  ShieldAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { insights, CmsError } from "@/lib/cms/admin-client";
import type { SearchHit } from "@/lib/cms/types";
import { ROLE_META, type Permission } from "@/lib/cms/permissions";
import { useAdmin } from "./AdminContext";
import { NAV_ENTRIES, NAV_GROUPS, activeEntry, groupFor } from "./navigation";
import { Button, EmptyState, Spinner, StatusPill } from "./primitives";
import { AdminAuthScreen } from "./AdminAuthScreen";

/**
 * Resolves a lucide icon by name.
 *
 * The navigation map stores names as strings so it can stay a plain data module. An unknown name
 * degrades to a neutral glyph rather than crashing the shell.
 */
function iconByName(name: string): LucideIcon {
  const registry = icons as unknown as Record<string, LucideIcon>;
  return registry[name] ?? icons.Circle;
}

// ─── Global search ───────────────────────────────────────────────────────────

const HIT_ICONS: Record<SearchHit["type"], string> = {
  content: "FileText",
  page: "Files",
  section: "LayoutTemplate",
  media: "Image",
  admin: "Users",
};

/**
 * Command palette: global search plus direct navigation.
 *
 * Opens on `⌘K` / `Ctrl+K`. Typing fewer than two characters lists navigation destinations, which
 * makes the palette useful as a keyboard router even when not searching for content. Two or more
 * characters queries the API.
 *
 * Results are debounced at 200 ms — long enough that typing a word is one request rather than five,
 * short enough to feel immediate.
 */
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { can } = useAdmin();
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navMatches = useMemo(() => {
    const query = term.trim().toLowerCase();
    const visible = NAV_ENTRIES.filter((entry) => !entry.permission || can(entry.permission));
    if (!query) return visible.slice(0, 8);
    return visible
      .filter(
        (entry) =>
          entry.label.toLowerCase().includes(query) ||
          entry.description?.toLowerCase().includes(query) ||
          entry.keywords?.some((keyword) => keyword.includes(query)),
      )
      .slice(0, 6);
  }, [term, can]);

  useEffect(() => {
    if (open) {
      setTerm("");
      setHits([]);
      setCursor(0);
      // A frame's delay: the input does not exist until after the dialog paints.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      insights
        .search(query, 20)
        .then((result) => {
          if (!cancelled) setHits(result.results);
        })
        .catch(() => {
          if (!cancelled) setHits([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  // One flat list so arrow keys move through navigation and results continuously.
  const options = useMemo(
    () => [
      ...navMatches.map((entry) => ({ kind: "nav" as const, entry })),
      ...hits.map((hit) => ({ kind: "hit" as const, hit })),
    ],
    [navMatches, hits],
  );

  useEffect(() => {
    setCursor(0);
  }, [options.length]);

  if (!open) return null;

  const go = (to: string) => {
    onClose();
    void navigate({ to });
  };

  const activate = (index: number) => {
    const option = options[index];
    if (!option) return;
    go(option.kind === "nav" ? option.entry.to : option.hit.href);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 px-4 pt-[10vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search the Website Manager"
      onClick={onClose}
    >
      <div
        className="border-border bg-card w-full max-w-xl overflow-hidden rounded-xl border shadow-[0_24px_48px_-12px_rgba(17,24,39,0.32)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-border flex items-center gap-3 border-b px-4">
          <Search className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setCursor((current) => Math.min(current + 1, options.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setCursor((current) => Math.max(current - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                activate(cursor);
              } else if (event.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search content, pages, sections and media…"
            aria-label="Search"
            className="text-foreground placeholder:text-muted-foreground/60 h-12 w-full bg-transparent text-[14px] outline-none"
          />
          {loading && <Spinner />}
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {options.length === 0 ? (
            <p className="text-muted-foreground px-3 py-8 text-center text-[13px]">
              {term.trim().length < 2
                ? "Type at least two characters to search."
                : `Nothing matches "${term.trim()}".`}
            </p>
          ) : (
            <ul>
              {options.map((option, index) => {
                const selected = index === cursor;
                const Icon = iconByName(
                  option.kind === "nav" ? option.entry.icon : HIT_ICONS[option.hit.type],
                );
                const label = option.kind === "nav" ? option.entry.label : option.hit.title;
                const detail =
                  option.kind === "nav" ? option.entry.description : option.hit.subtitle;

                return (
                  <li
                    key={
                      option.kind === "nav"
                        ? option.entry.to
                        : `${option.hit.type}-${option.hit.id}`
                    }
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(index)}
                      onClick={() => activate(index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                        selected ? "bg-secondary" : "hover:bg-secondary/60",
                      )}
                    >
                      <span className="bg-secondary text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground block truncate text-[13px] font-medium">
                          {label}
                        </span>
                        {detail && (
                          <span className="text-muted-foreground block truncate text-[11.5px]">
                            {detail}
                          </span>
                        )}
                      </span>
                      {option.kind === "hit" && (
                        <span className="text-muted-foreground shrink-0 text-[10.5px] font-semibold tracking-wide uppercase">
                          {option.hit.kind}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-border bg-secondary text-muted-foreground flex items-center gap-4 border-t px-4 py-2 text-[11px]">
          <span>
            <kbd className="border-border bg-card rounded border px-1 py-0.5 font-sans">↑↓</kbd> to
            navigate
          </span>
          <span>
            <kbd className="border-border bg-card rounded border px-1 py-0.5 font-sans">↵</kbd> to
            open
          </span>
          <span>
            <kbd className="border-border bg-card rounded border px-1 py-0.5 font-sans">esc</kbd> to
            close
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { can } = useAdmin();
  const current = activeEntry(pathname);

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Website Manager">
      {NAV_GROUPS.map((group) => {
        const entries = group.entries.filter((entry) => !entry.permission || can(entry.permission));
        // A group whose every entry is hidden leaves no empty heading behind.
        if (entries.length === 0) return null;

        return (
          <div key={group.label}>
            <p className="text-muted-foreground/70 mb-1.5 px-2 text-[10px] font-bold tracking-[0.14em] uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {entries.map((entry) => {
                const Icon = iconByName(entry.icon);
                const active = current?.to === entry.to;

                return (
                  <li key={entry.to}>
                    <Link
                      to={entry.to}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-primary/[0.08] text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")}
                        aria-hidden="true"
                      />
                      <span className="truncate">{entry.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/admin" className="flex items-center gap-2.5 px-4 py-4">
      <span className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold">
        E
      </span>
      <span className="min-w-0">
        <span className="text-foreground block truncate text-[13px] leading-tight font-bold tracking-tight">
          ENICE
        </span>
        <span className="text-muted-foreground block truncate text-[10.5px] leading-tight">
          Website Manager
        </span>
      </span>
    </Link>
  );
}

// ─── Account menu ────────────────────────────────────────────────────────────

function AccountMenu() {
  const { identity, signOut } = useAdmin();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Closed on any outside click or Escape. Without this the menu stays open behind whatever the
  // user clicks next, which reads as a stuck overlay.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!identity) return null;

  const initials =
    identity.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || identity.email[0]?.toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="hover:bg-secondary flex items-center gap-2 rounded-md p-1 pr-2 transition-colors"
      >
        {identity.avatarUrl ? (
          <img src={identity.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="bg-primary/[0.1] text-primary flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold">
            {initials}
          </span>
        )}
        <span className="hidden min-w-0 text-left sm:block">
          <span className="text-foreground block max-w-[10rem] truncate text-[12px] leading-tight font-semibold">
            {identity.name || identity.email}
          </span>
          <span className="text-muted-foreground block text-[10.5px] leading-tight">
            {ROLE_META[identity.role].label}
          </span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="border-border bg-card absolute right-0 z-50 mt-1.5 w-64 overflow-hidden rounded-xl border shadow-[0_12px_32px_-8px_rgba(17,24,39,0.24)]"
        >
          <div className="border-border border-b px-4 py-3">
            <p className="text-foreground truncate text-[13px] font-semibold">
              {identity.name || "Administrator"}
            </p>
            <p className="text-muted-foreground truncate text-[11.5px]">{identity.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <StatusPill tone="info" dot={false}>
                {ROLE_META[identity.role].label}
              </StatusPill>
              {identity.twoFactorEnabled ? (
                <StatusPill tone="success" dot={false}>
                  2FA on
                </StatusPill>
              ) : (
                <StatusPill tone="warning" dot={false}>
                  2FA off
                </StatusPill>
              )}
            </div>
          </div>

          <div className="p-1">
            <Link
              to="/admin/administration/settings"
              onClick={() => setOpen(false)}
              className="text-foreground hover:bg-secondary flex items-center gap-2 rounded-md px-3 py-2 text-[12.5px] transition-colors"
              role="menuitem"
            >
              <icons.Settings className="h-3.5 w-3.5" aria-hidden="true" />
              Account settings
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:bg-secondary flex items-center gap-2 rounded-md px-3 py-2 text-[12.5px] transition-colors"
              role="menuitem"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              View the website
            </a>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="text-destructive hover:bg-destructive/5 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12.5px] transition-colors"
              role="menuitem"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

export interface AdminShellProps {
  children: ReactNode;
  /** Screens declare what they require; the shell refuses to render without it. */
  requiredPermission?: Permission;
}

export function AdminShell({ children, requiredPermission }: AdminShellProps) {
  const { phase, can, config } = useAdmin();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K / Ctrl+K anywhere in the panel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // The drawer must not survive a navigation on small screens.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Anything other than a full session is handled by the auth screen — including the "not
  // configured" case, which is a deployment problem rather than a credentials one.
  if (phase !== "authenticated") return <AdminAuthScreen />;

  const current = activeEntry(pathname);
  const group = groupFor(current);

  if (requiredPermission && !can(requiredPermission)) {
    return (
      <ShellFrame
        pathname={pathname}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        setPaletteOpen={setPaletteOpen}
        breadcrumb={null}
      >
        <EmptyState
          icon={ShieldAlert}
          title="You do not have access to this area"
          description="Your role does not include this permission. An Owner can change that under Administration → Administrators."
          action={
            <Button variant="outline" onClick={() => window.history.back()}>
              Go back
            </Button>
          }
        />
      </ShellFrame>
    );
  }

  return (
    <>
      <ShellFrame
        pathname={pathname}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        setPaletteOpen={setPaletteOpen}
        breadcrumb={
          current && group ? (
            <nav
              aria-label="Breadcrumb"
              className="text-muted-foreground flex items-center gap-1.5 text-[12px]"
            >
              <span>{group}</span>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <span className="text-foreground font-medium">{current.label}</span>
            </nav>
          ) : null
        }
        showStorageWarning={!config.mediaStorageConfigured}
      >
        {children}
      </ShellFrame>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

function ShellFrame({
  children,
  pathname,
  drawerOpen,
  setDrawerOpen,
  setPaletteOpen,
  breadcrumb,
  showStorageWarning = false,
}: {
  children: ReactNode;
  pathname: string;
  drawerOpen: boolean;
  setDrawerOpen: (next: boolean) => void;
  setPaletteOpen: (next: boolean) => void;
  breadcrumb: ReactNode;
  showStorageWarning?: boolean;
}) {
  return (
    <div className="bg-background min-h-dvh">
      {/* Desktop rail */}
      <aside className="border-border bg-sidebar fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r lg:flex">
        <Brand />
        <SidebarNav pathname={pathname} />
        <div className="border-border border-t px-4 py-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-[12px] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            enicehq.com
          </a>
        </div>
      </aside>

      {/* Mobile drawer — same nav component, different container. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="border-border bg-sidebar absolute inset-y-0 left-0 flex w-64 flex-col border-r"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="flex items-center justify-between pr-2">
              <Brand />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="text-muted-foreground hover:text-foreground rounded-md p-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="border-border bg-background/85 sticky top-0 z-30 border-b backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className="text-muted-foreground hover:text-foreground -ml-1 rounded-md p-2 lg:hidden"
            >
              <Menu className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            <div className="hidden min-w-0 flex-1 lg:block">{breadcrumb}</div>

            {/* Presented as a button rather than an input: it opens the palette, and a fake input
                that does not accept typing in place is worse than an honest control. */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="border-border bg-secondary/60 text-muted-foreground hover:bg-secondary ml-auto flex h-8 items-center gap-2 rounded-md border px-2.5 text-[12px] transition-colors"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="border-border bg-card ml-1 hidden rounded border px-1 py-0.5 text-[10px] font-sans sm:inline">
                ⌘K
              </kbd>
            </button>

            <AccountMenu />
          </div>

          {showStorageWarning && (
            <div className="border-t border-amber-200 bg-amber-50/70 px-4 py-1.5 text-[11.5px] text-amber-900 sm:px-6">
              Media storage is not configured, so uploads are unavailable. Set the{" "}
              <code className="font-mono">MEDIA_S3_*</code> environment variables to enable the
              media library.
            </div>
          )}
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

/**
 * Turns an API failure into a message worth showing.
 *
 * Centralised so every screen phrases the same failure the same way, and so the two cases that need
 * different handling — an expired session and a missing permission — are never mistaken for a
 * generic error.
 */
export function describeError(error: unknown): string {
  if (error instanceof CmsError) {
    if (error.isUnauthenticated) return "Your session expired. Reload the page and sign in again.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
