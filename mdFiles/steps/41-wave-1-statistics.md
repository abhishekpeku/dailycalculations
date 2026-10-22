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

---

## List input (between run 1 and run 2)

User-approved work inserted before statistics run 2: a reusable paste-a-list textarea input for
the type-B widget, replacing the "How many numbers?" + 10 numbered slots stopgap
(`listCountInput`/`listValueInputs`/`readList`/`listGroups`, `MAX_LIST_SIZE = 10`) that run 1 used
and that the pre-existing Parked note ("No list/array input in the calculator kit") predicted this
category would hit repeatedly. Real users paste 20–1,000 values; a fixed 10-slot form cannot take
that. Branch `step/41-list-input`.

### Progress

- [x] Design written here before coding (this section)
- [x] Branch `step/41-list-input` from `origin/master`, draft PR opened early
- [x] `lib/listParse.ts` — pure parser (`parseNumberList`, `formatNumberList`, `LIST_MAX`) + `lib/listParse.spec.ts`
- [x] `data/calculators/types.ts` — `type: 'list'` on `CalculatorInput` (+ `listDefault`/`listMin`/`listMax`), `compute()` gains a second `lists: Record<string, number[]>` parameter
- [x] `lib/breakdown.ts` — `computeLists`, list-aware `computeValues`/`evaluateBreakdown` completeness, list-aware `breakdownShareParams`/`readBreakdownShareParams`, list-aware `initialBreakdownState`
- [x] `components/CalculatorWidget.tsx` — `ListFieldRow` (textarea, live count, inline error, `aria-describedby`)
- [x] `components/BreakdownCalculator.tsx` — routes `type: 'list'` inputs to `ListFieldRow`
- [x] `lib/calculator.ts` — `evaluateCalculator` (dead export) updated for the new `compute()` signature, for type-correctness only
- [x] `data/calculators.spec.ts` — snapshot harness builds `{ values, lists }` per input set (default/typical/edge), list inputs excluded from the old scalar-only path
- [x] Retrofit `mean-median-mode-calculator`, `standard-deviation-calculator`, `variance-calculator`, `percentile-calculator` (statistics) and `average-calculator` (math) onto the list input; remove the now-unused `listCountInput`/`listValueInputs`/`readList`/`listGroups`/`MAX_LIST_SIZE` helpers from `statistics.ts`
- [x] `weighted-average-calculator` — decision recorded below, **not** retrofitted
- [x] Snapshot tests regenerated for the 5 retrofitted calculators (`npm run test:update`), diffs explained below
- [x] `npm test`, `npm run lint`, `npm run build`
- [x] Spot-check in dev: paste a 50-value list on `mean-median-mode-calculator`, share link round-trip; kill the dev server
- [x] Update `mdFiles/STATUS.md` (row 40–42 + session log), resolve the Parked "No list/array input" note
- [x] Mark PR ready

### Design decisions

**Type: a new `CalculatorInput.type: 'list'`, not a change to the shape of `number`.** Added fields
`listDefault?: number[]` (shown in the textarea by default), `listMin?: number` (default 1),
`listMax?: number` (default `lib/listParse.ts`'s `LIST_MAX = 1000`). `defaultValue`/`step`/`min` stay
on the type (every other input type still needs them) but are unused for `'list'`; `placeholder` is
reused as-is for the textarea's HTML `placeholder` — no new field needed for that.

**`compute()` gets a second parameter, not a union type on the first one.** The instructions offered
two options: `values: number | number[]` on the existing record, or a separate `lists` argument. A
union would force every existing `compute(values) { ... values.x * 2 ... }` body to narrow `values.x`
before any arithmetic — a mechanical but real edit to every one of the ~90 existing calculators just
to keep them compiling. A second parameter needs no such edit: `CalculatorConfig['compute']` is now
`(values: CalculatorInputValues, lists: Record<string, number[]>) => Record<string, number>`, and a
function expression with fewer declared parameters than its type's signature is valid TypeScript (the
same reason `.map((x) => ...)` ignoring the index/array parameters compiles) — every existing
`compute(values) { ... }` still type-checks unchanged, and still behaves identically, because nothing
calls the second parameter unless a calculator's own body reads `lists`. `CalculatorInputValues`
(`Record<string, number>`) is untouched, and list inputs are deliberately kept **out** of it — a list
id never appears as a key in `values`, so the existing "every value in `values` is finite ⇒ complete"
check in `evaluateBreakdown` needed no change to stop firing on an array.

