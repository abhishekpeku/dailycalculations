# Step 63 — Wave 5: Insurance (new category)

## Progress — batch 4 (this branch: `step/63-insurance-batch4`, PR #149)

- [x] `umbrella-insurance-coverage-calculator` — asset-gap method cited to Progressive's own
      published "How Much Umbrella Insurance Do I Need?" article, rounded up to the $1 million
      increments the Insurance Information Institute and Travelers describe umbrella policies as
      actually sold in (there is generally no smaller policy to buy even for a sub-$1M gap).
- [x] `pet-insurance-breakeven-calculator` — deductible + reimbursement-rate breakeven vet-bill
      total, derived algebraically (cost-with-insurance = cost-without-insurance, solved for the
      year's vet bills) and cited to the Insurance Information Institute's "Facts about pet
      insurance" for how deductibles/reimbursement caps/pre-existing exclusions actually work.
- [x] `deductible-vs-premium-breakeven-calculator` — generic, policy-type-agnostic claim-frequency
      breakeven (works for auto, home, health, pet, or any other deductible-based policy), cited to
      NAIC's homeowners insurance consumer guide for the core "higher deductible lowers the
      premium" mechanic.
- [x] `flood-insurance-cost-estimator` — re-confirmed as a skip, not re-researched from scratch;
      batch 3's own direct fetch of FEMA's Risk Rating 2.0 page already established there is no
      public formula to build from.
- [x] Sub-grouping retrofit (see the "Closing summary" section above)
- [x] npm test / lint / build all green, snapshot regenerated (additive only) — one new
      `KNOWN_NON_FINITE` entry for `deductible-vs-premium-breakeven-calculator`'s
      `breakevenYears`/`breakevenClaimFrequency` at the both-deductibles-$0 edge case
- [x] Draft PR opened early (#149) and kept current

**Research note:** WebSearch's quota was exhausted again this session (same shared daily budget
as every prior batch). Google/Bing/DuckDuckGo were all tried as scrape-friendly fallbacks and all
failed (Bing returned irrelevant results, DuckDuckGo's HTML endpoint served a CAPTCHA) — the
working fallback was fetching `iii.org`'s own `/insurance-types/other` page directly, reading its
live nav links to find the real article URLs (`/article/should-i-purchase-an-umbrella-liability-
policy`, `/article/facts-about-pet-insurance`), then WebFetch-ing each one directly. Several
guessed insurer URLs (Allstate, USAA, content.naic.org's umbrella/pet pages) 404'd or timed out
and were dropped in favor of ones that resolved. No citation in the shipped copy is unverified —
every fetch quoted in the calculators' `content.references` was read directly.

## Progress — batch 2 (this branch: `step/63-insurance-batch2`)

- [x] `out-of-pocket-maximum-calculator` — cites HealthCare.gov's glossary definition and the
      2026/2027 ACA marketplace out-of-pocket limits.
- [x] `cobra-cost-calculator` — cites the DOL's "up to 102% of the cost to the plan" rule and the
      usual 18-month (up to 36-month) coverage window.
- [x] `disability-insurance-needs-calculator` — cites the Council for Disability Insurance
      Awareness's 60-80% typical LTD income-replacement range, "1 in 4" disability-likelihood
      statistic, and average SSDI benefit figure.
- [x] `long-term-care-insurance-needs-calculator` — cites CareScout's (Genworth's successor) 2025
      Cost of Care Survey national median costs by care type.
- [x] npm test / lint / build all green, snapshot regenerated (additive only)
- [x] Draft PR opened early (#143) and kept current

**Research note:** WebSearch's quota was exhausted partway through research (0 of the 4
calculators' sourcing needed it after the first couple of queries). Fell back to direct WebFetch
on known/guessed primary-source URLs per the task's instruction — this worked for every citation
used (HealthCare.gov, DOL, thecdia.org/Council for Disability Insurance Awareness, CareScout),
though several guessed insurer URLs (Guardian, MassMutual, Principal, Unum, NAIC, III.org specific
pages) 404'd and were abandoned in favor of the ones that resolved. No citation in the shipped copy
is unverified — every fetch quoted above was read directly, not from memory.

**Decision on COBRA's disability-extension premium (up to 150% for months 19-29):** a real,
commonly cited COBRA detail, but it could not be verified via a direct fetch (the DOL FAQ URL
guessed for it 404'd) in the time available. Left out of the calculator and copy entirely rather
than stating an unverified figure — the 102%/18-month figures actually used are both DOL-confirmed
direct quotes.

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

- [x] Batch 1 — Life insurance need (4), opens the category
- [x] Batch 2 — Health & disability insurance (4)
- [x] Batch 3 — Auto & property insurance (4), DONE 2026-11-18, branch `step/63-insurance-batch3`, PR #145
- [x] Batch 4 — Everyday insurance novelties (3 of 4; flood skipped), DONE 2026-11-19, branch `step/63-insurance-batch4`, PR #149
- [x] Sub-grouping retrofit, DONE 2026-11-19, same branch/PR
- [x] STATUS.md updated with the final per-category summary

## Closing summary (2026-11-19) — step 63 is DONE

**Final count: 15 calculators**, across 4 batches:

1. **Life Insurance** (4): `human-life-value-calculator`, `dime-method-life-insurance-calculator`,
   `term-life-coverage-calculator`, `whole-life-vs-term-life-cost-calculator`
2. **Health & Disability** (4): `out-of-pocket-maximum-calculator`, `cobra-cost-calculator`,
   `disability-insurance-needs-calculator`, `long-term-care-insurance-needs-calculator`
3. **Auto & Property** (5): `car-insurance-coverage-calculator`, `gap-insurance-calculator`,
   `renters-insurance-contents-value-calculator`, `home-insurance-rebuild-cost-calculator`,
   `umbrella-insurance-coverage-calculator`
4. **Everyday & Planning** (2): `pet-insurance-breakeven-calculator`,
   `deductible-vs-premium-breakeven-calculator`

That is just under the ~16-18 target stated at the top of this file. The gap is entirely
`flood-insurance-cost-estimator`, evaluated twice (batch 3's own research, and re-confirmed rather
than re-run in batch 4) and skipped both times for the same documented reason: FEMA's own Risk
Rating 2.0 methodology page states flood-insurance pricing uses individualized per-property rating
factors (location, elevation, structure dimensions, replacement cost, flood history) with no
published public formula — there is nothing generalizable to build a static-formula calculator
from, and policyholders are told to get a quote from their own insurer/agent instead. This is an
honest, evaluated skip, not a shortfall from running out of time or ideas.

**Sub-grouping decision: yes, grouped.** 15 calculators across what would otherwise be one flat
list clears the same bar every other grouped category (biology, ecology, fun, …) used before its
own retrofit. `'insurance'` was added to `data/calculators/categories.spec.ts`'s
`GROUPED_CATEGORIES`, and every one of the 15 calculators got a `group` field matching the batch
themes above (Auto & Property absorbed `umbrella-insurance-coverage-calculator` from batch 4,
since its inputs are the auto/home liability limits rather than anything life/health-specific;
the other two batch-4 calculators formed their own small "Everyday & Planning" group rather than
being forced into one of the batch 1-3 groups they don't thematically fit).

**Category is closed.** No further insurance batches are planned under step 63 — any future
insurance calculator (if one comes up) would be a standalone addition against this now-settled
15-calculator, 4-group baseline, not a continuation of this step.

Final numbers: `npm test` 1703/1703 (snapshot regenerated, additive-only diff), lint clean,
`npm run build` green (526 calculator pages site-wide). Branch `step/63-insurance-batch4`, PR #149.

## Progress — batch 3 (this branch: `step/63-insurance-batch3`, draft PR #145)

- [x] `car-insurance-coverage-calculator` — cites III.org's "auto insurance basics" article (state
      minimums may not cover a serious accident, consider higher limits to protect assets) and
      NAIC's "auto-insurance.htm" (judgment beyond your limit, you pay the difference; a totaled
      car's payout caps at actual cash value). Liability-coverage floor is explicitly labeled this
      calculator's own simplified planning heuristic (assets + 1 year of income), not an official
      formula from either source — matches the step file's "frame as a starting point, don't
      assert one number as universal" instruction.
- [x] `gap-insurance-calculator` — vehicle purchase price + loan balance + typical depreciation
      curve → loan-to-value gap; the gap amount a standard auto policy's actual-cash-value payout
      would leave uncovered on a total loss while a loan balance still exceeds the car's value.
- [x] `renters-insurance-contents-value-calculator` — room-by-room personal-property inventory
      summed into a total replacement-cost estimate, the figure a renters policy's personal
      property coverage limit should meet or exceed.
- [x] `home-insurance-rebuild-cost-calculator` — square footage × local cost-per-square-foot →
      dwelling rebuild cost, kept explicitly separate from market value (land excluded) per
      III.org's own rebuild-cost-vs-market-value distinction; a 2,200 sq ft home at $150/sq ft
      worked example reproduces III's $330,000 framing exactly (about 103.1% of a $320,000 market
      value, land value shown separately for comparison only).

`npm test` 1685/1685 (added a `KNOWN_NON_FINITE` entry for `home-insurance-rebuild-cost-calculator`'s
`rebuildCostPercentOfMarketValue` at a $0 market-value edge case — the same divide-by-zero-min
pattern as every other entry in that table), lint clean, `npm run build` green. `insurance` now
12/~16-18, site-wide **514**.

**Flood insurance decision:** confirmed via direct WebFetch of fema.gov/flood-insurance/risk-rating
that NFIP's Risk Rating 2.0 uses individualized per-property rating factors (location, elevation,
structure dimensions, replacement cost, flood history) with no published public formula —
policyholders are told to contact their insurer/agent for their specific rate. This matches the
step file's skip-candidate note exactly: there is no generalizable, citable methodology to build a
clean static-formula calculator from. **Decision: skip `flood-insurance-cost-estimator`.** Not
built, not parked as a "fix later" item — documented here as an evaluated-and-skipped candidate.

**Research note:** WebSearch's quota was exhausted on the very first query this session (same
budget shared across the day's sessions per the step file's batch-2 note). Fell back to direct
WebFetch on known/guessed URLs for every citation — iii.org and content.naic.org both required
several guessed URL variants before finding ones that resolved (many iii.org article slugs 404,
and the working ones were found by fetching `iii.org` itself and reading its live nav links).
No citation in the shipped copy is unverified.
