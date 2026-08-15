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
 * Blog posts are included when Sanity is reachable. A failure there is logged and skipped
 * rather than failing the build — a CMS hiccup should not stop a deploy, and those pages still
 * work, they just fall back to the generic preview card.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { build } from "esbuild";

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
 */
function injectHead(shell, headHtml) {
  let html = shell;

  html = html.replace(/[ \t]*<title>[\s\S]*?<\/title>\n?/i, "");
  html = html.replace(
    /[ \t]*<meta\s+(?:property|name)="(?:og:site_name|og:image|twitter:card|twitter:site|twitter:image)"[^>]*>\n?/gi,
    "",
  );

  const marker = "  </head>";
  const index = html.indexOf(marker);
  if (index === -1) throw new Error("Could not find </head> in dist/index.html");

  return html.slice(0, index) + headHtml + "\n" + html.slice(index);
}

async function fetchBlogPosts() {
  const projectId = "v87jayow";
  const dataset = "production";
  const query = encodeURIComponent(
    `*[_type == "post" && defined(slug.current)]{ "slug": slug.current, title, excerpt, publishedAt, "image": mainImage.asset->url }`,
  );
  const url = `https://${projectId}.apicdn.sanity.io/v2025-01-01/data/query/${dataset}?query=${query}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
    const body = await res.json();
    return Array.isArray(body.result) ? body.result : [];
  } finally {
    clearTimeout(timer);
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
  const { FAQS } = await loadModule("src/lib/faqs.ts", "faqs");
  const shell = await readFile(join(DIST, "index.html"), "utf8");
  const faqs = FAQS;
  console.log(`[prerender] ${faqs.length} FAQ entries found for FAQPage markup`);

  let written = 0;

  for (const [pathname, seo] of Object.entries(PAGE_SEO)) {
    const url = canonicalUrl(pathname);
    const head = renderHead(buildMeta(seo, url), url, prerenderJsonLd(pathname, faqs));
    const file = await writePage(pathname, head, shell);
    console.log(`[prerender] ${pathname.padEnd(26)} -> ${file}`);
    written++;
  }

  // Blog posts, best-effort.
  try {
    const posts = await fetchBlogPosts();
    for (const post of posts) {
      if (!post?.slug) continue;
      const pathname = `/blog/${post.slug}`;
      const seo = {
        title: `${post.title ?? post.slug} | ENICE Group Blog`,
        description:
          (post.excerpt ?? "").trim() ||
          `Read "${post.title ?? post.slug}" on the ENICE Group blog.`,
        ogType: "article",
        image: post.image || DEFAULT_OG_IMAGE,
      };
      const url = canonicalUrl(pathname);
      const file = await writePage(pathname, renderHead(buildMeta(seo, url), url), shell);
      console.log(`[prerender] ${pathname.padEnd(26)} -> ${file}`);
      written++;
    }
    if (posts.length === 0) console.log("[prerender] no blog posts returned by Sanity");
  } catch (err) {
    console.warn(
      `[prerender] skipping blog posts — could not reach Sanity (${err instanceof Error ? err.message : err}). ` +
        `Those pages will fall back to the generic preview card.`,
    );
  }

  console.log(`[prerender] wrote ${written} pages`);
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
