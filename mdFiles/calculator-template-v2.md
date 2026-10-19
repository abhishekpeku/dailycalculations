# Calculator page template v2 — the spec every new calculator follows

Introduced 2026-10-12 with the `force-calculator` preview (branch
`preview/physics-force-calculator`). Strategy context: `mdFiles/omni-strategy.md` §3–§4.
Status: **preview**. The template is not yet adopted in `STATUS.md`. Once it is, this file is
the reference for steps 30, 43 and every sector-wave step.

---

## 1. What a v2 page contains (top to bottom)

| # | Block | Source field | Required |
|---|---|---|---|
| 1 | Breadcrumb → H1 → alias sentence → description | `title`, `aliases`, `description` | yes |
| 2 | Byline: "By the Daily Calculations editorial team · Last reviewed <date>" | `content.lastReviewed` | yes |
| 3 | **Widget** (above the fold) | `solver` *or* `inputs` + `compute` | yes |
| 4 | Example line | `example` | yes |
| 5 | **Table of contents**, auto-built from every section on the page: the side panel beside the widget on desktop | — | auto |
| 6 | "What is X?" concept explainer, 2–4 paragraphs: the first theory section | `content.concept` | yes |
| 7 | How to use, 4–6 steps | `content.howTo` | yes |
| 8 | The formula, plus a term glossary | `content.formula` | yes |
| 9 | Worked example: realistic numbers, every step shown | `content.workedExample` | yes |
| 10 | Things to watch out for, 3–5 items | `content.watchOut` | yes |
| 11 | FAQ, 5–8 questions | `seo.faq` | yes |
| 12 | References, 2–4 primary sources | `content.references` | yes |
| 13 | Related calculators, 3–4 | `related` | yes |

Target length is **1,200–2,500 words** of real prose.

**Layout (user decisions, 2026-10-12):** on desktop (`lg`), the **calculator takes the wider
column (3/5) and an Omni-style numbered table of contents takes a narrower, sticky panel (2/5)**
beside it. The reader sees the whole outline at the top, and every theory section follows below
in TOC order, full width. On mobile the TOC stacks below the calculator. Pages without
`content.concept` keep the single-column layout with no TOC. One calculator covers one equation
in all its directions (F, m and a on one page). A different formula for a related search (e.g.
a = Δv ÷ t) gets its own page.

## 2. Widget: `solver` vs `compute`

- **Use `solver`** whenever the formula can be rearranged (most physics, chemistry, statistics,
  and many finance pages). Define one `SolverVariable` per field with a `dimension` from
  `lib/units.ts`, and one `solve[id]` function per variable. The functions take **SI base units**
  and return **SI**, or `NaN` when there's no answer (divide by zero, negative root).
  Percent is passed as the percent number (5 = 5%), so divide by 100 yourself.
- **No closed form for a variable?** (A loan's rate, compound interest with contributions solved
  for years or rate.) Leave its `solve` entry out and give the solver an `equation`: the residual
  of the governing formula, which is 0 when the variables are consistent. The widget finds the
  missing variable numerically (`lib/solve.ts`: bracket, Brent, Newton fallback; `NaN` when there's
  no root). Give that variable `bounds: [min, max]` in SI (and optionally `guess`, which defaults to
  `defaultValue` in SI) so the search stays in the meaningful range, e.g. `[0, 100]` for a rate.
  Closed-form `solve` entries still win wherever they exist.
- **`outputs`** are extra figures derived from the solved set, such as total interest or total
  paid: `{ id, label, dimension, unit?, compute(si) }`. `compute` gets every variable in SI, the
  solved one included. They render under the main result, in `unit` (default: the base unit).
