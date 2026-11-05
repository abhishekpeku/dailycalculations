# Step 46 — Wave 2 Food, run 2

Second batch of the `food` category (created in run 1, PR #56). Adding 5 more calculators to the
existing `data/calculators/food.ts` — no new category scaffolding this time. Scoped in
`mdFiles/steps/43-45-wave-2-construction-food-sports.md`. Follows the v2 template and the
`add-calculator` skill. Pattern reference: `turkey-cook-time-calculator` and `pizza-dough-calculator`
in `data/calculators/food.ts` (lookup/breakdown pattern).

## Progress

- [x] `turkey-thaw-time-calculator` — breakdown, USDA refrigerator + cold-water thaw-time lookup by weight
- [x] `boiled-egg-calculator` — breakdown, ATK steamed cook time by doneness + AEB cold-start standing time by size
- [x] `steak-doneness-calculator` — breakdown, Beef Checkoff doneness temperature + carryover pull-temp range
- [x] `party-food-calculator` — breakdown, Old Farmer's Almanac per-person food quantities by guest count
- [x] `yeast-conversion-calculator` — breakdown, King Arthur Professional Baker's Reference weight ratios

Branch `step/46-wave-2-food-run-2`, PR #57. All 5 built, verified, `npm test` (789 tests, 0 failures)
and `npm run lint` passing. `npm run build` run in the background — see "Build" below.

## Picks and why (5 of the ~14 remaining candidates)

Remaining candidates per the scope doc: bread, sourdough, coffee ratio, cold brew ratio, brine,
turkey thaw time, egg boiling, steak cook time, BBQ/party quantities, party drinks/alcohol
quantity, ABV, cake servings, popcorn-for-a-party, yeast conversion, self-rising flour
substitution.

1. **Turkey thaw time** — explicitly suggested, pairs directly with `turkey-cook-time-calculator`
   (cross-linked both ways), YMYL food-safety territory, cites USDA FSIS directly, same discipline
   as the turkey-cook-time precedent.
2. **Boiled egg** — "how long to boil an egg" / "egg calculator" is one of the highest-volume
   single-ingredient cooking-time searches that exists, genuinely distinct shape (time by yolk
   doneness + egg size + start temperature, not a formula).
3. **Steak doneness** — very high search volume ("steak temperature chart", "how long to cook a
   steak"), combines a food-safety minimum (USDA's 145°F + 3-minute rest for whole-muscle beef)
   with a practical doneness/time lookup most cooks actually want.
4. **Party food quantity** — "how much food for a party calculator" is a real, frequent planning
   search, distinct from any existing recipe-scaling or serving-size calculator on the site (scales
   by guest count and meal type, not by a recipe's own servings).
5. **Yeast conversion** — explicitly suggested, clean citable conversion ratios from yeast
   manufacturers, distinct from `bakers-percentage-calculator` (converts yeast *form*, not flour
   percentage).

Not built this run (left for a later batch): ABV, party drinks/alcohol quantity, cake servings,
popcorn-for-a-party, coffee ratio, cold brew ratio, brine, bread, sourdough, self-rising flour
substitution.

## Sourcing — every number fetched directly, not recalled

Per template §3 and the skill's verification step. `fsis.usda.gov` and `beefitswhatsfordinner.com`
both blocked direct `WebFetch` with HTTP 403 or DNS failure (the same bot-protection pattern run-1
hit). Where a page was blocked, PDFs served from the same domain (or a `.gov`/university mirror of
the exact same publication) were fetched directly and read with the `Read` tool instead — a more
direct read than run-1's two-independent-WebSearch-pass fallback, since it's the actual document
byte-for-byte, not a search engine's summary of it. Two independent `WebSearch` passes additionally
corroborated the Beef Checkoff's blocked page, matching figures both times.

- **USDA Food Safety and Inspection Service, "Turkey Basics: Safe Thawing"** (canonical URL
  `fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-basics-safe-thawing`,
  confirmed via `WebSearch` quoting that exact URL with matching figures) — fetched as a PDF from an
  Ohio State University Extension mirror of the same FSIS publication (revised September 2011) and
  read directly with the `Read` tool (PDF support). Gave the full refrigerator thawing table (1-3
  days for 4-12 lb through 5-6 days for 20-24 lb, ~24 hr per 4-5 lb), the full cold-water table (2-6
  hours for 4-12 lb through 10-12 hours for 20-24 lb, ~30 min/lb, water changed every 30 min), the
  2-hour danger-zone rule, and the "cook immediately after cold-water or microwave thawing, but a
  refrigerator-thawed turkey can wait 1-2 more days" distinction used in the watch-outs.
  `turkey-thaw-time-calculator`'s `TURKEY_THAW_BANDS` tables are this chart verbatim. **YMYL /
  food-safety:** cited directly, same discipline as `turkey-cook-time-calculator` in run-1.
- **USDA FDA, "Safe Minimum Internal Temperatures" chart** (`fda.gov/media/107000/download`) —
  fetched as a PDF and read directly. Confirmed 145°F + 3-minute rest for "Beef, Pork, Veal, and
  Lamb (chops, roasts, steaks)", 160°F for ground meat, and "Eggs: cook until yolk & white are
  firm" — used as the USDA/FDA safety floor in both `steak-doneness-calculator` and as the basis
  for `boiled-egg-calculator`'s soft/jammy-yolk watch-out (the chart's own words, not a third-party
  paraphrase of what the FDA "means"). **YMYL / food-safety:** cited directly.
- **Beef Checkoff, beefitswhatsfordinner.com, "Determining Doneness"** — page blocked `WebFetch`
  with HTTP 403; corroborated via two independently-worded `WebSearch` passes, both quoting the same
  URL and returning identical figures: 145°F medium-rare, 160°F medium, 170°F well-done (steaks).
  No "rare" or "medium-well" figure is published by this source — the calculator and copy
  deliberately don't invent one (see `steak-doneness-calculator`'s watch-outs).
- **Beef Loving Texans (Texas Beef Council, a Beef Checkoff state affiliate), "Determining
  Doneness"** (`beeflovingtexans.com/cooking/determining-doneness/`) — fetched directly (not
  blocked, same Beef Checkoff content network as beefitswhatsfordinner.com). Gave the
  carryover-cooking guidance used for the pull-temperature range: "remove from heat 5-10°F before
  target temperature; allow 5-10 minute rest" for steaks/burgers, plus thermometer-placement
  guidance (through the side, thickest part, avoiding bone and fat).
