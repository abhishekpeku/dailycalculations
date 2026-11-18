# Step 64 — Wave 5: Business & Tax (new category)

Per `mdFiles/omni-strategy.md` §4.5 ("Business & tax — new category"). Go-ahead per D23. One of the
4 remaining Wave 5 sub-categories.

## Competitive gap-check (per omni-strategy.md's "widen the scan beyond Omni" rule)

Fetched Omni Calculator's finance page's "Business Planning" and "Tax and Salary" subcategories
directly — 69 and 48 items respectively. Most are either **too niche/specialist for a consumer
site** (HHI Calculator, Lerner Index, EVM, PVGO, GMROI — advanced financial-analyst tools, same
exclusion logic as Minecraft/PCB tools elsewhere) or **state-specific US payroll/tax variants**
(Alabama Tax, California Stimulus Check, New York Tax — 10+ state-specific calculators that don't
fit this site's single-page-per-concept model without a dedicated 50-state project of their own,
out of scope here). The genuinely useful, broadly-searched, small-business/freelancer-relevant
subset — confirmed real on Omni's own page — is seeded below: **Break-even, Accumulated
Depreciation, Cost of Goods Sold, Contribution Margin, Burn Rate, Business Valuation, Payback
Period, GST, VAT**. Separately confirmed Omni's dedicated **Margin Calculator** page exists and
explicitly distinguishes margin (profit ÷ revenue) from markup (profit ÷ cost) — both are real,
distinct, commonly-confused calculators worth having as separate pages, same as this site's existing
practice of clarifying similarly-named concepts elsewhere.

## Dedupe — checked directly against current `finance.ts` (39 calculators) and other categories

- `finance`'s `business-loan-calculator` and `commission-calculator` (added in step 60 batch 7)
  **already cover those two ideas from the original 2026-11-08 seed list** — not rebuilt here.
- `shopping`'s `sales-tax-calculator` already exists (US-style point-of-sale tax) — the GST/VAT
  calculators here are genuinely distinct (different tax mechanism: value-added at each production
  stage vs. a single point-of-sale tax, and used in different countries) — cross-link, explain the
  distinction in `watchOut`, don't duplicate the US sales-tax logic.
