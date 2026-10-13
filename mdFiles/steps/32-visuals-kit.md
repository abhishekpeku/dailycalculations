# Step 32 — Result visuals kit (E4)

**Scope (from `STATUS.md`):** RangeBar, Donut, Timeline, AmortizationTable, LogScale (generalized),
CompareBars. Hand-rolled SVG. Phase H step **E4**, after E3 (step 31).

**Spec:** `mdFiles/calculator-rollout-plan.md` §2 (E4) and the "Result visual" column of the §3
tables, `mdFiles/calculator-template-v2.md` §2.

---

## Why this step exists

The batch tables in the rollout plan give almost every converted calculator a result visual: a Donut
for principal vs interest (loan, mortgage, EMI, car payment) and for budget splits (paycheck, commute,
travel budget, freelancer rate), an amortization table for every loan, a RangeBar for BMI and
engagement rate, CompareBars for EV vs gas, unit price, inflation and raises, and a Timeline for
pregnancy, date difference and the 180-day visa window. Today the only visual is the force-only
`LogScale` inlined in `SolverCalculator.tsx`. The batches must not each draw their own.

This step builds the kit only. **No calculator is converted.** The only change to a live page is that
`force-calculator` renders its scale through the shared `LogScale`, and it must look the same.

---

## Design

### Rules for every visual

- **No chart library and no new dependency.** Inline SVG plus Tailwind.
- **Pure helpers** in `lib/visuals.ts` (scales, donut arcs, band lookup, bar widths) and
  `lib/amortization.ts` (the schedule). Components only lay out what the helpers return, so the math
  is unit-tested with `node:test`.
- **`accent` is a prop** (a `#RRGGBB` category color from `TILE_COLORS[…][1]`). It is used for fills
  and markers only. Text and tracks use slate classes with `dark:` variants, so the visual reads in
  both themes. Translucent tints are made by appending a hex alpha to the accent.
- **Accessible.** The drawing has `role="img"` and an `aria-label` that states the result in words
  (overridable with `summary`). Where the visible text does not already carry the data, a `sr-only`
  list or table repeats it.
- **No layout shift and 360 px safe.** Fixed heights, percentage widths, and labels that wrap
  instead of overflowing. Nothing measures the DOM.
- **Server-safe.** No hooks except `AmortizationTable`'s toggle, and no clock or `window` reads.
  `Timeline` takes `today` as a prop: the caller passes it after mount (see the step-31 fix for
  `timeDependent`). Formatting functions are optional props with plain defaults.

### Components (`components/visuals/`)

| Component | Props |
|---|---|
| `LogScale` | `value`, `min`/`max` (powers of ten), `ticks: string[]` (spread evenly under the track), `benchmarks: {label, value}[]`, `accent`, `title?`, `valueLabel?`, `summary?` |
| `RangeBar` | `bands: {label, min, max, color?}[]` (contiguous, ascending), `value`, `accent`, `title?`, `valueLabel?`, `format?`, `summary?` |
| `Donut` | `segments: {label, value, color?}[]` (2–6), `accent`, `centerLabel`, `centerSub?`, `format?`, `summary?` |
| `CompareBars` | `bars: {label, value, color?}[]` (2–4), `accent`, `title?`, `highlight?` (index), `format?`, `summary?` |
| `Timeline` | `start`, `end` (any numeric axis: days or ms), `phases?: {label, from, to}[]`, `milestones?: {label, at}[]`, `today?`, `startLabel?`, `endLabel?`, `accent`, `title?`, `summary?` |
| `AmortizationTable` | `principal`, `annualRate` (percent number), `months`, `payment?`, `format?`, `initialYears?` (default 5) |

`LogScale` keeps the step-31 markup (an HTML gradient track with positioned markers), so the force
result is pixel-identical. Its tick labels are spread evenly, as before. Choose evenly spaced
exponents for them.

### Helpers

- `clamp`, `linearPosition(v, min, max)` and `logPosition(v, minExp, maxExp)` return 0–100, clamped,
  or `NaN` for an unplottable value (non-finite, or ≤ 0 on a log scale).
- `donutSegments(values)`: non-finite and negative values count as 0. The sweeps sum to 360° when the
  total is > 0, and are all 0 otherwise. `arcPath` draws a ring segment, and a full 360° ring as two
  half arcs (an SVG arc whose ends coincide draws nothing).
- `findBand(bands, v)`: the lower bound is inclusive and the upper exclusive (BMI 25.0 is
  "overweight"). Below the first band it clamps to the first, at or above the last band's `max` to the
  last, and `NaN` gives `-1`.
- `barWidths(values)`: percent of the largest value. Negative and non-finite values count as 0.
- `amortizationSchedule(principal, annualRate, months, payment?)`: monthly iteration, rolled up into
  yearly rows `{year, interest, principal, balance}`. The last payment is trimmed so the balance ends
  at exactly 0 and the principal column sums to the loan.

---

## Tests

`lib/visuals.spec.ts` and `lib/amortization.spec.ts` (never `test*` names, because of `.gitignore`):

- the donut sweeps sum to 360°, with zero and negative values handled
- log and linear positions, clamping, and `NaN` for unplottable values
- band lookup exactly at the boundaries and outside the range
- $200,000 at 6% for 30 years: payment $1,199.10, year-1 interest ≈ $11,933.19, ending balance 0,
  and principal sum $200,000. (The brief said $11,933.85. The closed form 12M − (P − B₁₂) and a
  cent-rounded schedule both give $11,933.19.)

## Acceptance

- `npm test` passes, and the step-17 snapshot is unchanged (no `test:update`).
- `npm run build` and `npm run lint` pass.
- `/calculators/force-calculator` still renders the scale, with the same title, ticks and benchmarks.
- No public demo page, and no other calculator converted.
- `mdFiles/calculator-template-v2.md` §2 documents which visual to use when.

## Also in this step (workflow change from the user)

One background agent at a time, with batches strictly in sequence. The main session merges each
passing PR without asking. This updates D11, the Phase H note, rollout plan §5/§6, the add-calculator
skill step 10 and `.claude/agents/calculator-builder.md`.
