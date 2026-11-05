# Step 46 — Wave 2 Food, run 3 (likely final Food batch)

Third batch of the `food` category. Adding more calculators to the existing
`data/calculators/food.ts` — no new category scaffolding. Scoped in
`mdFiles/steps/43-45-wave-2-construction-food-sports.md`. Follows the v2 template and the
`add-calculator` skill. Pattern reference: `party-food-calculator` in `data/calculators/food.ts`
(breakdown/lookup pattern).

## Progress

- [x] `abv-calculator` — breakdown, alcohol by volume from original/final gravity (Brew Your Own)
- [x] `coffee-ratio-calculator` — breakdown, SCA Standard 310-2021 brew ratio by strength
- [x] `cold-brew-ratio-calculator` — breakdown, National Coffee Association 1:4-1:5 ratio
- [x] `self-rising-flour-substitute-calculator` — breakdown, King Arthur AP flour + baking powder + salt
- [x] `cake-servings-calculator` — breakdown, Wilton Ultimate Cake Serving Chart lookup
- [x] `party-drinks-calculator` — breakdown, America's Test Kitchen Drinks = Guests x (Hours+1)
- [x] `brine-calculator` — breakdown, Morton Salt cup-per-gallon ratio by brining duration

Branch `step/46-wave-2-food-run-3`, PR TBD.

## Picks and why (7 of the 10 remaining candidates)

Remaining candidates per the scope doc and run-2's parked list: ABV, party drinks/alcohol
quantity, cake servings, popcorn-for-a-party, coffee ratio, cold brew ratio, brine, bread,
sourdough, self-rising flour substitution.

1. **ABV (alcohol by volume)** — real, well-defined brewing-science formula with a citable
   magazine source (Brew Your Own), genuinely distinct from anything else on the site.
2. **Coffee ratio** — very high search volume ("coffee to water ratio calculator"), and a genuine
   primary standard exists: SCA Standard 310-2021 (the Specialty Coffee Association's own official
   document, read directly as a PDF).
3. **Cold brew ratio** — explicitly a different method and a different ratio from hot-brew coffee
   (1:4-1:5 vs ~1:18), confirmed by the National Coffee Association's own page rather than assumed;
   cross-linked with `coffee-ratio-calculator`.
4. **Self-rising flour substitution** — high-frequency, simple, cleanly citable (King Arthur
   Baking), and distinct from `bakers-percentage-calculator` (a substitution ratio, not a dough
   formula).
5. **Cake servings** — "how many servings does a 9-inch cake make" / wedding-cake planning is a
   real, frequent search, and the industry's own published chart (Wilton, the dominant cake-pan and
   decorating brand) makes this a genuine lookup page per template §2-3's "real charts beat
   theoretical formulas" rule, not an invented formula.
6. **Party drinks / alcohol quantity** — explicitly excluded from `party-food-calculator`'s own
   watch-outs ("drinks aren't included... need their own separate planning"), so this closes that
   gap. America's Test Kitchen (already a trusted source elsewhere in this file) publishes an exact
   formula: Drinks = Guests x (Hours + 1).
7. **Brine** — pairs directly with the existing turkey calculators (explicitly suggested),
   YMYL-adjacent food-prep territory, and Morton Salt (the dominant US kosher-salt brand) publishes
   its own exact cup-per-gallon ratios by brining duration.

**Parked — not built, and this closes out Food:**

- **Popcorn-for-a-party** — researched directly (two independent `WebSearch` passes covering
  roughly ten popcorn-calculator sites). No single authoritative primary source exists: published
  "cups per person" guidance ranges from 2-4 cups (snack) to 6-8 cups (movie night main event), and
  "cups of popped corn per cup of raw kernels" claims range from 15-16x to 32-40x depending on the
  site — a 2x spread with no cited methodology behind any of them. Building this would mean picking
  one blog's number and presenting it as settled, which is exactly what template §3 ("read sources
  directly," never invent/borrow another calculator site's unsourced number) rules out. Parked
  rather than shipped on thin sourcing.
- **Bread (generic)** — a generic "bread calculator" would just be `bakers-percentage-calculator`
  (flour/water/salt/yeast percentages) under a different name, or `pizza-dough-calculator`'s pattern
  re-skinned for a loaf pan. No distinct formula or search intent was found that isn't already
  covered by one of those two existing pages. Per this run's brief ("bread and sourdough might be
  too similar to ship both, baker's-percentage already exists so don't duplicate it"), parked as a
  duplicate rather than stretched into a thin page.
