# Step 60 — Wave 5a: Finance / money-hub expansion (pulled forward)

**Pulled ahead of the D13 remainder (biology → ecology → fun/other → tech) by user decision,
2026-11-15.** Only the `finance`-category "money-hub expansion" piece of Wave 5 moves up — the new
categories in Wave 5 proper (solar/home-energy, insurance, business/tax, crypto) stay queued after
Wave 4 per D14, unchanged. Biology/ecology/fun-other/tech resume after this wave closes out.

Seed list originally drafted in `mdFiles/omni-strategy.md` §4.5 (2026-11-08) plus new items found
in the 2026-11-15 calculator.net gap analysis (`mdFiles/memory` isn't in this repo — see the
session's own analysis; cross-checked against `data/calculators/finance.ts` directly before
writing this). Per the "more calculators, never fewer" principle the user confirmed 2026-11-15,
the gap-analysis items are included rather than cut for being niche.

## Current state

`finance` has 8 calculators today: `mortgage-calculator`, `loan-calculator`,
`compound-interest-calculator`, `paycheck-calculator`, `investment-calculator`,
`loan-prepayment-calculator`, `inflation-calculator`, `emi-calculator`. **Do not rebuild any of
these or duplicate their aliases** — read `data/calculators/finance.ts` directly before each batch
to check what already exists and what each one's aliases already claim.

## Scope — 31 calculators in 7 batches of ~5, same discipline as every prior wave

5-calculator agent batches (per the small-commits convention: commit+push after each calculator,
Progress checklist below, early draft PR, resume from the checklist if interrupted). YMYL —
finance calculators require a citation for every formula/figure and an explicit "estimates only,
not financial/tax/legal advice" disclaimer (`content.note` field, same pattern as
`compound-interest-calculator`'s existing one — read it for the exact tone). Every number in a
worked example must be independently verified in a scratchpad script before committing, per every
prior wave's convention.

### Batch 1 — Real estate / affordability (5)
- `home-affordability-calculator` — **richer than a quick estimate.** Inputs: gross income,
  existing monthly debt, down payment, rate, term, property tax rate, insurance estimate, HOA.
  Output: a **three-tier result** (conservative / balanced / maximum affordability — not one
  number), a full PITI breakdown (principal, interest, tax, insurance, PMI if down payment <20%,
  HOA), and the DTI check against both the 28% front-end and 36% back-end thresholds. This is
  meaningfully richer than `mortgage-calculator` and should cross-link to it (and to
  `debt-to-income-calculator` below) rather than duplicate either.
- `mortgage-refinance-calculator` — break-even point on refinancing (closing costs ÷ monthly
  savings), cross-link to `mortgage-calculator` and `loan-prepayment-calculator`.
- `down-payment-savings-calculator` — how long to save a target down payment at a given monthly
  savings rate and return; cross-link to `compound-interest-calculator`.
- `closing-cost-estimator-calculator` — typical cost-category breakdown (origination, title,
  appraisal, etc.) as a percentage range of loan amount, cited to a real source (e.g. CFPB/NAR),
  not invented percentages.
- `rent-vs-buy-calculator` — total cost of renting vs. buying over N years including opportunity
  cost of the down payment; this is a genuinely different question from `home-affordability` (can
  I afford it) and `mortgage-refinance` (should I refinance) — keep the three distinct.

### Batch 2 — Debt (5)
- `debt-to-income-calculator` — DTI ratio from gross income and monthly debt payments, both
  front-end and back-end, cited thresholds (match `home-affordability`'s 28/36 convention exactly
  so the two pages never disagree).
- `debt-payoff-calculator` — snowball vs. avalanche method side by side given a list of debts
  (balance/rate/minimum payment per debt) and an extra monthly payment; this is list-input shaped
  (`CalculatorInput.type: 'list'` or a small fixed-slot set) — check `weighted-average-calculator`'s
  paired-list precedent before inventing a new input pattern.
- `credit-card-minimum-payment-calculator` — how long/how much interest a minimum-only payment
  costs vs. a fixed payoff target; cite a real minimum-payment formula (e.g. % of balance + interest,
  common card issuer convention), state which one is used.
- `balance-transfer-savings-calculator` — interest saved by transferring a balance to a promo-APR
  card minus the transfer fee; genuinely distinct from `credit-card-minimum-payment`.
- `student-loan-calculator` — standard/graduated/extended repayment comparison on a federal-loan-
  style amortization; cross-link to `loan-calculator`, cite a real source for repayment plan shapes
  (studentaid.gov), don't invent a plan type that doesn't exist.

### Batch 3 — Retirement, part 1 (5)
- `retirement-savings-calculator` — distinct from the existing generic `investment-calculator`:
  years-to-retirement, current savings, monthly contribution, expected return → projected balance
  and a (very clearly caveated) estimated sustainable withdrawal. Cross-link both ways with
  `investment-calculator`.
