/**
 * Storage for the website itself: pages, global sections, navigation, footer, design and SEO
 * defaults.
 *
 * ## The guardrail
 *
 * This is where "manageable without touching source code" meets "the site must stay on brand".
 * Sections are instances of the schemas in `src/lib/cms/types.ts`, and every field a section
 * accepts is copy, an image or a link. There is no field for colour, spacing, font size or
 * column count anywhere in the model, so no amount of editing through this API can produce a
 * page that looks unlike the ENICE design system. Design controls are separately confined to a
 * preset palette and a vetted type pairing.
 *
 * ## Seeding
 *
 * A fresh database is seeded with the site's real structure — the actual navigation, the actual
 * footer columns, one section record per manageable band. Without that, the Website Manager
 * would open on a set of empty screens and an administrator would have to reconstruct the site's
 * shape by hand before they could change anything.
 */

import type {
  ContentStatus,
  DesignSettings,
  FooterSettings,
  HeaderSettings,
  ManagedPage,
  NavItem,
  PageSection,
  SectionType,
  SeoDefaults,
  SeoFields,
  SiteSectionRecord,
  SiteSettings,
} from "../../../src/lib/cms/types";
import {
  BRAND_PALETTES,
  BUTTON_STYLES,
  CONTENT_STATUSES,
  SECTION_SCHEMAS,
  SECTION_TYPES,
  TYPE_PAIRINGS,
} from "../../../src/lib/cms/types";
import { normalizePath, sanitizeDoc, slugify } from "../../../src/lib/cms/doc";
import {
  sanitizeInlineHtml,
  sanitizeMultilineText,
  sanitizeText,
  sanitizeUrl,
} from "../../../src/lib/cms/sanitize";
import { FALLBACK_SEO_DEFAULTS } from "../../../src/lib/cms/seo-resolve";
import { db, iso, isoOrNull, json, newId, parseDate } from "../db";
import { badRequest, conflict, notFound } from "../router";
import type { Actor } from "./content";

// ─── Section field sanitisation ──────────────────────────────────────────────

/**
 * Rebuilds a section's fields from its schema.
 *
 * Schema-driven rather than type-driven: the loop walks `SECTION_SCHEMAS[type].fields` and reads
 * only the keys declared there, so a payload carrying extra properties cannot introduce
 * unvetted data, and adding a field to a schema automatically makes it accepted. Each field type
 * maps to the sanitiser appropriate for it — URLs are protocol-checked, rich text goes through
 * the block-document reconstruction, plain text is length-capped.
 */
export function sanitizeSectionFields(type: SectionType, input: unknown): Record<string, unknown> {
  const schema = SECTION_SCHEMAS[type];
  if (!schema) return {};

  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const field of schema.fields) {
    const value = source[field.key];

    switch (field.type) {
      case "text":
        output[field.key] = sanitizeText(value, 300);
        break;
      case "textarea":
        output[field.key] = sanitizeMultilineText(value, 4_000);
        break;
      case "richtext":
        output[field.key] = sanitizeDoc(value);
        break;
      case "image":
      case "url":
        output[field.key] = sanitizeUrl(value) ?? "";
        break;
      case "boolean":
        output[field.key] = value === true;
        break;
      case "select":
        output[field.key] =
          typeof value === "string" && field.options?.includes(value)
            ? value
            : (field.options?.[0] ?? "");
        break;
      case "repeater": {
        const rows = Array.isArray(value) ? value.slice(0, field.max ?? 20) : [];
        output[field.key] = rows.map((row) => {
          const rowSource = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
          const rowOutput: Record<string, unknown> = {};
          for (const sub of field.of ?? []) {
            const subValue = rowSource[sub.key];
            if (sub.type === "image" || sub.type === "url") {
              rowOutput[sub.key] = sanitizeUrl(subValue) ?? "";
            } else if (sub.type === "boolean") {
              rowOutput[sub.key] = subValue === true;
            } else if (sub.type === "textarea") {
              rowOutput[sub.key] = sanitizeMultilineText(subValue, 2_000);
            } else if (sub.type === "richtext") {
              rowOutput[sub.key] = sanitizeDoc(subValue);
            } else {
              rowOutput[sub.key] = sanitizeText(subValue, 300);
            }
          }
          return rowOutput;
        });
        break;
      }
    }
  }

  return output;
}

function sanitizeSeoFields(value: unknown): SeoFields {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  return {
    title: sanitizeText(source.title, 200) || undefined,
    description: sanitizeMultilineText(source.description, 400) || undefined,
    canonicalUrl: sanitizeUrl(source.canonicalUrl) ?? undefined,
    ogTitle: sanitizeText(source.ogTitle, 200) || undefined,
    ogDescription: sanitizeMultilineText(source.ogDescription, 400) || undefined,
    ogImage: sanitizeUrl(source.ogImage) ?? undefined,
    index: source.index === false ? false : undefined,
  };
}

function toStatus(value: unknown): ContentStatus {
  return typeof value === "string" && (CONTENT_STATUSES as readonly string[]).includes(value)
    ? (value as ContentStatus)
    : "draft";
}

// ─── Pages ───────────────────────────────────────────────────────────────────

interface PageRow {
  id: string;
  path: string;
  title: string;
  summary: string;
  status: string;
  sections: PageSection[] | null;
  seo: SeoFields | null;
  system_route: boolean;
  published_at: Date | null;
  scheduled_for: Date | null;
  archived_at: Date | null;
  created_at: Date;
  updated_at: Date;
  updated_by_email: string | null;
  revision: number;
}

