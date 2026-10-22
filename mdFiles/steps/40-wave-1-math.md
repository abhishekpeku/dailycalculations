# Step 40 — Wave 1: math (new calculators)

Absorbs old step 24 (`math` category). Builds the ~30-calculator math list from
`mdFiles/calculator-rollout-plan.md` §4 Wave 1, in runs of 5. These are **new** calculators, not
v2 conversions — there is no existing page or `compute()` to preserve, so each one is designed
fresh against the v2 template (`mdFiles/calculator-template-v2.md`) and the `add-calculator` skill.

## Progress

- Run 1 (this run): **percentage-calculator, percent-change-calculator, percent-difference-calculator,
  fraction-calculator, ratio-calculator** — plus adding the `math` category itself.
  - [x] Add `math` category (`data/calculators/index.ts` categories array, `data/calculators/math.ts`,
    `lib/categoryTheme.ts` tile color/icon, homepage `keywords` claim for "percentage calculator").
  - [x] percentage-calculator (type B — mode menu + 2 numbers)
  - [x] percent-change-calculator (type A — solver)
  - [x] percent-difference-calculator (type B)
  - [x] fraction-calculator (type B)
  - [x] ratio-calculator (type A — solver)
  - [x] Snapshot tests (`npm run test:update`), `KNOWN_NON_FINITE` entries for the 3 that need them
  - [x] `npm test`, `npm run build`, `npm run lint`
  - [x] Spot-check the 5 pages + `/categories/math` + sitemap on a local server, kill the server
  - [x] Update `mdFiles/STATUS.md`, open/ready the PR

- Run 2 (this run): **average-calculator, weighted-average-calculator, rounding-calculator,
  scientific-notation-calculator, exponent-calculator**
  - [x] average-calculator (type B — 8 value slots, "blank"-style ignore via a kit-gap workaround)
  - [x] weighted-average-calculator (type B — 6 value/weight pairs, cross-linked with gpa-calculator)
  - [x] rounding-calculator (type B — decimal places + direction/tie-rule menus)
  - [x] scientific-notation-calculator (type B — mode menu: convert / multiply / divide)
  - [x] exponent-calculator (type A — solver, base/exponent/result)
  - [x] Snapshot tests (`npm run test:update`), `KNOWN_NON_FINITE` entry for weighted-average-calculator
  - [x] `npm test` (296/296), `npm run build` (92 static pages), `npm run lint` — all pass
  - [x] Spot-check the 5 pages + `/categories/math` + sitemap on a local server, kill the server
  - [x] Update `mdFiles/STATUS.md`, open/ready the PR
- Run 3 (this run): **square-root-calculator, cube-root-calculator, logarithm-calculator,
  factorial-calculator, gcf-calculator**
  - [x] square-root-calculator (type A — solver, radicand ↔ square root)
  - [x] cube-root-calculator (type A — solver, radicand ↔ cube root, Math.cbrt for real negatives)
  - [x] logarithm-calculator (type A — solver, base/argument/result)
  - [x] factorial-calculator (type B — breakdown; BigInt for exact digit count, double for the headline)
  - [x] gcf-calculator (type B — breakdown; "How many numbers?" 2-4 count selector, not a 0-sentinel)
  - [x] Snapshot tests (`npm run test:update`), `KNOWN_NON_FINITE` entries where a legitimate domain
    edge produces a non-finite result
  - [x] `npm test` (310/310), `npm run build` (97 static pages), `npm run lint`
  - [x] Spot-check the 5 pages + `/categories/math` + sitemap on a local server, kill the server
  - [x] Update `mdFiles/STATUS.md`, open/ready the PR
- Run 4 (this run): **lcm-calculator, prime-factorization-calculator, long-division-calculator,
  quadratic-formula-calculator, pythagorean-theorem-calculator**
  - [x] lcm-calculator (type B — "How many numbers?" 2-4, reuses `gcdRaw`; lcm(n,0)=0 by
    convention, lcm(0,0) left undefined)
  - [x] prime-factorization-calculator (type B — breakdown; fixed 6 prime/exponent slots, 1e12
    input cap, honest "extra distinct prime factors" counter for the rare overflow case)
  - [x] long-division-calculator (type B — breakdown; Euclidean/nonnegative-remainder convention)
  - [x] quadratic-formula-calculator (type B — breakdown; two simultaneous roots, not invertible)
  - [x] pythagorean-theorem-calculator (type A — solver; a²+b²=c²)
  - [x] Snapshot tests (`npm run test:update`), `KNOWN_NON_FINITE` entries where a legitimate domain
    edge produces a non-finite result
  - [x] `npm test` (318/318), `npm run build` (102 static pages), `npm run lint`
  - [x] Spot-check the 5 pages + `/categories/math` + sitemap on a local server, kill the server
  - [x] Update `mdFiles/STATUS.md`, open/ready the PR
  - [x] Post-review fix: refuse (not silently round) LCM/GCF/long-division results beyond
    `Number.MAX_SAFE_INTEGER` — see the last "Fix" section below
- Run 5 (this run): **triangle-calculator, circle-calculator, area-calculator, volume-calculator,
  surface-area-calculator**
  - [x] triangle-calculator (type B — mode menu SSS/SAS/ASA, shared side/angle fields)
  - [x] circle-calculator (type A — solver, radius ⟷ diameter, circumference/area as outputs)
  - [x] area-calculator (type B — shape mode menu, shared length inputs, area dimension output)
  - [x] volume-calculator (type B — shape mode menu, shared length inputs, volume dimension output)
  - [x] surface-area-calculator (type B — shape mode menu, same shared inputs as volume)
  - [x] Snapshot tests (`npm run test:update`); only `triangle-calculator` needed a `KNOWN_NON_FINITE`
    entry (all-zero SSS fails the triangle inequality) — area/volume/surface-area treat a zero
    measurement as a legitimate (degenerate) finite 0, not an error
  - [x] `npm test` (326/326), `npm run build` (107 static pages), `npm run lint`
  - [x] Spot-check the 5 pages + `/categories/math` + sitemap on a local server, kill the server
  - [x] Update `mdFiles/STATUS.md`, open/ready the PR
- Run 6 (this run, final math run): **slope-calculator, distance-calculator, midpoint-calculator,
  scientific-calculator**
  - [x] slope-calculator (type B — breakdown; two points, slope/angle/y-intercept/distance,
    vertical line returns `NaN` slope honestly while the angle stays a real 90°)
  - [x] distance-calculator (type B — breakdown; two points, distance formula as the Pythagorean
    theorem applied to Δx/Δy)
  - [x] midpoint-calculator (type B — breakdown; two points, midpoint plus the equal
    distance-to-midpoint from each endpoint as a self-check visual)
  - [x] scientific-calculator (type C — custom component, like `pomodoro-timer`/
    `timezone-meeting-planner`; a small hand-written expression parser, no `eval`/`new Function`;
    decision and scope writeup below)
  - [x] Snapshot tests (`npm run test:update`), `KNOWN_NON_FINITE` entry for slope-calculator
    (both points identical — no line, so no slope/angle/intercept, but distance is still a
    legitimate 0)
  - [x] Parser unit tests (`lib/scientificCalc.spec.ts`, 25 tests — precedence, right-assoc power,
    factorial, deg/rad trig, domain guards, nested/combined expressions, malformed input)
  - [x] `npm test` (354/354, up from 326), `npm run build` (111 static pages, up from 107),
    `npm run lint` — all pass
  - [x] Spot-check the 4 pages + `/categories/math` + sitemap on a local server, kill the server
  - [x] Update `mdFiles/STATUS.md`, mark the PR ready

