# UX-02 — Calculator intro card: "How it works" diagram

Off the numbered sequence, like UX-01. Branch `ux/calculator-intro-diagram`, draft PR opened early.

## Scope

Replace the plain grey intro card on v2 calculator pages (`app/[locale]/calculators/[slug]/page.tsx`,
the `aside` panel beside the widget, above the table of contents) with a "How it works" card: a small
inputs -> output diagram generated automatically from calculator data, plus the existing description,
"Also called" aliases (as tags instead of a sentence) and a compact trust row (byline, reviewed date,
source count). No per-calculator hand-authoring — the diagram is derived from `calculator.solver` or
`calculator.breakdown`/`compute()`.

Every one of the 144 calculators currently has `content` (verified: `content: {}` present on all of
them), so the header fallback path (`tocItems ? null : intro`) is currently dead code. It is left
untouched — this step only replaces the `aside` card's content.

## Data: `lib/howItWorks.ts`

`buildFlow(calculator: CalculatorConfig): Flow | null`

```ts
type Flow = {
  inputs: { symbol?: string; label: string }[];
  output: { symbol?: string; label: string };
  solveAny: boolean;
};
```

- Special widgets (`currency-converter`, `character-counter`, `hashtag-counter`, `pomodoro-timer`,
  `timezone-meeting-planner`, `scientific-calculator`) -> `null`. These all have `inputs: []` in the
  data, so `inputs.length === 0` is also checked as a defensive fallback.