function mapPage(row: PageRow): ManagedPage {
  return {
    id: row.id,
    path: row.path,
    title: row.title,
    summary: row.summary,
    status: toStatus(row.status),
    sections: row.sections ?? [],
    seo: row.seo ?? {},
    systemRoute: row.system_route,
    publishedAt: isoOrNull(row.published_at),
    scheduledFor: isoOrNull(row.scheduled_for),
    archivedAt: isoOrNull(row.archived_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    updatedByEmail: row.updated_by_email,
    revision: row.revision,
  };
}

/** Rebuilds the ordered section list, dropping entries with an unknown type. */
function sanitizeSections(value: unknown): PageSection[] {
  if (!Array.isArray(value)) return [];
  const sections: PageSection[] = [];

  for (const entry of value.slice(0, 40)) {
    if (!entry || typeof entry !== "object") continue;
    const source = entry as Record<string, unknown>;
    const type = source.type;
    if (typeof type !== "string" || !(SECTION_TYPES as readonly string[]).includes(type)) continue;

    const sectionType = type as SectionType;
    sections.push({
      id: sanitizeText(source.id, 40) || newId().slice(0, 8),
      type: sectionType,
      label: sanitizeText(source.label, 120) || SECTION_SCHEMAS[sectionType].label,
      visible: source.visible !== false,
      fields: sanitizeSectionFields(sectionType, source.fields),
    });
  }

  return sections;
}

export async function listPages(): Promise<ManagedPage[]> {
  const rows = await db()<PageRow[]>`
    SELECT id, path, title, summary, status, sections, seo, system_route,
           published_at, scheduled_for, archived_at, created_at, updated_at,
           updated_by_email, revision
    FROM cms_pages
    ORDER BY system_route DESC, path ASC
  `;
  return rows.map(mapPage);
}

export async function getPage(id: string): Promise<ManagedPage | null> {
  const rows = await db()<PageRow[]>`
    SELECT id, path, title, summary, status, sections, seo, system_route,
           published_at, scheduled_for, archived_at, created_at, updated_at,
           updated_by_email, revision
    FROM cms_pages WHERE id = ${id}
  `;
  return rows[0] ? mapPage(rows[0]) : null;
}

export async function getPageByPath(
  path: string,
  publishedOnly = true,
): Promise<ManagedPage | null> {
  const sql = db();
  const rows = await sql<PageRow[]>`
    SELECT id, path, title, summary, status, sections, seo, system_route,
           published_at, scheduled_for, archived_at, created_at, updated_at,
           updated_by_email, revision
    FROM cms_pages
    WHERE path = ${normalizePath(path)}
      ${publishedOnly ? sql`AND status = 'published'` : sql``}
  `;
  return rows[0] ? mapPage(rows[0]) : null;
}

export interface PageInput {
  path?: string;
  title?: string;
  summary?: string;
  sections?: unknown;
  seo?: unknown;
}

export async function createPage(input: PageInput, actor: Actor): Promise<ManagedPage> {
  const title = sanitizeText(input.title, 200);
  if (!title) throw badRequest("A page title is required.");

  const path = normalizePath(input.path?.trim() || slugify(title));
  if (path === "/") throw badRequest("The homepage already exists and cannot be recreated.");

  const existing = await db()<{ id: string }[]>`SELECT id FROM cms_pages WHERE path = ${path}`;
  if (existing.length > 0) throw conflict(`A page already exists at ${path}.`);

  const id = newId();
  await db()`
    INSERT INTO cms_pages (id, path, title, summary, status, sections, seo, updated_by_email)
    VALUES (
      ${id}, ${path}, ${title}, ${sanitizeMultilineText(input.summary, 500)}, ${"draft"},
      ${json(sanitizeSections(input.sections))}, ${json(sanitizeSeoFields(input.seo))},
      ${actor.email}
    )
  `;

  const created = await getPage(id);
  if (!created) throw new Error("Page disappeared immediately after insert.");
  return created;
}

/**
 * Updates a page.
 *
 * A `systemRoute` page's path is immutable. Those paths correspond to hand-built React routes,
 * so changing one here would leave the route pointing at nothing while the CMS believed the page
 * had moved — a broken link with no obvious cause.
 */
export async function updatePage(
  id: string,
  input: PageInput,
  actor: Actor,
  expectedRevision?: number,
): Promise<ManagedPage> {
  const existing = await getPage(id);
  if (!existing) throw notFound("That page");

  if (expectedRevision !== undefined && expectedRevision !== existing.revision) {
    throw conflict("Someone else saved this page while you were editing. Reload and try again.");
  }

  let path = existing.path;
  if (input.path !== undefined) {
    const candidate = normalizePath(input.path);
    if (candidate !== existing.path) {
      if (existing.systemRoute) {
        throw badRequest(
          "This page's address is fixed because it is built into the website. Its content and SEO are still editable.",
        );
      }
      const clash = await db()<{ id: string }[]>`
        SELECT id FROM cms_pages WHERE path = ${candidate} AND id <> ${id}
      `;
      if (clash.length > 0) throw conflict(`A page already exists at ${candidate}.`);
      path = candidate;
    }
  }

  await db()`
    UPDATE cms_pages SET
      path = ${path},
      title = ${input.title === undefined ? existing.title : sanitizeText(input.title, 200)},
      summary = ${
        input.summary === undefined ? existing.summary : sanitizeMultilineText(input.summary, 500)
      },
      sections = ${json(
        input.sections === undefined ? existing.sections : sanitizeSections(input.sections),
      )},
      seo = ${json(input.seo === undefined ? existing.seo : sanitizeSeoFields(input.seo))},
      updated_at = now(),
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE id = ${id}
  `;

  const updated = await getPage(id);
  if (!updated) throw notFound("That page");
  return updated;
}

export async function transitionPage(
  id: string,
  status: ContentStatus,
  scheduledFor: string | null,
  actor: Actor,
): Promise<ManagedPage> {
  const existing = await getPage(id);
  if (!existing) throw notFound("That page");

  const sql = db();
  const when = status === "scheduled" ? parseDate(scheduledFor) : null;
  if (status === "scheduled" && !when) {
    throw badRequest("Choose the date and time this page should publish.");
  }

  await sql`
    UPDATE cms_pages SET
      status = ${status},
      published_at = ${status === "published" ? sql`COALESCE(published_at, now())` : sql`published_at`},
      scheduled_for = ${when},
      archived_at = ${status === "archived" ? sql`now()` : sql`NULL`},
      updated_at = now(),
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE id = ${id}
  `;

  const updated = await getPage(id);
  if (!updated) throw notFound("That page");
  return updated;
}

export async function deletePage(id: string): Promise<ManagedPage> {
  const existing = await getPage(id);
  if (!existing) throw notFound("That page");
  if (existing.systemRoute) {
    throw badRequest(
      "This page is built into the website and cannot be deleted. Unpublish or archive it instead.",
    );
  }
  await db()`DELETE FROM cms_pages WHERE id = ${id}`;
  return existing;
}

/** Publishes any page whose scheduled time has passed. Mirrors `publishDueContent`. */
export async function publishDuePages(): Promise<number> {
  const rows = await db()<{ id: string }[]>`
    UPDATE cms_pages
    SET status = 'published',
        published_at = COALESCE(published_at, scheduled_for, now()),
        scheduled_for = NULL,
        updated_at = now()
    WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now()
    RETURNING id
  `;
  return rows.length;
}

// ─── Global sections ─────────────────────────────────────────────────────────

interface SectionRow {
  key: string;
  label: string;
  group_name: string;
  type: string;
  visible: boolean;
  status: string;
  fields: Record<string, unknown> | null;
  sort_order: number;
  updated_at: Date;
  updated_by_email: string | null;
  revision: number;
}

function mapSection(row: SectionRow): SiteSectionRecord {
  return {
    key: row.key,
    label: row.label,
    group: row.group_name,
    type: row.type as SectionType,
    visible: row.visible,
    status: toStatus(row.status),
    fields: row.fields ?? {},
    updatedAt: iso(row.updated_at),
    updatedByEmail: row.updated_by_email,
    revision: row.revision,
  };
}

export async function listSections(): Promise<SiteSectionRecord[]> {
  const rows = await db()<SectionRow[]>`
    SELECT key, label, group_name, type, visible, status, fields, sort_order,
           updated_at, updated_by_email, revision
    FROM site_sections
    ORDER BY sort_order ASC, key ASC
  `;
  return rows.map(mapSection);
}

export async function getSection(key: string): Promise<SiteSectionRecord | null> {
  const rows = await db()<SectionRow[]>`
    SELECT key, label, group_name, type, visible, status, fields, sort_order,
           updated_at, updated_by_email, revision
    FROM site_sections WHERE key = ${key}
  `;
  return rows[0] ? mapSection(rows[0]) : null;
}

export async function updateSection(
  key: string,
  input: { fields?: unknown; visible?: boolean; status?: ContentStatus; label?: string },
  actor: Actor,
): Promise<SiteSectionRecord> {
  const existing = await getSection(key);
  if (!existing) throw notFound("That section");

  await db()`
    UPDATE site_sections SET
      fields = ${json(
        input.fields === undefined
          ? existing.fields
          : sanitizeSectionFields(existing.type, input.fields),
      )},
      visible = ${input.visible === undefined ? existing.visible : input.visible === true},
      status = ${input.status === undefined ? existing.status : toStatus(input.status)},
      label = ${input.label === undefined ? existing.label : sanitizeText(input.label, 120)},
      updated_at = now(),
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE key = ${key}
  `;

  const updated = await getSection(key);
  if (!updated) throw notFound("That section");
  return updated;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export const SETTINGS_KEYS = ["design", "header", "footer", "seo", "general"] as const;
export type SettingsKey = (typeof SETTINGS_KEYS)[number];

/** Rebuilds a navigation tree, allowing exactly one level of nesting. */
function sanitizeNavItems(value: unknown, depth = 0): NavItem[] {
  if (!Array.isArray(value)) return [];
  const items: NavItem[] = [];

  for (const entry of value.slice(0, 20)) {
    if (!entry || typeof entry !== "object") continue;
    const source = entry as Record<string, unknown>;
    const label = sanitizeText(source.label, 60);
    const url = sanitizeUrl(source.url);
    if (!label || !url) continue;

    items.push({
      id: sanitizeText(source.id, 40) || newId().slice(0, 8),
      label,
      url,
      visible: source.visible !== false,
      // The header is designed for a single dropdown level; deeper nesting has nowhere to render.
      children: depth === 0 ? sanitizeNavItems(source.children, 1) : undefined,
    });
  }

  return items;
}

function sanitizeDesign(value: unknown, existing: DesignSettings): DesignSettings {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const palette = typeof source.palette === "string" ? source.palette : existing.palette;
  const typography =
    typeof source.typography === "string" ? source.typography : existing.typography;
  const buttonStyle =
    typeof source.buttonStyle === "string" ? source.buttonStyle : existing.buttonStyle;

  return {
    logoUrl: source.logoUrl === undefined ? existing.logoUrl : sanitizeUrl(source.logoUrl),
    logoDarkUrl:
      source.logoDarkUrl === undefined ? existing.logoDarkUrl : sanitizeUrl(source.logoDarkUrl),
    faviconUrl:
      source.faviconUrl === undefined ? existing.faviconUrl : sanitizeUrl(source.faviconUrl),
    ogImageUrl:
      source.ogImageUrl === undefined ? existing.ogImageUrl : sanitizeUrl(source.ogImageUrl),
    // Unknown keys fall back to the current value, so a malformed payload can never leave the
    // site with a palette or font that has no definition behind it.
    palette: palette in BRAND_PALETTES ? palette : existing.palette,
    typography: typography in TYPE_PAIRINGS ? typography : existing.typography,
    buttonStyle: buttonStyle in BUTTON_STYLES ? buttonStyle : existing.buttonStyle,
  };
}

function sanitizeHeader(value: unknown, existing: HeaderSettings): HeaderSettings {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    items: source.items === undefined ? existing.items : sanitizeNavItems(source.items),
    ctaLabel: source.ctaLabel === undefined ? existing.ctaLabel : sanitizeText(source.ctaLabel, 40),
    ctaUrl: source.ctaUrl === undefined ? existing.ctaUrl : (sanitizeUrl(source.ctaUrl) ?? ""),
    showCta: source.showCta === undefined ? existing.showCta : source.showCta === true,
    sticky: source.sticky === undefined ? existing.sticky : source.sticky === true,
  };
}

function sanitizeFooter(value: unknown, existing: FooterSettings): FooterSettings {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;

  const columns =
    source.columns === undefined
      ? existing.columns
      : (Array.isArray(source.columns) ? source.columns.slice(0, 6) : []).map((entry) => {
          const column = (entry && typeof entry === "object" ? entry : {}) as Record<
            string,
            unknown
          >;
          return {
            id: sanitizeText(column.id, 40) || newId().slice(0, 8),
            heading: sanitizeText(column.heading, 60),
            links: sanitizeNavItems(column.links, 1),
          };
        });

  return {
    columns,
    tagline:
      source.tagline === undefined ? existing.tagline : sanitizeMultilineText(source.tagline, 300),
    copyright:
      source.copyright === undefined ? existing.copyright : sanitizeText(source.copyright, 200),
    showSocials:
      source.showSocials === undefined ? existing.showSocials : source.showSocials === true,
  };
}

function sanitizeSeoDefaults(value: unknown, existing: SeoDefaults): SeoDefaults {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    titleSuffix:
      source.titleSuffix === undefined
        ? existing.titleSuffix
        : sanitizeText(source.titleSuffix, 60),
    defaultDescription:
      source.defaultDescription === undefined
        ? existing.defaultDescription
        : sanitizeMultilineText(source.defaultDescription, 400),
    defaultOgImage:
      source.defaultOgImage === undefined
        ? existing.defaultOgImage
        : (sanitizeUrl(source.defaultOgImage) ?? existing.defaultOgImage),
    indexSite: source.indexSite === undefined ? existing.indexSite : source.indexSite === true,
    robotsExtra:
      source.robotsExtra === undefined
        ? existing.robotsExtra
        : sanitizeText(source.robotsExtra, 120),
  };
}

