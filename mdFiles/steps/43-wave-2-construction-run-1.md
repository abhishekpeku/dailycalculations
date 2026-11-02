# Step 43 — Wave 2 Construction, run 1

First of the Construction batches scoped in `mdFiles/steps/43-45-wave-2-construction-food-sports.md`.
Widens the existing `home` category (same id, per that step's scope — do not create a new category)
with 5 calculators: drywall, brick, gravel, sand, mortar. Follows the v2 template and the
`add-calculator` skill. Reference implementations: `paint-calculator`, `tile-calculator`,
`concrete-calculator`, `wallpaper-calculator` in `data/calculators/home.ts` — same "materials from
room/area dimensions, a waste-factor convention, a CompareBars exact-vs-to-buy visual" shape, type-B
breakdown widget throughout (no solver needed; none of these formulas need to be solved backward).

## Sources fetched directly (not recalled from memory, not taken from another calculator site)

- **USG, Sheetrock Brand Installation and Finishing Guide** (fetched as PDF) — confirms 4'×8' = 32
  sq ft, 4'×10' = 40 sq ft, 4'×12' = 48 sq ft panel coverage (its own "Gypsum Panel Coverage
  Calculator" table, cross-checked: 320/400/480 sq ft for 10 panels ÷ 10 = 32/40/48), and its own
  measuring method (wall + ceiling area, minus large openings, divide by panel size). It states no
  waste percentage of its own.
- **The Home Depot, "Types of Drywall"** (fetched directly) — second source for panel sizes and use
  cases (confirms 4×8 is standard/most common, 4×10 and 4×12 for taller walls/fewer seams). Also no
  waste percentage stated.
- **Brick Industry Association (BIA), Technical Notes on Brick Construction 10 — "Dimensioning and
  Estimating Brick Masonry"** (fetched as PDF from gobrick.com) — Table 4: modular brick (3⅝×2¼×7⅝ in,
  3/8 in mortar joint) = 675 bricks per 100 sq ft = **6.75 bricks per sq ft**, 5.5 cu ft of mortar per
  100 sq ft (3/8 in joint). "Brick Breakage and Waste": "as a general rule, at least 5 percent is
  added to the net brick quantities." "Mortar Waste": "add 15 to 25 percent to the net mortar
  quantities."
- **QUIKRETE, Mortar Mix (Product No. 1102) data sheet** (fetched as PDF) — "Each 80 lb bag of
  QUIKRETE Mortar Mix will lay up to 37 standard bricks or 13 standard (8 in x 8 in x 16 in) blocks."
- **Mulch Pros Landscape Supply, "Material Weight and Coverage"** (fetched directly) — states figures
  "loaded ... measured on our own scale": #57/#34/#5/#6 stone and mason/river sand = 2,700 lb (1.35
  ton) per cubic yard, #89 stone and pea gravel = 2,800 lb (1.4 ton), crush & run = 2,900 lb (1.45
  ton), river rock/slate chips = 2,600 lb (1.3 ton).
- **EarthStone Rock, "Cubic Yards vs. Tons for Landscape Rock"** (fetched directly) — second source:
  "landscape gravel and pea gravel: about 2,700 lb, about 1.35 tons per cubic yard"; "sand: about
  3,000 lb, about 1.5 tons per cubic yard"; explicitly notes moisture changes the real weight.

