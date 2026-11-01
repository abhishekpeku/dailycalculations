# UX-05 — Pages restyle: /calculators, /categories/<id>, About/Contact/Privacy/Terms/Suggestions

Off the numbered sequence, like UX-01..04. Branch `ux/pages-restyle`, draft PR opened early.
Continues the Apple/iOS visual language from UX-01..04: page ground `#F5F5F7`, white
`rounded-[22px]`/`rounded-3xl` cards, text scale `#1D1D1F`/`#515154`/`#6E6E73`, accent `#0066CC`,
navy footer `#0B2545`. `IconTile` = category icon tile, `GlyphBadge` = per-calculator symbol badge
(`lib/categoryTheme.ts` ties a `TileColor`/icon to each category).

## Part A — calculator-identity consistency (IconTile -> GlyphBadge for single-calculator listings)

A calculator's own glyph (added in UX-04) is only used in the categories dropdown/phone sheet
(`CalculatorMenuItem.tsx`). Every other place a *single calculator* is listed still shows
`IconTile` (the category's shared icon) — indistinguishable between siblings. Fix exactly two
files, nowhere else:

- `app/[locale]/page.tsx` — "Popular calculators" cards. Feature card (index 0) keeps no tile
  (it has none today). The 4 small cards use `IconTile size="lg"` (56px box) today ->
  `GlyphBadge glyph={calculator.glyph} color={theme.color} size={56}`.
- `components/RelatedCalculators.tsx` — uses default-size `IconTile` (`md` = 36px box) today ->
  `GlyphBadge glyph={...} color={theme.color} size={36}`. `glyph` comes from
  `findCalculator(item.id)` (already called there for `.category`).

Do not touch: `CalculatorWidget.tsx`, `CategoriesMenu.tsx`, `CategoryMenuRow.tsx`, `Footer.tsx`,
`HowItWorksCard.tsx`, `MobileMenu.tsx`, `SectionHeading.tsx`, `TableOfContents.tsx`,
`visuals/Donut.tsx`, the calculator page header icon — all correctly represent a category or a
generic section, not one calculator.

## Part B — `/calculators` becomes the single browse page; `/categories` index redirects to it

- Current `/calculators` (`app/[locale]/calculators/page.tsx`): hero card + category cards grid
  (`CategoryCard`) + `CalculatorBrowser` (search + category chips + flat card grid). Current
  `/categories` (`app/[locale]/categories/page.tsx`): hero card + `CategoryCard` grid only, no
  search. `/categories/[category]` (the 15 pages) are untouched here — Part C.
- Rebuild `/calculators`: Apple hero (title + one-line description + calculator count from
  `calculators.length`, not hardcoded) + a filter/search input (same `matchesQuery` pattern as
  `CategoriesMenu.tsx` — empty query shows nothing extra beyond the grouped list below; typing
  shows matching results across all categories) + every category as its own section (IconTile
  lg + title + description + "N calculators" via `common.calculators`) containing that category's
  calculators as `GlyphBadge` cards (same shape as `RelatedCalculators`'s cards post-Part-A).
  Client-side filter component takes over `CalculatorBrowser`'s job but in the new layout;
  `force-static` still means the unfiltered, fully-grouped markup is what's in the prerendered
  HTML (same principle `CalculatorBrowser` already followed).
- Keep `/calculators`' existing SEO metadata (`generateMetadata` via `messages/en.json`
  `calculators.headline`/`description` + `buildCanonical('/calculators')`) — adjust visible copy
  only if needed to match the new layout, don't lose SEO value.
- `/categories` (index only) -> permanent redirect to `/calculators`. Add a direct entry
  `'/categories': '/calculators'` to `middleware.ts`'s hand-listed `RENAMED_PATHS` map (same place
  `/about-us`, `/contact-us` etc. live) — simplest fit since this is one static page, not data-
  derived like `CATEGORY_REDIRECTS`. Remove `/categories` from `app/sitemap.ts`'s `STATIC_PATHS`.
  Delete `app/[locale]/categories/page.tsx` (fold its SEO intent into `/calculators`'s metadata
  first, confirm coverage, then delete) and its `categories` messages namespace entries if
  unused elsewhere. Update `components/CategoriesMenu.tsx`'s `"Browse all categories ›"` link
  (`href="/categories"` -> `/calculators`). Grep for any other `/categories` (index) reference
  (Footer links to `/categories/${category.id}` per-category, which stays).
