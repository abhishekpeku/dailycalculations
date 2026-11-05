# Step 46 — Wave 2 Food, run 1 (new category)

First batch of the new `food` category, scoped in
`mdFiles/steps/43-45-wave-2-construction-food-sports.md` (the "Food — new category `food`"
section lists ~19 first-pass candidates). Construction closed out at 165 calculators (PR #55);
this run opens Food. Follows the v2 template and the `add-calculator` skill. Reference
implementations: `force-calculator` (physics.ts, solver pattern) for `recipe-scaling-calculator`;
`drywall-calculator` / `ac-tonnage-btu-calculator` (home.ts, breakdown + options pattern) for the
other four.

## Progress

- [x] `recipe-scaling-calculator` — solver, 4-variable proportion (servings × ingredient amount)
- [x] `bakers-percentage-calculator` — breakdown, flour-as-100% formula → ingredient weights
- [x] `pizza-dough-calculator` — breakdown, back-solves flour from dough-ball weight + percentages
- [x] `turkey-cook-time-calculator` — breakdown, USDA roasting-timetable lookup by weight band
- [x] `rice-to-water-ratio-calculator` — breakdown, rice-type ratio lookup

Branch `step/46-wave-2-food-run-1`. All 5 built, verified, and passing `npm test` / `npm run build`
/ `npm run lint` before the PR was marked ready.

## Category creation mechanics (new `food` id)

Replicated the same mechanical pattern the `math` category used in Wave 1 (step 40):

1. **`data/calculators/food.ts`** (new file) — exports `foodCalculators: CalculatorConfig[]`.
2. **`data/calculators/index.ts`** — imported `foodCalculators`; added `{ id: 'food', title: 'Food',
   description: '...' }` to the `categories` array; appended the 5 new ids to `calculatorOrder`;
   spread `...foodCalculators` into the `calculators` array.
3. **`lib/categoryTheme.ts`** — added `food: { color: 'red', icon: 'bowl' }` to `CATEGORY_THEME`.
   Every one of the 9 `TileColor` values is already reused by at least one existing category (see
   the file's own comments), so "distinct" meant a new icon rather than an unused color; `red` is
   already shared with `shopping` (icon `tag`), same precedent as `pink` (health/creator), `blue`
   (auto/education), `indigo` (time/physics), `gray` (work/text) and `purple` (measurements/
   statistics) each being shared by two categories already.
4. **`components/IconTile.tsx`** — added a new `bowl` icon (a bowl with rising steam) to the
   `ICONS` record, since no existing glyph fit "recipes/cooking."

Grepped the codebase (per the task's instruction) for every place a category needs registering:
`components/Footer.tsx`, `CategoriesMenu.tsx`, `MobileMenu.tsx`, `CategoryMenuRow.tsx` and the
`/categories/[category]/page.tsx` route all read `categories` / `findCategoryCalculators` from
`data/calculators` (directly, or via `lib/navData.ts`'s `buildNavData()`, which the client Header
uses so it never has to import the full calculator objects). None of them hard-code a category
list — adding the one entry to `data/calculators/index.ts` was sufficient to wire Food into every
nav surface, the category grid, the footer, the sitemap and search. `data/calculators/types.ts`
defines `category: string` with no literal-union restriction, so no type change was needed either.
`food` has only 5 calculators, well under `categories/[category]/page.tsx`'s `SEARCH_THRESHOLD`
(15) and the `GROUPED_CATEGORIES` set in `categories.spec.ts` (measurements/math/statistics only),
so it renders the plain grid with no search box and needs no `group` field on its calculators.

## Picks and why (5 of the ~19 candidates)

Per the task's suggested leads and the scope doc's "real search volume, avoiding thin/duplicate
pages" judgment call:

1. **Recipe scaling** — very high real search volume ("recipe converter", "scale a recipe"), and
   distinct in intent from `ratio-calculator`/`fraction-calculator` (math category) despite sharing
   the underlying proportion math, the same way `turkey-cook-time-calculator` differs from a generic
   cooking-time lookup: the audience, copy, FAQ and worked example are all recipe-specific.
2. **Baker's percentage** — explicitly suggested, real and frequently searched baking-math term,
   and a clean `CalculatorContent` fit (a professional formula with a citable primary source, King
   Arthur Baking's own Professional Baker's Reference).
3. **Pizza dough** — explicitly suggested as a lead; one of the highest-volume food-calculator
   searches that exists. Built as a baker's-percentage application that back-solves flour from
   dough-ball weight, matching how real pizza-dough calculators (Ooni, pizza-forum tools) are
   actually used, rather than duplicating `bakers-percentage-calculator`'s flour-forward direction.
4. **Turkey cook time** — explicitly suggested as the YMYL-adjacent, food-safety pick; cites USDA
   FSIS directly, seasonal but very high-volume search term, and a genuinely different shape (a
   banded lookup table, not a formula) from everything else in this batch.
5. **Rice-to-water ratio** — chosen over brine (the scope doc's other suggested alternative) for
   broader, year-round search volume versus brine's narrower, Thanksgiving-turkey-season audience.
   Also became the batch's best "don't overgeneralize" example once America's Test Kitchen's own
   controlled experiment (cited below) turned up a genuinely counterintuitive finding.

Remaining ~14 candidates from the scope doc's list (bread, sourdough, coffee ratio, cold brew
ratio, brine, turkey thaw time, egg boiling, steak cook time, BBQ/party quantities, party drinks/
alcohol quantity, ABV, cake servings, popcorn-for-a-party, yeast conversion, self-rising flour
substitution) are untouched — left for a later Food batch. Dedupe note from the scope doc still
holds: cups↔grams/butter-stick conversions stay in Measurements, not Food.

## Sourcing — every number fetched directly, not recalled

Per template §3 ("Read sources directly") and the skill's verification step. `fsis.usda.gov`
blocked every direct `WebFetch`/`curl` attempt with HTTP 403 (including the PDF and an
`fsis-prod.fsis.usda.gov` mirror — a bot-protection wall, not an auth wall), the same kind of
fetch failure the Construction run-4 step file hit with Owens Corning's PDFs. The roasting
timetable was instead corroborated by two independent `WebSearch` passes that each directly quoted
the same primary `fsis.usda.gov/.../lets-talk-turkey-roasting` URL and returned byte-identical
weight bands and time ranges both times (every one of the 12 bands, unstuffed and stuffed) — the
closest available substitute for a direct read when the live page actively blocks automated
fetches. The 165°F internal-temperature and 20-minute standing-time figures were each confirmed by
a separate, independently-worded search pass quoting the same source.

- **USDA FSIS, "Let's Talk Turkey — A Consumer Guide to Safely Roasting a Turkey"**
  (`fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/lets-talk-turkey-roasting`)
  — the full 325°F roasting timetable (6 unstuffed + 6 stuffed weight bands), the 165°F minimum
  safe internal temperature (thigh, wing, breast — thigh reaches temperature first), the ~20-minute
  standing time, and the "frozen takes at least 50% longer" note. `turkey-cook-time-calculator`'s
  `TURKEY_ROAST_BANDS` table is this chart verbatim.
- **King Arthur Baking, Professional Baker's Reference, "Baker's Percentage"**
  (`kingarthurbaking.com/pro/reference/bakers-percentage`) — fetched directly. Gave the exact
  definition, the formula, and a full worked example (a French-bread formula totaling 168.25%,
  yielding 201.9 lb, scaled to a 150 lb batch via a 0.8915-rounded-to-0.9 conversion factor) that
  the concept/worked-example copy on `bakers-percentage-calculator` quotes and re-verifies.
- **King Arthur Baking, "Neapolitan-Style Pizza Crust" recipe** (fetched directly) — 232 g flour,
  170 g water, 8 g salt, ⅛ tsp instant yeast, yielding two ~200 g dough balls. Converted to baker's
  percentages (73.3% hydration, 3.45% salt) using the ingredient weight chart below for the yeast
  gram-weight, and used as `pizza-dough-calculator`'s default inputs and worked example — the
  back-solved flour weight (231.76 g) lands within rounding of King Arthur's own stated 232 g.
- **King Arthur Baking, "Super-Fast Thin-Crust Pizza Dough" recipe** (fetched directly) — 240 g
  flour, 152 g water (63.3% hydration), cited as the lower-hydration, same-day contrast to the
  Neapolitan recipe's 73.3%, slow-ferment dough.
- **King Arthur Baking, Ingredient Weight Chart** (fetched directly,
  `kingarthurbaking.com/learn/ingredient-weight-chart`) — confirmed 1 tsp instant yeast = 3 g (2 tsp
  = 6 g per the chart), used to convert the Neapolitan recipe's ⅛ tsp yeast to 0.375 g for the
  baker's-percentage calculation.
- **King Arthur Baking, "How to reduce a recipe"** (fetched directly,
  `kingarthurbaking.com/blog/2020/11/23/how-to-reduce-a-recipe`) — the weight-over-volume scaling
  recommendation, the pan-area method for resizing a pan (verified: halving a 117 sq in 9"×13" pan
  gives 58.5 sq in), and the "start checking at half the original bake time" rule, all used in
  `recipe-scaling-calculator`'s watch-outs.
- **University of Wyoming Extension, "Scaling: Up or Down"** — the conversion-factor method and
  the caution that seasoning and leaveners need judgment, not a strict multiplier (the live page
  403'd `WebFetch` directly; corroborated via `WebSearch`'s direct quote of the same URL).
- **America's Test Kitchen, "We Nail Down the Ideal Ratio of Water to Rice"** (fetched directly,
  `americastestkitchen.com/articles/1692-nailing-the-perfect-ratio-of-water-to-rice`) — the
  counterintuitive core finding used in `rice-to-water-ratio-calculator`'s concept and watch-outs:
  a controlled experiment across 17 rice varieties found every one cooks properly at a 1:1
  rice-to-water ratio once evaporation is eliminated, meaning the commonly cited per-type
  differences come mainly from cook time and evaporation, not from one grain inherently absorbing
  more water than another. This is exactly the kind of overgeneralization template §3 warns
  against ("rice needs more water because it's thirstier"), caught by reading the primary source
  rather than the folk explanation.
- **America's Test Kitchen recipes** — "Basic White Rice" (#6905, 2 cups rice : 3 cups water),
  "Basmati Rice Pilaf" (#10355, 1.5 cups rice : 2.25 cups water), "Basic Brown Rice, rice cooker"
  (#240, 1 cup rice : 2.25 cups water), and (cited in copy without its own reference slot) "Sushi
  Rice" (#11996, 1 cup rice : 1.25 cups water) — the practical stovetop/rice-cooker ratios the
  calculator actually looks up. Jasmine rice shares basmati's 1.5:1 ratio per ATK's "Garlic Fried
  Rice" recipe (1.5 cups rice : 2.25 cups water).

## Verification

Independent scratch script (re-implements every formula from scratch, no app imports):
`verify_food_run1.mjs` (scratchpad). Output — every figure matched the expected value:

```
recipe-scaling: factor 6/4 = 1.5; scaledAmount 2×1.5 = 3; FAQ 3 eggs × (2/6) = 1 egg;
  9x13 pan (117 sq in) halved = 58.5 sq in
bakers-percentage: 500g flour @ 65/2/1% -> water 325, salt 10, yeast 5, total 840;
  KA French-bread example: 150/168.25 = 0.8915 (KA rounds to 0.9) -> flour 90, water 58.5, salt 1.8
pizza-dough: KA Neapolitan 170/232 = 73.28% hydration, 8/232 = 3.45% salt,
  (1/8 tsp x 3g/tsp)/232 = 0.1616% yeast; back-solve check: flour+water+salt+yeast sums to the
  410g total dough weight exactly, both for the KA-sourced default and a second (3 pizza, 250g,
  65/2.5/0.3%) scenario (sums to 750g)
turkey-cook-time: 16 lb unstuffed -> 14-18 lb band -> 3.75-4.25 hr, midpoint 4.00 hr exactly;
  16 lb stuffed -> 4-4.25 hr; 22 lb unstuffed -> 20-24 lb band, 4.5-5 hr
rice-to-water: white/basmati/jasmine = 1.5, brown = 2.25, sushi = 1.25 (all re-derived from the
  ATK recipes' own cup amounts); 1 cup -> mL conversions via the exact US-cup constant
  (236.5882365 mL, matching lib/units.ts's US_GALLON/16) match the lib/units.ts conversion exactly
```

A second script, `check_food_run1.mjs`, ran the programmatic checks the skill requires (dynamic
`import()` of the real `data/calculators/index.ts`, using Node 24's native TypeScript stripping,
the same mechanism `npm test` itself relies on for `.spec.ts` files): all 5 new ids unique, no
`redirectFrom` collision, no `related`-id self-reference, every `related` id exists, and
`seo.title`/`seo.description` within their character limits. It caught two real issues before they
shipped: `recipe-scaling-calculator`'s and `turkey-cook-time-calculator`'s `seo.description` were
initially 169 and 165 characters — both trimmed to fit the ≤160 limit. It also surfaced one
**pre-existing** issue unrelated to this batch — `"house loan emi calculator"` is duplicated as an
alias on both `mortgage-calculator` and `emi-calculator` — left for the main session's Parked list
rather than fixed here, per this run's scope.

`npm test` (784 tests, 0 failures) required `npm run test:update` to generate the 5 new
`compute()` snapshots; `git diff --stat` on `data/calculators.spec.ts.snapshot` showed only 220
insertions, 0 deletions — confirming no existing calculator's snapshot moved.

## Structural checks (no visual-QA pass this batch)

Per the current cadence (`CLAUDE.md`), a Chrome visual pass is batched every ~50 calculators, not
per batch — skipped here. Instead, curl-based structural checks against the dev server
(`npm run dev`, backgrounded) confirmed for all 5 new calculator pages and the new
`/calculators/food` category page... — see the PR description for the exact checks and pass/fail
summary (H1, `WebApplication`/`BreadcrumbList`/`HowTo` JSON-LD, every content section id, and the
category page's grid rendering all 5 food calculators).

## Dev server

Started with `run_in_background`, confirmed killed (port 3000 clear) before finishing — see the PR
description for the exact `netstat`/`taskkill` check.
