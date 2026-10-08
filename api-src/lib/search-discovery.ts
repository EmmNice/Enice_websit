import type { ContentKind } from "../../src/lib/cms/types";
import { CONTENT_KIND_META } from "../../src/lib/cms/types";
import { SITE_URL } from "../../src/lib/site";

/** Public IndexNow ownership key. Its matching text file is served from the site root. */
const INDEXNOW_KEY = "67be4fa08925c8ad447fb92b3774d1ac";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const REQUEST_TIMEOUT_MS = 2_500;
const MAX_URLS_PER_REQUEST = 10_000;

/** Canonical public route for an editorial item. Updates live within the shared news page. */
export function publicContentPath(kind: ContentKind, slug: string): string {
  const prefix = CONTENT_KIND_META[kind].publicPrefix;
  return prefix ? `${prefix}/${slug}` : `/news#${slug}`;
}

function ownedUrls(values: readonly string[]): string[] {
  const expectedOrigin = new URL(SITE_URL).origin;
  const urls = new Set<string>();

  for (const value of values) {
    try {
      const url = new URL(value, `${SITE_URL}/`);
      if (url.origin !== expectedOrigin) continue;
      // Fragments are client-side positions, not independently crawlable resources.
      url.hash = "";
      urls.add(url.href);
    } catch {
      // Ignore malformed values. Publishing must never fail because discovery input was invalid.
    }
  }

  return [...urls];
}

/**
 * Best-effort search-engine notification for URLs that were added, changed, or removed.
 *
 * IndexNow is production-only: preview deployments use the same canonical URLs and must not tell
 * search engines that unreleased changes are live. Every failure is swallowed after a bounded
 * request because publishing content is authoritative; discovery is an acceleration layer.
 */
export async function notifySearchEngines(values: readonly string[], event: string): Promise<void> {
  if (process.env.VERCEL_ENV !== "production") return;

  const urls = ownedUrls(values);
  if (urls.length === 0) return;

  for (let offset = 0; offset < urls.length; offset += MAX_URLS_PER_REQUEST) {
    const urlList = urls.slice(offset, offset + MAX_URLS_PER_REQUEST);

    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: new URL(SITE_URL).host,
          key: INDEXNOW_KEY,
          keyLocation: INDEXNOW_KEY_LOCATION,
          urlList,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        console.warn(
          `[search-discovery] IndexNow ${event} notification returned ${response.status} for ${urlList.length} URL(s)`,
        );
        continue;
      }

      console.log(
        `[search-discovery] IndexNow accepted ${urlList.length} ${event} URL notification(s)`,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.name : "UnknownError";
      console.warn(
        `[search-discovery] IndexNow ${event} notification failed for ${urlList.length} URL(s): ${reason}`,
      );
    }
  }
}
