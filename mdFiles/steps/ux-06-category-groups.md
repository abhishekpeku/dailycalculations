# UX-06 — sub-grouping within a large category page

Off the numbered step sequence (like UX-01..05). Branch: `ux/category-calculator-groups`.

## Scope (narrow — read before touching anything)

Sub-group calculators **within a category page only**. Nothing else changes:

- `/calculators` (`CalculatorBrowser.tsx`) — unaffected.
- The header's Categories dropdown (`CategoriesMenu.tsx`) — unaffected.
- The phone menu (`MobileMenu.tsx`) — unaffected.
- `app/[locale]/categories/[category]/page.tsx`'s small-category branch (`<= SEARCH_THRESHOLD`,
  i.e. everything except measurements/math/statistics) — unaffected, verified identical.
- `CategoryCalculatorFilter.tsx`'s **filtered** (query typed) state — unaffected, stays one flat
  matched grid, no group headings, regardless of topic.

Only the **unfiltered** state of the three categories already past `SEARCH_THRESHOLD = 15`
(measurements 40, math 29, statistics 25) gets grouped sections.

## Part 1 — data: `group` field

`data/calculators/types.ts`, `CalculatorConfig`:

```ts
/** Optional sub-grouping shown as a labeled section within a large category's page (today: the
 * three categories past SEARCH_THRESHOLD in categories/[category]/page.tsx). Every calculator in
 * a grouped category must have one — don't leave stragglers ungrouped (see categories.spec.ts). */
group?: string;
```

## Part 2 — exact taxonomy (user-approved, verbatim, do not reorder/invent)

