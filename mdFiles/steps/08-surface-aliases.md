# Step 08 — Surface the aliases

**Scope (STATUS.md):** "Also known as …" sentence under the H1. "Related calculators" block using
`related`, with **alias anchor text**, not repeated titles. Extend `fuzzyFilter` in
`CalculatorSearch.tsx:19` to match `aliases`.

**Spec:** `mdFiles/instructions.md` §1.4 — aliases must surface in four places. Step 07 already did
#3 (JSON-LD `alternateName`). This step does the other three: visible copy, search index, and
internal anchor text.

---

## Why

`keywords` meta is ignored. The 53 `aliases` arrays added in step 05 are currently only visible to
a JSON-LD parser. Until they appear in rendered text, in anchor text, and in the on-site search,
they do nothing for the queries they were written for ("home loan calculator", "emi", "auto loan").

Anchor text matters most: 53 pages currently link to each other with **zero** internal links
between calculators. Adding a related block with *alias* anchor text gives varied, keyword-bearing
internal anchors instead of 53 copies of the same title.

---

## Work

### 1. `lib/seo.ts` — two new shared builders

Follow the step-07 contract: the builder is the single source, the component just renders it.

- **`buildAliasSentence(slug): string | null`**
  Returns `Also called a home loan calculator, house payment calculator, or mortgage payment
  estimator.` — a sentence, not a keyword list. Uses at most the first 4 aliases. `a`/`an` chosen
  from the first alias's initial letter. Returns `null` when the calculator has no aliases.

- **`buildRelatedLinks(slug): RelatedLink[]`** where
  `RelatedLink = { id: string; href: string; anchor: string; description: string }`.
  One entry per id in `related`, in data order. `anchor` is an **alias of the target**, not its
  title — chosen deterministically from a hash of the *source* slug so the same target gets
  different anchor text on different pages. Rules:
  - skip ids that do not resolve (step 05 validated there are none; do not crash if one appears);
  - never repeat an anchor within one page — advance to the target's next alias;
  - fall back to the target's `title` if it has no aliases.

  Determinism is required: the pages are `force-static`, so the anchor must be a pure function of
  the two ids.

### 2. `components/RelatedCalculators.tsx` (new, server component)

Renders `RelatedLink[]` as a card grid matching the existing `rounded-3xl … shadow-panel` section
style. The link text is the `anchor`; the description sits under it. Returns `null` on an empty list.

### 3. `app/[locale]/calculators/[slug]/page.tsx`

- "Also called …" line directly under the `<h1>`, above the description paragraph.
- `<RelatedCalculators>` section after `<FaqSection>`.

### 4. `components/CalculatorSearch.tsx`

- `SearchItem` gains `aliases: string[]`.
- The filter matches title **or** description **or** any alias.

### 5. `app/[locale]/page.tsx`

- `searchItems` carries `aliases` through.

### 6. `messages/en.json`

Add to the `calculator` namespace: `relatedTitle`, `relatedDescription`. The alias sentence itself
is built in `lib/seo.ts` (it is data, not chrome) and is not a message string.

---

## Out of scope

- The listing-page search box and `?q=` params — that is **step 09**.
- Content sections (formula, worked example) — **step 10**.
- Category/listing JSON-LD — parked.
- `updatedAt` is **not** bumped. This is a template change, same as step 07; the calculator data in
  `data/calculators.ts` is untouched.

---

## Acceptance checks

`npm run build` and `npm run lint` pass, still 78 static pages, then against the prerendered HTML in
`.next/server/app`:

1. All 53 calculator pages contain an "Also called" sentence, and every alias named in it appears in
   that calculator's `aliases` array.
2. All 53 pages render a related block with the same number of links as `related` has ids, each
   `href` pointing at `/calculators/<id>` with **no `/en/`**.
3. Anchor text is varied: the count of distinct anchors used for any single target across the site
   is > 1 for targets linked from more than one page, and no page repeats an anchor.
4. Every related `href` resolves to a real calculator id (no dead internal links).
5. Typing `emi` in the homepage search matches `mortgage-calculator` (alias
   "home loan emi calculator") — verified by unit-checking the filter predicate against the data.
