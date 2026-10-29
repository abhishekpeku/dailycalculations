# Calculator rollout plan: every calculator on the v2 template

Written 2026-10-12, after the user approved the `force-calculator` preview (commit `f17b7de`,
branch `preview/physics-force-calculator`). **Plan only. Nothing here is built, and nothing is in
`STATUS.md`'s step index yet.**

Read with: `mdFiles/calculator-template-v2.md` (page spec) and `mdFiles/omni-strategy.md`
(why, and the sector waves).

---

## 1. The three widget types

Every calculator gets the same v2 page: title + category tile, then the calculator beside the intro
card and TOC, then concept → how to use → formula → worked example → watch out → FAQ →
references → related. What differs is the widget:

| Type | When | How it behaves | Example |
|---|---|---|---|
| **A · Auto-solve** | One equation whose variables can each be solved from the others | Every field is an input. The least recently edited field is `auto` and gets calculated. No "solve for" buttons. | force, BMI, sales tax, loan payment |
| **B · Forward + breakdown** | Many inputs flowing into several outputs, where no single inverse makes sense | Inputs on top, then a result card with the headline number, a breakdown and a visual | paycheck, commute cost, paint |
| **C · Custom tool** | Not a formula: live text, timers, schedules, live rates | Keeps its own component, restyled to the v2 look | pomodoro, character counter, time zones |

Every type gets: the category accent color, share link, copy and reset, per-field units where a
quantity has units, and **one result visual** (listed per calculator below).

---

## 2. Engineering that must land first

Ordered. Each item is one step-sized work order.

| # | Work | Why |
|---|---|---|
| E1 | **Snapshot tests for all 54 `compute()`** (the existing step 17) | Converting to the solver changes every calculator's code path, so regressions need to be caught. |
| E2 | **Units v2** in `lib/units.ts`: length, area, volume, time, speed, temperature (**affine**, needs an offset not just a factor), energy, power, pressure, data, fuel economy (mpg ↔ L/100 km is **inverse**, not a factor) | Type A needs units on every field. Temperature and fuel economy break the "multiply by a factor" model. |
| E3 | **Solver v2**: an optional numeric solve (bisection/Newton) for variables with no closed form, and **extra outputs** shown alongside the solved field (e.g. total interest) | Loan interest rate, CAGR with contributions and IRR have no closed-form inverse. |
| E4 | **Result visuals kit**: `RangeBar` (BMI-style bands), `Donut` (principal vs interest, budget split), `Timeline` (dates, pregnancy), `AmortizationTable`, a generalized `LogScale`, `CompareBars` (EV vs gas) | One hand-rolled SVG kit, no chart library. |
| E5 | **Type B widget**: a `BreakdownCalculator` component (grouped inputs, result card, visual slot) replacing `CalculatorForm` | Today's `CalculatorForm` is the dull grid. |
| E6 | **Region hook-up** (existing step 18): currency fields and default units follow the region cookie | A loan in ₹ with lakh grouping, BMI in st/lb for GB. |
| E7 | Split `data/calculators.ts` into `data/calculators/<category>.ts` (strategy step 39) | The file would pass 10k lines during this rollout. |

---

## 3. Existing 54 calculators: conversion plan

Batches follow the old rollout steps 12–15, now as **v2 conversions**. Each batch is one
`calculator-builder` agent run on its own branch. YMYL = needs citations and an "estimate only" note.

### Batch 1: Finance (8), YMYL

| Calculator | Type | Auto-solve fields / outputs | Result visual |
|---|---|---|---|
| loan-calculator | A | payment ↔ amount ↔ term ↔ rate (rate numeric) | Donut principal/interest + amortization table |
| mortgage-calculator | A | payment ↔ price ↔ term ↔ rate; down payment as input | Donut + amortization table |
| emi-calculator | A | EMI ↔ amount ↔ months ↔ rate | Donut + yearly table |
| compound-interest-calculator | A | future value ↔ principal ↔ years ↔ rate | Growth curve, contributions vs interest |
| investment-calculator | A | future value ↔ initial ↔ years ↔ return (numeric with contributions) | Growth curve |
| inflation-calculator | A | future value ↔ amount ↔ years ↔ rate | CompareBars, then vs now |
| loan-prepayment-calculator | B | months saved, interest saved | Two-line payoff timeline |
| paycheck-calculator | C → B | gross → taxes → net | Donut where the money goes |

### Batch 2: Shopping (5) + Measurements (4)