Verified against the data files before writing this: `grep -c "^    category: 'measurements'"
data/calculators/measurements.ts` → 40, same pattern for math.ts → 29, statistics.ts → 25. (A
naive `grep -c "    id: '"` over-counts statistics.ts to 26 because of a shared `listInput()`
helper's `id: 'data'` literal at the same indent — not a calculator. Anchored `^    id: '` /
`^    category: '` avoids that false positive.)

Group **rendering order** = the order each group is first introduced by the data file's own
calculator order (not alphabetical, not by count). Verified below per file.

### `measurements.ts` — 40 calculators, 11 groups, first-introduced order:

1. **Length & Distance** (5): Miles to Kilometers Converter, Centimeters to Inches Converter, Feet to Meters Converter, Millimeters to Inches Converter, Length Converter
2. **Weight & Mass** (4): Pounds to Kilograms Converter, Grams to Ounces Converter, Kilograms to Stone Converter, Weight Converter
3. **Volume & Cooking** (9): Gallons to Liters Converter, Ounces to Milliliters Converter, Milliliters to Cups Converter, Volume Converter, Cups to Grams Converter, Cups to Grams – All-Purpose Flour, Cups to Grams – Sugar, Cups to Grams – Butter, Cups to Grams – Rice
4. **Temperature, Energy & Power** (5): Fahrenheit to Celsius Converter, Energy Converter, Kilocalories to Kilojoules Converter, Power Converter, Horsepower to Kilowatts Converter
5. **Speed & Fuel** (3): Mph to Kph Converter, Speed Converter, MPG to L/100km Converter
6. **Area & Land** (3): Square Feet to Square Meters Converter, Acres to Hectares Converter, Area Converter
7. **Pressure** (2): Bar to PSI Converter, Pressure Converter
8. **Time** (1): Time Converter
9. **Data Storage** (2): Data Storage Converter, Megabytes to Gigabytes Converter
10. **Shoe Sizes** (4): Shoe Size Converter, Men's Shoe Size Chart, Women's Shoe Size Chart, Kids' Shoe Size Chart
11. **Ring Sizes** (2): Ring Size Converter, US to UK Ring Size Chart

Total 5+4+9+5+3+3+2+1+2+4+2 = 40. ✓

### `math.ts` — 29 calculators, 5 groups, first-introduced order:

1. **Percentages & Averages** (7): Percentage Calculator, Percent Change Calculator, Percent Difference Calculator, Fraction Calculator, Ratio Calculator, Average Calculator, Weighted Average Calculator
2. **Number Theory & Arithmetic** (11): Rounding Calculator, Scientific Notation Calculator, Exponent Calculator, Square Root Calculator, Cube Root Calculator, Logarithm Calculator, Factorial Calculator, GCF Calculator, LCM Calculator, Prime Factorization Calculator, Long Division Calculator
3. **Algebra** (2): Quadratic Formula Calculator, Slope Calculator — note: Slope Calculator sits later in the data file (after several Geometry entries) but Algebra was already introduced by Quadratic Formula Calculator, so the Algebra section still renders 3rd (before Geometry).
4. **Geometry** (8): Pythagorean Theorem Calculator, Triangle Calculator, Circle Calculator, Area Calculator, Volume Calculator, Surface Area Calculator, Distance Calculator, Midpoint Calculator
5. **Tools** (1): Scientific Calculator

Total 7+11+2+8+1 = 29. ✓

### `statistics.ts` — 25 calculators, 4 groups, first-introduced order:

1. **Descriptive Statistics** (8): Mean, Median & Mode Calculator, Standard Deviation Calculator, Variance Calculator, Z-Score Calculator, Percentile Calculator, Quartile & IQR Calculator, Coefficient of Variation Calculator, Outlier Calculator
2. **Hypothesis Testing** (7): Confidence Interval Calculator, Margin of Error Calculator, Sample Size Calculator, P-Value Calculator, T-Test Calculator, Chi-Square Calculator, Standard Error Calculator
3. **Probability** (6): Probability Calculator, Permutation Calculator, Combination Calculator, Binomial Distribution Calculator, Normal Distribution Calculator, Expected Value Calculator
4. **Relationships Between Variables** (4): Correlation Coefficient Calculator, Linear Regression Calculator, Relative Risk Calculator, Odds Ratio Calculator

Total 8+7+6+4 = 25. ✓

Every other category file: `group` stays `undefined` on every calculator — enforced by the new test.

## Part 3 — rendering

- `categories/[category]/page.tsx`: `<= SEARCH_THRESHOLD` branch untouched.
- `CategoryCalculatorFilter.tsx` unfiltered state: split `calculators` into groups in first-
  introduced order; each section gets a small eyebrow heading reusing `HowItWorksCard.tsx`'s
  exact classes (`text-[12px] font-semibold uppercase tracking-wide text-[#6E6E73]
  dark:text-slate-400`) with the count appended, then that group's own
  `grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5` of `GlyphCalculatorCard`s.
  Sections stack with `space-y-6`. Heading is a `<p>`, not an `<h2>`/`<h3>` (page's own `<h1>` is
  the category title; no TOC on this page to clash with).
- Filtered state (query typed): unchanged, one flat grid, no headings.
- When `group` is missing on every item (every category at/under the threshold doesn't reach this
  component at all today, but guard anyway): fall back to the old single-grid rendering so the
  component never silently drops a card if `group` is ever absent on a future large category.

## Acceptance checks

- `npm run build` passes.
- `npm test` green, including the new group-coverage test.
- `npm run lint` — no new errors vs. master.
- Visual, headless Chrome, scratch dir outside the repo:
  - `/categories/measurements` unfiltered — 11 groups, right order/counts, desktop + phone + dark.
  - `/categories/measurements` filtered (query "cups") — one flat grid, no headings.
  - `/categories/math`, `/categories/statistics` unfiltered — spot-check labels/order.
  - A small category (e.g. `/categories/finance`) — byte-for-byte same as before.
  - `/calculators` and the Categories dropdown on Measurements — no grouping, unaffected.

## Progress

- [x] Step file written, branch created
- [ ] Draft PR opened
- [ ] Part 1: `group?` field added to `CalculatorConfig`
- [ ] Part 2a: measurements.ts tagged (40/40)
- [ ] Part 2b: math.ts tagged (29/29)
- [ ] Part 2c: statistics.ts tagged (25/25)
- [ ] Group-coverage test added
- [ ] Part 3: rendering (CategoryCalculatorFilter grouped sections)
- [ ] Build / test / lint pass
- [ ] Visual verification (desktop/phone/dark) for all 6 checks above
- [ ] STATUS.md updated, PR marked ready