- `401k-employer-match-calculator` — contribution + employer match formula (e.g. 50% up to 6%) →
  total annual contribution and the "free money" left on the table if under-contributing.
- `roth-ira-growth-calculator` — after-tax contribution growth, cite the current IRS annual
  contribution limit (fetch the real current-year figure, don't guess).
- `traditional-ira-calculator` — pre-tax contribution growth + the deferred-tax framing; the real,
  cited difference from Roth (tax now vs. tax later) stated directly, cross-linked both ways.
- `rmd-calculator` — Required Minimum Distribution from the current IRS Uniform Lifetime Table;
  fetch the real table, don't approximate it. Cross-link from `traditional-ira-calculator`.

### Batch 4 — Retirement, part 2 + goal investing (5)
- `pension-calculator` — estimated pension benefit from a years-of-service × final-salary ×
  multiplier formula (state clearly this varies hugely by plan; this is an illustrative estimate,
  not a specific plan's figure).
- `social-security-calculator` — estimated benefit from a simplified AIME/PIA-style calculation,
  cited to ssa.gov's own published formula bend points (fetch the current ones); state plainly this
  is an estimate, not an official benefit statement, and link to ssa.gov for the real one.
- `annuity-calculator` — future value of a fixed annuity given payment/rate/term (distinct math
  from `compound-interest-calculator`'s lump-sum compounding — an annuity is a payment stream).
- `annuity-payout-calculator` — the reverse: given a lump sum, the payout stream over N years at a
  given rate. Cross-link both ways with `annuity-calculator`.
- `goal-based-investment-calculator` — "I need $X in Y years" → required monthly contribution at a
  given expected return; the algebraic inverse of `investment-calculator`'s own math, cross-link.

### Batch 5 — Investment analysis + simple-interest cluster (5)
- `irr-calculator` — Internal Rate of Return from a cash-flow series (list input), numeric
  root-find like `loan-calculator`'s rate-solving already does (`lib/solve.ts`'s `findRoot`) —
  reuse, don't reinvent.
- `npv-calculator` — Net Present Value from a cash-flow series and a discount rate; cross-link both
  ways with `irr-calculator` (they're the two sides of the same cash-flow-series coin).
- `cd-calculator` — Certificate of Deposit maturity value, basically `compound-interest-calculator`
  specialized to a fixed term/no withdrawals — differentiate clearly or it's a near-duplicate; CD-
  specific content (early withdrawal penalty framing) is the differentiator.
- `simple-interest-calculator` — I = P×r×t, explicitly contrasted with
  `compound-interest-calculator` on the same page (a common point of confusion worth addressing
  head-on in the content, not just the formula).
- `mutual-fund-calculator` — lump sum + periodic contribution with an expense ratio drag on
  returns; the expense-ratio deduction is the one thing `investment-calculator` doesn't model —
  that's the differentiator, state it explicitly.

### Batch 6 — Remaining money-hub items (6 — one over to keep income tax solo in batch 7)
- `emergency-fund-calculator` — recommended fund size from monthly expenses × a cited months-of-
  coverage range (e.g. 3-6 months, cite a real source for the range, don't invent it) plus time to
  reach it at a given savings rate.
- `mortgage-amortization-schedule-calculator` — **check for redundancy first**: `mortgage-
  calculator` already renders a full amortization table inline (just fixed in UX-07 to show real
  monthly/yearly detail). If this page can't offer something genuinely additional (e.g. a bi-weekly
  vs. monthly payment-frequency comparison, or extra-payment scenarios side by side), skip it and
  record why in this file's Progress section rather than ship a near-duplicate — "final cut is the
  build agent's call per calculator" is the established convention for exactly this judgment call.
- `business-loan-calculator` — basically `loan-calculator` with business-specific framing
  (working capital, equipment financing); differentiate via content, not math, same precedent as
  shoe/ring-size "general vs. specific" pages elsewhere on the site.
- `commission-calculator` — flat-rate and tiered commission structures from a sale amount.
- `college-savings-calculator` — 529-style goal-based savings for a future tuition cost, cite a
  real current average tuition figure (don't invent one), cross-link to `goal-based-investment-
  calculator` (same math, different framing/content).
- `down-payment-savings-calculator` is in batch 1 already — do not duplicate here.

### Batch 7 — Income tax (1, standalone — big enough to warrant its own batch)
- `income-tax-calculator` — **US federal only for this version** (state tax is a 50-state can of
  worms, explicitly out of scope here — note it as a watch-out on the page, don't imply the result
  includes state tax). Inputs: filing status, taxable income (or gross income + standard
  deduction toggle), → federal tax owed via the current year's actual IRS tax brackets (fetch them
  directly, do not recall from memory — bracket figures change every year and recalled ones are
  very likely stale) plus effective vs. marginal rate shown side by side (a common point of
  confusion worth addressing in the content). This is the most YMYL calculator in this wave —
  citation discipline is non-negotiable, and the disclaimer must be explicit that this estimates
  federal income tax only, is not tax advice, and a real tax professional should be consulted for
  an actual return.

## Dedupe / cross-link checklist (run before each batch, not just at the end)

- Grep every new id and every candidate alias against `data/calculators/*.ts` before writing it —
  same "no duplicate alias" discipline as every prior wave (the pre-existing
  `'house loan emi calculator'` collision between `mortgage-calculator`/`emi-calculator` is already
  Parked, don't try to fix it in this wave, just don't add a third collision).
- `retirement-savings-calculator` vs `investment-calculator` vs `401k-employer-match-calculator` vs
  `roth-ira-growth-calculator` vs `traditional-ira-calculator` vs `pension-calculator` vs
  `social-security-calculator` are six distinct, real, separately-searched terms — this is
  deliberate breadth (the "more calculators, never fewer" principle), not duplication, but each
  page's content must state clearly how it differs from its siblings, with explicit cross-links.
- `cd-calculator` vs `compound-interest-calculator` and `simple-interest-calculator` vs
  `compound-interest-calculator`: same — real distinct search terms, but each needs an explicit
  "how this differs" callout since the underlying math is a specialization/contrast.
- `annuity-calculator`/`annuity-payout-calculator` vs `investment-calculator`: an annuity is a
  payment stream, not a lump sum — state the distinction on both annuity pages.

## Acceptance checks (every batch)

- `npm test`, `npm run lint`, `npm run build` all green before committing.
- Every worked-example number independently re-verified in a scratchpad script (no app imports)
  before committing — this wave's YMYL content makes this non-negotiable, not just good practice.
- Every fetched figure (IRS brackets, IRS contribution limits, RMD table, SSA bend points, CFPB
  closing-cost ranges, emergency-fund-months range, average tuition) is from a **directly fetched**
  primary or authoritative secondary source, not recalled from memory — bracket/limit figures
  specifically change yearly and a stale recalled figure is a real correctness bug, not a style
  nit.
- `seo.title` ≤60 chars, `seo.description` ≤160 chars, 6 FAQs, ≥4 aliases per new page (established
  convention).
- Visual-QA note: last Chrome pass was at 254 calculators (2026-11-12); this wave's 29-31
  calculators bring the site to ~288-290, which is within the ~50-calculator cadence but worth a
  visual spot-check near the end of batch 6/7 rather than skipped entirely, given how much of this
  wave is YMYL and screen-reader/visual correctness on multi-tier results (`home-affordability`'s
  three-tier output especially) matters more than a typical batch.

## Progress

- [x] Step file written
- [x] Batch 1 (real estate/affordability, 5) — branch `step/60-wave-5a-finance-run-1`, PR #75, DONE 2026-11-15
  - [x] `home-affordability-calculator`
  - [x] `mortgage-refinance-calculator`
  - [x] `down-payment-savings-calculator`
  - [x] `closing-cost-estimator-calculator`
  - [x] `rent-vs-buy-calculator`
- [x] Batch 2 (debt, 5) — branch `step/60-wave-5a-finance-run-2`, PR #92, DONE 2026-11-15
  - [x] `debt-to-income-calculator`
  - [x] `debt-payoff-calculator`
  - [x] `credit-card-minimum-payment-calculator`
  - [x] `balance-transfer-savings-calculator`
  - [x] `student-loan-calculator`
- [x] Batch 3 (retirement pt.1, 5) — branch `step/60-wave-5a-finance-run-3`, PR #99, DONE 2026-11-16
      (resumed after a rate-limit interruption that had committed 3/5)
  - [x] `retirement-savings-calculator`
  - [x] `401k-employer-match-calculator`
  - [x] `roth-ira-growth-calculator`
  - [x] `traditional-ira-calculator`
  - [x] `rmd-calculator`
- [ ] Batch 4 (retirement pt.2 + goal investing, 5) — branch `step/60-wave-5a-finance-run-4`, in progress 2026-11-16
  - [ ] `pension-calculator`
  - [ ] `social-security-calculator`
  - [ ] `annuity-calculator`
  - [ ] `annuity-payout-calculator`
  - [ ] `goal-based-investment-calculator`
- [ ] Batch 5 (investment analysis + simple-interest cluster, 5)
- [ ] Batch 6 (remaining money-hub items, 5-6)
- [ ] Batch 7 (income-tax-calculator, 1)
- [ ] Visual-QA spot-check (desktop/dark-mode at minimum) on `home-affordability-calculator`,
      `income-tax-calculator`, and one retirement-cluster page
- [ ] STATUS.md updated, `finance` category count recorded