/**
 * Reads all settings, merging stored values over the defaults.
 *
 * Merging rather than replacing means a settings document written before a new field existed
 * still yields a complete object, so the site never renders with an undefined logo or a missing
 * SEO default after a deploy that adds a setting.
 */
export async function getSettings(): Promise<SiteSettings> {
  const rows = await db()<{ key: string; value: unknown }[]>`
    SELECT key, value FROM site_settings
  `;
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const defaults = defaultSettings();

  return {
    design: { ...defaults.design, ...((stored.get("design") as object) ?? {}) },
    header: { ...defaults.header, ...((stored.get("header") as object) ?? {}) },
    footer: { ...defaults.footer, ...((stored.get("footer") as object) ?? {}) },
    seo: { ...defaults.seo, ...((stored.get("seo") as object) ?? {}) },
    ...(() => {
      const general = (stored.get("general") as Record<string, unknown>) ?? {};
      return {
        announcementBarEnabled:
          general.announcementBarEnabled === undefined
            ? defaults.announcementBarEnabled
            : general.announcementBarEnabled === true,
        maintenanceNotice:
          typeof general.maintenanceNotice === "string"
            ? general.maintenanceNotice
            : defaults.maintenanceNotice,
      };
    })(),
  };
}

export async function updateSettings(
  key: SettingsKey,
  value: unknown,
  actor: Actor,
): Promise<SiteSettings> {
  const current = await getSettings();

  const next =
    key === "design"
      ? sanitizeDesign(value, current.design)
      : key === "header"
        ? sanitizeHeader(value, current.header)
        : key === "footer"
          ? sanitizeFooter(value, current.footer)
          : key === "seo"
            ? sanitizeSeoDefaults(value, current.seo)
            : (() => {
                const source = (value && typeof value === "object" ? value : {}) as Record<
                  string,
                  unknown
                >;
                return {
                  announcementBarEnabled: source.announcementBarEnabled === true,
                  maintenanceNotice: sanitizeInlineHtml(source.maintenanceNotice),
                };
              })();

  await db()`
    INSERT INTO site_settings (key, value, updated_by_email)
    VALUES (${key}, ${json(next)}, ${actor.email})
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = now(), updated_by_email = EXCLUDED.updated_by_email
  `;

  return getSettings();
}

// ─── Defaults and seeding ────────────────────────────────────────────────────

/**
 * The shipped defaults, mirroring the site as it is built today.
 *
 * These are the values an administrator sees the first time they open the Website Manager, so
 * they must match reality: the same four header links, the same three footer columns, the same
 * copy. A default set that disagreed with the live site would make the first save look like a
 * change when it is not.
 */
export function defaultSettings(): SiteSettings {
  return {
    design: {
      logoUrl: null,
      logoDarkUrl: null,
      faviconUrl: null,
      ogImageUrl: null,
      palette: "enice-navy",
      typography: "inter",
      buttonStyle: "standard",
    },
    /*
     * Grouped, matching the header the site actually renders.
     *
     * The previous default was a flat `Home · Products · About · Contact`, which left ten real
     * pages reachable only from the footer and named Contact twice — once as a link and again as
     * the CTA. `Home` is gone because the wordmark is the home link. The model has always allowed
     * one level of `children`; the header renders those as a menu.
     */
    header: {
      items: [
        {
          id: "nav-products",
          label: "Products",
          url: "/portfolio",
          visible: true,
          children: [
            { id: "nav-pulsepay", label: "PulsePay", url: "/portfolio/pulsepay", visible: true },
            {
              id: "nav-pulseassist",
              label: "PulseAssist",
              url: "/portfolio/pulseassist",
              visible: true,
            },
            {
              id: "nav-pulseassist-email",
              label: "PulseAssist Email",
              url: "/portfolio/pulseassist-email",
              visible: true,
            },
            {
              id: "nav-devapay",
              label: "DevaPay",
              url: "/portfolio/devapay",
              visible: true,
            },
            { id: "nav-epulse", label: "ePulse", url: "/portfolio/epulse", visible: true },
            { id: "nav-pulsex", label: "PulseX", url: "/portfolio/pulsex", visible: true },
          ],
        },
        { id: "nav-company", label: "Company", url: "/about", visible: true },
        {
          id: "nav-resources",
          label: "Resources",
          url: "#",
          visible: true,
          children: [
            { id: "nav-docs", label: "Documentation", url: "/docs", visible: true },
            { id: "nav-roadmap", label: "Roadmap", url: "/roadmap", visible: true },
            { id: "nav-blog", label: "Blog", url: "/blog/", visible: true },
            { id: "nav-news", label: "News & Changelog", url: "/news/", visible: true },
            { id: "nav-status", label: "System Status", url: "/status", visible: true },
          ],
        },
      ],
      ctaLabel: "Contact",
      ctaUrl: "/contact",
      showCta: true,
      sticky: true,
    },
    footer: {
      columns: [
        {
          id: "col-products",
          heading: "Products",
          links: [
            { id: "f-pulsepay", label: "PulsePay", url: "/portfolio/pulsepay", visible: true },
            {
              id: "f-pulseassist",
              label: "PulseAssist",
              url: "/portfolio/pulseassist",
              visible: true,
            },
            {
              id: "f-pulseassist-email",
              label: "PulseAssist Email",
              url: "/portfolio/pulseassist-email",
              visible: true,
            },
            {
              id: "f-devapay",
              label: "DevaPay",
              url: "/portfolio/devapay",
              visible: true,
            },
            { id: "f-epulse", label: "ePulse", url: "/portfolio/epulse", visible: true },
            { id: "f-pulsex", label: "PulseX", url: "/portfolio/pulsex", visible: true },
            { id: "f-all-products", label: "All products", url: "/portfolio", visible: true },
          ],
        },
        {
          id: "col-developers",
          heading: "Developers",
          links: [
            { id: "f-docs", label: "API documentation", url: "/docs", visible: true },
            { id: "f-roadmap", label: "Product roadmap", url: "/roadmap", visible: true },
            { id: "f-status", label: "System status", url: "/status", visible: true },
          ],
        },
        {
          id: "col-company",
          heading: "Company",
          links: [
            { id: "f-about", label: "About ENICE Group", url: "/about", visible: true },
            { id: "f-contact", label: "Contact", url: "/contact", visible: true },
            { id: "f-blog", label: "Blog", url: "/blog/", visible: true },
            { id: "f-news", label: "News & changelog", url: "/news/", visible: true },
            {
              id: "f-announcements",
              label: "Announcements",
              url: "/announcements/",
              visible: true,
            },
          ],
        },
        // Legal was mixed in with Company, which gave the privacy policy the same weight as the
        // About page. Splitting it also evens the column count.
        {
          id: "col-legal",
          heading: "Legal",
          links: [
            { id: "f-privacy", label: "Privacy policy", url: "/privacy", visible: true },
            { id: "f-terms", label: "Terms of service", url: "/terms", visible: true },
            {
              id: "f-compliance",
              label: "Regulatory compliance",
              url: "/compliance",
              visible: true,
            },
          ],
        },
      ],
      tagline:
        "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
      copyright: `© ${new Date().getFullYear()} ENICE Group. All rights reserved.`,
      showSocials: true,
    },
    seo: FALLBACK_SEO_DEFAULTS,
    announcementBarEnabled: false,
    maintenanceNotice: "",
  };
}

/**
 * The manageable sections of the existing website, keyed by a stable identifier.
 *
 * A component looks its section up by key, so an administrator editing the homepage hero here
 * changes the live page without a deploy. Keys are namespaced by page for grouping in the admin
 * list, and `sort_order` reflects the order the bands appear on the page.
 */
