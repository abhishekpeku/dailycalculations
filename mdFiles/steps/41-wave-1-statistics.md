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

### Pre-merge review fix (2026-10-22): normalCDF's erf approximation was not accurate enough for its own job

Pre-merge review of PR #23 measured the *relative* error of the original `normalCDF` (Abramowitz &
Stegun 7.1.26, a rational approximation to `erf` with a fixed ~1.5×10⁻⁷ **absolute** error budget)
against published high-precision tail values and found it badly wrong exactly where a p-value
calculator's job actually is — once the quantity being measured is itself smaller than that fixed
absolute error, every digit of it is noise:

| z | measured `1 - normalCDF(z)` (old) | true `Q(z)` | relative error |
|---|---|---|---|
| 3 | 1.349967×10⁻³ | 1.349898×10⁻³ | 5×10⁻⁵ |
| 4 | 3.168604×10⁻⁵ | 3.167124×10⁻⁵ | 5×10⁻⁴ |
| 5 | 2.871050×10⁻⁷ | 2.866516×10⁻⁷ | 1.6×10⁻³ (displayed "2.871 × 10^-7", true value 2.867) |
| 8 | 6.66×10⁻¹⁶ | 6.22×10⁻¹⁶ | 7% |

An *absolute*-error budget is the wrong thing to control when the downstream number (a p-value) is
itself routinely smaller than that budget — the original "≥ 6 significant digits" target was being
met only in the sense of "6 digits printed," not "6 correct digits," which is a materially different
and much weaker claim, and dishonest relative to the task's actual accuracy instruction. There was a
second, compounding bug of the same shape: `1 - normalCDF(z)` and the old `tCDF`-derived `1 -
cdfValue` both derive a tiny quantity by subtracting something close to 1 from 1 — "1 − (1 − ε)" is a
textbook floating-point cancellation trap that can lose most of ε's own significant digits even when
the "1 − ε" part was computed perfectly.

**The fix, in `lib/distributions.ts`:**

- `normalCDF`'s `erf`-based approximation is replaced entirely. The standard normal tail
  `Q(z) = P(Z > z)` is now `0.5 × Q_gamma(1/2, z²/2)`, the standard identity relating `erfc` to the
  **upper regularized incomplete gamma function** (Numerical Recipes §6.2's "gammq": a power series
  for `x < a+1`, Lentz's continued fraction otherwise — the exact same continued-fraction technique
  already used for the incomplete beta function below it in the same file). The continued-fraction
  branch, which is what every realistic tail p-value actually exercises, computes the tiny quantity
  **directly**, never as `1 - P`.
- A new exported `normalSF(z)` is the upper tail, computed directly by the formula above (positive
  `z`) or as `1 - normalSF(-z)` (negative `z`, where the result is close to 1, a case floating point
  handles with no precision loss — the dangerous direction is only ever "subtract two close numbers"
  or "1 minus something close to 1," never "1 minus something tiny"). `normalCDF(z)` is now built
  from `normalSF` the same way (`1 - normalSF(z)` for `z >= 0`, `normalSF(-z)` for `z < 0`), so it is
  never the thing computing a tiny tail by subtraction either.
- `tCDF` gained a sibling, `tSF(t, df)`, the Student's t upper tail, computed directly from the
  incomplete beta for its own sign of `t` (mirroring `normalSF` exactly) rather than ever being
  derived as `1 - tCDF`.
- `normalInverseCDF` keeps Acklam's rational approximation as its starting point, now refined by one
  step of **Halley's method** (Acklam's own suggested refinement, using the newly-exact
  `normalCDF`), which tightens its already-good ~1.15×10⁻⁹ relative error to within a few ULPs of
  double precision over the confidence levels this project actually uses. `tInverseCDF` is unchanged
  (Brent's-method root-finding on `tCDF`, which was never the source of the bug).

**`p-value-calculator`'s `compute()` was restructured to match**: it now computes `leftTail` (the
CDF) and `rightTail` (the SF) as two independently-safe quantities and picks between them per tail
type — `2 × min(leftTail, rightTail)` for two-tailed, so the two-tailed case also never subtracts
from 1. Both are floored at `P_VALUE_FLOOR = 1e-300` before being returned, which fixes a second,
separate honesty problem the review flagged: for a sufficiently extreme test statistic (beyond
roughly ±39), the true p-value is smaller than the smallest representable `double`
(`Number.MIN_VALUE` ≈ 5×10⁻³²⁴) and genuinely underflows to a hardware `0` — not a bug, but a bare
`"0"` on the page reads as "no evidence at all" rather than "immeasurably small, beyond what this
calculator can represent." The floor keeps the displayed figure an honest, nonzero, scientific-
notation number (`1 × 10⁻³⁰⁰`) instead, with a new watch-out item and an updated FAQ answer saying so
explicitly, exactly as asked ("< 1 × 10⁻³⁰⁰ style message or similar, never 0").

