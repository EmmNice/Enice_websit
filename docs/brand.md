# Brand assets

The `EN` monogram and everything generated from it.

## Where the vector came from

The monogram existed only as raster. `public/og.png` and the `icon-*.png` set carried it; there was
no vector anywhere in the repo, and no source file in any design tool that shipped with it.

`scripts/brand-mark.mjs` holds paths recovered from `og.png`, where the mark is largest at 475×339px.
The recovery classified every pixel to the nearest of the three source colours, traced the exact
unit-edge boundary of each colour region, then decimated vertices at a 3px tolerance. Every edge in
this mark is straight, so the result is a faithful reconstruction — two blue loops of 4 and 11 points
and one white loop of 7 — verified against the original by difference overlay.

It is still a reconstruction. **If the original vector artwork turns up, use it and delete the
script.** The one detail worth re-checking against an original is the blue: `#0048ED`, taken as the
modal pixel value. Surrounding values form a cluster two units wide, which is antialiasing noise
around a single flat fill, so there is no gradient to reproduce.

## The files

Regenerate the SVGs with `node scripts/brand-mark.mjs`. It has no dependencies and is not part of
`verify`, because brand assets change rarely and the committed SVGs are the source of truth.

| File                           | Use                                                                 |
| ------------------------------ | ------------------------------------------------------------------- |
| `brand/enice-mark.svg`         | The logo. Header and footer — the only mark the site renders.       |
| `brand/enice-mark-appicon.svg` | The same artwork on an opaque square. Raster source for every icon. |

**Nothing here recolours the mark.** The square is not a variant: the colours are untouched and it
only supplies a ground, exactly as the previous icon set did. It exists because the bare mark is
transparent and two-tone, so its white N would disappear against light browser chrome or a light home
screen, and because iOS masks its own corners and composites transparency onto black.

That hazard applies anywhere the mark meets a pale background. The site is dark throughout, so it does
not arise today. If a light surface ever needs the mark, **ask for artwork rather than recolouring
this** — the N is white, and white on pale is nothing.

`Logo` uses the CMS fields under Website → Design when they are set, preferring
`logoDarkUrl ?? logoUrl` because the public site is dark throughout. It falls back to the committed
asset when neither is set, which is always the case in production, where there is no database.

## Regenerating the raster icons

`favicon.ico`, `favicon.png`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png` and
`icon-512.png` all derive from `enice-mark-appicon.svg`:

```sh
node <harness>/icons.mjs   # needs Playwright; not a dependency of this repo
```

Two constraints that are easy to get wrong:

- **Every icon comes from the opaque square, never the bare mark.** A transparent two-tone mark loses
  its white N against light browser chrome or a light home screen.
- **`favicon.ico` holds PNG payloads.** That is legal and about a quarter the size of BMP/DIB. If a
  decoder ever objects, the script keeps a `dib()` encoder alongside for the classic form. Beware of
  testing ICO decoding through an intercepting proxy — it reports spurious failures, including for
  ICOs that work perfectly in a browser.

The mark is 1.4:1, so a square crop is never tight on both axes and the 16px favicon is width
limited. Padding is kept minimal to buy back what legibility there is.

`og.png` is deliberately left alone: it is the mark on black, and it is the artwork the vector was
recovered from. It carries no wordmark or tagline, which is worth revisiting — a social card that
names the company and what it does will out-perform a bare logo.
