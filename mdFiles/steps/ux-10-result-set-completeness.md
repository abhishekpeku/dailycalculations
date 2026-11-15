# UX-10 — result-set completeness audit (prerequisite for UX-09 download)

Off the numbered step sequence (like UX-01..09). Branch per batch: `ux/result-sets-<category>`.

User asked (2026-11-15) to make sure every calculator's result set is "complete" before building
the download/export feature (UX-09) on top of it — a thin on-screen result makes a thin, not-worth-
downloading PDF/CSV. Scoped as a full site-wide, count-based audit: **every calculator with ≤1
output beyond its headline gets reviewed.**

## Why this blocks UX-09

UX-09 (`mdFiles/steps/ux-09-download-export.md`) exports whatever `solver.outputs` /
`breakdown.outputs` + the headline already contain. If those are thin, the download is thin too.
This step runs first; UX-09 is built on top of whatever result sets look like once this closes out.

## Scope — 102 calculators across 11 categories, ≤1 output each (measured 2026-11-15)

| Category | Thin count | Notes |
|---|---|---|
| measurements | 34 | All unit-pair converters. See "Converters" note below — most will come back "no change needed," not a failure of this audit. |
| chemistry | 28 | Likely the highest-yield category — several (ideal-gas-law, titration, Beer-Lambert, dilution) have real missing derived facts. |
| physics | 19 | Mixed — some single-formula calculators are already complete, some (decibel, heat, lens/mirror) likely have a real gap. |
| math | 10 | Mostly single-answer by design (exponent, roots, pythagorean) — expect mostly "no change needed." |
| food | 2 | recipe-scaling-calculator, brine-calculator |
| sports | 2 | race-time-predictor-calculator, steps-to-miles-calculator |
| text | 2 | character-counter, hashtag-counter |
| travel | 2 | currency-converter, timezone-meeting-planner |
| shopping | 1 | sales-tax-calculator |
| statistics | 1 | z-score-calculator |
| time | 1 | pomodoro-timer |

Full id list with current output counts: see the session's calculator.net-gap-analysis-adjacent
audit — regenerate it yourself before starting each batch with:
```
node -e "import('./data/calculators/index.ts').then(m => { const list = m.calculators.map(c => ({ id: c.id, category: c.category, outputCount: (c.solver?.outputs?.length ?? c.breakdown?.outputs?.length ?? 0) })); console.log(JSON.stringify(list.filter(c => c.outputCount <= 1), null, 2)); });"
```
(counts will have shifted by whatever earlier batches already fixed — always regenerate, don't
work from a stale list.)

## The actual judgment call, per calculator

**This is not "add fields until the count is ≥2."** For each calculator in scope:

1. Read the calculator's existing `content.concept`/`formula` and the real-world formula it
   implements. Ask: is there a second, genuinely useful, **accurately derivable** quantity a person
   using this calculator would want alongside the headline? Examples of real gaps found while
   scoping this: `titration-calculator` could show the pH at the equivalence point, not just the
   titrant volume; `ideal-gas-law-calculator` solving for one variable could also show the other
   three in a cross-check table; `dilution-calculator` could show the dilution factor (C1/C2) as
   its own labeled output, not just buried in the formula.
2. If yes: add it as a real `solver.outputs` / `breakdown.outputs` entry, computed correctly (not
   re-derived differently from the main formula — reuse the same underlying math), cited the same
   way the rest of that page already is, and independently verified in a scratchpad script before
   committing — same discipline as every content wave on this site.
3. If no — the single value genuinely is the complete, correct answer and nothing else can be
   derived without fabricating something — **say so explicitly** in the batch's progress notes
   (`id — no change needed: <one-line reason>`), don't silently skip it and don't invent a filler
   output just to hit a count. A fabricated "extra output" is worse than a short one; the audit's
   job is to find real gaps, not pad every row.

### Converters (measurements, 34) — read this before starting that batch

A 1:1 unit-pair converter's single converted value already is the complete answer — there is
nothing else to derive. These calculators also already show an automatic "Also in" row on screen
(`SolverCalculator.tsx`'s built-in behavior, independent of `solver.outputs` — it converts the
result into 3-4 other units of the same dimension automatically). **Expect most of this batch to
come back "no change needed."** The one thing worth checking per converter: does its `commonValues`
table (where one exists) already give the page real substance beyond the bare number? If yes, that
page is fine as-is — the "thin output count" undercounts what's actually on the page, and the
audit should say so rather than force an artificial `solver.outputs` entry. Do not add synthetic
outputs to converters just to raise the count.

