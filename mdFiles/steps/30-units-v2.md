# Step 30 — Units v2 (E2)

**Scope (from `STATUS.md`):** Length, area, volume, time, speed, temperature (affine), energy, power,
pressure, data, fuel economy (inverse). Phase H step **E2**, after E1 (step 17).

**Spec:** `mdFiles/calculator-rollout-plan.md` §2 (E2) and §3 (which calculators need which units),
`mdFiles/calculator-template-v2.md` §2.

---

## Why this step exists

Batches 1–5 (steps 35–39) convert 22 calculators to the type-A auto-solve widget, and every
`SolverVariable` needs a `dimension`, including money, percentages and plain counts. Today
`lib/units.ts` has only mass, acceleration and force, and its model is `value × factor`.
Temperature (affine) and fuel economy (L/100 km is the reciprocal of mpg) don't fit that model.

This step only builds the unit library. **No calculator is converted.** `force-calculator` must
behave exactly as before.

---

## Design

### 1. Conversion model

A `Unit` is `{ id, label }` plus **one** of:

| Form | Fields | `toBase(v)` | `fromBase(b)` | Used by |
|---|---|---|---|---|
| Factor | `factor` | `v × factor` | `b ÷ factor` | almost everything |
| Affine | `factor`, `offset` | `(v + offset) × factor` | `b ÷ factor − offset` | °C, °F, °R |
| Function pair | `toBase`, `fromBase` | custom | custom | inverse fuel-economy units |

The offset is applied **before** the factor, so both offsets are exact in decimal:
°C = `{ factor: 1, offset: 273.15 }`, °F = `{ factor: 5/9, offset: 459.67 }`.
An `inverse(k)` helper builds the pair `v ↦ k / v` for reciprocal units.

The exported `UNITS`, `findUnit`, `toBase(value, dimension, unitId)` and
`fromBase(value, dimension, unitId)` keep their signatures, so `SolverCalculator.tsx` is unchanged.
The old `Unit.toBase: number` field becomes `factor`. Nothing outside `lib/units.ts` read it.

For a pure factor unit, `toBase` and `fromBase` still compute exactly `v * factor` and `b / factor`,
so mass, acceleration and force give bit-identical results.

### 2. Base units: the first unit of every dimension, factor 1

| Dimension | Base | Note |
|---|---|---|
| length | m | |
| area | m² | |
| volume | m³ | |
| time | s | month = year ÷ 12, year = Julian year (365.25 d) |
| speed | m/s | |
| temperature | K | |
| energy | J | cal = thermochemical (4.184 J), Btu = International Table |
| power | W | hp = mechanical (550 ft·lbf/s), PS = metric hp |
| pressure | Pa | mmHg/inHg conventional (13.5951 g/cm³ × g₀) |
| data | bit | so every data factor is an integer |
| fuel economy | **m³/m** | volume per distance. SI-coherent: `volume = distance × economy`, no constant needed in a solver. L/100 km is then a plain factor; mpg (US/UK) and km/L are `inverse()` units. |
| percent | % | base is the percent number (5 means 5%); solvers divide by 100 themselves |
| count | (empty label) | plain number |
| currency | `¤` placeholder | step 18 / E6 sets the symbol and formatting from the region |

Fuel economy of 0 maps to `Infinity` and back to 0. A solver rejects that itself, the same way it
rejects divide-by-zero today.

### 3. Factors

Exact by definition where they are (in = 0.0254 m, lb = 0.45359237 kg, US gal = 3.785411784 L,
imperial gal = 4.54609 L, cal = 4.184 J, atm = 101325 Pa, nmi = 1852 m, g₀ = 9.80665 m/s²). Derived
units are written as expressions of those constants (ft³ = 0.3048³, psi = lbf ÷ in²), so they stay
exact to floating point. Everything else comes from NIST SP 811 Appendix B. One source comment per
dimension.

Units per dimension: the US/UK/EU/IN/AU sets from the step brief. Volume adds the metric cup, tbsp
and tsp (250 / 15 / 5 mL) used in UK/AU/IN recipes. Area adds acre and hectare for land. Data has
decimal (KB = 1000 B) **and** binary (KiB = 1024 B) units.

**Not added:** stone, to mass. That would change the force-calculator unit menu. It goes in with batch 2
(`pounds-to-kilograms-converter`). Australian 20 mL tablespoon: not added; noted in Parked.

### 4. Tests: `lib/units.spec.ts`, no new dependency

- `node:test` + Node 24 type stripping, same as step 17. `lib/units.ts` has no imports, so it loads
  directly. `npm test` / `test:update` globs widen to `"{data,lib}/**/*.spec.ts"`.
- The name avoids the `.gitignore` `test*` pattern. Confirm with `git check-ignore -v`.
- Checks:
  - every dimension's first unit is its base (factor 1, no offset), and unit ids are unique per dimension
  - round-trip `fromBase(toBase(x)) ≈ x` for every unit at several values (relative 1e-12)
  - anchors: 32 °F = 0 °C = 273.15 K; 100 °C = 212 °F; −40 °C = −40 °F; 1 mi = 1.609344 km;
    1 US gal = 3.785411784 L; 1 imp gal = 4.54609 L; 30 mpg US ≈ 7.84 L/100 km; 1 hp ≈ 745.7 W;
    1 psi ≈ 6894.76 Pa; 1 KiB = 1024 B; 1 KB = 1000 B; 1 kWh = 3.6 MJ; plus a few more
  - mass/acceleration/force factors are pinned at their step-29 values, and `toBase`/`fromBase`
    equal `v * factor` / `v / factor` exactly (the force-calculator guarantee)
  - `findUnit` falls back to the first unit for an unknown id

---

## Acceptance checks

1. `npm test` passes. The step-17 snapshot file is unchanged (`git status` clean after the run).
2. `git check-ignore -v lib/units.spec.ts` prints nothing.
3. `npm run build` passes. `npm run lint -- --ignore-pattern ".open-next/**"` passes.
4. `components/SolverCalculator.tsx` and the `force-calculator` entry are unchanged.
5. No new dependency in `package.json`.
6. `calculator-template-v2.md` §2 describes the new conversion model.
