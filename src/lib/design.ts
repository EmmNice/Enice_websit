/**
 * Design tokens that live in TypeScript rather than CSS.
 *
 * The colour palette, spacing and radii are all defined as CSS custom properties in
 * `styles.css` and consumed through Tailwind utilities. This shadow is the exception: it is
 * applied via inline `style` on elements whose background is set dynamically, and Tailwind's
 * shadow scale does not match the design. Keeping it here stops the same rgba triplet being
 * retyped in every section that needs a raised surface.
 */

/** Resting elevation for cards and panels on a light background. */
export const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
