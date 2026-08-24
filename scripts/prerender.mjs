/**
 * Writes a static HTML file per route after `vite build`, with that page's title, description,
 * canonical link and Open Graph tags baked into the markup.
 *
 * ## Why
 *
 * This is a client-rendered SPA, so head tags are injected after hydration. Google executes
 * JavaScript and sees them, but the crawlers behind link previews — Facebook, LinkedIn, Slack,
 * WhatsApp, X — generally do not. Without this, every shared link showed one generic card for
 * the whole site.
 *
 * ## How
 *
 * `dist/index.html` is the SPA shell. For each route in `PAGE_SEO` we write
 * `dist/<route>/index.html` with the same body and script tags but a page-specific head.
 * Vercel serves a matching file from the filesystem before applying the SPA rewrite, so
 * `/about` gets `dist/about/index.html` while unknown paths still fall through to the shell.
 *
 * The page then hydrates exactly as before; the router replaces the head with identical values.
 *
 * Published articles are included when the Website Manager's database is reachable. It is queried
 * directly rather than through `/api/site`, because at build time the deployment serving that
 * endpoint does not exist yet. A failure is logged and skipped rather than failing the build — a
 * CMS hiccup should not stop a deploy, and those pages still work, they just fall back to the
 * generic preview card.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { build } from "esbuild";
import postgres from "postgres";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");

/** Escapes a value for use inside a double-quoted HTML attribute. */
function attr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Bundles the TypeScript SEO module to a temporary ESM file so this plain-Node script can
 * import it. Keeping one source of truth is the entire point — duplicating the copy here
 * would guarantee it drifts from what the router renders.
 */
async function loadModule(entry, name) {
  const outfile = join(ROOT, "node_modules", ".cache", `prerender-${name}.mjs`);
  await mkdir(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [join(ROOT, entry)],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  return import(`file://${outfile}?t=${Date.now()}`);
}

/**
 * Renders the meta tag list produced by `buildMeta` into HTML.
 *
 * Every tag carries `data-prerendered`, which `main.tsx` uses to remove them the moment the
 * app boots. Without that the router would append its own copies and the document would hold
 * two of each tag — the values are identical, but duplicate title and description elements are
 * exactly what an SEO audit flags.
 */
function renderHead(meta, canonical, jsonLd = []) {
  const lines = [];
  const mark = "data-prerendered";
  for (const tag of meta) {
    if (tag.title !== undefined) {
      lines.push(`    <title ${mark}>${escapeText(tag.title)}</title>`);
    } else if (tag.name) {
      lines.push(`    <meta ${mark} name="${attr(tag.name)}" content="${attr(tag.content)}" />`);
    } else if (tag.property) {
      lines.push(
        `    <meta ${mark} property="${attr(tag.property)}" content="${attr(tag.content)}" />`,
      );
    }
  }
  lines.push(`    <link ${mark} rel="canonical" href="${attr(canonical)}" />`);
  for (const data of jsonLd) {
    // `</script>` inside a JSON string would close the tag early; escaping the slash is the
    // standard defence and stays valid JSON.
    const json = JSON.stringify(data).replace(/<\//g, "<\\/");
    lines.push(`    <script ${mark} type="application/ld+json">${json}</script>`);
  }
  return lines.join("\n");
}

/**
 * Replaces the shell's own title and site-wide preview tags with the page-specific set, so a
 * crawler never sees two competing values.
 *
 * Everything this script previously wrote is stripped first, which makes the transform idempotent.
 * That matters because `dist/index.html` is both the shell this reads *and* the output for the `/`
 * route: running the script twice without an intervening `vite build` would otherwise read its own
 * output and append a second title and a second set of Open Graph tags. Duplicate title elements
 * are exactly what an SEO audit flags, and the failure is invisible in a normal build where the
 * script runs once against a fresh shell.
 */
function injectHead(shell, headHtml) {
  let html = shell;

  // Any previously prerendered tag, however it was written.
  html = html.replace(/[ \t]*<title\s+data-prerendered\s*>[\s\S]*?<\/title>\n?/gi, "");
  html = html.replace(/[ \t]*<meta\s+data-prerendered[^>]*>\n?/gi, "");
  html = html.replace(/[ \t]*<link\s+data-prerendered[^>]*>\n?/gi, "");
  html = html.replace(/[ \t]*<script\s+data-prerendered[^>]*>[\s\S]*?<\/script>\n?/gi, "");

  // The shell's own tags. The title match tolerates attributes so it cannot be sidestepped.
  html = html.replace(/[ \t]*<title(?:\s[^>]*)?>[\s\S]*?<\/title>\n?/i, "");
  html = html.replace(
    /[ \t]*<meta\s+(?:property|name)="(?:og:site_name|og:image|twitter:card|twitter:site|twitter:image)"[^>]*>\n?/gi,
    "",
  );

  const marker = "  </head>";
  const index = html.indexOf(marker);
  if (index === -1) throw new Error("Could not find </head> in dist/index.html");

  return html.slice(0, index) + headHtml + "\n" + html.slice(index);
}

/**
 * Reads every published article straight from Postgres.
 *
 * Only the fields needed for a preview card are selected — the block document itself is large and
 * irrelevant here. Scheduled items whose time has passed are included by the same `status` /
 * `scheduled_for` condition the runtime API uses, so a post scheduled to go live before the build
 * still gets its static tags.
 *
 * `kind` determines the URL prefix, matching `CONTENT_KIND_META`. Updates are excluded: they have
 * no page of their own.
 */
async function fetchPublishedArticles() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    console.log("[prerender] DATABASE_URL is not set — skipping article pages");
    return [];
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    connect_timeout: 15,
    ssl: /[?&]sslmode=/.test(databaseUrl)
      ? undefined
      : ["localhost", "127.0.0.1"].includes(new URL(databaseUrl).hostname)
        ? false
        : "require",
    onnotice: () => {},
  });

  try {
    const rows = await sql`
      SELECT kind, slug, title, excerpt, cover_image_url, seo, published_at
      FROM content_items
      WHERE kind <> 'update'
        AND (
          status = 'published'
          OR (status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now())
        )
      ORDER BY published_at DESC NULLS LAST
      LIMIT 500
    `;

    const PREFIX = { blog: "/blog", news: "/news", announcement: "/announcements" };

    return rows.flatMap((row) => {
      const prefix = PREFIX[row.kind];
      if (!prefix || !row.slug) return [];
      const seo = row.seo ?? {};
      return [
        {
          pathname: `${prefix}/${row.slug}`,
          // Item-level SEO overrides win, exactly as they do at runtime.
          title: seo.title || row.title || row.slug,
          excerpt: seo.description || row.excerpt || "",
          image: seo.ogImage || row.cover_image_url || "",
          index: seo.index !== false,
        },
      ];
    });
  } finally {
    await sql.end();
  }
}

