# Step 07 — Structured data + visible breadcrumb

**Spec:** `mdFiles/instructions.md` §2.3
**Depends on:** 05 (`aliases` populated on all 53), 03 (`buildCanonical` / `SITE_URL` discipline).
**Blocks:** nothing hard. Step 08 surfaces the same `aliases` in visible copy and step 10 rewrites
the page template around this breadcrumb.

## Why

`buildPageJsonLd` emits a lone `FAQPage`. Nothing on a calculator page tells Google the URL **is a
tool** rather than an article about one, and nothing tells it where the page sits in the site.
`BreadcrumbList` is what makes the SERP render the tool path (`dailycalculations.com › Calculators ›
Finance`) instead of collapsing to the bare site name — which is the "Google shows my homepage"
symptom from a different angle.

`WebApplication.alternateName` is also the first place step 05's alias data does any work: it tells
Google that "home loan calculator" and "house payment calculator" name *this* page.

## Do

1. **`lib/seo.ts` — one source for the trail.** Export `buildBreadcrumbs(slug)` returning
   `{ name: string; href?: string }[]`: Home → Calculators → *Category* → *Calculator title*, the
   last entry with **no `href`**. Both the JSON-LD node and the visible component must map over this
   same array. Two hand-written trails will drift and Google cross-checks them.

2. **`lib/seo.ts` — one source for the steps.** Export `buildHowToSteps(slug)` returning
   `{ name: string; text: string }[]`, derived from `calculator.inputs`: one step per input plus a
   closing "Read the result" step. **Five calculators have zero `inputs`** (`currency-converter`,
   `character-counter`, `hashtag-counter`, `pomodoro-timer`, `timezone-meeting-planner` — they ship
   custom components) — they need a generic two-step fallback, not an empty `step` array.

3. **`buildPageJsonLd` returns an array of four nodes**, matching `buildHomeJsonLd`'s shape (each
   node carries its own `@context`; the page already `JSON.stringify`s whatever it gets):

   - `WebApplication` — `name`, `alternateName: calculator.aliases`, `url`, `description`,
     `applicationCategory: 'UtilitiesApplication'`, `operatingSystem: 'Any'`,
     `browserRequirements: 'Requires JavaScript'`, free `offers`, `isAccessibleForFree: true`.
   - `BreadcrumbList` — from `buildBreadcrumbs`, `item` absolute, omitted on the last element.
   - `HowTo` — `name: 'How to use the <title>'`, `step` from `buildHowToSteps`, `url` pointing at the
     `#how-to-use` anchor.
   - `FAQPage` — unchanged.

   ⚠ **The §2.3 code block is stale on one point:** it writes `${SITE_URL}/${locale}/calculators/…`.
   That predates D2/D3 — English lives at the root now. Every URL in these nodes is
   `${SITE_URL}/calculators/<id>` with **no locale segment**, and Home is `${SITE_URL}` with **no
   trailing slash**, matching `buildCanonical('')`.

4. **New `components/Breadcrumb.tsx`** — visible, server-safe, `nav[aria-label="Breadcrumb"] > ol`,
   last crumb `aria-current="page"` and not a link. Use the `Link` from `@/i18n/navigation` and
   **never pass a `locale` prop** (step-02 note in `STATUS.md`: it force-prefixes `/en/`).

5. **Wire it into `app/[locale]/calculators/[slug]/page.tsx`**, replacing the bare category link
   above the H1 (§2.3 calls that link out by name). Give the "How to use" section `id="how-to-use"`
   and render `buildHowToSteps` as a visible `<ol>` under the existing intro paragraph — the HowTo
   node must not describe steps the page does not show.

## Acceptance

- [x] `npm run build` and `npm run lint` pass; still 78 static pages.
- [x] Every one of the 53 calculator pages emits exactly one `<script type="application/ld+json">`
      containing 4 nodes: `WebApplication`, `BreadcrumbList`, `HowTo`, `FAQPage`.
- [x] `WebApplication.alternateName` equals that calculator's `aliases` array, on all 53.
- [x] No JSON-LD `url` / `item` value contains `/en/`, and every one starts with
      `https://www.dailycalculations.com`.
- [x] `BreadcrumbList` has 4 items with `position` 1-4; item 4 has no `item` key.
- [x] Every `HowTo` has ≥2 steps — including the five input-less calculators.
- [x] The rendered HTML shows the breadcrumb trail as text, and every visible crumb name matches its
      JSON-LD counterpart in order.
- [x] Every `HowToStep.name` appears in the rendered `<ol>`.
- [x] The JSON in each script tag parses.

## Do NOT

- Do not add breadcrumbs or JSON-LD to category pages — separate concern, park it.
- Do not touch the `SearchAction` in `buildHomeJsonLd`; that is step 09's call.
- Do not bump `updatedAt`. Adding markup is not a content change (step-04 note).
- Do not add hreflang or `inLanguage` alternates (D5).

## Finish

Update `mdFiles/STATUS.md`: mark 07 `DONE`, record the node shape so step 10 does not re-invent it,
and note that `buildBreadcrumbs` / `buildHowToSteps` are the shared source the page template renders
from.

---

## Outcome — 2026-09-10

All acceptance checks pass, verified by parsing the 53 prerendered
`.next/server/app/en/calculators/*.html` files rather than reading the source.

| Check | Result |
|---|---|
| ld+json script tags per page | exactly 1, JSON parses on all 53 |
| Nodes per page | exactly 4, always `WebApplication` → `BreadcrumbList` → `HowTo` → `FAQPage` |
| `alternateName` | matches `data/calculators.ts` `aliases` byte-for-byte on all 53 |
| Absolute URLs | 100% on `https://www.dailycalculations.com`; zero `/en/` in JSON-LD **or** in the rendered body |
| Breadcrumb | 4 items, positions 1-4, item 4 has no `item`; Home is `${SITE_URL}` with no trailing slash |
| HowTo steps | min 2, max 9; every `HowToStep.name` present in the visible `<ol>` |
| Visible trail | every crumb name appears in the rendered text **in JSON-LD order** |
| Pages | 78 static, unchanged |

### Decisions taken while doing this

- **Both trails come from `buildBreadcrumbs` / `buildHowToSteps`.** The page renders the same arrays
  the JSON-LD serialises, so drift between markup and structured data is structurally impossible.
  Step 10 should render from these, not re-derive.
- **`Breadcrumb.href` is `''` for Home, not `'/'`.** JSON-LD needs `${SITE_URL}` with no trailing
  slash (agreeing with `buildCanonical('')`); the component maps `''` → `/` for the `<Link>`.
- **Do not lowercase input labels.** The first cut wrote `Enter annual interest rate (apr)` and
  `Enter fahrenheit` — lowercasing destroys acronyms (APR, GPA, MPG, EMI) and proper nouns. Labels
  are now used verbatim: `Enter Annual interest rate (APR)`.
- **The five input-less calculators** (`currency-converter`, `character-counter`, `hashtag-counter`,
  `pomodoro-timer`, `timezone-meeting-planner`) get a generic 2-step fallback. The first draft used
  `calculator.description` as the step text, which duplicated the paragraph already under the H1 —
  it now reads "Fill in the fields in the *&lt;title&gt;* above."

### Trap hit

The `STATUS.md` heredoc warning applies to **python heredocs too**, not just `middleware.ts`:
`python - <<'PY'` collapsed `[^'\]` in a regex to `[^'\]`, which crashed the validator with
`unterminated character set`. Write the script to the scratchpad and run it by path.
