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
- [x] Chemistry run 6 (5), branch `step/46-wave-3-chemistry-run-6`, PR #70 — **DONE** 2026-11-09:
  - [x] density-of-solutions-calculator
  - [x] serial-dilution-calculator
  - [x] electron-configuration-calculator
  - [x] buffer-capacity-calculator
  - [x] beer-lambert-law-calculator
  - New `lib/electronConfigurations.ts` (new, separate from `lib/atomicMasses.ts`): ground-state
    electron configurations for all 108 elements NIST's Atomic Spectra Database has a measured value
    for (hydrogen through hassium), fetched directly from NIST's own Ionization Energies tool —
    elements 109+ return "No data are available" at NIST, so the calculator stops at 108 rather than
    guessing. Self-check in `lib/electronConfigurations.spec.ts`: every element's shell counts sum to
    its own Z exactly (the actual guard against a transcription typo across 108 rows).
  - **Cr/Cu written-order convention, resolved** (this was the exact question the prior session got
    cut off mid-verifying): fetched NIST's own printed ground-configuration strings directly
    (`physics.nist.gov/cgi-bin/ASD/ie.pl`) for chromium and copper — both show **3d before 4s**
    ("[Ar]3d54s", "[Ar]3d104s"), i.e. subshells ordered by increasing principal quantum number, not
    by Aufbau fill order. Adopted that as this calculator's convention; `content.watchOut` names the
    alternative (some textbooks write 4s before 3d to highlight which electron moved) as an
    equivalent, differently-ordered description of the same configuration, not a disagreement.
  - New `lib/units.ts` dimensions: `absorbance` (single-unit, like pH/decibel — base "AU") and
    `molarAbsorptivity` (base m²/mol per the IUPAC Gold Book, alt L/(mol·cm) at factor 0.1, both for
    beer-lambert-law-calculator).
  - **Scope decisions**: `density-of-solutions-calculator` is NOT a duplicate of physics'
    `density-calculator` (ρ = m/V) despite sharing the formula — it is built around the specific
    lab workflow of combining a solute and solvent by mass and then measuring the resulting
    solution's actual volume (mixing is not volume-additive), adding mass percent and specific
    gravity on top, the same "don't duplicate, differentiate by real use case" call made for
    specific-heat in run 4. `serial-dilution-calculator` is deliberately unit-agnostic (plain number
    inputs, no `concentration` dimension) so the same page serves molarity, mass concentration, and
    CFU/mL dilution series alike; content ties its worked example directly to OpenStax Microbiology's
    own CFU plate-count example (50 colonies × a 1:10,000 dilution → 5,000,000 CFU/mL, run the other
    direction). `buffer-capacity-calculator` is a type-B breakdown, not a solver — the Van Slyke
    equation's inverse (pH or pKa from a target β) has no clean closed form, and per the run's own
    scope warning this was not worth a numeric `equation` solve for a first cut.
  - **Citation gaps, flagged rather than silently treated as fetch-verified** (same precedent as run
    5's Gold Book 403): the IUPAC Gold Book's Beer-Lambert law page (B00626) and Van Slyke's original
    1922 JBC paper (52:525-570) both returned HTTP 403 to a direct fetch. The Gold Book's formula was
    confirmed via a search-engine-indexed snippet; the Van Slyke buffer-capacity formula was instead
    independently re-derived from the acid-dissociation and mass-balance equations from scratch
    (`verify_run6.mjs`, scratchpad) — that derivation reproduces the formula's `2.303` constant
    exactly as `ln(10)` rounded to four figures, a stronger check than trusting the secondary
    citation. The CRC Handbook's own NaCl-solution density table (used for
    `density-of-solutions-calculator`'s worked example) is paywalled; confirmed via two independent
    secondary reproductions (EngineeringToolbox, Sigma-Aldrich) instead, flagged in that
    calculator's own references entry.
  - Independent scratch script (`verify_run6.mjs`, scratchpad) recomputed every number before the
    copy was written: the density/mass-percent/specific-gravity figures (volume backed out from the
    cited 1.0707 g/mL CRC figure so the worked example matches a real published number exactly); the
    serial-dilution cumulative-factor and final-concentration figures against OpenStax's own
    5,000,000/50/10,000 numbers, plus a second non-round-number check; the electron-configuration
    Cr/Cu/Pd/La/U outer-electron-count arithmetic; the buffer-capacity β/β_max/percent-of-max figures
    for the acetic-acid-buffer worked example (reusing the exact 0.20/0.30 mol/L, pKa 4.76 scenario
    already on `pka-henderson-hasselbalch-calculator`'s own page) plus the from-scratch Van Slyke
    derivation; and the Beer-Lambert absorbance/transmittance worked example and all three reverse
    solves, plus a full SI-unit recomputation confirming the dimensionless result is unit-independent.
  - `npm test` (1,057 tests, up from 1,035), `npm run lint` clean, `npm run build` passes (275 static
    pages, up from 265). Two new `KNOWN_NON_FINITE` entries: `density-of-solutions-calculator`
    (`massPercent`, both masses 0 at their own min → 0/0) and `buffer-capacity-calculator`
    (`percentOfMax`, concentration 0 at its own min → 0/0). Snapshot diff is additive-only (196 new
    lines, 0 removed, confirmed with `git diff --stat`).
  - Fixed, before committing: two of `serial-dilution-calculator`'s own draft aliases ("serial
    dilution calculator", "dilution factor calculator") collided with aliases `dilution-calculator`
    already shipped in an earlier run — caught by a manual duplicate-alias sweep across every
    calculator (no automated test covers this), replaced with non-colliding phrasings before commit.
    That same sweep found two **pre-existing** collisions this run did not touch (`emi-calculator`/
    `mortgage-calculator`'s "house loan emi calculator", `solution-concentration-calculator`/
    `molarity-calculator`'s "solution concentration calculator") — not fixed, added to Parked.
  - Verified all 5 pages via the static HTML `next build` produced rather than curl: a pre-existing
    `next dev` process (PID on port 3000, not started by this run) was already running against this
    project directory when this run started, same recurring issue flagged in runs 4 and 5 — H1,
    exactly one JSON-LD script, and all eight section ids present on every page, all 5 ids linked
    correctly from `/en/categories/chemistry`, no "application error" text. No new dev server was
    started or left running by this run.
  - `chemistry` now 30 calculators, **244 total**.
- [x] Chemistry run 7 (5), branch `step/46-wave-3-chemistry-run-7`, PR #71 — **DONE (open, awaiting merge)** 2026-11-09:
  - [x] freezing-point-depression-calculator
  - [x] boiling-point-elevation-calculator
  - [x] vant-hoff-osmotic-pressure-calculator
  - [x] percent-composition-calculator
  - [x] faradays-law-electrolysis-calculator (swapped in for `molar-volume-stp-calculator` — see note below)
  - **Swap note**: `molar-volume-stp-calculator` was dropped per this file's own instruction to check
    for a near-duplicate first. `ideal-gas-law-calculator` (run 2) already ships the exact 22.414 L/mol
    (1 atm) vs 22.711 L/mol (IUPAC 100 kPa) distinction in its own content, AND already carries the
    alias `'molar volume at stp calculator'` — building a second page would collide on search intent
    and nearly on the alias itself. Faraday's law of electrolysis (m = ItM ÷ nF) was built instead,
    from this file's own candidate list.
  - `freezing-point-depression-calculator` and `boiling-point-elevation-calculator` (ΔT = K × m × i,
    4-variable closed-form solvers) deliberately reuse the exact same OpenStax benzene solution
    (0.33 mol/kg nonelectrolyte, Examples 11.9 and 11.7) as their primary worked examples, so both
    pages show the identical solute at the identical molality producing opposite effects (ΔTf = 1.7°C
    down vs ΔTb = 0.83°C up) with different solvent constants (Kf = 5.12 vs Kb = 2.53 °C·kg/mol) — the
    "same mathematical form, different constant and direction" framing the task asked for, shown with
    real numbers rather than just stated. Each page's FAQ/watch-out also cross-links to
    `molality-calculator` via the 17.9 mol/kg ethylene glycol antifreeze figure already on that page
    (OpenStax Example 11.3): boiling-point-elevation-calculator reuses OpenStax's own stated 109.2°C
    answer for that antifreeze's boiling point (Example 11.7's Check Your Learning) as a second,
    real-world-sourced figure.
  - `vant-hoff-osmotic-pressure-calculator` (Π = iMRT, 4-variable closed-form solver) reuses the exact
    R constant (8.31446261815324 J/(mol·K)) already used in `ideal-gas-law-calculator`/
    `arrhenius-equation-calculator`/`gibbs-free-energy-calculator`. Worked example is OpenStax's own
    0.30 mol/L glucose at body temperature (Example 11.10, 7.6 atm) — recomputed in full SI (R in
    J/(mol·K), T = 310.15 K exactly rather than OpenStax's own rounded 310 K) to confirm the same 7.6
    atm to the precision their own rounding supports. Bonus output: equivalent osmolarity (i × M, same
    SI-scale-aligned arithmetic `osmolarity-calculator` itself uses — no stray conversion factor),
    cross-linking to that calculator and to `molarity-calculator` per the task's instruction, with
    content stating the Π = osmolarity × R × T equivalent framing explicitly.
  - `percent-composition-calculator` is a type-B breakdown widget, same 4-element-slot pattern and
    `lib/atomicMasses.ts` reuse as `molar-mass-calculator`. Deliberately uses vitamin C (ascorbic acid,
    C₆H₈O₆) as its worked example — the exact compound `empirical-formula-calculator`'s own worked
    example starts from, run in the opposite direction (percent-composition-calculator: formula → mass
    percentages; empirical-formula-calculator: mass percentages → formula), with the two pages'
    numbers cross-checked against each other (40.92/4.58/54.50% here vs the cited 40.9/4.58/54.5%
    there). Cross-linked both ways with `molar-mass-calculator` and `empirical-formula-calculator`.
  - `faradays-law-electrolysis-calculator` (m = ItM ÷ nF) needed no new dimension — current, time,
    mass, molarMass, amountOfSubstance (bonus output), charge (bonus output), and count (the fixed
    electrons-per-ion input) all reused. `electrons` is a `fixed: true` solver variable with
    `min: 1` on its plain input (same device `titration-calculator`'s reaction coefficients use),
    which keeps the division always well-defined and avoids a 0/0 edge case entirely — no
    `KNOWN_NON_FINITE` entry was needed for this calculator. Worked example is OpenStax's own silver-
    plating problem (Example 17.9, 10.23 A for 1 hour, n = 1, 0.3817 mol e⁻). Recomputing at full
    precision (no intermediate rounding) gives 41.17 g rather than OpenStax's own stated 41.19 g — the
    two-hundredths-of-a-gram gap traced exactly to OpenStax rounding moles of electrons to 0.3817
    before multiplying (0.3817 × 107.9 = 41.185, which rounds up to 41.19; the unrounded calculation,
    0.381695 × 107.9 = 41.185 as well, rounds to 41.18–41.19 depending on precision carried, while this
    site's own 107.87 g/mol atomic-mass value gives 41.17) — stated explicitly in the page's own
    worked-example explanation as a rounding artifact, not a formula disagreement, same transparency
    precedent as run 5's Kc rounding note.
  - Osmotic pressure's `vant-hoff-osmotic-pressure-calculator`, the two colligative-property
    calculators, and Faraday's law all needed no `KNOWN_NON_FINITE` entry — every forward `compute()`
    is a pure product (no division), so it is always finite. `percent-composition-calculator` did need
    one (`percent1`-`percent4`, all four elements' contributions 0 at their own min → 0/0), the same
    `mole-fraction-calculator`/`molar-mass-calculator`-sibling pattern from earlier runs.
  - New `lib/units.ts` dimension: `molalConstant` (°C·kg/mol / K·kg/mol, factor 1 both — shares one
    dimension between Kf and Kb the same way `momentum` is shared by momentum-calculator and
    impulse-calculator). Round-trip + anchor test added to `lib/units.spec.ts` (water's Kf applied to
    the site's own 17.9 mol/kg antifreeze molality).
  - **Alias collision found and fixed before committing** (same manual sweep run 6 established):
    `percent-composition-calculator`'s draft aliases `'percent composition by mass calculator'` and
    `'percent by mass calculator'` both collided with aliases `mass-percent-calculator` already
    shipped in run 1. Replaced with `'elemental percent composition calculator'` and `'percent of each
    element in a compound calculator'` before commit. The sweep also re-confirmed run 6's two
    **pre-existing** collisions (`emi-calculator`/`mortgage-calculator`, `solution-concentration-
    calculator`/`molarity-calculator`) are untouched by this run — still on STATUS.md's Parked list.
  - Verification script: `verify_run7.mjs` (scratchpad) recomputed every number before the copy was
    written — both colligative-property worked examples, the osmotic-pressure glucose and hemoglobin
    examples, ascorbic-acid and glucose percent compositions, and the Faraday's-law silver and copper
    examples, including the Faraday constant itself (N_A × e = 96485.33212331001 C/mol, recomputed from
    the two exact 2019-redefinition constants, matching NIST CODATA's listed exact value).
  - `npm test` (1,076 tests, up from 1,057), `npm run lint` clean, `npm run build` passes (280 static
    pages, up from 275). No new `KNOWN_NON_FINITE` entries needed except `percent-composition-
    calculator` (see above). Snapshot diff is additive-only (205 new lines, 0 removed, confirmed with
    `git diff --stat`).
  - A pre-existing `next dev` process (PID on port 3000, not started by this run) was already running
    against this project directory, same recurring issue flagged in runs 4-6. Verified all 5 pages via
    the static HTML `next build` produced (`.next/server/app/en/calculators/<id>.html`) instead of
    curl: H1, exactly one JSON-LD script, and all eight section ids present on every page, all 5 ids
    linked correctly from `/en/categories/chemistry`, no "application error" text. No new dev server
    was started or left running by this run.
  - `chemistry` now 35 calculators, **249 total** once this PR merges.
  - **Visual-QA checkpoint note**: the site crossed 244 after run 6 — exactly 50 calculators past the
    last Chrome visual pass (194 calculators, 2026-11-05). The threshold is now hit; flagged for the
    main session to schedule, not run as part of this batch per the usual cadence (every ~10 batches).
- [x] Chemistry run 8 (5), branch `step/46-wave-3-chemistry-run-8`, PR #72 — **DONE (open, awaiting merge)** 2026-11-13:
  - [x] vapor-pressure-calculator
  - [x] rate-law-calculator
  - [x] oxidation-number-calculator
  - [x] molarity-molality-conversion-calculator
  - [x] calorimetry-enthalpy-calculator
  - **Scope decisions, before picking the 5**: confirmed `specific-gravity-calculator` would be a
    near-duplicate — `density-of-solutions-calculator` (run 6) already computes and shows specific
    gravity as a bonus figure, and already carries the alias `'specific gravity calculator'`, so it
    was dropped from consideration entirely rather than built and then collided. Electronegativity /
    bond-polarity was also considered but dropped: a real Pauling-scale lookup table has genuine value
    collisions (e.g. Si and Cu are both 1.90), which breaks this project's "select options keyed by
    the lookup value itself" pattern (`lib/atomicMasses.ts`'s `ELEMENT_OPTIONS`) — fixing that would
    need an index-keyed options redesign, judged not worth it for one calculator this run. The final 5
    (vapor pressure, rate law, oxidation number, molarity<->molality conversion, calorimetry) were all
    chosen because each reuses existing `lib/units.ts` dimensions with zero new lookup-table infra.
  - `vapor-pressure-calculator` (Clausius-Clapeyron, ln(P₂/P₁) = (ΔHvap/R)(1/T₁−1/T₂)) is a genuinely
    new formula shape for this wave — pressures inside a logarithm, solved for any of the 5 quantities
    (2 pressures, 2 temperatures, ΔHvap) with full closed forms for all five (even the two
    temperatures, since the log/reciprocal-temperature relationship rearranges cleanly). No new
    dimension needed: reuses `pressure`, `temperature`, and `molarEnergy` (the same dimension the
    Arrhenius equation and Gibbs free energy calculators use for Eₐ/ΔH). Cross-linked to
    `boiling-point-elevation-calculator` and `gibbs-free-energy-calculator` with a watch-out item
    distinguishing it from the ideal gas law (both use R and absolute T, different physical question).
  - `rate-law-calculator` (rate = k[A]ᵘ[B]ᵛ, the differential rate law) is explicitly distinct from
    `rate-constant-calculator`/`reaction-half-life-calculator` (both use the *integrated* first-order
    rate law) — content and a watch-out item state this on both sides, cross-linked both ways. Built
    as a type-B breakdown, not a solver, because k's physical units depend on the overall reaction
    order (u+v) — a fixed `dimension` field on k would be wrong for some orders and right for others,
    the same reasoning that made `equilibrium-constant-calculator` a breakdown rather than a solver.
    Reaction orders (u, v) are plain, unitless number inputs, following that exact precedent (plain
    `concA`/`coeffA`-style inputs, no `dimension` field). Its `compareBars` visual (current rate vs.
    rate if [A] doubles vs. rate if [B] doubles) directly demonstrates what each order means — a
    deliberate pedagogical addition beyond the equilibrium-constant precedent's own reactants/products
    framing. Worked example is OpenStax's own trial-1 row from Example 12.4's NO+O₃ initial-rates data
    table (fetched directly): rate = 2.20×10⁷ × 1.00×10⁻⁶ × 3.00×10⁻⁶ = 6.60×10⁻⁵ mol/(L·s), confirmed
    against the table's trial-4 row too (3.96×10⁻⁴) as an independent cross-check.
  - `oxidation-number-calculator` is a type-B breakdown applying OpenStax §17.1's own stated rule
    directly (fetched: "the sum of oxidation numbers for all atoms in a molecule is equal to the
    charge on the molecule") — up to 3 known elements' oxidation number × count, plus one unknown
    element's count, solved by isolating the unknown term. `unknownCount` is `min: 1` (never 0, so the
    division is always well-defined — same guard device as Faraday's law's `electrons` input), which
    is why this calculator needed no `KNOWN_NON_FINITE` entry at all. Worked example is OpenStax's own
    NO₃⁻ example (N = +5, fetched directly from §17.1); KMnO₄ (Mn = +7) and Cr₂O₇²⁻ (Cr = +6) were
    independently re-derived from the same rule in the verification script as FAQ cross-checks, not
    cited to a second source, since they are direct applications of the one already-cited rule.
  - `molarity-molality-conversion-calculator` (b = M ÷ (ρ − M×Mr)) bridges `molarity-calculator` and
    `molality-calculator` using a solution's density — a genuinely different question from either
    (re-expressing one known concentration in the other unit, not computing either from raw mass/
    volume). 4-variable closed-form solver reusing `concentration`, `molality`, `density`, and
    `molarMass` — zero new dimensions. `molarMass` is `fixed: true` (a property of the compound, not
    something being solved for), the same device Faraday's law uses for its own molar-mass input.
    Worked example is OpenStax's own Example 11.5 (glucose, 0.556 mol/L, density 1.04 g/mL, molar mass
    180.16 g/mol → 0.59 mol/kg, fetched directly) — confirmed both directions round-trip exactly in
    the verification script, including solving back for density and for molar mass.
  - `calorimetry-enthalpy-calculator` (ΔH = −(mcΔT) ÷ n) takes OpenStax's own q = mcΔT calorimetry
    equation (§5.2, fetched directly) one step further than the physics `heat-calculator` already on
    this site: flips the sign for the reaction (q_reaction = −q_solution) and divides by moles reacted
    to get a reusable, per-mole enthalpy figure — explicitly distinguished from `heat-calculator` in
    content and a watch-out item, since that page stops at q = mcΔT itself. 5-variable closed-form
    solver reusing `mass`, `specificHeat`, `temperatureDelta`, `amountOfSubstance`, and `molarEnergy` —
    zero new dimensions. Worked example is OpenStax's own Example 5.5 (HCl+NaOH neutralization, 100 g
    combined solution, ΔT = 6.9°C, 0.0500 mol reacted, fetched directly): carrying full precision gives
    ΔH ≈ −57.7 kJ/mol, while OpenStax's own answer of −58 kJ/mol comes from rounding q to 2.9×10³ J
    before dividing — stated explicitly in the worked-example explanation as a rounding artifact, the
    same transparency precedent as prior runs' Kc and Faraday's-law rounding notes.
  - All five formulas were fetched directly from OpenStax Chemistry 2e before writing any copy (never
    recalled from memory, per the project's "read sources directly" rule): §10.3 "Phase Transitions"
    (Clausius-Clapeyron, Examples 10.7 and 10.8), §12.3 "Rate Laws" (differential rate law and
    Example 12.4's full data table), §17.1 "Review of Redox Chemistry" (oxidation number rules and the
    NO₃⁻ example), §11.4 "Colligative Properties" (Example 11.5, molarity-to-molality via density —
    confirmed on the same page as the molality/osmotic-pressure content from earlier runs), and §5.2
    "Calorimetry" (q = mcΔT and Example 5.5). One minor cross-check gap, flagged rather than silently
    treated as fully verified: the independently recomputed benzene boiling point in Example 10.8
    (73.66°C) differs from OpenStax's own stated 73.8°C by about 0.1°C, traced to their own
    intermediate rounding — Example 10.8 is referenced only in passing in this page's content, with
    Example 10.7 (which round-trips to the exact published figure) as the actual worked example.
  - Independent scratch script (`verify_run8.mjs`, scratchpad) recomputed every number before the copy
    was written: the isooctane ΔHvap calculation and its P₂/T₁ round-trips; the benzene Example 10.8
    cross-check (flagged above); the NO+O₃ rate law trial-1 and trial-4 data points, plus the
    doubling-sensitivity figures for the compareBars visual; the NO₃⁻/KMnO₄/Cr₂O₇²⁻ oxidation-number
    checks; the glucose molarity<->molality conversion (both the step-by-step method and the closed-
    form SI equation, cross-checked against each other) and all three reverse solves; and the HCl+NaOH
    calorimetry ΔH calculation with all four reverse solves.
  - Manual alias-collision sweep (same discipline as runs 6-7) ran a script matching every one of this
    run's 25 new aliases against every alias already shipped site-wide: zero collisions found. The
    sweep also re-confirmed runs 6-7's two pre-existing, untouched collisions (`emi-calculator`/
    `mortgage-calculator`'s "house loan emi calculator" and `solution-concentration-calculator`/
    `molarity-calculator`'s "solution concentration calculator") are still unresolved and still on
    STATUS.md's Parked list — not touched by this run.
  - All 5 calculators' `compute()` returns only their solver's `defaultTarget` variable (or, for the
    two breakdown calculators, every declared output) — matching the established pattern that a
    solver's bonus `outputs` (here: vapor pressure has none; molarity<->molality's mass-percent bonus;
    calorimetry's heat-released bonus) are rendered by the live widget only, never duplicated into the
    snapshot-tested `compute()` return (confirmed against `ohms-law-calculator` and
    `ideal-gas-law-calculator` as precedent before writing the other three).
  - `npm test` (1,090 tests, up from 1,057 — note run 7's own count in this file, 1,076, was mid-review
    at the time it was written; 1,057 was the last confirmed-merged count going into this run),
    `npm run lint` clean, `npm run build` passes (285 static pages, up from 280). Three new
    `KNOWN_NON_FINITE` entries: `vapor-pressure-calculator` (`enthalpyVap`, all five inputs 0 at their
    own min → log(0/0) over Infinity−Infinity), `molarity-molality-conversion-calculator` (`molality`,
    molarity/density/molarMass all 0 → 0/0), and `calorimetry-enthalpy-calculator` (`enthalpy`, moles 0
    → divide by zero). `rate-law-calculator` and `oxidation-number-calculator` needed none — rate's
    0 × 0⁰ × 0⁰ = 0 × 1 × 1 = 0 stays finite (JS's `0 ** 0 === 1`), and oxidation number's unknownCount
    floor of 1 keeps that division always defined. Snapshot diff is additive-only (217 new lines, 0
    removed, confirmed with `git diff --stat`).
  - Verified all 5 pages from the static HTML `next build` produced
    (`.next/server/app/en/calculators/<id>.html`): H1, exactly 2 JSON-LD scripts (the site-wide norm,
    confirmed against `faradays-law-electrolysis-calculator` as a baseline), and all eight section ids
    (concept/how-to-use/formula/worked-example/watch-out/faq/references/related) present on every
    page; all 5 ids linked correctly from `/en/categories/chemistry` (3 occurrences each — nav card,
    related-calculator slot, and sitemap/internal link). No dev server was started or left running by
    this run (`npm run dev` was not needed — `next build`'s own static output was sufficient for
    verification), and port 3000 was confirmed free at the end.
  - `chemistry` now 40 calculators, **254 total** once this PR merges.
- [ ] Chemistry run 9 (5), branch `step/46-wave-3-chemistry-run-9`, PR TBD — **IN PROGRESS** 2026-11-13:
  - [ ] ksp-molar-solubility-calculator
  - [ ] isotope-notation-calculator
  - [ ] molecular-geometry-calculator
  - [ ] common-ion-effect-calculator
  - [ ] specific-heat-by-mixing-calculator
- [ ] Visual-QA checkpoint: due again once ~50 more calculators land after this wave (last pass was
  at 194 calculators, 2026-11-05 — see STATUS.md header; chemistry crossed the 244-calculator
  threshold after run 6, flagged for the main session to schedule — still not run as of this run)

**After physics and chemistry both close out (~121 calculators added this wave, ~440 site-wide):**
Wave 4 opens next, in this fixed order — **biology, then ecology, then fun/other** (per
`mdFiles/omni-strategy.md` §4.2 and STATUS.md decision D13) — followed by the small standalone
`tech` category (step 25, ~3 calculators: `ip-subnet-calculator`, `iban-calculator`,
`password-strength-checker` — `data-storage-converter` already shipped under measurements).
Per the working protocol, the Wave 4 step file gets written just-in-time when that step actually
starts, not now — see `mdFiles/calculator-rollout-plan.md` §4 "Wave 4" and
`mdFiles/omni-strategy.md`'s biology/ecology/fun-other candidate lists for the seed material when
that time comes.