- `work`'s `freelancer-rate-calculator` already exists — read it first before building `1099-
  contractor-rate-calculator`; the new one must be genuinely distinct (converting a specific W-2
  salary target into an equivalent 1099 rate accounting for self-employment tax and lost benefits,
  vs. the existing calculator's own framing) or it should be dropped/merged, build agent's call.
- `travel`'s `currency-converter` and `work`'s `paycheck-calculator` already exist — not duplicated.
- Grep every new id/alias against **all** `data/calculators/*.ts` site-wide before writing.

## Starting state

Brand-new category — open it the same way other Wave 4/5 categories were: `data/calculators/
business.ts` (new file; category id `business`, title **"Business & Tax"**), an entry in `data/
calculators/index.ts`'s `categories` array and spread list, and a new color/icon pair in `lib/
categoryTheme.ts`/`components/IconTile.tsx` (a briefcase/invoice glyph reads well — note `work`
already uses a briefcase icon with `gray`, so pick a visually distinct icon even if the color is
reused). **Category-opening work happens in exactly one batch — batch 1.**

**GST/VAT note**: `lib/regions.ts` (mentioned in `CLAUDE.md` as the future home of 9 country tax
profiles) **does not exist yet** — region/country detection is still unbuilt (STATUS.md steps 20-22
are TODO). Build `gst-calculator`/`vat-calculator` as standalone pages with a user-entered rate
(same pattern as the existing `sales-tax-calculator`), not as something depending on unbuilt region
infrastructure.

Target ~18 calculators across 4 batches. Sub-grouping deferred to a final retrofit batch.

## Batches (~18 calculators, 4 batches + 1 retrofit)

**Batch 1 — Pricing & margin (5), opens the category:**
- `profit-margin-calculator` — profit ÷ revenue, solver for any of price/cost/margin. Cite Omni's own
  margin-calculator page's formula and its explicit margin-vs-markup distinction.
- `markup-calculator` — profit ÷ cost, the companion calculator — explicitly cross-link to profit-
  margin and state the distinction in both pages' copy, not just one.
- `break-even-calculator` — fixed costs ÷ (price − variable cost per unit) → break-even unit volume.
- `contribution-margin-calculator` — price − variable cost per unit, and the ratio to price; natural
  companion to break-even (feeds the same denominator).
- `cost-of-goods-sold-calculator` — beginning inventory + purchases − ending inventory (or a FIFO/
  weighted-average note if it fits cleanly in scope).

**Batch 2 — Business finance (5):**
- `depreciation-calculator` — straight-line and declining-balance methods side by side, cited to a
  real accounting-standard source; distinct from any vehicle-specific depreciation already on the
  site (`auto`'s `car-depreciation-calculator` is about resale value, not a tax/accounting schedule —
  state that distinction explicitly).
- `burn-rate-calculator` — monthly cash outflow vs. remaining cash → runway in months, startup-
  finance framing.
- `business-valuation-calculator` — a simple revenue- or earnings-multiple method, **clearly
  caveated as a rough estimate, not a professional valuation** (real business valuation involves
  much more — say so explicitly, same honesty discipline as every YMYL-adjacent page on this site).
- `payback-period-calculator` — initial investment ÷ annual cash inflow → years to recover, distinct
  from `finance`'s existing `irr-calculator`/`npv-calculator` (a simpler, non-discounted metric —
  state the distinction).
- `fte-calculator` — full-time-equivalent headcount from a list of employees' hours, confirmed real
  on Omni's own page.

**Batch 3 — Tax (4):**
- `gst-calculator` — goods-and-services-tax style (India/Canada/Australia pattern), net/gross price
  solver with a user-entered rate.
- `vat-calculator` — value-added-tax style (EU/UK pattern), net/gross price solver with a user-
  entered rate; cross-link to `gst-calculator` and `shopping`'s `sales-tax-calculator`, explaining
  the three mechanisms' real differences.
- `self-employment-tax-estimator` — the real US IRS Schedule SE calculation (15.3% combined Social
  Security + Medicare on net self-employment earnings, up to the Social Security wage base), cited
  directly from irs.gov.
- `1099-contractor-rate-calculator` — converts a target take-home or W-2-equivalent income into a
  1099 hourly/project rate, accounting for self-employment tax and the absence of employer-paid
  benefits. Read `freelancer-rate-calculator` first — if the distinction doesn't hold up once
  scoped, drop or merge, build agent's call.

**Batch 4 — Everyday business novelties (4):**
- `accounts-receivable-days-calculator` — (accounts receivable ÷ total credit sales) × days in
  period, confirmed real on Omni's own page as "A/R Days."
- `invoice-late-payment-interest-calculator` — overdue amount × an entered annual rate × days late
  ÷ 365 — generic, rate-agnostic (don't hardcode one jurisdiction's statutory late-payment rate as
  universal; let the user enter their own).
- `project-profitability-calculator` — budgeted vs. actual cost and revenue on a single project →
  realized margin; distinct from the category-level `profit-margin-calculator` (per-project vs.
  whole-business framing).
- `llc-formation-cost-estimator` — **likely skip/reframe candidate**: actual LLC filing fees vary
  enormously by US state (a real but heavily 50-state-fragmented data problem, same shape as the
  flood-insurance idea in step 63). If a genuinely citable, generalizable formula/range can't be
  found, consider reframing as a generic "business structure setup cost comparison" (sole
  proprietorship vs. LLC vs. S-corp, typical cost *ranges* cited rather than one false-precision
  number) or document as an honest skip — build agent's call, don't force a thin or inaccurate page.

## Progress checklist

- [ ] Batch 1 — Pricing & margin (5), opens the category
  - [ ] Category scaffolding: `data/calculators/business.ts`, `index.ts` entry, `categoryTheme.ts`/`IconTile.tsx` color+icon
  - [ ] `profit-margin-calculator`
  - [ ] `markup-calculator`
  - [ ] `break-even-calculator`
  - [ ] `contribution-margin-calculator`
  - [ ] `cost-of-goods-sold-calculator`
- [ ] Batch 2 — Business finance (5)
- [ ] Batch 3 — Tax (4)
- [ ] Batch 4 — Everyday business novelties (4)
- [ ] Sub-grouping retrofit
- [ ] STATUS.md updated with the final per-category summary
