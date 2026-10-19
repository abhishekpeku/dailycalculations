# Step 33 — Type-B breakdown widget (E5)

## Progress

- [x] Step file, draft PR
- [ ] Shared widget parts extracted from `SolverCalculator` (card, field row, result panel, output rows, share/copy/reset bar); force page HTML unchanged
- [ ] Config types (`CalculatorBreakdown`, input `dimension`/`unit`) in `data/calculators.ts`
- [ ] `lib/breakdown.ts` + `lib/breakdown.spec.ts`
- [ ] `components/BreakdownCalculator.tsx` + `components/BreakdownVisual.tsx`; page renders it for every former `CalculatorForm` calculator; `CalculatorForm` deleted
- [ ] Demo config on `commute-cost-calculator`
- [ ] Build, lint, test, rendered-HTML checks
- [ ] Docs (template §2, add-calculator skill), STATUS.md, PR ready

Resume from the first unchecked box.

**Scope (from `STATUS.md`):** `BreakdownCalculator` replaces `CalculatorForm`. Phase H step **E5**,
after E4 (step 32).

**Spec:** `mdFiles/calculator-rollout-plan.md` §1 (type B) and the type-B rows of §3,
`mdFiles/calculator-template-v2.md` §2.

**Supersedes** the paused attempt on `step/33-breakdown-widget` (draft PR #6, 2026-10-13). That
attempt made the widget opt-in and kept `CalculatorForm` as the fallback. The brief for this run is
different: every calculator `CalculatorForm` rendered now renders through `BreakdownCalculator`, and
at most one calculator gets a demo config. Its `lib/breakdown.ts` logic is reused here.

---

## Why this step exists

26 existing calculators are type B (many inputs flowing into several outputs, no single inverse),
and about 20 more type-A ones still render through `CalculatorForm` until their batch converts them
to a solver. `CalculatorForm` is a flat grid of inputs and equal-weight boxes labelled with
prettified compute keys. The v2 look is `SolverCalculator`'s: inset grouped rows, a result card with
one headline number, a breakdown and one visual, plus share / copy / reset in the category accent.
The batches (35+) convert calculators by adding config, so the widget and its config shape land first.

---

## Decisions

1. **`CalculatorForm` is deleted, no shim.** The page's fallback branch renders
   `BreakdownCalculator` instead; nothing else imported it. A shim would be dead code.
2. **`breakdown` config is optional.** Without it the widget derives a sensible default, so every
   former `CalculatorForm` page works with zero config: headline = the first compute key, rows = the
   rest, one untitled input group, no visual. Labels are the compute key in sentence case.
   Currency detection keeps `CalculatorForm`'s exact rule (a currency input with the same id, or the
   key contains `Amount` / `Cost` / `Payment` / `Interest` / `Principal`), so no figure changes from
   money to plain number or back.
3. **Computed results don't change.** The widget calls the same `compute()` with the same numbers.
   Inputs with a `dimension` convert the typed value into the input's `unit` (the one `compute()`
   expects) first, so compute functions never change. A blank or non-numeric field shows `—` for
   every result instead of computing with 0 (the old `Number('')`).
4. **Shared parts, not copies.** Card shell, field row (input + unit menu / inline unit), result
   panel, output rows, and the share / copy / reset bar (with its notice) move out of
   `SolverCalculator` into `components/CalculatorWidget.tsx`. Both widgets use them. The force page's
   rendered widget markup must stay byte-identical.
5. **Display formats**: `currency` (cents, via `lib/calculator.ts`), `percent`, `integer`,
   `number` (grouped, up to 2 decimals: no compact "4.2K", which reads wrong next to a unit and
   drops digits) and `significant` (4 significant figures, for science). Currency goes through
   `lib/calculator.ts` (`formatFull(…, { currency: true })`, `currencySymbol()`), so step 18 makes
   it region-aware in one place. Today that is `$`, exactly as `CalculatorForm` showed it.
6. **`derive`** (optional): extra display-only figures computed from inputs + outputs (e.g. monthly
   wear for the commute donut). Rows and the visual can name them. `compute()` and the snapshots stay
   untouched.
7. **Visual slot** takes one kit component, declared as data: `donut`, `compareBars`, `rangeBar`,
   `timeline`, `amortization`, `logScale`. Values are named by key (input id, compute key or derived
   key), in display units. `timeline` gets `today` only after mount, and only when it asks for it.

---

## Config (`data/calculators.ts`)

On `CalculatorInput` (optional): `dimension?: UnitDimension`, `unit?: string` (the unit
`compute()` expects; default the dimension's base). The widget shows a unit menu for it.

`CalculatorConfig.breakdown?: CalculatorBreakdown`:

| Field | Meaning |
|---|---|
| `headline?` | Key of the big accent number. Default: the first compute key. |
| `headlineLabel?` | Default: that output's label. |
| `outputs?` | `BreakdownOutput[]`: labels, formats and units of the headline and the rows, in row order. Default: every other compute key. |
| `groups?` | `{ title?, inputs: string[], optional?: true }[]`. Optional groups sit behind a disclosure (defaults still apply). Unlisted inputs go in a trailing untitled group. |
| `derive?` | `(values) => Record<string, number>`: display-only extras from inputs + outputs. |
| `visual?` | `BreakdownVisual`, one kit component (see decision 7). |

`BreakdownOutput` = `{ id, label?, format?, dimension?, unit?, alsoIn?: string[] }`.

## Files

- `components/CalculatorWidget.tsx`: shared shell parts (decision 4) + `widgetAccent(category)`.
- `components/SolverCalculator.tsx`: uses them; behavior and markup unchanged.
- `lib/breakdown.ts` (pure, tested), `lib/breakdown.spec.ts`.
- `components/BreakdownCalculator.tsx`, `components/BreakdownVisual.tsx`.
- `lib/calculator.ts`: `formatDecimal`, `currencySymbol` (still en-US/USD inside this file only, until step 18).
- `app/[locale]/calculators/[slug]/page.tsx`: fallback renders `BreakdownCalculator`.
- `components/CalculatorForm.tsx`: deleted.
- Demo: `commute-cost-calculator` gets groups, units on distance and fuel economy, derived monthly
  tolls and wear, and a Donut of fuel / parking / tolls / wear. No content, no compute change.

## Acceptance

- `npm test` passes with `data/calculators.spec.ts.snapshot` unchanged; `npm run build` and
  `npm run lint` pass.
- Rendered HTML: no page contains `CalculatorForm`'s grid; a sample of former `CalculatorForm` pages
  (mortgage, bmi, tip, paint, age, pregnancy-due-date) render the new widget with their default
  headline; pregnancy still shows `—` until mount; commute shows groups and the donut.
- The force-calculator page's widget markup is identical to master's.
- Template §2 and the add-calculator skill document the type-B config.
