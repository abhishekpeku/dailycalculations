# Step 43–45 — Wave 2: construction, food, sports

Per `mdFiles/omni-strategy.md` §4.2. Each sector built in ~5-calculator agent batches, one batch
at a time (see `mdFiles/STATUS.md`'s Parked/feedback notes on small commits, one agent at a run).

## Pre-wave competitive scan (per the 2026-11-02 decision in omni-strategy.md §4.2 addendum)

Researched Omni Calculator's construction/food/sports category pages directly, plus
GigaCalculator.com and calculator.net, before scoping. GigaCalculator's shorter, curated lists
surfaced a few strong real-search-volume picks that don't jump out of Omni's much larger, noisier
list (Mulch, Topsoil). Omni's own "Redundant Calculators" and quiz sections were excluded on
purpose — thin/duplicate pages are exactly what the converters guardrail (omni-strategy.md §4.2)
warns against.

**Dedupe — do not rebuild these, they already exist:**
- Food: cups↔grams and butter-stick conversions already exist under Measurements → "Volume &
  Cooking" (`cups-to-grams-converter` + 4 ingredient pages, from step 42 run 6). Food-sector pages
  are about RECIPES (scaling, ratios, timing, quantities), not unit conversion — that boundary
  matters, keep it.
- Sports: running pace already exists in Health (`running-pace-calculator`, step 37). A Sports
  "race time predictor" (cross-distance prediction, e.g. 5K time → predicted marathon time) is
  genuinely different from that simple pace↔time↔distance tool and is NOT a duplicate — but don't
  rebuild plain pace↔time↔distance under a new name.
- Health already has BMI, calorie, TDEE, water intake — don't rebuild under Sports either.

## Construction — widen the existing `home` category (keep the id, relabel display to "Home &
Construction" per omni-strategy.md's taxonomy table; do NOT create a new category id)

Already shipped (6): paint-calculator, tile-calculator, concrete-calculator, wallpaper-calculator,
furniture-fit-calculator, electricity-bill-calculator.

Proposed additions (~19, brings the category to ~25), picked for real DIY/homeowner search volume
over Omni's huge niche-machinist long tail (bending stress, K-factor, true position, etc. — all
skipped, wrong audience for this site):

1. Drywall Calculator — sheets needed by room dimensions, same waste-factor pattern as tile/wallpaper
2. Brick Calculator — bricks needed by wall area + brick size
3. Gravel Calculator — volume/weight by area + depth
4. Sand Calculator — volume/weight by area + depth
5. Mortar Calculator — bags needed, pairs with brick
6. Mulch Calculator — bags/cubic yards by bed area + depth
7. Topsoil Calculator — cubic yards by area + depth
8. Fence Calculator — linear feet, panels/posts needed
9. Decking Calculator — boards needed by deck area
10. Roofing / Roof Shingle Calculator — squares + bundles needed
11. Roof Pitch Calculator — pitch, angle, rafter length from rise/run
12. Insulation Calculator — R-value / bags or rolls needed by area
13. Flooring Calculator — general flooring (distinct from tile-specific), boxes needed
14. Carpet Calculator — square yards + padding needed
15. Stair Calculator — rise/run/number of steps from total height
16. Paver Calculator — pavers + base material needed for a patio/walkway
17. Retaining Wall Calculator — blocks needed by wall dimensions
18. Board Foot Calculator — lumber-buying unit, common contractor/DIY search
19. Rebar Calculator — rebar needed for a concrete slab/footing
20. Pool / Tank Volume Calculator — gallons by shape + dimensions
21. Siding Calculator — squares needed by exterior wall area
22. AC Tonnage / BTU Calculator — "what size AC do I need" (very high search volume)
23. Framing / Stud Calculator — studs needed by wall length + spacing

Final cut (which ~19 of these, any swaps) is the build agent's call per calculator, following the
add-calculator skill's existing verification discipline (cite real formulas/waste-factor
conventions, verify_runN.mjs-style independent check before committing each batch) — this list is
the starting scope, not a locked spec.

## Food — new category `food`

Proposed (~19, brings a first pass to ~19; a later batch can extend toward 25+):
recipe scaling, baker's percentage, pizza dough, bread, sourdough, rice-to-water ratio, coffee
ratio, cold brew ratio, brine, turkey cook time, turkey thaw time, egg boiling, steak cook time,
BBQ/party quantities ("how much food per person"), party drinks/alcohol quantity, ABV (alcohol by
volume), cake servings (slices from a cake size), popcorn-for-a-party, yeast conversion
(active-dry ↔ instant ↔ fresh), self-rising flour substitution (AP flour + baking powder + salt).

## Sports — new category `sports`

Proposed (~15, a first pass — this sector needs more brainstorming than the other two to
comfortably clear 25; consider combining related baseball stats onto one richer page rather than
several thin ones, per the converters guardrail):
one-rep max, target heart rate, max heart rate, heart rate zones, VO2 max, race time predictor
(cross-distance, NOT a duplicate of running-pace-calculator), swim pace, cycling pace, steps to
miles + stride length (two related outputs, maybe one page), baseball hitting stats (AVG/OBP/
slugging/OPS together on one page), cricket bowling average, cricket net run rate, NFL passer
rating, winning percentage, Elo rating, golf handicap (confirm real formula exists/is citable
before committing to this one).

## Order

Per omni-strategy.md §4.2's wave ordering ("construction has strong ad revenue"), build
Construction first, then Food, then Sports. Within each, 5-calculator batches, one agent run at a
time, each batch: branch → draft PR early → small commits → verify (own script, not just
eyeballing) → `npm test`/`npm run build`/lint → visual check → `gh pr ready` → main session reviews
and merges.

## Progress

- [x] Construction batch 1 (5): DONE 2026-11-02 — drywall, brick, gravel, sand, mortar calculators.
  Branch `step/43-wave-2-construction-run-1`, PR #51. Details: `mdFiles/steps/43-wave-2-construction-run-1.md`, `mdFiles/STATUS.md` row 43–45 and session log.
- [x] Construction batch 2 (5): DONE 2026-11-02 — fence, decking, roofing (shingles), roof pitch,
  paver calculators. Branch `step/43-wave-2-construction-run-2`, PR #52. Details:
  `mdFiles/steps/43-wave-2-construction-run-2.md`, `mdFiles/STATUS.md` session log. `home` category
  now 16 calculators (crosses `SEARCH_THRESHOLD` 15 — search box now shown automatically).
- [x] Construction batch 3 (5): DONE 2026-11-05 — mulch, topsoil, retaining wall, board foot, AC
  tonnage/BTU calculators. Branch `step/43-wave-2-construction-run-3`, PR #54. Details:
  `mdFiles/steps/43-wave-2-construction-run-3.md`. `home` category now 21 calculators.
- [ ] Construction batch 4+ : TODO — remaining candidates (insulation, flooring, carpet, stair,
  rebar, pool/tank volume, siding, framing/stud), final cut still the build agent's call
- [ ] Food batches: TODO
- [ ] Sports batches: TODO