**Dedup decision (run 1):** the plan's list also names "mixed number" and "proportion" as separate
calculators. Both are absorbed into run 1's pages instead of getting their own: fraction-calculator
already converts every result to a mixed number (one of its breakdown rows), and ratio-calculator's
A:B = C:D solver *is* a proportion solver (cross-multiplication). This mirrors the template's own
"one equation, all directions" rule for force-calculator — a separate "mixed number calculator" or
"proportion calculator" page would be near-duplicate content. Both get captured instead as aliases
(`mixed number calculator` on fraction-calculator, `proportion calculator` on ratio-calculator). This
drops the math category's total from the plan's ~31 named topics to ~29 pages; recorded in
`STATUS.md`, not hidden.

## Type decisions (run 1)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| percentage-calculator | B, with a `mode` options menu | Four distinct formulas (X% of Y, X is what % of Y, percent change, ± X%), not one invertible equation — doesn't fit a solver's "any field can be the unknown" model. `compute()` always returns one `result` key computed from whichever mode is selected, so the static breakdown config never needs to change shape. | CompareBars: the two raw inputs (X, Y), mode-agnostic and always finite |
| percent-change-calculator | A (solver) | `%Δ = ((B−A)÷A)×100` rearranges cleanly for all three variables (A, B, %Δ), same shape as `inflation-calculator`'s rate/time pattern. | CompareBars: old vs new value (reused inflation-calculator's "then vs now" pattern) |
| percent-difference-calculator | B | `|A−B| ÷ ((A+B)÷2) × 100` is symmetric and not unambiguously invertible — solving for A given B and the percent requires knowing which of A/B is larger (two possible answers), so a solver's single auto-field model doesn't apply. Same reasoning real percent-difference tools (e.g. university lab calculators) use: two plain inputs, one answer. | CompareBars: value A vs value B |
| fraction-calculator | B | Arithmetic on two fractions with an operator choice; not a single rearrangeable equation. The breakdown format enum (`currency/percent/integer/number/significant/date`) has no "a/b" fraction format, so the simplified fraction, mixed number and decimal are each broken into their own numeric row (numerator, denominator, whole, remainder) rather than rendered as "1/2" text in the live widget — the worked example and FAQ show the standard "a/b" notation in prose instead. | CompareBars: the two input fractions, as decimals |
| ratio-calculator | A (solver) | A:B = C:D cross-multiplies to a closed form for any one of the four terms (`a=(bc)/d`, etc.), same shape as force-calculator's three-variable solve. | Donut: A and B as two parts of their total (also covers "proportion calculator" search intent) |

**Paused 2026-10-21 after run 1.** 5/~29 math calculators done (math category + percentage,
percent-change, percent-difference, fraction, ratio). PR #15 ready for review. Next session picks
up run 2: average, weighted average, rounding, scientific notation, exponent.

## Type decisions (run 2)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| average-calculator | B | A plain list of numbers has no single invertible equation. **Kit gap**: there is no list/array input in the kit (every `CalculatorInput` is one number), so this uses a fixed number of slots like `gpa-calculator`'s course rows — 8 numbered slots (`value1`-`value8`), 4 always visible plus 4 behind a disclosure. **Revised after review** (see "Fix, 2026-10-21" below): the first version tried to reuse GPA's "0 excludes a slot" convention for a plain average, which is wrong there — a weight of 0 genuinely removes a component from a weighted sum, but a value of 0 is a real data point in a plain list (a 0 test score, say), so silently dropping it is a wrong-answer trap, not a convenience. Fixed with an explicit `howMany` options field (2-8): `compute()` averages exactly `slots.slice(0, howMany)`, zeros included, and fields beyond the chosen count are ignored regardless of their value. Mean, sum, count, min and max are always finite, so no `KNOWN_NON_FINITE` entry is needed. | CompareBars: min / average / max (derived summary stats, not the raw slots — correct regardless of how many of the 8 slots are in use, sidestepping `CompareBars`'s 4-bar cap) |
| weighted-average-calculator | B | Mirrors `gpa-calculator`'s actual mechanism exactly, generalized from grades/credits to any value/weight pairs: 3 always-counted pairs (`value1..3`/`weight1..3`) plus 3 optional pairs behind a disclosure (`value4..6`/`weight4..6`), where a 0 weight is a mathematically correct exclusion (it contributes 0 to both the weighted sum and the total weight), not a workaround. All-zero weights (the `edge` test set) is a genuine 0÷0 — `KNOWN_NON_FINITE` registered, same as `percent-change-calculator`'s divide-by-zero. **Cross-link, not a duplicate**: GPA is a named special case (grade points weighted by credit hours) of this general calculator; content explicitly says so and links to `gpa-calculator` in `related` and in prose, rather than re-teaching credit-weighted averaging from scratch. | Donut: each pair's weight as a share of the total weight (parts of a whole — distinct from GPA's own Donut, which groups credits into letter-grade bands, not weights) |
| rounding-calculator | B | Rounding is lossy (many inputs map to one output), not invertible, so no solver. One value field, a `decimalPlaces` field (negative values round to tens/hundreds, matching the sign convention of spreadsheet ROUND functions), a `direction` menu (nearest / round up / round down) and a `tieRule` menu (half away from zero / half to even) used only by "nearest." **Float precision**: naive `value * 10**n` rounding fails on cases like 1.005 (stored internally as 1.00499999999999989... per IEEE 754 binary64), so rounding shifts the decimal point through a string/exponential-notation round trip instead of multiplication, which exploits JS's shortest-round-trip number-to-string conversion to recover the intended decimal before re-parsing it at the shifted scale — verified against the classic 1.005 case in the Python script. Cites IEEE 754-2019 for both the tie-breaking rule names and the float-representation note. | CompareBars: original value vs rounded value |
| scientific-notation-calculator | B | Converting between a plain number and `a × 10^b` form, and multiplying/dividing two numbers already in that form, are four related but distinct operations picked by a `mode` menu — not one invertible equation. **Kit gap**: no "a × 10^b" breakdown format exists (same gap `fraction-calculator` hit with "a/b"), so the coefficient and exponent are separate numeric rows; prose shows the real notation. Normalizing a coefficient back into [1, 10) after multiply/divide uses the same string-based float cleanup as rounding-calculator, to avoid drift from repeated multiplication. | LogScale: the result's plain decimal value against two NIST-sourced magnitude benchmarks (a nanometer, 10⁻⁹ m; the Avogadro constant, ~6.022×10²³) — the calculator's whole subject is "how to write very large or very small numbers," so a log-scale "how big is that" visual fits every mode, not just one |
| exponent-calculator | A (solver) | `result = base^exponent` rearranges for all three variables: forward power, an nth root for `base`, and a logarithm for `exponent`. Both inverses have real domain restrictions (no real nth root of a negative number except for odd integer exponents; no real logarithm of a non-positive number or of a base ≤ 0 or = 1), which the solve functions return `NaN` for — flagged in `watchOut`, not hidden. The forward direction needs no special-casing: JavaScript's `**` operator already matches the chosen conventions (0⁰ = 1, negative base with a non-integer exponent = `NaN`), both cited to IEEE 754 / NIST DLMF. | LogScale: the result against computing/physics-style magnitude benchmarks (2¹⁰ = 1,024, the NIST-defined "kibi" binary prefix; 10⁶; 10⁹) |

**Paused 2026-10-21 after run 2.** 10/~29 math calculators done (run 1: math category + percentage,
percent-change, percent-difference, fraction, ratio; run 2: average, weighted average, rounding,
scientific notation, exponent). PR #16 ready for review. Next session picks up run 3: square root,
cube root, logarithm, factorial, GCF.

