# UX-11 — widget layout: calculator and result as independent boxes, side by side

Off the numbered step sequence (like UX-01..10). Branch: `ux/widget-side-layout`.

**DONE 2026-11-15.** Built live, directly in a local dev server, with the user watching and
redirecting at each step (not pre-planned end to end — the design below is what shipped, not the
original plan; see "History" at the bottom for how it got here).

## What shipped

A calculator page's widget area (the `tocItems` branch of `app/[locale]/calculators/[slug]/page.tsx`,
used by every calculator with `content`) now renders as two fully independent elevated cards side
by side at desktop width, stacked on mobile:

- **Left column**: the calculator's inputs (its own `ELEVATED_CARD`-wrapped box) → `Share
  result`/`Copy result`/`Reset` directly below it → `HowItWorksCard` directly below that.
- **Right column**: the result (its own separate `ELEVATED_CARD`-wrapped box, holding the
  headline, outputs, and any chart/schedule) → `TableOfContents` directly below that.

The two columns are genuinely independent in height — if the calculator's box is short (few
inputs), its "How it works" card starts right away and the left column simply ends there, even
while the result column (chart, amortization schedule, etc.) is still running. They do not force
each other to the same height, and that is deliberate, not a bug: the alternative (pinning both
"How it works" and "Contents" to a shared row below whichever side is taller) left "How it works"
visually stranded below a lot of empty space under a short calculator.

Column ratio: **1fr : 1fr**, a deliberate middle ground — not the original "give the result more
room" idea and not the opposite "give inputs more room" — found by actually rendering both extremes
and seeing each one fail a different way (labels wrapping onto 3 lines when inputs were narrow;
the result's chart/schedule looking cramped when result was narrow).

## Implementation

- **`components/CalculatorWidget.tsx`**:
  - `WIDGET_SPLIT` — `grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6`.
  - `ELEVATED_CARD` (new) — shadow + ring + rounded corners only, no background/padding of its own;
    wraps an already-rounded, already-backgrounded block (`FIELD_GROUP`, `ResultPanel`) so it reads
    as its own elevated card rather than living inside one shared card with everything else.
  - `FieldRow` padding slimmed: `px-4 py-3` → `px-4 py-2`.
- **`components/SolverCalculator.tsx`** / **`components/BreakdownCalculator.tsx`**: both now accept
  optional `belowInputs?: ReactNode` / `belowResult?: ReactNode` props, rendered at the bottom of
  the left/right column respectively — this is the mechanism that makes "How it works"/"Contents"
  part of each column's own independent height instead of a separate row. `WidgetActions`
  (share/copy/reset) moved from the bottom of the whole widget to directly under the inputs card,
  inside the left column, above `{belowInputs}`.
- **`app/[locale]/calculators/[slug]/page.tsx`**:
  - `isCustomWidget` flag for the 6 hand-built (type C) widgets (`currency-converter`,
    `character-counter`, `hashtag-counter`, `pomodoro-timer`, `timezone-meeting-planner`,
    `scientific-calculator`) — these render as one box (no split), so they still get the old
    "How it works + Contents in one row below the widget" treatment, now gated behind
    `isCustomWidget` rather than every `tocItems` page.
  - For every other calculator (the vast majority — all `solver`/`breakdown` pages), `howItWorksCard`
    and `tableOfContents` are built once and passed straight into `SolverCalculator`/
    `BreakdownCalculator` as `belowInputs`/`belowResult` — no separate row rendered for these at all.
  - Header slimmed: `space-y-3` → `space-y-2`, icon tile `size="lg"` (56px) → `size="md"` (36px),
    `gap-4` → `gap-3`. Title text size unchanged.

## What does NOT change

- No calculator's `solver`/`breakdown` config, compute logic, or content changes — pure layout/CSS
  across 4 shared files plus the page template, same class of change as UX-06/UX-07 before it.
- `/calculators`, the Categories dropdown, and the phone menu are unaffected.
- The 6 custom (type C) widgets' own internal layout is unaffected — they still render as one
  `WidgetCard` box, unchanged.
- Visuals themselves (`Donut`, `CompareBars`, `AmortizationTable`, etc.) were not resized or
  rewritten — they just render inside a different-width result column now.

## Verification

- `npm test` 1123/1123, `npm run lint` clean, `npx tsc --noEmit` clean (ignoring the two
  pre-existing, unrelated spec-file errors noted elsewhere in STATUS.md's Parked list), `npm run
  build` passes.
- Live-checked in a local dev server (light + dark) on: `mortgage-calculator` (solver, chart +
  UX-07 amortization schedule — the column-ratio and independent-height stress test),
  `home-affordability-calculator` (breakdown, grouped inputs with a collapsible "Ongoing housing
  costs" section, 12-row output + `compareBars` — the densest result on the site), and
  `scientific-calculator` (type C custom widget — confirmed unaffected, still one box with the old
  row-below treatment).
- Phone width was not verified visually — this sandbox's Claude-in-Chrome `resize_window` doesn't
  actually shrink the rendered viewport (a known, previously-documented limitation, not specific to
  this change). The layout uses the same `grid-cols-1 lg:grid-cols-[...]` pattern already proven
  elsewhere on the site, so it should stack correctly, but this is unverified by screenshot.
- User reviewed every iteration live and confirmed the final result ("yes now it looks good").

## History (how the design actually evolved — kept for context, not a plan to re-execute)

1. First request: compare layout options for the result area. Built a 4-option comparison canvas
   (`https://claude.ai/artifact/U6vGKxx3zsM32e1Mk2VXRB`). User picked "Option C" (full-width widget,
   sidebar below) over keeping the sidebar beside a narrower widget.
2. Built Option C with a 2fr(inputs):3fr(result) split, actions below both columns, "How it
   works"/"Contents" in a shared row below. Also slimmed `FieldRow` padding and the page header
   per a side request.
3. User: move Share/Copy/Reset to above the calculator → done, then reverted on the next message
   ("if we place it above ... the calculator and results come down a bit") — moved back below.
4. User: Result shouldn't share one box with the calculator; buttons should be directly below the
   calculator specifically, not centered below both; How it works or Contents should be below the
   calculator. → introduced `ELEVATED_CARD` so each side is an independent box, moved buttons under
   the inputs specifically.
5. User: the ratio made the calculator's labels wrap onto 3 lines → flipped to 3fr(inputs):2fr(result).
6. User: now the result (which holds charts) is too thin, and "How it works" still isn't really
   "just below the calculator" (it was pinned to a row below whichever column was taller) → this is
   the version that shipped: 1fr:1fr ratio, plus the `belowInputs`/`belowResult` slot mechanism so
   each column's height is genuinely independent.

## Progress

- [x] Step file written, branch created
- [x] `WIDGET_SPLIT` + `ELEVATED_CARD` added to `CalculatorWidget.tsx`
- [x] `SolverCalculator.tsx` wired to the split, `belowInputs`/`belowResult` slots added
- [x] `BreakdownCalculator.tsx` wired to the split, `belowInputs`/`belowResult` slots added
- [x] `page.tsx` restructured: split widgets get slots, `isCustomWidget` keeps the old row for the
      6 custom widgets
- [x] `FieldRow` padding slimmed, calculator page header slimmed
- [x] `npm test` / `npm run lint` / `npx tsc --noEmit` / `npm run build` all pass
- [x] Manual check across solver/breakdown/custom-widget calculators, light + dark
- [ ] STATUS.md updated, PR opened (next)
