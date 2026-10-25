# Step 42 — Wave 1: conversion (new calculators)

Third and last sub-wave of Wave 1 (`mdFiles/STATUS.md` row 40–42), after math (step 40, 29
calculators) and statistics (step 41, 25 calculators), both merged. Builds the ~65-page
conversion list from `mdFiles/calculator-rollout-plan.md` §4 Wave 1 ("measurements → Conversion")
in runs of 5, following the structure, conventions and lessons of
`mdFiles/steps/40-wave-1-math.md` and `mdFiles/steps/41-wave-1-statistics.md`.

Read before starting: `mdFiles/calculator-template-v2.md`, `.claude/skills/add-calculator/SKILL.md`,
`lib/units.ts` (the whole file — it is short), and `data/calculators/measurements.ts` (the four
existing converters are the reference pattern for this sub-wave, not `force-calculator`).

## Progress

- Run 1 (this run): **common-values table kit section + retrofit of the 4 existing converters +
  cm-to-inches, feet-to-meters, ounces-to-milliliters, grams-to-ounces, mph-to-kph.**
  - [x] Kit: `content.commonValues` (type, renderer, TOC entry, unit test) — see "Kit addition"
  - [x] Fix `miles-to-kilometers-converter`'s `compute()` (uses `1.60934`, must use the exact
    factor via `lib/units.ts`) and audit the other three existing `compute()`s the same way
  - [x] Retrofit `commonValues` onto the 4 existing converters (miles↔km, °F↔°C, lb↔kg, gal↔L)
  - [x] centimeters-to-inches-converter
  - [x] feet-to-meters-converter
  - [x] ounces-to-milliliters-converter (US fl oz; UK fl oz in the menu and a watch-out)
  - [x] grams-to-ounces-converter (avoirdupois oz; troy oz called out in a watch-out, not in the menu
    unless `lib/units.ts` already has it)
  - [x] mph-to-kph-converter
  - [x] Snapshot tests (`npm run test:update`, diff touches only the intended ids), round-trip tests
  - [x] `npm test`, `npm run build`, `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` pass
  - [x] Spot-check the new pages + one retrofitted page + `/categories/measurements` on a local
    server (H1, section ids incl. `common-values`, JSON-LD, table figures), kill the server
  - [x] Update `mdFiles/STATUS.md` (row 40–42 + session log), open/ready the PR

## Run 2

General one-dimension converters: length, weight (mass), volume, area, speed — all units of that
dimension offered in the unit menus (already true for every existing pair converter, since
`SolverCalculator` lists every `UNITS[dimension]` entry regardless of `defaultUnit` — confirmed by
reading `components/SolverCalculator.tsx:126`). "General" here means the page's SEO framing, a
sensible default pair, and its own `commonValues` table — not a new widget pattern.

**Dedupe decisions** (checked programmatically against every existing `id`/alias before building):
- `distance converter` moves from `miles-to-kilometers-converter` to the new `length-converter`
  (the generic term belongs on the page that covers every length unit, not one specific pair).
- `weight converter` moves from `pounds-to-kilograms-converter` to the new `weight-converter`.
- `volume converter` moves from `gallons-to-liters-converter` to the new `volume-converter`.
- `area converter` and `speed converter` are new aliases (no prior collision found).
- No id collision with the existing geometry calculators `area-calculator`, `volume-calculator`,
  `distance-calculator` (math category — shape area/volume/coordinate distance, a different topic
  entirely; checked their aliases too, no overlap).

**Temperature decision**: no separate general temperature-converter page this run.
`fahrenheit-to-celsius-converter` already offers all 4 units in `UNITS.temperature` (K, °C, °F, °R)
in both its unit menus, and already holds the alias "temperature converter". A separate general
page would be a near-duplicate with nothing left to add.

