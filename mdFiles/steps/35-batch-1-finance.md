# Step 35 — Batch 1: finance (8), v2 conversion

## Progress

- [x] Step file, draft PR
- [x] Shared pieces: `term` unit dimension (months / years), solver visual slot (`solver.visuals`, `solver.derive`)
- [x] loan-calculator (A · Donut principal/interest + AmortizationTable)
- [x] mortgage-calculator (A · Donut + AmortizationTable; down payment fixed; "Loan amount" → "Home price")
- [x] emi-calculator (A · Donut + AmortizationTable (yearly); down payment fixed)
- [x] compound-interest-calculator (A · Donut start/contributions/interest)
- [x] investment-calculator (A · Donut initial/contributions/growth)
- [x] inflation-calculator (A · CompareBars then vs now)
- [x] loan-prepayment-calculator (B · Timeline payoff)
- [x] paycheck-calculator (C → B · Donut where the money goes)
- [x] Number verification script, tests, build, lint, STATUS.md, PR ready

Commit + push after each box (`step 35: <id>`).

**Scope (from `STATUS.md`):** Batch 1 finance (8), YMYL. Convert the 8 existing finance
calculators to the v2 template: widget type per the plan, units/formats, the listed result
visual, full v2 content (concept, how-to, formula, worked example, watch-outs, FAQ, references),
an "estimates only" note, verified numbers. Ids/URLs unchanged; `calculatorOrder` untouched.

**Spec:** `mdFiles/calculator-rollout-plan.md` §1 and §3 Batch 1; `mdFiles/calculator-template-v2.md`.

---

## Plan

| Calculator | Type | Auto-solve fields / fixed inputs | Outputs | Visual |
|---|---|---|---|---|
| loan | A | payment ↔ amount ↔ term ↔ rate (rate numeric) | total interest, total paid | Donut + AmortizationTable |
| mortgage | A | payment ↔ home price ↔ term ↔ rate (numeric); down payment fixed | loan amount, total interest, total paid | Donut + AmortizationTable |
| emi | A | EMI ↔ price ↔ term ↔ rate (numeric); down payment fixed | amount financed, total interest, total paid | Donut + AmortizationTable |
| compound-interest | A | future value ↔ start ↔ years ↔ rate (numeric); monthly contribution fixed | contributions, interest | Donut |
| investment | A | future value ↔ initial ↔ years ↔ return (numeric); annual contribution fixed | total contributed, growth | Donut |
| inflation | A | future cost ↔ amount ↔ years ↔ rate (all closed form) | increase, today's value | CompareBars |
| loan-prepayment | B | — | interest saved, months saved, … | Timeline |
| paycheck | C → B | — | net per paycheck, taxes, deductions | Donut |

### Decisions

- **Type A keeps `inputs` + `compute()` as they are** (forward direction, JSON-LD, snapshots).
  The solver is added beside them, so the type-A snapshots do not change.
- **New `term` dimension** in `lib/units.ts`: months (base) and years (= 12 months, exact by
  definition). A loan term menu of seconds…years (the `time` dimension) would be silly, and
  months-as-base lets the solve functions use `n` directly.
- **Solver visual slot:** `solver.visuals?: BreakdownVisual[]` (same kit configs as type B,
  rendered by `BreakdownVisual`) fed by every variable in its base unit, every `outputs` value and
  `solver.derive?(si)` (display-only figures). Rendered only when the widget has an answer.
- **No growth curve in the kit** (plan asks for one on compound interest / investment). The rule
  is never to draw a new visual mid-batch, so those two get a Donut (start / contributions /
  interest) and the curve is parked for the kit.
- **Paycheck C → B** changes the compute contract (the old compute was a flat-rate placeholder; the
  page used `PaycheckCalculator.tsx`). Its snapshot diff is expected and explained in the PR.

## Notes (written at the pause, kept for the record; all done)

- **Verification:** the throwaway checker used so far re-implemented every formula in Python and
  matched 87 copy figures across the first seven calculators (0 mismatches); the app's own
  `compute()` and `solveState()` at defaults agree with the worked examples. Write a fresh
  checker for paycheck's figures (and re-run the copy checks if any earlier copy changes).
- **Paycheck plan (not started):** C → B through `BreakdownCalculator`, deleting
  `components/PaycheckCalculator.tsx` and its branch in `app/[locale]/calculators/[slug]/page.tsx`.
  Needs a small widget addition: `CalculatorInput.options?: { value: number; label: string }[]`
  rendered as a menu (filing status 0/1/2 = single / married filing jointly / head of household;
  pay frequency 52/26/24/12), with share-link values restricted to the options. `compute()` must
  accept any number (the snapshot spec feeds defaults ×1.5 and `min`), e.g. round and clamp the
  filing status. Proposed inputs: annual salary, pay frequency, filing status, state rate, local
  rate (optional group), traditional 401(k) % of pay (capped at the annual limit), other pre-tax
  deductions per paycheck (section 125: health/dental premiums, HSA, FSA), post-tax deductions per
  paycheck. Visual: Donut of net pay / federal tax / Social Security + Medicare / state + local /
  deductions, center = gross per paycheck. **The snapshot for paycheck will change** (new compute
  contract); explain it in the PR.
- **Use 2026 figures** (today is 2026-10-19; the old component's 2025 standard deduction is also
  pre-OBBBA and wrong). Checked against IRS Rev. Proc. 2025-32 (IRB 2025-45) on 2026-10-19:
  standard deduction $16,100 single / $32,200 MFJ / $24,150 HOH. Bracket tops (10/12/22/24/32/35%,
  then 37%): single 12,400 / 50,400 / 105,700 / 201,775 / 256,225 / 640,600; MFJ 24,800 / 100,800 /
  211,400 / 403,550 / 512,450 / 768,700; HOH 17,700 / 67,450 / 105,700 / 201,750 / 256,200 / 640,600.
  Social Security wage base 2026 $184,500 (SSA); 6.2% SS, 1.45% Medicare, +0.9% over $200,000
  (single/HOH) or $250,000 (MFJ). 401(k) elective deferral limit 2026 $24,500 (IRS newsroom).
  Traditional 401(k) deferrals are subject to FICA (the old component wrongly exempted them);
  section 125 premiums are not. The result is annual liability spread over paychecks, not Pub 15-T
  withholding: say so in the estimate note.

## Paycheck: what shipped (resumed 2026-10-19)

- `CalculatorInput.options` renders a menu (`ChoiceRow` in `components/CalculatorWidget.tsx`);
  share links accept only listed values. `compute()` clamps/rounds, so the snapshot spec's
  generated inputs still work.
- `PAYROLL_2026` + `federalIncomeTax` at the top of `data/calculators/finance.ts`.
  `components/PaycheckCalculator.tsx` deleted; its branch removed from the calculator page.
- Dropped from the old component: separate HSA / FSA / dependent-care / commuter fields with
  their individual limits, and the HSA coverage toggle. They are one "pre-tax per paycheck" field now.
- Snapshot: only `paycheck-calculator` changed (new inputs and outputs). Every other snapshot is
  byte-identical.
- Verification: the Python checker now covers 110 copy figures (0 mismatches). The app's
  `compute()` matches the independent model to 6 decimals on 6 input sets (all three filing
  statuses, no 401(k), the 0.9% Medicare threshold, and a high-income monthly case).
