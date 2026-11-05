# Step 46 — Wave 2 Food, run 2

Second batch of the `food` category (created in run 1, PR #56). Adding 5 more calculators to the
existing `data/calculators/food.ts` — no new category scaffolding this time. Scoped in
`mdFiles/steps/43-45-wave-2-construction-food-sports.md`. Follows the v2 template and the
`add-calculator` skill. Pattern reference: `turkey-cook-time-calculator` and `pizza-dough-calculator`
in `data/calculators/food.ts` (lookup/breakdown pattern).

## Progress

- [ ] `turkey-thaw-time-calculator` — breakdown, USDA thaw-time lookup by weight + method (fridge/cold water/microwave)
- [ ] `boiled-egg-calculator` — breakdown, boil time lookup by egg size + doneness + start temp
- [ ] `steak-doneness-calculator` — breakdown, internal temperature + grill time lookup by doneness + thickness
- [ ] `party-food-calculator` — breakdown, food/drink quantity per person by guest count + meal type
- [ ] `yeast-conversion-calculator` — solver/breakdown, active dry ↔ instant ↔ fresh yeast conversion

Branch `step/46-wave-2-food-run-2`.

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

## Sourcing

(filled in during build)

## Verification

(filled in during build)

## Structural checks

(filled in during build)

## Dev server

(filled in during build)
