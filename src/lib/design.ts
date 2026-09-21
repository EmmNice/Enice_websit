/**
 * Design tokens that live in TypeScript rather than CSS.
 *
 * The palette, spacing, radii and component treatments are defined as CSS custom properties in
 * `styles.css` and consumed through Tailwind utilities and the `.panel` / `.btn` / `.eyebrow`
 * component classes. That is the primary system and should be preferred.
 *
 * This module exists for the cases a utility class cannot reach: values interpolated into an
 * inline `style` (a gradient stop, a mask, a shadow on a dynamically-coloured surface). Those
 * had drifted badly — a survey of the public site found **31 different near-black hex values**
 * across nine components, all of them attempts to write the same colour. Anything below is the
 * one spelling of a value, so a section cannot quietly invent its own.
 *
 * Keep this list short. If a value can be a class, it should be.
 */

// ─── Brand canon ──────────────────────────────────────────────────────────────

/**
 * The near-black canvas, and the bone used for type on it.
 *
 * Mirrors `--enice-canvas` / `--enice-bone` in `styles.css`. Duplicated here only because an
 * inline gradient cannot read a custom property it is itself defining, and a card mock needs the
 * literal. Change both together.
 */
export const CANVAS = "#080c0e";
export const BONE = "#f4f1eb";

/** Surface ramp: each step is a small lift of the canvas toward bone. */
export const SURFACE_1 = "#0f1315";
export const SURFACE_2 = "#161a1b";
export const SURFACE_3 = "#1e2324";

/** The ENICE mark gradient stops. Reserved for the wordmark and product marks. */
export const MARK = {
  1: "#f4f1eb",
  2: "#d8a45c",
  3: "#a8702f",
  4: "#5c3a18",
} as const;

/** Warm accent ramp, drawn from the mark. Accents only — never a large surface. */
export const GOLD = MARK[2];
export const GOLD_DEEP = MARK[3];
export const GOLD_SHADOW = MARK[4];

// ─── Elevation ────────────────────────────────────────────────────────────────

/**
 * Resting elevation for a card or panel.
 *
 * On a near-black canvas a drop shadow is almost invisible, so depth comes from the 1px inset
 * highlight along the top edge — light catching a raised surface — with a deep, wide shadow
 * underneath to separate it from the page. This replaces the previous light-theme shadow
 * (`rgba(17,24,39,0.04)`), which rendered as nothing at all once the site went dark.
 */
export const SHADOW_CARD =
  "inset 0 1px 0 0 rgb(244 241 235 / 0.05), 0 18px 40px -24px rgb(0 0 0 / 0.7)";

/** A panel that should read as lifted well clear of the page — modals, the hero mock. */
export const SHADOW_FLOAT =
  "inset 0 1px 0 0 rgb(244 241 235 / 0.06), 0 40px 80px -32px rgb(0 0 0 / 0.85)";

// ─── Atmosphere ───────────────────────────────────────────────────────────────

/**
 * The ambient warm lighting, as literal values for the few places that need them inline.
 *
 * Both stops sit below 5% alpha. That is the whole discipline of the warm palette: it lights the
 * canvas without ever becoming a coloured surface, so the page stays near-black and bone.
 */
export const MESH_AMBER = "rgb(255 149 41 / 0.05)";
export const MESH_EMBER = "rgb(255 92 20 / 0.035)";

/** Hairline borders. `--border` covers the common case; these are for inline use. */
export const HAIRLINE = "rgb(244 241 235 / 0.1)";
export const HAIRLINE_STRONG = "rgb(244 241 235 / 0.16)";