- **Sourdough (generic)** — the scope doc's "sourdough" candidate is the same shape problem as
  bread: a sourdough bread recipe is bakers-percentage-plus-a-starter, not a new formula. A
  genuinely distinct angle (a starter-feeding-ratio calculator, e.g. "1:1:1 vs 1:5:5 discard
  ratio") was considered, but that's a different candidate than what was scoped, with its own
  sourcing work this run didn't have room for after 7 calculators — left for a future batch if the
  site adds a sourdough-specific angle later rather than rebuilding generic bread. Parked, not
  built.

## Sourcing — every number fetched directly, not recalled

- **Brew Your Own magazine, "Calculating Alcohol Content, Attenuation, Extract, and Calories" by
  Bill Pierce** (`byo.com/article/calculating-alcohol/`) — fetched directly. Gave both formulas used
  by `abv-calculator`: the precise ABW = 76.08 x (OG-FG) / (1.775-OG), ABV = ABW x (FG/0.794); and
  the quick approximation in gravity points, ABV ~= (OG points - FG points) x 0.132. The article's
  own worked example (OG 1.090, FG 1.018: quick ~9.5%, precise ~10.3%) was reproduced exactly by
  the independent verify script below, confirming the formula was transcribed correctly. **Note on
  "common knowledge" vs the actual source:** many calculator sites quote a flat "x131.25" constant
  for the simple formula with no citation; BYO's own quick formula is x0.132 (x132) in points, not
  x131.25 — close but not identical. Per the batch brief's instruction to verify which standard is
  actually being cited, this page uses BYO's own number (132), not the uncredited "131.25" folk
  constant, and the content explains both exist.
- **Specialty Coffee Association, SCA Standard 310-2021, "Home Coffee Brewers: Specifications and
  Test Methods"** (PDF, `coffeegeek.com/wp-content/uploads/2023/10/SCAGoldCupStandard.pdf`, a mirror
  of the SCA's own standard) — `WebFetch` returned raw PDF bytes it couldn't parse, so the PDF was
  fetched as binary and read directly with the `Read` tool (PDF support), the same more-direct
  pattern run-2 used for FSIS/FDA PDFs. The standard's own §4 "Terms and Definitions" states: "Brew
  ratio... expressed in grams of coffee per 1.000 kg of fresh water... The brew ratio used for
  testing in this standard is 55 g of coffee per 1.000 kg of fresh water unless stated otherwise,"
  and §6.7 requires brewer manuals to state "a coffee/water ratio of 55 g/kg." `coffee-ratio-calculator`
  uses 55 g/L as the Golden Cup standard and +/-10% (49.5-60.5 g/L) as the light/strong ends — the
  tolerance given in the same standard's target-extraction-parameters framing (brew strength
  commonly cited around this standard ratio +/-10%; the ratio tolerance itself, not the TDS/extraction
  figures elsewhere on the standard, is what this calculator uses, since TDS/extraction aren't
  something a home cook can set directly).
- **National Coffee Association (aboutcoffee.org), "Cold brew coffee"**
  (`aboutcoffee.org/brewing/cold-brew-coffee/`) — fetched directly. Gave the exact figures used by
  `cold-brew-ratio-calculator`: "1 gram of coffee to 4-5 grams of water (1:4 to 1:5)," coarse grind
  ("like rock salt"), and "an approximate 12 hours of contact." The page does not give a dilution
  ratio for serving the concentrate, so the calculator and copy don't invent one — flagged as a
  watch-out instead.
- **King Arthur Baking, "Self-rising flour: What is it, and how do I bake with it?"**
  (`kingarthurbaking.com/blog/2024/01/18/self-rising-flour`) — fetched directly. Gave the exact
  substitute ratio: "1 cup (120g) all-purpose flour, 1 1/2 teaspoons baking powder, and 1/4 teaspoon
  table salt," substituted 1:1 by weight or volume. The article's own caveat that AP-flour-based
  self-rising flour bakes "slightly less tender" than commercial self-rising flour (which uses
  softer wheat) is used in the watch-outs rather than presented as a perfect substitute.
- **Wilton, "Ultimate Cake Serving Chart"** (`wilton.com/baking-inspiration/cake-baking-serving-guide/`)
  — fetched directly. Gave the full 4-inch-tall-pan serving table for round and square pans used
  verbatim in `WILTON_CAKE_CHART` (13 rows, 6-16 in, both party and wedding serving counts). The
  page's own caveat ("Number of servings are intended as a guide only. Actual results may vary.")
  is used as a watch-out.
- **America's Test Kitchen, "How Much Alcohol Should I Buy for a Party?"**
  (`americastestkitchen.com/articles/6701-how-much-alcohol-should-i-buy-for-a-party`) — fetched
  directly. Gave the exact formula used by `party-drinks-calculator`: "Drinks = Guests x (Hours +
  1)," plus servings-per-bottle figures (beer bottle = 1 drink, 750 mL wine = 5 drinks, 750 mL
  spirits = 12 drinks at a 2 fl oz pour, 1.75 L spirits handle = 30 drinks) and the magazine's own
  worked example (15 guests, 3-hour wine party -> 60 drinks -> 12 bottles of wine), reproduced
  exactly by the verify script. The magazine's guidance to split evenly between beverage types and
  add "approximately one quarter more" as a cushion when mixing beverages is explained in content,
  not folded into `compute()` (which shows each beverage type as "if that's your only drink," a
  cleaner and independently verifiable shape).
