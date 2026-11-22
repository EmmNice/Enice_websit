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
            { id: "nav-pride", label: "PrideTrade", url: "/portfolio/pride", visible: true },
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
            { id: "f-pride", label: "PrideTrade", url: "/portfolio/pride", visible: true },
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
        "ENICE builds and runs payment and digital asset infrastructure for businesses across Africa.",
      copyright: `© ${new Date().getFullYear()} ENICE Technology Limited. All rights reserved.`,
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
      eyebrow: "Financial technology & digital infrastructure",
      heading: "Building the infrastructure behind modern finance.",
      subheading:
        "ENICE develops financial technology and digital asset infrastructure through PulsePay and PrideTrade, creating solutions that simplify payments and expand access to digital financial services.",
      primaryCtaLabel: "Discover our solutions",
      primaryCtaUrl: "/portfolio",
      secondaryCtaLabel: "Contact ENICE",
      secondaryCtaUrl: "/contact",
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
      items: [],
    },
  },
  {
    key: "home.products",
    label: "Product grid",
    group: "Home",
    type: "featureGrid",
    order: 30,
    fields: {
      eyebrow: "What we build",
      heading: "Two platforms, one foundation.",
      subheading:
        "Payments and digital assets, built on the same ledger, compliance and infrastructure.",
      // The three cards the homepage product band renders. `index` numbering is derived from
      // position, and bullets are one per line.
      items: [
        {
          icon: "Banknote",
          kicker: "FINTECH",
          title: "Financial Solutions & Payments",
          description:
            "Flexible credit, transaction networks, and virtual card infrastructure built for Nigeria's digital economy, with room to expand across the region.",
          bullets: "Virtual Card Issuance\nTreasury and Ledger\nKYC and Compliance Tooling",
        },
        {
          icon: "Bitcoin",
          kicker: "DIGITAL ASSETS",
          title: "Digital assets and custody",
          description:
            "Trading and custody for digital assets in one account, with transfers between assets handled in the same place.",
          bullets: "Trading and Custody\nTransfers\nCompliance Controls",
        },
        {
          icon: "Boxes",
          kicker: "SOFTWARE PRODUCTS",
          title: "Software we build and run",
          description:
            "We design, launch, and maintain our own products instead of handing them off after release.",
          bullets: "Product Design\nPlatform Engineering\nDaily Operation",
        },
      ],
    },
  },
  /*
   * The bands below were hardcoded in the page components until now.
   *
   * Several homepage bands were hardcoded until the CMS work was completed. Product, company, and
   * hiring copy remain editable; retired homepage-only rows are removed by migration 28.
   *
   * Each uses an existing section type, so the admin form and its sanitiser already understand
   * them, and each component keeps its built-in copy as the fallback — so an unseeded or
   * unreachable section renders precisely what it renders today.
   */
  {
    key: "home.portfolio",
    label: "Featured products",
    group: "Home",
    type: "featureGrid",
    order: 32,
    fields: {
      eyebrow: "Our products",
      heading: "Start with the product you need, or run both together",
      subheading:
        "Both products are built on the same ENICE Engine, so payments and digital assets share one secure foundation.",
      // `bullets` carries the product's checkable facts, one `Label: Value` pair per line, and
      // `url` is the product page. See `parseFacts` in src/routes/index.tsx.
      items: [
        {
          icon: "CreditCard",
          kicker: "DIGITAL PAYMENTS",
          title: "PulsePay",
          description:
            "A virtual payment platform for modern commerce: instant Naira and USD card issuance, programmable wallets, embedded KYC, and fast peer-to-peer transfers built for businesses and individuals.",
          bullets: "Cards: Naira & USD\nMarket: Nigeria",
          url: "/portfolio/pulsepay",
        },
        {
          icon: "Bitcoin",
          kicker: "DIGITAL ASSETS",
          title: "PrideTrade",
          description:
            "ENICE Group's digital asset platform for cryptocurrency trading, secure custody and transfers, built on its own ledger and controls.",
          bullets: "Launch: 2027\nCategory: Digital assets",
          url: "/portfolio/pride",
        },
      ],
    },
  },
  {
    key: "home.core",
    label: "The ENICE Engine",
    group: "Home",
    type: "featureGrid",
    order: 34,
    fields: {
      eyebrow: "WHAT POWERS OUR PRODUCTS",
      heading: "The ENICE Engine",
      subheading:
        "All of our apps share the same underlying technology—making every product faster, more reliable, and secure right out of the box.",
      items: [
        {
          icon: "Cpu",
          title: "AI & Automation",
          description:
            "Centralized AI tools and smart workflows behind both platforms, from payment reconciliation to asset monitoring.",
        },
        {
          icon: "Database",
          title: "Fast Payments & Ledgers",
          description:
            "A reliable transaction engine and virtual account system that powers PulsePay and future financial tools we build.",
        },
        {
          icon: "FileCheck2",
          title: "Built-In Compliance & KYC",
          description:
            "Identity verification, fraud checks, and security screening running automatically in real time across all our products.",
        },
      ],
    },
  },
  {
    key: "home.company",
    label: "Company band",
    group: "Home",
    type: "featureGrid",
    order: 38,
    fields: {
      eyebrow: "THE COMPANY",
      heading: "ENICE Group builds digital products.",
      subheading:
        "We are the parent company behind a growing suite of software platforms. We identify real challenges across financial services, commerce, and communication, then design, launch, and operate the products that solve them.",
      items: [],
    },
  },
  {
    key: "home.careers",
    label: "Hiring band",
    group: "Home",
    type: "cta",
    order: 60,
    fields: {
      eyebrow: "Work with us",
      heading: "Build useful products.",
      subheading:
        "We work with engineers and product builders who care about clear thinking, solid work, and reliable software.",
      ctaLabel: "Contact the team",
      ctaUrl: "/contact",
      style: "standard",
    },
  },
  /*
   * Faga is the standalone email delivery platform previously presented under PulseAssist.
   * These sections back its product page while PulseAssist remains focused on AI customer
   * operations.
   */
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
            "ENICE Group builds and operates technology products for financial services and digital assets. PulsePay is our digital payments platform and PrideTrade is our digital asset platform. They are separate products, each on its own infrastructure.",
        },
        {
          question: "Which problems are ENICE products built to solve?",
          answer:
            "Our products focus on payments and digital finance. PulsePay covers cards, wallets and transfers for businesses and individuals, and PrideTrade covers trading and custody of digital assets in its own account.",
        },
        {
          question: "What does the ENICE Engine provide?",
          answer:
            "Shared AI and automation, fast payments and ledgers, and built-in compliance and KYC. Every product starts with the same reliable, secure foundation.",
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
  /*
   * The roadmap was hardcoded until now. It changes on its own schedule and should not require
   * source code to update, so migration 13 seeds the same row into existing databases.
   */
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
          title: "PrideTrade Waitlist and Platform Preview",
          description:
            "when: Q4 2026\nstatus: in-progress\nproduct: PrideTrade\ntags: Digital Assets, Custody\n\nEarly access to the digital asset platform ahead of the public launch.",
        },
        {
          title: "Developer API Public Beta",
          description:
            "when: Q2 2026\nstatus: in-progress\nproduct: PulsePay\ntags: API, Developer, Fintech\n\nThe ENICE Core API opens to verified integration partners, with wallet issuance, ledger and KYC endpoints available in a sandbox.",
        },
        {
          title: "Multi-Currency Expansion",
          description:
            "when: H1 2027\nstatus: planned\nproduct: PulsePay\ntags: Fintech, Multi-Currency, Treasury\n\nMulti-currency wallet rails, programmable spend controls, and embedded treasury operations opening to all businesses.",
        },
        {
          title: "PrideTrade Public Launch",
          description:
            "when: 2027\nstatus: planned\nproduct: PrideTrade\ntags: Digital Assets, Trading\n\nTrading, custody and transfers open to early-access accounts.",
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
   * Safeguards shown at the foot of the ENICE Engine section. The heading is admin-facing only;
   * the public page renders the sentence and tags.
   */
  {
    key: "home.mechanisms",
    label: "Platform mechanisms",
    group: "Home",
    type: "featureGrid",
    order: 33,
    fields: {
      // Admin-facing only; the band renders the sentence and the pills, with no heading.
      heading: "ENICE Engine safeguards",
      subheading:
        "Built in compliance with applicable standards in the Federal Republic of Nigeria. Our products operate with enterprise-grade data protection, strict privacy controls, and end-to-end security architecture across all systems.",
      /*
       * `title` is the pill's label and `icon` its glyph.
       *
       * The hero's trust-signal strip renders the first three of these rows: it was a second
       * hardcoded copy of the same three strings, and `hero` has neither a repeater nor a spare
       * text field to hold them. See `COMPLIANCE_BADGES` in src/routes/index.tsx.
       */
      items: [
        { icon: "ShieldCheck", title: "ROW-LEVEL SECURITY" },
        { icon: "Lock", title: "PER-TENANT ISOLATION" },
        { icon: "Check", title: "AUDIT LOGGING" },
        { icon: "Wifi", title: "ENCRYPTED IN TRANSIT AND AT REST" },
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
    key: "about.acronym",
    label: "What the name stands for",
    group: "About",
    type: "featureGrid",
    order: 110,
    fields: {
      heading: "What the name stands for",
      // The full phrase, shown as a lead above the per-letter list, which cannot carry the "in".
      subheading: "Enabling Next-Generation Innovations in Customer Experience.",
      // `title` is the word; the initial the page shows beside it is derived from that word rather
      // than stored, so the column of letters always spells whatever the words spell.
      //
      // `description` is intentionally blank on every row: the words already form the phrase in the
      // subheading, and a gloss per letter would be invented filler. The field exists so the brand
      // owner can add one per letter later without a deploy.
      items: [
        { title: "Enabling", description: "" },
        { title: "Next-Generation", description: "" },
        { title: "Innovations", description: "" },
        { title: "Customer", description: "" },
        { title: "Experience", description: "" },
      ],
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
    key: "about.outlook",
    label: "Looking Ahead",
    group: "About",
    type: "prose",
    order: 170,
    fields: {
      heading: "Looking Ahead",
      body: "The infrastructure African businesses depend on is still largely being built, and that gap is what we're focused on — over a ten-to-twenty-year horizon most organisations aren't structured to sustain. We're building a home-grown technology group that competes globally, not one that follows trends.\n\nThis isn't charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it — with systems businesses on this continent can run on for the next generation.\n\nWhat we build is made for a global market: it scales across regions, meets international compliance standards, and is built to compete with any equivalent platform anywhere. To the businesses and builders who rely on us — we're committed to technology that matters, to a standard that matters, and to taking the time to do it properly.",
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
          title: "Responsible AI",
          description:
            "AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don't release a capability until we're confident in its reliability and we can explain how it works.",
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
    key: "portfolio.pride",
    label: "PrideTrade page",
    group: "Portfolio",
    type: "hero",
    order: 230,
    fields: {
      eyebrow: "Digital Assets",
      heading: "PrideTrade",
      subheading:
        "PrideTrade is ENICE Group's digital asset platform, designed to make cryptocurrency and digital finance simple, secure and accessible, from one account.",
    },
  },
  {
    key: "portfolio.pride.facts",
    label: "PRIDE launch facts",
    group: "Portfolio",
    type: "statistics",
    order: 231,
    fields: {
      heading: "At launch",
      items: [
        { value: "2027", label: "Public launch" },
        { value: "Same ledger", label: "As PulsePay" },
        { value: "Self-custody option", label: "Keys stay with the holder" },
      ],
    },
  },
  {
    key: "portfolio.pride.highlights",
    label: "PRIDE highlights",
    group: "Portfolio",
    type: "featureGrid",
    order: 232,
    fields: {
      eyebrow: "Platform Capabilities",
      heading: "Everything a modern payments stack should be.",
      subheading:
        "PulsePay covers the whole of everyday money: accounts, transfers, cards, bills, protection and a built-in assistant, in one platform.",
      items: [
        {
          icon: "Landmark",
          title: "Instant Naira Bank Accounts",
          description:
            "Get a dedicated Nigerian bank account in minutes to receive salaries, collect payments, and hold funds securely.",
        },
        {
          icon: "Send",
          title: "Fast Transfers & P2P Payments",
          description:
            "Send money instantly to any Nigerian bank account or transfer between PulsePay wallets with zero friction.",
        },
        {
          icon: "CreditCard",
          title: "Naira & USD Virtual Cards",
          description:
            "Issue Naira and USD virtual cards in seconds for seamless local checkouts, international subscriptions, and global online spend.",
        },
        {
          icon: "Receipt",
          title: "Bills, Airtime & Utilities",
          description:
            "Pay electricity, cable TV, internet, airtime, and data bills in seconds with instant receipts and automated recurring schedules.",
        },
        {
          icon: "ShieldCheck",
          title: "Built-in KYC & Fraud Protection",
          description:
            "Tiered identity verification, real-time transaction screening, and dual-control security protecting every account and transfer.",
        },
        {
          icon: "Sparkles",
          title: "Fin AI Financial Assistant",
          description:
            "Track spending, get smart cashflow insights, and execute transfers or bill payments using natural voice and text commands.",
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
        "PulsePay operates within Nigeria's regulatory framework, with row-level security, KYC screening on every account, and audit logging of privileged actions.",
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
    path: "/portfolio/pride",
    title: "PrideTrade",
    summary: "Digital asset trading and custody.",
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