## Type decisions (run 3)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| square-root-calculator | A (solver) | `r = √x`, `x = r²` is a clean 2-variable invertible pair — simpler than the other solvers' 3+ variables, since a square root only has two quantities in play. Negative `x` has no real root; `solve.squareRoot` returns `NaN` for it rather than hiding the restriction. **Overlap with exponent-calculator**: a square root is the exponent-1/2 case of the general base/exponent relationship already covered there, so the concept/formula copy explicitly cross-links to it (and to the new cube-root-calculator) instead of re-teaching fractional exponents from scratch — the page's own content stays focused on the principal-root convention, estimating irrational roots between consecutive perfect squares, and the two-real-roots caveat, none of which exponent-calculator covers. | CompareBars: the number vs its square root |
| cube-root-calculator | A (solver) | `r = ∛x`, `x = r³`, same 2-variable shape as the square root pair, but with no domain restriction at all — `Math.cbrt` is real for every input, including negatives, which is the whole differentiator from square-root-calculator and the headline fact the concept copy leads with. **Edge-case guard**: uses `Math.cbrt(x)`, not `x ** (1/3)`, since JavaScript's `**` returns `NaN` for a negative base with a fractional exponent even though the real cube root clearly exists — verified directly (`(-8) ** (1/3)` → `NaN`, `Math.cbrt(-8)` → `-2`) and called out in `formula.note` and a `watchOut` item. | CompareBars: the number vs its cube root |
| logarithm-calculator | A (solver) | `log_b(x) = y ⇔ b^y = x` rearranges for all three variables (result via a log, argument via exponentiation, base via a root), the same shape as exponent-calculator's forward/base/exponent solve but entered from the "I have a base and an argument, what's the exponent" direction most log searches want by default. `solve.result`/`solve.argument` guard `base ≤ 0`, `base = 1`, `argument ≤ 0`; `solve.base` additionally guards `result = 0` (no unique base solves `b⁰ = x` for a fixed x ≠ ... any b works). **`KNOWN_NON_FINITE`** registered (`result`, `naturalLog`, `commonLog`): the edge test's `base = 0, argument = 0` (both inputs have no `min` set, so edge defaults to 0) is outside the log domain on every count. **Overlap with exponent-calculator**: same inverse relationship, but the content stays log-specific — common/natural log naming, the change-of-base formula, and log-scale real-world uses (pH, decibels, earthquake magnitude, the last one explicitly named in the OpenStax source) — and cross-links rather than repeating exponent-calculator's power-law content. `solver.outputs` adds the natural log and common log of the same argument underneath the main result, computed identically in `compute()` so the snapshot captures them too. | LogScale: the argument on a magnitude scale, with a pH-neutral-water and an Avogadro-constant benchmark (reusing the same -9..27 scale convention as scientific-notation-calculator) |
| factorial-calculator | B | `n!` is not invertible (no closed form for "what n gives this factorial" in general), so no solver — a plain one-input breakdown. **Edge-case guards**: non-integer or negative `n` returns no answer; `n` is capped at 1,000 for instant results. **Precision**: computes the exact product with `BigInt`, so the exact digit count (`big.toString().length`) and trailing-zero count (Legendre's formula, counting factors of 5) stay exact at any size, while the headline `factorialValue` converts to a `Number` for display — `format: 'significant'` already switches to scientific notation past 1e9 (around 13!), so the kit's existing formatting prevents the "rounded digits shown as exact" trap by itself; the watch-out copy explains why the digit count stays exact even once the headline is a rounded approximation. 171! and above overflow a double to `Infinity` (170! is the last finite one, confirmed with both Python and a Node `BigInt`→`Number` check), documented as expected overflow behavior, not a bug. No `KNOWN_NON_FINITE` entry needed — default (`n=5`), typical (`n=8`) and edge (`n=0`) are all comfortably finite. | LogScale: `factorialValue` against `10! = 3,628,800` and `52! ≈ 8.0658 × 10⁶⁷` (the number of ways to shuffle a standard deck, which follows directly from the permutation rule already covered by the MathWorld reference, not a separately-sourced statistic) |
| gcf-calculator | B | GCF of a variable-length list of numbers has no solver shape. **Input-count lesson applied directly**: uses a "How many numbers?" `options` menu (2-4), not a 0-means-unused sentinel on `num3`/`num4` — the exact pattern the run-2 fix established for `average-calculator`, applied here from the start instead of discovered after the fact. `compute()` reuses the `gcd()` helper already defined at the top of `math.ts` for `fraction-calculator`/`ratio-calculator` (reduced pairwise across the chosen count via `nums.reduce(gcd)`), so all three pages agree on the same `GCF(0, 0) = 1` convention rather than each inventing its own. **Edge cases documented, not specially guarded**: `GCF(0, n) = n` and `GCF(-12, 18) = 6` both fall out of the existing `gcd()` behavior (absolute value, 0 identity) with no extra code; `GCF(0, 0) = 1` is flagged in `watchOut` as this site's convention, not a universal one. No `KNOWN_NON_FINITE` entry needed — every path resolves to a finite integer. | CompareBars: smallest number / largest number / GCF (derived summary values, not the raw `num1..4` slots, so the chart stays meaningful regardless of how many of the 4 slots are in use — the same `CompareBars`-cap workaround `average-calculator` established in run 2) |

**Paused 2026-10-22 after run 3.** 15/~29 math calculators done (run 1: math category + percentage,
percent-change, percent-difference, fraction, ratio; run 2: average, weighted average, rounding,
scientific notation, exponent; run 3: square root, cube root, logarithm, factorial, GCF). PR #17
ready for review. Next session picks up run 4: LCM, prime factorization, long division, quadratic
formula, Pythagorean theorem.

## Type decisions (run 4)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| lcm-calculator | B | LCM of a variable-length list has no solver shape, same reasoning as `gcf-calculator`. Uses the same "How many numbers?" 2-4 count selector (not a 0-sentinel) and reuses `gcdRaw` via a new `lcmPair` helper: `LCM(a,b) = \|a×b\| ÷ gcd(a,b)`. **Zero convention, decided mid-run after fetching references**: the first draft returned `LCM(0,0) = 0`, mirroring `gcf-calculator`'s `GCF(0,0)=0`. Fetching the actual references showed this is wrong for LCM specifically — one Mount Royal University LibreTexts source states plainly "`lcm(a,0) = 0` for all non zero integers a" **and** "`lcm(0,0) = undefined`," and a second (Mount Royal's Higher Arithmetic text) goes further and calls `lcm(a,0)` itself undefined. Fixed to match the first, more common convention: `lcm(n,0)=0` for nonzero n, `lcm(0,0)=NaN`, registered in `KNOWN_NON_FINITE` (the automated edge case, since `num1`/`num2` have no `min`, is exactly `(0,0)`). **Overflow, caught in post-review** (see the last "Fix" section below): the original `(a*b)/gcdRaw(a,b)` formula had no check for results beyond `Number.MAX_SAFE_INTEGER`, so four large pairwise-coprime inputs could silently show a wrong digit instead of refusing. | CompareBars: smallest number / largest number / LCM (same derived-summary pattern as `gcf-calculator`, sidesteps the 4-bar cap) |
| prime-factorization-calculator | B | A factorization is inherently variable-length (anywhere from 1 to ~10 distinct primes for a reasonably sized number), which the kit's numeric-only `compute()` return type and lack of a list input (Parked: "No list/array input in the calculator kit") cannot render directly. **Chosen bound**: 6 fixed prime/exponent slot pairs, with the input capped at 10¹² (trial division to √10¹² ≈ 10⁶ iterations, instant, and comfortably inside `Number.MAX_SAFE_INTEGER` — confirmed in the post-review safe-integer audit, no change needed here). A number with more than 6 distinct primes (rare — needs at least the first 7 primes multiplied together, 510,510) is **not silently truncated**: `distinctPrimeFactors` (the true total) and a dedicated `extraDistinctPrimeFactors` counter (0 in the overwhelmingly common case) are both always correct regardless of how many slots are shown, and `smallestPrimeFactor`/`largestPrimeFactor` are computed directly from the full factor list, not derived from the visible slots, so they stay correct even when the list overflows the 6 shown. 0 has no factorization (`NaN`, not hit by the automated edge case since `n`'s `min` is 1); 1 has the legitimate empty factorization (0 distinct primes, 1 divisor) rather than `NaN`. | CompareBars: your number / smallest prime factor / largest prime factor |
| long-division-calculator | B | Division with a remainder is lossy, not invertible (many (dividend, divisor) pairs share a quotient), so no solver. **Remainder sign convention, the task's required decision point**: this calculator always keeps `0 ≤ remainder < \|divisor\|`, regardless of the sign of either operand (`r = ((d % v) + \|v\|) % \|v\|`, `q = (d − r) ÷ v`) — sometimes called Euclidean division, and distinct from the "truncate toward zero" convention several programming languages use by default (which would give a *negative* remainder for a negative dividend). Verified against the classical Division Algorithm theorem (OpenStax, Clark's LibreTexts) and cross-checked directly against the deployed JS `%` operator's own sign quirk (JS `%` takes the sign of the *dividend*; this calculator's two extra normalization steps make the final `r`/`q` convention-invariant regardless of the host language's raw `%` semantics — verified this claim directly against Node, not just assumed it). | CompareBars: dividend vs divisor |
| quadratic-formula-calculator | B | `ax²+bx+c=0` has **two** simultaneous roots from one input triple, not a single invertible scalar — solving backward (given one root, find a, b, c) is underdetermined, the same non-invertibility reasoning as `percent-difference-calculator`. Handles every case the task calls for explicitly: `a=0` (linear, `x=−c÷b`, with a further `b=0` degenerate "0=0" case registered as `NaN` in `KNOWN_NON_FINITE`), discriminant `>0` (two real roots), `=0` (one repeated root, via a magnitude-relative floating-point near-zero tolerance, not an exact `=== 0` check), and `<0` (complex roots shown as a real part and a nonnegative imaginary part — `p ± qi` — rather than a bare `NaN`). **Rounding-safe defaults**: the default/typical/edge triad had to be chosen so the automated snapshot's "typical" input set (default × 1.5, rounded to the nearest step) doesn't accidentally flip the discriminant's sign through rounding noise — solved by picking defaults (`a=2, b=−10, c=8`) that scale to exact integers at ×1.5, confirmed by hand before committing to them. | CompareBars: Root 1 vs Root 2 (NaN renders as empty/blank bars in the complex case, handled gracefully by the existing kit, not a new code path) |
| pythagorean-theorem-calculator | A (solver) | `a²+b²=c²` is a clean, symmetric 3-variable invertible relationship — closed-form in every direction, the same shape as `force-calculator`. `solve.legA`/`solve.legB` return `NaN` when the hypotenuse does not strictly exceed the other leg (an impossible triangle), per the task's explicit requirement. `solver.outputs` adds the triangle's area (½ab) as a free bonus figure. The automated snapshot's "edge" case (`legA=0, legB=0`, since neither has a `min`) gives a finite `hypotenuse=0`/`area=0` — no `KNOWN_NON_FINITE` entry needed; the `NaN`-producing leg-solve direction is a solver-only (bidirectional) behavior the automated harness's forward-only `compute()` never exercises, same as every other solver calculator built so far, verified manually instead. | CompareBars: leg a / leg b / hypotenuse |

