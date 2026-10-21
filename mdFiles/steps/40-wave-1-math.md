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
- Run 3 (next): square root, cube root, logarithm, factorial, GCF
- Run 4: LCM, prime factorization, long division, quadratic formula, Pythagorean theorem
- Run 5: triangle, circle, area, volume, surface area
- Run 6: slope, distance between two points, midpoint, scientific-calculator

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
