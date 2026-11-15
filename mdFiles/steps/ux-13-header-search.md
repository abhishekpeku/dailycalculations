# UX-13 — direct search from the header, on every page

Off the numbered sequence (like UX-01..12). Branch: `ux/header-search`.

User asked (2026-11-15): there's no quick way to search for a calculator from wherever you
already are — search today only exists inside the Categories dropdown (open it, then type in its
filter box) or on the `/calculators` browse page. Wants a direct search entry point in the header,
usable from any page without navigating anywhere first.

## What already exists — reuse it, don't rebuild it

- `lib/search.ts`'s `matchesQuery(item, query)` — title/description/alias matching. Already shared
  by the homepage hero search (`CalculatorSearch.tsx`), the Categories dropdown's filter
  (`CategoriesMenu.tsx`), the mobile menu's search field (`MobileMenu.tsx`), and `/calculators`'
  own search (`CalculatorBrowser.tsx`). The new header search **must** use this same function —
  a fourth independent matching implementation is exactly the kind of drift this codebase has
  deliberately avoided every other time this pattern came up.
- `lib/navData.ts`'s `NavData`/`NavCalculator` — the slim, client-safe shape already passed into
  `Header`/`CategoriesMenu`/`MobileMenu` from the server layout. The new component receives this
  same `nav` prop; it must never import `data/calculators` directly (see that file's own comment
  for why — it would balloon the client bundle).
- `CalculatorSearch.tsx` (homepage hero search) is the closest visual/interaction precedent: a
  search-icon-in-input field, live-filtered results below as you type, each result linking to
  `/calculators/<id>`, max 8 results, "no results" fallback text. Match its visual language (same
  rounded-full/rounded-2xl card styling) rather than inventing a new look, but it runs inline on
  the homepage — this needs a **modal overlay** instead, since it must work from any page without
  disrupting that page's own layout.
- **Mobile already has search** one tap into the hamburger menu (`MobileMenu.tsx`'s default screen
  has a search field right at the top) — the gap is specifically **desktop**, which has no visible
  search entry point outside the Categories dropdown. Still worth a one-tap mobile header icon too
  (see below) so mobile doesn't need the full-screen sheet just to search, but this is the smaller
  half of the job.
- Portal/overlay pattern precedent: `Header.tsx`'s own Categories panel (`createPortal` to
  `document.body`, a scrim `div` with `onClick` to close, `Escape` key handling restoring focus to
  the trigger button) and `MobileMenu.tsx` (same portal-to-body rule, with the same comment
  explaining why — the header's `backdrop-blur` makes it a CSS containing block for `fixed`
  descendants, so an un-portaled `fixed inset-0` child would pin to the header's own box instead of
  the viewport). Follow the same pattern for the new overlay.

## What's new

1. **A search icon button in the header's desktop nav** (`Header.tsx`), visible at all times —
   not nested inside Categories. Place it near `ThemeToggle`/the Categories button, matching their
   existing icon-button visual style (see `ThemeToggle`'s own button classes for the pattern).
2. **A matching icon button in the mobile header row** (`Header.tsx`'s `lg:hidden` row, next to
   `ThemeToggle` and the hamburger button) — one tap to search without opening the full mobile
   sheet.
3. **A `SearchOverlay` component** (new file, e.g. `components/SearchOverlay.tsx`): a centered
   modal (not anchored under the header like the Categories panel — this should feel like a
   dedicated "jump to anything" tool), portaled to `document.body`, with a scrim. Contains: an
   autofocused text input (reuse `matchesQuery` against `nav.calculators`), live results below as
   you type (cap at ~8, each showing the calculator's glyph/title/category — reuse
   `CalculatorMenuItem` if its shape fits, don't duplicate that rendering if it already does what's
   needed), and a "no results" fallback matching `MobileMenu`'s `noMatches` i18n string. Clicking a
   result or pressing Enter (on the top match) navigates to `/calculators/<id>` and closes the
   overlay. `Escape` or clicking the scrim closes it and returns focus to whichever button opened
   it (same discipline `Header.tsx` already follows for the Categories panel).
4. **Keyboard shortcut**: pressing `/` anywhere on the page opens the overlay — but **only when
   the user isn't already typing in an editable field** (check `document.activeElement`'s tag/
   `isContentEditable`, same guard pattern a command-palette shortcut needs everywhere — a
   calculator's own numeric inputs must never have `/` hijacked out from under them). This is the
   mechanism that makes "search from wherever I am" actually fast, not just a visible icon.
5. **i18n**: add new keys (aria-labels, placeholder, etc.) under the `nav` namespace in
   `messages/en.json`, reusing the existing `nav.searchLabel`/`navMenu.noMatches` strings where the
   wording already fits rather than inventing near-duplicates.

## Explicitly out of scope

- No new search backend, no server-side search index, no fuzzy-matching library — this is the
  exact same client-side `matchesQuery` filter every other search surface on the site already uses,
  just with a new, more accessible entry point.
- Don't touch `CalculatorSearch.tsx`, `CategoriesMenu.tsx`'s filter, `MobileMenu.tsx`'s search
  field, or `CalculatorBrowser.tsx`'s search — they stay as they are. This step adds a fourth
  *entry point* to the same underlying matching logic, it doesn't consolidate or replace the
  existing ones.

## Acceptance checks

- `npm test` / `npm run lint` / `npm run build` all pass.
- Manual verification in a dev server: the search icon is visible in the header on every page type
  (homepage, a calculator page, `/calculators`, a category page) — not just the homepage. Clicking
  it opens the overlay; typing filters results live; clicking a result navigates correctly; `Escape`
  closes it; pressing `/` while focus is on the page body (not inside an input) opens the overlay;
  pressing `/` while typing inside a calculator's own number input does **not** open the overlay
  (confirm this specifically — it's the easiest thing to get wrong and the most annoying to ship
  broken, since it would break typing fractions/dates with slashes in any input).
- Mobile: the new header search icon opens the same overlay (or confirm it's deliberately scoped
  to open the existing `MobileMenu` search screen instead, if that turns out cleaner — use
  judgment, but say which one was chosen and why).
- No regression to the existing three search surfaces (homepage hero, Categories dropdown filter,
  `/calculators` page, mobile menu's own search field) — spot-check each still works exactly as
  before.

## Progress

- [ ] Step file written
- [ ] `SearchOverlay` component built, portaled, reusing `matchesQuery`/`NavData`
- [ ] Desktop header search icon + `/` keyboard shortcut wired in `Header.tsx`
- [ ] Mobile header search icon wired
- [ ] i18n strings added
- [ ] `npm test` / `npm run lint` / `npm run build` pass
- [ ] Manual verification on all page types + the `/` shortcut's input-field guard specifically
- [ ] STATUS.md updated
