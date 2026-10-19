# Step 36 — Batch 2: shopping + conversion (9), v2 conversion

## Progress

- [x] Step file, draft PR
- [x] sales-tax-calculator (A · Donut price + tax)
- [x] tip-calculator (A · Donut bill + tip, per-person center; split fixed)
- [x] discount-calculator (A · CompareBars original vs sale; second discount + tax fixed)
- [x] unit-price-calculator (A · CompareBars item 1 vs item 2; item 2 fixed)
- [x] cashback-calculator (B · CompareBars rewards vs fee)
- [x] fahrenheit-to-celsius-converter (A · RangeBar freezing / body / boiling, in °C; plan: thermometer, not in kit)
- [x] gallons-to-liters-converter (A · LogScale with can / gallon / 5 gal / oil barrel; plan: common-values table, not in kit)
- [x] miles-to-kilometers-converter (A · LogScale with mile / 5K / half / marathon; plan: common-distances table, not in kit)
- [ ] pounds-to-kilograms-converter (A, 2 fields; add stone to `mass`)
- [ ] Number verification script, tests, build, lint, STATUS.md, PR ready

Commit + push after each box (`step 36: <id>`). Runs are 5 calculators (D11): the first run
builds the five shopping calculators and pauses; the second run does the four converters.

**Scope (from `STATUS.md`):** Batch 2, shopping (5) + measurements (4). Convert the 9 calculators
to the v2 template: widget type per the plan, units/formats, the listed result visual (nearest kit
component when the kit lacks it, gap Parked), full v2 content (concept, how-to, formula, worked
example, watch-outs, FAQ, references), verified numbers. Ids/URLs unchanged; `calculatorOrder`
untouched.

**Spec:** `mdFiles/calculator-rollout-plan.md` §1 and §3 Batch 2; `mdFiles/calculator-template-v2.md`.

---

## Plan

| Calculator | Type | Auto-solve fields / fixed inputs | Outputs | Visual (plan → used) |
|---|---|---|---|---|
| sales-tax | A | total ↔ price ↔ rate (all closed form; "remove tax" = solve price) | tax | stacked bar → **Donut** price + tax |
| tip | A | tip ↔ bill ↔ tip %; split count fixed | total, per person, tip per person | per-person chips → **Donut** bill + tip, center per person |
| discount | A | sale price ↔ original ↔ % off; second discount and tax rate fixed | after first discount, savings, effective %, tax, total with tax | strikethrough card → **CompareBars** original vs sale |
| unit-price | A | unit price ↔ cost ↔ quantity; item 2 cost + quantity fixed | price per 100, item 2 unit price, item 2 vs item 1 | **CompareBars** which is cheaper |
| cashback | B | — | net annual value, yearly rewards, monthly rewards, effective rate | **CompareBars** rewards vs fee |
| fahrenheit-to-celsius | A | °F ↔ °C | — | thermometer (resume run) |
| gallons-to-liters | A | gal ↔ L | — | common-values table (resume run) |
| miles-to-kilometers | A | mi ↔ km | — | common-distances table (resume run) |
| pounds-to-kilograms | A | lb ↔ kg (+ st) | — | common-values table (resume run) |

### Decisions

- **Type A keeps `inputs` + `compute()` unchanged** (step 35 pattern), so the snapshot does not
  move. Only input labels may change (labels are not in the snapshot).
- **Solver defaults may differ from `inputs` defaults** where the example line needs them (tip:
  split 3 people; discount: second 10% coupon on). The forward `inputs` defaults stay, because
  they drive the snapshot.
- **Kit gaps** (stacked bar, per-person chips, strikethrough price card): nearest kit component,
  gap Parked. No new kit piece in this step.
- **Unit price and sub-cent money:** the solver rounds currency to cents, so a $0.2496 unit price
  shows as $0.25. Unit price adds a "per 100 units" output and draws its bars from per-100 figures,
  which keeps cent resolution. Sub-cent display is Parked for the region step.

## Pause

Paused 2026-10-19 after cashback-calculator. Resume from the first unchecked box.

Notes for the resume run (the four converters, all in `data/calculators/measurements.ts`):

- Same pattern: `solver` beside the unchanged `inputs` + `compute()`; check the snapshot stays put.
- Two-field converters: one variable per unit, each with a `dimension` (`temperature`, `volume`,
  `length`, `mass`) so the unit menus work; `solve` is just the identity in SI.
- **Stone** still needs adding to `mass` in `lib/units.ts` (1 st = 14 lb, exact). Appending it
  at the end changes the force-calculator mass menu (it gains "st"); decide and note it.
- No thermometer or common-values table exists in the kit. Use the nearest kit component
  (e.g. `LogScale`/`RangeBar` with benchmarks, or `CompareBars`) and Park the gap.
- `lib/breakdown.spec.ts`'s type-B count floor is now 20 (was 40); the converters are type A, so
  the count falls again (check it still passes).
- Verification so far: `verify36.py` (scratchpad, Python, imports nothing from the app) matched
  75 copy figures with 0 mismatches; the app's `solveState()` / `compute()` agree with it.