- Do NOT touch `/categories/[category]` (Part C).

## Part C — restyle the 15 `/categories/<id>` pages

`app/[locale]/categories/[category]/page.tsx`. Keep `buildCategoryMetadata` (title/description/
canonical) exactly. Restyle layout only:

- `Breadcrumb` (Home / Calculators / {category}) using `buildBreadcrumbs`-style data — there's no
  existing breadcrumb builder for category pages (only the calculator page has one via
  `buildBreadcrumbs(slug)`); build the 3-item trail inline (`Home`, `Calculators` ->
  `/calculators`, `{category.title}` current) rather than inventing a new `lib/seo.ts` export for
  a single caller.
- Header: category `IconTile` (lg) + title + description + "{count} calculators"
  (`common.calculators`).
- Grid of `GlyphBadge` + name + one-line description cards (same shape as Part A/B).
- Search input **only** on categories with more than 15 calculators — threshold `count > 15`
  (today: measurements 40, math 29, statistics 25; everything else is 1-8). Reuses `matchesQuery`
  the same way as Part B's page-level filter.
- "Other categories" row at the bottom — every other category as a small `IconTile` (sm/md) +
  title link, so a visitor can jump sideways without the header dropdown.
- Footer unchanged (already navy site-wide).

## Part D — restyle About, Contact, Privacy, Terms, Suggestions

Layout-only — every word of copy and all metadata/JSON-LD stay exactly as-is.
`app/[locale]/about/page.tsx`, `contact`, `privacy-policy`, `terms`, `suggestions`: swap the
existing `rounded-3xl border border-slate-200 bg-white/95 ... shadow-panel` card treatment for the
site's current look (white `rounded-[22px]`/`rounded-3xl` card on `#F5F5F7` ground, established
heading/eyebrow/body color scale, spacing consistent with calculator pages/homepage). `contact`'s
GitHub-issue button/suggestion-form link become cards/buttons in the same visual language, hrefs
and copy unchanged. `suggestions`: restyle `SuggestionForm.tsx`'s container/labels/inputs
(rounded, `#F5F5F7` fields, `#0066CC` focus ring — matching `CalculatorSearch.tsx`'s input) without
touching its submit/validation logic.

## Acceptance checks

- `npm run build` passes, `npm test` green, lint clean on changed files (ignore pre-existing
  `.open-next/` noise already in STATUS.md's Parked list).
- Route listing still shows `/calculators`, all 15 `/categories/<id>`, `/about`, `/contact`,
  `/privacy-policy`, `/terms`, `/suggestions`; `/categories` (index) is gone from the static
  output and instead 301/308s to `/calculators` (verify with `curl -sI`).
- Visual check (headless Chrome, desktop 1280px + phone 390px via iframe HTML + dark mode) of:
  homepage Popular section, a calculator page's Related section, `/calculators`, one small
  category page, one of the 3 filterable (big) category pages, `/about`, `/suggestions`.
- Grep the rendered HTML for `/categories` (should only ever point at `/categories/<id>`, never
  the bare index) and spot-check a couple of changed links by curling them.

## Progress

- [x] Part A: homepage Popular cards -> GlyphBadge
- [x] Part A: RelatedCalculators -> GlyphBadge
- [x] Part A: visual check (desktop/phone/dark) of homepage + a calculator page — all legible, no fixes needed
- [x] Part B: `/calculators` rebuilt as the Apple-style browse page
- [x] Part B: `/categories` index redirect added (middleware) + removed from sitemap + page deleted
- [x] Part B: internal links to `/categories` index updated (CategoriesMenu "Browse all")
- [x] Part B: visual + redirect check — desktop/phone/dark all good, `?q=emi` swaps grouped listing for flat results, `/categories` 301s to `/calculators`
- [x] Part C: category page restyle (breadcrumb, header, grid, other-categories row)
- [x] Part C: filter input on the 3 big categories (measurements/math/statistics) — threshold `count > 15`
- [x] Part C: visual check (one small + one big category page) — desktop/phone/dark all good
- [x] Part D: About / Contact restyle
- [x] Part D: Privacy / Terms restyle
- [x] Part D: Suggestions + SuggestionForm restyle, visual check
- [x] Final: `npm run build` + `npm test` + lint, STATUS.md updated, PR marked ready
