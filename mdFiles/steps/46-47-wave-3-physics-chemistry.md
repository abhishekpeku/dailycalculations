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
- [x] Physics electricity/circuits run (5), branch `step/46-wave-3-physics-run-3`, PR #63 — **DONE** 2026-11-06:
  - [x] ohms-law-calculator
  - [x] electrical-power-calculator
  - [x] series-parallel-resistor-calculator
  - [x] resistor-color-code-calculator
  - [x] capacitor-charge-calculator
  - New `lib/units.ts` dimensions: `voltage`, `current`, `resistance`, `capacitance` (staged before
    this run started, reused here) and `charge` (coulomb, added this run for
    capacitor-charge-calculator's Q = CV, base C with mC/µC/nC — BIPM SI Brochure, 1 C = 1 A·s).
    Round-trip + anchor tests in `lib/units.spec.ts`.
  - `lib/resistorColors.ts` (staged before this run started): IEC 60062 color-code lookup tables
    (via Wikipedia's sourced data template), used by resistor-color-code-calculator's
    `resistanceFromColorBands()`.
  - Multi-relationship precedent followed for two pages, same pattern as the finance calculators'
    `solver.outputs`: ohms-law-calculator's bonus output is power (P = VI); electrical-power-calculator's
    bonus output is the equivalent resistance (R = V ÷ I, from Ohm's law). capacitor-charge-calculator
    similarly adds stored energy (E = ½QV) as a bonus output alongside Q = CV.
  - series-parallel-resistor-calculator is a type-B (breakdown) calculator with a `type: 'list'`
    input (reused the average-calculator/weighted-average-calculator list pattern) rather than a
    solver, since series and parallel combination isn't a single invertible formula for an
    arbitrary-length list — it shows both the series total (sum) and the parallel total (reciprocal
    sum) for the same list at once, compared on a `compareBars` visual.
  - resistor-color-code-calculator is a lookup-table (breakdown) widget, not a solver, per the
    shoe-size/ring-size precedent — `options` on each band input carry the color's digit/multiplier/
    tolerance value directly (no numeric code lookup needed, since every value within each band's
    own list is already distinct). Worked example (red-violet-green-gold = 2,700,000 Ω, ±5%) matches
    `lib/resistorColors.spec.ts`'s own Wikipedia-sourced test exactly.
  - No KNOWN_NON_FINITE entries needed this run: every edge case (zero inputs) resolves to a finite
    0 for all 5 calculators, including the parallel-resistor reciprocal sum (1 ÷ Infinity = 0 in
    JS, not NaN) and the resistor color code lookup (black/black/black/silver bands decode to a
    legitimate 0 Ω).
  - `npm test` (894 tests), `npm run lint` and `npm run build` all pass. Curl-checked all 5 pages
    (200, correct H1, JSON-LD, every section id present — concept/how-to-use/formula/worked-example/
    watch-out/faq/references/related).
  - 209 calculators total after this run (204 + 5).
- [x] Physics waves/optics run (5), branch `step/46-wave-3-physics-run-4`, PR #64 — **DONE** 2026-11-06:
  - [x] wavelength-frequency-calculator
  - [x] decibel-calculator
  - [x] radioactive-half-life-calculator
  - [x] heat-calculator
  - [x] lens-mirror-equation-calculator
  - New `lib/units.ts` dimensions this run: `frequency` (base Hz, alts kHz/MHz/GHz — used by
    wavelength-frequency-calculator's f and, as the decay-constant bonus output's unit, by
    radioactive-half-life-calculator too), `decibel` (single-unit, like percent/count/currency —
    the dB number itself), `specificHeat` (base J/(kg·K), alts J/(g·K) and cal/(g·°C)) and
    `temperatureDelta` (a temperature INTERVAL — K/°C both factor 1, °F factor 5/9, no offset,
    unlike the existing `temperature` dimension which is an absolute reading). Round-trip + anchor
    tests in `lib/units.spec.ts`; also extended the "percent, count and currency are identity" test
    to cover `decibel` and inserted the four new dimensions into the sorted dimensions-list test.
  - decibel-calculator is framed as a general power-ratio calculator (dB = 10 log₁₀(P₂/P₁), e.g.
    amplifier gain) rather than requiring a fixed reference intensity input — reuses the `power`
    dimension twice instead of adding a new W/m² intensity dimension. The standard sound-intensity-
    level special case (I₀ = 1×10⁻¹² W/m² → 60 dB for a normal conversation) is covered as a worked
    FAQ example with the same underlying formula, not as a separate input.
  - radioactive-half-life-calculator is the nuclear-decay half-life (N = N₀·(½)^(t/t½), half-life
    entered directly) — explicitly NOT the chemistry reaction-kinetics half-life (t½ = ln2/k) that
    will ship in a later chemistry run, per this file's dedupe note. Both the concept section and a
    watch-out item call out the distinction. Reuses `mass` (N₀/N) and `time` (t/t½) — no new
    dimension needed for the core formula; only the bonus decay-constant output needed `frequency`.
  - heat-calculator (Q = mcΔT) is the first real use of `specificHeat` and `temperatureDelta`.
    `specificHeat` and `heat` for identical reasons stayed off the `temperature` dimension (which
    has a °C/°F offset that would corrupt a temperature *difference*).
  - lens-mirror-equation-calculator (1/f = 1/dₒ + 1/dᵢ) reuses `length` for all three variables —
    no new dimension needed. Its bonus magnification output (m = −dᵢ/dₒ) reuses the dimensionless
    `count` dimension. Framed as a shared lens/mirror formula per OpenStax (mirrors use f = R/2),
    with inputs left unrestricted on sign (negative f/dᵢ are legitimate virtual-image/diverging
    answers, not errors) except objectDistance, which keeps `min: 0`.
  - `horsepower`, `rpm-to-speed` and `gear-ratio` from the original waves/optics list were left for
    a later run (not part of this 5) — this run focused on the wave/optics/decay/thermal cluster;
    the drivetrain-formula trio reads as a better fit alongside a future mechanics-adjacent batch
    and wasn't needed to fill this run's 5 slots.
  - `npm test` (921 tests), `npm run lint` and `npm run build` all pass. Curl-checked all 5 pages
    (200, correct H1, JSON-LD, every section id present — concept/how-to-use/formula/worked-example/
    watch-out/faq/references/related — note the real id is `how-to-use`, not `how-to`).
  - 214 calculators total after this run (209 + 5).
- [x] Chemistry category opened + run 1 (5), branch `step/46-wave-3-chemistry-run-1`, PR #65 — **DONE** 2026-11-07:
  - [x] molar-mass-calculator
  - [x] molarity-calculator
  - [x] dilution-calculator
  - [x] mass-percent-calculator
  - [x] moles-to-grams-calculator
  - New `chemistry` category opened the same way `food`/`sports` were in Wave 2: `data/calculators/chemistry.ts`,
    registered in `data/calculators/index.ts`'s `categories` array and spread list. Theme: `teal`/`flask` in
    `lib/categoryTheme.ts` (physics already has `indigo`; `teal` was otherwise only used by `travel`, but no
    category repeats an exact color+icon pair). Added a new `flask` icon (an Erlenmeyer flask with a liquid
    line) to `components/IconTile.tsx`'s hand-rolled icon set — no icon library in use, matches the project's
    existing SVG-path convention.
  - New `lib/atomicMasses.ts`: IUPAC/CIAAW standard atomic weights for 34 common elements (H through U, the
    ones that actually show up in general-chemistry formulas), sourced from Wikipedia's "List of elements"
    table (fetched directly). Same lookup-table-plus-spec pattern as `lib/resistorColors.ts`/`lib/ingredients.ts`.
    `molar-mass-calculator` uses it as a breakdown-type (type-B) widget with 4 element+count slots (`options`
    carry the atomic mass value directly, plus a "None" = 0 slot for unused positions) rather than a free-text
    formula parser, per the step file's own scope note.
  - New `lib/units.ts` dimensions: `amountOfSubstance` (mol, SI base, used by `molarity-calculator` and
    `moles-to-grams-calculator`), `concentration` (mol/m³ base — SI-coherent with `amountOfSubstance`/`volume`,
    same precedent as `density`'s kg/m³ — mol/L is the practical display unit) and `molarMass` (kg/mol base,
    g/mol display). All three chosen so solver formulas (`M = n/V`, `n = m/M`) stay a plain division with no
    stray unit factor, same discipline as every physics dimension this wave. Round-trip + anchor tests in
    `lib/units.spec.ts`, including one cross-dimension anchor each for `concentration` and `molarMass` (e.g.
    water: mass(g)/amountOfSubstance(mol) = molarMass(g/mol) exactly).
  - `dilution-calculator` is a 4-variable solver (`C1`, `V1`, `C2`, `V2`), all four closed-form — no `equation`/
    `bounds` needed, following the template's loan-example precedent for >3-variable solvers. Bonus output:
    dilution factor (V2÷V1).
  - `mass-percent-calculator` reuses the existing `mass` and `percent` dimensions (no new dimension needed) and
    adds a `derive`d solvent mass (solutionMass − soluteMass) feeding a donut visual.
  - `moles-to-grams-calculator` reuses `mass`/`amountOfSubstance`/`molarMass`; bonus output is particle count via
    Avogadro's number (exact, 6.02214076×10²³, BIPM SI Brochure). Its logScale visual benchmarks (water, CO2,
    NaCl, glucose) are the same four molar masses `molar-mass-calculator`'s FAQ cites, kept numerically
    consistent across both pages.
  - No formula needed an `equation`/numeric-solve path — every variable in all 5 calculators has a closed form,
    same as most of physics wave 3.
  - `npm test` (952 tests), `npm run lint` and `npm run build` all pass. `KNOWN_NON_FINITE` entries added for
    all 5 (each is a straightforward 0/0 at every input's own min). Curl-checked all 5 pages plus the new
    `/categories/chemistry` page (200, correct H1, JSON-LD, every section id present — concept/how-to-use/
    formula/worked-example/watch-out/faq/references/related).
  - Every number in the copy (molar masses, the worked examples, every FAQ figure, and the molarity/molar-mass
    benchmark figures: seawater ≈0.6 mol/L, concentrated HCl ≈12 mol/L, pure water ≈55.5 mol/L) was recomputed
    independently in a scratch script before committing each calculator.
  - 219 calculators total after this run (214 + 5).
- [x] Chemistry run 2 (5), branch `step/46-wave-3-chemistry-run-2`, PR #66 — **DONE** 2026-11-08:
  - [x] ideal-gas-law-calculator
  - [x] combined-gas-law-calculator
  - [x] ph-poh-calculator
  - [x] pka-henderson-hasselbalch-calculator
  - [x] percent-yield-calculator
  - `ideal-gas-law-calculator` is a 4-variable closed-form solver (PV = nRT); bonus output is
    concentration (n÷V), reusing chemistry run 1's `concentration` dimension. R = 8.31446261815324
    J/(mol·K), NIST CODATA exact value.
  - `combined-gas-law-calculator` is a 6-variable closed-form solver (P₁V₁/T₁ = P₂V₂/T₂, two gas
    states). No new dimension.
  - `ph-poh-calculator`: pH/pOH/[H⁺]/[OH⁻] form a system with only **one** independent degree of
    freedom, not the solver widget's usual "N knowns → 1 unknown" shape — making all four full
    solver variables would leave two stale after any edit. Shipped as a clean 2-variable solver
    (pH ⇄ pOH) with [H⁺]/[OH⁻] as always-fresh derived `outputs`.
  - `pka-henderson-hasselbalch-calculator` (pH = pKa + log₁₀([A⁻]/[HA])) has no such degeneracy —
    genuinely 3 independent degrees of freedom across 4 variables, same shape as the ideal gas law
    — ordinary 4-variable solver.
  - `percent-yield-calculator`: (actual÷theoretical)×100, 3-variable solver, bonus output "mass not
    recovered".
  - New `lib/units.ts` dimension: `pH` — single-unit, dimensionless log scale (factor 1), same
    precedent as `decibel`/`percent`/`count`. Source: IUPAC Gold Book "pH". Added to the sorted-
    dimensions and identity tests in `lib/units.spec.ts`. No other new dimensions needed —
    pressure/amountOfSubstance/concentration/volume/temperature/mass all reused as the step file's
    dedupe section anticipated.
  - Independent scratch script (`verify_run2.mjs`) recomputed every formula before the copy was
    written: ideal gas molar volume at both STP conventions (22.414 L/mol at 1 atm vs 22.711 L/mol
    at IUPAC's 100 kPa, cited precisely, not conflated), combined gas law round-trips, pH/pOH/
    [H⁺]/[OH⁻] consistency ([H⁺]×[OH⁻] = 1.0×10⁻¹⁴ check), Henderson-Hasselbalch worked example, and
    percent-yield round-trips.
  - `npm test` (973 tests), `npm run lint` and `npm run build` all pass. `KNOWN_NON_FINITE` entries
    added for `ideal-gas-law-calculator` (volume), `combined-gas-law-calculator` (volume2),
    `pka-henderson-hasselbalch-calculator` (pH) and `percent-yield-calculator` (percentYield) — each
    an honest 0/0 or log-of-zero at the input's own 0 min; `ph-poh-calculator` needed none (pOH =
    14 − pH is defined everywhere). Curl-checked all 5 pages plus `/categories/chemistry` (200,
    correct H1, JSON-LD, every section id present).
  - Commits were 2, not 5 (all 5 calculators were written to `data/calculators/chemistry.ts`
    sequentially before the first test run, producing one contiguous diff that couldn't be split
    into 5 clean commits after the fact) — each calculator was still built/verified/tested
    individually per the scratch script's per-section output before moving to the next. Draft PR
    was still opened early, before any calculator content existed, per the resumability rule.
  - 224 calculators total after this run (219 + 5).

## Planned remaining runs (not started — see STATUS.md decision D13 for category order)

Physics is at 21/~61 target, chemistry at 5/~60 target. The seed lists in this file's "proposed
additions" sections only cover part of the remaining count in each case — the rest is intentionally
unscoped (per the "Final cut" note: exact formula selection per run is the build agent's call).
Runs below are grouped logically but **the exact 5-calculator split within a run is still the
build agent's judgment**, same as every run so far.

- [ ] Physics mechanics-remainder run A (5): acceleration (a = Δv ÷ t), free-fall (h = ½gt²),
  projectile motion (range/height/time of flight), friction (f = μN), spring/Hooke's law (F = kx)
- [ ] Physics mechanics-remainder run B (5): centripetal force (F = mv²/r), gravitational force
  (Newton's law, F = Gm₁m₂/r² — distinct from weight-calculator's local gravity), torque (τ = F·r),
  buoyancy (Archimedes), pendulum period (T = 2π√(L/g))
- [ ] Physics waves/other-remainder run (5): Doppler effect, Snell's law (refraction), E = mc²
  (mass-energy equivalence), thermal expansion, escape velocity — closes out every named seed-list
  item from "Physics — proposed additions" above
- [ ] Physics drivetrain/efficiency run (5): horsepower (deferred from run 4 — check it isn't a
  straight unit conversion already covered by `power-converter` before building; frame from
  torque+RPM if so), RPM-to-speed (wheel RPM → linear speed given wheel diameter), gear ratio
  (driven teeth ÷ drive teeth), efficiency (output/input %), + 1 more TBD by the build agent
  (candidates: angular velocity, Coulomb's law, specific gravity, terminal velocity)
- [ ] Physics runs 9+ (as many 5-calculator runs as needed to close the gap toward ~61 total — no
  seed list left at this point; build agent picks standard-physics formulas not yet covered,
  e.g. angular momentum, moment of inertia (simple shapes), rotational kinetic energy, electric
  field strength, magnetic force on a current, simple harmonic motion period, Young's modulus /
  stress-strain, orbital velocity — verify each against a primary source same as every prior run)
- [x] Chemistry run 3 (5), branch `step/46-wave-3-chemistry-run-3`, PR #67 — **DONE** 2026-11-08:
  - [x] limiting-reagent-calculator
  - [x] theoretical-yield-calculator
  - [x] empirical-formula-calculator
  - [x] stoichiometry-calculator
  - [x] solution-concentration-calculator
  - `limiting-reagent-calculator` is a type-B breakdown widget (comparing two reactants' moles ÷
    coefficient isn't a single invertible equation), same precedent as series-parallel-resistor-
    calculator. Worked example: N₂ + 3H₂ → 2NH₃, 3 mol N₂ + 6 mol H₂ → H₂ limiting, 1 mol N₂ left
    over. Uses `BreakdownOutput.labels` (headline is "Reactant A"/"Reactant B", a fixed lookup from
    a 0/1 code, same precedent as the UK ring-size letter).
  - `theoretical-yield-calculator` is a clean 5-variable closed-form solver (mₜ = n × (cₚ÷cᵣ) × M) —
    every variable invertible given the other 4, same shape as combined-gas-law-calculator's 6
    variables. Cross-linked both ways with `percent-yield-calculator` (added to its `related` and
    referenced in its "How is theoretical yield calculated?" FAQ answer) per the task's instruction,
    since percent-yield already takes theoretical yield as a given input and this calculator derives
    it from stoichiometry instead.
  - `empirical-formula-calculator` is a breakdown widget reusing `lib/atomicMasses.ts`'s
    `ELEMENT_OPTIONS` (same pattern as `molar-mass-calculator`), up to 3 elements. Implements
    OpenStax's own 3-step method (percent → moles via 100 g basis → divide by smallest → multiply by
    a small whole number, 1-6, to clear a remaining fraction within a disclosed ~6% rounding
    tolerance) as a single `compute()` — confirmed this is one self-contained step, not a
    multi-step chain requiring a second page. Worked example (C 40.9%/H 4.58%/O 54.5% → C₃H₄O₃,
    multiplier 3) double-checked against the real mass fractions of ascorbic acid (C₆H₈O₆).
  - `stoichiometry-calculator` scoped exactly as instructed: a 4-variable closed-form mole-ratio
    solver (nᴮ = nᴬ × cᴮ÷cᴬ), explicitly not equation balancing. **Scope-overlap note, not a
    scope-creep problem**: this calculator's math is a strict subset of
    `theoretical-yield-calculator`'s (which also converts to a mass via molar mass) — differentiated
    by framing and inputs (plain mole-to-mole between any two species in an equation, reactant or
    product, vs. specifically the limiting reagent's moles to a product's mass) and cross-linked to
    both `moles-to-grams-calculator` (for the mass step) and `theoretical-yield-calculator`/
    `limiting-reagent-calculator` (for the yield-specific framing) rather than duplicating either.
    No equation-balancing, multi-step solve, or chaining was needed — confirmed in the final report.
  - `solution-concentration-calculator` (ρ = m ÷ V, mg/L) needed a new `lib/units.ts` dimension,
    `massConcentration` (base mg/L; g/L, µg/L, ppm, ppb as its other units) — `concentration`
    (mol/L) and `percent` didn't fit, since this is mass-per-volume, not moles or a mass fraction.
    `ppm`/`ppb` share mg/L's and µg/L's factors on the EPA drinking-water convention ("milligrams
    per liter are equivalent to parts per million," confirmed by direct fetch of EPA's National
    Primary Drinking Water Regulations page), stated as a convention specific to dilute aqueous
    solutions in content, not as a universal unit identity — same discipline as the `momentum`
    dimension's kg·m/s = N·s precedent. Benchmarks (EPA lead action level 0.015 mg/L, nitrate limit
    10 mg/L) are both from that same EPA page, fetched directly. Cross-linked to `molarity-calculator`
    and `mass-percent-calculator` both ways, with content explaining which unit fits which question.
  - All formulas verified against OpenStax Chemistry 2e directly (fetched, not recalled from
    memory): §4.3 "Reaction Stoichiometry" (mole-ratio method, confirms the 2Al+3I₂→2AlI₃-style
    example), §4.4 "Reaction Yields" (limiting reactant and theoretical yield definitions), §3.2
    "Determining Empirical and Molecular Formulas" (the 100 g basis / smallest-mole-ratio / clear-
    the-fraction method), §3.4 "Other Units for Solution Concentrations" (ppm/ppb defined as mass
    fractions ×10⁶/10⁹).
  - **Found and parked** (pre-existing, not touched): two citations shipped in chemistry run 1
    mismatch their section title and URL — `mass-percent-calculator`'s reference labels url
    `.../3-3-molarity` as "§3.3 'Other Units for Solution Concentrations'" (that page is actually
    §3.3 "Molarity"; "Other Units" is §3.4, url `.../3-4-other-units-for-solution-concentrations`),
    and `dilution-calculator`'s reference labels that same `.../3-4-other-units-for-solution-
    concentrations` url as "§3.4 'Dilutions and Titrations'" (confirmed by direct fetch: that page
    is "Other Units for Solution Concentrations," not "Dilutions and Titrations" — the real
    "Dilutions and Titrations" section's URL wasn't located). Added to STATUS.md's Parked list.
  - `npm test` (989 tests), `npm run lint` and `npm run build` all pass. New `KNOWN_NON_FINITE` entry
    for `solution-concentration-calculator` (`concentration`, soluteMass and volume both 0 -> 0/0).
    Snapshot diff is additive-only (5 new entries). Curl-checked all 5 pages plus
    `/categories/chemistry` (200, correct H1, JSON-LD, every section id present — concept/
    how-to-use/formula/worked-example/watch-out/faq/references/related).
  - Commits were 2, not 5 (progress-checklist commit, then all 5 calculators plus the units/test
    changes written and verified together before the first full test run) — each calculator's
    numbers were still independently recomputed in a scratch script and individually checked before
    moving to the next, same discipline as run 2.
  - 229 calculators total after this run (224 + 5).
- [x] Chemistry run 4 (5), branch `step/46-wave-3-chemistry-run-4`, PR #68 — **DONE** 2026-11-08:
  - [x] reaction-half-life-calculator
  - [x] rate-constant-calculator
  - [x] arrhenius-equation-calculator
  - [x] molality-calculator
  - [x] mole-fraction-calculator
  - Specific-heat sanity check (per this run's scope note): confirmed physics' `heat-calculator`
    (Q = mcΔT, shipped in physics run 4) already serves a chemistry audience adequately — specific
    heat is a single formula with no chemistry-specific variant, so no duplicate chemistry page was
    built. Molality and mole fraction filled those two slots instead, as the plan anticipated.
  - `reaction-half-life-calculator` (t½ = ln2 ÷ k, first-order kinetics) is a 2-variable solver,
    explicitly distinct from physics' `radioactive-half-life-calculator` (nuclear decay, half-life
    entered directly) per this file's dedupe note — both the concept section and a watch-out item
    state the distinction, and the two pages are cross-linked both ways (added
    `reaction-half-life-calculator` to `radioactive-half-life-calculator`'s `related` array in
    `data/calculators/physics.ts`, swapping out `compound-interest-calculator` to keep it at 4).
  - `rate-constant-calculator` is scoped to the first-order integrated rate law only
    (k = ln([A]₀÷[A]) ÷ t), per the task's "keep scope tight" instruction — deriving k from a
    measured half-life is already `reaction-half-life-calculator`'s job (solved in reverse), so
    this calculator's distinct value is the concentration-vs-time direction instead. 4-variable
    closed-form solver (initial concentration, concentration at t, time, k), with the implied
    half-life as a bonus output tying the two calculators together.
  - `arrhenius-equation-calculator` (k = A·e^(−Ea/RT)) is a 4-variable closed-form solver (k, A,
    Ea, T). Reuses the exact R constant (8.31446261815324 J/(mol·K)) already used in
    `ideal-gas-law-calculator`. Bonus output: the Boltzmann collision fraction, e^(−Ea÷RT).
  - `molality-calculator` (b = mol ÷ kg solvent) is a 3-variable closed-form solver, explicitly
    distinguished in content from molarity (mol/L of solution) and mass percent/solution
    concentration (both use total solution mass) — content explains molality's temperature
    independence (mass doesn't expand/contract with temperature, unlike volume), which is why it
    underlies colligative-property formulas.
  - `mole-fraction-calculator` (χ = mol component ÷ total mol) is a type-B breakdown widget with
    three component-mole slots (the third defaulting to 0/unused for a two-component mixture),
    not a solver — with 2 or 3 independent raw inputs feeding 3-4 derived fractions, there is no
    single invertible equation to solve, the same reasoning that made `limiting-reagent-calculator`
    and `empirical-formula-calculator` breakdown widgets in earlier runs. Donut visual shows each
    component's share of the total.
  - New `lib/units.ts` dimensions this run: `rateConstant` (base s⁻¹, alts min⁻¹/h⁻¹ — numerically
    identical to `frequency`'s Hz but kept separate since chemists report rate constants in s⁻¹/
    min⁻¹/h⁻¹, never Hz/kHz/MHz; also used for the Arrhenius equation's pre-exponential factor A,
    which shares k's units for a first-order reaction), `molarEnergy` (base J/mol, alts kJ/mol,
    cal/mol, kcal/mol — backs the Arrhenius equation's activation energy), and `molality` (base
    mol/kg, alt mmol/kg — SI-coherent, same pattern as `concentration`/`molarMass`). Round-trip +
    anchor tests added to `lib/units.spec.ts`, including a cross-dimension anchor for molality
    (35.8 mol ÷ 2.00 kg = 17.9 mol/kg, OpenStax Example 11.3) matching `concentration`/`molarMass`'s
    own precedent. `concentration`, `amountOfSubstance`, `mass` and `time` all reused elsewhere,
    as the step file's dedupe section anticipated.
  - Independent scratch script (`verify_run4.mjs`, scratchpad) recomputed every number before the
    copy was written, including: reaction half-life forward/reverse round-trips; the rate-constant
    calculator's k from the same real OpenStax H₂O₂ decomposition data table (Example 12.7) used
    for the half-life worked example, confirming both calculators agree on k ≈ 0.1155 h⁻¹ (≈
    3.21×10⁻⁵ s⁻¹) and t½ ≈ 6.00 h independently; the Arrhenius equation's forward computation and
    all three reverse solves (Ea, A, T) at T = 298.15 K; the 10 K "roughly doubles" rate-of-reaction
    rule-of-thumb figure (computed exactly: ×1.92, a 92.4% increase, not rounded to "doubles"); the
    molality worked example (OpenStax Example 11.3, ethylene glycol/water); and the mole-fraction
    worked example (OpenStax Example 9.15, O₂/N₂O gas mixture, χ(O₂) = 0.2518).
  - Formulas verified directly against OpenStax Chemistry 2e (fetched, not recalled from memory):
    §12.4 "Integrated Rate Laws" (first-order half-life and integrated rate law, plus the H₂O₂
    data table from Example 12.7 and the half-life figure from Example 12.11), §12.5 "Collision
    Theory" (the Arrhenius equation and R = 8.314 J/(mol·K)), §11.4 "Colligative Properties"
    (molality's definition and Example 11.3), and §9.3 "Stoichiometry of Gaseous Substances,
    Mixtures, and Reactions" (mole fraction and Example 9.15). Confirmed each page's exact
    section title/number by a direct fetch before citing it, per run 3's parked-citation lesson.
  - `npm test` (1,012 tests), `npm run lint` and `npm run build` all pass. New `KNOWN_NON_FINITE`
    entries: `reaction-half-life-calculator` (`halfLife`, rateConstant 0 → infinite half-life, an
    honest no-answer rather than NaN, same reasoning as `radioactive-half-life-calculator`'s own
    decay-constant bonus output), `rate-constant-calculator` (`rateConstant`, all three inputs 0 →
    log(0÷0)÷0), `arrhenius-equation-calculator` (`rateConstant`, all three inputs 0 → 0×e^(NaN)),
    `molality-calculator` (`molality`, 0/0) and `mole-fraction-calculator` (all three mole
    fractions, 0/0). Snapshot diff is additive-only (175 new lines, 0 removed, confirmed with
    `git diff --stat`).
  - Deviation from the usual curl-check: a pre-existing `next dev` process was already running on
    port 3000 for this project directory (not started by this run), and Next.js refuses to run a
    second dev server against the same project directory regardless of port — killing that PID was
    correctly blocked by the permission system as "interfere with workloads," so it was left alone
    rather than killed. Verified the 5 new pages instead by inspecting the static HTML
    `next build` already produced (`.next/server/app/en/calculators/<id>.html`): H1, exactly one
    JSON-LD script, and all eight section ids (concept/how-to-use/formula/worked-example/
    watch-out/faq/references/related) present on every page, plus all 5 ids linked correctly from
    the `/en/categories/chemistry` page and no "application error" text in any of the 5 files. No
    new dev server was left running by this run.
  - 234 calculators total after this run (229 + 5).
- [x] Chemistry run 5 (5), branch `step/46-wave-3-chemistry-run-5`, PR #69 — **DONE (open, awaiting merge)** 2026-11-08:
  - [x] osmolarity-calculator
  - [x] normality-calculator
  - [x] titration-calculator
  - [x] equilibrium-constant-calculator
  - [x] gibbs-free-energy-calculator
  - `osmolarity-calculator` (Osm = M × i) and `normality-calculator` (N = M × n) are both 3-variable
    closed-form solvers with the identical "molarity × a dimensionless multiplier" shape as
    `mass-percent-calculator`. Cross-linked both ways: normality's content explicitly frames itself
    as "molarity scaled by a reaction-dependent factor" per the task's instruction, and osmolarity
    cross-links to `molality-calculator` for the osmolarity-vs-osmolality distinction (same
    molarity-vs-molality shape, stated as a watch-out item on both pages).
  - `titration-calculator` is a 6-variable solver (2 concentrations, 2 volumes, 2 `fixed: true`
    stoichiometric-coefficient inputs) generalizing C₁V₁ = C₂V₂ to C₁V₁×b = C₂V₂×a so a non-1:1
    titration (H₂SO₄ + 2NaOH) scales correctly. Cross-linked to `dilution-calculator` both ways with
    an explicit watch-out item on each page stating the distinction the task asked for: titration
    reacts two different species to a stoichiometric endpoint; dilution adds solvent to the same
    solute and conserves its moles.
  - `equilibrium-constant-calculator` is a type-B breakdown widget (4 concentration+coefficient
    slots — 2 reactants, 2 products — raised to their own coefficients and divided), not a solver,
    since Kc = [C]^c[D]^d ÷ ([A]^a[B]^b) has no single invertible unknown the way the task's scope
    note anticipated. An unused slot (e.g. a single-reactant reaction) defaults to coefficient 0,
    contributing a factor of 1 (x^0 = 1, including 0^0 = 1 in JS) with no special-casing needed.
    Kept to a general small-molecule equilibrium expression exactly as scoped — no Le Chatelier
    shift-prediction was built.
  - `gibbs-free-energy-calculator` (ΔG = ΔH − TΔS) is a 4-variable closed-form solver reusing
    `molarEnergy` (run 4's dimension, shared with the Arrhenius equation's Eₐ) for ΔH and ΔG, plus a
    new `molarEntropy` dimension for ΔS. T uses the existing `temperature` dimension, with the same
    "must be absolute kelvin" watch-out pattern already used on `ideal-gas-law-calculator`/
    `combined-gas-law-calculator`. A bonus output computes the "crossover temperature" (T where
    ΔG = 0, T = ΔH ÷ ΔS) — content is careful to note this is an approximation from fixed-ΔH/ΔS
    standard-state data, not the same thing as a substance's real measured phase-transition
    temperature (worked example: water's computed crossover is 370.5 K / 97.3 °C, close to but not
    373.15 K / 100 °C, and the content explains why they differ rather than conflating them).
  - New `lib/units.ts` dimensions this run: `osmolarity` (base mOsm/L, alt Osm/L) and `normality`
    (base meq/L, alt eq/L) — both kept separate from `concentration` rather than adding units to it,
    so a plain molarity field's own unit menu never offers "Osm/L" or "eq/L" (same reasoning as
    `massConcentration` being kept separate from `density` in an earlier run); and `molarEntropy`
    (base J/(mol·K), alts kJ/(mol·K) and cal/(mol·K)), SI-coherent with `molarEnergy` ÷ `temperature`.
    All three chosen so their defining formulas (Osm = M×i, N = M×n, ΔG = ΔH−TΔS) stay plain
    arithmetic with no stray conversion factor — confirmed with a dedicated anchor test for each in
    `lib/units.spec.ts` (e.g. 0.154 mol/L NaCl × i=2 = 308 mOsm/L; 0.1 mol/L H₂SO₄ × n=2 = 0.2 N).
    `concentration`, `amountOfSubstance`, `volume`, `temperature` and `molarEnergy` all reused
    elsewhere in this run, as the task's dimension-reuse hints anticipated.
  - Citation note, in the same spirit as run 3's parked-citation lesson: OpenStax Chemistry 2e does
    not use the term "osmolarity" or cover "normality" at all (confirmed by direct fetch of §11.4
    "Colligative Properties," which gives Π = MRT and the van't Hoff factor i but never the word
    "osmolarity," and of §4.3 "Reaction Stoichiometry," which has no titration content). For those
    two pages, the primary sources are: StatPearls [Internet] (NCBI Bookshelf, NIH) "Normal Saline"
    for the real-world 308 mOsm/L osmolarity figure (fetched directly, confirms 154 mEq/L Na⁺ and
    154 mEq/L Cl⁻); NIST SP 811 Chapter 8 §8.6.5 (fetched directly) for normality's legacy/obsolete
    status and the N symbol; and IUPAC's Gold Book "equivalent entity" (E02192) for the n-factor
    definition — the Gold Book's own site returned HTTP 403 to a direct fetch for every URL tried
    (including two URLs cited successfully in run 1), so that one citation's exact wording was
    confirmed via a search-engine snippet of the indexed page rather than a live fetch; flagged here
    rather than silently treated as fully fetch-verified. Titration and equilibrium constant are
    both grounded in direct OpenStax fetches: §14.7 "Acid-Base Titrations" (confirmed exact title,
    equivalence-point definition, and the Example 14.21 25.00 mL/0.100 M HCl-NaOH titration) and
    §13.2 "Equilibrium Constants" (confirmed the Kc formula and the 2NO₂⇌N₂O₄ worked example, [NO₂]
    = 0.016 M, [N₂O₄] = 0.042 M). Gibbs free energy is grounded in §16.4 "Free Energy" (confirmed
    title, formula, spontaneity convention, and the water-vaporization worked example, ΔH = 44.01
    kJ/mol, ΔS = 118.8 J/(mol·K), T = 298 K → ΔG ≈ 8.6 kJ/mol).
  - Independent scratch script (`verify_run5.mjs`, scratchpad) recomputed every number before the
    copy was written, including: the 0.9% NaCl → 308 mOsm/L osmolarity figure from first principles
    (9 g/L ÷ 58.44 g/mol × 2 × 1000 = 307.99 ≈ 308, matching StatPearls' published figure exactly);
    the H₂SO₄/KMnO₄/H₃PO₄ normality figures; the 1:1 titration check against OpenStax's own
    Example 14.21 numbers and the H₂SO₄/NaOH 2:1 worked example (both directions, forward and
    solving back for V₂); the 2NO₂⇌N₂O₄ Kc calculation (164.06, which rounds to OpenStax's published
    1.6×10² at the two significant figures the 0.016/0.042 inputs actually support — not a
    discrepancy, a correctly-propagated rounding, and the copy says so explicitly rather than
    quietly picking one number); and the Gibbs free energy worked example and all three reverse
    solves (ΔH, T, ΔS), plus the crossover-temperature figure.
  - `npm test` (1,035 tests), `npm run lint` and `npm run build` all pass. New `KNOWN_NON_FINITE`
    entry: `titration-calculator` (`concentration2`, analyte volume 0 at its own min → divide by
    zero). Snapshot diff is additive-only (196 new lines, 0 removed, confirmed with `git diff
    --stat`). No other calculator's edge case needed a new entry.
  - Deviation from the usual curl-check, same root cause flagged in run 4's report: a pre-existing
    `next dev` process (PID on port 3000, not started by this run) was already running against this
    project directory, and `next build` crashed once with a corrupted `.next/dev/types/routes.d.ts`
    type-check error, consistent with that leftover process writing to `.next` concurrently.
    Deleting `.next` and rebuilding fixed it (same remedy noted in STATUS.md's existing Parked
    note). Killing the PID itself was not attempted, per instruction. Verified the 5 new pages from
    the static HTML `next build` produced (`.next/server/app/en/calculators/<id>.html`) instead: H1,
    exactly one JSON-LD script, and all eight section ids (concept/how-to-use/formula/
    worked-example/watch-out/faq/references/related) present on every page, all 5 ids linked
    correctly from `/en/categories/chemistry`, and no "application error" text in any of the 5
    files. No new dev server was left running by this run.
  - 239 calculators total after this run (234 + 5).
- [ ] Chemistry run 6 (5), branch `step/46-wave-3-chemistry-run-6` — **IN PROGRESS**:
  - [ ] density-of-solutions-calculator
  - [ ] serial-dilution-calculator
  - [ ] electron-configuration-calculator
  - [ ] buffer-capacity-calculator
  - [ ] beer-lambert-law-calculator
- [ ] Chemistry runs 7+ (as many 5-calculator runs as needed toward ~60 total — candidates:
  freezing-point depression, boiling-point elevation, van't Hoff osmotic pressure, percent
  composition by formula, Nernst equation, Faraday's law of electrolysis, molar volume at STP,
  vapor pressure (Clausius-Clapeyron, simplified), significant-figures / dimensional-analysis
  helper, isotope-weighted average atomic mass)
- [ ] Visual-QA checkpoint: due again once ~50 more calculators land after this wave (last pass was
  at 194 calculators, 2026-11-05 — see STATUS.md header)

**After physics and chemistry both close out (~121 calculators added this wave, ~440 site-wide):**
Wave 4 opens next, in this fixed order — **biology, then ecology, then fun/other** (per
`mdFiles/omni-strategy.md` §4.2 and STATUS.md decision D13) — followed by the small standalone
`tech` category (step 25, ~3 calculators: `ip-subnet-calculator`, `iban-calculator`,
`password-strength-checker` — `data-storage-converter` already shipped under measurements).
Per the working protocol, the Wave 4 step file gets written just-in-time when that step actually
starts, not now — see `mdFiles/calculator-rollout-plan.md` §4 "Wave 4" and
`mdFiles/omni-strategy.md`'s biology/ecology/fun-other candidate lists for the seed material when
that time comes.