**Paused 2026-10-22 after run 4.** 20/~29 math calculators done (run 1: math category + percentage,
percent-change, percent-difference, fraction, ratio; run 2: average, weighted average, rounding,
scientific notation, exponent; run 3: square root, cube root, logarithm, factorial, GCF; run 4:
LCM, prime factorization, long division, quadratic formula, Pythagorean theorem). PR #18 ready for
review. Next session picks up run 5: triangle, circle, area, volume, surface area.

## Type decisions (run 5)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| triangle-calculator | B, with a `mode` options menu | Solving a triangle from SSS, SAS or ASA is three distinct closed-form procedures sharing one 6-field input set (`sideA/sideB/sideC/angleA/angleB/angleC`) — not one invertible equation across all three, so no `solver`. Every mode converges on the same two final steps: get all three sides, then compute all three angles via the law of cosines and the area via Heron's formula, so the three formulas stay internally consistent regardless of which inputs were given. The ambiguous SSA case (two sides and a non-included angle, which can have 0, 1 or 2 valid triangles) is explicitly **not** supported — flagged in `watchOut`, not silently guessed at. Invalid input (the triangle inequality failing, a non-positive side, an angle outside (0°, 180°), or two ASA angles summing to ≥180°) returns `NaN` on every output rather than a wrong number. | CompareBars: side a / side b / side c |
| circle-calculator | A (solver) | Radius and diameter are a trivial 2-variable invertible pair (`d = 2r`), the same shape as `square-root-calculator`. Circumference and area are **not** added as solver variables, even though "find the radius from the circumference" is a real search intent: a circle only has **one** degree of freedom (any one of radius/diameter/circumference/area determines all the others), but the solver widget's "least-recently-edited field is auto" model needs exactly N−1 independent knowns for N variables — correct for a 3-variable relationship like `force-calculator`'s F = ma, but **not** for a 4-variable circle, where 3 "known" fields would usually be mutually inconsistent. Circumference and area are instead `solver.outputs` (always freshly derived from the current radius, like `pythagorean-theorem-calculator`'s triangle area), and the manual formulas for working backward from a known circumference or area are given in the formula section and FAQ instead of wired into the live widget — an honest, documented scope limit rather than a fake solve. | CompareBars: radius vs diameter |
| area-calculator | B, with a `mode` shape menu | Five shapes (square, rectangle, triangle, circle, trapezoid) each use a different, non-interchangeable area formula from a shared pool of up to three generic length inputs (`dim1/dim2/dim3`) — not one rearrangeable equation, so no solver. Deliberately does **not** also compute perimeter: a triangle's area formula here only takes a base and a height, not all three sides, so a perimeter figure would have to either silently assume a right triangle or fabricate a third side — `watchOut` names this limit and cross-links to the new `triangle-calculator` (which does take all three sides) for anyone who actually wants a perimeter. | LogScale: the resulting area against three cited everyday areas (an ISO 216 A4 sheet, a FIBA basketball court, a FIFA-recommended soccer pitch) — chosen over a CompareBars of `dim1`/`dim2` because those two inputs are not even both used in every mode (square and circle only take one), while "how big is this area, really" is a meaningful question in every mode |
| volume-calculator | B, with a `mode` shape menu | Same reasoning as `area-calculator`, one dimension up: cube, rectangular box, cylinder, sphere and cone each have a distinct volume formula from the same shared `dim1/dim2/dim3` length-input pool (radius/height or length/width/height depending on shape), picked by mode rather than solved. | LogScale: the resulting volume against three cited everyday volumes (a 355 mL drink can, a US gallon — 3.785411784 L exactly, per NIST — and a FINA/World Aquatics-standard Olympic pool at 50 m × 25 m × 2 m minimum = 2,500 m³) |
| surface-area-calculator | B, with a `mode` shape menu | Same five solids and the same `dim1/dim2/dim3` inputs as `volume-calculator` (deliberately kept in lockstep, so the two pages read as a matched pair and share one mental model), but each solid's surface-area formula instead of its volume formula — again not a single rearrangeable equation. | LogScale: the resulting surface area against the same three area benchmarks `area-calculator` uses (A4 sheet, basketball court, soccer pitch), for the same reason — a surface area is still fundamentally "how much area," so the same benchmark set applies honestly |

## Type decisions (run 6)

| Calculator | Type | Why | Visual |
|---|---|---|---|
| slope-calculator | B | `m = (y₂−y₁)÷(x₂−x₁)` over two free points is a 5-quantity relationship (x1,y1,x2,y2,m) with no single "any field can be the auto one" solve — fixing 4 of the 5 and back-solving a coordinate is ambiguous (two points, e.g. mirrored across the known one, satisfy the same slope), the same non-invertibility reasoning `triangle-calculator` and `circle-calculator` used. **Vertical-line handling, the task's required decision point**: slope and y-intercept return `NaN` when `x1 === x2` (division by zero is genuinely undefined, not a very large or infinite number), but the angle is computed directly from `atan2(Δy, Δx)` rather than from the slope, so a vertical line still reports an honest 90° instead of also going blank — the one figure of the four that survives a vertical line. Angle is normalized to `[0°, 180°)` via `((raw % 180) + 180) % 180` so it is direction-independent (swapping the two points gives the same angle), matching MathWorld's own `m = tan θ` definition. `KNOWN_NON_FINITE` registered for the one true degenerate case, both points identical (the automated edge case, since none of the 4 inputs has a `min`) — distance is still a legitimate finite 0 there, same "a zero measurement is a real answer" precedent `area-calculator` set in run 5. | CompareBars: `|Δx|` (run) vs `|Δy|` (rise), via a `derive` key since neither is a `compute()` output on its own |
| distance-calculator | B | Same non-invertibility reasoning as slope: `d = √(Δx²+Δy²)` over 4 free coordinates can't nominate one field as "the auto one" without ambiguity (an unspecified coordinate solved from a known distance has two mirror-image answers, with no "positive" convention the way a leg length has in `pythagorean-theorem-calculator`). Deliberately kept as the thinnest possible page — distance, `|Δx|`, `|Δy|` — so it reads as `pythagorean-theorem-calculator`'s coordinate-geometry sibling rather than duplicating slope/midpoint content; cross-linked to both rather than re-explaining them. No `KNOWN_NON_FINITE` needed: identical points give a legitimate finite 0, the same "zero is a real degenerate answer" precedent as the other geometry calculators. | CompareBars: `|Δx|` / `|Δy|` / distance — the same leg-a/leg-b/hypotenuse shape as `pythagorean-theorem-calculator`'s visual, named explicitly in the content as the same triangle |
| midpoint-calculator | B | `Mx=(x1+x2)÷2`, `My=(y1+y2)÷2` are each individually a clean 3-variable invertible relationship (exactly `average-calculator`'s n=2 case), but the two axes can't share one solver panel without an ambiguous back-solve (knowing `Mx` and `x1` alone doesn't pin down `x2` vs. some other pair averaging to the same midpoint without a third constraint) — same reasoning class as slope/distance. Added `distanceAToMid`/`distanceMidToB` as a honest self-check bonus (always exactly equal, by construction) rather than letting the page end at just two coordinates. No `KNOWN_NON_FINITE` needed — every output is finite for any input, including identical points (midpoint = that point, distance 0). | CompareBars: distance from Point A to the midpoint vs. midpoint to Point B — deliberately always equal, a visual proof the midpoint is correct rather than just two more numbers |
| scientific-calculator | C (custom component) | Does not fit `solver` (no single rearrangeable equation — a free-form expression has no fixed set of variables at all) or the type-B `breakdown` widget (a fixed `inputs` array can't represent an open-ended typed expression). Follows the existing type-C precedent exactly (`pomodoro-timer`, `timezone-meeting-planner`, `currency-converter`, `character-counter`/`hashtag-counter`): `inputs: []`, `compute() { return {}; }`, a hardcoded `slug === 'scientific-calculator'` branch in `app/[locale]/calculators/[slug]/page.tsx`, and full v2 content (concept/howTo/formula/workedExample/watchOut/FAQ/references) exactly as those custom tools carry. **Scope check against the task's "stop and park if it needs its own step" instruction**: the new code is `lib/scientificCalc.ts` (a ~200-line hand-written recursive-descent parser: tokenizer, operator precedence, no `eval`/`new Function` anywhere) plus `components/ScientificCalculator.tsx` (a ~180-line button-grid widget, the same size class as `PomodoroTimer.tsx`/`TextToolsCalculator.tsx`, both ~160-190 lines) — comparable to the existing type-C tools, not larger, so it was built in this run rather than parked. Supports `+ − × ÷ ^` (right-associative, so `2^3^2 = 512`), parentheses, implicit multiplication (`2π`, `3(4+5)`), unary minus binding looser than `^` (`−2^2 = −4`, the standard algebra convention), `sin/cos/tan` with a Deg/Rad toggle, `asin/acos/atan` (domain-guarded, returns `NaN` outside [−1, 1] rather than a wrong number), `ln`/`log` (natural/base-10, non-positive arguments refuse), `√` (negative radicand refuses), `π`, `e`, and `!` (nonnegative integers only; refuses non-integers and negatives; honestly overflows to `Infinity` past 170!, the same threshold `factorial-calculator` established in run 3). 25 unit tests in `lib/scientificCalc.spec.ts` cover precedence, right-associativity, the deg/rad toggle, every domain guard, and malformed input (throws rather than guessing). | None — a free-form expression tool has no single "the result" scale to chart; the live numeric preview under the display is the result, matching `PomodoroTimer`/`TextToolsCalculator`'s own precedent of no `LogScale`/`CompareBars` either |

## Verification

**Run 1:** every number in the copy (worked examples, FAQ figures, the `example` line) was
recomputed by an independent Python script in the scratchpad (no app imports) before shipping — see
PR #15's body for the script's output. References are fetched sources only (OpenStax Prealgebra 2e,
Wolfram MathWorld, and a North Carolina State University physics lab manual for percent
difference/error) — never calculator sites.

**Run 2:** every number (worked examples, FAQ figures, `example` lines, LogScale benchmarks) was
recomputed by an independent Python script in the scratchpad (`verify_run2.py`, no app imports) —
0 mismatches, including the float-precision case (1.005 rounds to 1.01, not the naive 1.00) and the
domain-restricted solver branches on `exponent-calculator` (negative base with an odd vs. even
integer exponent, log-domain restrictions). `npm test` 296/296, `npm run build` (92 static pages, up
from 87), `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` all pass.
All 5 pages spot-checked on a local dev server (H1, all 8 content section ids, 2 JSON-LD blocks, the
correct widget mounted — `breakdown-*` fields for the 4 type-B calculators, `solver-base` for
exponent-calculator), plus `/categories/math` and `sitemap.xml` both list all 5; dev server killed
and port 3000 confirmed free afterward. References are fetched sources only — OpenStax (Introductory
Statistics 2e §2.5 for mean/weighted mean, Prealgebra 2e §10.5 for integer exponents/scientific
notation), Wolfram MathWorld (Arithmetic Mean, Weighted Mean, Exponent Laws), NIST (CODATA speed of
light and Avogadro constant, SI prefixes, binary prefixes), and D. Goldberg's "What Every Computer
Scientist Should Know About Floating-Point Arithmetic" for the IEEE 754 rounding/float-representation
notes — never calculator sites. One fetch failure: `ieeexplore.ieee.org/document/8766229` (the IEEE
754-2019 standard itself) returned no readable content (likely paywalled/JS-rendered), so the
Goldberg paper is cited instead for the float-representation and round-to-even material; "IEEE 754"
is still named in prose as the standard term, per the existing precedent for inaccessible primary
sources (e.g. `codes.iccsafe.org` in step 38).

**Run 3:** every number in the copy (worked examples, FAQ figures, `example` lines, LogScale
benchmarks) was recomputed twice — once by an independent Python script in the scratchpad
(`verify_run3.py`, no app imports) and again by a standalone Node one-liner for the
JavaScript-specific behaviors Python doesn't share (`(-8) ** (1/3)` is `NaN` in JS but a complex
number in Python; `Math.cbrt`; `BigInt` factorial digit counts; `Number(BigInt)` overflow to
`Infinity` at 171!) — 0 mismatches between either script and the app's own `compute()`/solver
output (cross-checked against the regenerated snapshot file directly). `npm test` 310/310 (up from
296), `npm run build` (97 static pages, up from 92), `npm run lint -- --ignore-pattern
".open-next/**" --ignore-pattern ".claude/**"` all pass. All 5 pages spot-checked on a local dev
server (H1, every v2 section id, 2 JSON-LD blocks, the correct widget mounted — `solver-*` fields
for the 3 type-A calculators, `breakdown-*` for factorial and GCF — and the rendered `example`
line matched word-for-word), plus `/categories/math` and `sitemap.xml` both list all 5; dev server
killed and port 3000 confirmed free afterward. Alias/related/id collision check run
programmatically across all 69 calculators: no new collisions (the one pre-existing alias
collision, "house loan emi calculator" on mortgage-calculator/emi-calculator, predates this run).
References fetched directly: OpenStax (Prealgebra 2e §5.7 for square roots, §10.6 for GCF via its
plain-number GCF(24,36)=12 example before the polynomial extension; Elementary Algebra 2e §9.7 for
real cube roots of negatives; College Algebra 2e §6.3 for logarithms), NIST DLMF (§4.2 Logarithm,
Exponential, Powers; §5.2 Gamma Function, for the factorial-extension aside), and Wolfram MathWorld
(Square Root, Cube Root, Logarithm, Factorial, Greatest Common Divisor) — never calculator sites.
Two initial URL guesses 404'd (an OpenStax Prealgebra square-root section number guessed wrong, and
a GCF section guessed wrong) and were corrected via search before being cited, so the final
reference list has 0 failures.

**Run 4:** every number in the copy (worked examples, FAQ figures, `example` lines) was recomputed
independently in `verify_run4.py` (scratchpad, no app imports) — 0 mismatches after one correction
to the script itself (an `LCM(17, −5)`-style sign-convention case where the script's first expected
value was transcribed wrong, not a bug in the app; re-derived by hand and confirmed against a
direct Node run of the deployed `compute()` before fixing the script). Cross-checked directly
against the app's own `compute()` via `node -e "import('./data/calculators/index.ts')..."` for
every default, a complex-root case, a repeated-root case, a linear (`a=0`) case, the all-zero
degenerate case, the `n=0`/`n=1`/over-cap/negative cases for prime factorization, and the
divide-by-zero cases — every figure matched. `npm test` 318/318 (up from 310), `npm run build` (102
static pages, up from 97), `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern
".claude/**"` all pass. All 5 pages spot-checked on a local dev server (H1, every v2 section id, 2
JSON-LD blocks, the correct widget mounted — `solver-legA`/`solver-legB`/`solver-hypotenuse` for
Pythagorean, the `example` line rendered word-for-word for all 5), plus a `?a=1&b=2&c=5` share-link
check confirming the complex-root "Real part"/"Imaginary part" rows render instead of a bare NaN;
`/categories/math` and `sitemap.xml` both list all 5 new ids; dev server killed and port 3000
confirmed free afterward. `next-env.d.ts` reverted before committing. Programmatic alias/related/id
collision check across all 74 calculators: no new collisions (the one pre-existing alias collision,
"house loan emi calculator" on mortgage-calculator/emi-calculator, predates this run).

References fetched directly, with corrections along the way: OpenStax Prealgebra 2e §2.5 (Prime
Factorization and the Least Common Multiple — corrected from an initial wrong guess of §4.3/§4.5,
the actual chapter is 2, not 4) and §1.5 (Divide Whole Numbers — corrected from a wrong guess of
§1.4) and §9.3 (Pythagorean Theorem — corrected from a wrong guess of §9.5); OpenStax Elementary
Algebra 2e §10.3 (Quadratic Formula — corrected from a wrong guess of §9.8) and College Algebra 2e
§2.5 (Quadratic Equations, correct on the first guess); Wolfram MathWorld (Least Common Multiple,
Fundamental Theorem of Arithmetic, Divisor Function, Quadratic Formula, Pythagorean Theorem); Pete
L. Clark's *Elementary Number Theory* (Mathematics LibreTexts) §5, The Division Algorithm
(corrected from a wrong guess of §2); and Mount Royal University's *Abstract Algebra I* (Mathematics
LibreTexts) §1.2, for the LCM-with-zero convention that neither MathWorld nor the Clark text state.
Every final URL was fetched and its content confirmed to match the claim before citing — 0 fetch
failures in the final list, though 6 of the 13 references needed at least one wrong guess corrected
via search first.

