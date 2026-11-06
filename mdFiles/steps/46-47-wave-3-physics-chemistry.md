# Step 46-47 — Wave 3: physics, chemistry

Per `mdFiles/omni-strategy.md` §4 (priority 3: physics, chemistry — "huge student volume and
attracts links from schools and universities, but lower ad revenue") and
`mdFiles/calculator-rollout-plan.md`'s "Wave 3: Physics, Chemistry (~120). Needs E2 + E3." Both
prerequisites are done: E2 units v2 (step 30) and E3 solver v2 (step 31). Built in ~5-calculator
agent batches, one batch at a time, same cadence as Wave 1/Wave 2 (see `STATUS.md`'s small-commits
feedback note).

## Starting state

- `physics` category **already exists** (`data/calculators/physics.ts`, registered in
  `data/calculators/index.ts`, theme `indigo`/`atom` icon in `lib/categoryTheme.ts`) with exactly
  one calculator: `force-calculator` (F = m·a — the original v2 template reference
  implementation, `preview/physics-force-calculator`). This wave widens it, same id, no rename
  needed (unlike `home`, physics was never mislabeled).
- `chemistry` is a **new** category — create it the same way `food`/`sports` were in Wave 2:
  `data/calculators/chemistry.ts`, entry in `data/calculators/index.ts`'s `categories` array and
  spread list, a new color/icon pair in `lib/categoryTheme.ts` (pick an unused color; check the
  existing table before choosing — don't repeat `indigo` since that's physics).
- Order: **physics first, chemistry second** — physics has an existing page to extend from and
  lower YMYL-adjacent risk than chemistry's lab-safety-adjacent content (dilution, molarity,
  concentration all show up in real lab/classroom use).

## Dedupe — do not rebuild these, they already exist

- **Unit conversion vs. physics formula is a real boundary, keep it.** Measurements already has
  `speed-converter`, `pressure-converter`, `energy-converter`, `power-converter`,
  `data-storage-converter` — these convert one unit of a quantity to another (e.g. kW → hp).
  Physics calculators compute a quantity **from a formula** (e.g. kinetic energy from mass +
  velocity) — solved-for-any-variable via the Wave-1 solver kit, not a straight conversion. Don't
  rebuild a converter under a physics name; do cross-link where a physics page's output quantity
  has a matching converter (e.g. `kinetic-energy-calculator` → `energy-converter`, the same
  precedent `paver-calculator` set linking to `gravel-calculator`/`sand-calculator`).
- **Speed/velocity is one calculator, not two.** `speed-distance-time` and `velocity` are the same
  formula (v = d ÷ t) under different names — ship one `speed-distance-time-calculator`
  (solved for any of the 3 variables), not both, per the converters guardrail (thin near-duplicate
  pages).
- **Half-life appears in both lists and is NOT the same formula.** Physics' half-life is
  radioactive decay, N = N₀·(1/2)^(t/t½), input is t½ directly. Chemistry's (first-order reaction
  kinetics) half-life is t½ = ln(2)/k, input is a rate constant k. Build both, but as genuinely
  different pages with different inputs — state the distinction on both pages' "watch out" section
  so a student doesn't apply the wrong one, and cross-link them.
- **Check `lib/units.ts` dimensions before adding a new one.** `force`, `mass`, `acceleration`,
  `energy`, `power`, `pressure` dimensions likely already exist (built for `force-calculator` and
  the Wave-1 energy/power/pressure converters) — reuse them in the solver's `dimension` field
  rather than redefining. Quantities with no existing dimension (momentum, impulse, torque,
  capacitance, wavelength, decibel) need a new one added to `UNITS` plus a `lib/units.spec.ts`
  test, same process as any prior new-dimension addition.

## Physics — proposed additions (~15-20 across several runs, starting the ~60 target from the
rollout plan; final count depends on which formulas clear the real-search-volume bar)