const DEFAULT_SECTIONS: {
  key: string;
  label: string;
  group: string;
  type: SectionType;
  order: number;
  fields: Record<string, unknown>;
}[] = [
  {
    key: "home.hero",
    label: "Homepage hero",
    group: "Home",
    type: "hero",
    order: 10,
    fields: {
      eyebrow: "Technology Group · Building for Africa",
      /*
       * No manual line breaks and no [[highlight]] in the default.
       *
       * The breaks were tuned for one viewport and ragged badly at every other; the headline is
       * now balanced by the browser. The highlight is dropped because at display size it put two
       * lines of the warm accent at the top of the page — the accent is for small emphasis, and a
       * 60px gold phrase stops reading as an accent. Both features remain available to an editor
       * (\n splits a line, [[…]] renders a phrase in the accent colour); they are simply not what
       * the shipped copy uses.
       */
      heading: "We build the technology behind Africa's next generation of businesses.",
      subheading:
        "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
      primaryCtaLabel: "Explore our products",
      primaryCtaUrl: "/portfolio",
      secondaryCtaLabel: "What we build",
      secondaryCtaUrl: "/about",
    },
  },
  {
    key: "home.statistics",
    label: "Company statistics",
    group: "Home",
    type: "statistics",
    order: 20,
    fields: {
      heading: "Built for scale",
      /*
       * Only figures that can be checked.
       *
       * This seed still carried `99.99% Infrastructure SLA`, `< 14ms API Latency P50` and
       * `AES-256 Encryption Standard` long after those claims were deleted from the homepage —
       * so a fresh install re-published all three, and the page's built-in copy was the only
       * thing keeping them off the site. There is no uptime SLA, no published latency benchmark,
       * and an encryption standard is not a headline metric. The product count was also simply
       * wrong (4 for five products), which is why the code derives it from the product registry
       * rather than storing it.
       */
      items: [
        { value: "6", label: "Products in the ecosystem" },
        { value: "2", label: "Offices in Nigeria" },
      ],
    },
  },
  {
    key: "home.products",
    label: "Product grid",
    group: "Home",
    type: "featureGrid",
    order: 30,
    fields: {
      eyebrow: "What we're building",
      heading: "Products and platforms.\nBuilt to one standard.",
      subheading:
        "ENICE Group takes hard problems in financial services and business communication and turns them into products people can rely on.",
      // The three cards the homepage product band renders. `index` numbering is derived from
      // position, and bullets are one per line.
      items: [
        {
          icon: "Banknote",
          kicker: "Fintech",
          title: "Financial Infrastructure Systems",
          description:
            "Transaction networks, ledger databases, and virtual card infrastructure built for Nigeria's digital economy, with room to expand across the region.",
          bullets: "Virtual Card Issuance\nTreasury and Ledger\nKYC and Compliance Tooling",
        },
        {
          icon: "BrainCircuit",
          kicker: "Artificial Intelligence",
          title: "Autonomous Enterprise AI",
          description:
            "Conversational AI that handles customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms.",
          bullets: "Autonomous Customer Support\nPolicy-Bound AI Agents\nWorkflow Automation",
        },
        {
          icon: "Boxes",
          kicker: "Product Engineering",
          title: "Products built to operate",
          description:
            "We build, own, and operate full-stack products. Each platform starts from a real customer problem and goes through engineering, launch, and day-to-day operation.",
          bullets: "Product Ownership\nPlatform Engineering\nContinuous Operation",
        },
      ],
    },
  },
  {
    key: "home.partners",
    label: "Partners strip",
    group: "Home",
    type: "logoStrip",
    order: 40,
    fields: {
      heading: "Working with",
      /*
       * Only providers the platform genuinely runs on.
       *
       * Removed: Google Cloud and Supabase (no longer part of the stack), Resend (replaced by
       * PulseAssist Email in #31), and AWS Activate — a startup credits programme is not
       * infrastructure, and listing it beside AWS itself read as two partnerships where there is
       * one. PulseAssist is deliberately absent too: it is ENICE's own product, and a company
       * does not belong in its own partners strip.
       *
       * Migrations 3 and 4 seed the old six, so migration 18 replaces them for any database that
       * already ran those.
       */
      items: [
        {
          name: "Amazon Web Services",
          tagline: "Cloud Infrastructure",
          logo: "/partners/aws.svg",
          url: "https://aws.amazon.com",
        },
        {
          name: "Vercel",
          tagline: "Edge Delivery",
          logo: "/partners/vercel.svg",
          url: "https://vercel.com",
        },
        {
          name: "Railway",
          tagline: "Application Infrastructure",
          logo: "/partners/railway.svg",
          url: "https://railway.com",
        },
      ],
    },
  },
  {
    key: "home.faq",
    label: "Frequently asked questions",
    group: "Home",
    type: "faq",
    order: 50,
    fields: {
      eyebrow: "Frequently asked",
      heading: "Questions, answered.",
      subheading: "A plain look at the company, the products, and the technology behind them.",
      items: [
        {
          question: "What does ENICE Group build?",
          answer:
            "ENICE Group builds and operates technology products for financial services, commerce, and business communication. PulsePay is our digital financial platform. PulseAssist handles AI-powered business communication and customer support.",
        },
        {
          question: "Which problems are ENICE products built to solve?",
          answer:
            "Our products focus on financial services, telecommunications, and business operations. PulsePay covers digital finance, PulseAssist covers business communication and customer support, and ePulse and PulseX extend the ecosystem into digital banking and digital assets.",
        },
        {
          question: "What does the ENICE Core provide?",
          answer:
            "A shared AI and automation pipeline, a fast ledger and payment core, an automated KYC and compliance layer, and a global cloud grid. Every product inherits the same scale, security, and observability from day one.",
        },
        {
          question: "How does ENICE Group approach security and compliance?",
          answer:
            "We run a zero-trust architecture with per-tenant database isolation, row-level security, audit logging, and continuous monitoring. Every system is built for regulatory readiness from day one and aligned with SOC 2 control objectives.",
        },
        {
          question: "How can businesses access ENICE products?",
          answer:
            "Businesses and institutions can reach the ENICE team through the Contact page to ask about product access, licensing, or integration requirements.",
        },
      ],
    },
  },
  {
    key: "home.cta",
    label: "Closing call to action",
    group: "Home",
    type: "cta",
    order: 60,
    fields: {
      heading: "Talk to the ENICE Group team",
      subheading: "Product access, platform integration, enterprise licensing, or partnerships.",
      ctaLabel: "Contact us",
      ctaUrl: "/contact",
      style: "prominent",
    },
  },
  /*
   * The platform-capabilities band and the roadmap, previously hardcoded in their components.
   *
   * Both describe things that change on their own schedule — a mechanism the platform gains, a
   * milestone that ships or slips — and neither needed source code to say so. Migration 13 seeds
   * the same two rows into existing databases.
   */
  {
    key: "home.capabilities",
    label: "Platform capabilities",
    group: "Home",
    type: "featureGrid",
    order: 35,
    fields: {
      eyebrow: "Platform capabilities",
      heading: "How the platform is built.",
      subheading:
        "Mechanisms in place across every product. Current availability is reported on the status page.",
      // `kicker` is the small uppercase label, `title` the figure beneath it, `description` the
      // supporting line. See src/components/site/NetworkMetrics.tsx.
      items: [
        {
          icon: "Gauge",
          kicker: "API delivery",
          title: "Edge",
          description: "Multi-region, served from the nearest edge",
        },
        {
          icon: "Activity",
          kicker: "Tenant isolation",
          title: "Row-level",
          description: "Enforced in the database, not the application",
        },
        {
          icon: "ShieldCheck",
          kicker: "Data encryption",
          title: "TLS + at rest",
          description: "Managed database and object storage",
        },
        {
          icon: "Zap",
          kicker: "Card issuance",
          title: "< 5s",
          description: "Virtual card provisioning",
        },
        {
          icon: "Lock",
          kicker: "KYC verification",
          title: "Real-time",
          description: "Automated compliance checks",
        },
      ],
    },
  },
  {
    key: "home.roadmap",
    label: "Strategic roadmap",
    group: "Home",
    type: "steps",
    order: 45,
    fields: {
      heading: "Built step by step, for the long run.",
      subheading:
        "Our roadmap follows the maturity of the platforms we operate, sequenced so each step builds on the last.",
      /*
       * Each milestone is one step. A step carries a title and a description, so the four things a
       * milestone needs beyond those — timeframe, status, product and tags — are written as
       * `label: value` lines at the top of the description, with the body after a blank line:
       *
       *   when: Q4 2026
       *   status: in-progress
       *   product: PulseAssist
       *   tags: AI, B2B, Telecom
       *
       *   First rollout of support automation …
       *
       * `status` is one of `completed`, `in-progress` or `planned`; anything else resolves to
       * `planned`. See `parseMilestone` in src/components/site/Roadmap.tsx.
       *
       * Note the ceiling: `SECTION_SCHEMAS.steps` caps its repeater at 8 rows, and there are nine
       * milestones, so this seed is trimmed to eight by `sanitizeSectionFields` on a fresh install
       * and the ninth ("Universal Financial Hub") arrives only via migration 13, which writes the
       * JSON directly. Raising that cap to 12 — the figure `featureGrid` already uses — is a
       * one-line change in `src/lib/cms/types.ts` and is the real fix; it is deliberately not made
       * here because this change set does not touch the shared schema.
       */
      items: [
        {
          title: "Shared Ecosystem Framework",
          description:
            "when: Q1 2026\nstatus: completed\nproduct: ENICE Core\ntags: Infrastructure, AI, Compliance\n\nThe unified AI pipeline, ledger, and compliance backbone that now underpins every ENICE product.",
        },
        {
          title: "Extended Pilot with Regional Treasury Partners",
          description:
            "when: Q3 2026\nstatus: completed\nproduct: PulsePay\ntags: Fintech, Wallets, KYC\n\nProgrammable wallets, instant virtual card issuance, and embedded compliance controls, rolled out to a wider pilot group across West Africa.",
        },
        {
          title: "Enterprise B2B Launch",
          description:
            "when: Q4 2026\nstatus: in-progress\nproduct: PulseAssist\ntags: AI, B2B, Telecom\n\nFirst rollout of support automation to banking, fintech, and telecom partners, with policy-bound agents and live-agent failover.",
        },
        {
          title: "Developer API Public Beta",
          description:
            "when: Q2 2026\nstatus: in-progress\nproduct: PulsePay\ntags: API, Developer, Fintech\n\nThe ENICE Core API opens to verified integration partners, with wallet issuance, ledger, KYC, and Assist endpoints available in a sandbox.",
        },
        {
          title: "Multi-Currency Expansion",
          description:
            "when: Q3 2026\nstatus: planned\nproduct: PulsePay\ntags: Fintech, Multi-Currency, Treasury\n\nMulti-currency wallet rails, programmable spend controls, and embedded treasury operations for the payment platform.",
        },
        {
          title: "DevaPay Launch",
          description:
            "when: Q1 2027\nstatus: planned\nproduct: PulsePay\ntags: Fintech, Payments, API\n\nDevaPay launches: a unified API for businesses to accept and manage customer payments, with real time status updates and webhook notifications.",
        },
        {
          title: "Global Digital Asset Exchange Private Beta",
          description:
            "when: Q3 2027\nstatus: planned\nproduct: PulseX\ntags: Crypto, Exchange, Global\n\nPulseX opens to institutional and qualified retail participants, with support for major digital asset pairs, custody, and compliance reporting.",
        },
        {
          title: "Digital Banking Infrastructure Closed Alpha",
          description:
            "when: Q4 2027\nstatus: planned\nproduct: ePulse\ntags: Banking, Alpha\n\nePulse begins closed alpha with select institutional partners: digital banking core, account management, and statement APIs.",
        },
        {
          title: "Universal Financial Hub",
          description:
            "when: 2027\nstatus: planned\nproduct: ENICE Core\ntags: Infrastructure, Global, Liquidity\n\nA global virtual-dollar and asset infrastructure layer connecting institutional liquidity across markets through a single API.",
        },
      ],
    },
  },
  /*
   * The last two hardcoded bands on the homepage: the three principles under the product grid, and
   * the mechanisms strip at the foot of the ENICE Core band.
   *
   * Neither band renders a heading of its own, so both seed one for the admin list only — a section
   * with no label in the section list is unnavigable, and `featureGrid` requires the field anyway.
   * Nothing on the page reads it. Migration 14 seeds the same two rows into existing databases.
   */
  {
    key: "home.principles",
    label: "Build principles",
    group: "Home",
    type: "featureGrid",
    order: 31,
    fields: {
      // Admin-facing only; the band renders the cards and nothing above them.
      heading: "Build principles",
      // `title` is the card heading, `description` the line beneath it.
      items: [
        {
          title: "Built around real problems",
          description: "We start with problems people and businesses actually face.",
        },
        {
          title: "Built to grow",
          description: "Our products are designed to support users as their needs grow.",
        },
        {
          title: "Built in Africa",
          description:
            "We understand the realities of African markets and build with those realities in mind.",
        },
      ],
    },
  },
  {
    key: "home.mechanisms",
    label: "Platform mechanisms",
    group: "Home",
    type: "featureGrid",
    order: 33,
    fields: {
      // Admin-facing only; the band renders the sentence and the pills, with no heading.
      heading: "Platform mechanisms",
      subheading:
        "Regulated in the Federal Republic of Nigeria. These are mechanisms the platform implements, not certifications we hold.",
      /*
       * `title` is the pill's label and `icon` its glyph.
       *
       * The hero's trust-signal strip renders the first three of these rows: it was a second
       * hardcoded copy of the same three strings, and `hero` has neither a repeater nor a spare
       * text field to hold them. See `COMPLIANCE_BADGES` in src/routes/index.tsx.
       */
      items: [
        { icon: "ShieldCheck", title: "Row-level security" },
        { icon: "Lock", title: "Per-tenant isolation" },
        { icon: "Check", title: "Audit logging" },
        { icon: "Wifi", title: "Encrypted in transit and at rest" },
      ],
    },
  },
  {
    key: "about.hero",
    label: "About page header",
    group: "About",
    type: "hero",
    order: 105,
    fields: {
      eyebrow: "About ENICE Group",
      heading: "We build technology products. [[Then we operate them.]]",
      subheading:
        "ENICE Group is the parent company behind a growing set of software products. We find real problems in financial services, commerce, and business communication, then build and run the platforms that solve them.",
    },
  },
  {
    key: "about.story",
    label: "Our Story",
    group: "About",
    type: "prose",
    order: 130,
    fields: {
      heading: "Our Story",
      body: "ENICE Group started from one observation: the biggest problems facing African businesses aren't problems of ambition, they're problems of infrastructure. The software systems and financial rails that large organisations rely on elsewhere have historically been too expensive, too inaccessible, or simply missing for businesses in emerging markets.\n\nWe're building more than one product on the same foundation. The same engineering standards and shared infrastructure can support multiple purpose-built platforms, each serving a distinct need and strengthening the system around it.\n\nThis isn't a collection of separate experiments. It's a deliberate approach: shared infrastructure compounds in value, and the quality of one product raises the bar for whatever we build next.",
    },
  },
  {
    key: "about.mission",
    label: "Our Mission",
    group: "About",
    type: "prose",
    order: 140,
    fields: {
      heading: "Our Mission",
      body: "We want to build the technology layer that lets businesses, institutions, and developers across Africa, and eventually beyond, operate at real scale. Not software that works well enough, but software built with the reliability, security, and performance that institutional operations require.\n\nOur customers aren't test users. They're financial service providers, enterprise operations teams, and technology builders who need infrastructure they can stake their business on. We serve them with platforms that are secure by design and built to hold up under real commercial volume.\n\nWe're aiming for structural impact, not just features. When payment infrastructure is reliable, commerce expands. When enterprise AI is trustworthy, teams get more done. When developer tools are solid, the next generation of companies gets built faster. That's the impact we're here for.",
    },
  },
  {
    key: "about.vision",
    label: "Our Vision",
    group: "About",
    type: "prose",
    order: 150,
    fields: {
      heading: "Our Vision",
      body: "Over the next ten to twenty years, we want to build what Africa doesn't yet have: a home-grown technology infrastructure group that competes globally, not one that just follows trends.\n\nWe're building toward a future where African-originated financial infrastructure is trusted across multiple continents, where enterprise AI built here sets the regional standard for reliability, and where developer tools from our ecosystem are chosen by builders worldwide because they're simply good.\n\nThat's a ten-to-twenty-year project. It takes discipline and patience most organisations aren't built to sustain. We're structured for the long run, not the short cycle of a typical startup.",
    },
  },
  {
    key: "about.ecosystem",
    label: "Our Ecosystem",
    group: "About",
    type: "prose",
    order: 160,
    fields: {
      heading: "Our Ecosystem",
      body: "The most important part of the ENICE Group model isn't any single product, it's the infrastructure they share. Every product we build runs on the same engineering foundation: the same security architecture, the same zero-trust access model, the same data isolation standards, and the same deployment pipeline.\n\nThat shared foundation pays off twice. Each new product reaches production-grade reliability faster, because the hard infrastructure problems are already solved at the group level. And each existing product gets stronger as we add new ones, through shared investment and shared operational standards.\n\nThe result is a set of products that gets more capable with each addition. Security improvements spread across the ecosystem. Infrastructure work lifts every product. Compliance work done once serves every regulated platform.\n\nThat's why we call it an ecosystem rather than a collection of products. They're built to compound.",
    },
  },
  {
    key: "about.outlook",
    label: "Looking Ahead",
    group: "About",
    type: "prose",
    order: 170,
    fields: {
      heading: "Looking Ahead",
      body: "The financial and technological infrastructure African businesses depend on is still largely being built. That's not a criticism, it's just where things stand, and it's the opportunity we're focused on.\n\nWe want to build the systems businesses on this continent will run on for the next generation. This isn't charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it.\n\nWe're also building for a global market. What we build will scale across regions, meet international compliance standards, and compete with any equivalent platform anywhere. We're not trying to be the best option in Nigeria or in Africa. We're trying to be the best option, period.\n\nTo the businesses that use our products, and the engineers and operators who build with us: we're committed to building technology that matters, to a standard that matters, and taking the time it takes to do it properly.",
    },
  },
  {
    key: "about.values",
    label: "How we work",
    group: "About",
    type: "featureGrid",
    order: 120,
    fields: {
      heading: "Our Principles",
      subheading:
        "These aren't aspirational values written for a careers page. They're the standards we hold every decision, every system, and every person on the team to.",
      items: [
        {
          title: "Long-Term Thinking",
          description:
            "We evaluate decisions against decades, not quarters. We want companies that outlast trends and survive economic cycles. We won't trade long-term integrity for short-term convenience.",
        },
        {
          title: "Engineering Excellence",
          description:
            "We hold our engineering to the standards of regulated industries. Our codebases are documented, our APIs are versioned and backward-compatible, and our system designs favour resilience over novelty.",
        },
        {
          title: "Security by Design",
          description:
            "Security isn't added after a product ships. It's built in from the start. Zero-trust architecture, per-tenant data isolation, end-to-end encryption, and continuous threat modelling are standard across every product we run. We treat our partners' data as our responsibility.",
        },
        {
          title: "Customer Obsession",
          description:
            "We measure ourselves by outcomes for the people we serve, not feature counts. Every product decision traces back to a real constraint facing a specific type of business, and our job is to remove it.",
        },
        {
          title: "Institutional Quality",
          description:
            "We build for enterprise, not for early adopters willing to tolerate rough edges. Our documentation, onboarding, support, and SLA commitments are built to satisfy legal, compliance, and procurement teams at serious organisations.",
        },
        {
          title: "Responsible AI",
          description:
            "AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don't release a capability until we're confident in its reliability and we can explain how it works.",
        },
        {
          title: "Continuous Innovation",
          description:
            "Staying relevant takes sustained investment in research and experimentation. It isn't one team's job, it's built into how every product team works. We set aside engineering time for exploratory work because what we build in five years doesn't have a name yet.",
        },
        {
          title: "Ownership Mentality",
          description:
            "Everyone at ENICE, from engineers to operations leads, is expected to think like an owner: accountable, deeply knowledgeable in their domain, and biased toward action. We trust people to lead, and we hold them to that standard.",
        },
      ],
    },
  },
  /*
   * The last four hardcoded bands on the About page: "What We Build" and its sector tiles, the
   * founding team, and the closing statement. Migration 14 seeds the same rows into existing
   * databases.
   */
  {
    key: "about.build",
    label: "What We Build",
    group: "About",
    type: "prose",
    order: 152,
    fields: {
      heading: "What We Build",
      /*
       * Blank lines separate paragraphs; see `fieldParagraphs` in src/lib/cms/use-section.ts.
       *
       * Two markers in this copy are read at render:
       *
       *   * `{liveProducts}` is replaced with the number of products whose stage is `available`,
       *     derived from the product registry. Writing the figure by hand is how it goes stale the
       *     day a product ships, which is what it used to do.
       *   * `**PulsePay**` and `**PulseAssist**` render as the band's bold runs. A text field
       *     cannot carry HTML — `StyledText` interprets none — so the marker carries the emphasis.
       */
      body: "We find a real gap, design a product around what it takes to close it, build it to a high standard, launch it, and then operate it with the same discipline we used to build it. We don't hand products off. We own the full lifecycle.\n\nWe work across areas where technical complexity meets real-world consequence: financial infrastructure and digital banking, AI-powered enterprise communication and automation, developer tools and API infrastructure, digital commerce systems, cloud infrastructure, and longer-horizon research.\n\nOur {liveProducts} current products are the foundation of this. **PulsePay** is our financial infrastructure platform, a Naira-native payment processing and digital banking system built for Nigerian businesses, from high-frequency transactions to compliance. **PulseAssist** is our enterprise AI platform, a communication and automation layer that helps enterprise teams cut down on procedural overhead.\n\nThese are the first two products in a lineup we plan to grow the same way: deliberately, and to a high standard.",
    },
  },
  {
    key: "about.verticals",
    label: "Sectors we build in",
    group: "About",
    type: "featureGrid",
    order: 153,
    fields: {
      // Admin-facing only; the grid sits under the "What We Build" band and renders no heading.
      heading: "Sectors we build in",
      // `title` is the small uppercase label, `description` the line beneath it.
      items: [
        {
          title: "Financial Infrastructure",
          description:
            "Core transaction rails, digital banking architecture, and payment processing systems.",
        },
        {
          title: "Enterprise AI",
          description: "Automated communication and process automation for enterprise teams.",
        },
        {
          title: "Developer Infrastructure",
          description:
            "APIs, SDKs, and tooling that give builders a reliable foundation to scale on.",
        },
        {
          title: "Digital Commerce",
          description:
            "Commerce platforms built for high transaction volume and institutional standards.",
        },
        {
          title: "Cloud Infrastructure",
          description:
            "Region-aware deployment systems with security and compliance built into the architecture.",
        },
        {
          title: "Future Technology",
          description:
            "Long-horizon research programmes exploring what comes after our current products.",
        },
      ],
    },
  },
  {
    key: "about.leadership",
    label: "The Founding Team",
    group: "About",
    type: "featureGrid",
    order: 154,
    fields: {
      heading: "The Founding Team",
      /*
       * The note under the cards, not the lead above them.
       *
       * `featureGrid` carries one supporting-copy field and this sentence is the one that changes,
       * because it carries the contact address. The link itself stays in code: whichever part of
       * this sentence is the email address is rendered as a `mailto:` anchor, so an edit cannot
       * break the link and cannot inject markup. The lead paragraph above the cards is therefore
       * still in src/routes/about.tsx. See that file.
       */
      subheading:
        "Our founding team prefers to let the work speak. Executive contact is available through corporate@enicehq.com for qualified enterprise and partnership inquiries.",
      // `title` is the role, `description` the scope, `kicker` the letters in the avatar tile.
      items: [
        {
          kicker: "CEO",
          title: "Founder & Chief Executive Officer",
          description: "Corporate strategy, venture direction, and ecosystem growth.",
        },
        {
          kicker: "CTO",
          title: "Chief Technology Officer",
          description: "Platform architecture, engineering standards, and infrastructure design.",
        },
        {
          kicker: "COO",
          title: "Chief Operations Officer",
          description: "Product delivery, partner operations, and compliance execution.",
        },
      ],
    },
  },
  {
    key: "about.closing",
    label: "Closing statement",
    group: "About",
    type: "prose",
    order: 172,
    fields: {
      // A `prose` section has a heading and a body, so the attribution is the heading — otherwise
      // the quote would be editable and the signature under it would not.
      heading: "— The Founders, ENICE Group",
      body: "\"The infrastructure a society depends on is the most durable thing it can build. That's what we're here to build.\"",
    },
  },
  {
    key: "portfolio.index",
    label: "Products page",
    group: "Portfolio",
    type: "hero",
    order: 200,
    fields: {
      eyebrow: "ENICE Products",
      heading: "Products built by ENICE Group",
      subheading:
        "Payments, financial services, business communication, and digital commerce. Each product runs on the same infrastructure and is built to operate at scale.",
    },
  },
  {
    key: "portfolio.pulsepay",
    label: "PulsePay page",
    group: "Portfolio",
    type: "hero",
    order: 210,
    fields: {
      eyebrow: "Fintech Infrastructure Platform",
      heading: "PulsePay",
      subheading:
        "A virtual payment platform that issues Naira and USD cards, handles KYC verification, moves funds between users, and delivers value-added services with speed and reliability.",
    },
  },
  {
    key: "portfolio.pulseassist",
    label: "PulseAssist page",
    group: "Portfolio",
    type: "hero",
    order: 220,
    fields: {
      eyebrow: "Enterprise Conversational SaaS",
      heading: "PulseAssist",
      subheading:
        "A multi-tenant AI operations platform for telecoms and financial networks. It handles customer support routing, provides API-driven account management, and hands calls to live agents in real time when needed.",
    },
  },
  {
    key: "portfolio.epulse",
    label: "ePulse page",
    group: "Portfolio",
    type: "hero",
    order: 230,
    fields: {
      heading: "e[[Pulse]]",
      subheading:
        "ePulse is ENICE Group's upcoming global financial platform, built for people who **earn, send, and spend money across borders**. Designed for freelancers, remote workers, creators, and global businesses, ePulse aims to make international finance *simple and accessible*.",
    },
  },
  {
    key: "portfolio.pulsex",
    label: "PulseX page",
    group: "Portfolio",
    type: "hero",
    order: 240,
    fields: {
      heading: "Pulse[[X]]",
      subheading:
        "PulseX is ENICE Group's digital asset platform, designed to make cryptocurrency and digital finance **simple, secure, and accessible**. The platform will let users manage digital assets easily, while staying connected to the broader ENICE ecosystem.",
    },
  },
  {
    key: "portfolio.devapay",
    label: "DevaPay page",
    group: "Portfolio",
    type: "hero",
    order: 250,
    fields: {
      heading: "DevaPay",
      subheading:
        "Simple, reliable payment infrastructure for modern businesses. Accept and manage customer payments through a single, developer friendly integration.",
    },
  },
  /*
   * The bands *inside* each product page, previously hardcoded in the route components.
   *
   * Migration 11 made each product page's header editable and stopped there, so the capability
   * grids, the facts strips, the sector tiles and the compliance pills below them still needed a
   * deploy to change — which is the content that moves most on a product page. Each band is an
   * existing section type, so the admin form and the sanitiser already understand it, and each
   * component keeps its built-in copy as the fallback. Migration 13 seeds the same rows into
   * existing databases.
   *
   * `sort_order` follows the order the bands appear on their page, inside the block already
   * reserved for that page by migration 11 (210 PulsePay, 220 PulseAssist, 230 ePulse, 240 PulseX,
   * 250 DevaPay).
   */
  {
    key: "portfolio.pulsepay.stats",
    label: "PulsePay facts strip",
    group: "Portfolio",
    type: "statistics",
    order: 211,
    fields: {
      heading: "PulsePay at a glance",
      // Only figures that can be checked: `< 5s — Card issuance time` was removed from this strip
      // because there is no published benchmark behind it.
      items: [
        { value: "Naira & USD", label: "Card currencies" },
        { value: "2", label: "Currency rails (NGN + USD)" },
        { value: "Every account", label: "KYC screening" },
      ],
    },
  },
  {
    key: "portfolio.pulsepay.features",
    label: "PulsePay capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 212,
    fields: {
      eyebrow: "Platform Capabilities",
      heading: "Everything a modern payments stack should be.",
      subheading:
        "PulsePay covers the full payments stack: issuance, compliance, transfers, and spending controls, in one integrated platform.",
      items: [
        {
          icon: "CreditCard",
          title: "Instant virtual card issuance",
          description: "Issue Naira and USD virtual cards in seconds for individuals and teams.",
        },
        {
          icon: "ShieldCheck",
          title: "Built-in KYC verification",
          description:
            "Identity verification and compliance checks built directly into the onboarding flow.",
        },
        {
          icon: "Users",
          title: "Peer-to-peer transfers",
          description: "Move funds between users and fund wallets instantly with no friction.",
        },
        {
          icon: "Lock",
          title: "Programmable spend controls",
          description: "Set granular limits and rules for individuals, teams, and departments.",
        },
        {
          icon: "Zap",
          title: "Value-added services",
          description:
            "Bill payments, airtime, utilities, and more built directly into the platform.",
        },
        {
          icon: "BarChart3",
          title: "Enterprise fraud monitoring",
          description: "Real-time transaction screening and anomaly detection at every step.",
        },
      ],
    },
  },
  {
    key: "portfolio.pulsepay.compliance",
    label: "PulsePay compliance",
    group: "Portfolio",
    type: "featureGrid",
    order: 213,
    fields: {
      eyebrow: "Compliance & Regulation",
      heading: "Built for regulated markets from the ground up.",
      subheading:
        "PulsePay operates within Nigeria's regulatory framework, with row-level security, KYC screening on every account, and audit logging of privileged actions. PulsePay holds no third-party security certification today, and we will tell you so directly rather than imply otherwise.",
      // A plain list of mechanism names rendered as pills, so only each row's title is read.
      items: [
        { title: "Row-Level Security" },
        { title: "Tenant Isolation" },
        { title: "Audit Logging" },
        { title: "KYC Screening" },
      ],
    },
  },
  {
    key: "portfolio.pulseassist.stats",
    label: "PulseAssist facts strip",
    group: "Portfolio",
    type: "statistics",
    order: 221,
    fields: {
      heading: "PulseAssist at a glance",
      // `∞ — Concurrent sessions` and `100% — Audit coverage` were removed from this strip: one is
      // an invented capacity claim, the other a measured figure nothing measures.
      items: [
        { value: "WhatsApp · Web · Email · SMS · Voice", label: "Channels" },
        { value: "Multi-tenant", label: "Architecture" },
      ],
    },
  },
  {
    key: "portfolio.pulseassist.features",
    label: "PulseAssist capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 222,
    fields: {
      eyebrow: "Platform Capabilities",
      heading: "Operations that run themselves.",
      subheading:
        "PulseAssist covers the full customer operations lifecycle, from first contact to resolution, without needing a human for every interaction.",
      items: [
        {
          icon: "Inbox",
          title: "Five channels, one inbox",
          description:
            "WhatsApp, web chat, email, SMS and voice answered from a single shared inbox, so support is consistent wherever people reach you.",
        },
        {
          icon: "MessageSquare",
          title: "Autonomous support routing",
          description:
            "AI-driven triage and routing that resolves common queries without human intervention.",
        },
        {
          icon: "ShieldCheck",
          title: "Policy-bound agents",
          description:
            "Conversational agents that operate strictly within configurable organisational policies.",
        },
        {
          icon: "Zap",
          title: "Real-time live-agent handoff",
          description: "Escalation to a human agent mid-conversation, with full context preserved.",
        },
        {
          icon: "Globe",
          title: "API-driven account management",
          description:
            "Agents can query and update account state through secure, scoped API integrations.",
        },
        {
          icon: "Network",
          title: "Multi-tenant architecture",
          description:
            "Enterprise-grade isolation between clients with dedicated model and routing configs.",
        },
        {
          icon: "FileCheck2",
          title: "Compliance-ready audit trails",
          description:
            "Every interaction is logged, timestamped, and exportable for regulatory review.",
        },
      ],
    },
  },
  {
    key: "portfolio.pulseassist.sectors",
    label: "PulseAssist sectors served",
    group: "Portfolio",
    type: "featureGrid",
    order: 223,
    fields: {
      eyebrow: "Sectors Served",
      heading: "Built for compliance-heavy industries.",
      // Icon tiles with a name only, so each row's title is the tile's label.
      items: [
        { icon: "BarChart3", title: "Banking & Fintech" },
        { icon: "Users", title: "Telecom Operators" },
        { icon: "Globe", title: "Insurance" },
        { icon: "ShieldCheck", title: "Compliance-heavy Enterprises" },
      ],
    },
  },
  {
    key: "portfolio.pulseassist.compliance",
    label: "PulseAssist compliance",
    group: "Portfolio",
    type: "featureGrid",
    order: 224,
    fields: {
      eyebrow: "Enterprise Compliance",
      heading: "Every interaction is compliant by design.",
      subheading:
        "PulseAssist maintains comprehensive audit trails of every agent interaction. Policy configurations are version-controlled, every model decision is logged, and all data is tenant-isolated, meeting the regulatory requirements of banking and telecom in Africa and beyond.",
      items: [
        { title: "Tenant Isolation" },
        { title: "Audit Logs" },
        { title: "Policy Versioning" },
        { title: "Row-Level Security" },
      ],
    },
  },
  {
    key: "portfolio.epulse.facts",
    label: "ePulse launch facts",
    group: "Portfolio",
    type: "statistics",
    order: 231,
    fields: {
      heading: "ePulse launch framing",
      // The accent on the first row is styling, derived by position in the component, so it is not
      // stored here. See `LAUNCH_FACTS` in src/routes/portfolio.epulse.tsx.
      items: [
        { value: "In Development", label: "Status" },
        { value: "To Be Announced", label: "Expected Launch" },
      ],
    },
  },
  {
    key: "portfolio.epulse.audience",
    label: "ePulse audience",
    group: "Portfolio",
    type: "featureGrid",
    order: 232,
    fields: {
      eyebrow: "Built For",
      heading: "People who live and work globally.",
      items: [
        {
          icon: "Briefcase",
          title: "Freelancers",
          description: "Get paid in USD, GBP, or EUR directly from international clients.",
        },
        {
          icon: "Users",
          title: "Remote Workers",
          description: "Receive your salary, save in multiple currencies, spend globally.",
        },
        {
          icon: "CreditCard",
          title: "Creators",
          description: "Monetise your content globally and manage earnings in one place.",
        },
        {
          icon: "Globe2",
          title: "Global Businesses",
          description: "Pay international suppliers and accept payments from anywhere.",
        },
      ],
    },
  },
  {
    key: "portfolio.epulse.vision",
    label: "ePulse vision",
    group: "Portfolio",
    type: "featureGrid",
    order: 233,
    fields: {
      eyebrow: "The Vision",
      heading: "International finance, made simple.",
      subheading:
        "The ePulse platform includes everything you need to live your financial life without borders, from day-to-day spending to long-distance transfers to lifestyle services.",
      items: [
        {
          icon: "Wallet",
          title: "Multi-currency accounts",
          description:
            "Hold and manage balances in the currencies that matter to you: NGN, USD, GBP, EUR and more, from a single account.",
        },
        {
          icon: "Building2",
          title: "Dedicated receiving accounts",
          description:
            "Local account details for supported countries, including the US, UK, and Europe. Get paid like a local from anywhere.",
        },
        {
          icon: "Send",
          title: "Fast international transfers",
          description:
            "Send money across borders with predictable timing, transparent fees, and clear pricing. No surprises.",
        },
        {
          icon: "Globe2",
          title: "Global payment solutions",
          description:
            "Pay and get paid anywhere your work takes you, from client invoices to vendor payments across continents.",
        },
        {
          icon: "Gift",
          title: "Gift card marketplace",
          description:
            "Buy and redeem gift cards from trusted global and local brands, all within the ePulse platform.",
        },
        {
          icon: "Plane",
          title: "Lifestyle services",
          description:
            "Book hotels, plan travel, and access premium experiences. Good finance should make life easier too.",
        },
      ],
    },
  },
  {
    key: "portfolio.pulsex.facts",
    label: "PulseX launch facts",
    group: "Portfolio",
    type: "statistics",
    order: 241,
    fields: {
      heading: "PulseX launch framing",
      items: [
        { value: "Planned Project", label: "Status" },
        { value: "Q3 2027", label: "Launch" },
        { value: "Digital Assets", label: "Category" },
      ],
    },
  },
  {
    key: "portfolio.pulsex.highlights",
    label: "PulseX capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 242,
    fields: {
      eyebrow: "Platform Capabilities",
      heading: "Digital assets, without the friction.",
      subheading:
        "PulseX will let users manage digital assets easily, fully integrated across the broader ENICE Group ecosystem.",
      items: [
        {
          icon: "BarChart3",
          title: "Multi-asset trading",
          description:
            "Trade major digital assets with deep liquidity and institutional-grade execution: Bitcoin, Ethereum, and beyond.",
        },
        {
          icon: "Lock",
          title: "Secure custody",
          description:
            "Cold storage, multi-signature protection, and continuous on-chain monitoring for every asset in your portfolio.",
        },
        {
          icon: "Layers",
          title: "Ecosystem-native",
          description:
            "Move between PulseX, PulsePay, and ePulse without leaving the ENICE stack: one account, every service.",
        },
        {
          icon: "Globe",
          title: "Built for scale",
          description:
            "Global access with compliance and reporting designed for regulated markets from day one, in Africa, Europe, and beyond.",
        },
        {
          icon: "Zap",
          title: "Instant settlement",
          description:
            "Near-instant on-chain and off-chain settlement rails so your capital moves as fast as the market does.",
        },
        {
          icon: "ShieldCheck",
          title: "Regulatory-ready",
          description:
            "Compliance built in from the ground up: KYC, AML, and transaction monitoring at the core.",
        },
      ],
    },
  },
  {
    key: "portfolio.devapay.facts",
    label: "DevaPay launch facts",
    group: "Portfolio",
    type: "statistics",
    order: 251,
    fields: {
      heading: "DevaPay launch framing",
      items: [
        { value: "Planned", label: "Status" },
        { value: "Q1 2027", label: "Launch" },
        { value: "Payments", label: "Category" },
      ],
    },
  },
  {
    key: "portfolio.devapay.audience",
    label: "DevaPay audience",
    group: "Portfolio",
    type: "featureGrid",
    order: 252,
    fields: {
      eyebrow: "Built For",
      heading: "From online businesses to growing enterprises.",
      items: [
        {
          icon: "Globe2",
          title: "Online Businesses",
          description: "Accept customer payments without stitching together separate providers.",
        },
        {
          icon: "Code2",
          title: "SaaS Platforms",
          description: "Add payment collection to your product through one integration.",
        },
        {
          icon: "ShoppingCart",
          title: "Marketplaces",
          description: "Manage payments across many sellers and transactions from one place.",
        },
        {
          icon: "TrendingUp",
          title: "Growing Enterprises",
          description: "Infrastructure built to scale with transaction volume, not against it.",
        },
      ],
    },
  },
  {
    key: "portfolio.devapay.capabilities",
    label: "DevaPay capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 253,
    fields: {
      eyebrow: "Key Capabilities",
      heading: "Payments, made easier to collect and scale.",
      subheading:
        "DevaPay is being built as part of ENICE Group's broader financial infrastructure, giving businesses the tools to run modern payment experiences.",
      items: [
        {
          icon: "Code2",
          title: "Unified payment API",
          description: "Accept payments through a single, developer friendly integration.",
        },
        {
          icon: "Zap",
          title: "Real time status updates",
          description: "Track transactions and payment status as they happen, not after the fact.",
        },
        {
          icon: "Webhook",
          title: "Webhook notifications",
          description:
            "Get notified the moment a payment is received, so your product can react instantly.",
        },
        {
          icon: "Store",
          title: "Merchant management",
          description: "View and manage merchants and transactions from a single, clear dashboard.",
        },
        {
          icon: "Users",
          title: "Built for platforms",
          description:
            "Designed for businesses that collect payments on behalf of others, at any scale.",
        },
        {
          icon: "CheckCircle2",
          title: "Reliable by design",
          description:
            "Payment infrastructure built to stay dependable as transaction volume grows.",
        },
      ],
    },
  },
  {
    key: "contact.details",
    label: "Contact details",
    group: "Contact",
    type: "contact",
    order: 210,
    fields: {
      eyebrow: "Corporate Engagement",
      heading: "Get in Touch",
      subheading:
        "Reach the ENICE Group team about product access, platform integration, enterprise licensing, or technology partnerships.",
      email: "corporate@enicehq.com",
      showForm: true,
    },
  },
];

