/** Text-safe accents sampled from the products' current public brand palettes. */
export const PRODUCT_ACCENT_BY_PATH: Readonly<Partial<Record<string, string>>> = {
  "/portfolio/pulsepay": "var(--pulsepay-accent)",
  "/portfolio/pulseassist": "var(--pulseassist-accent)",
  "/portfolio/pride": "var(--pride-accent)",
};

/** Deeper same-brand fills used only for gradients and non-text decoration. */
export const PRODUCT_DEEP_ACCENT_BY_PATH: Readonly<Partial<Record<string, string>>> = {
  "/portfolio/pulsepay": "#d0472f",
  "/portfolio/pulseassist": "#7c3aed",
  "/portfolio/pride": "#e6a100",
};
