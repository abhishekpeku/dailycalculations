# Step 33 — Type-B breakdown widget (E5)

## Progress

- [x] Step file, draft PR
- [x] Config types (`CalculatorBreakdown`, input `dimension`/`unit`) in `data/calculators.ts`
- [ ] `lib/breakdown.ts` + `lib/breakdown.spec.ts`
- [ ] `components/BreakdownCalculator.tsx` + page wiring
- [ ] `paint-calculator` and `tip-calculator` converted (config only)
- [ ] Build, lint, test, curl checks
- [ ] Docs (template §2, add-calculator skill), STATUS.md, PR ready

Resume from the first unchecked box.

**Scope (from `STATUS.md`):** `BreakdownCalculator` replaces `CalculatorForm`. Phase H step **E5**,
after E4 (step 32).

**Spec:** `mdFiles/calculator-rollout-plan.md` §1 (type B) and the type-B rows of §3,
`mdFiles/calculator-template-v2.md` §2.

---

## Why this step exists

26 of the existing calculators are type B (many inputs flowing forward into several outputs, no
single inverse). Today they render through `CalculatorForm`: a flat grid of inputs and a grid of
equal-weight boxes whose labels are prettified compute keys. The v2 template wants the iOS look of
`SolverCalculator`: grouped inset rows, a result card with one headline number, a breakdown and one
visual, plus share / copy / reset. The batches (steps 35–39) convert calculators by adding config,
so the widget must exist first.

This step builds the widget and proves it on **exactly two** calculators: `paint-calculator` and
`tip-calculator`. No content rewrites, no compute changes.

---

## Compatibility choice: opt-in, `CalculatorForm` stays as the fallback

A calculator renders `BreakdownCalculator` only when it sets `breakdown`. Everything else keeps
`CalculatorForm`, byte for byte.

Why not derive defaults for everyone: the brief requires every other calculator to look the same
as before. Deriving a headline from the first output would silently restyle 40+ pages whose first
output is often not the headline (and whose labels are prettified keys), before anyone checked
them. Opt-in lets each batch convert a calculator deliberately, with its content. When the last
type-B calculator is converted, `CalculatorForm` is deleted (park it for the end of step 39).

Inside a `breakdown` config, defaults still apply so the config stays short: missing output labels
are prettified from the compute key, `outputs` defaults to every compute key except the headline,
and `groups` defaults to one group holding every input.

---

## Design

### Config (`data/calculators.ts`)

On `CalculatorInput` (both optional; any calculator may set them, only the new widget reads them):

- `dimension?: UnitDimension` and `unit?: string`: the unit `compute()` expects. The widget shows a
  unit menu from `lib/units.ts` and converts the typed value into `unit` before calling `compute`,
  so compute functions never change. Without a dimension, today's `type` decides the suffix
  (`currency` → `¤` prefix, `percent` → `%`, `number` → none).

New `CalculatorConfig.breakdown?: CalculatorBreakdown`:

| Field | Meaning |
|---|---|
| `headline` | Compute key of the big accent number. |
| `headlineLabel?` | Default: that output's label. |
| `outputs?` | `BreakdownOutput[]`: the order, labels and formats of the rows under the headline, and of the headline itself if listed. Default: every other compute key, prettified. |
| `groups?` | `{ title?, inputs: string[], optional?: true }[]`. Optional groups sit behind a "More options" disclosure (their defaults still apply). Inputs not listed in any group go into a trailing untitled group. |
| `visual?` | `BreakdownVisual`: `{ type: 'donut', segments, center, centerSub? }` or `{ type: 'compareBars', bars, title?, highlight? }`. Each part is `{ from, label? }`, where `from` is a compute key or an input id (display values, not SI). |

`BreakdownOutput` is `{ id, label?, format?: 'number' | 'integer' | 'currency' | 'percent', dimension?, unit?, alsoIn?: string[] }`.
`dimension` + `unit` print the unit after the value; `alsoIn` lists other unit ids the headline is
also shown in (e.g. gallons → litres).

Only Donut and CompareBars are wired here, because they are what the two proof calculators need and
they take plain numbers. The batches add RangeBar / Timeline / AmortizationTable variants to
`BreakdownVisual` when their first calculator needs one (Timeline needs `today` after mount).

### Pure logic (`lib/breakdown.ts`)

- `prettify(key)`: `gallonsWithBuffer` → `Gallons with buffer`.
- `resolveBreakdown(calculator, outputKeys)`: fills the defaults above → `{ headline, rows, groups }`.
- `initialBreakdownState(inputs)` / `computeValues(inputs, state)`: raw strings + units → numbers in
  each input's `unit`.
- `breakdownShareParams` / `readBreakdownShareParams`: `?<id>=<value>&<id>_unit=<unit>`, only values
  that differ from the default. Unknown ids, non-numbers and unknown units are ignored.
- `formatOutput(value, output)`: currency rounded to cents with the `¤` placeholder, the same as
  `SolverCalculator`; percent with `%`; otherwise 4 significant figures (`integer`: rounded).
- `visualData(visual, values, labelOf)`: the parts with labels and numbers, ready for the component.

### Widget (`components/BreakdownCalculator.tsx`)

Same shell as `SolverCalculator`: `#F2F2F7` card, white inset groups with hairline dividers, label
left, input + unit right. Result card: accent gradient, "Result" kicker, the headline label and a
big accent number, the `alsoIn` conversions, then a `<dl>` of rows, then the visual slot. Buttons:
Share result (writes the query string with `history.replaceState` and copies the URL), Copy result
(headline label + value), Reset. Share params are read in a `useEffect`, after hydration; the page
stays `force-static` and the canonical is unchanged.

`timeDependent`: values show `—` and the visual is hidden until mount, as in `CalculatorForm`.

### Proof calculators

- **paint-calculator**: groups Room (length, width, height; ft, with a unit menu), Doors and windows,
  and an optional Paint group (coats, coverage). Headline `gallonsWithBuffer` (gal, also in L),
  rows for the rest. Visual: CompareBars of walls / walls + 10% / ceiling gallons. The three length
  labels lose their "(ft)" suffix, since the unit menu shows it now.
- **tip-calculator**: headline `tipAmount`, rows total and per person. Visual: Donut bill vs tip,
  centered on the total.

The plan lists tip as type A; it is used here only to prove the type-B widget on a currency
calculator. Batch 2 may still convert it to a solver.

---

## Tests

`lib/breakdown.spec.ts`: label prettifying and defaults, share-param round trip and rejection of bad
params, unit conversion of inputs (3 m → ft), output formatting, visual data mapping (outputs and
inputs both resolve). `npm test` passes with the step-17 snapshot unchanged.

## Acceptance

- `npm test`, `npm run build`, `npm run lint` pass.
- `/calculators/paint-calculator` and `/calculators/tip-calculator` render the new widget with a
  headline and a visual; `/calculators/bmi-calculator` still renders `CalculatorForm`;
  `/calculators/pregnancy-due-date-calculator` still shows the `—` placeholder.
- Template §2 documents the type-B config; the add-calculator skill step 2 mentions it.
