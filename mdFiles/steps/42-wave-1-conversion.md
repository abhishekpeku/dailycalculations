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

- [x] Dedupe check (ids + aliases, programmatic) and the decisions above
- [x] `time-converter`
- [x] `pressure-converter`
- [x] `energy-converter`
- [x] `power-converter`
- [x] `data-storage-converter`
- [x] Independent scratch verification (`verify_run3.mjs`) of every copy figure before committing
  — caught and fixed one slip (power-converter's worked-example explanation said "136.0 PS" for
  134 hp; the correct figure is 135.86 PS) before it was committed.
- [x] `npm test`, `npm run build`,
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` pass
- [x] Spot-check the 5 new pages + `/categories/measurements` on a local server, kill the server
- [x] Update `mdFiles/STATUS.md` (row 40–42 + session log), `gh pr ready`

## Run 4

High-volume pairs: inches↔mm, mL↔cups, kg↔stone, acres↔hectares, sq ft↔sq m — same pair-converter
pattern as run 1 (`centimeters-to-inches-converter`), with the overlap rule: each pair page must not
cannibalize the general pages from run 2/3 that already cover the same units.

**Dedupe check (programmatic, against every `id`/alias/`redirectFrom` in `data/calculators/*.ts`
before building)**: no existing id for any of the 5 new ids. Two alias collisions found and
resolved by moving the alias to the new, more specific page (same precedent as run 2's `distance
converter` move):
- `'stone to kg converter'` was an alias of `pounds-to-kilograms-converter` — moved to
  `kilograms-to-stone-converter`, since that page is the one actually dedicated to stone.
- `'sq ft to sq m converter'` was an alias of `area-converter` — moved to
  `square-feet-to-square-meters-converter`, since that page is the one actually dedicated to that
  pair; `area-converter` keeps `'square meters to square feet converter'` (its own primary
  direction, m²→ft²).
No other alias phrasings (checked: mm/in, drill bit, ml/cup, acre, hectare) collide anywhere.

**Overlap differentiation** (per pair, vs. the sibling general page that already lists the same
units in its menu):
- `millimeters-to-inches-converter`: `length-converter`'s own default pair is m↔ft and its table
  uses round meter/feet values — no mm/in table there at all. New page's table targets drill-bit
  and fastener sizes (mm) and fractional inches (1/16 in … 1 in), a distinct, mm-specific intent
  `length-converter` doesn't serve.
- `milliliters-to-cups-converter`: `volume-converter`'s own default pair is L↔US gal and its table
  is liter/gallon volumes — no cup table there. New page's table uses recipe-size cup amounts (¼–4
  cups) and bottle/carton mL amounts (50–1,000 mL), and states the US customary cup (236.59 mL) as
  the default against the metric cup (250 mL) and the UK's lack of a standard cup measure.
- `kilograms-to-stone-converter`: `weight-converter`'s own default pair is kg↔lb, no stone table.
  `pounds-to-kilograms-converter` only *mentions* stone in a watch-out, with no table either — this
  new page is the first with a real stone table, body-weight kg values shown as "st lb" (e.g. "11
  st 0 lb"), never "X st 14 lb" (see "Kit addition: `stoneLbs`" below).
- `acres-to-hectares-converter`: `area-converter`'s own default pair is m²↔ft², no acre/hectare
  table (acres and hectares are only in its unit menus, not its table). New page's table uses
  farmland/land-parcel sizes (¼ acre – 100 acres; 1–250 ha).
- `square-feet-to-square-meters-converter`: `area-converter`'s own default pair IS m²↔ft², so this
  page takes the *opposite* primary direction (ft²→m², vs. `area-converter`'s m²→ft²) and a
  distinct table — room/home sizes (500–3,000 ft²; 10–200 m²) — vs. `area-converter`'s generic
  round numbers (1–500 m²; 100–10,000 ft²).

**Kit addition (run 4): `commonValues.stoneLbs`**. The work order's "st lb" display (e.g. "11 st 4
lb", never "11 st 14 lb") needs the same round-total-then-split principle as `feetInches`, but for
mass (stone + pounds) instead of length (feet + inches). Added minimally, mirroring `feetInches`
exactly:
- `lib/commonValues.ts`: `formatStoneLbs(totalPounds)` — rounds total pounds first, then splits
  into whole stone (`÷14`) and a 0–13 lb remainder (`%14`), so it can never print "14 lb", the same
  way `formatFeetInches` can never print "12 in". `columnHeader`/`cellText`'s existing boolean
  `asFeetInches` parameter becomes `boolean | 'stoneLbs'` (fully backward compatible — `true`/
  `false` behave exactly as before); `'stoneLbs'` converts the cell's value to pounds (via
  `convert(..., 'lb')`) and runs it through `formatStoneLbs`.
- `data/calculators/types.ts`: `commonValues.stoneLbs?: 'from' | 'to'` and
  `reverse.stoneLbs?: 'from' | 'to'`, same shape and convention as `feetInches`.
- `components/CommonValuesSection.tsx`: reads `stoneLbs` alongside `feetInches` and passes the
  combined display mode into `columnHeader`/`cellText`.
- `lib/commonValues.spec.ts`: unit tests for `formatStoneLbs` (splits, the 14-lb boundary, negative
  values) plus the existing "walks every calculator's table" test extended to also assert no
  feetInches/stoneLbs cell ever reads "14 lb" (mirroring the "12 in" assertion).

### Progress

- [x] Dedupe check (ids + aliases, programmatic) and the decisions above
- [x] Kit addition: `commonValues.stoneLbs` (`lib/commonValues.ts`, `types.ts`,
  `CommonValuesSection.tsx`, tests)
- [x] Move `'stone to kg converter'` alias off `pounds-to-kilograms-converter`; move
  `'sq ft to sq m converter'` alias off `area-converter`
- [x] `millimeters-to-inches-converter`
- [x] `milliliters-to-cups-converter`
- [x] `kilograms-to-stone-converter`
- [x] `acres-to-hectares-converter`
- [x] `square-feet-to-square-meters-converter`
- [x] Independent scratch verification (`verify_run4.mjs`) of every copy figure before committing
- [x] `npm test`, `npm run build`,
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` pass
- [x] Spot-check the 5 new pages + `/categories/measurements` on a local server, kill the server
- [x] Update `mdFiles/STATUS.md` (row 40–42 + session log — incl. what run 5 needs), `gh pr ready`

## Run 5

Pairs: kW↔hp, psi↔bar, kcal↔kJ, MB↔GB, mpg↔L/100 km. Same pair-converter pattern as runs 1 and 4,
with the overlap rule from run 4: run 3's general pages already use kW↔hp, psi↔bar, kJ↔kcal and
GB↔MB as *their own* default pairs (`power-converter`, `pressure-converter`, `energy-converter`,
`data-storage-converter`), each with a `commonValues` table on that exact pair. mpg↔L/100 km has no
general-page overlap (no general fuel-economy converter exists yet) but is reciprocal (non-linear),
which needs its own check.

**Dedupe check (programmatic, against every `id`/alias/`redirectFrom` in `data/calculators/*.ts`
before building)**: no existing id for any of the 5 candidate ids
(`horsepower-to-kilowatts-converter`, `bar-to-psi-converter`, `kilocalories-to-kilojoules-converter`,
`megabytes-to-gigabytes-converter`, `mpg-to-l-100km-converter`). Alias collisions found: the
*opposite-direction* alias on each of the four run-3 general pages is an exact or near-exact string
match for what the new pair page would naturally want as its own primary alias —
`power-converter` has `'hp to kw calculator'` (its own pair is kW→hp), `pressure-converter` has
`'bar to psi calculator'` (its own pair is psi→bar), `energy-converter` has `'kcal to kj calculator'`
(its own pair is kJ→kcal), `data-storage-converter` has `'mb to gb calculator'` (its own pair is
GB→MB). Same precedent as run 4's `'sq ft to sq m converter'` move: each of these four aliases
moves off the general page onto the new, more specific pair page; each general page drops from 5 to
4 aliases, staying at the ≥4 floor, so no replacement alias is needed. No other phrasings (hp/kw,
psi/bar, kcal/kj, mb/gb, mpg, l/100km, fuel economy) collide anywhere else in the dataset.

**Design per pair** — opposite primary direction from the sibling general page (per "what run 5
needs to know" in `STATUS.md`), a pair-specific id/title, and a `commonValues` table aimed at that
pair's real search intent, not a copy of the general page's table:

- `horsepower-to-kilowatts-converter` — primary hp→kW (opposite of `power-converter`'s kW→hp).
  Intent: car/motor power ratings, not the generic watt-scale `power-converter` already covers.
  Table: hp→kW uses common engine/motor horsepower figures; reverse kW→hp uses standard electric
  motor kW ratings. Watch-out: ties the "electrical horsepower" (746 W rounded, used on some motor
  nameplates) more directly to the motor-rating angle than `power-converter`'s one-line mention.
- `bar-to-psi-converter` — primary bar→psi (opposite of `pressure-converter`'s psi→bar). Intent:
  tire, pressure-washer and espresso-machine pressures, not the generic Pa-to-Torr scale
  `pressure-converter` already covers. Table: bar→psi spans tire/bike/espresso bar figures; reverse
  psi→bar spans tire and pressure-washer psi figures.
- `kilocalories-to-kilojoules-converter` — primary kcal→kJ (opposite of `energy-converter`'s
  kJ→kcal). Intent: reading a food nutrition label (which of kcal/kJ a given country's label uses),
  not the generic joule-to-BTU scale `energy-converter` already covers. Table: food-label-sized
  kcal and kJ figures. No claim about any country's *reference daily intake* figure (regulatory
  rounding there varies by country and is a known trap) — only the literal arithmetic conversion of
  a label's own printed energy figure.
- `megabytes-to-gigabytes-converter` — primary MB→GB (opposite of `data-storage-converter`'s
  GB→MB). Intent: file and phone/data-plan sizes, not the generic bit/byte/binary-prefix scope
  `data-storage-converter` already covers in full. Table: file and plan-size MB/GB figures. Repeats
  the decimal-vs-binary point with one concrete worked figure (not the full explanation, which stays
  on `data-storage-converter` — cross-linked via `related`).
- `mpg-to-l-100km-converter` — new dimension, no general-page overlap. Primary mpg (US)→L/100 km,
  since the site's primary market (CLAUDE.md) searches "mpg to l/100km" more than the reverse. US
  and UK mpg are different units (`UNITS.fuelEconomy` already has both `mpg` and `mpgUK` — no unit
  addition needed) and the imperial gallon is bigger, so UK mpg reads higher for the same real
  economy; the menu offers both, a watch-out explains the gap. **Reciprocal-relation correctness**:
  `lib/units.ts`'s `mpg`/`mpgUK`/`km/L` are already modeled as `inverse()` (base = k ÷ value), so
  `toBase`/`fromBase` already do the non-linear math — no new math is written in the calculator
  itself, same as every other pair converter. Confirmed the "higher mpg = lower L/100 km" direction
  and the zero/negative guard with `lib/units.spec.ts`'s existing fuel-economy test block before
  writing any copy. **Zero/negative guard**: typing 0 or a negative value into either field must not
  show `Infinity`. Traced this through the actual engine rather than assuming: `toBase(0, 'fuelEconomy',
  'mpg')` is already `Infinity` (the reciprocal unit's own math), which fails `solveState`'s
  `Number.isFinite` check (`lib/solverState.ts`'s own comment: "0 mpg is Infinity in SI") *before*
  `solve()` ever runs, so the field just shows no answer, not `Infinity` — the kit already generically
  guards this, confirmed by reading `lib/solverState.ts` and `components/SolverCalculator.tsx`
  (`converts()`/`answered`) rather than inventing a new guard. The pair's own `solve` functions use
  the same `>= 0` pattern as every other pair converter for consistency, not a special `> 0`. The
  `mpg` text `input`'s `min: 1` mirrors `gas-cost-calculator`'s existing mpg input in `auto.ts`
  (never 0). Visual: `logScale` on a `derive`d `mpgShown` (works regardless of which field is the
  solved one, same pattern as `power-converter`'s `kwShown`), with everyday, "about"-qualified
  benchmarks (compact hybrid, sedan, pickup truck) in the same uncited-benchmark style as the rest
  of the kit — no banding taxonomy invented.

### Progress

- [x] Dedupe check (ids + aliases, programmatic) and the design decisions above
- [x] Move `'hp to kw calculator'` off `power-converter`, `'bar to psi calculator'` off
  `pressure-converter`, `'kcal to kj calculator'` off `energy-converter`, `'mb to gb calculator'`
  off `data-storage-converter`
- [x] `horsepower-to-kilowatts-converter`
- [x] `bar-to-psi-converter`
- [x] `kilocalories-to-kilojoules-converter`
- [x] `megabytes-to-gigabytes-converter`
- [x] `mpg-to-l-100km-converter`
- [x] Independent scratch verification (`verify_run5.mjs`) of every copy figure, incl. the reciprocal
  mpg↔L/100 km relation and the exact UK/US mpg constants, before committing — caught and fixed two
  slips before committing: the `bar-to-psi-converter` mental-math FAQ had the wrong direction/percent
  for the "psi × 0.069 → bar" shortcut (it is about 0.08% *high*, not low), and the
  `kilocalories-to-kilojoules-converter` logScale benchmark rounded 80 kcal to "335 kJ" instead of the
  correct 334.7 kJ.
- [x] `npm test` (628/628, snapshot diff touches only the 5 new ids), `npm run build` (162 static
  pages, up from 157), `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`
  (clean) — all pass
- [x] Spot-check the 5 new pages + `/categories/measurements` on a local server (incl. typing 0 into
  the mpg/L-100km fields to confirm no `Infinity` is shown), kill the server
- [ ] Update `mdFiles/STATUS.md` (row 40–42 + session log — incl. a concrete scope proposal for
  run 6, the lookup-table converters), `gh pr ready`

## Run 6

Lookup-table converters, first of the runs 6+ group: cooking cups↔grams by ingredient. A materially
different shape from runs 1–5 — none of this is a single exact factor through `lib/units.ts`; it's
an empirical density (grams per US cup) that varies by ingredient and is only as precise as its
source. Five pages: one general page with an ingredient picker, plus four dedicated ingredient
pages for the highest search-intent ingredients.

**Dedupe check (programmatic, against every `id`/alias/`redirectFrom` in `data/calculators/*.ts`
before building)**: no existing id or alias collision for `cups-to-grams-converter`,
`cups-to-grams-flour`, `cups-to-grams-sugar`, `cups-to-grams-butter`, `cups-to-grams-rice` (checked
every id containing "cup"/"gram"/"flour"/"sugar"/"butter"/"rice" and every `aliases:` line
containing the same — only unrelated hits: `grams-to-ounces-converter`'s own id/aliases, a flour
example in its worked-example prose, and `milliliters-to-cups-converter`'s "recipe cup converter"
alias, none of which collide).

**Ingredient pick (5th dedicated page)**: rice, not milk. Rice is the ingredient most often needing
an exact cups→grams figure *outside* baking too — rice cookers and rice-to-water ratios are commonly
given by weight (185 g/cup) for accuracy, and "1 cup rice in grams" has real, distinct search intent
from the baking ingredients. Milk is almost always measured by volume in recipes (a cup/mL figure
already suffices), so a dedicated milk page would have little to add beyond the general page's row
for it.

**Sources actually fetched** (never hand-copied from memory): King Arthur Baking Company's
Ingredient Weight Chart (`https://www.kingarthurbaking.com/learn/ingredient-weight-chart`) for the
baking-specific ingredients, and USDA FoodData Central (SR Legacy) for rice, milk and honey, which
King Arthur's chart does not list. Exact rows fetched and used — see "Shared density table" below.

**Shared density table — one place, every row cited, g/cup never retyped elsewhere**: a new
`lib/ingredients.ts`, `INGREDIENT_DENSITIES: Ingredient[]`, each row `{ id, label, gramsPerCup,
source }`. The `cups-to-grams-converter` page's ingredient `options` and every dedicated page's
density constant are built by looking up this table by `id` (`gramsPerCup('flour')`, etc.), never a
re-typed literal. The ounces-per-cup figure (wherever shown) is computed from `gramsPerCup` via
`lib/units.ts`'s `mass` dimension (`fromBase(toBase(g, 'mass', 'g'), 'mass', 'oz')`), not a second
hand-typed number.

**Table rendering decision**: `content.commonValues` doesn't fit — it's built around a
`UnitDimension` + two unit ids from `lib/units.ts`, and a gram-per-cup density isn't a NIST unit
factor, it's an ingredient property. Added a **minimal, generic, parallel field**,
`content.referenceTable` (`data/calculators/types.ts`), rendered by a new
`components/ReferenceTableSection.tsx` (same card/caption/table styling as `CommonValuesSection`,
its own section id so it doesn't touch `commonValues`'s type, renderer or existing 25-page test at
all): `{ title, columns: string[], rows: { label: string; values: number[] }[], decimals?, note? }`.
`values` are always the result of a computed expression in the data file (a cups×density
multiplication or a `lib/units.ts` conversion), never a literal typed from a calculation done by
hand. Wired into `app/[locale]/calculators/[slug]/page.tsx`'s `tocItems` and render list exactly
where `commonValues` is, as a sibling condition — `commonValues`'s own code path is untouched.
Covers two shapes with the same component: a per-ingredient comparison table (general page: one row
per ingredient, g/cup and oz/cup) and a per-amount table (dedicated pages: one row per cup amount,
grams and ounces for that one ingredient).

**Pages**:
- `cups-to-grams-converter` — type B. Inputs: `amount` (dimension `volume`, default unit `cup`, so
  the existing volume unit menu — tbsp, tsp, mL, etc. — works unchanged) and `ingredient` (`options`
  built from `INGREDIENT_DENSITIES`, value = that row's `gramsPerCup`, so the chosen numeric value
  *is* the density — no separate lookup needed in `compute()`). `compute()`: `grams = amount ×
  ingredient` (amount is already converted to cups by the widget, since the input's `unit` is
  `'cup'`); headline `grams`, `alsoIn: ['oz']` (computed by the existing `alsoInText` dimension
  conversion, not a second compute key). `referenceTable`: one row per ingredient (12 rows, g/cup
  and oz/cup), the actual density reference chart.
- `cups-to-grams-flour` — all-purpose flour (120 g/cup, King Arthur, spooned-and-leveled). Intent:
  the single most-searched version of this query. `referenceTable`: cup amounts (¼–2 cups) → grams
  → oz for *this* ingredient only. Watch-out: spooned-and-leveled (120 g) vs. scooped-straight-from-
  the-bag (can run 130–150 g, overpacked by up to ~25%) — both figures stated honestly, King
  Arthur's spooned method named as this page's basis, not presented as the only "right" number.
- `cups-to-grams-sugar` — granulated sugar (198 g/cup, King Arthur). Intent: baking's second-most
  common conversion. Also carries brown sugar (213 g/cup, packed) and powdered sugar (113 g/cup,
  unsifted) as extra rows/watch-out, since "sugar" searches split across all three and King Arthur
  cites all three directly.
- `cups-to-grams-butter` — butter (227 g/cup; King Arthur's own listed figure is 113 g per 8 tbsp /
  ½ cup, doubled). Intent/table distinctive from flour/sugar: US butter is sold in sticks (1 stick =
  ½ cup = 8 tbsp = 113 g), so the table's rows are sticks and tablespoons, not just cup fractions —
  "2 sticks = 1 cup = 227 g", "1 tbsp ≈ 14.2 g". Watch-out: 4 sticks (1 lb butter) is about 453.6 g,
  close to but not quite the exact 453.59237 g pound (`lib/units.ts`'s `POUND` constant) — a
  coincidence of US butter packaging, not a unit identity.
- `cups-to-grams-rice` — uncooked long-grain white rice (185 g/cup, USDA FDC #169756). Intent: rice-
  cooker and recipe water-ratio use, a distinct audience from the baking pages above. Watch-out:
  this is *uncooked* rice; cooked rice weighs roughly 3× as much per cup because it absorbs water,
  so a recipe's "1 cup rice" almost always means uncooked unless stated otherwise.

**US vs. metric cup**: every page states the US customary cup (236.5882365 mL, `lib/units.ts`) is
the basis, and that a metric cup (250 mL, about 5.7% bigger) would scale every gram figure up by
exactly 250/236.5882365 ≈ 1.0568 — stated as a ratio, not a second density table (the point is
`lib/units.ts`'s existing cup unit, not a new cup size to model).

### Progress

- [x] Dedupe check (ids + aliases, programmatic) and the ingredient/source decisions above
- [x] Fetch King Arthur's Ingredient Weight Chart and USDA FoodData Central (rice, milk, honey)
- [x] `lib/ingredients.ts` (shared, cited density table) + unit test — bread flour deliberately not
  its own row (King Arthur gives it the identical 120 g/cup as all-purpose flour; a separate row
  would duplicate a density, which the general page's ingredient `<select>` can't allow since it
  keys options by `gramsPerCup`), noted as a sentence on `cups-to-grams-flour` instead
- [x] Kit addition: `content.referenceTable` (`types.ts`, `ReferenceTableSection.tsx`, `page.tsx`
  wiring, `lib/categoryTheme.ts`'s `SECTION_THEME`), parallel to `commonValues`, not touching it
- [x] `cups-to-grams-converter`
- [x] `cups-to-grams-flour`
- [x] `cups-to-grams-sugar`
- [x] `cups-to-grams-butter`
- [x] `cups-to-grams-rice`
- [x] Independent scratch verification (`verify_run6.mjs`, 61 checks) of every copy figure before
  committing — all passed on the first run of the formal checks (the earlier informal printout had
  already caught the arithmetic while drafting, e.g. correctly computing "4 sticks of butter" as
  2 cups × 226 g = 452 g, not a wrong 226 × 4 = 904 g typo made once while exploring the numbers by
  hand). A second scratch script (`check_run6.mjs`) confirmed 0 duplicate ids, 0 new duplicate
  aliases, every `related` id exists with no self-reference, and every `seo.title`/`seo.description`
  within budget — it caught `cups-to-grams-flour`'s `seo.description` at 169 chars (over the 160
  limit), fixed before committing.
- [x] `npm test` (639/639, snapshot diff touches only the 5 new ids), `npm run build` (167 static
  pages, up from 162), `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern
  ".claude/**"` (clean) — all pass
- [x] Spot-check the 5 new pages + `/categories/measurements` on a local server (H1s, `common-values`
  vs `reference-table` section ids, the ingredient `<select>`'s 12 distinct-value options with flour
  as the default, JSON-LD present), kill the server (port 3000 confirmed free)
- [x] Update `mdFiles/STATUS.md` (row 40–42 + session log, incl. the Wave 2 "cups to grams" dedupe
  note and a concrete scoped proposal for run 7 — shoe/ring/clothing sizes, not built), `gh pr ready`

## Run 7

Shoe size converter(s) — the first offset-based (not density-based) lookup-table run. Formulas and
constants fetched and verified before writing any copy (never from memory):

**Sources actually fetched**:
- Wikipedia, "Shoe size" (`en.wikipedia.org/wiki/Shoe_size`) — fetched as **raw wikitext**
  (`...&action=raw`) and read directly, not via an AI-summarized fetch (a first summarized fetch of
  the rendered page gave *internally inconsistent* constants across two attempts — e.g. "male shoe
  size ≈ 3×foot−24" in one pass and "≈3×foot−22" in another — so raw wikitext was fetched and read
  line-by-line instead, which is what every constant below is taken from). Specifically: the UK
  barleycorn formulas (child and adult), the US formulas (men's, women's "standard/FIA" and
  "common" scales, children's), the Paris-point/EU formula, Mondopoint's definition, and the
  "ISO 19407 and shoe size conversion" section's unified foot-length-in-mm formulas for UK and EUR.
- Nike's published men's/women's/UK/EU size chart (`nike.com/size-fit/mens-footwear`), fetched as a
  real manufacturer cross-check, never as the formula source.
- Clarks, REI, New Balance and ASICS size-guide pages were also attempted and returned 403/404 —
  swapped to Nike rather than retried, per the no-retry-loops rule.

**Where sources disagree (stated on the page, not silently picked)**:
- **Men's/women's US offset**: Wikipedia documents two scales — "standard"/FIA: women's = men's + 1;
  "common": women's = men's + 1.5. Nike's real chart matches the "common" (+1.5) scale exactly at
  every row checked (e.g. men's 8 ↔ women's 9.5, men's 10 ↔ women's 11.5), so **+1.5 is the
  calculator's primary figure**, with the FIA +1 scale named in a watch-out.
- **UK/US offset**: the "standard" formula gives US men's = UK + 1 exactly (derived: UK adult =
  3×last(in)−25, US men = 3×last(in)−24). Nike's own chart instead shows a 0.5-size gap (US men's 8
  = UK 7.5, not UK 7) at every row checked — **the standard formula's +1 is used as the computed
  figure**, with Nike's own smaller real-world gap named as a concrete, cited brand-variation
  example (not vague "brands vary" hand-waving).
- **EU/last-length allowance**: the UK/US system's foot→last allowance (2 barleycorns ≈ 16.9 mm) and
  the EU/Paris-point system's own allowance (2 Paris points ≈ 13.3 mm) are different, documented
  constants — using the ISO 19407 formulas directly (each system's own allowance already baked in,
  never mixed) avoids silently picking one over the other.
- **Children's EU figure**: no separately published Paris-point formula for children's lasts was
  found (only the general "last length in Paris points, for adults and children alike" principle,
  applied here to ISO 19407's own children's last-length allowance: foot×1.08+6 mm). Marked on the
  kids page as the least-certain of the three converted sizes.

**Shared, cited module**: `lib/shoeSizes.ts`, mirroring `lib/ingredients.ts`'s shape — every
constant commented with its source, pure functions from foot length in mm (the Mondopoint value) to
UK/US/EU sizes, `lib/shoeSizes.spec.ts` testing them against the Nike chart rows above and the
UK-child/US-adult boundary points quoted from Wikipedia (last length 4 in → UK child 0; 8½ in → UK
child 13½; 8⅔ in → UK adult 1). A floating-point hazard was found and designed around while
building the verification script (see "Accuracy notes" below) — the lib's own functions always
compute every size straight from one `footMm` value, never by inverting one system's formula and
re-deriving through another's.

**Rounding**: UK/US sizes round to the nearest half (`Math.round(x*2)/2`); EU rounds to the nearest
whole Paris point (most brands sell EU in whole sizes; a watch-out says some brands offer EU half
sizes); Mondopoint rounds to the nearest 5 mm (ISO's casual-footwear interval). A foot length outside
a system's valid range (e.g. an adult-sized foot on the kids' category, or vice versa) returns `NaN`
for that system's sizes rather than an invalid or negative size number.

**Pages (4, not 5 — recorded below why the 5th candidate was skipped)**:
- `shoe-size-converter` — type B. Inputs: `footLength` (dimension `length`, default unit `mm`, the
  literal Mondopoint value) and `category` (`options`: Men's/Women's/Kids', values `0`/`1`/`2` —
  fixed, inherently-distinct category codes, not a lookup value that could collide, per the run 6
  parked lesson in `STATUS.md`). Outputs: the category-appropriate US size (headline), UK size, EU
  size, Mondopoint (nearest 5 mm), and the foot length itself with `alsoIn: ['cm', 'in']`.
  `referenceTable`: one row per listed ingredient... no — one row per common shoe size *per system*,
  a men's/women's/kids' comparison. `rangeBar` visual on the raw foot length (mm) showing kids' vs
  adult ranges, bands derived from the same formulas' own boundary points (not invented).
- `mens-shoe-size-chart` — fixed to men's, no selector. Table: US men's 7–13 → UK, EU, foot length.
  Intent: people who already know they want a men's chart, not a general converter.
- `womens-shoe-size-chart` — fixed to women's. Table: US women's 5–11 → US men's equivalent, UK, EU,
  foot length. Intent: same as above, women's-specific, high standalone search volume ("women's
  shoe size chart").
- `kids-shoe-size-chart` — fixed to kids'. Table: US kids' 8–13½ → UK, EU (flagged approximate), foot
  length, built from a single shared last-length value per row (not the live widget's
  footMm-based path) to avoid the floating-point hazard above. Watch-out: the kids' 13 (or 13½) to
  youth/adult 1 reset, quoted from Wikipedia.
- **Skipped**: a dedicated US↔UK pair page and a dedicated "foot length (cm) to shoe size" page.
  Every page above already shows US, UK, EU and foot length side by side for its own audience — a
  separate US↔UK-only page or a foot-length-first page would be a near-duplicate of the general
  page's own mechanics with no distinct audience split (unlike run 6's ingredients, which are
  genuinely different numbers per page). Recorded here instead of built, per the run's own
  "fewer is fine" allowance.

### Progress

- [x] Fetch and read Wikipedia's raw wikitext for the UK/US/EU/Mondopoint formulas (not a
  summarized fetch — see "Sources actually fetched")
- [x] Fetch Nike's published size chart as a manufacturer cross-check
- [x] Independent scratch script (`shoe_formulas.mjs`) reproducing every formula, cross-checking
  against Nike's chart, confirming the UK-child-0 / UK-child-13½ / UK-adult-1 boundary points, and
  surfacing + designing around the floating-point round-trip hazard in the children's formulas
- [ ] `lib/shoeSizes.ts` (shared, cited formula module)
- [ ] `lib/shoeSizes.spec.ts` (unit tests against the Nike chart rows + Wikipedia's boundary points)
- [ ] Dedupe check (ids + aliases, programmatic) before writing the calculator objects
- [ ] `shoe-size-converter`
- [ ] `mens-shoe-size-chart`
- [ ] `womens-shoe-size-chart`
- [ ] `kids-shoe-size-chart`
- [ ] Second independent scratch verification of every copy figure (example/FAQ/worked-example/
  reference-table numbers) against the lib's actual output before committing
- [ ] `npm test`, `npm run build`,
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` pass
- [ ] Spot-check the 4 new pages + `/categories/measurements` on a local server, kill the server
  (port 3000 confirmed free)
- [ ] Update `mdFiles/STATUS.md` (row 40–42 + session log, incl. a "Run 8 proposal" for ring sizes),
  `gh pr ready`

## Run 8 proposal (not built this run)

Ring size converter: US/UK/EU size, inner diameter (mm) and circumference (mm), per ISO 8653. Like
run 7, this is an offset/diameter-based system, not a density lookup — `lib/ringSizes.ts` would hold
the diameter-to-size tables per region (US sizes step by a fixed diameter increment; UK/Australian
sizes use a letter-and-quarter system; EU uses circumference directly in mm), each constant sourced
and cross-checked against a named jeweler's/standards chart before any number goes into copy, the
same way run 7 cross-checked against Nike's. Needs its own dedupe check and its own "Run 8" progress
section before building. Clothing size remains a separate, later run.

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
