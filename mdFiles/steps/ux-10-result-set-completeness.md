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
- [ ] Batch 2: physics (19, likely 2 sub-batches)
- [ ] Batch 3: measurements (34)
- [ ] Batch 4: math (10)
- [ ] Batch 5: remainder (11: food/sports/text/travel/shopping/statistics/time)
- [ ] STATUS.md updated with a summary (count of real additions vs. "no change needed" calls)

## Order after this step (user-confirmed 2026-11-15)

1. **This step (UX-10)** — result-set completeness, all categories.
2. **UX-08** (`mdFiles/steps/ux-08-*.md` — write just-in-time when reached) — sub-group every
   category + mirror in the Categories dropdown.
3. **UX-09** (`mdFiles/steps/ux-09-download-export.md`) — download/export, now built on top of
   whatever result sets look like after this step closes out.
4. **Resume step 60** (finance wave, batches 2-7) — paused to do UX-10/UX-08/UX-09 first.
