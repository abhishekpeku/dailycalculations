# UX-07 — amortization schedule: fix lost detail on short/monthly terms

Off the numbered step sequence (like UX-01..06). Branch: `ux/amortization-monthly-schedule`.

## The bug (user-reported, 2026-11-15)

`components/visuals/AmortizationTable.tsx` always rolls the schedule up into **yearly** rows
(`lib/amortization.ts`'s `amortizationSchedule`, `year = Math.ceil(month / 12)`). When a loan's
term is short — or the user switches the "Loan term" field's unit from years to months and enters
a small month count — every month collapses into a single "Year 1" row (or two rows for a
13-24 month term), hiding the month-by-month detail entirely. This is live and wrong today on the
**`emi-calculator`'s own default example** (12-month term) and on `loan-calculator` or
`car-payment-calculator` whenever someone picks a term under ~2 years.

Confirmed usages, all through the same shared component (fix once, fixes all four):
- `data/calculators/finance.ts:230` — `loan-calculator` (default term 5 yr)
- `data/calculators/finance.ts:97` — `mortgage-calculator` (default term 30 yr)
- `data/calculators/finance.ts:1104` — `emi-calculator` (default term **12 mo** — hits the bug by default)
- `data/calculators/auto.ts:45` — `car-payment-calculator` (default term 6 yr)

## Scope — narrow, visual-component + lib only

No `data/calculators/*.ts` changes needed — the four calculators above pass `months`/`annualRate`/
`principal`/`payment` field ids into the `amortization` visual already; only the component and its
lib function change shape.

## Part 1 — `lib/amortization.ts`

Add a month-level function and make the existing yearly one derive from it, so the two can never
disagree:

```ts
export type AmortizationMonth = { month: number; year: number; interest: number; principal: number; balance: number };
```

- `amortizationMonthlySchedule(principal, annualRate, months, payment?)`: same guard clauses and
  core loop `amortizationSchedule` has today (same early-return-`[]` cases, same `limit =
  Math.min(Math.ceil(months), 1200)`, same final-payment trim to zero), but returns **one row per
  month** — `{ month, year: Math.ceil(month / 12), interest, principal, balance }` — instead of
  accumulating into a yearly bucket.
- `amortizationSchedule` becomes a thin aggregation over `amortizationMonthlySchedule`'s result,
  grouped by `year`, summing `interest`/`principal` and taking the last month's `balance` per year.
  **Must produce byte-identical output to today** — `lib/amortization.spec.ts` is the contract, do
  not change any of its assertions. Run `npm test` before and after the refactor and diff the
  numbers if anything moves.
- Add a parallel `amortizationMonthlySchedule` describe block to `lib/amortization.spec.ts`
  mirroring the existing yearly tests (30-year case has 360 rows; the `$10,000 at 5% for 18 months`
  case has 18 rows, not 2; 0% interest case; early-payoff case; unusable-inputs case). Also assert
  that summing `amortizationMonthlySchedule`'s rows by year reproduces `amortizationSchedule`'s
  output exactly, for at least the 360-month and 18-month cases — this is the regression guard that
  actually matters here.

## Part 2 — `components/visuals/AmortizationTable.tsx`

Replace the single flat yearly table with:

- **`months <= 12`**: skip yearly rows entirely — render the monthly rows directly, one table,
  columns `Month / Interest / Principal / Balance`. No expand button needed (at most 12 rows).
- **`months > 12`**: keep today's yearly-rows table and its existing "Show first 5 years / Show
  all N years" pagination **unchanged in behavior**, but make each visible year row expandable:
  a chevron/disclosure button on the year row (`aria-expanded`, toggles a `Set<number>` of expanded
  years in local state) that, when open, inserts that year's monthly rows directly beneath it —
  indented/shaded (e.g. `bg-slate-50 dark:bg-slate-900/40`, smaller text), columns `Month / Interest
  / Principal / Balance` same as the <=12 case, using the overall month number (1-based across the
  whole loan, not reset per year — avoids inventing a fake calendar). A partial final year shows
  only its real remaining months (do not pad to 12).
- Compute `amortizationMonthlySchedule` once (`useMemo`, same deps as today's `amortizationSchedule`
  call) and derive both the yearly rows (when needed) and any expanded year's month slice from it —
  don't call two separate lib functions needlessly if one covers it, but do reuse
  `amortizationSchedule` for the yearly rows rather than re-deriving grouping logic a second time in
  the component (keep the lib as the one place that knows how to group by year).
- Keep the existing `<caption className="sr-only">` pattern, updating its text to mention the
  monthly drill-down; keep `format`/`initialYears` props and their defaults unchanged so no caller
  needs to change.

## Acceptance checks

- `npm test` green, including the new monthly-schedule tests and the year-sum-matches-monthly
  regression check.
- `npm run build` passes (static pages count unchanged — no new calculator).
- `npm run lint` clean.
- Manual verification (a plain Node script against the exported functions is enough, a live
  browser check is a bonus not a requirement for this fix):
  - `emi-calculator` default (12-month term): the amortization visual shows all 12 months, not one
    collapsed "Year 1" row.
  - `loan-calculator` with term switched to e.g. 18 months: 18 monthly rows, not 2 yearly rows.
  - `mortgage-calculator` default (30 years): unchanged visually at first — 5 yearly rows + "Show
    all 30 years" — but each year row can now expand to its 12 months.
  - A live browser spot-check of `emi-calculator` and `mortgage-calculator` (expand one year) is
    worth doing before merge if Claude in Chrome is connected; not a hard blocker if it isn't.

## Progress

- [x] Step file written, branch created
- [x] Part 1: `amortizationMonthlySchedule` added, `amortizationSchedule` refactored to use it, spec
      updated and green
- [x] Part 2: `AmortizationTable.tsx` — <=12-month direct monthly table
- [x] Part 2: `AmortizationTable.tsx` — >12-month per-year expand-to-months
- [x] `npm test` / `npm run lint` / `npm run build` all pass
- [x] STATUS.md updated, PR opened

### Verification notes (2026-11-15)

- `npm test`: 1108 → 1115 tests (7 new, all pass); the 12 original `amortization.spec.ts`
  assertions are byte-identical to before the refactor.
- `npm run lint`: clean.
- `npm run build`: passes, 290 static pages (unchanged, as expected — no new calculator).
- Throwaway Node script against the exported functions (not committed) confirmed:
  - `emi-calculator`'s 12-month default → 12 monthly rows (was collapsing to 1 yearly row).
  - An 18-month term → 18 monthly rows (was collapsing to 2 yearly rows).
  - Summing `amortizationMonthlySchedule` by year reproduces `amortizationSchedule` exactly for
    both the 360-month mortgage case and the 18-month case.
  - Live browser spot-check was not done (Chrome automation not exercised this run); the above
    plus the unit/regression tests cover the acceptance checks.