**Density decision (gravel/sand):** the two supplier sources disagree with each other by material
type and don't agree with each other's "sand" figure (MulchPros' own-scale mason/river sand is 1.3
ton/cyd; EarthStone's general "sand" is 1.5 ton/cyd) — a real, bounded disagreement, not a bug, same
precedent as prior runs naming disagreeing sources rather than silently picking one. Rather than
force a single "right" density, **density is an editable input** on both gravel-calculator and
sand-calculator (`densityTonsPerCubicYard`), defaulting to a mid-range, cited figure (gravel 1.4,
sand 1.3 — MulchPros' own-scale numbers for the most common products, #89/pea gravel and mason/river
sand), with the content explicitly naming the 1.3–1.5 ton/cyd range and telling the reader to use
their supplier's own figure when they have one.

**Drywall waste decision:** no primary, directly-fetchable document (USG's guide, Home Depot's page)
states a specific waste percentage — only secondary calculator-site aggregators attribute "10-15%" to
Gypsum Association GA-216, which is a paywalled standard never read directly, so it is **not** cited
as the source of a specific number (per template §3, "read sources directly"). The copy states 10%,
rising to 15% for complex rooms, as common contractor practice, the same un-attributed-to-one-number
convention already used by `tile-calculator`'s "installers commonly plan for around 10% extra."

## The 5 calculators

1. **drywall-calculator** — sheets needed from room length/width/ceiling height, doors, windows, an
   optional "include ceiling" toggle, sheet size (4×8 = 32 sq ft default, or 4×12 = 48 sq ft), and a
   waste factor. CompareBars: exact sheets vs. sheets to buy.
2. **brick-calculator** — bricks needed from wall length × height, bricks-per-sq-ft (default 6.75,
   BIA TN10, editable for a different brick/joint size), and a waste factor (default 5%, BIA TN10).
   CompareBars: exact bricks vs. bricks to buy.
3. **gravel-calculator** — volume (cu ft/cu yd) and weight (tons) from area × depth and an editable
   density (default 1.4 ton/cyd), plus a waste factor. CompareBars: tons exact vs. tons to buy.
4. **sand-calculator** — same shape as gravel, density default 1.3 ton/cyd.
5. **mortar-calculator** — bags needed from wall area → bricks (same 6.75/sq ft convention as
   brick-calculator, so the two pages' math matches) → bags (bricks ÷ bricks-per-bag, default 37,
   Quikrete), waste factor default 15% (BIA TN10 "15 to 25 percent"). `related` cross-links
   brick-calculator both ways.

All five: category `home` (unchanged), type-B breakdown widget, `compareBars` visual, concept/how-to/
formula/worked-example/watch-out/FAQ/references content, ≥4 aliases (checked against every existing
id/alias/redirectFrom first — no collisions), `related` pointing at siblings in this batch plus
existing `paint-calculator`/`tile-calculator`/`concrete-calculator`/`wallpaper-calculator` where
relevant, a 1-4 char glyph (`sht`, `brk`, `ton`, `ton`, `bag` — reuse of a unit symbol across
calculators is an existing, accepted convention per `data/calculators/*.ts`, e.g. `ft²`/`gal`/`kWh`
each already appear twice).

11 total calculators in `home` after this run (6 existing + 5 new), still under the
`SEARCH_THRESHOLD = 15` sub-grouping cutoff in `categories/[category]/page.tsx` — no `group` field
needed this run.

## Progress

- [x] Dedupe check (ids + aliases, programmatic) — no collisions for any of the 5 new ids or their
  proposed aliases
- [x] Sources fetched directly (see above) and independent scratch verification
  (`verify_run1.mjs`) of every worked-example and FAQ figure, before writing any copy
- [x] `drywall-calculator`
- [x] `brick-calculator`
- [x] `gravel-calculator`
- [x] `sand-calculator`
- [x] `mortar-calculator`
- [x] Append all 5 ids to `calculatorOrder` in `data/calculators/index.ts`
- [x] Snapshot tests picked up automatically by `data/calculators.spec.ts` (no new test file needed —
  every `compute()` with non-empty output is snapshotted generically); `npm run test:update` and
  confirm the diff touches only the 5 new ids
- [x] `npm test` (759/759), `npm run build` (177 static pages),
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` (clean) all pass
- [x] Programmatic dataset check (`check_run1.mjs`): ids unique, no self-reference in `related`, no
  new alias collisions, `seo.title`/`seo.description` within budget (caught and fixed 2 over-budget
  descriptions), 4+ aliases, 5-8 FAQ entries
- [x] Visual check: desktop screenshots of all 5 pages, one dark-mode pass, plus `/categories/home`
  listing all 11 calculators with correct glyph badges; kill the dev server after — done, except a
  true phone-width screenshot (blocked by a sandbox `resize_window` limitation, see STATUS.md Parked)
- [x] Update `mdFiles/STATUS.md` (step 43-45 row/notes + session log) and tick "Construction batch 1"
  in `mdFiles/steps/43-45-wave-2-construction-food-sports.md`'s own Progress checklist
- [x] `gh pr ready`
