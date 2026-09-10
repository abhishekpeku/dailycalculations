# Step 10 — New page template + pilot

**Scope (from `STATUS.md`):** Rebuild the calculator page: breadcrumb → H1 + aliases → **widget
above the fold** → How to use → The formula → Worked example → Watch out for → 6-8 FAQs → Related.
Add the content fields to `CalculatorConfig`. **Populate for `date-difference-calculator` only.**

**Spec:** `mdFiles/instructions.md` §4.2 (template too thin), §4.3 (widget above the fold),
§5.2 (`date difference calculator` — the diagnostic case).

---

## Why this step exists

`date-difference-calculator` is the diagnostic case. The site already has exactly this calculator at
exactly this slug, so if it is not ranking, the cause is not coverage — it is the ~150 words of
content and the `howToUse` boilerplate that is byte-identical on all 53 pages. Phase A already fixed
the canonicals, sitemap and duplicate locales. This step fixes the depth, on **one page**, so step 11
can measure whether depth is what was missing before 52 more pages are written.

The template change lands on all 53 pages. The **content** lands on one.

---

## Design

### 1. Schema — `data/calculators.ts`

Add an **optional** `content` field. Optional is the point: 52 calculators keep rendering exactly
what they render today, and the new sections are absent from their HTML rather than present-and-empty.

```ts
export type CalculatorHowToStep = { name: string; text: string };

export type CalculatorContent = {
  /** Replaces the input-derived steps in `buildHowToSteps` — and therefore the HowTo JSON-LD too. */
  howTo: { intro: string; steps: CalculatorHowToStep[]; outro?: string };
  formula: {
    intro: string;
    expression: string;
    terms: { symbol: string; meaning: string }[];
    note?: string;
  };
  workedExample: {
    intro: string;
    rows: { label: string; value: string }[];
    result: string;
    explanation: string;
  };
  watchOut: { title: string; body: string }[];
};
```

On `CalculatorConfig`, `content?: CalculatorContent` sits directly after `example` — the fields stay
in rendering order (`title → description → example → content → inputs`). Unlike `aliases` / `related`
it is **not** required: making it required would mean writing 53 pages of content in this step, which
is precisely what step 11's gate exists to avoid committing to.

`CalculatorClientConfig` becomes `Omit<CalculatorConfig, 'compute' | 'content'>`. The content is
server-rendered prose; shipping it across the RSC boundary into `CalculatorForm` would put every word
of it in the flight payload twice.

### 2. `lib/seo.ts`

- `HowToStep` becomes an alias of `CalculatorHowToStep` (data owns the shape; `lib/seo` already
  imports from data, so the dependency direction is unchanged and there is no cycle).
- `buildHowToSteps(slug)` returns `calculator.content.howTo.steps` when `content` is present, and
  otherwise falls back to today's input-derived steps. **This is the one function to change** — the
  `HowTo` JSON-LD in `buildPageJsonLd` reads it and follows for free, per the step-07 note.

Nothing else in `lib/seo.ts` changes. `buildBreadcrumbs`, `buildAliasSentence` and
`buildRelatedLinks` are the template's contract and are consumed as-is.

### 3. Three new section components

One component per file, default export, server components — matching `Breadcrumb.tsx` /
`RelatedCalculators.tsx`:

- `components/FormulaSection.tsx` — intro, the expression in a `<code>` block, a `<dl>` of terms,
  optional note.
- `components/WorkedExampleSection.tsx` — intro, an input `<dl>`, the result called out, explanation.
- `components/WatchOutSection.tsx` — a list of `title` / `body` pairs.

Each renders the same card shell the page already uses. No maths renderer, no new dependency — the
expression is plain text in a `<code>` block.

### 4. Page rebuild — `app/[locale]/calculators/[slug]/page.tsx`

Order becomes exactly §4.2's:

```
Breadcrumb
H1
"Also called …"  (aliases)
one-line description
[ WIDGET ]
example line (small, under the widget)
H2 How to use this calculator
H2 The formula                  — only when `content` exists
H2 Worked example               — only when `content` exists
H2 Things to watch out for      — only when `content` exists
H2 <Title> FAQ
H2 Related calculators
```

**§4.3 — compress the hero.** Today the hero is a `rounded-3xl border … p-8 shadow-panel` card
holding breadcrumb + H1 + aliases + description + example, which pushes the widget below the fold on
mobile. The card wrapper goes; the hero becomes a plain block of breadcrumb + H1 + alias line +
description, and the `example` line moves under the widget where it reads as a caption rather than
competing with the description for vertical space.

**How to use** renders `content.howTo.intro` / `.outro` when present and falls back to the shared
`t('howToUseDesc1')` / `t('howToUseDesc2')` strings otherwise. The `<ol>` renders
`buildHowToSteps(slug)`, unchanged — it just gets better steps on the pilot. `id="how-to-use"` stays
(the `HowTo` JSON-LD `url` points at it).

Three heading strings go into `messages/en.json` under `calculator`: `formulaTitle`,
`workedExampleTitle`, `watchOutTitle`.

### 5. Pilot content — `date-difference-calculator` only

- Populate `content` with the four blocks.
- Expand `seo.faq` from **2 → 8** entries (§4.2 asks for 6-8). They feed the existing `FAQPage`
  JSON-LD with no code change.
- **Bump `updatedAt`** — this is a real content change, exactly the case the step-04 note reserves it
  for. (Today is also `2026-09-10`, so the string does not move; record that in `STATUS.md` so nobody
  reads it as a missed bump.)
- No region-specific numbers in the worked example. Dates dodge §3 entirely — no currency, no units —
  which is a further reason this page is the right pilot to run before the region layer exists.

---

## Acceptance checks

1. `npm run build` passes and still emits **78 static pages**.
2. `npm run lint` passes.
3. On the prerendered `date-difference-calculator.html`: the H2s appear in the order *How to use this
   calculator · The formula · Worked example · Things to watch out for · … FAQ · Related calculators*.
4. **Widget above the fold:** the calculator's first `<input>` appears **before** the
   `id="how-to-use"` section in the HTML, and the hero no longer wraps in a `shadow-panel` card.
5. The pilot page carries **≥ 800 words** of body text (it is ~150 today).
6. The `HowTo` JSON-LD steps on the pilot equal the hand-written `content.howTo.steps`, and every
   step name is present in the rendered `<ol>` — the step-07 cross-check must survive.
7. `FAQPage` on the pilot has **8** `mainEntity` entries; every other page's count is unchanged.
8. All 53 calculator pages render, each still has 4 JSON-LD nodes, and the other 52 have **no**
   Formula / Worked example / Watch out sections.
9. 0 `/en/` hrefs on the pilot; canonical still `https://www.dailycalculations.com/calculators/date-difference-calculator`.
10. `updatedAt` changed on the pilot only — no other calculator's data touched.
