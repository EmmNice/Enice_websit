/**
 * Generates the ENICE `EN` monogram family into `public/brand/`.
 *
 *   node scripts/brand-mark.mjs
 *
 * ## Where the geometry comes from
 *
 * The monogram existed only as raster: `public/og.png` and the `icon-*.png` set carried it, and
 * there was no vector anywhere in the repo. The paths below were recovered from `og.png`, where the
 * mark is largest (475x339px), by classifying every pixel to the nearest of the three source colours
 * — black, blue, white — tracing the exact unit-edge boundary of each region, and then decimating
 * vertices with a 3px tolerance. Nearest-colour classification absorbs the antialiased fringe; the
 * tolerance sits above the resulting 1–2px staircase and far below the smallest true feature, so the
 * diagonals straighten without a single corner being rounded.
 *
 * The result is two blue loops of 4 and 11 points and one white loop of 7, verified against the
 * original by difference overlay. Every edge in the mark is straight, so this is a faithful
 * reconstruction rather than an approximation — but it is still a reconstruction. If the original
 * vector artwork turns up, prefer it and delete this script.
 *
 * ## Why there are two files
 *
 * `enice-mark.svg` is the logo, in its own colours, and the only mark the site renders. Nothing here
 * recolours it.
 *
 * `enice-mark-appicon.svg` is the same artwork on an opaque square, which the favicon and app icons
 * are rasterised from. The colours are untouched; the square only supplies a ground, exactly as the
 * previous icon set did. It is needed because the bare mark is transparent and two-tone, so its white
 * N would disappear against light browser chrome or a light home screen — and because iOS masks its
 * own corners and composites transparency onto black.
 *
 * That white-N-on-light hazard applies anywhere the mark meets a pale background. The site is dark
 * throughout, so it does not arise today; if a light surface ever needs the mark, ask for artwork
 * rather than recolouring this.
 *
 * ## Regenerating the raster icons
 *
 * `favicon.*`, `apple-touch-icon.png` and `icon-*.png` are rasterised from these SVGs by a headless
 * browser, which is deliberately not a dependency of this repo. See `docs/brand.md`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "brand");

// ─── Recovered geometry ──────────────────────────────────────────────────────

/** The mark's own proportions: 1000 wide by 713.7 tall, matching the source's 475x339. */
const W = 1000;
const H = 713.7;

/** The E: the top arm, then the spine with the middle and bottom arms. */
const E_PATH =
  "M0 0L444.2 0L576.8 151.6L0 149.5Z" +
  "M0 271.6L372.6 271.6L471.6 372.6L471.6 410.5L145.3 410.5L145.3 541.1L168.4 564.2L473.7 564.2L616.8 713.7L124.2 713.7L0 591.6Z";

/** The N: right stem plus the diagonal, which doubles as the E's cut edge. */
const N_PATH = "M854.7 2.1L1000 2.1L1000 713.7L863.2 713.7L372.6 151.6L578.9 151.6L854.7 465.3Z";

/**
 * The exact brand blue, as the modal pixel value across the mark's blue region. The surrounding
 * values form a tight cluster two units wide, which is antialiasing noise around one flat fill —
 * there is no gradient in the original.
 */
const BLUE = "#0048ED";
const WHITE = "#FFFFFF";
const INK = "#080c0e"; // --canvas, the app icon's ground

// ─── Assembly ────────────────────────────────────────────────────────────────

const svg = (viewBox, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="ENICE">
  <title>ENICE</title>
  ${body.trim()}
</svg>
`;

/** The mark in its own colours. No recolouring: this is the artwork as supplied. */
const mark = () =>
  svg(
    `0 0 ${W} ${H}`,
    `<path fill="${BLUE}" d="${E_PATH}"/>\n  <path fill="${WHITE}" d="${N_PATH}"/>`,
  );

/** Square lockup: the mark centred with breathing room, on an opaque canvas-coloured ground. */
function appicon() {
  // The mark is 1.4:1, so a square crop can never be tight on both axes and the favicon is width
  // limited. Padding is kept minimal to buy back what legibility there is at 16px.
  const PAD = 0.94;
  const scale = PAD;
  const x = ((1 - PAD) / 2) * W;
  const y = H / W < 1 ? (W - H * scale) / 2 : 0;
  return svg(
    `0 0 ${W} ${W}`,
    `<rect width="${W}" height="${W}" fill="${INK}"/>
  <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})">
    <path fill="${BLUE}" d="${E_PATH}"/>
    <path fill="${WHITE}" d="${N_PATH}"/>
  </g>`,
  );
}

const files = {
  // The logo. Used in the header and footer, and the only mark the site renders.
  "enice-mark.svg": mark(),

  // The same artwork on an opaque square, which the favicon and app icons are rasterised from. Not
  // a variant of the mark — the colours are untouched; the square only supplies a ground, exactly as
  // the previous icon set did.
  "enice-mark-appicon.svg": appicon(),
};

mkdirSync(OUT, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, name), content);
}
console.log(`brand-mark: wrote ${Object.keys(files).length} files to public/brand/`);