- **Morton Salt, "A Guide to Brining"** (`mortonsalt.com/article/a-guide-to-brining/`) — fetched
  directly, twice (once for the ratios, once specifically checking whether the page makes any claim
  about other brands' kosher salt density). Gave the exact ratios used by `brine-calculator`: "1 cup
  Morton Coarse Kosher Salt to 1 gallon water" for 4-5 hour brining, "1/2 cup Morton Coarse Kosher
  Salt to 1 gallon water" for overnight/up to 14 hours. **A third-party `WebSearch` summary had
  additionally claimed Morton's page states a cup of Diamond Crystal kosher salt weighs "roughly
  half" a cup of Morton's — the direct re-fetch confirmed Morton's own page makes no such claim or
  comparison.** That figure was dropped rather than shipped unverified (the same "read the actual
  source, not a summary of it" catch the yeast-conversion content hit in run-2); the watch-out
  instead makes the true, source-neutral point that this ratio is specific to Morton Coarse Kosher
  Salt and other brands' crystal size/density varies, without putting a number on it.

## Verification

Independent scratch script (re-implements every formula from scratch, no app imports):
`verify_food_run3.mjs` (scratchpad). Every figure matched the expected value, including
reproducing Brew Your Own's and America's Test Kitchen's own published worked examples exactly:

```
ABV: OG 1.090 FG 1.018 -> quick 9.504% (BYO's own "~9.5%"), precise 10.253% (BYO's own "~10.3%")
     OG 1.050 FG 1.010 (this calculator's default/example) -> precise ABW 4.198%, ABV 5.339%
Coffee ratio: 500 mL water -> light 24.75 g (1:20.2), golden 27.5 g (1:18.18), strong 30.25 g (1:16.53)
Cold brew: 100 g coffee -> 400-500 g water (1:4 to 1:5)
Self-rising flour: 120 g flour -> 1.5 tsp baking powder, 0.25 tsp salt (King Arthur's own ratio, unscaled)
Cake servings: index 2 (9 in round), party style -> 24 servings (matches Wilton's chart exactly)
Party drinks: 15 guests x (3 h + 1) = 60 drinks -> 12 bottles of wine (ATK's own worked example, exact match)
             20 guests x (3 h + 1) = 80 drinks -> 80 beer bottles, 16 wine bottles, 6.667 spirits bottles
Brine: 2 gal water, long brine (0.5 cup/gal) -> 1 cup salt; short brine (1 cup/gal) -> 2 cups salt
```

A second script, `check_food_run3.mjs`, ran the programmatic checks the skill requires (dynamic
`import()` of the real `data/calculators/index.ts`): all 7 new ids unique and not colliding with
any `redirectFrom`, no `related`-id self-reference, every `related` id (both the new calculators'
own lists and the existing calculators updated to cross-link back) exists, and
`seo.title`/`seo.description` within their character limits.

`npm test`: see PR description for pass count after `npm run test:update`.

`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`: see PR description.

## Cross-links

- `coffee-ratio-calculator` <-> `cold-brew-ratio-calculator` (both new, bidirectional).
- `party-drinks-calculator` <-> `party-food-calculator` (party-food's `related` had room for a 4th
  id; added `party-drinks-calculator` there).
- `brine-calculator` -> `turkey-thaw-time-calculator`, `turkey-cook-time-calculator`,
  `steak-doneness-calculator`; `turkey-thaw-time-calculator`'s `related` had room for a 4th id,
  added `brine-calculator` there (`turkey-cook-time-calculator` was already at its 4-id cap).
- `abv-calculator` -> `yeast-conversion-calculator` (fermentation/yeast theme), `party-drinks-calculator`,
  `cake-servings-calculator`; `yeast-conversion-calculator`'s `related` had room for a 4th id, added
  `abv-calculator` there.

## Structural checks (no visual-QA pass this batch)

Per the current cadence (`CLAUDE.md`), a Chrome visual pass is batched every ~50 calculators, not
per batch. Running total toward the next visual-QA pass going into this run: Wave 2 Construction
(21, across 4 batches) + Food run 1 (5) + Food run 2 (5) = 31 calculators since the last real visual
pass. This run adds 7 more, bringing the running total to **38** — getting close to, but not yet
at, the ~50 checkpoint. **Flagging explicitly per the batch brief: the next Food/Sports batch (or
the batch after it) should trigger the visual-QA pass**, since Sports batches will likely push the
total past 50 before that sector is done. curl-based structural checks against the dev server
confirmed H1, JSON-LD and every content section for all 7 new pages — see the PR description for
the exact pass/fail summary.

## Dev server

Started with `run_in_background`; confirmed killed (no process left listening on the port used)
before finishing — see the PR description for the exact check.