| Calculator | Type | Auto-solve fields / outputs | Result visual |
|---|---|---|---|
| sales-tax-calculator | A | price ↔ rate ↔ tax ↔ total (also does "remove tax") | Stacked bar price + tax |
| tip-calculator | A | bill ↔ tip % ↔ tip; split count as input | Per-person chips |
| discount-calculator | A | original ↔ % off ↔ final (stacked second discount as input) | Strikethrough price card |
| unit-price-calculator | A | cost ↔ quantity ↔ unit price; second item for comparison | CompareBars "which is cheaper" |
| cashback-calculator | B | net annual value | CompareBars fee vs rewards |
| fahrenheit-to-celsius-converter | A (2 fields) | °F ↔ °C (affine, needs E2) | Thermometer with reference points (freezing, body, boiling) |
| gallons-to-liters-converter | A (2 fields) | gal ↔ L, US vs UK gallon unit | Common-values table |
| miles-to-kilometers-converter | A (2 fields) | mi ↔ km | Common-distances table (5K, marathon) |
| pounds-to-kilograms-converter | A (2 fields) | lb ↔ kg, plus st for GB | Common-values table |

### Batch 3: Health (6), YMYL

| Calculator | Type | Auto-solve fields / outputs | Result visual |
|---|---|---|---|
| bmi-calculator | A | BMI ↔ weight ↔ height ("what weight gives BMI 24.9?") | RangeBar with WHO bands |
| calorie-calculator | B | maintenance / loss / gain | Three-tier bar |
| tdee-calculator | B | TDEE, BMR | Stacked bar, BMR + activity |
| water-intake-calculator | B | daily oz / L | Glasses-per-day row |
| running-pace-calculator | A | distance ↔ time ↔ pace | Splits table + race predictions |
| pregnancy-due-date-calculator | B | due date, weeks, trimester | Timeline with trimesters |

### Batch 4: Auto (6) + Home (6)

| Calculator | Type | Auto-solve fields / outputs | Result visual |
|---|---|---|---|
| car-payment-calculator | A | payment ↔ price ↔ term ↔ rate | Donut + table |
| gas-cost-calculator | A | cost ↔ distance ↔ mpg ↔ price (mpg ↔ L/100 km via E2) | Cost per mile chip |
| fuel-cost-calculator | B | annual cost, savings vs comparison car | CompareBars |
| ev-charging-calculator | B | charge cost, EV vs gas per mile | CompareBars |
| commute-cost-calculator | B | daily / monthly / annual | Donut fuel/parking/tolls/wear |
| toll-cost-calculator | B | with vs without a toll pass | CompareBars |
| concrete-calculator | A | volume ↔ length ↔ width ↔ depth | Bags-needed chips (60/80 lb) |
| paint-calculator | B | gallons, with buffer | Can-count row |
| tile-calculator | B | tiles, boxes | Grid illustration |
| wallpaper-calculator | B | rolls | Roll-count row |
| electricity-bill-calculator | B | bill, effective rate | Tier bar |
| furniture-fit-calculator | B | fits yes/no, clearance | Top-down floor-plan SVG |

### Batch 5: Time (5) + Travel (4) + Work (4) + Creator (2) + Text (2) + Education (1)

| Calculator | Type | Auto-solve fields / outputs | Result visual |
|---|---|---|---|
| date-difference-calculator | B | days / weeks / months (add a date picker) | Timeline |
| age-calculator | B | exact years/months/days (needs month/day inputs) | Next-birthday countdown |
| sleep-time-calculator | B | wake times by cycle | Cycle timeline |
| work-hours-calculator | B | gross pay | Stacked bar regular/overtime |
| pomodoro-timer | C | — | Ring timer, restyled |
| travel-budget-calculator | B | total, per day | Donut by category |
| visa-stay-days-calculator | B | days remaining | 180-day window bar |
| currency-converter | C | live rates (existing step 22) | Rate trend once FX data exists |
| timezone-meeting-planner | C | — | Hour grid, restyled |
| freelancer-rate-calculator | A | hourly rate ↔ target income ↔ billable hours | Donut income/tax/expenses |
| meeting-cost-calculator | B | total, per attendee | Cost ticker |
| pto-calculator | B | remaining, cash value | Used vs remaining bar |
| salary-raise-calculator | A | new salary ↔ raise % ↔ raise amount | Before/after bars |
| youtube-earnings-calculator | A | earnings ↔ views ↔ RPM | Monthly vs annual bars |
| instagram-engagement-calculator | B | engagement rate | RangeBar of typical rates |
| character-counter | C | — | Platform-limit bars (X, SMS, meta description) |
| hashtag-counter | C | — | Platform-limit bars |
| gpa-calculator | C → B | GPA (unlimited course rows) | Grade distribution |

