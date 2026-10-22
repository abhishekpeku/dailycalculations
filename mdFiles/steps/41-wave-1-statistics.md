# Step 41 — Wave 1: statistics (new calculators)

Second sub-wave of Wave 1 (`mdFiles/STATUS.md` row 40–42), after the math sub-wave (step 40,
29 calculators, PR #15–#20, merged). Builds the ~25-calculator statistics list from
`mdFiles/calculator-rollout-plan.md` §4 Wave 1, in runs of 5, following the exact structure,
conventions and lessons of `mdFiles/steps/40-wave-1-math.md`.

## Progress

- Run 1 (this run): **mean-median-mode-calculator, standard-deviation-calculator,
  variance-calculator, z-score-calculator, percentile-calculator** — plus adding the `statistics`
  category itself.
  - [x] Add `statistics` category (`data/calculators/index.ts` categories array + `calculatorOrder`,
    `data/calculators/statistics.ts`, `lib/categoryTheme.ts` purple/`chart` — new icon added to
    `components/IconTile.tsx`)
  - [x] Shared "data list" input helpers at the top of `statistics.ts` (see below)
  - [x] mean-median-mode-calculator (type B — breakdown, data list)
  - [x] standard-deviation-calculator (type B — breakdown, data list; population + sample shown)
  - [x] variance-calculator (type B — breakdown, data list; population + sample shown)
  - [x] z-score-calculator (type A — solver, 4 variables)
  - [x] percentile-calculator (type B — breakdown, data list + target percentile)
  - [x] Snapshot tests (`npm run test:update`), `KNOWN_NON_FINITE` entries for
    `standard-deviation-calculator`/`variance-calculator` (`howMany=1` → sample divides by 0) and
    `z-score-calculator` (`standardDeviation=0` → divide by zero)
  - [x] `npm test` (367/367), `npm run build` (117 static pages, up from 111), `npm run lint` — all pass
  - [x] Spot-check the 5 pages + `/categories/statistics` + sitemap on a local server, kill the server
  - [x] Update `mdFiles/STATUS.md`, open/ready the PR

## Planned run breakdown (all ~25, for later sessions — not built yet beyond run 1)

The plan's statistics list (§4 Wave 1) has 25 named topics. Grouped into 5 runs of 5, in the same
order the plan lists them:

- **Run 1 (this run):** mean/median/mode, standard deviation, variance, z-score, percentile.
- Run 2: confidence interval, margin of error, sample size, p-value, quartile/IQR.
- Run 3: probability, permutation, combination, binomial distribution, normal distribution.
- Run 4: correlation, linear regression, t-test, chi-square, standard error.
- Run 5: relative risk, odds ratio, expected value, coefficient of variation, outlier.

Subject to the same kind of mid-run dedupe/scope decisions math run 1 made — re-evaluate each run's
list against what already exists before building it.

## The shared "data list" input (new reusable pattern, documented per the task's instructions)

**Kit gap, same as `average-calculator`/`weighted-average-calculator` (step 40 run 2; see
`STATUS.md` Parked, "No list/array input in the calculator kit"):** every `CalculatorInput` is one
number — there is no free-form "enter a list of numbers" field in the kit, and building one (a
real add/remove-row component) is a `components/` + `lib/breakdown.ts` change big enough to be its
own step, not something to improvise mid-calculator. The Parked note from step 40 explicitly
predicted the statistics category would "hit the same wall repeatedly," so this run formalizes the
stopgap into small, named, dependency-free helpers at the top of `data/calculators/statistics.ts`,
instead of re-deriving the pattern by hand in every calculator the way `average-calculator` did
before it was a named convention:

```ts
const MAX_LIST_SIZE = 10;

function listCountInput({ defaultValue, min, label }): CalculatorInput   // "How many numbers?" menu, min..10
function listValueInputs(defaults: number[]): CalculatorInput[]          // value1..value10 numbered slots
function readList(values, min): number[]                                 // slots.slice(0, clamp(howMany, min, 10))
```

- **Count selector + array slicing, never a 0-sentinel** (the rule the step-40-run-2 fix
  established): `compute()` always reads exactly `slots.slice(0, howMany)`, zeros included. A
  typed 0 is a real data point (a 0 test score, a 0°C reading), never silently dropped.
- **`MAX_LIST_SIZE = 10`**, one more than `average-calculator`'s 8: statistics measures (a mode, a
  percentile) read better with slightly more data points than a plain average needs, but the kit's
  fixed-slot ceiling is still the limiting factor, not a deliberately chosen statistical minimum.
  5 slots visible by default, the rest behind a disclosure — same UI shape as `average-calculator`.