**Separators: comma, whitespace (space/tab/newline) or semicolon, any mix, any amount.**
`lib/listParse.ts`'s `parseNumberList` splits on `/[,;\s]+/`, so a pasted spreadsheet column
(newline-separated), a comma-separated line, and a messy mix of both split identically. Decimal is a
dot; a comma is always a separator, never a decimal mark — stated here and in the Parked note below,
since the site's region system (`lib/regions.ts`, step 18, not yet built) will eventually need a
comma-decimal locale (EU) and this parser does not attempt to guess which role a comma plays. No
`eval`/`new Function` anywhere: every token is tested against a strict regex
(`/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i`) before `Number()` ever sees it, so arbitrary input can
only ever become a number or be rejected, never executed.

**Bad tokens: parsed numbers are kept, non-numeric tokens are dropped and reported — not a hard
refusal.** Chosen over rejecting the whole paste on the first bad token, because a single stray
token (a trailing "total:", a copy-pasted unit) in an otherwise-good 200-value paste is extremely
common, and discarding the other 199 valid numbers over one bad token is a worse user experience than
quietly using the good ones. The widget states this honestly: `ListFieldRow` shows a live count of
numbers actually parsed, and when any tokens were dropped it lists up to 5 of them verbatim (with a
total count) in a message tied to the textarea via `aria-describedby`, so nothing is silently wrong —
the user sees exactly what was ignored and can fix it. `-0` normalizes to `0` (not kept as a distinct
negative zero) since nothing in the kit treats them differently and showing "−0" back to a user who
typed `-0` would read as a bug.