/**
 * Paths that already exist as hand-built React routes.
 *
 * Seeded as `system_route` pages so their SEO and managed sections are editable from day one
 * while their addresses stay fixed. Marked `published` because they are already live — seeding
 * them as drafts would misrepresent the state of the website.
 */
const SYSTEM_PAGES: { path: string; title: string; summary: string }[] = [
  { path: "/", title: "Home", summary: "The ENICE Group homepage." },
  { path: "/about", title: "About ENICE Group", summary: "Company story, mission, and approach." },
  { path: "/portfolio", title: "Products", summary: "The ENICE Group product portfolio." },
  { path: "/portfolio/pulsepay", title: "PulsePay", summary: "Virtual payment platform." },
  {
    path: "/portfolio/pulseassist",
    title: "PulseAssist",
    summary: "Enterprise AI operations platform.",
  },
  {
    path: "/portfolio/pulseassist-email",
    title: "PulseAssist Email",
    summary: "Transactional and marketing email on a verified domain.",
  },
  { path: "/portfolio/epulse", title: "ePulse", summary: "Global financial platform." },
  { path: "/portfolio/pulsex", title: "PulseX", summary: "Digital asset platform." },
  {
    path: "/portfolio/devapay",
    title: "DevaPay",
    summary: "Payment infrastructure for businesses.",
  },
  { path: "/contact", title: "Contact", summary: "Enquiry form and contact details." },
  { path: "/roadmap", title: "Product Roadmap", summary: "Milestones and what is next." },
  { path: "/blog", title: "Blog and Updates", summary: "The blog, news, and announcements index." },
  { path: "/docs", title: "API Documentation", summary: "ENICE Core API reference." },
  { path: "/status", title: "System Status", summary: "Live availability of the API and website." },
  { path: "/privacy", title: "Privacy Policy", summary: "Legal — privacy." },
  { path: "/terms", title: "Terms of Service", summary: "Legal — terms." },
  { path: "/compliance", title: "Regulatory Compliance", summary: "Legal — compliance." },
];