- **America's Test Kitchen, three separate steam-method articles, all fetched directly:**
  "Foolproof Soft-Cooked Eggs" (`americastestkitchen.com/articles/77-foolproof-soft-cooked-eggs`,
  6½ min, ½" boiling water, large cold eggs, confirmed to work for 1-6 eggs at the same timing),
  "How to Make Perfect Jammy Eggs" (`americastestkitchen.com/how_tos/13345-how-to-make-perfect-jammy-egg`,
  8 min, same steam setup), and "Easy-Peel Hard-Cooked Eggs"
  (`americastestkitchen.com/recipes/8712-easy-peel-hard-cooked-eggs`, 13 min, 1" water, large eggs,
  6-egg batch, 15-minute ice bath). All three use the same steam method (eggs in a basket or on a
  rack over boiling water, not submerged) on large, fridge-cold eggs — confirmed consistent enough
  to present as one family of doneness levels, not three unrelated numbers.
- **American Egg Board (incredibleegg.org), "How to Make Hard-Boiled Eggs"**
  (`incredibleegg.org/recipes/cooking-school/how-to-hard-boil-eggs/`) — fetched directly. Gave the
  cold-start method (cover with cold water, bring to a boil, remove from heat, cover, let stand) and
  its standing times by size: 9 min medium, 12 min large, 15 min extra-large. This is a genuinely
  different method from ATK's steam approach (different starting point, different physics) — the
  content explicitly says so rather than implying the two numbers are interchangeable readings of
  the same thing, per template §3's "don't overgeneralize" rule.
- **The Old Farmer's Almanac, "Party Planner Serving-Size Calculator"**
  (`almanac.com/party-planner-cooking-crowd`) — fetched directly. Gave the per-person food quantity
  chart used in `party-food-calculator`: ½ lb protein (beef, pork, chicken, fish fillets, ham), ⅓-½
  lb potatoes, 2 rolls, 1 dessert slice. The chart doesn't distinguish a full sit-down meal from a
  lighter appetizer spread (confirmed by what the fetch returned, not assumed) — flagged explicitly
  as a watch-out rather than silently applying full-meal numbers to a different kind of event. A
  USDA Food Buying Guide for Child Nutrition Programs PDF was also located and considered, but
  rejected as a source for this calculator: its yield tables are built for school-cafeteria edible
  portions, not consumer party planning, and translating one into the other would have required
  inventing a conversion the source doesn't provide — exactly the kind of misapplied-technical-data
  overgeneralization template §3 warns against.
- **King Arthur Baking, Professional Baker's Reference, "Yeast"**
  (`kingarthurbaking.com/pro/reference/yeast`) — fetched directly. Gave the precise weight ratios:
  active dry yeast = fresh yeast × 0.4, instant yeast = fresh yeast × 0.33.
- **King Arthur Baking, "Active dry vs. instant yeast: Why we prefer instant"**
  (`kingarthurbaking.com/blog/2022/08/15/active-dry-versus-instant-yeast`) — fetched directly. Gave
  the consumer-facing "substitute instant 1:1 by weight or volume for active dry" rule, the
  hydration difference (active dry needs proofing in warm water, instant doesn't), and the
  rise-time adjustment (add ~15-20 minutes for a ~1-hour rise when substituting active dry for
  instant). A third-party `WebSearch` synthesis had also claimed a "reduce instant by 25% in a bread
  machine" rule attributed to this same article; the direct fetch of the actual article confirmed it
  **does not** contain that claim, so it was dropped rather than shipped unverified — exactly the
  failure mode template §3's "read sources directly" rule exists to catch.

## Verification

Independent scratch script (re-implements every formula from scratch, no app imports):
`verify_food_run2.mjs` (scratchpad). Every figure matched the expected value, including a bug the
script itself caught: an initial `band()` implementation for `turkey-thaw-time-calculator` picked
the *lower* of two bands at a shared boundary weight (USDA's bands are published as "12 to 16 lb"
and "16 to 20 lb" — 16 lb matches both labels literally), giving a 16 lb turkey the wrong
refrigerator and cold-water figures. Fixed to match the *higher* band at a shared boundary (the
more conservative, longer-thaw-time reading) before writing the real `food.ts` code, so the bug
never shipped.

```
turkey-thaw-time: 16 lb -> refrigerator band 16-20lb (4-5 days, mid 4.5d);
  cold water band 16-20lb (8-10h, mid 9h); 30min/lb rule at 12/16/20 lb matches each band's own low end
boiled-egg: ATK steam 6.5/8/13 min (soft/jammy/hard); AEB cold-start stand 9/12/15 min (med/large/xl)
steak-doneness: medium-rare 145F (pull 135-140, rest 5-10min); medium 160F (pull 150-155);
  well-done 170F (pull 160-165); USDA whole-muscle minimum (145F) equals the medium-rare target exactly
party-food: 20 guests -> protein 10lb, potatoes 6.667-10lb, rolls 40, dessert 20 slices
yeast-conversion: 30g fresh -> 12g active dry, 9.9g instant; instant is 17.5% less than active dry
  by the precise ratio (0.33/0.4=0.825); active dry is 21.2% more than instant (0.4/0.33=1.212);
  7g active dry -> 17.5g fresh, 5.775g instant
```

A second script, `check_food_run2.mjs`, ran the programmatic checks the skill requires (dynamic
`import()` of the real `data/calculators/index.ts` via Node's native TypeScript stripping): all 5
new ids unique, no `redirectFrom` collision, no `related`-id self-reference, every `related` id
exists (including the new bidirectional cross-link added to `turkey-cook-time-calculator`'s own
`related` list), and `seo.title`/`seo.description` within their character limits — all passed
cleanly on the first run, no copy needed trimming this time. It re-surfaced the same
**pre-existing** issue run-1 found and parked — `"house loan emi calculator"` duplicated as an alias
on both `mortgage-calculator` and `emi-calculator` — unrelated to this batch, left on the Parked
list.

`npm test`: 789 tests, 0 failures, after `npm run test:update` generated the 5 new `compute()`
snapshots. `git diff --stat data/calculators.spec.ts.snapshot` showed 202 insertions, 0 deletions —
confirming no existing calculator's snapshot moved. The generated snapshot values match the
independent verify script exactly (e.g. `party-food-calculator`'s default case: 20 guests → 10 lb
protein, 6.666666667 lb potatoes low, 10 lb high, 40 rolls, 20 dessert slices).

`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`: clean, no output.

## Structural checks (no visual-QA pass this batch)

Per the current cadence (`CLAUDE.md`), a Chrome visual pass is batched every ~50 calculators, not
per batch — skipped here, same as run-1. curl-based structural checks against the dev server
confirmed H1, JSON-LD and every content section for all 5 new pages — see the PR description for
the exact pass/fail summary. Running total toward the next visual-QA pass: Wave 2 Construction (21)
+ Food run 1 (5) + Food run 2 (5) = 31 calculators since the last pass.

## Dev server

Started with `run_in_background`; confirmed killed (no process left listening on the port used)
before finishing — see the PR description for the exact check.
