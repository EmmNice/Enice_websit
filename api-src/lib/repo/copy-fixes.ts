import { db } from "../db";

/**
 * One-time corrections to copy that shipped before the products were separated.
 *
 * ## Why this is a migration and not just an edit
 *
 * The homepage, the PRIDE page, the roadmap and the FAQ answers are stored in `site_sections` and
 * `site_settings`, seeded once and then owned by the database. Changing the seed defaults in
 * `website.ts` would only affect a fresh install: `seedWebsiteDefaults` inserts with
 * `ON CONFLICT DO NOTHING`, so a site that already exists keeps the old wording forever.
 *
 * So this rewrites the rows that are already there. Two things changed:
 *
 *   1. The product is called PrideTrade.
 *   2. PrideTrade and PulsePay are separate products. The copy used to say PrideTrade sat in the
 *      same ecosystem as PulsePay, on a shared ledger and shared infrastructure, which is not true.
 *
 * ## Idempotent, and only runs once
 *
 * Every replacement is a no-op when its source text is absent, and a marker row in `site_settings`
 * stops the work repeating on every cold start. Re-running it by hand is safe.
 */

const MARKER = "copy_fixes_pridetrade_v1";

/**
 * Ordered: the long, specific sentences go first so a later short replacement cannot leave half of
 * one behind.
 */
const REPLACEMENTS: [from: string, to: string][] = [
  // ── Coupling claims: PrideTrade is not part of PulsePay's ecosystem ──
  [
    "PrideTrade is built into the same ecosystem as PulsePay. Move between crypto and traditional finance from a single account.",
    "PrideTrade runs on its own infrastructure, separate from PulsePay. One account for trading, custody and transfers.",
  ],
  [
    "PRIDE is built into the same ecosystem as PulsePay. Move between crypto and traditional finance from a single account.",
    "PrideTrade runs on its own infrastructure, separate from PulsePay. One account for trading, custody and transfers.",
  ],
  [
    "PulsePay is our digital payments platform and PRIDE is our digital asset platform, both running on the same shared infrastructure.",
    "PulsePay is our digital payments platform and PrideTrade is our digital asset platform. They are separate products, each on its own infrastructure.",
  ],
  [
    "PulsePay is our digital payments platform and PrideTrade is our digital asset platform, both running on the same shared infrastructure.",
    "PulsePay is our digital payments platform and PrideTrade is our digital asset platform. They are separate products, each on its own infrastructure.",
  ],
  [
    "PulsePay covers cards, wallets and transfers for businesses and individuals, and PRIDE covers trading and custody of digital assets in the same account.",
    "PulsePay covers cards, wallets and transfers for businesses and individuals, and PrideTrade covers trading and custody of digital assets in its own account.",
  ],
  [
    "PulsePay covers cards, wallets and transfers for businesses and individuals, and PrideTrade covers trading and custody of digital assets in the same account.",
    "PulsePay covers cards, wallets and transfers for businesses and individuals, and PrideTrade covers trading and custody of digital assets in its own account.",
  ],
  ["built on the same ledger as PulsePay.", "built on its own ledger and controls."],
  ["inside the same account as PulsePay.", "from one account."],
  ["while staying connected to the broader ENICE ecosystem.", "from one account."],
  ["fully integrated across the broader ENICE Group ecosystem.", "from one account."],
  [
    "Trading and custody for digital assets inside the same account, so a balance can move between payment rails and asset rails without leaving the platform.",
    "Trading and custody for digital assets in one account, with transfers between assets handled in the same place.",
  ],
  [
    "Early access to the digital asset platform for users already holding funds on PulsePay, ahead of the public launch.",
    "Early access to the digital asset platform ahead of the public launch.",
  ],
  [
    "Trading, custody and cross-ecosystem transfers open to PulsePay account holders.",
    "Trading, custody and transfers open to early-access accounts.",
  ],
  [
    "Move value between the payment and asset sides of the ecosystem without leaving ENICE or repeating identity checks.",
    "Move digital assets between your own accounts and external wallets, with identity checks already on file.",
  ],
  [
    "Move between PrideTrade and PulsePay without leaving the ENICE stack: one account, every service.",
    "Keep trading, custody and transfers in one place, with your own ledger and controls.",
  ],
  ["Shared Ecosystem Framework", "Shared Engineering Standards"],
  [
    "The unified AI pipeline, ledger, and compliance backbone that now underpins every ENICE product.",
    "The engineering, audit and security standards applied across every ENICE project.",
  ],
  ["Same KYC and monitoring as PulsePay", "KYC and monitoring built in from day one"],
  ["Cross-ecosystem transfers", "Asset transfers"],
  ["Cross-Ecosystem Transfers", "Transfers"],
  ["cross-ecosystem digital finance", "digital asset trading and custody"],
  ["cross-ecosystem transfers", "asset transfers"],
  ["Same KYC and monitoring as PulsePay", "KYC and monitoring built in from day one"],

  // ── The brand rename, last: it must not run before the sentences above are matched ──
  ["PRIDE", "PrideTrade"],
];

export async function applyCopyFixes(): Promise<void> {
  const sql = db();

  const existing = await sql<{ key: string }[]>`
    SELECT key FROM site_settings WHERE key = ${MARKER}
  `;
  if (existing.length > 0) return;

  for (const [from, to] of REPLACEMENTS) {
    // `fields` and `value` are jsonb; casting to text, replacing and casting back keeps every
    // replacement in one statement and leaves the JSON shape untouched.
    await sql`
      UPDATE site_sections
         SET fields = replace(fields::text, ${from}, ${to})::jsonb,
             label  = replace(label, ${from}, ${to})
       WHERE fields::text LIKE ${"%" + from + "%"} OR label LIKE ${"%" + from + "%"}
    `;
    await sql`
      UPDATE site_settings
         SET value = replace(value::text, ${from}, ${to})::jsonb
       WHERE value::text LIKE ${"%" + from + "%"}
    `;
  }

  await sql`
    INSERT INTO site_settings (key, value) VALUES (${MARKER}, ${JSON.stringify({ applied: true })}::jsonb)
    ON CONFLICT (key) DO NOTHING
  `;
}