Grouped by subtopic (mirrors the eventual `group` field UX-06 added — tag these the same way once
physics crosses `SEARCH_THRESHOLD`, same precedent as math/statistics/measurements):

**Mechanics (run 1 candidates — simplest, reuse existing dimensions, lowest risk to start with):**
1. Speed/Distance/Time Calculator — v = d ÷ t, solve for any of 3 (merges "velocity")
2. Weight Calculator — W = m·g, reuses `mass`/`force` dimensions, cross-link to `force-calculator`
3. Kinetic Energy Calculator — KE = ½mv², reuses `energy`/`mass` dimensions
4. Potential Energy Calculator — PE = mgh, reuses `energy`/`mass`/`length` dimensions
5. Work Calculator — W = F·d·cos(θ), reuses `energy`/`force`/`length` dimensions

**Mechanics (later runs):** momentum (p = mv), impulse (J = FΔt, same unit as momentum — state
that explicitly), power (P = W/t, physics power ≠ `power-converter`'s unit conversion), density
(ρ = m/V), pressure (P = F/A, cross-link `pressure-converter`), torque (τ = F·r), free fall
(h = ½gt²), projectile motion (range/height/time of flight), friction (f = μN), spring/Hooke's law
(F = kx), centripetal force (F = mv²/r), gravitational force (Newton's law, F = Gm₁m₂/r² — distinct
from the local-gravity "weight" calculator above), buoyancy (Archimedes), efficiency (output/input
%), pendulum period (T = 2π√(L/g)), escape velocity.

**Electricity/circuits (own run — a coherent subgroup):** Ohm's law (V = IR, solve for any),
electrical power (P = VI), series/parallel resistors, resistor color code (a lookup table, same
pattern as the shoe/ring-size kit — not a formula solver), capacitance.

**Waves/optics/other (own run):** wavelength-frequency (c = fλ), Doppler effect, decibel (log
scale), lens/mirror equation, Snell's law (refraction), radioactive half-life (see dedupe note
above), E = mc² (mass-energy equivalence), heat (Q = mcΔT), thermal expansion, horsepower,
RPM-to-speed, gear ratio.

## Chemistry — new category, proposed additions (~15-20 starting toward the ~60 target)

**Solutions/concentration (run 1 candidates once the category is open):**
1. Molar Mass Calculator — sum of atomic masses × count per element (needs an atomic-mass lookup
   table, cited to IUPAC/NIST — same lookup-table pattern as `lib/ingredients.ts`/`lib/shoeSizes.ts`)
2. Molarity Calculator — M = mol ÷ L, solve for any
3. Dilution Calculator (C1V1 = C2V2) — solve for any of the 4
4. Mass Percent Calculator — (mass of solute ÷ mass of solution) × 100
5. Moles-to-Grams / Grams-to-Moles Calculator — n = m ÷ M, pairs with molar mass above

