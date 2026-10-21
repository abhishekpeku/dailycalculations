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

- Run 2 (next): average, weighted average, rounding, scientific notation, exponent
- Run 3: square root, cube root, logarithm, factorial, GCF
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

## Verification

Every number in the copy (worked examples, FAQ figures, the `example` line) was recomputed by an
independent Python script in the scratchpad (no app imports) before shipping — see the PR body for
the script's output. References are fetched sources only (OpenStax Prealgebra 2e, Wolfram MathWorld,
and a North Carolina State University physics lab manual for percent difference/error) — never
calculator sites.