/**
 * Populates settings, sections and system pages if they are absent.
 *
 * Every statement is `ON CONFLICT DO NOTHING`, so this is safe to run on every cold start and
 * will never overwrite an administrator's edits — which is what makes it usable as an
 * ensure-exists step rather than a one-shot script someone has to remember to run.
 */
export async function seedWebsiteDefaults(): Promise<void> {
  const sql = db();
  const defaults = defaultSettings();

  const settingsRows: [SettingsKey, unknown][] = [
    ["design", defaults.design],
    ["header", defaults.header],
    ["footer", defaults.footer],
    ["seo", defaults.seo],
    [
      "general",
      {
        announcementBarEnabled: defaults.announcementBarEnabled,
        maintenanceNotice: defaults.maintenanceNotice,
      },
    ],
  ];

  for (const [key, value] of settingsRows) {
    await sql`
      INSERT INTO site_settings (key, value) VALUES (${key}, ${json(value)})
      ON CONFLICT (key) DO NOTHING
    `;
  }

  for (const section of DEFAULT_SECTIONS) {
    await sql`
      INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
      VALUES (
        ${section.key}, ${section.label}, ${section.group}, ${section.type}, true, ${"published"},
        ${json(sanitizeSectionFields(section.type, section.fields))}, ${section.order}
      )
      ON CONFLICT (key) DO NOTHING
    `;
  }

  for (const page of SYSTEM_PAGES) {
    await sql`
      INSERT INTO cms_pages (
        id, path, title, summary, status, sections, seo, system_route, published_at
      ) VALUES (
        ${newId()}, ${page.path}, ${page.title}, ${page.summary}, ${"published"},
        ${json([])}, ${json({})}, true, now()
      )
      ON CONFLICT (path) DO NOTHING
    `;
  }
}