- **`min` is deliberately 1, not 2, on every list calculator in this run** (including the two that
  compute a *sample* statistic, standard deviation and variance) — see "Edge cases" below for why.
- **Empty list and non-numeric tokens are prevented by construction, not by a runtime check.** The
  count selector's own `min: 1` means "0 numbers" is never a selectable option, and every slot is
  `type: 'number'`, so there is no code path that receives an empty list or a non-numeric token in
  the first place — recorded here honestly rather than claiming a guard that doesn't exist.
- **Huge lists** are capped at `MAX_LIST_SIZE = 10` by construction, same reasoning as
  `average-calculator`'s cap and `prime-factorization-calculator`'s 6-slot cap (step 40 run 4) — a
  fixed-slot kit cannot represent "as many numbers as you want," so the honest move is a stated
  cap, not a fake unbounded field.

Every future list-based statistics calculator (confidence interval's sample data, correlation's
paired lists, etc.) should reuse these three helpers rather than re-deriving the pattern, exactly as
this note asks.

## Type decisions (run 1)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| mean-median-mode-calculator | B | A list has no single invertible equation. Uses the shared data-list helpers (`min: 1`, default count 5). **Mode, the one output with no natural numeric shape**: returns `primaryMode` (the smallest value tied for the highest frequency) and `modeCount` (how many distinct values are tied there) as two plain numbers instead of a list, since `compute()` can only return `Record<string, number>`. **No-mode / multimodal convention, stated explicitly in content**: if every value in the list is distinct (max frequency 1) *and* there is more than one value, there is no mode — `modeCount: 0`, `primaryMode: NaN` (renders as "—", the kit's existing non-finite convention). A single-value list is the one exception: its sole value counts as its own trivial mode (`modeCount: 1`) rather than "no mode," so the `min: 1` edge case never produces a NaN that would need a `KNOWN_NON_FINITE` entry. Multimodal data (two or more values tied at the max frequency) is reported honestly via `modeCount > 1`, not silently collapsed to one value. **Dedup decision**: `average-calculator` already claims the alias "mean calculator" — this page's aliases avoid that exact phrase ("mean median mode calculator", "measures of central tendency calculator", "median calculator", "find the mode calculator") and its content explicitly cross-links to `average-calculator` for a plain mean with no median/mode, rather than re-teaching the mean from scratch or colliding on an alias. | CompareBars: lowest value / mean / highest value |
| standard-deviation-calculator | B | Standard deviation of a list has no solver shape. Uses the shared data-list helpers, but with **`min: 1`, deliberately not 2** — the task explicitly asks for the single-value edge case to produce "an honest message," not to be unselectable. **Population vs. sample, shown side by side and explicitly labeled** (the task's required decision point): `populationStdDev` (÷ n) and `sampleStdDev` (÷ n−1) are both always computed and both always visible as named rows — this page does not pick a silent default and hide the other one. The headline is `sampleStdDev` (the more common default across spreadsheet software — Excel `STDEV`/`STDEV.S`, Google Sheets `STDEV`, R's `sd()` — all divide by n−1 by default), with `populationStdDev` immediately below it at equal visual weight, not buried. **`KNOWN_NON_FINITE`**: at `howMany = 1` (the automated edge case), `sampleVariance`/`sampleStdDev` are a genuine 0 ÷ 0 — a single value has no sample standard deviation, registered and explained in `watchOut`/FAQ rather than hidden; `populationStdDev` stays a legitimate finite 0 (a single point has no spread). | CompareBars: population standard deviation vs. sample standard deviation |
| variance-calculator | B | Same shape and same population/sample duality as `standard-deviation-calculator` — deliberately kept in lockstep with it (same `min: 1`, same `KNOWN_NON_FINITE` keys, same headline-is-sample convention), the same "kept in lockstep" precedent `area-calculator`/`volume-calculator`/`surface-area-calculator` set in step 40 run 5. **Not a near-duplicate of standard-deviation-calculator**: the plan's own list names them as two separate topics (unlike "mixed number"/"proportion" in math run 1, which were explicitly folded together), and variance and standard deviation answer different practical questions (variance is used directly in further statistical formulas; standard deviation is the one in the same units as the original data) — the content for each explicitly cross-links to the other ("this variance's square root is the standard deviation calculator's answer") using the **same worked-example numbers** on both pages, so a reader can verify the relationship directly instead of being given two unrelated examples to reconcile by hand. Also surfaces `populationStdDev`/`sampleStdDev` as two extra reference rows underneath the variance figures, tying the pages together concretely. | CompareBars: population variance vs. sample variance |
| z-score-calculator | A (solver, 4 variables) | `z = (x − μ) ÷ σ` is one equation over four quantities (value, mean, standard deviation, z-score) — more variables than `force-calculator`'s three, but the solver widget's "least recently edited field is auto" rotation is generic over any variable count (confirmed directly in `components/SolverCalculator.tsx`, which computes "any N−1 values" from `solver.variables.length`, not a hardcoded 3), so this is a direct, unmodified application of the existing solver model. All four directions are closed-form: `solve.z`, `solve.x = μ + zσ`, `solve.mean = x − zσ`, and `solve.sd = (x − μ) ÷ z`, the last one additionally guarded to refuse (`NaN`) a non-positive result, since a standard deviation cannot be zero or negative — flagged in `watchOut`, not silently returned as a negative number. All four variables use `dimension: 'count'` (plain numbers, the same dimensionless convention `exponent-calculator` uses for base/exponent/result), since a z-score is a unitless comparison, not a physical quantity. | RangeBar: the z-score plotted against 5 contiguous bands from −4 to +4 (far below average / below average / typical (±1 SD) / above average / far above average) — the standard "how unusual is this value" reading of a z-score, the same kind of classification `RangeBar` already does for BMI's WHO bands |
| percentile-calculator | B | Rank-and-interpolate has no solver shape — a list plus one target percentile, no single invertible equation. Uses the shared data-list helpers (`min: 1`, default count 6) plus one extra `targetPercentile` input (0–100, type `percent`). **Method, stated explicitly per the task's instruction ("there are several; pick one, cite it, say so")**: the linear interpolation between closest ranks method from the NIST/SEMATECH Engineering Statistics Handbook — `rank = (P ÷ 100) × (n − 1) + 1`, then linear interpolation between the two closest sorted values — the same method Microsoft Excel's `PERCENTILE`/`PERCENTILE.INC` functions use, chosen because it is both a primary-source-documented method and the one most "percentile calculator" search intent actually expects (not the simpler, more clinical "nearest rank" method also in common use, which this page explicitly says it is *not* using, in a watch-out item). **No `max` field on `CalculatorInput`** (confirmed in `data/calculators/types.ts` — only `min` exists, the same kit gap `prime-factorization-calculator` and `lcm-calculator` already worked around in step 40 run 4): `targetPercentile` cannot be capped at 100 at the input-field level, so `compute()` clamps it to `[0, 100]` itself and a watch-out item says so explicitly, rather than silently producing a meaningless "120th percentile." At `n = 1` the rank formula always resolves to rank 1 regardless of the target percentile (there is only one value to return), handled by the formula itself with no special-case branch. | CompareBars: lowest value / your Pth percentile / highest value |

