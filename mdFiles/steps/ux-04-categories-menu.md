# UX-04 — Categories dropdown + calculator glyphs

Off the numbered sequence, like UX-01/02/03. Branch `ux/categories-menu`, draft PR opened early.

## Scope

Three parts, approved mockup:

1. **Glyph for every calculator.** `glyph: string` (required) on `CalculatorConfig`
   (`data/calculators/types.ts`): a 1–4 user-perceived-character math/unit symbol shown on a tinted
   badge. All 144 calculators get one — solver output symbol where sensible (mortgage `M`, compound
   interest `FV`, BMI `BMI`, EMI `EMI`, force `F`, z-score `z`), converters use the target unit (`km`,
   `°C`, `kg`...), otherwise a short recognizable mark. No emoji. New `GlyphBadge` component
   (`components/GlyphBadge.tsx`) renders it on a tinted square derived from the category's `TileColor`.
2. **Header "Categories" dropdown (desktop).** `Header.tsx` becomes a client component fed a slim
   `nav` prop built server-side by `lib/navData.ts` (`buildNavData()`), so `data/calculators` (full
   compute functions, content) never reaches the client bundle. Clicking/hovering "Categories" opens
   a two-pane panel: left = filterable category list, right = selected category's calculators grid
   (or cross-category search results when filtering). Contact/Privacy/Terms removed from the header
   nav (footer already has them).
3. **Phone menu drill-down.** The hamburger sheet gets a search field, a categories list, and a
   per-category "screen" (back button, calculators grid), sharing the same `nav` data and filter logic
   as the desktop panel.

## Data: `lib/navData.ts`

```ts
export type NavCalculator = { id: string; title: string; description: string; category: string; glyph: string; aliases: string[] };
export type NavCategory = { id: string; title: string; description: string; count: number };
export type NavData = { categories: NavCategory[]; calculators: NavCalculator[] };
export function buildNavData(): NavData;
```

Built once in the (server) `app/[locale]/layout.tsx` from `data/calculators`, passed as
`<Header nav={buildNavData()} />`. `Header.tsx` and everything it renders only ever sees this slim
shape — never `CalculatorConfig` itself (which carries every `compute`/`content`/`solver` function
and would balloon the client bundle).

## Glyph assignment

Full id -> glyph mapping is hand-curated per the rules in the work order (solver symbol first,
target unit for converters, short mark otherwise), applied directly to each
`data/calculators/<category>.ts` file right after each calculator's `category:` line. See the PR
diff for the final table. New test in `data/calculators/index.spec.ts` style:
`data/calculators/glyph.spec.ts` asserts every calculator has a non-empty glyph of <= 4
grapheme clusters (`Intl.Segmenter`).

## `GlyphBadge`

`components/GlyphBadge.tsx`: `rounded-[11px]` square (default 40px, `size` prop for the 30px
category rows / 24px grid badges), background = category tint, text = a >=4.5:1 dark ink,
`ui-serif, Georgia, serif` italic bold, smaller font-size for 3-4 char glyphs. `aria-hidden`.
Tint/ink pairs keyed by `TileColor` (`lib/categoryTheme.ts`), light + dark variants, e.g.
green `#E8F7EC`/`#1E7A34`, pink `#FDECEF`/`#B0204A`, orange `#FFF3E0`/`#A65A00`, blue
`#E8F1FF`/`#0A57CC`, red `#FDEDEB`/`#B5241C`, indigo `#EEEDFF`/`#3B38B8`, teal `#E6F6FA`/`#14718A`,
gray `#F2F2F7`/`#48484A`, purple `#F4EAFB`/`#7A2BAE`.

## Header dropdown

- Desktop nav: Home · Categories (button, `aria-expanded`/`aria-controls`) · All calculators ·
  About · Suggest · theme toggle.
- Panel: `max-w-6xl`, white, `rounded-[22px]`, big soft shadow, scrim behind it. Left pane ~300px
  border-right, filter input + category rows (IconTile 30px + title + count; active row
  `bg-[#F2F2F7]` + chevron, arrow-key navigable). Right pane: category header (IconTile 44px, title,
  description, "Open {category} page ->" link), `grid-cols-[repeat(auto-fill,minmax(240px,1fr))]`
  of `GlyphBadge` + title + one-line description, "Popular: ..." row, "Browse all categories ->".
  Typing in the filter swaps the right pane to cross-category matches via `matchesQuery`
  (`lib/search.ts`).
- A11y: Escape closes + refocuses the button, outside click closes, route change closes, real
  `Link`s throughout. Default category: finance.

## Phone sheet

Hamburger opens a full-height sheet: "Menu" bar + 44px close button, search field, categories list
(same rows), then Home/All calculators/About/Suggest + theme toggle. Tapping a category swaps to its
screen (back button, 44px IconTile + title + count, calculators list, "Open the {category} page ->").
Body scroll locked while open; Escape/close returns focus to the hamburger.

## Acceptance checks

- `npm run build` passes, `npm test` green (incl. the new glyph test), lint no worse than master.
- `Header` (client component) does not import `data/calculators`; `lib/navData.ts` is the only
  bridge, called from the server layout. Compare largest `.next/static/chunks` sizes before/after
  in the PR description.
- Headless-Chrome visual check (scratch dir outside the repo): desktop menu open on Finance and on
  Measurements (40 items), filter typed, phone menu, phone category screen, dark mode. Fix anything
  off before the final commit.

## Progress

- [ ] Step file written, committed, pushed; draft PR open
- [ ] Part 1: `glyph` field + type doc comment + 144 glyphs assigned + `data/calculators/glyph.spec.ts`, `npm test` green
- [ ] `components/GlyphBadge.tsx` + tint/ink table in `lib/categoryTheme.ts`
- [ ] `lib/navData.ts` (`buildNavData`)
- [ ] Desktop `Header.tsx` Categories dropdown wired to `app/[locale]/layout.tsx`
- [ ] Phone sheet drill-down
- [ ] `npm run build` passes; chunk sizes compared
- [ ] Visual check (desktop open/Finance, Measurements, filter, phone menu, phone category, dark mode) + fixes
- [ ] `mdFiles/STATUS.md` updated; dev server killed; `gh pr ready`