- Solver (type A): output = the variable at `solver.defaultTarget`; inputs = every other variable in
  `solver.variables` order (fixed ones included — they're real inputs, just never the auto field);
  symbols come straight from `variable.symbol` (always present on `SolverVariable`). `solveAny` = true
  when more than one non-`fixed` variable exists (verified in `lib/solverState.ts`: `order` rotates
  across every non-fixed variable, so any of them can become the target; a fixed variable never can).
- Breakdown (type B): reuse `lib/breakdown.ts` directly — `evaluateBreakdown` at
  `initialBreakdownState(calculator.inputs)` for the real `outputKeys`, then `resolveBreakdown` for the
  headline label, so the card can never show a label that disagrees with the widget. Inputs = each
  `CalculatorInput.label`, no symbols. `solveAny` = false always.
- A small `joinAnd` helper (Oxford comma, "a, b, and c" / "a and b") builds the screen-reader sentence
  from the flow's labels — kept local to the module and unit-tested, no new dependency
  (`Intl.ListFormat`'s types aren't in this project's `es2020` TS lib).

## Component: `components/HowItWorksCard.tsx`

Pure presentational server component (no client JS — the diagram needs no interactivity). Takes the
calculator (for category gradient), the `Flow | null`, and every string already translated/formatted
by `page.tsx` (matches the existing convention: `page.tsx` builds `aliasSentence`/`reviewedDate` and
passes primitives down, it does not pass the translator function itself).

Layout, in order:
1. "How it works" label (12px uppercase semibold, `#6E6E73`/`dark:slate-400`) — only when `flow` is
   not null.
2. Diagram row (`flex items-center gap-2`), only when `flow` is not null:
   - Input pills: `flex min-w-0 flex-1 flex-col gap-1.5` column. Each pill fixed `h-9` (36px, so the
     SVG math is exact regardless of font metrics), `bg-[#F5F5F7] dark:bg-slate-800`, `rounded-[10px]`,
     `px-2.5`, `text-[13px]`, `truncate` label with a `title` attribute (single line always, so pill
     pitch stays uniform per the acceptance note). Symbol slot `w-[14px] shrink-0 font-serif italic
     font-bold text-[14px] text-[#6E6E73] dark:text-slate-400` — omitted entirely (no reserved width)
     when the input has no symbol. More than 5 inputs: show the first 4 + a fifth "+N more" pill
     (no symbol slot).
   - Connector: inline SVG, `aria-hidden`, `shrink-0`, width 56, height = the pill column's own exact
     pixel height (`n * 36 + (n - 1) * 6`). One cubic-bezier path per pill, `M0,{y} C28,{y} 28,{cy}
     56,{cy}`, converging on `(56, cy)` where `cy` is the column's own vertical center — plus one
     arrowhead triangle at the convergence point. Because the pill column and the SVG are siblings of
     equal height inside the same `items-center` row as the output box, their shared center line is
     exactly the output box's center too (flexbox centers every item on the same cross-axis line
     regardless of the others' height) — no DOM measurement needed, pure CSS + arithmetic. Stroke
     `#AEAEB2`.
   - Output box: `w-[120px] shrink-0 rounded-2xl p-3.5 text-center text-white`, category gradient
     (`categoryTheme(calculator.category).color` through `TILE_COLORS`, 160deg). Symbol (optional,
     28px serif italic bold), label (13px semibold, wraps — not truncated, unlike the pills), and
     "or solve for any field" (11px) only when `flow.solveAny`.
   - A `sr-only` paragraph with the full sentence ("Enter home price, down payment, loan term and
     interest rate to get the monthly payment.") right after the (fully `aria-hidden`) visual diagram.
3. Description paragraph — unchanged styling (`text-[15px] leading-relaxed text-[#3A3A3C]
   dark:text-slate-300`; the spec's 15px vs. the old 16px `text-base`, a deliberate size-down now that
   the card has more going on above it).
4. "Also called" tags — only when aliases exist. `#6E6E73`/`dark:slate-400` 12px label, then up to 4
   tags (same slice `buildAliasSentence` uses) as `bg-[#F2F2F7] dark:bg-slate-800 rounded-md px-2 py-1
   text-[12px]` chips.
5. Trust row (`flex flex-wrap items-center gap-x-4 gap-y-1`, 12px, `#515154`/`dark:slate-400`):
   byline text first (no icon — kept exactly as before so nothing watching for that string breaks),
   then a check icon + "Reviewed {date}" when `lastReviewed` exists, then a book icon + "{n} source(s)"
   linking to `#references` when `content.references.length` exists. Each piece is independently
   omitted when its data is missing.

All new strings (`howItWorksLabel`, `orSolveAnyField`, `alsoCalledLabel`, `moreInputs`, `reviewed`,
`sources` (ICU plural, same pattern as `common.tools`), `diagramSummary`) go in `messages/en.json`
under the existing `calculator` namespace. `page.tsx` calls `t()` for all of them (it already has a
`getTranslations({ namespace: 'calculator' })` instance) and passes the resulting strings as props —
`HowItWorksCard` itself takes no translator.

## Wiring: `page.tsx`

- `const flow = buildFlow(calculator);`
- Replace the `intro` JSX used by the `aside` card only. The header fallback (`tocItems ? null : ...`)
  keeps using the old plain `intro` — unreachable today (every calculator has `content`), not worth
  touching since this step is scoped to the aside panel.
- `calculator.aliases.slice(0, 4)` — the same slice `buildAliasSentence` already uses — passed as the
  tag list (not the sentence; the sentence rendering is dropped from the aside, the data is reused).

## Acceptance checks

- `npm run build` passes, `npm test` green (new `lib/howItWorks.spec.ts`: every calculator returns
  `null` (special widgets only) or a flow with >= 1 input and a non-empty output label;
  `mortgage-calculator` -> output symbol `M`, `solveAny` true).
- Lint no worse than master.
- Visual check at desktop + phone width (headless Chrome screenshots, Chrome extension not connected
  in this session): `mortgage-calculator`, `bmi-calculator`, `miles-to-kilometers-converter`,
  `standard-deviation-calculator`, `freelancer-rate-calculator` (7 variables -> 6 inputs -> "+2 more"),
  `currency-converter` (fallback, no diagram). No overflow at 390px. Curves aligned.

## Progress

- [x] Step file written, committed, pushed; draft PR open (#41)
- [x] `lib/howItWorks.ts` + `lib/howItWorks.spec.ts`, `npm test` green
- [x] `messages/en.json` strings added
- [x] `components/HowItWorksCard.tsx` built
- [x] Wired into `app/[locale]/calculators/[slug]/page.tsx`
- [ ] `npm run build` passes, lint checked
- [ ] Desktop screenshots: mortgage, bmi, miles-to-km, standard-deviation, freelancer-rate, currency-converter
- [ ] Phone (390px) screenshots: same six pages
- [ ] Fixes from visual check applied
- [ ] `mdFiles/STATUS.md` updated; dev server killed; `gh pr ready`