**Post-review (run 4):** a coordinator review of PR #18 before merge caught a real silent-wrong-digit
bug in `lcm-calculator` (see the last "Fix" section below for the full writeup). The fix, and the
same-class audit it prompted for `gcf-calculator` and `long-division-calculator`, were verified with
an added "LCM/GCF/long-division overflow audit" section in `verify_run4.py`, using Python's exact
arbitrary-precision integers to confirm both the true mathematical value and that the app's new
`Number.isSafeInteger` guard refuses at the right threshold — 0 mismatches. `npm test` 318/318
(snapshot unchanged: the guard only changes behavior for inputs beyond what the default/typical/edge
automated input sets exercise), `npm run build` (102 static pages), lint clean. Re-checked on a local
dev server and killed afterward; port 3000 confirmed free.

## Fix, 2026-10-21: average-calculator counted the wrong numbers

A pre-merge review of PR #16 caught a real bug in the first version of `average-calculator`: (1)
the 4 main slots were always counted, so there was no way to average just 2 or 3 numbers without
leftover defaults being averaged in too, and (2) a genuine 0 typed into one of the 4 optional slots
was silently dropped (the copy even told users to type `0.0001` as a workaround) — a wrong-answer
trap on a page expected to see real traffic for things like averaging test scores that include a 0.

