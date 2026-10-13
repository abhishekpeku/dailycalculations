# Step 17 — Compute snapshot tests (E1)

**Scope (from `STATUS.md`):** Pure-function tests over all `compute()` functions. **Must land before
step 18.** In Phase H this is **E1**, the first step of the v2 rollout.

**Spec:** `mdFiles/instructions.md` §4.6 ("No tests"), `mdFiles/calculator-rollout-plan.md` §2 (E1).

---

## Why this step exists

Every one of the 54 calculators is about to be rewritten twice: once into the v2 widgets (solver,
breakdown calculator, units v2) and once by the region-formatting refactor (step 18). Both touch every
calculator's code path. The `compute()` functions are pure — numbers in, numbers out — so the cheapest
possible regression net is to pin down what they return **today**, before anything moves.

These snapshots record current behavior, bugs included. **This step does not fix calculator math.**
Anything that looks wrong goes to `Parked` in `STATUS.md`.

---

## Design

### 1. Runner — no new dependencies

- Node's built-in `node:test` + `node:assert`, run on **Node 24's native TypeScript type stripping**.
  `data/calculators.ts` loads directly: its only import (`import type { UnitDimension } from
  '@/lib/units'`) is type-only and is erased, so the `@/` alias never reaches Node's resolver, and the
  file uses no non-erasable syntax (no enums, namespaces, parameter properties).
- Snapshots use the **built-in** `t.assert.snapshot` (stable in Node 24, no flag). The snapshot file
  is written next to the test as `data/calculators.spec.ts.snapshot`. A missing or changed snapshot
  fails the run; `--test-update-snapshots` rewrites it.
- Scripts in `package.json`:
  - `npm test` → `node --test "data/**/*.spec.ts"`
  - `npm run test:update` → same with `--test-update-snapshots`

### 2. File location — mind `.gitignore`

`.gitignore` has a bare `test*` pattern (it hides `test_reports_google/`). It matches **any** path
segment starting with `test`, so a `tests/` folder or `test-*.ts` file would be silently untracked.
The test therefore lives at **`data/calculators.spec.ts`**, next to the module it tests. `.gitignore`
is not edited; confirm with `git check-ignore -v` that both files are tracked.

### 3. TypeScript and the Next build

The spec imports `./calculators.ts` **with** the extension (Node ESM needs it). `tsc` rejects that
unless **`allowImportingTsExtensions: true`** is set, so it is added to `tsconfig.json`. It is a
type-check-only flag (legal because `noEmit` is already `true`); webpack/SWC ignore it, so app output
is unchanged.

The alternative, excluding `**/*.spec.ts` from `tsconfig.json`, was tried and rejected: ESLint runs
with `parserOptions.project: './tsconfig.json'` and fails with *"file was not found in any of the
provided project(s)"*, so it would have needed a second ESLint config block as well. Keeping the spec
in the project also means `next build` type-checks it.

`@types/node` is 20.x, whose `TestContextAssert` predates `snapshot()`. Rather than bump a dev
dependency, the one call site casts `t.assert` to `{ snapshot(value: unknown): void }`. Nothing
imports the spec, so it is never bundled.

### 4. Input sets — generated, deterministic

For every calculator, three input sets are built from its `inputs` array, so a new calculator is
covered with no test edits:

| Set | Rule |
|---|---|
| `default` | every input at `defaultValue` |
| `typical` | numeric defaults **× 1.5**, rounded to the input's `step`, floored at `min`. Calendar/clock fields are **shifted, not scaled** so they stay valid: year +1, month → next month, day +9 (capped at 28), hour +3 (mod 24), minute +15 (mod 60). Calendar fields are ids ending in `Year`/`Month`/`Day` not preceded by `Per` (so `daysPerMonth`, `payPeriodsPerYear` scale normally). |
| `edge` | every input at its `min`, or `0` when it has none |

Each snapshot holds `{ inputs, outputs }` for all three sets, so a reviewer sees what produced a number.

The `typical` set is a regression net, not a realism check: ×1.5 produces some implausible values
(`weeksPerYear` 72, `daysPerMonth` 33, a 6.0 GPA grade). They are still deterministic and still
exercise the code, which is all a snapshot needs.

### 5. Assertions

- **Snapshots** — one test per calculator with a non-empty `compute()` result.
- **Floating point** — outputs are rounded to **10 significant digits** (`Number(v.toPrecision(10))`,
  `-0` normalized to `0`) before snapshotting, so a harmless refactor that changes the 16th digit does
  not churn the file. Non-finite values are stored as the strings `"NaN"`, `"Infinity"`, `"-Infinity"`.
- **Finiteness** — every output in `default` and `typical` must be finite. `edge` outputs must be
  finite **except** entries in an explicit `KNOWN_NON_FINITE` map (calculator id → output keys), which
  documents current behavior and is itself asserted exactly, so a fix or a new NaN both fail the test.
- **Custom tools** — `currency-converter`, `character-counter`, `hashtag-counter`, `pomodoro-timer`,
  `timezone-meeting-planner` must return `{}`, and they must be the *only* calculators that do.
  (`gpa-calculator` has a custom component but a real `compute`, so it is snapshotted.)
- **`force-calculator` solver** — `solve.force / mass / acceleration` against hand-checked values
  (m = 1500, a = 2.78 → F = 4170; F = 6000, m = 2000 → a = 3; F = 4170, a = 2.78 → m = 1500), plus
  divide-by-zero → `NaN` for `mass` (a = 0) and `acceleration` (m = 0).
- **Meta** — the number of calculators snapshotted equals the number with a non-empty `compute()`, and
  snapshotted + custom tools = all calculators. Nothing is silently skipped.

---

## Acceptance checks

1. `npm test` passes; a second run passes with **no** change to the snapshot file (`git status` clean).
2. `git check-ignore -v data/calculators.spec.ts data/calculators.spec.ts.snapshot` prints nothing
   (both tracked).
3. `npm run build` passes (spec type-checked, not bundled).
4. `npm run lint -- --ignore-pattern ".open-next/**"` passes.
5. No new dependency in `package.json`.
6. Any suspicious math found while reading the snapshots is in `Parked`, not fixed.
