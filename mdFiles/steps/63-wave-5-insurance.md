# Step 63 — Wave 5: Insurance (new category)

## Progress — batch 1 (this branch: `step/63-insurance-batch1`)

- [x] Category scaffold: `data/calculators/insurance.ts`, `categories` entry, `calculatorOrder`,
      `lib/categoryTheme.ts` + `components/IconTile.tsx` color/icon pair (violet + shield)
- [x] `human-life-value-calculator`
- [x] `dime-method-life-insurance-calculator`
- [x] `term-life-coverage-calculator` — kept distinct (decision below)
- [x] `whole-life-vs-term-life-cost-calculator`
- [x] npm test / lint / build all green, snapshot regenerated (additive only)
- [x] Draft PR opened early (#140) and kept current

**Decision on `term-life-coverage-calculator`:** built as its own page. It answers "how many
years of term" (longest of mortgage payoff / child-independence span / years-to-retirement,
rounded up to a 5-year increment), which is a distinct question from "how much coverage"
(human-life-value and DIME). No overlap found after reading both other calculators' content.

**Decision on flood insurance:** not in batch 1's scope (it is listed under batch 4 in this step
file) — no action taken on it yet; left for whoever picks up batch 4 to evaluate per the step
file's own skip-candidate note.

Per `mdFiles/omni-strategy.md` §4.5 ("Insurance — new category, zero overlap with anything
existing"). Go-ahead per D23. One of the 4 remaining Wave 5 sub-categories.

## Competitive gap-check

Unlike biology/ecology/fun/tech, **no single aggregator site bundles insurance calculators the way
Omni bundles its science categories** — confirmed directly: Omni's own finance page has no insurance
subcategory, and guessed URL patterns for a dedicated Omni life-insurance-needs calculator both
404'd. Insurance calculators live scattered across insurer and financial-advice sites (NerdWallet,
Policygenius, individual insurer sites), not one competitor's category page to diff against. This is
worth stating honestly rather than fabricating a "fetched competitor X's page" claim — the seed list
below is validated against well-documented, industry-standard insurance concepts instead (methods an
actual financial advisor or insurer's own educational material would cite), and the build agent
should still cite a real primary-ish source per calculator (NAIC.org, III.org — Insurance
Information Institute — or a specific insurer's published educational page) the same way every other
calculator on the site does, same discipline, just without one bundling category page to start from.

**Critical framing requirement carried through every calculator in this category**: educational
estimate only, **never implies buying a policy through this site** — same disclaimer discipline as
`finance`/`health` (§4.4). State this explicitly in `watchOut` on every single calculator here, not
just once at the category level.

## Dedupe

- Zero overlap with any existing category — `health`'s calculators are about medical/fitness, not
  health*insurance*; `finance`'s calculators are about loans/savings/investing, not insurance.
  Confirmed via grep: no existing calculator id contains "insur".
- Grep every new id/alias against **all** `data/calculators/*.ts` site-wide before writing anyway,
  same discipline as every prior wave.

## Starting state

Brand-new category — open it the same way other Wave 4/5 categories were: `data/calculators/
insurance.ts` (new file; category id `insurance`, title **"Insurance"**), an entry in `data/
calculators/index.ts`'s `categories` array and spread list, and a new color/icon pair in `lib/
categoryTheme.ts`/`components/IconTile.tsx` (a shield glyph reads well). **Category-opening work
happens in exactly one batch — batch 1.**

Target ~16-18 calculators across 4 batches. Sub-grouping deferred to a final retrofit batch (same
precedent as biology/ecology/fun), once the real final count is known.

## Batches (~16-18 calculators, 4 batches + 1 retrofit)

**Batch 1 — Life insurance need (4), opens the category:**
- `human-life-value-calculator` — the human life value method: estimated lifetime earnings (income
  × years to retirement, discounted) as the coverage benchmark. Cite a real documented source for the
  method (NAIC or a named insurer's educational page).
- `dime-method-life-insurance-calculator` — the DIME method (Debt + Income replacement + Mortgage +
  Education costs) as a distinct, named alternative to human life value — explicitly frame both as
  different methods giving different answers, don't present one as more "correct."
- `term-life-coverage-calculator` — translates either method's output into a specific term-length
  recommendation (10/20/30-year) tied to when major obligations (mortgage payoff, kids' college) end.
  Read both calculators above first to avoid a near-duplicate; if it doesn't hold up as distinct,
  fold the term-length guidance into one of them instead — build agent's call.
- `whole-life-vs-term-life-cost-calculator` — side-by-side premium-cost and cash-value comparison
  over a term, citing real documented cost-structure differences (term: pure protection, lower
  premium; whole: level premium + cash-value component) — not a recommendation of which is "better."

**Batch 2 — Health & disability insurance (4):**
- `out-of-pocket-maximum-calculator` — tracks cumulative deductible + copay + coinsurance spending
  against a plan's stated out-of-pocket max (a real, well-documented ACA-era health-plan term).
- `cobra-cost-calculator` — COBRA continuation coverage cost, cited to the real DOL-documented rule
  (up to 102% of the combined employee+employer premium).
- `disability-insurance-needs-calculator` — income-replacement-percentage framing (a real, commonly
  cited industry benchmark — confirm the actual percentage range via a real source before stating
  it, don't guess).
- `long-term-care-insurance-needs-calculator` — estimated care-cost gap after accounting for savings/
  other coverage over an assumed care-duration; cite a real source for typical care-cost figures
  (e.g. a Genworth-style cost-of-care survey) rather than inventing a number.

**Batch 3 — Auto & property insurance (4):**
- `car-insurance-coverage-calculator` — liability/comprehensive/collision coverage-amount guidance
  against a user's own asset/income situation (state minimums vary — frame as "a starting point,
  check your state's actual minimums," don't assert one number as universal).
- `gap-insurance-calculator` — loan-balance-vs-vehicle-value gap (negative equity) that gap insurance
  covers; reuse `auto`'s existing depreciation logic (`car-depreciation-calculator`) for the
  vehicle-value side rather than reinventing it.
- `renters-insurance-contents-value-calculator` — room-by-room personal-property inventory → total
  contents value, to size coverage against (real, practical, no formula controversy).
- `home-insurance-rebuild-cost-calculator` — square-footage × a regional cost-per-square-foot
  rebuild estimate, explicitly distinguished from market/resale value (a well-known, real homeowner-
  insurance distinction — rebuild cost, not what the house would sell for).

**Batch 4 — Everyday insurance novelties (4-6, flexible):**
- `umbrella-insurance-coverage-calculator` — net-worth-based umbrella-liability coverage-amount
  guidance (a real, commonly cited "cover your net worth" heuristic).
- `pet-insurance-breakeven-calculator` — premium + deductible vs. paying vet bills out of pocket,
  breakeven number of vet visits/claims — pure arithmetic, no citation controversy.
- `deductible-vs-premium-breakeven-calculator` — generic, policy-type-agnostic: how many claims (or
  how large a claim) it takes for a higher deductible's premium savings to pay for itself — pure
  arithmetic, reusable framing across any policy type.
- `flood-insurance-cost-estimator` — **likely skip candidate**: FEMA flood-zone-based pricing is
  real but heavily data/location-dependent in a way that doesn't reduce to a clean, static formula
  the way the others do. Only build if a real, generalizable methodology can be found and cited;
  otherwise document as an honest skip, don't force a thin page.

## Progress checklist

- [ ] Batch 1 — Life insurance need (4), opens the category
- [ ] Batch 2 — Health & disability insurance (4)
- [ ] Batch 3 — Auto & property insurance (4)
- [ ] Batch 4 — Everyday insurance novelties (4-6)
- [ ] Sub-grouping retrofit
- [ ] STATUS.md updated with the final per-category summary