**Tests, replaced wholesale (`lib/distributions.spec.ts`, 45 tests, up from 26)**: every assertion now
checks **relative** error against a tolerance of 1×10⁻⁹ or tighter (the review's own ask), not the
loose absolute/mixed tolerances the first version used. The normal tail is checked against the
review's own 7 reference `Q(z)` values (z = 1.96 through 10, quoted to 15-16 significant digits),
matching to a relative error around 10⁻¹⁵ in every case — far inside the 10⁻⁹ target. The Student's t
tail is checked two ways: against the review's own `t(0.975, df=10)` table entry, and — for a genuine
"far tail" check, since there is no single universally-quoted extreme-t reference — against **two
exact elementary closed forms**: the t-distribution with 1 degree of freedom is exactly the Cauchy
distribution (`SF(t) = 0.5 - atan(t)/π`), and with 2 degrees of freedom has the standard closed form
`SF(t) = 0.5 - t/(2√(2+t²))`; `tSF` matches both to a relative error around 10⁻¹² to 10⁻¹⁴ for `t` up
to 1000. `normalInverseCDF`/`tInverseCDF`'s own reference constants were extended from the standard
6-decimal textbook/t-table values to 16 significant digits via an independent bisection search on
the now-validated `normalCDF`/`tCDF` (a different algorithm family from Acklam+Halley or
Brent's-method root-finding, so this is a genuine cross-check, not circular).

**Re-verification of every number in the 5 calculators' copy**, re-run with the corrected module
(scratchpad, plain Node, importing the real `lib/distributions.ts` — the only honest way to check
"does the shipped module give the shipped numbers," now that the module itself is what needed
fixing): confidence-interval-calculator (margin ≈1.387240, interval [13.812760, 16.587240]),
margin-of-error-calculator (margin ≈3.089043%), sample-size-calculator (n₀≈600.228, rounds to 601)
all reproduce the **same displayed digits** as before the fix — the bug was specific to tail
probabilities smaller than roughly 10⁻³, and none of those three calculators' worked examples or FAQ
figures are that small. **p-value-calculator's two displayed figures that are in that regime both
needed a correction**: the worked example (z=2.15, two-tailed) still rounds to the same "≈ 0.0316"
the copy states (new exact value 0.03155521 vs. the old 0.03155510 — identical to 4 significant
figures), but the FAQ's "extremely small" illustration at z=5 was wrong in its *displayed* digits
(it said "5.742 × 10⁻⁷"; the corrected value is **5.733 × 10⁻⁷**) and has been fixed in the copy.
Regenerated snapshot (`npm run test:update`): every changed figure across all 5 calculators moves
only in the 9th-10th significant digit (Halley refinement tightening already-accurate quantiles)
except `p-value-calculator`'s own two figures discussed above, and its `edge` case, where
`0.9999999990`/`0.5000000005` (float noise from the old `erf` approximation evaluating exactly at
z=0) become the mathematically exact `1`/`0.5`. `npm test` 453/453 (up from 434), `npm run lint`,
`npm run build` all pass.

**Corrected accuracy claim**: the original "≥ 6 significant digits" framing is replaced in this file
and in `lib/distributions.ts`'s own header comment with the actual, measured result — a *relative*
error around 10⁻¹² to 10⁻¹⁵ for every function in this module across every value tested, not merely
"6 digits printed."

---

## Run 3: probability, permutation, combination, binomial distribution, normal distribution

Branch `step/41-wave-1-statistics-run-3`, from `origin/master` (which already has run 1, the list
input, and run 2 + its pre-merge fix merged). Reuses `lib/distributions.ts`'s `normalCDF`/`normalSF`/
`normalInverseCDF` directly (no duplication) and newly exports `logGamma`/`incompleteBeta` from the
same file for the binomial calculator's log-space PMF and direct-tail CDF, rather than reimplementing
either.

### Progress

- [x] Branch created, this section written before coding
- [x] Exported `logGamma`/`incompleteBeta` from `lib/distributions.ts` (previously file-private),
      for reuse by binomial-distribution-calculator — no new distribution math duplicated
- [x] `probability-calculator` (type B)
- [x] `permutation-calculator` (type B, `BigInt` exact nPr + n^r-with-repetition)
- [x] `combination-calculator` (type B, `BigInt` exact nCr + multiset-with-repetition)
- [x] `binomial-distribution-calculator` (type B, log-space PMF, direct-tail CDF via incomplete beta)
- [x] `normal-distribution-calculator` (type B, `normalCDF`/`normalSF`/`normalInverseCDF`, no mode
      selector needed — every output is independently computable from the same inputs)
- [x] Independent scratch verification (`verify_run3.mjs`) of every number in the copy, including a
      BigInt rational cross-check for nCr/nPr and a published reference for the large-n binomial tail
- [x] Snapshot tests (`npm run test:update`), re-diff against the scratch script
- [x] `npm test`, `npm run build`, `npm run lint` all pass
- [x] Spot-check the 5 pages + updated `/categories/statistics` + sitemap on a local dev server, kill it
- [x] Update `mdFiles/STATUS.md` (row 40–42 + session log)
- [x] Mark PR ready

### Type decisions (run 3)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| probability-calculator | B | Two independent event probabilities combined five ways (AND/OR/NOT/exactly-one/neither) has no single invertible equation, so `solver` does not fit. **Inputs are percent, not decimal, stated explicitly** (the task's required "pick one and say so"): both `probabilityA`/`probabilityB` are `type: 'percent'`, consistent with every other probability-shaped input already in this file (`confidenceLevel`, `sampleProportion`). **Independence is a stated assumption, not a detected property**: the concept section and a dedicated watch-out item say plainly that P(A and B) = P(A) × P(B) only holds for independent events, and that dependent events need a conditional probability this calculator does not compute. Clamped to [0, 100] like every other percent field with no kit-level `max`. | compareBars: P(A and B) / P(A or B) / P(neither) |
| permutation-calculator | B | nPr is a count, not a solvable equation — "solve for r given n and the count" has no closed form worth a widget. **Exactness via `BigInt`, same precedent as `factorial-calculator`** (step 40 run 3): `nPrBig` multiplies r descending BigInt factors directly, rather than computing `n!/(n-r)!` with two potentially enormous factorials, so a large n with a small r (say n=1000, r=2) stays instant. **r > n is 0, not "undefined"**: this is the standard combinatorial convention (Wolfram MathWorld's Permutation entry states it explicitly), not a special case invented for this page, matching the task's "handle r > n ... honestly" instruction with an actual citation rather than an arbitrary choice. **With/without repetition shown together, no mode selector needed**: nPr (without repetition) and nʳ (with repetition) are two independent, always-valid calculations from the same n/r inputs — unlike normal-distribution-calculator's case below, there is no format conflict (both are exact integers), so both ship as two always-visible output pairs rather than a toggle, exactly the "only if it fits cleanly" bar the task set. **Past `Number.MAX_SAFE_INTEGER`, the headline is 'significant' format (scientific notation) with an explicit watch-out note**, never a silently-wrong rounded double passed off as exact — the same honesty convention `factorial-calculator` already established — while the separate `digitCount` output (from the BigInt's own string length) stays exact at any size. | compareBars: nPr (without repetition) / nʳ (with repetition) |
| combination-calculator | B | Same reasoning as permutation-calculator: nCr is a count with no solvable inverse. **nCr computed as `nPrBig(n,r) / r!`, not `n!/(r!(n-r)!)` directly** — avoids a needlessly huge intermediate `n!` when r is small relative to n, and the division is always exact (nCr is provably a whole number, a standard combinatorial fact, so BigInt's floor-division never actually floors). **Cross-checked against Pascal's identity** (`C(n,r) = C(n-1,r-1) + C(n-1,r)`) for five (n, r) pairs in `verify_run3.mjs`, per the task's explicit instruction, not just against a single known constant. **With-repetition variant is the multiset coefficient `C(n+r-1, r)`**, special-cased at n=0 (r=0 → 1, the empty selection even from zero types; r>0 → 0, since `n+r-1` would be -1, not a meaningful input to `nCrBig`) rather than letting that edge fall through to the general formula incorrectly. | compareBars: nCr (without repetition) / with-repetition (multiset) |
| binomial-distribution-calculator | B | P(X=k)/P(X≤k)/P(X≥k) from (n, p, k) has no solver shape (three outputs from three inputs, not one invertible equation). **PMF in log space** (`logChoose(n,k) = logGamma(n+1) - logGamma(k+1) - logGamma(n-k+1)`, then `exp(logChoose + k·ln(p) + (n-k)·ln(1-p))`), reusing `lib/distributions.ts`'s own newly-exported `logGamma` rather than reimplementing it — exactly the task's instruction, and the same technique that file already uses for the Student's t distribution. **CDF and SF each computed directly from the regularized incomplete beta function via the standard binomial-beta identity** (NIST DLMF §8.17.5: `P(X≤k) = I_(1-p)(n-k, k+1)`, `P(X≥k) = I_p(k, n-k+1)`), reusing the same newly-exported `incompleteBeta` — **SF is never derived as `1 - CDF`**, satisfying the task's explicit instruction and avoiding the exact cancellation bug run 2's pre-merge fix found in `normalCDF`. **p=0/p=1 edge cases**: the CDF/SF formulas need no special-casing at all (`incompleteBeta`'s own `x<=0 → 0`/`x>=1 → 1` boundary checks make `1-p=1` or `p=0` resolve correctly automatically), but the PMF does need explicit guards, since `0 × log(0)` would otherwise be `NaN` rather than the correct `0` or `1`. **Tiny probabilities floored and shown in scientific notation**, reusing the exact `floorTinyProbability`/`P_VALUE_FLOOR` helper p-value-calculator already defines in this file, not a second copy of the same logic. | rangeBar: P(X=k) against the same significance bands as p-value-calculator (a binomial tail is frequently used as one) |
| normal-distribution-calculator | B | Given μ, σ and a value/range/percentile, the five quantities asked for (P(X<x), P(X>x), z, P(a<X<b), x-at-percentile) are each independently computable from the same inputs with no conflict — so, unlike `confidence-interval-calculator`'s z-vs-t mode toggle, **no mode selector was needed at all**: every output is always shown, computed directly from `mean`/`standardDeviation`/`x`/`lowerBound`/`upperBound`/`percentile`, which are all independent fields rather than mutually exclusive choices. This sidesteps the kit's "no per-row conditional formatting" limitation noted in the Parked list (and run 2's margin-of-error-calculator scope decision) entirely, rather than working around it. **Reuses `normalCDF`/`normalSF`/`normalInverseCDF` directly** (the task's explicit instruction), no duplicated distribution math. **P(a<X<b) computed as a same-side tail difference**, exactly as the task specifies: when both bounds' z-scores are ≥ 0, `normalSF(zLo) - normalSF(zHi)` (both small quantities, no "1 minus something near 1" cancellation); otherwise `normalCDF(zHi) - normalCDF(zLo)`. **a/b auto-sorted** (`Math.min`/`Math.max`) rather than returning a nonsensical negative probability if entered in the "wrong" order — stated explicitly in a watch-out item. **σ ≤ 0 → honest `NaN` for every output**, registered in `calculators.spec.ts`'s `KNOWN_NON_FINITE` (the kit's automated edge case sets `standardDeviation` to its own `min: 0`), the same pattern `z-score-calculator` established for a zero standard deviation. | rangeBar: the z-score of x, against the same five bands `z-score-calculator` uses |

### Verification (run 3)

Every number recomputed independently in `verify_run3.mjs` (scratchpad, plain Node, no app imports)
*before* any content was written, then diffed against the shipped `compute()` output via the
regenerated snapshot file — 0 mismatches:

- **probability-calculator** (P(A)=70%, P(B)=60%, independent): P(both)=42%, P(at least one)=88%,
  P(not A)=30%, P(exactly one)=46%, P(neither)=12%; cross-checked P(A or B) = 1 − P(neither) (0.88 =
  1 − 0.12) as an independent algebraic identity, not just the direct formula.
- **permutation-calculator**: 5P3 = 60 (cross-checked against 5!/2! via a second, independent
  factorial-based computation), 5³ = 125 with repetition. The "past `Number.MAX_SAFE_INTEGER`" watch-out
  example, 25P20, is exactly **129,260,083,694,424,883,200,000** (24 digits) — confirmed by comparing
  the exact `BigInt` string against `Number(bigint)`'s rounded value, which differs starting partway
  through the digits, concretely demonstrating the honesty claim in the copy (not just asserting it).
- **combination-calculator**: 52C5 = **2,598,960** (poker hands), cross-checked via
  `nPr(52,5)/5! = 311,875,200/120 = 2,598,960`. Pascal's identity `C(n,r) = C(n-1,r-1) + C(n-1,r)`
  checked and matched for (10,3), (20,7) and (49,6). 49C6 = 13,983,816 (lottery FAQ figure). The
  "past `Number.MAX_SAFE_INTEGER`" watch-out example, 60C30, is exactly **118,264,581,564,861,424**
  (18 digits) — `Number()` of it differs in its last two digits, again concretely demonstrated, not
  asserted. Multiset C(3+2-1,2) = C(4,2) = 6 (the ice cream example).
- **binomial-distribution-calculator** (n=10, p=50%, k=6): P(X=6) = 210/1024 = **0.205078125**,
  P(X≤6) = 848/1024 = **0.828125**, P(X≥6) = 386/1024 = **0.376953125** — all exact fractions since
  p=0.5, cross-checked via a direct 11-term summation of the PMF (not via the incomplete-beta
  identity) as a genuinely independent method; mean 5, SD ≈ 1.5811388300841898. The large-n FAQ
  figure (n=1000, p=50%, P(X≥600)) was verified against **exact BigInt rational arithmetic**
  (summing `C(1000,k)` for k=600..1000 as exact integers over the exact denominator `2¹⁰⁰⁰`, converted
  to a 60-digit decimal string with no floating point involved at any step) —
  **0.000000000136423207803300921280439044842779936858403383608042**, i.e. ≈ **1.364232078×10⁻¹⁰**.
  The shipped `incompleteBeta`-based `binomialSf` gives 1.364232078033285×10⁻¹⁰ against this exact
  reference's 1.364232078033009×10⁻¹⁰ — agreement to 10 significant digits, consistent with the
  module's own established relative-error bound.
- **normal-distribution-calculator** (μ=100, σ=15, x=115): z=1 exactly; cross-checked against
  published 16-digit standard normal table values (not derived from this file's own code): Φ(1) =
  0.8413447460685429, the upper tail 1−Φ(1) = 0.15865525393145707 (quoted directly as a published
  constant, not computed via subtraction), P(85<X<115) = 2Φ(1)−1 = 0.6826894921370859 (the familiar
  "68" in the 68-95-99.7 rule), and the published 90th-percentile z-critical value 1.2815515655446008
  gives x = 100 + 1.2815515655446008×15 = 119.22327348316901 at the 90th percentile. The shipped
  snapshot matches every one of these to its full displayed precision (0.8413447461, 0.1586552539,
  0.6826894921, 119.2232735).

**Data-integrity check**, run programmatically against the live data module for all 5 new
calculators (`check_integrity_run3_tmp.mjs`, project root, deleted after use): 98 total calculators
(up from 93), 0 duplicate ids, 0 broken `related` ids, 0 self-references, 0 new duplicate aliases
(the one pre-existing collision, "house loan emi calculator" on `emi-calculator`/`mortgage-calculator`,
predates this run and is untouched); every new `seo.title` ≤ 60 characters and `seo.description` ≤
160 characters (caught and fixed one 161-character description on `normal-distribution-calculator`
before shipping), 8 FAQs and 4 aliases/4 related ids each.

`npm test` 458/458 (up from 453), `npm run build` (127 static pages), `npm run lint -- --ignore-pattern
".open-next/**" --ignore-pattern ".claude/**"` all pass. All 5 pages spot-checked on a local dev
server: H1, every v2 section id (concept, how-to-use, formula, worked-example, watch-out, faq,
references, related), exactly one JSON-LD `<script>` tag per page; `/categories/statistics` links to
all 5 new ids and `sitemap.xml` lists all 5; dev server killed and port 3000 confirmed free
afterward. `next-env.d.ts`/`tsconfig.tsbuildinfo` reverted before committing (the same stray
build-time diff noted in every previous run).

### Parked (new, this run)

- **`permutation-calculator`/`combination-calculator` cap at n = 1,000** (matching
  `factorial-calculator`'s own cap), and **`binomial-distribution-calculator` caps at n = 1,000,000,000**
  (log-space/incomplete-beta evaluation has no real numerical reason to cap lower than that, so the
  cap there is a generous sanity bound, not a precision limit). Neither cap is expected to be hit in
  realistic use; both are stated honestly in their own watch-out items anyway, per this project's
  existing convention of disclosing every practical limit.
- **`normal-distribution-calculator`'s range and percentile fields are always shown, not optional
  toggles** — a deliberate scope choice (see the type-decision table above), not an oversight. A
  future step could add a `max`-aware percentile field once the kit grows one, but that gap already
  exists everywhere else `targetPercentile`/`confidenceLevel` are clamped manually
  (percentile-calculator, confidence-interval-calculator), so it is not a new gap introduced here.

### Pre-merge review fix (2026-10-22): binomial-distribution-calculator had five real bugs

Pre-merge review of PR #24 found that `binomial-distribution-calculator` gave wrong results past a
fairly modest n, and mishandled several edge cases outright. All five issues shared a root cause
(incompleteBeta's fixed iteration cap and logGamma-based PMF both breaking down at scale) or a common
pattern (a shared floor/rounding helper applied too bluntly). Full detail below; the short version:

1. **Large-n CDF/SF was silently wrong, not just imprecise.** `lib/distributions.ts`'s `betacf`
   (the continued fraction behind `incompleteBeta`) needs roughly `O(sqrt(a+b))` iterations to
   actually converge once `a`/`b` are in the thousands or more — `binomialCdf`/`binomialSf` call it
   with `a`, `b` scaling directly with `n`. The old fixed `MAX_ITERATIONS = 200` cap was far too low
   past about n = 40,000: at n = 1,000,000 it returned `0.5003881988` for a case the review confirmed
   should be `0.50039894` (wrong at the 5th digit, needing 417 iterations to actually converge); at
   n = 1,000,000,000 it returned complete garbage that this page's own tiny-probability floor then
   turned into a misleadingly confident `1 × 10⁻³⁰⁰`. **Fix:** `betacf` now scales its iteration
   budget to the parameters (`Math.ceil(30 * Math.sqrt(a + b))`, capped at a hard
   `MAX_ITERATIONS_CEILING = 200000` for worst-case runtime safety — confirmed under 5ms even at the
   full ceiling) and reports whether it actually converged; `incompleteBeta` returns `NaN` rather
   than a silent wrong value when it did not, protecting every other caller (`tCDF`/`tSF`, used by
   confidence-interval-calculator and p-value-calculator) the same way, not just this one calculator.
2. **PMF precision at huge n.** The original PMF (`exp(logChoose(n,k) + k*ln(p) + (n-k)*ln(1-p))`,
   with `logChoose` built from raw `logGamma` differences) loses digits once `logGamma(n)` itself is
   large — `logGamma`'s own ~1e-15 *relative* error becomes a much bigger *absolute* error once its
   argument is in the billions. **Fix:** `binomialPmf` (`data/calculators/statistics.ts`) now uses
   Catherine Loader's saddle-point algorithm ("Fast and Accurate Computation of Binomial
   Probabilities", the same method R's own `dbinom` function uses) via a `stirlerr`/`bd0` pair that
   regroups the same arithmetic into pieces that never individually approach `logGamma(n)`'s own
   magnitude. Verified against exact `BigInt` arithmetic for n up to 5,000 (relative error 1e-13 to
   1e-16) in `verify_run3.mjs`.
3. **An exact 0 was being shown as `1 × 10⁻³⁰⁰`.** The shared `floorTinyProbability` helper (built
   for p-value-calculator, where the true answer is a continuous quantity that can genuinely
   underflow but is never exactly 0) was being applied unconditionally to every binomial output —
   including the many binomial cases that are mathematically EXACTLY 0 (p=0% with k≠0, p=100% with
   k≠n, k outside 0..n). **Fix:** a new, binomial-specific `floorNonzeroProbability` passes an exact
   0 (or a `NaN`) through unchanged, and only floors a value that is already nonzero but small enough
   to risk displaying as a misleading bare 0. `floorTinyProbability` itself is untouched — this is a
   new, separate helper, not a change to p-value-calculator's existing behavior.
4. **Non-integer trials/successes were silently rounded, not refused.** `Math.round(10.5)` quietly
   became 11 and computed an answer to a different question than the one typed in.
   **Fix:** `compute()` now checks `Number.isInteger` on the raw input values directly (no rounding
   step at all) and returns no answer for a non-integer n or k.
5. **k > n and negative inputs needed an explicit, stated convention.** Chosen: `k > n` (or `k < 0`
   is a genuinely impossible count, not an input error, by the same "0 by convention" rule this run's
   own permutation/combination calculators use for choosing more items than exist) stays a
   well-defined 0/1 (handled inside `binomialPmf`/`Cdf`/`Sf`, documented in a watch-out item); a
   negative `k` or `n`, or `n` past the new cap, is refused outright (`NaN`) since it violates the
   "non-negative integer" requirement with no sensible convention to fall back on. `p` outside
   0–100% continues to clamp to the nearest valid percentage (same convention every other
   percent-shaped field on this site already uses).

**BINOMIAL_MAX_N lowered from an unproven 1,000,000,000 to a proven 1,000,000.** With `betacf` now
actually converging, the *remaining* error source is `incompleteBeta`'s own `logGamma`-based
prefactor computation (unrelated to the iteration-cap bug above, and not practical to eliminate
without porting a much larger specialized algorithm — DiDinato & Morris's `bratio`). Measured
directly in `verify_run3.mjs` against the symmetric-midpoint identity `P(X≤n/2 | p=0.5) = 0.5 +
pmf(n/2)/2` (itself independent of `incompleteBeta`, since the right-hand side uses only the
now-accurate Loader PMF): relative error is 2.2×10⁻¹⁰ at n=1,000,000, crossing 1×10⁻⁹ somewhere
around n=3,000,000. `BINOMIAL_MAX_N = 1,000,000` keeps a safety margin inside the range this file
actually checked, per the task's own explicit instruction to lower the cap to where accuracy is
proven rather than claim it past that point. Stated honestly in a watch-out item and the FAQ, not
silently narrowed.

**Verification**, re-run with the corrected code (`verify_binomial_fix_tmp.mjs`, project root,
deleted after use, importing the real shipped `data/calculators/index.ts` — the only honest way to
check "does the shipped module give the shipped numbers"):
- n=1,000,000, p=50%, k=500,000: `cdfAtK`/`sfAtK` = **0.5003989420688252** (matches the review's own
  expected ≈0.50039894; was 0.5003881988 before the fix).
- n=1,000,000,000 (now past the cap): every output is `NaN` (an honest no-answer; was a wrongly
  confident `1×10⁻³⁰⁰` before).
- Asymmetric n=1,000,000, p=30%, k=300,500: `pmfAtK`=0.00047991816459567587, `cdfAtK`=0.8626169720928362,
  `sfAtK`=0.13786294600175744 — self-consistent with the "overlap by exactly pmf" identity
  (`cdfAtK + sfAtK = 1 + pmfAtK`, both sides agree to about 1e-10).
- n=10, p=100%, k=9: `pmfAtK`=**0** (was `1×10⁻³⁰⁰`). n=10, p=0%, k=3: `pmfAtK`=**0**,
  `sfAtK`=**0** (was `1×10⁻³⁰⁰` for both). n=10, k=11 (>n=10): `pmfAtK`=**0**, `sfAtK`=**0**,
  `cdfAtK`=**1** — well-defined, not refused.
- trials=10.5, successes=6.5, or successes=-1: every output is `NaN` (was silently rounded/accepted
  before).
- p=150% (>100%): clamps to 100% as before, now correctly honored alongside the other fixes.
- The exactly-at-cap case (n=1,000,000) still computes; n=1,000,001 (one past the cap) returns `NaN`.
- The original worked example (n=10, p=50%, k=6) and the large-n FAQ figure (n=1,000, p=50%,
  P(X≥600)≈1.364×10⁻¹⁰) are both unchanged (both already well inside the proven-accurate range, and
  neither triggers any of the five bugs above).

**Tests added**: `lib/distributions.spec.ts` gained 5 new tests for `incompleteBeta` directly
(now exported — a reflection-identity check at huge a/b that needs no external reference, a
convergence check at the calculator's own n=1,000,000 scale, a regression test pinned to the bug
report's own reference figure, a genuine non-convergence case at a+b=1e15 — confirmed to actually
exhaust the iteration ceiling, not just assert one exists — and the plain x≤0/x≥1 boundary values).
`npm test` 463/463 (up from 458), `npm run lint` clean, `npm run build` passes (127 static pages, no
new pages — this is a fix to an existing calculator, not a new one). No calculator's
`compute()`-snapshot changed (binomial-distribution-calculator's default/typical/edge snapshot values
round to the same displayed precision under both the old and new PMF algorithm, since none of its
pre-existing test cases exercised the bug — only n in the hundreds of thousands or more did).
