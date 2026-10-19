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
- [x] pounds-to-kilograms-converter (A · LogScale with pound / stone / 100 lb / short ton; stone added to `mass`; plan: common-values table, not in kit)
- [x] Number verification script, tests, build, lint, STATUS.md, PR ready

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
| fahrenheit-to-celsius | A | °F ↔ °C (K and °R in the menus) | — | thermometer → **RangeBar** freezing / body / boiling, in °C |
| gallons-to-liters | A | gal (US or UK in the menu) ↔ L | — | common-values table → **LogScale** with can / gallon / 5 gal / oil barrel |
| miles-to-kilometers | A | mi ↔ km | — | common-distances table → **LogScale** with mile / 5K / half / marathon |
| pounds-to-kilograms | A | lb ↔ kg (+ st in the menus) | — | common-values table → **LogScale** with pound / stone / 100 lb / short ton |

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

## Notes (resumed and finished 2026-10-19)

- First run: the five shopping calculators, then a pause at 5 (D11). Second run: the four converters.
- **Converters:** two solver variables of the same dimension, each with its own unit menu. `solve`
  is the identity in SI, with `NaN` for negative values (below absolute zero for temperature).
  The exact factors come from `lib/units.ts` (NIST SP 811), so the solver is exact while the
  unchanged `compute()` keeps its rounded factors (3.78541, 1.60934, 0.453592). The two differ only
  in the sixth significant figure. The snapshot has not moved.
- **Stone** (14 lb, exact) is appended to `mass`. The force-calculator mass menu gains "st"; its other
  units, factors, defaults and result (4,170 N) are unchanged. The pinned-factor test now includes st,
  and an anchor test checks 1 st = 14 lb = 6.35029318 kg.
- **Visuals:** no thermometer or common-values table in the kit. Temperature uses `RangeBar`
  (fed by a `derive` key in °C). Volume, distance and mass use `LogScale` with real reference
  points on evenly spaced exponents (10^-1 to 10^3). Gaps Parked.
- **Verification:** `verify36.py` (scratchpad, Python, imports nothing from the app) matched
  **173 of 173** copy figures, 0 mismatches. The app's `solveState()` / `compute()` agree.
