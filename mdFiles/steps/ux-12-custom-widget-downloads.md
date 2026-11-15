# UX-12 — download/export on the 6 custom (type C) widgets

Off the numbered sequence (like UX-01..11). Branch: `ux/custom-widget-downloads`.

User asked (2026-11-15) whether download was available on every calculator. Answer: no — UX-09's
download control (`DownloadMenu`, lives inside `WidgetActions` in `components/CalculatorWidget.tsx`)
is only rendered by `SolverCalculator`/`BreakdownCalculator`. The 6 hand-built "custom" (type C)
widgets never adopted that shared shell, so none of them have a download option today. User decided
to close this gap **before** deploying to the live domain (see `mdFiles/STATUS.md` D20).

## Scope — the 6 widgets, and the per-widget judgment call

This is judgment work, not a mechanical copy-paste — per `app/[locale]/calculators/[slug]/page.tsx`'s
`isCustomWidget` list, the 6 slugs map to 5 distinct components (character-counter and
hashtag-counter share `TextToolsCalculator`):

| Slug(s) | Component | Exportable result? | What to export |
|---|---|---|---|
| `currency-converter` | `components/CurrencyConverter.tsx` | Yes | Amount/from/to inputs, converted value as the result, the forward+inverse rate as outputs. No table. |
| `character-counter`, `hashtag-counter` | `components/TextToolsCalculator.tsx` | Yes | The pasted text's stats as the result/outputs — character mode: characters/no-spaces/words/sentences/paragraphs/lines + reading time; hashtag mode: unique hashtags/characters/words + the Instagram-limit check. No `raw`/`kind` typing needed beyond `'integer'` for counts — these are plain counts, not currency/percent. |
| `scientific-calculator` | `components/ScientificCalculator.tsx` | Yes, but minimal | The current expression as the "input" and its evaluated value as the result — same "formula = answer" shape the solver widgets already export. No history exists (only the current expression is live state) — don't invent one. |
| `timezone-meeting-planner` | `components/TimeZonePlanner.tsx` | Yes, as a table | The selected time + each chosen zone's local time and working-hours classification, shaped as an `ExportTable` (columns: Zone, Local time, Status) — same pattern as the amortization schedule table, but every column is `kind: 'text'` (no currency/percent/decimal values here). |
| `pomodoro-timer` | `components/PomodoroTimer.tsx` | **No — explicitly out of scope** | It's a live running timer (work/break phases, a running countdown, a completed-pomodoro counter) with no computed "result" a document download makes sense for. Forcing a PDF/Excel export onto a running timer would be a fabricated feature, not a real one — same "don't pad for the sake of padding" discipline as UX-10. Leave `PomodoroTimer.tsx` untouched. |

**Scope is Download only** — do not add Share/Copy/Reset to any of these 5. The user's ask was
specifically about download; these widgets already have their own interaction patterns (several
already have a reset-equivalent, e.g. Pomodoro's own Reset button, the currency swap button) and
adding a second, UX-09-style action bar on top is unasked-for scope creep. Keep each widget's
existing layout — insert only the download control.

## Implementation approach

1. **Export `DownloadMenu` from `components/CalculatorWidget.tsx`** (it's currently a private,
   unexported function used only inside `WidgetActions`). It already takes `{ calculatorId,
   exportData }` and needs nothing else — no change to its internals should be necessary. Verify it
   renders sensibly on its own (not nested inside a Share/Copy/Reset row) — it's `inline-flex`, so it
   should sit fine wherever it's placed, but check visually in a dev server before committing.
2. **Each of the 4 applicable components** (`CurrencyConverter`, `TextToolsCalculator`,
   `ScientificCalculator`, `TimeZonePlanner`) builds its own `ExportPayload` (`import type {
   ExportPayload } from '@/lib/export'`) from state it already has — same pattern
   `SolverCalculator.tsx`/`BreakdownCalculator.tsx` use, just simpler (no `table`/`chartSelector` for
   3 of the 4; `TimeZonePlanner` gets a `table`, no `chartSelector`). `title`/`url` come the same way
   those two widgets build them (`calculator?.title` equivalent — these custom widgets don't receive
   `calculatorId` as a prop today; check whether `page.tsx` needs to start passing it, or whether the
   component can derive its own title/slug — follow whatever's less invasive). Render `<DownloadMenu
   calculatorId={...} exportData={...} />` near the existing result area (natural reading position —
   look at where UX-09 placed it on the solver/breakdown widgets, directly under the result, for
   visual consistency, but don't force an identical DOM structure these widgets don't have).
3. **`TextToolsCalculator` needs a `calculatorId`/title prop** since it's shared by two different
   calculator pages (`character-counter`/`hashtag-counter`) — don't hardcode one slug.
4. Gate `exportData` the same way the existing widgets do — null (hides the control) when there's
   nothing meaningful yet (e.g. `TextToolsCalculator` with an empty textarea, `CurrencyConverter`
   with an unparseable amount).
5. No changes needed to `lib/exportPdf.ts`/`lib/exportExcel.ts`/`lib/export.ts` — the existing
   `ExportPayload` shape already covers everything these widgets need (inputs/result/outputs,
   `TimeZonePlanner`'s own `table`). If a genuine gap turns up (e.g. a kind these widgets need that
   `ExportKind` doesn't have), extend it minimally and say so in the PR — don't restructure the type.

## Acceptance checks

- `npm test` / `npm run lint` / `npm run build` all pass.
- Manual verification in a dev server, all 5 applicable pages (`currency-converter`,
  `character-counter`, `hashtag-counter`, `scientific-calculator`, `timezone-meeting-planner`):
  download control appears, PDF and Excel both generate without errors and contain the right data
  (open at least one generated file per widget, don't just confirm the click didn't throw).
- `pomodoro-timer` confirmed **unchanged** — no download control added, and say so explicitly in the
  PR description as a deliberate "no change needed" call, not an oversight.
- Every other (non-custom) calculator's download control is unaffected — this step only touches the
  5 custom components + the one `DownloadMenu` export change in `CalculatorWidget.tsx`.

## Progress

- [ ] Step file written
- [ ] `DownloadMenu` exported from `CalculatorWidget.tsx`
- [ ] `CurrencyConverter.tsx` — download wired
- [ ] `TextToolsCalculator.tsx` — download wired (both character/hashtag modes)
- [ ] `ScientificCalculator.tsx` — download wired
- [ ] `TimeZonePlanner.tsx` — download wired (table export)
- [ ] `PomodoroTimer.tsx` — confirmed untouched, documented as deliberate
- [ ] `npm test` / `npm run lint` / `npm run build` pass
- [ ] Manual verification on all 5 applicable pages, reading actual generated files
- [ ] STATUS.md updated
