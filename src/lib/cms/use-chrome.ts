/**
 * The header and footer, as managed in the Website Manager.
 *
 * ## Why this exists
 *
 * `header` and `footer` have been part of the bootstrap payload — and editable under
 * Website → Navigation and Website → Footer — since the CMS shipped. The site chrome was not
 * reading them: the menu and the footer columns were arrays in `navigation.ts` and
 * `SiteFooter.tsx`, so renaming a link or reordering a column meant a deploy, and the admin
 * screens quietly had no effect on the live site.
 *
 * This hook closes that gap. It follows the same contract as `useSectionFields`: one shared
 * bootstrap request per page load, `null` until it resolves, and a degraded API treated as "not
 * loaded" rather than "empty" — so the built-in chrome paints first and stays put if the API is
 * unreachable. A site whose navigation disappears during a database blip is worse than one whose
 * navigation is briefly a deploy behind.
 */

import { useEffect, useState } from "react";
import { loadSharedBootstrap } from "./use-section";
import type { FooterSettings, HeaderSettings, NavItem } from "./types";

export interface SiteChrome {
  header: HeaderSettings | null;
  footer: FooterSettings | null;
}

export function useSiteChrome(): SiteChrome {
  const [chrome, setChrome] = useState<SiteChrome>({ header: null, footer: null });

  useEffect(() => {
    let active = true;
    loadSharedBootstrap()
      .then((bootstrap) => {
        if (!active || bootstrap.degraded) return;
        setChrome({ header: bootstrap.header, footer: bootstrap.footer });
      })
      .catch(() => {
        /* keep nulls → the caller's built-in chrome stands */
      });
    return () => {
      active = false;
    };
  }, []);

  return chrome;
}

/** Visible items only, in order, with blank labels and URLs discarded. */
export function visibleNavItems(items: NavItem[] | undefined): NavItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) => item && item.visible !== false && item.label?.trim() && item.url?.trim(),
  );
}