**Cap: 1,000 values (`LIST_MAX`), silently enforced by keeping only the first 1,000 and flagging it
(`ParsedList.truncated`).** Matches the instructions' "~1,000" and the existing fixed-slot cap
precedent (`MAX_LIST_SIZE = 10` before this, `prime-factorization-calculator`'s 6-slot cap, etc.) —
every list-shaped input in this kit states an honest, visible ceiling rather than claiming an
unbounded field. A calculator can override it per input via `listMax` if a smaller cap ever makes
sense; none of the 5 retrofits does.

**Share links: compact and re-canonicalized on both write and read.** `breakdownShareParams` encodes
a list input as `formatNumberList(parseNumberList(...).values)` — comma-joined with no separating
spaces or line breaks, and only the numbers that actually parsed, so 50 pasted values with stray
whitespace share as `1,2,3,...` rather than carrying the user's original formatting into the URL.
`readBreakdownShareParams` re-parses on the way back in and additionally refuses any list parameter
longer than `MAX_SHARE_LIST_CHARS` (12,000 characters — comfortably above what 1,000 numbers need,
comfortably below a URL-length problem) by falling back to the default list entirely, so a
hand-edited or malicious URL can't blow up the address bar.

**Widget: `BreakdownCalculator`'s `renderField` gets a third branch, `ListFieldRow`, ahead of the
existing `options`/plain-number branches.** No change to `SolverCalculator` — no solver calculator
needs a list input yet, and the type-B widget is the only one the instructions asked to retrofit.
`ListFieldRow` lives in `components/CalculatorWidget.tsx` beside `FieldRow`/`ChoiceRow`, the other
widget-shared row components, and is a plain controlled `<textarea>`: the label, a live
`N numbers` counter, and (only when non-empty) one `<p>` carrying every active note — ignored-token
list, truncation, or "enter at least N numbers" — wired to the textarea with `aria-describedby` and
`aria-invalid`. No row-level unit menu (list inputs have no `dimension`), matching how a plain
`currency`/`percent` field already renders without one.

**Mode as text: not done.** The task allowed listing all tied modes as text "only if cheap." It is
not cheap: `BreakdownOutput`/`compute()`'s return type is strictly `Record<string, number>`
site-wide, and `formatOutput` only knows how to print a number. Threading a text-shaped result
through that path would be a second, unrelated type change touching every calculator's output
typing, not a one-line addition — parked below rather than improvised here. `mean-median-mode-calculator`
keeps its existing `primaryMode`/`modeCount` pair from run 1 unchanged.

**`weighted-average-calculator`: kept as paired boxes, not retrofitted.** A "clean two-list design"
(one list of values, one same-length list of weights) would need the two lists kept in lockstep by
position with no shared-length enforcement anywhere in the kit — a wrong-paste-length bug (49 values,
50 weights) would silently mispair every component after the mismatch, with no mechanism in this
change to catch it. That is a real design problem worth its own step with its own validation, not a
corner to cut inside this one. The existing 6-pair value/weight boxes are unaffected.

**`average-calculator`'s minimum count changes from 2 to 1.** The old count selector's `min: 2` was
never a mathematical requirement — a one-number "average" is trivially that number — it was just the
count-selector's own default floor, copied from nowhere in particular. Retrofitting onto `listMin: 1`
matches the convention every statistics list input in this file already uses (`min: 1`, "a single
value is a legitimate data point, not an error") rather than inventing a different floor for the one
math-category retrofit. No other behavior changes: the formula, the worked example (85, 90, 78, 92 →
86.25) and every FAQ figure are untouched.

**Content edits are mechanical, not a rewrite.** Each retrofitted calculator's `concept` paragraphs,
`workedExample`, and the math itself are untouched — the numbers were already independently verified
in run 1 (and for `average-calculator`, in step 40 run 2) and nothing about *how* the formula works
changed, only *how numbers get in*. Only the sentences that described the old mechanism directly
("Choose how many numbers you have, then fill in exactly that many of the number fields, in order
starting from Number 1," "Set 'How many numbers?' to...," "Add up to N more numbers," the FAQ
question "How many numbers can this calculator use?") were rewritten to describe pasting a list
instead, plus one new watch-out item per retrofitted calculator about non-numeric tokens being
dropped and the 1,000-value cap.

### Snapshot diffs (explained)

All 5 retrofits change their `inputs` shape in the snapshot from the old `howMany`/`value1..value10`
(or `value1..8` for `average-calculator`) scalar fields to a single `data: number[]` list (plus
`targetPercentile` unchanged on `percentile-calculator`). The **`default` row's `outputs` are
numerically identical** to the pre-retrofit snapshot on every one of the 5 (mean 86.25, mean 8.2,
percentileValue 81, population/sample figures unchanged, etc.) — `listDefault` carries the exact same
numbers the old `value1..N` slots used, and the formulas (`varianceOf`, `percentileOf`, the
mean/median/mode logic) are untouched; only *where* the array comes from changed (`lists.data`
instead of `readList(values, min)`).

The **`typical` and `edge` rows' `outputs` do change**, and that is the harness's own synthetic input
generation changing, not the calculators: the old harness scaled a scalar `howMany` field by 1.5 and
zero-padded unused `value*` slots up to 10, so e.g. `average-calculator`'s old "typical" case averaged
6 slots (4 real values scaled ×1.5, plus 2 zero-padded slots it shouldn't have counted) into a mean of
86.33; the new `edgeList`/`typicalList` in `data/calculators.spec.ts` instead scale exactly the
`listDefault` array's own values (4 values in, 4 values out, no padding), giving a mean of 129.5 for
the same calculator — a more honest "typical" case, with no artifact of the old fixed-slot shape
leaking into the test. The `edge` row is unchanged in substance: the old edge case was `howMany` at
its `min` with every `value*` slot at `0` (i.e., a list of `min` zeros); the new edge case is literally
"`listMin` zeros" — the same list, just without the other 9 (unused) zero-padded slots cluttering the
snapshot. `KNOWN_NON_FINITE` needed no edits — `standard-deviation-calculator`/`variance-calculator`'s
sample-variance-at-n=1 divide-by-zero and `z-score-calculator`'s divide-by-zero are unchanged.

### Verification

Re-ran the retrofit's own scratch check (`verify_list_input.mjs`, scratchpad, plain Node) comparing
each retrofitted calculator's shipped `compute()` output against the exact run-1 worked-example
figures it must still produce (mean-median-mode: mean 8.2/median 8/mode 7; standard deviation ≈
8.221921916437786 (population) / ≈ 9.192388155425117 (sample); variance 67.6/84.5; percentile 81 at
P=75, 67.5 at P=50; average-calculator 86.25) — 0 mismatches, confirming the list-input retrofit did
not change a single number. `lib/listParse.spec.ts` covers separators (comma/space/tab/newline/
semicolon, mixed), an empty/whitespace-only string, bad tokens (reported, not silently dropped from
the return), the 1,000 cap (`truncated: true`, exactly 1,000 kept), scientific notation
(`1e3`/`1.5E-2`), negative numbers, and `-0` normalizing to `0`.

### Parked (new)

- **List input is not locale-aware.** Decimals are always a dot; a comma is always a separator,
  never a decimal mark. `lib/regions.ts` (step 18, not yet built) will need an EU comma-decimal mode
  eventually — when it lands, `parseNumberList` needs a locale-aware variant (or a region-aware
  separator set) alongside it. Noted here and in `STATUS.md`'s Parked list.
- **Mode-as-text output.** Listing every tied mode as text (not just `primaryMode`/`modeCount`) needs
  a text-shaped result type threaded through `BreakdownOutput`/`compute()`'s return type and
  `formatOutput` — a real, separate kit change, not a one-line addition. Not done.
- **`weighted-average-calculator`'s two-list design.** A value-list + weight-list pairing needs a
  length-mismatch guard the kit does not have yet. Not done; see the decision above.

### Pre-merge review fix (2026-10-22): thousands separators, unicode minus, currency, percent

Pre-merge review of PR #22 found that `parseNumberList` silently gave a wrong answer on exactly the
input real users paste most: a thousands-separated number. `"1,000, 2,500, 3,000"` parsed to
`[1, 0, 2, 500, 3, 0]` (every comma was always a value separator, no exceptions), `"−3"` (U+2212, the
typographic minus every browser's number-formatting and Word/web copy-paste actually produce, not
the ASCII hyphen) was dropped as unparseable, and `"$12.50, $8"` / `"45%, 50%"` were dropped
entirely. None of this showed up as a build/lint/test failure — it is a silent-wrong-result class of
bug, not a crash, which is exactly why it was flagged as a mandatory pre-merge fix rather than left
for a later cleanup.

**The disambiguation rule (thousands commas vs. separator commas):** a token's internal comma(s) are
read as thousands separators — `GROUPED_NUMBER = /^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/`, i.e. a 1-3 digit
group then one or more exactly-3-digit groups, optionally with a decimal tail — **only when the
whole input also uses some other separator** (whitespace or a semicolon) between its values. If the
entire input uses only bare commas with no whitespace anywhere (`"100,200,300"`, `"1,2,3"`), every
comma stays a plain value separator, unchanged from before. This is the only signal that can
disambiguate the two readings at all: `"100,200,300"` is *textually* indistinguishable from the
6-figure number 100200300, and the task that requested this fix explicitly chose "some other
separator present" as the tie-breaker (and gave `"100,200,300"` with no whitespace as the worked
example that must still read as three numbers, not one). Implementation: split the input on
whitespace/semicolon runs first; if that yields more than one chunk, every chunk is tested against
`GROUPED_NUMBER` before anything else; a chunk that doesn't match (e.g. `"1,23"` out of `"1,23, 4"` —
`"23"` isn't a 3-digit group) falls through to being split on its own commas and validated token by
token, so `"1,23, 4"` reads as `1, 23, 4`, not as one failed token. A single trailing comma on a
chunk (`"1,000,"` out of `"1,000, 2,500"`) is stripped first, since it's a separator remnant, not
part of the number.

**Made visible, never silent (the task's explicit requirement):** `ParsedList` gained
`groupedAsThousands: string[]`, the original text of every value whose comma was read as a thousands
separator. `ListFieldRow` shows it as a dedicated, non-error informational line (`"Read "1,000",
"2,500" as thousands-separated — the comma was not treated as a separator between numbers."`),
separate from the amber error line (dropped tokens, the cap, too few numbers) and from
`aria-invalid`, which stays tied only to actual errors — reading a number correctly is not an error
state. Every retrofitted calculator's "non-numeric tokens are dropped" watch-out item, and the shared
list-input placeholder text (now the literal helper text under the box), state the $/%/thousands-
comma rule explicitly rather than leaving it to be discovered.

**Unicode minus and currency/percent affixes**, a single `cleanToken` helper applied to every atomic
token before it is tested: normalizes a leading U+2212 (−) or U+2013 (en dash, –) to an ASCII `-`
(both are what real browsers/Word/web copy-paste actually produce for a minus sign, not the ASCII
hyphen the original regex only accepted); strips one leading currency symbol (`$ £ € ₹ ¥`), keeping
whatever sign is on either side of it (`-$5` and `$-5` both read as `-5`); strips one trailing `%`,
leaving the number unchanged (`45%` reads as `45`, not `0.45` — stated in the helper text, since the
other reading is equally defensible and silently picking one needs saying out loud). Parentheses
negatives (`"(123)"`) and hex (`"0x1F"`) remain unsupported and reported, unchanged — the task asked
to extend affix support, not to add a second number-literal grammar.

**Share-link round trip is unaffected and was explicitly re-tested**: `formatNumberList` always
writes plain `Number`-stringified values with no grouping commas at all
(`formatNumberList([1000, 2500])` → `"1000,2500"`), so a share URL built from a thousands-grouped
paste re-parses through the **bare-comma path** on read-back (no whitespace in the serialized form)
and lands on the exact same numbers — verified directly in `lib/listParse.spec.ts` and
`lib/breakdown.spec.ts` (`breakdownShareParams`/`readBreakdownShareParams`), not just asserted.

**Known, accepted remaining gap** (documented in `lib/listParse.ts`'s module comment, not silently
left out): several *lines*, each itself a bare comma-separated list with no other separator within
the line but a newline *between* lines (`"100,200,300\n400,500,600"`), still reads every in-line
comma as a thousands separator, because the rule is evaluated over the *whole* input and a newline
is present somewhere in it. This exact shape was not in the task's test list; the fix follows the
task's stated rule exactly (an unqualified "whole input" condition) rather than inventing an
additional per-line heuristic the task didn't ask for. Rare in practice (a multi-line paste where
every single line independently needs 3+ grouped values with nothing else distinguishing them from
a flat list); noted here and in `STATUS.md`'s Parked list as a residual limitation of the rule as
specified, should it ever come up.

**Verification**: all 5 retrofitted calculators' worked-example numbers were re-checked against
`verify_list_input.mjs` (scratchpad, plain Node, no app imports) after this fix and are byte-for-byte
unchanged (mean 8.2/median 8/mode 7; population SD ≈8.221921916437786/sample SD
≈9.192388155425117; population/sample variance 67.6/84.5; percentile 81 at P75, 67.5 at P50; average
86.25) — this fix only touches how text is tokenized before `compute()` ever runs, not any formula.
The four exact bug-report inputs were additionally re-run end-to-end through `evaluateBreakdown` (not
just the parser in isolation): `"1,000, 2,500, 3,000"` → mean 2166.67, count 3 (previously wrong);
`"−3"` → mean −3, count 1 (previously dropped); `"$12.50, $8"` → mean 10.25, count 2 (previously all
dropped); `"45%, 50%"` → mean 47.5, count 2 (previously all dropped). 34 parser unit tests (up from
20) and 2 new share-link tests in `lib/breakdown.spec.ts`; `npm test` 403/403, `npm run lint`,
`npm run build` all pass. No existing snapshot changed (this fix is parser/widget-only; `compute()`
and every calculator's default/typical/edge inputs are untouched).

---

## Run 2: confidence interval, margin of error, sample size, p-value, quartile/IQR

Branch `step/41-wave-1-statistics-run-2`, from `origin/master` (which already has run 1 + the list
input merged). Five calculators needing the standard normal and Student's t distributions — the
first calculators on the site that need a probability-distribution module, not just arithmetic.

### Progress

- [x] Branch created, this section written before coding
- [x] `lib/distributions.ts` (`normalCDF`, `normalInverseCDF`, `tCDF`, `tInverseCDF`) +
      `lib/distributions.spec.ts` against published table values
- [x] Independent scratch verification (`verify_run2.mjs`) of the distribution module and every
      worked example, before writing any copy
- [x] confidence-interval-calculator (type B)
- [x] margin-of-error-calculator (type B)
- [x] sample-size-calculator (type B)
- [x] p-value-calculator (type B)
- [x] quartile-calculator (type B, list input, reuses `percentileOf`)
- [x] Snapshot tests (`npm run test:update`), re-diff against the scratch script
- [x] `npm test`, `npm run build`, `npm run lint` all pass
- [x] Spot-check the 5 pages + updated `/categories/statistics` + sitemap on a local dev server, kill it
- [x] Update `mdFiles/STATUS.md` (row 40–42 + session log)
- [x] Mark PR ready

### The distribution module (`lib/distributions.ts`)

No dependency added — everything is hand-written, dependency-free, and unit-tested against
published table values, matching the rest of the kit's numeric code (`lib/solve.ts`,
`lib/amortization.ts`).

- **`normalCDF(z)`**: the Abramowitz & Stegun 7.1.26 rational approximation to `erf` (max absolute
  error 1.5×10⁻⁷), then `Φ(z) = 0.5(1 + erf(z/√2))`.
- **`normalInverseCDF(p)`**: Peter J. Acklam's rational approximation for the standard normal
  quantile function (2003, public-domain algorithm widely used in statistics software), accurate to
  about 1.15×10⁻⁹ relative error over `0 < p < 1`. A closed form, not a root-find — exact and fast
  for every confidence level the calculators need.
- **`tCDF(t, df)`**: the regularized incomplete beta function via the standard Student's t identity
  `P(T ≤ t) = 1 − 0.5·I_x(df/2, 0.5)` for `t > 0` (and the mirror for `t < 0`), `x = df/(df+t²)`.
  The incomplete beta itself is Numerical Recipes' continued-fraction evaluation (Lentz's
  algorithm, `betacf`) with a Lanczos-approximation `logGamma` for the beta prefactor — the
  standard, textbook way to compute it without a dependency.
- **`tInverseCDF(p, df)`**: found by root-finding `tCDF(t, df) − p = 0` with the project's own
  `lib/solve.ts` `findRoot` (Brent's method, already used by the solver widget for rate-type
  variables) rather than a second, separately-erred closed-form inverse-t approximation — `tCDF` is
  strictly monotonic in `t` for any `df > 0`, so there is exactly one root and Brent's method finds
  it to a much tighter tolerance than 6 significant figures.

**Accuracy evidence** (`lib/distributions.spec.ts`, published reference values): `normalCDF(1.96)` ≈
0.975002 (Φ(1.96) = 0.9750021…), `normalInverseCDF(0.975)` ≈ 1.959964 (the standard 95% two-tailed
z-critical value), `normalInverseCDF(0.95)` ≈ 1.644854, `normalInverseCDF(0.995)` ≈ 2.575829,
`tInverseCDF(0.975, 10)` ≈ 2.228139 (the textbook df=10, 95% two-tailed t-table entry),
`tInverseCDF(0.975, 1)` ≈ 12.706205, `tInverseCDF(0.995, 1)` ≈ 63.656741 — all matching published
tables (NIST/SEMATECH's t-table, standard normal tables) to at least 6 significant digits, several to
8-9. Stated accuracy target (the task's instruction): **≥ 6 significant digits** — met with margin.

### Type decisions (run 2)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| confidence-interval-calculator | B | Mean-based CI (x̄, standard deviation, n, confidence level) — not a single invertible equation once a distribution's inverse-CDF is involved, so no `solver`. **z vs. t, explicit mode selector** (the task's required decision point): `mode` 1 = "known population σ (z-interval)", 2 = "only a sample s (t-interval)", default 2 — matching real-world practice, where the population standard deviation is almost never actually known and the t-interval (df = n−1) is the honest default; content explains why t is wider than z for the same confidence level (it accounts for the extra uncertainty of estimating σ from the sample itself) and why the gap shrinks as n grows. Summary-statistic entry (x̄, s, n), not a pasted raw-data list — keeps the page focused on the CI formula itself; content cross-links to mean-median-mode-calculator/standard-deviation-calculator for readers who have raw data and need x̄/s first, the same one-job-per-page precedent `z-score-calculator` already set against `standard-deviation-calculator`. `degreesOfFreedom` (n−1) is always shown, labeled "used in t-mode only," rather than conditionally NaN'd in z-mode — avoids an artificial edge case for a field that is simply unused, not undefined, in z-mode. Confidence level has no natural upper bound in the kit (no `max` on `CalculatorInput`, the same gap percentile-calculator worked around) — `compute()` clamps it to `[0.01, 99.99]`, identically to percentile-calculator's own `targetPercentile` clamp, so a value of exactly 100% (which would mathematically require an infinitely wide interval) degrades gracefully instead of emitting `NaN`. | compareBars: lower bound / sample mean / upper bound |
| margin-of-error-calculator | B | **Proportion-based only, a deliberate and stated scope decision** (the task's phrasing allows "and/or"): a mean-based margin of error is exactly `critical value × standard error`, already fully exposed as the `marginOfError` row on confidence-interval-calculator — building a second UI for the identical arithmetic (with the structural problem that a proportion's margin is a percent and a mean's margin is in the data's own units, which `compute()`'s single fixed `breakdown.headline` key cannot switch between by mode) would either duplicate that page or force an awkward two-headline design; the content explicitly says so and cross-links there instead. Proportion-based is also by far the dominant real-world "margin of error calculator" search intent (survey/poll results). Uses the **Wald interval's margin** (`z × √(p̂(1−p̂)/n)`), stated explicitly as the simplest, most widely taught method, with a watch-out item noting the Wilson interval (used by some statistical software) handles small samples or extreme proportions (p̂ near 0% or 100%) more accurately, where the Wald margin can understate the true uncertainty. **Finite population correction, explicitly optional**: a `populationSize` field defaulting to 0 (meaning "not applied, treat the population as effectively infinite"), applied only when a sensible finite population greater than the sample size is actually given — stated plainly in content/watch-out, not left to be discovered. | compareBars: lower bound / sample proportion / upper bound |
| sample-size-calculator | B | Closed-form rearrangement of the margin-of-error formula for `n`, directly reusing the same `normalInverseCDF` critical value — no solver needed since it is not meaningfully invertible in the other direction (margin of error as a function of a non-integer sample size has no reciprocal "solve for p̂" use case worth a shared widget). **Conservative default `p̂ = 50%`** (the task's instruction): variance `p(1−p)` is maximized at p=0.5, so using 50% when the true proportion is unknown guarantees the resulting sample size is large enough for *any* actual proportion — stated explicitly in content, with a watch-out item that a known-narrower estimate (e.g. "about 20% of customers churn") gives a smaller, still-valid sample size. **Always rounds up** (`Math.ceil`), stated in watch-out and FAQ: a fractional sample size under-covers the stated confidence/margin, so the conventional, honest rule is to round toward more data, never fewer. Same optional finite-population-correction field and default-off convention as margin-of-error-calculator, applied with the standard formula `n_adjusted = n₀ ÷ (1 + (n₀−1)/N)`. | compareBars: exact calculation (unrounded) / sample size needed (rounded up) |
| p-value-calculator | B | A score → one-sided cumulative probability → a tail read-off is not an invertible equation (and the three tail conventions give three different one-way answers from the same inputs), so `solver` does not fit. **z vs. t mode selector**, same pattern as confidence-interval-calculator, `degreesOfFreedom` used only in t-mode (clamped to a minimum of 1, not conditionally NaN'd). **Three tail types** (two-tailed default, left/"less than", right/"greater than") computed directly from the one-sided CDF: two-tailed = `2 × min(CDF, 1−CDF)`, left = `CDF`, right = `1 − CDF` — all three are always well-defined for any finite score and any `df ≥ 1`, so this calculator needed **zero** `KNOWN_NON_FINITE` entries, the first of the five. **Tiny p-values, clamped honestly, not to 0 or float noise** (the task's explicit instruction): `pValue`'s `format: 'significant'` (not `'number'`, which rounds to 2 decimals and would silently show `0.00` for anything under a cent) routes any value under 10⁻³ through `lib/calculator.ts`'s existing scientific-notation branch (`formatSignificant`) — so a p-value of 5.74×10⁻⁷ (the worked FAQ example at z=5) displays as `5.742 × 10^-7`, the true computed figure, never a bare `0`; content explains that papers conventionally report very small p-values as "p < 0.0001" rather than the exact figure, and why this calculator shows the real number instead. | rangeBar: the p-value against the four conventional significance bands (< 0.01 highly significant, 0.01–0.05 significant, 0.05–0.10 marginal, ≥ 0.10 not significant) |
| quartile-calculator | B | Rank-and-interpolate on a list, same shape as percentile-calculator, so no solver. **Reuses `percentileOf`, the exact same private helper percentile-calculator already defines in this file** — the task's own instruction ("the same NIST/Hyndman–Fan type 6 as percentile-calculator for consistency... cross-link percentile-calculator") taken literally: Q1/Q2/Q3 are `percentileOf(sorted, 25/50/75)`, guaranteeing this page can never silently disagree with percentile-calculator on the same data, the same cross-calculator-consistency precedent standard-deviation/variance-calculator set in run 1. **Tukey's 1.5×IQR fences** (`lowerFence = Q1 − 1.5×IQR`, `upperFence = Q3 + 1.5×IQR`) plus an honest `outlierCount` (how many of the entered values fall outside the fences) — not a list of the outlier values themselves, since `compute()`'s return type is strictly `Record<string, number>` (the same "mode as text" kit limit run 1's list-input work already parked) and a count is the honest, kit-shaped alternative rather than inventing a text output. Content states Excel/TI's quartile functions can differ slightly, same honesty precedent as percentile-calculator's own Excel-disagreement watch-out. | compareBars: Q1 / median (Q2) / Q3 |

### Verification

Every number recomputed independently in `verify_run2.mjs` (scratchpad, plain Node, no app
imports, including from-scratch re-implementations of `erf`, Acklam's inverse-normal rational
approximation, the Lanczos `logGamma`, Numerical Recipes' `betacf`/incomplete-beta, and a plain
bisection root-finder standing in for `lib/solve.ts`'s `findRoot`) *before* any copy was written,
then diffed against the shipped `compute()`/distribution-module output via the regenerated snapshot
file — 0 mismatches. Key figures (full detail in the script's own output, re-run before this report):

- **Distributions**: `normalCDF(1.96)` = 0.9750021738917761, `normalInverseCDF(0.975)` =
  1.959963986120195, `normalInverseCDF(0.95)` = 1.644853625133699, `normalInverseCDF(0.995)` =
  2.5758293064439264, `tInverseCDF(0.975, 10)` = 2.228138851986274, `tInverseCDF(0.975, 1)` =
  12.70620473617467, `tInverseCDF(0.995, 1)` = 63.656741162870844 — all within 6+ significant
  digits of the published reference values quoted above.
- **confidence-interval-calculator** (x̄=15.2, s=4.1, n=36, 95%, t-mode): df=35, t*≈2.030108,
  standard error≈0.683333, margin≈1.387240, interval ≈ [13.8128, 16.5872]. FAQ z-mode example
  (x̄=100, σ=15, n=50, 95%): z*≈1.959964, margin≈4.157711, interval ≈ [95.8423, 104.1577].
- **margin-of-error-calculator** (p̂=54%, n=1000, 95%): z*≈1.959964, standard error≈1.576071%,
  margin ≈ ±3.0890%. FPC FAQ example (p̂=50%, n=200, N=2000, 95%): margin without FPC ≈ ±6.9295%,
  with FPC (factor ≈0.948921) ≈ ±6.5756%.
- **sample-size-calculator** (95%, margin 4%, p̂=50%): z*≈1.959964, n₀≈600.228, rounds up to
  **601**. FPC FAQ example (same inputs, N=2000): adjusted n≈461.851, rounds up to **462**. Second
  FAQ example (99%, margin 3%, p̂=50%): n₀≈1843.027, rounds up to **1844**.
- **p-value-calculator**: z=2.15 two-tailed p≈0.031555 (3.1555%); t=2.5, df=20, one-tailed (right)
  p≈0.010617, two-tailed p≈0.021234; extreme-case z=5 two-tailed p≈5.7421×10⁻⁷ (the tiny-p-value
  FAQ example, confirming the scientific-notation display path).
- **quartile-calculator** (8 scores: 60, 65, 70, 72, 78, 85, 90, 95): Q1=66.25, median=75, Q3=88.75,
  IQR=22.5, fences [32.5, 122.5], 0 outliers (both the min 60 and max 95 sit inside the fences).

**Data-integrity check**, run programmatically against the live data module for all 5 new
calculators: 93 total calculators, 0 duplicate ids, 0 broken `related` ids, 0 self-references, 0
new duplicate aliases, every new `seo.title` ≤ 60 characters and `seo.description` ≤ 160 characters,
5–8 FAQs and 4-5 aliases/4 related ids each.

`npm test`, `npm run build`, `npm run lint` results and the dev-server spot-check are recorded in
`STATUS.md`'s session log for this run, alongside the final static-page and test counts.

### Parked (new, this run)

- **Margin-of-error-calculator's mean-based mode was explicitly scoped out**, not forgotten — see
  the type-decision table above. If a future step wants it anyway, the real blocker is
  `BreakdownOutput`'s single fixed `format` per key: a `headline` cannot be `'percent'` in one mode
  and `'number'`/`'significant'` in another from the same compute() key, which is the same
  underlying kit limitation (no per-row conditional formatting) that blocked "mode as text" in the
  list-input work.
- **The list parser's known locale gap (comma decimal, step 18) applies to quartile-calculator too**,
  since it uses the same `type: 'list'` input as every other list-based statistics calculator. Not a
  new gap, just a new calculator that inherits the existing one.
- **Wald vs. Wilson proportion intervals**: margin-of-error-calculator and sample-size-calculator
  both use the simpler, more widely taught Wald method, stated honestly with a watch-out pointing at
  Wilson's better small-sample/extreme-proportion behavior. A Wilson-interval variant was considered
  and explicitly not built — it would need its own critical-value handling baked differently into
  the margin formula (not a simple swap), and the task's own instructions allowed picking one method
  "honestly" rather than requiring both.