Fixed by adding a `howMany` options field ("How many numbers?", 2-8, default 4); `compute()` now
takes exactly `slots.slice(0, howMany)`, zeros included, instead of filtering by a 0-means-unused
convention. Relabeled the Number 5-8 fields (dropped "(0 = unused)") and rewrote the `howTo`,
`formula.note`, `watchOut` and one FAQ entry that described the old convention. The existing worked
example (85, 90, 78, 92 → 86.25) still holds unchanged at the default count of 4 — re-verified with
both the Python script and the app's own `compute()`. Only `average-calculator`'s own snapshot entry
changed (`git diff --stat` confirms); `weighted-average-calculator` was not touched, since its
weight-of-0 exclusion is mathematically correct as originally built (a weight of 0 genuinely removes
a component from both the weighted sum and the total weight — the plain average has no such weight
to zero out, which is exactly why its old convention was wrong). `npm test` 296/296, `npm run build`
and lint pass; the live page was re-checked on a local dev server (the `howMany` field renders and
mounts, no leftover "0.0001" text), then the server was killed. See the Parked entry on "no
list/array input in the calculator kit" for this fix generalized into a reusable pattern (a count
selector plus array slicing, used whenever 0 is a legitimate data point rather than a true weight).

## Fix, 2026-10-22: gcf-calculator mishandled GCF(0, 0)