**Default pairs** (per dimension, a sensible everyday pair, not necessarily the pair the kit's
other pages already use for their own pair converter):
- `length-converter`: meters ↔ feet.
- `weight-converter`: kilograms ↔ pounds.
- `volume-converter`: liters ↔ US gallons.
- `area-converter`: square meters ↔ square feet.
- `speed-converter`: meters per second ↔ km/h (mph↔km/h is already `mph-to-kph-converter`'s own
  pair; m/s↔km/h differentiates this page and is exact — 1 m/s = 3.6 km/h exactly).

**commonValues tables**: each page's table uses its own default pair, in the *opposite* primary
direction from any sibling pair-converter that already covers the same two units (e.g.
`weight-converter`'s table is kg→lb; `pounds-to-kilograms-converter`'s is lb→kg), with a distinct
value set, so no table is a copy of another page's.

### Progress

- [x] Dedupe check (ids + aliases, programmatic) and the decisions above
- [x] `length-converter`
- [x] `weight-converter`
- [x] `volume-converter`
- [x] `area-converter`
- [x] `speed-converter`
- [x] Move `distance converter` / `weight converter` / `volume converter` aliases onto the new pages
- [x] Independent scratch verification (`verify_run2.mjs`) of every copy figure before committing
- [x] `npm test`, `npm run build`,
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` pass
- [x] Spot-check the 5 new pages + `/categories/measurements` on a local server, kill the server
- [x] Update `mdFiles/STATUS.md` (row 40–42 + session log), `gh pr ready`

## Run 3

General converters, continued: time, pressure, energy, power, data storage — same "general page,
existing widget, new default pair + its own `commonValues` table" pattern as run 2.

**Dedupe check (programmatic, against every `id`/alias/`redirectFrom` in `data/calculators/*.ts`
before building)**: `time-converter`, `pressure-converter`, `energy-converter`, `power-converter`
and `data-storage-converter` are all free ids. No alias collisions either — checked every file for
"time converter" / "pressure converter" / "energy converter" / "power converter" / "data storage
converter" and related phrasings (mb to gb, psi to bar, hp to kw, joule, btu, torr, mmhg, bit/byte
converter, bandwidth, etc.). `time.ts` (age-calculator, work-hours-calculator,
date-difference-calculator, sleep-time-calculator, pomodoro-timer) is about dates/durations/timers,
not unit conversion — no overlap. `physics.ts` has only `force-calculator` so far — no existing
energy/power/pressure calculator to collide with (those are planned for a later physics wave, not
this step). `home.ts`'s `electricity-bill-calculator` ("energy bill calculator" alias) and
`health.ts`'s `tdee-calculator` ("total daily energy expenditure calculator") are unrelated topics
(billing, metabolism), not unit conversion.

**Default pairs** (per dimension, a sensible everyday pair — same precedent as run 2, where a
general page's default pair can share units with a sibling pair-page, differentiated by its own
table direction/values, e.g. `weight-converter` kg→lb vs `pounds-to-kilograms-converter` lb→kg):
- `time-converter`: hours ↔ minutes — the default pair is deliberately one of the *exact*
  conversions in `UNITS.time` (60 min = 1 h exactly), so the lead example carries no caveat; months
  and years (both averages) are covered in the table, formula note and a watch-out instead.
- `pressure-converter`: psi ↔ bar — tire-pressure scale, relatable, and `psi` is exact from `lbf/in²`.
- `energy-converter`: kilojoules ↔ kilocalories — nutrition-label pair, both units already in
  `UNITS.energy`.
- `power-converter`: kilowatts ↔ horsepower — engine-power pair.
- `data-storage-converter`: gigabytes ↔ megabytes — the most-searched general pair; the page's
  whole point (decimal vs. binary, bits vs. bytes) is covered in concept/formula/watchOut/FAQ and a
  GiB-inclusive commonValues table, not in the default pair itself.

**Accuracy notes specific to this run** (per the work order):
- **Time**: `lib/units.ts`'s `mo`/`yr` are *averages* (`YEAR = 365.25 × 86400 s`, `month = YEAR/12`)
  — stated as such in concept/formula/watchOut, never presented as exact.
- **Data storage**: decimal (KB/MB/GB = 1000ⁿ) vs. binary (KiB/MiB/GiB = 1024ⁿ) explained, including
  why a "1 TB" drive shows about 931 GiB in an OS; bits vs. bytes (Mbit/s network speed vs. MB/s
  file transfer) called out with a worked conversion.
- **Energy**: `cal`/`kcal` in `lib/units.ts` are the *thermochemical* calorie (4.184 J exact); a food
  "Calorie" is a kcal. `BTU` in `lib/units.ts` is the International Table BTU (1055.05585262 J) —
  cited as such, not the thermochemical or 59°F BTU variants.
- **Power**: mechanical hp (`550 × ft × lbf` = 550 ft·lbf/s ≈ 745.7 W) vs. metric PS
  (`75 × kgf × m/s` = 75 kgf·m/s = 735.49875 W exactly) — both exact from their own definitions,
  explained as two different "horsepower-like" units, hp slightly larger than PS.
- **Pressure**: mmHg (133.322387415 Pa, a conventional density-based definition) vs. Torr
  (101325/760 Pa exactly) — nearly but not exactly equal (confirmed via `lib/units.spec.ts`'s own
  `atm → mmHg` test, which already uses a 1e-5 tolerance, not exact equality); psi is exact via
  `lbf/in²`.
- No unit was missing from `lib/units.ts` for any of the five dimensions — nothing added to `UNITS`
  or `lib/units.spec.ts` this run.

### Progress

- [ ] Dedupe check (ids + aliases, programmatic) and the decisions above
- [ ] `time-converter`
- [ ] `pressure-converter`
- [ ] `energy-converter`
- [ ] `power-converter`
- [ ] `data-storage-converter`
- [ ] Independent scratch verification (`verify_run3.mjs`) of every copy figure before committing
- [ ] `npm test`, `npm run build`,
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` pass
- [ ] Spot-check the 5 new pages + `/categories/measurements` on a local server, kill the server
- [ ] Update `mdFiles/STATUS.md` (row 40–42 + session log), `gh pr ready`

## Planned run breakdown (re-evaluate each run against what exists before building it)

The plan's list is "~65, only pairs with real search volume, each with a real common-values
table". Proposed grouping; later runs may merge, drop or swap items after a dedupe check:

- **Run 1 (this run):** kit table + retrofit; cm↔in, ft↔m, fl oz↔mL, g↔oz, mph↔km/h.
- Run 2 — general one-dimension converters (all units of one dimension, one page each): length,
  weight (mass), volume, area, speed. Temperature is already covered by
  `fahrenheit-to-celsius-converter` (which aliases "temperature converter"); decide whether a
  separate general page is justified or whether it just gains Kelvin/Rankine table rows.
- Run 3 — general converters, continued: time, pressure, energy, power, data storage.
- Run 4 — high-volume pairs: inches↔mm, mL↔cups, kg↔stone, acres↔hectares, sq ft↔sq m.
- Run 5 — pairs: kW↔hp, psi↔bar, kcal↔kJ, MB↔GB (decimal vs binary called out), mpg↔L/100 km
  (fuel economy — the `fuelEconomy` dimension already has the reciprocal units).
- Runs 6+ — lookup-table converters that are not a single factor: cooking cups↔grams by
  ingredient (density table, cited), shoe size, ring size, clothing size. These need a cited source
  per table row and probably a type-B breakdown with a select input; scope each before building.
  Remaining pairs from search-volume review fill out to ~65.

## Kit addition (run 1): `content.commonValues`

Every conversion page needs "a real common-values table" (plan §4). The kit has no table section,
so add one — small, generic, and computed, never hand-typed.

- **Type** (in `CalculatorContent`, `data/calculators/types.ts`), roughly:

  ```ts
  commonValues?: {
    title: string;                 // e.g. "Common centimeters to inches conversions"
    dimension: UnitDimension;
    from: string;                  // unit id in UNITS[dimension]
    to: string;                    // unit id in UNITS[dimension]
    values: number[];              // the "from" column — chosen for real search intent
    reverse?: number[];            // optional second table, to → from
    decimals?: number;             // display rounding, default sensible per page
  };
  ```

  Adjust the exact shape to what the code actually needs, but keep the principle: **the right-hand
  column is computed through `lib/units.ts` (`toBase` / the matching from-base helper) at render
  time, never typed in.** A hand-written number in a table is how a wrong factor survives review.
- **Rendering**: a new section in `app/[locale]/calculators/[slug]/page.tsx`, id `common-values`,
  in the TOC, placed after the worked example (before watch-out). Plain semantic `<table>` with a
  `<caption>`, styled like the existing cards. Server-rendered and static — no client JS, no
  request headers (`force-static` must still hold). Region-aware number formatting via
  `lib/calculator.ts`, not `toFixed` + `en-US`.
- **Feet + inches**: where a page's table shows lengths in feet and inches (ft↔m, cm↔in height
  rows), render as `5 ft 11 in` and **never** `5 ft 12 in` — round total inches first, then split.
  Check whether a feet-inches formatter already exists (grep `ft` / `inch` in `lib/` and
  `data/calculators/health.ts` — BMI/height may have one) and reuse it if so.
- **Tests**: a unit test that builds every calculator's table and checks each row round-trips
  (`from → to → from` equals the input to ~1e-12 relative), and that no feet-inches string
  contains `12 in`.
- The 4 existing converters get a `commonValues` block in this run so the section is proven on
  pages that already rank.

## Accuracy rules (all conversion runs)

- **Exact factors only**, from `lib/units.ts`, which already encodes NIST SP 811 Appendix B and the
  1959 international yard-and-pound agreement (yard = 0.9144 m, pound = 0.45359237 kg). Never type a
  factor into a calculator; if a unit is missing, add it to `UNITS` with a test in
  `lib/units.spec.ts` (template rule).
- **Temperature is affine** (offset + factor) — already modeled in `UNITS.temperature`; never
  convert a temperature *difference* with the offset (call this out on any page that lists Δ°).
- **Round-trip** every pair in tests.
- **Negative values only where physical**: temperature yes; length, mass, volume, speed no
  (`>= 0` guard returning `NaN`, as the existing converters do).
- **Copy figures**: every number in example/FAQ/worked-example verified by an independent script
  (scratchpad, no app imports) before committing, as in steps 40–41.
- **US vs UK units**: where the unit differs by country (fl oz, gallon, pint, cup), the menu offers
  both and a watch-out says which is the default and why. US English spelling in copy.

## Pattern for a pair converter (type A, two-variable solver)

Copy `miles-to-kilometers-converter` exactly: two `solver.variables` of the same `dimension`, one
per unit, `solve` passes the base-unit value through with the `>= 0` guard, unit menus do the
converting, a `logScale` (or `rangeBar`) visual with **cited** everyday benchmarks. Keep `inputs` +
`compute()` consistent with the solver (and with the exact factor). Full v2 content: concept, howTo,
formula (state that the factor is exact and why), workedExample, commonValues, watchOut,
references (NIST SP 811 + whatever else is cited — fetch each URL, as in prior runs), 5–6 FAQ.
`seo.title` ≤ 60 characters. 3–6 `related`, no self-reference, all existing ids; aliases must not
collide with any existing alias (check programmatically against the whole set).

## Category

Keep the existing `measurements` category id (changing it would move `/categories/measurements`
and every internal link). Update its description in `data/calculators/index.ts` if the new pages
make the current one ("Common conversions between imperial and metric units.") inaccurate.

## Branch, commits, PR

- Branch `step/42-wave-1-conversion-run-1` from current `master`; `git push -u origin <branch>`
  first, open a **draft PR early**, commit + push after each checklist item, ticking the box in this
  file in the same commit. Never merge — the main session reviews and merges.
- Don't commit `tsconfig.tsbuildinfo` / `next-env.d.ts` (revert the build's dev-mode path change).
- Commit messages: `step 42: <what>`.