## Dedup / overlap check (run 1)

- **`average-calculator` (step 40) already claims "mean calculator" as an alias.**
  `mean-median-mode-calculator`'s aliases were written to avoid that exact phrase (see the table
  above); its content cross-links to `average-calculator` for readers who want a plain mean with no
  median/mode, and its `related` list includes `average-calculator` and `weighted-average-calculator`.
  Per the existing one-directional-linking precedent from step 40 run 2 (`weighted-average-calculator`
  links to `gpa-calculator` without `gpa-calculator`'s own `related` list being edited back),
  `average-calculator`'s own file is **not** touched by this run — editing an already-shipped math
  calculator is out of this run's scope (built only what was asked; see `CLAUDE.md`).
- No other existing calculator or alias overlaps any of this run's 5 ids, aliases or concepts —
  checked programmatically against the full `aliases`/`related`/`id` set (see Verification).

## Verification

Every number in the copy (worked examples, FAQ figures, the `example` line) was recomputed
independently in `verify_run1.mjs` (scratchpad, plain Node, no app imports) *before* any code was
written, then the app's own `compute()`/solver output was generated via `npm run test:update` and
diffed against the script's numbers directly in the regenerated snapshot file — 0 mismatches:

- **mean-median-mode-calculator**: sum 41, mean 8.2, median 8, mode 7 (tied count 1), min 7, max 10,
  range 3 — all match the snapshot exactly.
- **standard-deviation-calculator / variance-calculator** (same shared worked example, 72/85/90/78/95):
  mean 84, sum of squared deviations 338, population variance 67.6, sample variance 84.5, population
  SD ≈ 8.221921916437786, sample SD ≈ 9.192388155425117 — all match the snapshot to full float
  precision.
- **z-score-calculator**: z = 0.75 for x=1200, μ=1050, σ=200; the three inverse solves
  (`x = μ + zσ`, `μ = x − zσ`, `σ = (x − μ) ÷ z`) were each checked by feeding the forward result
  back in and recovering the original input exactly.
- **percentile-calculator**: for sorted [55, 60, 65, 70, 78, 90] — rank at P=75 is 5.25, giving
  78 + 0.25 × (90 − 78) = **81**; rank at P=50 is 3.5, giving 65 + 0.5 × (70 − 65) = **67.5**, which
  independently matches the plain "average of the two middle values" median formula, confirming the
  two definitions agree at exactly the 50th percentile for this method. Boundary behavior (P=0 → min,
  P=100 → max, P=150/−20 → still clamp to max/min, a single-value list → that value for any P) was
  also checked directly in the script and matches the shipped `compute()`.

**Reference accuracy, fetched and quoted directly before citing** (not guessed):
- OpenStax *Introductory Statistics 2e* §2.5 "Measures of the Center of the Data" (already used for
  `average-calculator`) — reused for mean/median/mode and percentile-calculator's second reference.
- OpenStax *Introductory Statistics 2e* §2.7 "Measures of the Spread of the Data" — fetched directly;
  confirmed it states the population formula `σ = √(Σ(x−μ)²/N)` and sample formula
  `s = √(Σ(x−x̄)²/(n−1))` verbatim, with the n vs. N / s vs. σ notation this run's content uses.
- OpenStax *Introductory Statistics 2e* §6.1 "The Standard Normal Distribution" — fetched directly;
  confirmed the exact z-score formula `z = (x − μ) ÷ σ` and its "how many standard deviations above
  or below the mean" interpretation.
- NIST/SEMATECH *Engineering Statistics Handbook* §7.2.6.2 "Percentiles" — fetched directly (the
  handbook has moved/redirects at the commonly-guessed `prc252.htm` URL; the live page is
  `prc262.htm`, found by search and fetched before citing). Its actual documented method is
  `p(N+1) = k + d` with linear interpolation `Y(p) = Y(k) + d(Y(k+1) − Y(k))` — Hyndman & Fan's "type
  6" definition. **Correction made before writing any copy**: an earlier draft of this run's plan
  assumed this was the same method as Excel's `PERCENTILE`/`PERCENTILE.INC` ("type 7": rank =
  P/100 × (n−1) + 1) — fetching the actual NIST page showed this is false; they are two different,
  equally standard conventions that usually agree closely but not exactly. The shipped calculator
  uses NIST's actual formula, not the Excel one, and a watch-out item on the page says explicitly
  that Excel can give a slightly different answer and why, rather than asserting a false equivalence.