### Already done

| Calculator | Status |
|---|---|
| force-calculator | v2 reference implementation |
| date-difference-calculator | has v1 content; batch 5 adds concept + references + visual |

**Summary:** 22 type A · 26 type B · 5 type C (+ force) = 54. Counted from the batch tables above.

---

## 4. New calculators, by sector wave

Each sector opens with ≥ 25 calculators (strategy §4.2). Names are working ids. **The lists for
waves 3–4 are seeds**, to be refined against search volume when their wave starts.

### Wave 1: Math, Statistics, Conversion (~120)

- **math** (category added here, ~30): percentage (4 modes, the top priority), percent change,
  percent difference, fraction, mixed number, ratio, proportion, average, weighted average,
  rounding, scientific notation, exponent, square root, cube root, logarithm, factorial, GCF, LCM,
  prime factorization, long division, quadratic formula, pythagorean theorem, triangle, circle,
  area, volume, surface area, slope, distance between points, midpoint, scientific-calculator.
- **statistics** (~25): mean/median/mode, standard deviation, variance, z-score, p-value,
  confidence interval, sample size, margin of error, probability, permutation, combination,
  binomial, normal distribution, percentile, quartile/IQR, correlation, linear regression, t-test,
  chi-square, relative risk, odds ratio, expected value, coefficient of variation, standard error,
  outlier.
- **measurements → Conversion** (~65): length, weight, volume, temperature, area, speed, time,
  pressure, energy, power, data storage, fuel economy, cooking (cups ↔ g by ingredient), shoe
  size, ring size, clothing size, plus the high-volume pairs (oz↔ml, cm↔in, ft↔m, kg↔lb, °C↔°F,
  L↔gal, km↔mi, mph↔kph, in↔mm, g↔oz …), **only pairs with real search volume**, each with a
  real common-values table.

