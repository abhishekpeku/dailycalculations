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

- [x] Step file written, committed, pushed; draft PR open
- [x] Part 1: `glyph` field + type doc comment + 144 glyphs assigned + `data/calculators/glyph.spec.ts`, `npm test` green
- [x] `components/GlyphBadge.tsx` + tint/ink table in `lib/categoryTheme.ts`
- [x] `lib/navData.ts` (`buildNavData`)
- [x] Desktop `Header.tsx` Categories dropdown wired to `app/[locale]/layout.tsx`
- [x] Phone sheet drill-down
- [x] `npm run build` passes; chunk sizes compared (total `.next/static/chunks` grew ~17KB for the whole feature; no calculator content in any client chunk)
- [x] Visual check (desktop open/Finance, Measurements, filter, phone menu, phone category, dark mode) + fixes
- [x] `mdFiles/STATUS.md` updated; dev server killed; `gh pr ready`

## Interrupted and resumed (2026-11-01)

The original build agent hit its weekly usage limit mid-task. Part 1 (glyphs + GlyphBadge, commits
`1fb56ce`/`49aae69`) was already committed and survived intact. Part 2/3 (the dropdown, phone sheet,
nav data model, Header wiring) existed only as uncommitted working-tree changes — not lost, but not
yet verified. The main session (now Sonnet 5, after an account change mid-conversation) reviewed that
code, found it complete and well-built, and took over finishing it directly rather than re-spawning a
background agent (which would hit the same weekly limit).

### Two real bugs found and fixed during the visual check

1. **GlyphBadge colors didn't switch in dark mode.** The component set `backgroundColor`/`color` via
   inline `style` while relying on a `dark:` Tailwind class to override them — inline style always
   wins over a stylesheet rule for the same property, so the override never applied. Confirmed by a
   forced-dark-mode screenshot (badge stayed light-pink on a dark background). Fixed by moving both
   light and dark values entirely into CSS custom properties, read by two separate classes (plain +
   `dark:`) instead of fighting over `backgroundColor`/`color` directly. Confirmed in the compiled CSS
   that the `dark:` rule's selector (`.foo:is(.dark *)`) has strictly higher specificity than the
   light rule, and re-confirmed visually.

2. **The phone sheet (and the desktop scrim) never covered the full screen.** Both used
   `className="fixed inset-0 ..."` as a plain child of `<header>`. The header has `backdrop-blur`,
   and `backdrop-filter` (like `transform`/`filter`/`perspective`) makes an element a CSS containing
   block for `fixed`-position descendants — so both `fixed inset-0` children were pinned to the
   header's own ~70px box instead of the viewport, never actually covering the page. A screenshot of
   the "open" phone sheet showed only the header bar with ordinary homepage content underneath.
   Fixed by portaling both to `document.body` via `createPortal` (guarded for
   `typeof document === 'undefined'`, so SSR still renders nothing for them, matching their real
   default-closed state). Verified two ways: a `--dump-dom` capture showing the sheet's markup now a
   direct child of `<body>` with `overflow: hidden` correctly applied, and a direct (non-iframe)
   screenshot showing it full-screen.

   A side note for whoever tests this kind of forced-open UI next: screenshotting by forcing
   `useState(true)` at mount is not equivalent to a real click. It also surfaced a hydration error
   ("Hydration failed ... RedirectErrorBoundary") that turned out to be specific to forcing non-default
   initial state at the SSR/first-client-render boundary — confirmed by reverting to real defaults and
   seeing a completely clean hydration log, and by reasoning that any state change from a real
   post-mount click happens after hydration already succeeded, which carries no mismatch risk at all.
   This was a testing-methodology artifact, not a shipped bug; it's recorded here only so it isn't
   mistaken for one in a future session.