- **`fixed: true`** on a variable keeps it an input that is never `auto` (a mortgage's down
  payment, a tip's split count). It is left out of the least-recently-edited rotation.
- Single-unit dimensions (`percent`, `count`, `currency`) show their unit inline instead of a menu.
  Any input or result that isn't finite (0 mpg is `Infinity` in SI) counts as "no answer".

```ts
// Amortized loan: payment has a closed form, the rate does not.
const payment = (P: number, n: number, apr: number) => {
  const r = apr / 100 / 12; // percent is the percent number: 6 means 6%
  return r === 0 ? P / n : (P * r) / (1 - (1 + r) ** -n);
};
solver: {
  defaultTarget: 'payment',
  variables: [
    { id: 'payment', label: 'Monthly payment', symbol: 'M', dimension: 'currency', defaultValue: 1199.1, defaultUnit: 'currency' },
    { id: 'principal', label: 'Loan amount', symbol: 'P', dimension: 'currency', defaultValue: 200000, defaultUnit: 'currency' },
    { id: 'months', label: 'Term', symbol: 'n', dimension: 'count', defaultValue: 360, defaultUnit: 'count', bounds: [1, 1200] },
    { id: 'rate', label: 'Interest rate', symbol: 'r', dimension: 'percent', defaultValue: 6, defaultUnit: '%', bounds: [0, 100] }
  ],
  solve: { payment: ({ principal, months, rate }) => payment(principal, months, rate) },
  equation: (si) => si.payment - payment(si.principal, si.months, si.rate), // principal, months, rate: numeric
  outputs: [{ id: 'totalInterest', label: 'Total interest', dimension: 'currency', compute: (si) => si.payment * si.months - si.principal }]
}
```

- **Use `inputs` + `compute`** for one-directional calculators (e.g. date difference). They render
  through the type-B widget, `BreakdownCalculator` (step 33); see "Type-B widget" below.
- A `solver` calculator still needs `inputs` + `compute` for the forward direction. The JSON-LD
  builders and the step-17 snapshot tests read them.
- `benchmarks` (optional) are everyday reference points, in SI, drawn on the result scale. Each one
  must be a real, checkable figure.
- Units: `lib/units.ts` has 17 dimensions (step 30). Besides the physical ones there are
  `percent` (base = the percent number, so 5 means 5%), `count` and `currency` (a placeholder until
  the region step). The **first unit of every dimension is its base**, with factor 1, and `solve`
  functions take and return values in that base. Temperature's base is K. Fuel economy's is m³/m
  (volume per distance): `volume = distance × economy`, and mpg and km/L are reciprocals of it.
- Need a new unit or dimension? Add it to `UNITS`. Each unit defines its conversion in one of three
  ways: `factor` (base = value × factor), `factor` + `offset` (affine:
  base = (value + offset) × factor, as in °C and °F), or a `toBase`/`fromBase` function pair for
  anything non-linear (`inverse(k)` builds reciprocal units such as mpg). Factors come from **NIST
  SP 811 Appendix B**, exact where the definition is exact, written as expressions of the exact
  constants (`FOOT ** 3`) with one source comment per dimension. Add a round-trip and an anchor
  value to `lib/units.spec.ts`. Never hard-code a conversion factor inside a calculator.

**Widget behavior (user decision, 2026-10-12):** there's no "solve for" picker. Every field is an
input. The **least recently edited** field is calculated, highlighted in the category accent
color with an `auto` badge, so typing any two values fills in the third. Typing into the auto field
hands "auto" to the next-oldest field.

Share links (`?solve=…&<id>=…&<id>_unit=…`) are read client-side after hydration. Pages stay
`force-static`, and the canonical never includes the query string.

### Result visuals (step 32): `components/visuals/`

One hand-rolled SVG/Tailwind kit, no chart library. Pick from this table and never draw a new
visual inside a calculator. If nothing fits, add it to the kit in its own step. The geometry lives
in `lib/visuals.ts` and the loan schedule in `lib/amortization.ts`, both unit-tested.

| Use it for | Component | Props |
|---|---|---|
| A value against named ranges: BMI WHO bands, typical engagement rates | `RangeBar` | `bands: {label, min, max, color?}[]` (contiguous, ascending; lower bound inclusive, upper exclusive), `value`, `accent`, `title?`, `valueLabel?`, `format?`, `summary?` |
| Parts of a whole, 2–6 parts: principal vs interest, where a paycheck goes, a budget split | `Donut` | `segments: {label, value, color?}[]`, `accent`, `centerLabel`, `centerSub?`, `format?`, `summary?` |
| 2–4 amounts side by side: EV vs gas, before vs after, then vs now, which is cheaper | `CompareBars` | `bars: {label, value, color?}[]`, `accent`, `title?`, `highlight?` (index in full accent, default 0), `format?`, `summary?` |
| A span of time: pregnancy trimesters, the 180-day visa window, date difference | `Timeline` | `start`, `end` (any numeric axis), `phases?: {label, from, to}[]`, `milestones?: {label, at}[]`, `today?`, `todayLabel?`, `startLabel?`, `endLabel?`, `accent`, `title?`, `summary?` |
| Any amortized loan (loan, mortgage, EMI, car payment) | `AmortizationTable` | `principal`, `annualRate` (percent number), `months`, `payment?`, `format?`, `initialYears?` (default 5, then a "Show all" toggle) |
| A value spanning orders of magnitude, with everyday benchmarks (force, energy, data) | `LogScale` | `value`, `min`/`max` (powers of ten), `ticks: string[]` (spread evenly, so use evenly spaced exponents), `benchmarks: {label, value}[]`, `accent`, `title?`, `valueLabel?`, `summary?` |

Rules that hold for all of them:

- `accent` is the category color, `TILE_COLORS[categoryTheme(category).color][1]`, as `#RRGGBB`.
  It fills marks only. Text and tracks are slate with `dark:` variants, so every visual works in
  dark mode. Tints come from `tint(accent, alpha)`.
- Each one has `role="img"` and an `aria-label` that states the result in words. Pass `summary` to
  word it better. Legends, rows and the table stay real text.
- Fixed heights and percentage widths: no layout shift, and fine at 360 px.
- They render on the server, but **never pass the clock or `window`** during render. `Timeline`
  takes `today` from the caller after mount (as `timeDependent` calculators do). `format`
  defaults to `formatSignificant`, or to cents for `AmortizationTable`, until the region step.
- Values are in display units. Convert from the solver's SI (`solveState().si` / `outputs`) with
  `fromBase` before passing them.
- `SolverCalculator` draws `LogScale` today, only for `force-calculator` (`solver.benchmarks`). The
  type-B widget takes its visual from `breakdown.visual` (below).

### Type-B widget (step 33): `breakdown`

Every calculator without a `solver` (and not one of the custom type-C tools) renders through
`components/BreakdownCalculator.tsx`: grouped inputs, then a result card with a headline, breakdown
rows and one visual, plus share / copy / reset (shared with the solver in
`components/CalculatorWidget.tsx`). Logic and defaults: `lib/breakdown.ts`. The optional
`breakdown` field shapes it; with none, the first compute key is the headline, the rest are rows,
labels are the keys in sentence case, and all inputs sit in one group. **`compute()` never changes.**

- **Units on inputs:** `dimension` + `unit` on a `CalculatorInput` (the unit `compute()` expects)
  gives the field a unit menu. The widget converts the typed value into `unit` before `compute()`.
- `headline` (a key), `headlineLabel`, `outputs: { id, label?, format?, dimension?, unit?, alsoIn? }[]`
  (row order; `format` is `currency` | `percent` | `integer` | `number` (≤ 2 decimals) |
  `significant`). Set `format: 'currency'` explicitly: the default money guess only matches keys
  containing Amount / Cost / Payment / Interest / Principal.
- `groups: { title?, inputs, optional? }[]`: optional groups sit behind a disclosure. Unlisted inputs go last.
- `derive(values)`: display-only extras from inputs + outputs (compute units), e.g. monthly tolls
  for a donut. Rows and the visual can name them.
- `visual`: one kit component fed by key (input id, compute key or derived key):
  `donut` (`segments: {from, label?}[]`, `center`, `centerSub?`), `compareBars` (`bars`, `title?`,
  `highlight?`), `rangeBar` (`value`, `bands`), `timeline` (`start`, `end`, `phases?`, `milestones?`,
  `today?`: a key such as `todayMs`, which `timeDependent` calculators get after mount),
  `amortization` (`principal`, `annualRate`, `months`, `payment?`), `logScale`. Values print in the
  format of the first key the visual reads.
- Share links: `?<id>=<value>&<id>_unit=<unit>`, only fields that differ from the defaults.
- Reference config: `commute-cost-calculator`.

## 3. Content rules

- **Write in our own words.** Formulas and facts are common knowledge, but other sites' prose is
  not. Never paraphrase Omni or any competitor closely. Cite **primary** sources (NIST, BIPM,
  OpenStax, government agencies, peer-reviewed papers), never another calculator site.
- **No invented people or credentials.** The byline is the editorial team until a real, named
  reviewer exists.
- **Every number in the worked example and FAQ must be recomputed** with the calculator's own
  functions before shipping (see the skill's verification step).
- US English spelling in copy. Show metric and US units side by side where both matter.
- Finance and health pages (YMYL): references are mandatory, and so is a one-line "estimates only"
  note in `formula.note` or a watch-out item.
- `updatedAt` and `lastReviewed` are the date the content was actually written or checked.

## 4. Adding a new category

Add it to `categories` in `data/calculators/index.ts`, create `data/calculators/<id>.ts` exporting
`<id>Calculators`, and spread it into `calculators` there. A category needs **≥ 25 calculators within a wave**
before it's promoted in the nav (strategy §4.2). The single physics calculator on the preview
branch is a demo exception.
