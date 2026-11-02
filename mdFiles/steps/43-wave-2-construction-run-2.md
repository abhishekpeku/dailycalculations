# Step 43 — Wave 2 Construction, run 2

Second Construction batch scoped in `mdFiles/steps/43-45-wave-2-construction-food-sports.md`.
Widens the existing `home` category (same id) with 5 calculators: fence, decking, roofing
(shingles), roof pitch, paver. Follows the v2 template and the `add-calculator` skill. Reference
implementations: the 11 existing `home.ts` calculators, especially `tile-calculator` (waste-factor
+ boxes pattern) and `mortar-calculator`/`brick-calculator` (two pages sharing a derived figure).

## Sources fetched directly

- **The Home Depot, "How to Build a Fence"** (fetched directly) — "Position the fence posts every
  6-feet to 8-feet along the line where you want the fence to stand." For panel fencing: "Add two
  to the number of panels to determine how many posts you will need." Used directly: panel width
  doubles as post spacing (vinyl/aluminum panel systems are built so post spacing must equal panel
  width — corroborated by vinyl fence installation guides found while researching), and the posts
  formula follows Home Depot's own published convention exactly (panels + 2), not a reasoned-out
  n+1 geometric minimum.
- **Trex Company, 2022 Decking Installation Guide** (fetched as PDF, read directly) — official
  specs: 1" Square-Edge boards (Transcend/Enhance) are .94 in × 5.5 in × 12/16/20 ft; minimum
  required width-to-width gap is 3/16 in (all temperatures); end-to-end gap is 1/8 in above 40°F,
  3/16 in below; joist spacing (span chart) is 16 in on-center for 1 in boards in residential use.
- **GAF, Timberline HDZ Shingles — Product Data Sheet** (©2019 GAF, #875/RESGN467HDZ; fetched as
  PDF, read directly, mirrored via a municipal permit-document archive since gaf.com blocks
  automated fetches) — "Bundles/Square: 3", "Pieces/Square: 64". Cited with the live GAF product
  page as the canonical URL since the figures are GAF's own published spec.
  Pitch multiplier itself (`sqrt(1 + (rise/12)²)`) is derived directly from the Pythagorean theorem
  applied to the standard "rise per 12 in. of run" convention — cross-checked against a public
  roofing-industry reference table (4/12 → 1.054, 6/12 → 1.118, 8/12 → 1.202, 12/12 → 1.414; all
  match the formula to 3 decimals) and is common-knowledge geometry, not a claim needing its own
  citation.
- **National Roofing Contractors Association (NRCA), "Roof slope guidelines," Professional
  Roofing, August 2018 (by Mark S. Graham, NRCA VP of Technical Services)** (fetched as PDF, read
  directly) — IBC 2018 prescribes a 2:12 minimum slope for asphalt shingles; NRCA's own best-practice
  recommendation is 4:12 or more. Used as the roof-pitch-calculator's RangeBar bands (below code
  minimum / code minimum but below NRCA's recommendation / meets NRCA's recommendation).
- **Wikipedia, "Roof pitch"** — confirms the US rise/run convention ("a roof that rises 6 inches
  for every 12 inches of horizontal run has a slope of 6:12") and that framing squares are
  traditionally used for rafter-length layout from rise-per-run. Used only for the naming
  convention; the angle/rafter-length formulas are derived, not copied.
- **Interlocking Concrete Pavement Institute (ICPI), Tech Spec 10 — "Application Guide for
  Interlocking Concrete Pavements"** (Revised March 2022; fetched as PDF, read directly) — "Bedding
  sand nominal 1 in. (25 mm) thick"; "Minimum aggregate base thickness for walks should be 4 to 6
  in. (100 to 150 mm), driveways 6 to 8 in. (150 to 200 mm)."
- **Oregon State University Extension Service, "10-Step Guide to Installing Pavers"** (fetched as
  PDF, read directly) — "You should always add 5% to this figure, to allow for the pavers that will
  be cut to fit curves and odd spaces. If you know that you will be cutting a lot of pavers, you
  should add 10%." Independently corroborates ICPI's base (4–6 in) and bedding-sand (1 in, with a
  1–1.5 in range before compaction) figures.

## The 5 calculators

1. **fence-calculator** — linear feet of fence, panels/sections and posts needed from a fence run
   and a panel width (which doubles as post spacing, per the fetched fencing sources). Posts =
   panels + 2, exactly Home Depot's own published panel-fencing rule, not a derived minimum.
2. **decking-calculator** — deck boards needed from a deck's two dimensions (rows direction ×
   board-length direction), board width, width-to-width gap and standard board length, with a
   waste allowance. Rows from (deck width ÷ (board width + gap)); boards per row from (deck length
   ÷ board length); total boards, then waste.
3. **roofing-calculator** — roofing squares and shingle bundles from a roof footprint and a pitch
   (rise per 12 in. of run), using the Pythagorean pitch multiplier to convert footprint area to
   actual roof area, plus a waste factor and GAF's 3-bundles-per-square convention (editable).
4. **roof-pitch-calculator** — roof angle in degrees and rafter length from a rise (per 12 in. of
   run) and a horizontal run length. Type-B breakdown (not a solver): both inputs are always known
   quantities on a real job, so there is no "solve for any field" need here.
5. **paver-calculator** — pavers needed for a patio/walkway from its area, paver size and a waste
   allowance, plus the base-gravel and bedding-sand volumes from ICPI's and Oregon State
   Extension's depth figures (both editable).

All five: category `home` (unchanged), type-B breakdown widget, `compareBars` visual (roof-pitch
uses `rangeBar` instead, against NRCA's code-minimum/recommended-minimum bands), full v2 content,
≥4 aliases (checked against every existing id/alias/redirectFrom — no collisions), `related`
pointing at siblings in this batch and existing `home.ts` calculators (paver ↔ gravel/sand from
run 1, roofing ↔ roof-pitch), distinct glyphs (`fnc`, `dek`, `sq`, `X12`, `pvr` — none collide with
the 11 existing `home.ts` glyphs: `gal`, `ft²`, `yd³`, `roll`, `fit`, `kWh`, `sht`, `brk`, `grv`,
`snd`, `bag`).

16 total calculators in `home` after this run (11 existing + 5 new), still under the
`SEARCH_THRESHOLD = 15`... — actually 16 crosses the 15 sub-grouping threshold noted in run 1; if
`categories/[category]/page.tsx` groups above 15, confirm whether a `group` field is now needed and
add one if so (home.ts entries currently have no `group` field at all).

## Progress

- [x] Dedupe check (ids + aliases, programmatic) — no collisions
- [x] Sources fetched directly and independently verified (scratch script) before writing copy
- [x] `fence-calculator`
- [x] `decking-calculator`
- [x] `roofing-calculator`
- [x] `roof-pitch-calculator`
- [x] `paver-calculator`
- [x] Append all 5 ids to `calculatorOrder` in `data/calculators/index.ts`
- [x] `npm test` (snapshots picked up generically; `npm run test:update` run, diff checked)
- [x] `npm run build` and `npm run lint` clean
- [x] Programmatic dataset check: ids unique, no self-reference in `related`, no alias collisions,
  `seo.title`/`seo.description` within budget, 4+ aliases, 5-8 FAQ entries, glyph uniqueness
- [x] Visual check: desktop screenshots of all 5 pages, one dark-mode pass, `/categories/home`
  listing all 16 with correct glyph badges; dev server stopped after
- [x] Update `mdFiles/STATUS.md` and tick "Construction batch 2" in
  `mdFiles/steps/43-45-wave-2-construction-food-sports.md`
- [x] `gh pr ready`
