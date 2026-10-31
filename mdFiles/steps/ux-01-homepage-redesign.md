# UX-01 — Homepage + footer redesign

Off the numbered step sequence (a UX/visual pass, not part of the SEO/region rollout). Does not
block or reorder steps 43-45. Approved design: "Option A" hero + category/popular split, "Navy
footer". Branch `ux/homepage-redesign`.

Visual language: the site's existing Apple/iOS look (`components/IconTile.tsx`,
`lib/categoryTheme.ts`, the `CARD` constant) extended to the homepage and footer. Ground
`#F5F5F7` (light) / keep the existing `dark:bg-slate-950` (no new dark token — the site's dark
mode is slate, not pure black; don't introduce a second dark convention). White cards
`rounded-2xl`/`rounded-3xl`. Text `#1D1D1F` / secondary `#515154` / tertiary `#6E6E73`. Accent
blue `#0066CC`. 390px phone width, no horizontal scroll. No new dependencies.

## Scope

1. **Hero** (`app/[locale]/page.tsx`) — centered eyebrow/H1/subtitle, pill search, "Try:" row of
   4 calculator links (mortgage, BMI, sales tax, percentage). H1 -> "What do you want to
   calculate?" (`home.headline`). Subtitle derives its number from `calculators.length`, never a
   literal. `generateMetadata`/JSON-LD untouched.
2. **Search** (`components/CalculatorSearch.tsx`, homepage-only — confirmed not imported
   anywhere else) — empty query shows nothing; typing shows an absolutely-positioned dropdown
   (max 8 results) over the page, or a "No calculators match" message; Escape clears/closes.
3. **Browse by category** section, directly after hero, before Popular — grid of all 15
   categories, each a compact card (IconTile md + title + count, `common.calculators` new ICU
   plural key), "All calculators ›" link to `/calculators`. Replaces `CategoryGrid` usage;
   delete `components/CategoryGrid.tsx` once confirmed unused.
4. **Popular calculators** (bento, visually distinct from category cards) — 1 large mortgage
   card (green gradient, white text, 3 feature chips + CTA) + 4 smaller tinted cards (bmi,
   sales-tax, miles-to-km, percentage). Region rule: only unit/currency-neutral worked examples
   (miles->km, percentage); BMI/sales-tax show their description instead. Featured data (ids,
   tint, example/description, chips) lives in a small array in `page.tsx`; titles/descriptions
   still come from `data/calculators`.
5. Delete the "Helpful pages" section from the homepage. FAQ + collapsible SEO section stay
   unchanged (content and position, below Popular).
6. **Footer** (`components/Footer.tsx`, site-wide via `app/[locale]/layout.tsx`) — navy
   `#0B2545` background, suggestion banner (`#0066CC`, white pill CTA -> `/suggestions`), 3
   columns (brand+blurb / all categories with small IconTiles / company links), bottom bar with
   a computed `{year}` copyright line. `messages/en.json` `footer` namespace rewritten; old keys
   removed since nothing else imports them (confirmed by grep).

## Decisions

- D-UX1-1: Dark mode ground stays `dark:bg-slate-950` (the site's existing dark convention), not
  a new pure-black Apple-style token — avoids a second, inconsistent dark system.
- D-UX1-2: Per-card Popular extras (chip labels, CTA text, worked-example strings) are hardcoded
  English directly in `page.tsx`'s featured array, not new `messages/en.json` keys — matches the
  existing precedent of the (now-deleted) "Helpful pages" block, which was also literal JSX
  strings. Section-level headings (hero, "Browse by category", "Popular calculators") go through
  `messages/en.json` as before.
- D-UX1-3: The "Try:" row's 4 link labels are short literal strings ("Mortgage", "BMI", "Sales
  tax", "Percentage") hardcoded in `page.tsx`, not the real calculator titles ("Mortgage
  Calculator" etc. — too long for this compact row and the approved copy spells out the short
  form exactly). Each still links to the real calculator id, so a 404 can't happen even if a
  title changes later.
- D-UX1-4: Subtitle "more" count = `calculators.length - 4` (the 4 named calculators), computed
  in `page.tsx`, never a literal in `messages/en.json` (the ICU string takes `{count}`).
- D-UX1-5: `footer` namespace keys fully renamed/replaced (`bannerTitle`, `bannerBody`,
  `bannerCta`, `brand`, `blurb`, `categoriesHeading`, `companyHeading`, `companyAbout`,
  `companyContact`, `companySuggest`, `companyPrivacy`, `companyTerms`, `copyright`) — old keys
  (`tagline`, `suggestLink`, `about`, `contact`, `privacy`, `terms`) deleted, confirmed unused
  outside `Footer.tsx` by grep before removal.

## Acceptance checks

- `npm run build` passes; `npm run lint` passes, no new warnings.
- `npm test` stays green (no calculator data touched).
- Homepage at desktop and 390px width: no horizontal scroll, search shows nothing until typing
  then a dropdown that overlays (doesn't push layout), footer renders correctly on a calculator
  page too.
- Metadata/canonical/JSON-LD on the homepage unchanged; page still `export const dynamic =
  'force-static'`.
- No hardcoded currency symbol or imperial-only unit in the Popular section's worked examples.

## Progress

- [x] Research: read CLAUDE.md, STATUS.md, all touched components/data/messages files
- [x] Write this step file, commit, push, open draft PR
- [x] `messages/en.json`: home/search/common/footer key updates
- [x] Hero rebuild in `page.tsx`
- [x] `components/CalculatorSearch.tsx` rebuild (dropdown behavior)
- [x] "Browse by category" section + delete `CategoryGrid.tsx` (confirmed unused, deleted)
- [x] "Popular calculators" bento section
- [x] Remove "Helpful pages" section
- [x] `components/Footer.tsx` rebuild (navy, banner, 3 columns, bottom bar)
- [x] Verify via rendered HTML + compiled CSS (desktop markup, grid auto-fill/auto-fit classes
      compiled, category/popular counts and examples derived correctly, metadata/canonical/
      JSON-LD unchanged, footer renders on a calculator page). Chrome browser tool was not
      connected in this environment, so no live screenshot at 390px — verified no-overflow by
      construction instead (see "Unsure / parked" below).
- [x] `npm run build` / `npm run lint` / `npm test` all green (742/742 tests; lint clean once the
      two pre-existing, out-of-scope artifact dirs — `.open-next/`, the old `.claude/worktrees/`
      — are excluded, same exclusion `STATUS.md`'s Parked list already documents)
- [x] Update `mdFiles/STATUS.md` (UX-01 row, session log, Parked note added)
- [ ] `gh pr ready`

### Unsure / parked
- Claude in Chrome was not connected in this sandbox, so the 390px-width and dark-mode checks
  are a code-level review (every new grid uses `auto-fill`/`auto-fit` + `minmax`, which cannot
  overflow its container; every new color has a `dark:` pair except the footer and the mortgage
  feature card, which are deliberately fixed-color by the brief) rather than an actual screenshot.
  Worth a quick visual pass before merge if a browser is available.
- Popular-card `IconTile` size: the brief asks for "~40px" on category cards and "44px" on
  Popular cards, but `IconTile` only offers `sm`(28)/`md`(36)/`lg`(56). Used `md` for category
  (closest to 40) and `lg` for Popular (56, not 44, but visibly bigger than category's `md` —
  preserves the intended size hierarchy). Not a new size variant, since one isn't otherwise
  needed yet.
