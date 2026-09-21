import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import {
  NAV_CTA,
  NAV_ENTRIES,
  isGroup,
  isLeaf,
  navFromCms,
  type NavEntry,
  type NavGroup,
  type NavItem,
} from "./navigation";
import { useSiteChrome } from "@/lib/cms/use-chrome";

/**
 * The site header.
 *
 * ## Navigation
 *
 * Renders from `navigation.ts`, so the desktop menus and the mobile drawer cannot disagree.
 * Grouped entries open a panel; flat entries are plain links. "Home" is intentionally absent —
 * the wordmark is the home link, which is the convention every visitor already knows and buys
 * back space for the pages that were previously footer-only.
 *
 * ## Accessibility
 *
 * The previous drawer was a `div` with `aria-hidden` toggled on it: no dialog semantics, no
 * Escape, no focus containment, and focus could tab into the page behind the scrim. Both the
 * desktop menus and the drawer now expose real state (`aria-expanded`, `aria-controls`), close on
 * Escape, restore focus to whatever opened them, and the drawer traps Tab while it is open.
 *
 * Menus open on click rather than hover. Hover-only menus are unusable by keyboard and hostile on
 * touch, and a pointer crossing the header should not fire navigation UI.
 */
export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  /*
   * Navigation comes from Website → Navigation when the CMS answers, and from the built-in IA
   * until it does. `navFromCms` returns null for an empty or unusable list, so a misconfigured
   * settings document leaves the site navigable rather than blank.
   */
  const { header } = useSiteChrome();
  const entries: NavEntry[] = useMemo(() => navFromCms(header?.items) ?? NAV_ENTRIES, [header]);
  const cta =
    header && header.showCta === false
      ? null
      : {
          label: header?.ctaLabel?.trim() || NAV_CTA.label,
          to: header?.ctaUrl?.trim() || NAV_CTA.to,
        };

  // Lift the header onto a stronger surface once the page has moved beneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation dismisses whatever is open. Without this a menu survives the route change
  // that its own link triggered.
  useEffect(() => {
    setOpenMenu(null);
    setDrawerOpen(false);
  }, [pathname]);

  // Escape closes the topmost layer; a click outside the nav closes the desktop menus.
  useEffect(() => {
    if (!openMenu) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openMenu]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-colors duration-300",
          scrolled
            ? "border-border bg-background/85 backdrop-blur-xl"
            : "border-transparent bg-background/60 backdrop-blur-sm",
        )}
      >
        <div ref={navRef} className="page-shell flex h-16 items-center justify-between gap-6">
          <Logo />

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {entries.map((entry) =>
              isGroup(entry) ? (
                <MenuButton
                  key={entry.label}
                  group={entry}
                  open={openMenu === entry.label}
                  onToggle={() => setOpenMenu((cur) => (cur === entry.label ? null : entry.label))}
                  onClose={() => setOpenMenu(null)}
                  active={isGroupActive(entry, pathname)}
                />
              ) : (
                <Link
                  key={entry.label}
                  to={entry.to as "/"}
                  className={cn(
                    "rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors",
                    "text-bone-strong hover:bg-surface-2 hover:text-foreground",
                    "[&.active]:text-foreground",
                  )}
                  activeProps={{ className: "active" }}
                >
                  {entry.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            {cta && (
              <Link
                to={cta.to as "/"}
                className="btn btn-primary btn-sm group hidden lg:inline-flex"
                data-cta="header"
              >
                {cta.label}
                <ArrowUpRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
                />
              </Link>
            )}

            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="site-mobile-nav"
              onClick={() => setDrawerOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-md border border-border text-foreground transition-colors hover:bg-surface-2 lg:hidden"
            >
              <Menu aria-hidden className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pathname={pathname}
        entries={entries}
        cta={cta}
      />
    </>
  );
}

function isGroupActive(group: NavGroup, pathname: string): boolean {
  if (group.to && pathname.startsWith(group.to)) return true;
  return group.items.some((i) => pathname === i.to || pathname.startsWith(`${i.to}/`));
}

// ─── Desktop menu ─────────────────────────────────────────────────────────────

/**
 * A grouped nav entry and its panel.
 *
 * The panel is removed from the DOM when closed rather than hidden, so its links are never
 * reachable by Tab from the page behind it.
 */
function MenuButton({
  group,
  open,
  onToggle,
  onClose,
  active,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  active: boolean;
}) {
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Escape returns focus to the trigger; otherwise focus is left stranded on a removed node.
  const closeAndRefocus = useCallback(() => {
    onClose();
    buttonRef.current?.focus();
  }, [onClose]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) closeAndRefocus();
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors",
          open || active
            ? "bg-surface-2 text-foreground"
            : "text-bone-strong hover:bg-surface-2 hover:text-foreground",
        )}
      >
        {group.label}
        <ChevronDown
          aria-hidden
          className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          id={panelId}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeAndRefocus();
          }}
          className={cn(
            "animate-hero-fade absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[26rem]",
            "panel-raised overflow-hidden p-2",
          )}
          style={{ animationDuration: "160ms" }}
        >
          <ul>
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to as "/"}
                  onClick={onClose}
                  className="group/item block rounded-md px-3 py-2.5 transition-colors hover:bg-surface-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-foreground">{item.label}</span>
                    {item.stage === "building" && (
                      <span className="rounded-full border border-gold/25 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                        In development
                      </span>
                    )}
                  </span>
                  {item.description && (
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-bone-soft">
                      {item.description}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {group.footer && (
            <div className="mt-1 border-t border-border pt-1">
              <Link
                to={group.footer.to as "/"}
                onClick={onClose}
                className="group/all flex items-center justify-between rounded-md px-3 py-2.5 text-[12px] font-semibold text-gold transition-colors hover:bg-surface-3"
              >
                {group.footer.label}
                <ArrowUpRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover/all:-translate-y-px group-hover/all:translate-x-px"
                />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mobile navigation ────────────────────────────────────────────────────────

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The mobile navigation.
 *
 * A purpose-built panel rather than the desktop bar at a smaller size: the product and resource
 * groups are expanded inline as labelled lists, because a touch target that needs a second tap to
 * reveal its contents is worse than simply showing them.
 *
 * Implements the dialog contract by hand rather than pulling in Radix — Escape to close, focus
 * moved in on open and restored on close, Tab cycled within the panel, and the page behind it
 * inert and scroll-locked.
 */
function MobileNav({
  open,
  onClose,
  pathname,
  entries,
  cta,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  entries: NavEntry[];
  cta: { label: string; to: string } | null;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const { documentElement } = document;
    const previousOverflow = documentElement.style.overflow;
    documentElement.style.overflow = "hidden";

    // Focus the close control rather than the first link: it is the least destructive landing
    // point, and it tells a screen-reader user immediately how to get out.
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      documentElement.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const groups = entries.filter(isGroup);
  const leaves = entries.filter(isLeaf);

  return (
    <div id="site-mobile-nav" className="fixed inset-0 z-[60] lg:hidden">
      <div
        aria-hidden
        onClick={onClose}
        className="animate-hero-fade absolute inset-0 bg-background/80 backdrop-blur-sm"
        style={{ animationDuration: "200ms" }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border bg-background shadow-2xl"
        style={{ animation: "heroRight 260ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div aria-hidden className="mesh-glow-center" />

        <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Logo size="sm" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="grid h-11 w-11 place-items-center rounded-md border border-border text-foreground transition-colors hover:bg-surface-2"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          {groups.map((group) => (
            <section key={group.label} className="mb-7">
              <h2 className="eyebrow eyebrow-muted mb-3">{group.label}</h2>
              <ul className="-mx-2">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <MobileLink item={item} pathname={pathname} onClose={onClose} />
                  </li>
                ))}
                {group.footer && (
                  <li>
                    <Link
                      to={group.footer.to as "/"}
                      onClick={onClose}
                      className="flex items-center gap-1.5 rounded-md px-2 py-2.5 text-[13px] font-semibold text-gold"
                    >
                      {group.footer.label}
                      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                )}
              </ul>
            </section>
          ))}

          {leaves.length > 0 && (
            <section className="mb-2">
              <h2 className="eyebrow eyebrow-muted mb-3">Company</h2>
              <ul className="-mx-2">
                {leaves.map((entry) => (
                  <li key={entry.to}>
                    <MobileLink item={entry} pathname={pathname} onClose={onClose} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div
          className="safe-bottom relative shrink-0 border-t border-border p-5"
          style={{ ["--safe-pad" as string]: "1.25rem" }}
        >
          {cta && (
            <Link to={cta.to as "/"} onClick={onClose} className="btn btn-primary w-full">
              {cta.label}
              <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          )}
          <p className="type-meta mt-4 text-center">Building products for what&rsquo;s next.</p>
        </div>
      </div>
    </div>
  );
}

function MobileLink({
  item,
  pathname,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  onClose: () => void;
}) {
  const current = pathname === item.to;

  return (
    <Link
      to={item.to as "/"}
      onClick={onClose}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-start justify-between gap-3 rounded-md px-2 py-3 transition-colors",
        current ? "bg-surface-2" : "hover:bg-surface-2",
      )}
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-foreground">{item.label}</span>
          {item.stage === "building" && (
            <span className="rounded-full border border-gold/25 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
              Soon
            </span>
          )}
        </span>
        {item.description && (
          <span className="mt-0.5 block text-[12px] leading-relaxed text-bone-soft">
            {item.description}
          </span>
        )}
      </span>
      <ArrowUpRight aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-bone-faint" />
    </Link>
  );
}