async function writePage(pathname, headHtml, shell) {
  // "/" is the shell itself; everything else becomes <route>/index.html.
  const target =
    pathname === "/"
      ? join(DIST, "index.html")
      : join(DIST, pathname.replace(/^\/|\/$/g, ""), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, injectHead(shell, headHtml), "utf8");
  return target.replace(DIST + "/", "");
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("[prerender] dist/index.html not found — run the client build first.");
    process.exit(1);
  }

  const { PAGE_SEO, buildMeta, canonicalUrl, DEFAULT_OG_IMAGE, prerenderJsonLd } = await loadModule(
    "src/lib/seo.ts",
    "seo",
  );
  const shell = await readFile(join(DIST, "index.html"), "utf8");

  let written = 0;

  for (const [pathname, seo] of Object.entries(PAGE_SEO)) {
    const url = canonicalUrl(pathname);
    const head = renderHead(buildMeta(seo, url), url, prerenderJsonLd(pathname));
    const file = await writePage(pathname, head, shell);
    console.log(`[prerender] ${pathname.padEnd(26)} -> ${file}`);
    written++;
  }

  // Published articles, best-effort.
  try {
    const articles = await fetchPublishedArticles();
    for (const article of articles) {
      const seo = {
        title: article.title,
        description: article.excerpt.trim() || `Read "${article.title}" from ENICE Group.`,
        ogType: "article",
        image: article.image || DEFAULT_OG_IMAGE,
        robots: article.index ? undefined : "noindex, nofollow",
      };
      const url = canonicalUrl(article.pathname);
      const file = await writePage(article.pathname, renderHead(buildMeta(seo, url), url), shell);
      console.log(`[prerender] ${article.pathname.padEnd(26)} -> ${file}`);
      written++;
    }
    if (articles.length === 0) console.log("[prerender] no published articles found");
  } catch (err) {
    console.warn(
      `[prerender] skipping article pages — could not read the Website Manager database ` +
        `(${err instanceof Error ? err.message : err}). Those pages will fall back to the generic ` +
        `preview card.`,
    );
  }

  console.log(`[prerender] wrote ${written} pages`);
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
