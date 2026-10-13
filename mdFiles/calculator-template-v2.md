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
- **Use `inputs` + `compute`** for one-directional calculators (e.g. date difference).
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

Add it to `categories` in `data/calculators.ts`. A category needs **≥ 25 calculators within a wave**
before it's promoted in the nav (strategy §4.2). The single physics calculator on the preview
branch is a demo exception.
