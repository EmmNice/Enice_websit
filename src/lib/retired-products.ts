/**
 * Products ENICE Group no longer presents on the public site.
 *
 * The portfolio is PulsePay, PulseAssist and Faga. DevaPay and PRIDE were removed; their pages
 * redirect to `/portfolio` (see `vercel.json`). Navigation and footer links are also editable in
 * the Website Manager, and a database seeded before the removal still holds links to these
 * paths — so chrome built from CMS data filters them out here rather than trusting the stored
 * lists to have been cleaned up by hand.
 */
export const RETIRED_PRODUCT_PATHS: ReadonlySet<string> = new Set([
  "/portfolio/devapay",
  "/portfolio/pride",
  "/portfolio/payment-collection",
  "/portfolio/pulsex",
]);

export function isRetiredProductPath(url: string | undefined | null): boolean {
  if (!url) return false;
  const path = url.trim().replace(/\/+$/, "");
  return RETIRED_PRODUCT_PATHS.has(path);
}