- Wolfram MathWorld: Statistical Median, Mode, Standard Deviation (×2 pages, standard-deviation- and
  z-score-calculator), Variance — all URLs confirmed live by direct fetch/search before citing.

**Data-integrity check**, run programmatically against the live data module for all 5 new
calculators (`check_integrity_tmp.mjs`, deleted after use): 88 total calculators, 0 duplicate ids,
0 broken `related` ids, 0 self-references, 0 new duplicate aliases (the one pre-existing alias
collision, "house loan emi calculator" on `emi-calculator`/`mortgage-calculator`, predates this run
and is untouched by it); every new `seo.title` ≤ 60 characters and `seo.description` ≤ 160
characters, 8 FAQs and 4–5 aliases/4 related ids each.

`npm test` 367/367 (up from 354), `npm run build` (117 static pages, up from 111),
`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` all pass. All 5
pages spot-checked on a local dev server: H1, every v2 section id (concept, how-to-use, formula,
worked-example, watch-out, faq, references, related), exactly one JSON-LD `<script>` tag per page,
and the correct widget mounted (`breakdown-howMany` for the 4 type-B calculators,
`solver-value`/`solver-mean`/`solver-standardDeviation`/`solver-zScore` for z-score-calculator);
`/categories/statistics` links to all 5 new ids and `sitemap.xml` lists all 5 plus the new category;
dev server killed and port 3000 confirmed free (no `LISTENING` entry) afterward. `next-env.d.ts`
reverted before committing (a stray build-time diff, same as previous runs' note).

**Dedup / overlap check, confirmed with the data-integrity script above**: no alias or id collision
between `mean-median-mode-calculator` and `average-calculator`'s existing "mean calculator" alias.

**Paused / resumed:** run 1 is complete — category added, all 5 calculators built, tested, verified
and pushed. Next session picks up run 2: confidence interval, margin of error, sample size,
p-value, quartile/IQR.
