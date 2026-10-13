# Step 31 — Solver v2 (E3)

**Scope (from `STATUS.md`):** Numeric solve for variables with no closed form (loan rate), plus extra
outputs beside the auto field. Phase H step **E3**, after E2 (step 30).

**Spec:** `mdFiles/calculator-rollout-plan.md` §1 (type A), §2 (E3), §3 (batch tables),
`mdFiles/calculator-template-v2.md` §2.

---

## Why this step exists

Batches 1–5 (steps 35–39) convert 22 calculators to the type-A auto-solve widget. Today a
`CalculatorSolver` needs one closed-form `solve[id]` per variable, and the result card shows only
the solved field. That rules out:

- **rates with no closed-form inverse:** the loan, mortgage, EMI and car-payment rate, and the
  compound-interest/investment rate or years once there are regular contributions
- **derived figures beside the answer:** total interest and total paid on every loan
- **input-only fields:** the mortgage down payment and the tip split count are always typed and never
  `auto`

The step-30 notes also leave three widget fixes: the unit `<select>` for single-unit dimensions,
non-finite values (0 mpg → `Infinity`), and stating the percent convention clearly.

This step builds the engine and the widget only. **No calculator is converted.** `force-calculator`
must behave exactly as before.

---

## Design

### 1. Root finder: `lib/solve.ts`, no dependencies

`findRoot(f, { bounds?, guess?, maxIterations? })` returns `x` with `f(x) ≈ 0`, or `NaN`.

1. **Bracket.**
   - With `bounds: [lo, hi]`, sample `f` on a 100-interval grid and take the sign change closest to
     `guess`. The grid is geometric when `0 < lo` and `hi / lo > 100`, so it also works for ranges
     that span orders of magnitude. Points where `f` is `NaN` or infinite are skipped.
   - Without bounds, expand outward from `guess` (default 1) by doubling the step until the sign
     changes, up to a span of about 1e15.
   - A sample where `f` is exactly 0 is returned as the root.
2. **Brent's method** on the bracket: inverse quadratic interpolation and the secant step, with
   bisection as the safe fallback. Capped at `maxIterations` (default 100), with a relative tolerance
   of about 1e-12. If `|f|` at the converged point is larger than at both ends of the bracket, it
   was a pole, not a root, so return `NaN`.
3. **Newton fallback** when no bracket exists, e.g. a double root that touches zero without crossing.
   Run it from `guess` with a central-difference derivative and the same iteration cap. It is
   accepted only if it converges, stays inside `bounds`, and `|f(x)|` is negligible
   (≤ 1e-9 × the scale of `f` at the guess). Otherwise return `NaN`.

Deterministic: no randomness and no time limits, so the same inputs always give the same output.

### 2. API additions in `data/calculators.ts`

```ts
SolverVariable += {
  fixed?: true;              // always an input, never auto
  bounds?: [number, number]; // numeric-solve search range, SI base units
  guess?: number;            // numeric-solve start, SI (default: defaultValue in SI)
}
CalculatorSolver += {
  solve?: Record<string, (si) => number>; // now optional, and may leave variables out
  equation?: (si) => number;              // residual: 0 when the variables are consistent
  outputs?: SolverOutput[];
}
SolverOutput = { id, label, dimension, unit?, compute(si) => number } // si includes the solved value
```

- A variable with a `solve[id]` entry uses it. One without falls back to
  `findRoot(x => equation({ ...si, [id]: x }), { bounds, guess })`.
- **Percent is the percent number** (5 means 5%) in `solve`, `equation`, `bounds`, `guess` and
  `outputs`. The functions divide by 100 themselves. Doc comments on the types say so.
- `solve` keeps the `Record<string, …>` type (not `Partial`), so `solver.solve!.force(...)` in the
  existing spec still type-checks.

### 3. Solver state: `lib/solverState.ts` (pure, unit-tested)

The logic moves out of `SolverCalculator.tsx` into plain functions:

- `initialState(solver)`, `readShareParams(solver, fallback, search)`, `shareParams(solver, state)`
- `editOrder(order, id)`: moves an edited, rotatable id to the end. `order` lists only the
  **non-fixed** variables, so editing a `fixed` field leaves it alone, and the auto field is always
  `order[0]`.
- `solveState(solver, state)` → `{ target, result, si, outputs }`. An input that is blank, not a
  number, or **not finite in SI** (0 mpg → `Infinity`) means no answer. So does a result that is not
  finite (divide by zero, no root). Outputs are `NaN` whenever the result is.
- `parse`, `plain`: moved unchanged.

For `force-calculator` the functions produce exactly the old state, order and share link
(`?solve=…&<id>=…&<id>_unit=…`). `readShareParams` ignores `?solve=` naming a fixed variable.

### 4. Widget changes: `components/SolverCalculator.tsx`

- Uses `lib/solverState.ts`. No change to the markup or classes for a multi-unit field.
- **Single-unit dimensions** (percent, count, currency) show the unit as inline text the same width
  as the `<select>` (`%`, nothing, `¤`) and no menu.
- A `fixed` field never gets the `auto` badge.
- **Outputs** render under the main result as label/value rows, in their units. Currency rounds to
  cents; everything else uses `formatSignificant`.
- Non-finite conversions are dropped from the alternatives line and never shown as "Infinity".
- The "no answer" hint stays the same for closed-form solvers. A solver with an `equation` adds
  "Some combinations have no answer."

### 5. Tests

- `lib/solve.spec.ts`: the root finder on known equations (√2, cos x = x, a cubic, a root at a bound,
  no-bounds expansion, Newton on a double root, the iteration cap); `NaN` with no root and at a pole;
  a test-only **amortized loan fixture** (payment = P·r/(1−(1+r)^−n), monthly r) solving the rate from
  P = 200,000, n = 360, payment = 1,199.10 (≈ 6.00% APR), round-tripping with the closed-form payment;
  **compound interest with monthly contributions**, solving years and rate numerically; and the
  extra-outputs computation (total paid, total interest) through `solveState`.
- `lib/solverState.spec.ts`: rotation with and without `fixed`, the auto field, share-link
  round trip and format for `force-calculator`, non-finite inputs, and a data check that every
  shipped `solver` is well-formed (the default target isn't fixed, and every non-fixed variable has a
  `solve` entry or the solver has an `equation`).
- No `test*` file names (`.gitignore`). The step-17 snapshot stays unchanged.

---

## Acceptance checks

1. `npm test` passes without `test:update`. `data/calculators.spec.ts.snapshot` is unchanged.
2. `npm run build` and `npm run lint -- --ignore-pattern ".open-next/**"` pass.
3. `npm run start`: `/calculators/force-calculator` renders the 3 fields and the AUTO badge.
4. The `force-calculator` entry in `data/calculators.ts` is unchanged. No new dependency.
5. `calculator-template-v2.md` §2 and the `add-calculator` skill document `equation`/`bounds`,
   `outputs` and `fixed`.