A pre-merge review of PR #17 caught a real bug: `gcf-calculator`'s `compute()` reduced its numbers
with the shared `gcd()` helper at the top of `math.ts`, whose `return a || 1` fallback exists so
fraction/ratio simplification never divides by zero — correct for those two pages, wrong for an
actual GCF. Reusing it meant `GCF(0, 0, 12)` computed as `gcd(gcd(0,0), 12)` = `gcd(1, 12)` = `1`
instead of the correct `12`, and `GCF(0, 0)` reported `1` instead of the standard number-theory
convention of `0`.

Fixed by adding `gcdRaw()`, a second Euclidean-algorithm function with no fallback (so
`gcdRaw(0, 0) = 0`), used only by `gcf-calculator`; `gcd()` itself — and therefore
`fraction-calculator`/`ratio-calculator` — is untouched, confirmed byte-identical and their
snapshots unchanged. Rewrote the "GCF(0, 0)" watch-out item, added a dedicated FAQ entry, and added
a third reference (Clark, *Elementary Number Theory*, Mathematics LibreTexts §6: "We define
gcd(0,0) = 0") since neither OpenStax nor MathWorld state the zero case explicitly. Verified
`GCF(0, 0, 12) = 12`, `GCF(0, 18) = 18`, `GCF(0, 0) = 0`, `GCF(0, 18, 24) = 6` (a zero among other
numbers doesn't change the result — only all-zero does), negatives (`GCF(-12, 18) = 6`) and the
non-integer rounding rule, independently in both a Python script and a Node one-liner against the
app's own `compute()`. Only `gcf-calculator`'s own edge snapshot entry changed (`gcf: 1 → 0`,
confirmed with `git diff`); `npm test` 310/310, `npm run build` and lint pass.

## Fix, 2026-10-22: lcm-calculator's first draft got LCM(0, 0) wrong

The first version of `lcm-calculator`'s `lcmPair` helper returned `0` for `LCM(0, 0)`, by direct
analogy with `gcf-calculator`'s `GCF(0, 0) = 0`. Fetching the actual references for this run (not
just reusing GCF's citation, which doesn't cover LCM at all) surfaced a Mount Royal University
LibreTexts page stating plainly: *"A common convention is lcm(a,0) = 0 for all non zero integers
a"* and *"lcm(0,0) = undefined."* `GCF(0,0)=0` and `LCM(0,0)=0` are **not** the same kind of
convention — GCF(0,0) has a defensible "every number divides 0" argument, but LCM(0,0) has no
positive common multiple to appeal to at all, since 0 is the *only* multiple 0 has. Fixed by making
`lcmPair(0, 0)` return `NaN` while `lcmPair(n, 0) = 0` for any nonzero `n` stays as originally
built; registered `lcm-calculator: ['lcm']` in `KNOWN_NON_FINITE` (the automated edge case, since
neither `num1` nor `num2` has a `min`, is exactly `(0, 0)`). Rewrote the "LCM of 0 and 0" watch-out
and added a dedicated FAQ entry; the worked example and every other FAQ figure were unaffected.
Caught and fixed before the first commit of this run, so it never reached a pushed snapshot.

## Fix, 2026-10-22: lcm/gcf/long-division silently overflowed Number.MAX_SAFE_INTEGER

A coordinator review of PR #18, after it was marked ready, caught a second and more serious bug:
`lcm-calculator`'s `lcmPair` computed `(a * b) / gcdRaw(a, b)` with no check that the result still
fits in a double-precision float exactly. Chained over 4 pairwise-coprime numbers — e.g.
`LCM(9973, 9967, 9949, 9941)`, all four prime, so nothing cancels in the GCF step — the true result
is `9,831,047,217,181,019`, which exceeds `Number.MAX_SAFE_INTEGER` (`2^53 − 1` =
`9,007,199,254,740,991`). The app showed `9,831,047,217,181,020` instead: a **silently wrong digit**,
not a `NaN` — exactly the class of bug the run-2 and run-3 "Fix" sections above were written to
guard against, and one this run's own number-verification pass missed, since every number actually
used in the shipped copy happened to stay well within the safe range.

Fixed `lcmPair` two ways: (1) divide before multiplying (`(a / gcdRaw(a, b)) * b`) to keep the
intermediate value as small as possible — this alone does not fix the failing case above, since
`gcd = 1` for coprime inputs leaves nothing to divide out first, but it does help other cases and
costs nothing; (2) refuse (`NaN`) whenever either input, or the result itself, is not
`Number.isSafeInteger`. Audited the other three run-4 calculators for the same class of bug:

- **gcf-calculator**: the GCF itself can never exceed the smallest input (Euclidean algorithm only
  ever shrinks), so there is no *growth* risk the way LCM has — but an input already beyond
  `2^53 − 1` has lost precision before `compute()` ever sees it, so a confidently-displayed GCF
  built from an already-wrong number would still be a silent bug of the same family. Added the same
  `Number.isSafeInteger` input guard.
- **long-division-calculator**: the quotient can never exceed the dividend's own magnitude (the
  rounded divisor is always ≥ 1 once zero is ruled out), so again no growth risk — but the dividend
  and divisor are now checked the same way before dividing.
- **prime-factorization-calculator**: already capped at `10^12`, confirmed comfortably inside
  `Number.MAX_SAFE_INTEGER` (`10^12 < 2^53 − 1`), so no change was needed here. The kit's
  `CalculatorInput` type has no `max` field (only `min`), so there is no separate input-level
  enforcement to add beyond the existing in-`compute()` cap — documented here rather than silently
  skipped.

None of the three fixes changed the automated snapshot: the default/typical/edge input sets for all
three calculators stay well within the safe-integer range, so no new `KNOWN_NON_FINITE` entries were
needed (`npm test` 318/318, unchanged pass count, 0 snapshot diff). Added a watch-out item + FAQ
entry to `lcm-calculator`, `gcf-calculator` and `long-division-calculator` explaining the refusal in
plain language (citing `9,007,199,254,740,991` / `2^53 − 1` by name, not just "very large numbers"),
and a new "LCM/GCF/long-division overflow audit" section to `verify_run4.py` that uses Python's
exact arbitrary-precision integers to confirm both the true mathematical value for the failing case
and that the app's guard now triggers at exactly the right threshold — 0 mismatches. `npm run build`
(102 static pages) and lint pass; re-checked on a local dev server, then killed, port 3000 confirmed
free.