### General converters specifically (`length-converter`, `weight-converter`, etc.)

Same "no change needed" expectation — these are the general-purpose siblings of the specific pair
converters above, same reasoning applies.

## Batches (by category, largest/highest-yield first)

1. **Chemistry (28)** — highest expected yield, do first.
2. **Physics (19)**
3. **Measurements (34)** — expected mostly "no change needed," but still a full pass, not a skip.
4. **Math (10)**
5. **Remainder (11)**: food (2), sports (2), text (2), travel (2), shopping (1), statistics (1),
   time (1) — one combined batch.

Each batch is its own branch/PR, same small-commits discipline as every other wave (commit per
calculator or per logical group, progress checklist, draft PR early). Chemistry/physics at 19-28
items each may need splitting into 2 sub-batches of ~10-15 — use judgment, don't force a rigid 5.

## Acceptance checks (every batch)

- `npm test` / `npm run lint` / `npm run build` all pass.
- Every new output's number independently re-verified in a scratchpad script before committing.
- The batch's progress notes list **every** calculator reviewed, not just the ones changed — a
  reviewer (the main session, before merging) needs to see the "no change needed" calls too, with
  their one-line reason, to confirm this wasn't a rubber-stamp pass.
- No calculator's existing, already-correct output is altered or removed — this audit only adds,
  it does not touch anything that already works.

## Progress

