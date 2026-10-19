# Step 35 — Batch 1: finance (8), v2 conversion

## Progress

- [x] Step file, draft PR
- [x] Shared pieces: `term` unit dimension (months / years), solver visual slot (`solver.visuals`, `solver.derive`)
- [ ] loan-calculator (A · Donut principal/interest + AmortizationTable)
- [ ] mortgage-calculator (A · Donut + AmortizationTable; down payment fixed; "Loan amount" → "Home price")
- [ ] emi-calculator (A · Donut + AmortizationTable (yearly); down payment fixed)
- [ ] compound-interest-calculator (A · Donut start/contributions/interest)
- [ ] investment-calculator (A · Donut initial/contributions/growth)
- [ ] inflation-calculator (A · CompareBars then vs now)
- [ ] loan-prepayment-calculator (B · Timeline payoff)
- [ ] paycheck-calculator (C → B · Donut where the money goes)
- [ ] Number verification script, tests, build, lint, STATUS.md, PR ready

Resume from the first unchecked box. Commit + push after each box (`step 35: <id>`).

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
