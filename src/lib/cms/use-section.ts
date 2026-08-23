/**
 * Shared access to the CMS section content for public pages.
 *
 * The homepage is assembled from several editable sections. Each one needs the same bootstrap
 * payload, so this loads it exactly once per page load and hands every caller the same in-flight
 * promise — wiring ten sections costs one request, not ten.
 *
 * A section that is absent, hidden, or unreachable simply yields `null`, and the caller renders
 * its built-in default. That is the contract that lets the site be edited without a flag day: a
 * band shows its hard-coded content until someone edits that section, and its edited content from
 * then on.
 */

import { useEffect, useState } from "react";
import { fetchBootstrap, sectionFields, type SiteBootstrap } from "./public-client";

let shared: Promise<SiteBootstrap> | null = null;

/** One bootstrap fetch per page load, shared by every section hook. */
export function loadSharedBootstrap(): Promise<SiteBootstrap> {
  if (!shared) {
    shared = fetchBootstrap().catch((error) => {
      // Clear the memo so a transient failure can be retried by the next caller.
      shared = null;
      throw error;
    });
  }
  return shared;
}

/**
 * The fields of one section, or null until they load (and if they never do).
 *
 * A degraded bootstrap is treated as "not loaded" rather than "empty", so a backend hiccup shows
 * the built-in content instead of wiping a band.
 */
export function useSectionFields(key: string): Record<string, unknown> | null {
  const [fields, setFields] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let active = true;
    loadSharedBootstrap()
      .then((bootstrap) => {
        if (!active || bootstrap.degraded) return;
        setFields(sectionFields(bootstrap, key));
      })
      .catch(() => {
        /* keep null → the caller's built-in default stands */
      });
    return () => {
      active = false;
    };
  }, [key]);

  return fields;
}

/** Reads one string field, falling back to built-in copy when unset or unmanaged. */
export function fieldText(
  fields: Record<string, unknown> | null,
  key: string,
  fallback: string,
): string {
  const value = fields?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}