- [x] Step file written
- [x] Batch 1: chemistry (28, done in 2 sub-batches — 8 real additions, 20 "no change needed")
  - [x] Sub-batch 1a (14, branch `ux/result-sets-chemistry-1`): molarity-calculator (no change),
    dilution-calculator (added soluteAmount), mass-percent-calculator (added solventMass),
    moles-to-grams-calculator (no change), ideal-gas-law-calculator (no change),
    combined-gas-law-calculator (added amountOfGas), pka-henderson-hasselbalch-calculator
    (added percentBase), percent-yield-calculator (no change), theoretical-yield-calculator
    (added productMoles), stoichiometry-calculator (no change), solution-concentration-calculator
    (no change), reaction-half-life-calculator (no change), rate-constant-calculator (no change),
    arrhenius-equation-calculator (added impliedHalfLife). 6 real additions, 8 "no change needed."
  - [x] Sub-batch 1b (14, branch `ux/result-sets-chemistry-1b`): molality-calculator (no
    change — same n/mass two-variable relationship as molarity, already ruled no-change in 1a),
    osmolarity-calculator (no change — same 3-variable Osm=M×i pattern as molarity),
    normality-calculator (no change — same 3-variable N=M×n pattern), titration-calculator
    (added molesTitrant, C₁×V₁, paired with the existing molesAnalyte so both sides of the
    equivalence-point mole balance are visible), gibbs-free-energy-calculator (no change —
    already has a real bonus output, crossoverTemperature; adding ΔG=-RTlnK would conflate
    standard-state ΔG° with this page's general process ΔG), beer-lambert-law-calculator (no
    change — already has transmittancePercent; percent-absorbed would just be its arithmetic
    complement, filler not a new fact), freezing-point-depression-calculator (no change —
    the solution's actual freezing point needs the pure solvent's own freezing point, which
    isn't one of this solver's four inputs; adding it needs a new input field, out of scope
    for an output-only audit), boiling-point-elevation-calculator (no change — same reasoning,
    structurally identical to freezing-point-depression), vant-hoff-osmotic-pressure-calculator
    (no change — already has a real bonus output, equivalent osmolarity),
    vapor-pressure-calculator (no change — the five-variable Clausius-Clapeyron solve already
    covers every quantity in the equation; ΔSvap would need the pressures to be at a reference
    like 1 atm, which isn't guaranteed by the inputs), molarity-molality-conversion-calculator
    (no change — already has a real bonus output, mass percent of solute),
    calorimetry-enthalpy-calculator (no change — already has a real bonus output, heat
    released), common-ion-effect-calculator (added plainWaterSolubility, √Ksp, as a direct
    comparison figure against the common-ion-suppressed solubility — a number already stated
    in the page's own worked-example prose), specific-heat-by-mixing-calculator (no change —
    already has a real bonus output, heat transferred). 2 real additions, 12 "no change
    needed."
- [x] Batch 2: physics (19, done in 2 sub-batches, both on branch `ux/result-sets-physics-1` —
  6 real additions, 13 "no change needed")
  - [ ] Sub-batch 2a (10, branch `ux/result-sets-physics-1`): force-calculator (no change —
    F=ma is a fully cross-solvable 3-variable relation; acceleration can already be displayed
    in g via the existing 'g0' unit, so nothing new to derive), speed-distance-time-calculator
    (no change — v=d/t, same fully-solved 3-variable pattern, nothing derivable without a new
    input), weight-calculator (no change — W=mg, same pattern; lb/lbf are already automatic
    unit conversions, not a new fact), kinetic-energy-calculator (added momentum, p=mv, from
    the same mass and velocity already in the solve), potential-energy-calculator (added
    impactVelocity, v=√(2gh), the free-fall speed equivalent to that height — flagged with a
    new watchOut item noting it ignores air resistance), work-calculator (added effectiveForce,
    F cos θ, the force component actually acting along the motion — distinct from the plain
    force value), momentum-calculator (added kineticEnergy, KE=½mv², mirroring the
    kinetic-energy-calculator addition so both pages cross-reference the same motion two ways),
    impulse-calculator (no change — J=FΔt only has force/time/impulse; the velocity change a
    given impulse produces needs a mass input this solver doesn't have, out of scope for an
    output-only audit), power-calculator (no change — P=W/t fully solved, nothing else
    derivable without a new input like distance or force), density-calculator (no change —
    specific gravity, i.e. density÷1000 kg/m³, would be numerically identical to the g/cm³
    conversion the page already auto-displays in its "Also in" row, so it would duplicate an
    existing number rather than add new information). 4 real additions, 6 "no change needed."
  - [x] Sub-batch 2b (9, branch `ux/result-sets-physics-1`, same branch as 2a): pressure-calculator
    (no change — P=F/A fully cross-solvable 3-variable relation; a fluid-column-height
    equivalent would need a new density input, out of scope), ohms-law-calculator (no change
    — already has a real bonus output, power dissipated; an energy-over-time figure would need
    a time input this solver doesn't have), electrical-power-calculator (no change — already
    has a real bonus output, equivalent resistance; same time-input gap for an energy figure),
    capacitor-charge-calculator (no change — already has a real bonus output, stored energy;
    a time-constant figure would need a resistance input), wavelength-frequency-calculator
    (added period, T=1/f — always valid regardless of wave type, unlike photon energy E=hf
    which was considered and rejected since this page's speed field is deliberately general
    for sound/light/radio/water waves, not just electromagnetic ones), decibel-calculator
    (added powerRatio, P₂÷P₁ — a genuinely different, linear-scale figure alongside the
    logarithmic dB value, not a duplicate of either input), radioactive-half-life-calculator
    (no change — already has a real bonus output, decay constant; a "half-lives elapsed"
    figure was considered and rejected as just the ratio of two already-visible inputs,
    elapsedTime ÷ halfLife, with no new derived insight), heat-calculator (no change — Q=mcΔT
    fully cross-solvable across 4 variables; a final-temperature figure would need an absolute
    starting temperature input this solver only has as a delta), lens-mirror-equation-calculator
    (no change — already has a real bonus output, magnification; nothing else derivable from
    the two distances without an object-height input). 2 real additions, 7 "no change needed."
  - **Batch 2 (physics) totals: 6 real additions, 13 "no change needed," across both sub-batches.**
- [x] Batch 3: measurements (34, done in one batch, branch `ux/result-sets-measurements` — 4 real
  additions, 30 "no change needed", confirming the step file's own prediction that this batch would
  come back mostly "no change needed"):
  - **Real additions (4):**
    - `data-storage-converter` — added `binaryEquivalent` (GiB): the page's own concept/workedExample/
      watchOut already compute "1 TB ≈ 931.32 GiB" as a static example of the decimal-vs-binary
      difference, the whole point of the page; this exposes the same fact live for whatever the user
      types, reusing the dimension's own SI base (bits) and the already-cited NIST binary-prefixes
      reference. Verified: 1 GB → 0.9313 GiB, 1 TB → 931.3226 GiB (matches the page's own figure).
    - `megabytes-to-gigabytes-converter` — added `binaryEquivalent` (MiB), the dedicated pair's own
      version of the same fact ("500 MB ≈ 476.84 MiB" already in its workedExample). Verified:
      500 MB → 476.8372 MiB (matches).
    - `kilograms-to-stone-converter` — added `wholeStone` (count) + `remainderPounds` (mass, lb):
      the page's own description promises "results show stone and pounds together, like '11 st 4
      lb'" and the worked example already splits the total pounds that way for its default value,
      but the live solver result only showed the bare decimal stone number. A solver output renders
      one number, not a composite string, so this is two linked outputs rather than one, using the
      exact same round-total-pounds-then-split algorithm as `lib/commonValues.ts`'s `formatStoneLbs`
      (already used in this page's own commonValues table) so the two can never disagree. Verified:
      70 kg → 11 st 0 lb, 158 lb (11 st 4 lb) → 71.6676 kg → splits back to 11 st 4 lb; checked the
      0–13 lb remainder bound with a rounding-edge case (97.99 kg → 15 st 6 lb).
    - `cups-to-grams-rice` — added `cookedWeight` output: the page's own watchOut/FAQ/workedExample
      already state the USDA cooked-rice figure (158 g/cup, USDA #168878) as a comparison for the
      same cup amount, and `lib/ingredients.ts` already carries this exact density as `riceCooked`
      (used elsewhere only in the general `cups-to-grams-converter`'s picker) — reusing it live
      needed no new citation. Verified: 0.75 cup → 138.75 g uncooked / 118.5 g cooked-equivalent,
      matching the page's own worked-example "compare" row exactly.
  - **No change needed (30)** — all of the following already expose every alternate figure the
    page's own prose discusses through the existing unit-menu (pick a different unit on the same
    field) or an existing `commonValues`/`referenceTable`, so a second `solver.outputs`/
    `breakdown.outputs` entry would duplicate, not add, information:
    - 17 pair converters (of the batch's 19; the other 2, `megabytes-to-gigabytes-converter` and
      `kilograms-to-stone-converter`, got real additions above): `miles-to-kilometers-converter`,
      `fahrenheit-to-celsius-converter`, `pounds-to-kilograms-converter` (stone already selectable;
      the "11 st 4 lb" split is the dedicated `kilograms-to-stone-converter`'s job, not this page's),
      `gallons-to-liters-converter` (US/UK gallon both in the menu), `centimeters-to-inches-
      converter`, `feet-to-meters-converter`, `ounces-to-milliliters-converter` (US/UK fl oz both in
      the menu), `grams-to-ounces-converter` (troy ounce is a different, uncited precious-metals
      unit, not this page's everyday ounce), `mph-to-kph-converter`, `millimeters-to-inches-
      converter` (fractional-inch table already present), `milliliters-to-cups-converter` (metric
      cup already selectable), `acres-to-hectares-converter`, `square-feet-to-square-meters-
      converter`, `horsepower-to-kilowatts-converter` (PS already selectable; the hp/PS breakdown is
      the general `power-converter`'s job), `bar-to-psi-converter` (gauge-vs-absolute is explained
      in prose but the page explicitly treats every typed number as absolute by design — computing
      a "gauge equivalent" would require assuming the input is gauge, contradicting that stated
      design, not a safe derivation), `kilocalories-to-kilojoules-converter`, `mpg-to-l-100km-
      converter` (UK mpg and km/L both already selectable).
    - 9 general converters (of the batch's 10; the 10th, `data-storage-converter`, got the
      `binaryEquivalent` real addition above): `length-converter`, `weight-converter`,
      `volume-converter`, `area-converter`, `speed-converter`, `time-converter`,
      `pressure-converter` (same gauge-vs-absolute reasoning as bar-to-psi), `energy-converter`,
      `power-converter`.
    - 4 ingredient-picker converters (of the batch's 5; the 5th, `cups-to-grams-rice`, got the
      `cookedWeight` real addition above — its `grams` output is untouched): `cups-to-grams-
      converter`, `cups-to-grams-flour` (the "scooped vs spooned" figure in its own worked example
      is an illustrative range, "about 140 g/cup," not a precise citable density like `riceCooked`
      — adding it as a solver output would overstate a precision the source doesn't claim),
      `cups-to-grams-sugar` (already lets you pick any of 3 sugar types and compares all 3 side by
      side in its own referenceTable), `cups-to-grams-butter` (no second citable density to compare
      against).
- [x] Batch 4: math (10, done in one batch, branch `ux/result-sets-math` — 2 real additions, 8
  "no change needed", confirming the step file's own prediction that this category would come
  back mostly "no change needed"):
  - **Real additions (2):**
    - `square-root-calculator` — added `negativeRoot` (= −squareRoot): the page's own concept
      and watchOut copy already states "every positive number has two square roots, +r and −r"
      as the central caveat of the page, but the live solver result only ever showed the
      principal (nonnegative) one. Reuses the same solved `squareRoot` variable (just negated),
      so it can never disagree with the headline. Verified: √144 → 12 / −12, √50 → 7.0711 /
      −7.0711 (and (−7.0711)² ≈ 50), √(−9) → NaN / NaN.
    - `pythagorean-theorem-calculator` — added `perimeter` (= legA + legB + hypotenuse),
      alongside the page's existing `area` bonus output, mirroring the sibling
      `triangle-calculator`'s own area+perimeter pairing. Reuses the already-solved three sides,
      no new input needed. Verified: 3-4-5 → area 6, perimeter 12; 5-6-7.810249676 → area 15,
      perimeter 18.81024968; 0-0-0 → area 0, perimeter 0 (matches the updated
      `calculators.spec.ts.snapshot` exactly, via `npm run test:update`).
  - **No change needed (8):**
    - `percentage-calculator` — no change: the four modes (X% of Y, X is what % of Y, percent
      change X→Y, increase/decrease Y by X%) produce fundamentally different kinds of answers
      (an amount in modes 1/4, a percentage in modes 2/3); no single second `breakdown.outputs`
      entry applies meaningfully across all four without going blank ("—") for half of them or
      just duplicating the existing compareBars chart that already shows X vs Y.
    - `percent-change-calculator` — no change: already has a real bonus output, `absoluteChange`
      (B−A). The only other candidate considered, a "growth multiplier" (1 + %Δ÷100), was
      rejected as just `percentChange` itself re-expressed in a different form, not a new fact.
    - `exponent-calculator` — no change: base/exponent/result is a fully cross-solvable
      3-variable relation (same pattern as force-calculator/speed-distance-time-calculator in
      the physics batch); nothing else genuinely derivable without a new input.
    - `cube-root-calculator` — no change: the page's own watchOut explicitly states a cube root
      is unique among the reals ("exactly one real cube root, always... no principal-vs-other
      ambiguity"), unlike a square root — so unlike square-root-calculator, there is no second
      real root to surface.
    - `area-calculator` — no change: the page's own formula note and watchOut explicitly scope
      it to area only ("this calculator finds area only, not perimeter") and explain why — a
      triangle's perimeter needs all three sides but this page only takes a base and height, and
      a trapezoid's non-parallel legs aren't given either. A perimeter output would only resolve
      for 2 of 5 shapes (square, rectangle) and go blank for the rest, contradicting the page's
      own stated scope.
    - `volume-calculator` — no change: explicitly cross-links to the Surface Area Calculator as
      a deliberate "companion figure" ("volume and surface area are different questions... see
      the Surface Area Calculator for the companion figure"), i.e. the site's own design keeps
      these as separate single-purpose calculators rather than merging them.
    - `surface-area-calculator` — no change: same deliberate companion-calculator split as
      volume-calculator, in the other direction.
    - `scientific-calculator` — no change: not a solve-for-a-value or breakdown page at all — a
      free-text expression evaluator (`inputs: []`, custom keypad widget, `compute()` returns
      `{}`). The outputCount-0 flag is a false positive of the audit's counting heuristic for
      this calculator type, not a thin result set.
  - Acceptance checks run for this batch: `npm test` (1123/1123 pass, after `npm run
    test:update` regenerated the one changed snapshot — `pythagorean-theorem-calculator`'s
    three compute() fixtures, diff-checked to confirm only the new `perimeter` key was added),
    `npm run lint` (clean), `npm run build` (passes, 295 static pages).
- [x] Batch 5: remainder (11: food/sports/text/travel/shopping/statistics/time, branch
  `ux/result-sets-remainder` — 3 real additions, 8 "no change needed", all 11 reviewed):
  - **Real additions (3):**
    - `recipe-scaling-calculator` (food) — added `scalingFactor` (S₂ ÷ S₁): the page's own glyph
      ("x1.5") and concept/formula/workedExample prose already center on this exact ratio, but
      the live solver result never surfaced it as a labeled output. Reuses the already-solved
      `originalServings`/`desiredServings`, same pattern as chemistry's `dilutionFactor` and
      physics's `powerRatio`/`magnification`. Verified: 4→6 servings → 1.5 (matches the page's
      own worked example exactly); 6→2 → 0.3333; originalServings=0 → NaN.
    - `race-time-predictor-calculator` (sports) — added `knownPace` (T₁ ÷ D₁), paired with the
      existing `targetPace` output so both sides of the Riegel comparison show side by side —
      same "paired comparison" reasoning as the chemistry batch's `titration-calculator`
      (`molesTitrant` alongside the existing `molesAnalyte`). Verified against the page's own
      25-min-5K worked example: knownPace → 5.00 min/km, targetPace → 5.2123 min/km (both
      independently recomputed and cross-checked that targetPace > knownPace, the expected
      Riegel slowdown).
    - `steps-to-miles-calculator` (sports) — added `stepsPerMile` (mile length ÷ step length):
      the page's own FAQ already states this exact number in prose ("a mile takes 2,112 steps"
      at a 2.5 ft step) but it was never exposed as a live result for whatever step length the
      user actually enters. Verified: 2.5 ft (0.762 m) step → 2112.0 steps/mile, matching the
      FAQ figure exactly.
  - **No change needed (8):**
    - `sales-tax-calculator` (shopping) — no change: already has a real bonus output (`tax`);
      T=P(1+r) is a fully cross-solvable 3-variable relation, same pattern as
      force-calculator/speed-distance-time-calculator, nothing else derivable without a new input.
    - `z-score-calculator` (statistics) — no change: z=(x−μ)÷σ is a fully cross-solvable
      4-variable relation. The one plausible second output, converting the z-score to a
      percentile/probability, was considered and rejected — the page's own FAQ explicitly states
      "converting that to a percentile additionally requires assuming a specific distribution
      shape (typically the normal distribution)," and this calculator deliberately treats
      x/mean/sd/z generically for any distribution, not just normal. Adding a percentile output
      would silently assume normality the page's own copy says it doesn't assume.
    - `brine-calculator` (food) — no change: the one real comparison across brining times (short
      vs. long) is already exposed live via the `compareBars` chart, which pulls
      `shortBrineSaltCups`/`longBrineSaltCups` directly from `compute()`. A salt-weight (grams)
      conversion was considered and rejected — it would need a new, uncited cups-to-grams density
      specific to Morton Coarse Kosher Salt, and the page's own watchOut already warns that kosher
      salt brands "vary in crystal size and how densely they pack into a cup," so no such figure
      is established anywhere in this codebase to reuse without fabricating one.
    - `currency-converter`, `character-counter`, `hashtag-counter`, `pomodoro-timer`,
      `timezone-meeting-planner` — no change, all 5: false positives of the audit's counting
      heuristic, same as `scientific-calculator` in the math batch. All 5 are custom-component
      stubs (`inputs: []`, `compute() { return {}; }`, rendered by a dedicated client component
      per UX-12's notes) — not solve-for-a-value or breakdown pages at all, so there is no
      `solver.outputs`/`breakdown.outputs` concept that applies to them.
  - Acceptance checks run for this batch: `npm test` (1123/1123 pass, no snapshot changes needed
    — these are new `solver.outputs` entries, not `compute()` changes), `npm run lint` (clean),
    `npm run build` (passes, 295 static pages, unchanged since these are output additions on
    existing calculators, not new pages).
- [x] STATUS.md updated with a summary (count of real additions vs. "no change needed" calls)

## Batch 5 numbers regenerated at run time (counts had not shifted from the step file's original
table — all 11 ids matched exactly): `sales-tax-calculator` (1), `currency-converter` (0),
`character-counter` (0), `hashtag-counter` (0), `pomodoro-timer` (0), `timezone-meeting-planner`
(0), `z-score-calculator` (0), `recipe-scaling-calculator` (0), `brine-calculator` (1),
`race-time-predictor-calculator` (1), `steps-to-miles-calculator` (0).

## All 5 batches combined — final totals (closes out UX-10)

| Batch | Category | Reviewed | Real additions | No change needed |
|---|---|---|---|---|
| 1 | Chemistry | 28 | 8 | 20 |
| 2 | Physics | 19 | 6 | 13 |
| 3 | Measurements | 34 | 4 | 30 |
| 4 | Math | 10 | 2 | 8 |
| 5 | Remainder (food/sports/text/travel/shopping/statistics/time) | 11 | 3 | 8 |
| **Total** | | **102** | **23** | **79** |

## Order after this step (user-confirmed 2026-11-15)

1. **This step (UX-10)** — result-set completeness, all categories.
2. **UX-08** (`mdFiles/steps/ux-08-*.md` — write just-in-time when reached) — sub-group every
   category + mirror in the Categories dropdown.
3. **UX-09** (`mdFiles/steps/ux-09-download-export.md`) — download/export, now built on top of
   whatever result sets look like after this step closes out.
4. **Resume step 60** (finance wave, batches 2-7) — paused to do UX-10/UX-08/UX-09 first.