**Wave 1 status: DONE 2026-10-29** (steps 40–42, PRs #15–#36): math 29, statistics 25 and
conversion 36 pages, with 144 calculators on the site. Conversion stopped at run 8. **Clothing size
was dropped by the user's decision**, since no single standard defines letter sizes across brands.
The food list's "cups to grams" below was delivered in Wave 1 (step 42 run 6), so don't rebuild it.
Details: `mdFiles/steps/42-wave-1-conversion.md`.

### Wave 2: Construction, Food, Sports (~100)

- **home → Home & Construction** (+~25): drywall, roofing, flooring, decking, fence, gravel,
  mulch, topsoil, brick, block, rebar, stair, rafter, board foot, square footage, cubic yard,
  insulation, HVAC BTU, window AC size, pool volume, grout, carpet, siding, gutter, asphalt.
- **food** (~25): recipe scaler, cups to grams, cooking time by weight, turkey thaw, coffee
  ratio, pizza dough, bread hydration, macro, protein intake, keto macro, alcohol by volume,
  BAC (YMYL), calories burned cooking, meal cost, sugar, sous-vide time, egg boiling, rice-to-water,
  brine, yeast conversion, oven temperature, baking pan size, servings, grocery budget,
  food cost %.
- **sports** (~25): pace (moved from health), race predictor, VO2 max, heart-rate zones,
  one-rep max, Wilks, calories burned, steps to miles, swim pace, cycling power, cycling gear,
  golf handicap (check World Handicap System naming), bowling score, batting average, ERA,
  slugging, QB rating, ski length, bike size, plate loading, training load, sweat rate, hydration,
  marathon taper, TSS.

### Wave 3: Physics, Chemistry (~120). Needs E2 + E3.

- **physics** (+~60): acceleration (a = Δv ÷ t), velocity, speed-distance-time, weight (W = m·g),
  kinetic energy, potential energy, work, power, momentum, impulse, density, pressure, torque,
  free fall, projectile motion, friction, spring (Hooke), centripetal force, gravitational force,
  Ohm's law, electrical power, resistor color code, series/parallel resistors, capacitance,
  wavelength-frequency, Doppler, decibel, lens/mirror, Snell's law, half-life, E = mc², heat
  (Q = mcΔT), thermal expansion, buoyancy, efficiency, horsepower, RPM-to-speed, gear ratio,
  pendulum, escape velocity …
- **chemistry** (~60): molar mass, molarity, dilution (C1V1), mass percent, moles-grams, ideal
  gas, combined gas law, pH/pOH, pKa, Henderson-Hasselbalch, percent yield, limiting reagent,
  theoretical yield, empirical formula, stoichiometry, solution concentration (ppm, mg/L),
  half-life, rate constant, Arrhenius, enthalpy, specific heat, osmolarity, normality, titration,
  electron configuration, equilibrium constant, Gibbs free energy, density of solutions,
  serial dilution …

### Wave 4: Biology, Ecology, Other (~80)

- **biology** (~30): cell dilution, bacteria growth, doubling time, Punnett square,
  Hardy-Weinberg, DNA concentration, PCR annealing temperature, cell density, generation time,
  population growth, ligation ratio, molarity for buffers, protein concentration (A280),
  centrifuge RCF ↔ RPM, dog/cat age, pet food, gestation (animals) …
- **ecology** (~25): carbon footprint, flight emissions, car CO₂, home energy CO₂, solar panel
  size, solar payback, battery backup runtime, rainwater harvest, water footprint, tree carbon
  offset, compost ratio, EV vs gas lifetime CO₂, LED savings, heat pump savings …
- **fun / other** (~25): love, zodiac, birthday paradox, dice probability, lottery odds, time
  until, countdown …. **These are PR and link bait.** Keep them clearly separate from YMYL
  pages.

**Total at the end of wave 4: ~54 + 420 ≈ 475.**

---

## 5. How each batch runs

1. One batch = one `calculator-builder` agent run (background), one branch (`wave/<n>-<sector>-<k>`),
   **5 calculators** (not 10, so each run stays small), **always branched from the latest `origin/master`**. **Only one agent runs at a
   time.** Nothing runs in parallel: the next batch starts only after the previous one is merged.
2. Every agent commits and pushes after each sub-task (each calculator in a batch), keeps a Progress checklist in its step file, and opens a draft PR early, so an interrupted run can be resumed from the checklist.
   The agent follows `.claude/skills/add-calculator/SKILL.md`: v2 fields, type A/B/C widget,
   **independent number verification**, build + lint. It commits, pushes its branch, and opens a
   pull request with `gh pr create` (a draft at the start, marked ready with `gh pr ready` at the end). It never merges.
3. The main session checks the PR: build, lint and `npm test` pass, and the agent's verification
   output is in the PR body.
4. **The main session merges each passing PR without asking the user** (the user never merges):
   `gh pr merge <n> --squash --delete-branch`, then `git checkout master && git pull`, and records
   the step in `STATUS.md`. If master moved, it rebases the branch first, rebuilds, and only then
   merges. A failing PR goes back to the agent (or is fixed in the main session) and is not merged.
   The user can review the merged pages on `master` at any time.
5. **Deploy stays separate.** `npm run deploy` runs only when the user asks. If the Cloudflare
   project is connected to GitHub (Workers Builds), a merge to `master` *is* a deploy, so the
   main session must check this once and record the answer here.
6. After each **sector**, run a measure gate: 4–6 weeks of Search Console impressions before
   opening the next sector in that wave.

Pace, one batch at a time: a run is 5 calculators, and the D12 default of 10 calculators a week
means two runs a week, back to back. That was already the assumption, so running batches in
sequence does not slow the plan. It only rules out catching up by running two at once. The
existing conversions are 53 calculators: the plan's batches 1–5 (8, 9, 6, 12, 18) split into
2 + 2 + 2 + 3 + 4 = 13 runs, **~6–7 weeks**. Then wave 1 ~24 runs, wave 2 ~20, wave 3 ~24 and wave
4 ~16: **~49 weeks of building in all**. The per-sector measure gates (item 6) add nothing while another sector is
queued to build during the wait. Any gate with nothing else queued adds its 4–6 weeks. Realistic
total: **12–14 months**, slightly longer than the strategy §4.2 estimate of ~12 months.

---

## 6. Order of work (proposed for `STATUS.md`)

```
11 gate verdict (needs Search Console: 28a)
  → E1 (step 17 tests) → E2 units v2 → E3 solver v2 → E4 visuals kit → E5 type-B widget
  → Batch 1 finance → Batch 2 shopping+conversion → Batch 3 health → Batch 4 auto+home → Batch 5 rest
  → E7 file split → Wave 1 → gate → Wave 2 → gate → Wave 3 → gate → Wave 4
E6 (region, steps 18–21) runs in sequence too, slotted between two steps any time after E1, never
alongside one. Ads (strategy step 38) once ~100 v2 pages exist.
```

Open decisions for the user before this goes into `STATUS.md`:
- Pace: 10/week or 5/week?
- Does the step-11 gate still hold for the v2 template, or does the approved preview replace it?
- Sector order: keep math/stats/conversion first, or move physics up because the demo is physics?