**Run 5:** every number in the copy (worked examples, FAQ figures, `example` lines, LogScale
benchmarks) was recomputed independently in `verify_run5.mjs` (scratchpad, plain JavaScript, no app
imports — chosen over Python this time since `triangle-calculator`'s law-of-cosines/law-of-sines
results needed to match the app's own `Math.acos`/`Math.sin` floating-point behavior exactly) — 0
mismatches. Every figure was then cross-checked a second time by calling the app's own `compute()`
directly (`node -e "import('./data/calculators/index.ts')..."`), for: the 3-4-5 default and 7-9-12
worked-example triangles (SSS), the SAS case (a=8, b=10, included angle 60°), the ASA case (angles
50°/60°, included side 10), the invalid 1-2-10 triangle (confirms every output comes back `NaN`, not
a wrong number), the circle default (r=5) and worked example (d=14 → r=7), and every shape in
area-calculator, volume-calculator and surface-area-calculator (square/rectangle/triangle/circle/
trapezoid; cube/box/cylinder/sphere/cone, both volume and surface area) — every figure matched
exactly. `npm test` 326/326 (up from 318), `npm run build` (107 static pages, up from 102),
`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` all pass.
Data-integrity check run programmatically against the live data module for all 5 new calculators:
0 broken `related` ids, 0 self-references, 0 duplicate aliases against any other calculator, all 79
ids unique. All 5 pages spot-checked on a local dev server (H1, every v2 section id, exactly one
JSON-LD `<script>` tag per page containing all 4 node types — `WebApplication`, `BreadcrumbList`,
`HowTo`, `FAQPage` — confirmed by parsing it rather than just grepping for the tag, since the whole
array serializes onto one line; the correct widget mounted — `breakdown-mode` for the four type-B
calculators, `solver-radius`/`solver-diameter` for circle-calculator; a `?mode=2&sideA=8&sideB=10&
angleC=60` share-link on triangle-calculator also returned 200), plus `/categories/math` and
`sitemap.xml` both list all 5 new ids (confirmed as exact substring matches, not just non-zero grep
counts, since "area-calculator" is also a substring of "surface-area-calculator"); dev server
killed and port 3000 confirmed free afterward.

References fetched directly, each confirmed to contain the exact formula claimed before citing:
OpenStax Algebra and Trigonometry 2e §10.1 (Law of Sines) and §10.2 (Law of Cosines, which also
states Heron's formula) for `triangle-calculator`; OpenStax Prealgebra 2e §9.4 (rectangle/triangle/
trapezoid area), §9.5 (circle circumference/area), and §9.6 (volume and surface area for all five
solids — explicitly stating it does not cover a cone's surface area) for `area-calculator`,
`circle-calculator`, `volume-calculator` and `surface-area-calculator`; Wolfram MathWorld's Circle,
Heron's Formula, Law of Cosines, Law of Sines and Cone pages (the last supplying the cone's lateral
surface area formula, πrs with slant height s = √(r²+h²), that OpenStax deliberately omits — this
calculator's cone figure adds the base, πr², on top of MathWorld's lateral-only term, and says so
explicitly in `formula.note` and a watch-out item). The FIBA 2026 Official Basketball Rules (28 m ×
15 m court) and ISO 216 (A4 = 210 mm × 297 mm) were verified via web search/fetch for the
`area-calculator`/`surface-area-calculator` LogScale benchmarks, but — following the precedent that
force-calculator's own benchmarks (an apple, a rocket) were never individually cited in its
References list — these benchmark captions are not added as formal references, since the `content.
references` list is reserved for the 2-4 primary sources behind the calculator's actual math, not
every incidental fact named in a chart caption. The same applies to the US gallon (3.785411784 L,
already asserted as exact in `lib/units.ts`'s own NIST SP 811 comment) and the Olympic pool minimum
(World Aquatics/FINA facility rules, 50 m × 25 m × 2 m) used in `volume-calculator`'s benchmarks.

**Paused 2026-10-22 after run 5.** 25/~29 math calculators done (run 1: math category + percentage,
percent-change, percent-difference, fraction, ratio; run 2: average, weighted average, rounding,
scientific notation, exponent; run 3: square root, cube root, logarithm, factorial, GCF; run 4: LCM,
prime factorization, long division, quadratic formula, Pythagorean theorem; run 5: triangle, circle,
area, volume, surface area). PR #19 ready for review. Next session picks up run 6: slope, distance
between two points, midpoint, scientific-calculator.

**Run 6:** every number in the copy (the default/worked-example/FAQ figures for all three
coordinate-geometry calculators, plus the scientific-calculator worked example) was recomputed
independently in `verify_run6.mjs` (scratchpad, plain JavaScript, no app imports) — 35 checks, 0
mismatches, including the vertical-line case (slope/y-intercept `NaN`, angle exactly 90°), the
identical-points degenerate case (slope/angle `NaN`, distance a legitimate 0), and the scientific
worked example `sin(30°) + log(100) × 5! = 240.5`. The scientific-calculator's parser additionally
got 25 dedicated unit tests (`lib/scientificCalc.spec.ts`) covering operator precedence,
right-associative `^`, factorial binding, the deg/rad toggle on both forward and inverse trig,
every domain guard (asin/acos out of [−1,1], ln/log non-positive, sqrt negative, factorial
non-integer/negative), and malformed input (throws rather than returning a wrong number).
`npm test` 354/354 (up from 326), `npm run build` (111 static pages, up from 107),
`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` all pass. A
programmatic check across all 83 calculators found 0 broken `related` ids, 0 self-references, and 0
new duplicate aliases (the one pre-existing collision, "house loan emi calculator" on
mortgage-calculator/emi-calculator, predates this run). All 4 pages, `/categories/math` and
`sitemap.xml` spot-checked on a local dev server: H1, every v2 section id, exactly one JSON-LD
`<script>` per page containing all 4 node types (`WebApplication`, `BreadcrumbList`, `HowTo`,
`FAQPage`), the correct widget mounted (`breakdown-x1`/`y1`/`x2`/`y2` fields for the three type-B
calculators, the custom `ScientificCalculator` button grid for the fourth), a
`?x1=3&y1=1&x2=3&y2=9` vertical-line share-link on slope-calculator returning 200, and both listing
pages containing all 4 new ids as exact substring matches; dev server killed afterward, port 3000
confirmed free. References fetched directly and each confirmed (via `WebFetch`) to state the exact
formula claimed before citing: OpenStax Algebra and Trigonometry 2e §4.1 (slope, including the
explicit "slope of a vertical line is undefined" statement) and §2.1 (distance formula, midpoint
formula — confirmed on the same page, re-cited for both distance-calculator and midpoint-calculator
rather than guessed); OpenStax Prealgebra 2e §2.1 (order of operations, via a corrected search after
an initial guess of §1.2/§1.9 both 404'd); NIST DLMF §4.2 (logarithm/exponential definitions, reused
from runs 2–3's citation of the same chapter), §4.14 (trig function definitions) and §4.23 (inverse
trig functions); Wolfram MathWorld's Slope, Distance and Midpoint pages. No invented statistics or
benchmarks were needed this run (no LogScale visual), so no benchmark-sourcing section applies.

**Paused 2026-10-22 after run 6 — Wave 1 math is complete.** 29/~29 math calculators done (run 1:
math category + percentage, percent-change, percent-difference, fraction, ratio; run 2: average,
weighted average, rounding, scientific notation, exponent; run 3: square root, cube root,
logarithm, factorial, GCF; run 4: LCM, prime factorization, long division, quadratic formula,
Pythagorean theorem; run 5: triangle, circle, area, volume, surface area; run 6: slope, distance,
midpoint, scientific-calculator). PR for this run is ready for review. The math category's own
`calculator-rollout-plan.md` §4 list is now fully built (the "mixed number"/"proportion" dedup from
run 1 absorbed those two into fraction-calculator/ratio-calculator rather than separate pages, per
that run's dedup decision). Next session moves on to the **statistics** part of Wave 1 (a new
category, following the same just-in-time step-file process this file used), per
`mdFiles/calculator-rollout-plan.md` §4 and `STATUS.md`'s 40–42 row.