**Later runs:** ideal gas law (PV = nRT, solve for any of 4), combined gas law, pH/pOH
(−log[H⁺]/−log[OH⁻], solve both directions), pKa / Henderson-Hasselbalch, percent yield
(actual ÷ theoretical × 100), limiting reagent, theoretical yield, empirical formula,
stoichiometry (mole-ratio from a balanced equation — scope narrowly, this can sprawl), solution
concentration (ppm, mg/L — cross-link `mass-percent`), reaction half-life (see dedupe note above),
rate constant, Arrhenius equation, enthalpy (ΔH), specific heat (cross-link physics' Q = mcΔT —
likely the same calculator serves both, don't duplicate), osmolarity, normality, titration,
equilibrium constant (Keq), Gibbs free energy (ΔG = ΔH − TΔS), density of solutions, serial
dilution.

**Scope warning:** stoichiometry/equilibrium/Gibbs-free-energy-class calculators risk becoming
multi-step chained calculators rather than one clean formula — if a candidate needs more than one
genuinely separate lookup/solve step, flag it in the run's STATUS.md writeup and consider a
narrower first cut (e.g. stoichiometry limited to simple mole-ratio problems, not full equation
balancing) rather than quietly shipping something half-right.

## Final cut

Which specific formulas ship, in what order within each run, and any swaps against the lists above
is the build agent's call per calculator, following the add-calculator skill's existing
verification discipline (cite real formulas/constants to a primary source — IUPAC/NIST for
chemistry constants, standard physics textbook/NIST for physics constants — and an independent
verify_runN.mjs-style check before committing each batch). These lists are the starting scope, not
a locked spec.

## Progress checklist

- [x] Physics run 1 (5), branch `step/46-wave-3-physics-run-1`, PR #61 — **DONE** 2026-11-06:
  - [x] speed-distance-time-calculator
  - [x] weight-calculator
  - [x] kinetic-energy-calculator
  - [x] potential-energy-calculator
  - [x] work-calculator
  - New `lib/units.ts` dimension added this run: `angle` (base radian, `deg` = π/180 rad — BIPM SI
    Brochure §2.3.3), needed for work-calculator's F·d·cos θ. Round-trip + anchor test in
    `lib/units.spec.ts`.
  - No other new dimensions — mass/force/length/energy/speed/acceleration all reused from
    force-calculator and the Wave-1 converters, as the dedupe section anticipated.
  - `work-calculator`'s glyph had to change from `W` to `Fd`: `glyph.spec.ts` enforces unique
    glyphs per category, and `weight-calculator` already used `W` in physics.
  - `npm test` (839 tests), `npm run lint` and `npm run build` all pass. Curl-checked all 5 pages
    (200, correct H1, JSON-LD, every section id present).
  - 199 calculators total after this run (194 + 5).
- [x] Physics run 2 (5), branch `step/46-wave-3-physics-run-2`, PR #62 — **DONE** 2026-11-06:
  - [x] momentum-calculator
  - [x] impulse-calculator
  - [x] power-calculator
  - [x] density-calculator
  - [x] pressure-calculator
  - New `lib/units.ts` dimensions this run: `momentum` (base `kg·m/s`, alt `N·s` — numerically
    identical since N = kg·m/s² by definition, BIPM SI Brochure; shared by momentum-calculator and
    impulse-calculator) and `density` (base `kg/m³`, alts `g/cm³` and `lb/ft³` — NIST SP 811
    Appendix B). Round-trip + anchor tests added to `lib/units.spec.ts`.
  - mass/force/energy/time/speed/pressure/area/power all reused, as the dedupe section anticipated.
  - The build agent was interrupted by a session rate limit right as it started pressure-calculator
    (4/5 committed and pushed; momentum/impulse/power/density). The main session finished
    pressure-calculator from the agent's own in-progress draft (fully written, just not committed —
    content, solver, verification figures all already correct), added it to `calculatorOrder` in
    `data/calculators/index.ts` (easy to miss since it's a separate file from `physics.ts`), added
    the matching `KNOWN_NON_FINITE` entry in `data/calculators.spec.ts` (`force`/`area` both at
    their 0 min -> 0/0, same pattern as power-calculator/density-calculator two lines above it),
    and regenerated the snapshot (additive-only, 32 lines for the one new calculator).
  - `npm test` (863 tests), `npm run lint` and `npm run build` all pass, re-confirmed by the main
    session. 204 calculators total after this run (199 + 5).
- [ ] Physics electricity/circuits run
- [ ] Physics waves/optics run
- [ ] Chemistry category opened + run 1 (5): molar-mass, molarity, dilution, mass-percent, moles-grams
- [ ] Chemistry run 2+ (gas laws, pH/pOH, pKa)
- [ ] Chemistry run 3+ (yield, stoichiometry — scope carefully per the warning above)
- [ ] Chemistry run 4+ (equilibrium, thermo, concentration units)
- [ ] Visual-QA checkpoint: due again once ~50 more calculators land after this wave (last pass was
  at 194 calculators, 2026-11-05 — see STATUS.md header)
