# UX-09 — download/export: PDF, PDF-with-table, CSV, print

Off the numbered step sequence (like UX-01..08). Branch: `ux/download-export`.

User asked for a download feature (2026-11-15), citing: PDF (jsPDF), PDF tables
(jspdf-autotable), print-friendly PDF (HTML+CSS print), CSV (Blob API), charts in PDF (SVG/chart
export), file download (browser download API). Scoped down to a concrete design via two
clarifying questions — answers below are final, not open questions.

**Placement confirmed 2026-11-15 (after UX-11 landed)**: the download control sits in
`WidgetActions`, in the same row as `Share result`/`Copy result`/`Reset`, directly under the
calculator's inputs card (left column) — not beside the result. A non-functional placeholder
button (dashed border, chevron icon, flashes "Download coming soon" on click) was built live in a
dev server to confirm the spot with the user, then **deliberately not committed** — shipping a
"coming soon" button to real visitors isn't acceptable, so this step builds the real thing at that
exact spot rather than wiring up the placeholder. When this step starts: replace that placeholder
(if it's still sitting as an uncommitted local change — check `git status` on
`components/CalculatorWidget.tsx` first) with the real `DownloadMenu` described in Part 3 below, at
the same position in `WidgetActions`'s returned JSX (right after the `Reset` button).

## Scope decisions (confirmed with the user, do not relitigate)

- **Every calculator gets the download control** — built once into the shared
  `WidgetActions` component (`components/CalculatorWidget.tsx`), used by both `SolverCalculator`
  and `BreakdownCalculator`, so all ~290 calculators (and every future one) get it automatically.
- **One dropdown, up to 4 options**: `Print`, `PDF`, `PDF with table`, `CSV`. `PDF with table`
  only appears when the calculator actually has a table-shaped result to include (today: just the
  amortization schedule, see below) — most calculators show 3 options (`Print`/`PDF`/`CSV`), loan-
  schedule calculators show 4.
- **What gets exported is the live, personalized result** — the visitor's own entered inputs and
  the computed result/outputs, not the page's static reference content. **`content.referenceTable`
  and `content.commonValues` sections (static, server-rendered, same regardless of input) are
  explicitly out of scope for this step** — they're not personalized, so downloading them adds
  little value and meaningfully more engineering (plumbing content through to a client component
  that doesn't otherwise receive it). Revisit only if the user asks later.
- **"Charts in PDF" is not a separate dropdown option** — when the calculator's visual is an
  actual chart (donut/compare-bars/range-bar/log-scale/timeline — all hand-rolled SVG), the `PDF`
  option includes it as a rasterized image automatically. `AmortizationTable`'s visual is an HTML
  `<table>`, not a chart — its data goes into the PDF as a literal table (via jspdf-autotable),
  never as an image of a table.
- **"File download"** (the user's 6th line item) is not a UI option at all — it's the browser
  download mechanism every other option uses to actually save the generated file. No separate
  button.

## New dependency (note per CLAUDE.md "no new deps without noting it in STATUS.md")

`jspdf` + `jspdf-autotable`. Both are pure client-side, dynamically imported (`await
import('jspdf')`) **inside the click handler, never at module top level** — these pages are
`force-static` and ship to every calculator, so a top-level import would add real weight (jsPDF is
not small) to every page's JS bundle whether or not a visitor ever downloads anything. A dynamic
import code-splits it into its own chunk that only loads on click. Record the addition in
`STATUS.md`'s session log when this lands, per CLAUDE.md.

## Part 1 — `lib/exportPdf.ts`, `lib/exportCsv.ts` (new files)

```ts
// lib/export.ts — shared payload shape, used by both lib/exportPdf.ts and lib/exportCsv.ts
export type ExportRow = { label: string; value: string };
export type ExportTable = { columns: string[]; rows: (string | number)[][] };
export type ExportPayload = {
  title: string;        // calculator title, e.g. "Mortgage Calculator"
  url: string;          // canonical page URL (window.location.href at export time)
  inputs: ExportRow[];  // every filled-in input, label + formatted value with unit
  result: ExportRow;    // the headline result
  outputs: ExportRow[]; // any secondary outputs (solver.outputs / breakdown rows)
  table?: ExportTable;  // present only for calculators with a schedule (amortization, below)
  chartSelector?: string; // CSS selector for the SVG to rasterize into the PDF, if any
};
```

- `lib/exportCsv.ts`: `downloadCsv(payload: ExportPayload)` — if `payload.table` exists, the CSV
  is the table (columns + rows); otherwise it's a simple two-column `Field,Value` CSV of
  `inputs`+`result`+`outputs`. Build the CSV string by hand (no new dependency needed — comma/quote
  escaping is a few lines), wrap in a `Blob([csv], { type: 'text/csv' })`, and trigger a save via a
  shared `downloadBlob(blob, filename)` helper (`URL.createObjectURL` + a temporary `<a download>`
  click + `revokeObjectURL` after). Filename: `${calculatorId}-result.csv`.
- `lib/exportPdf.ts`: two async functions, both dynamically importing `jspdf`
  (`jspdf-autotable` only when a table is actually being added):
  - `downloadSummaryPdf(payload)` — title, url, a horizontal rule, `inputs` as label/value pairs,
    the headline `result` in larger bold text, `outputs` below it, then — if `payload.chartSelector`
    resolves to a live `<svg>` element — the rasterized chart image (see Part 2) underneath. One to
    two pages, never includes `payload.table` even if present (that's what `PDF with table` is for).
  - `downloadFullPdf(payload)` — everything `downloadSummaryPdf` does, plus `payload.table`
    rendered via `jspdf-autotable` on subsequent pages (it paginates automatically). Only called
    when `payload.table` is defined — the dropdown doesn't offer this option otherwise.
  - Filename: `${calculatorId}-result.pdf` / `${calculatorId}-schedule.pdf`.

## Part 2 — chart rasterization (no new dependency — same technique the user's own table

names: "SVG/chart export — None")

Small helper, e.g. in `lib/exportPdf.ts`:
```ts
async function svgToPngDataUrl(svg: SVGSVGElement): Promise<string> {
  const xml = new XMLSerializer().serializeToString(svg);
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
  const img = new Image();
  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = svgDataUrl; });
  const canvas = document.createElement('canvas');
  const scale = 2; // crisper than 1:1 in the PDF
  canvas.width = (svg.clientWidth || 400) * scale;
  canvas.height = (svg.clientHeight || 200) * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}
```
Only call this when `document.querySelector(payload.chartSelector)` returns a real `<svg>` — not
every visual is an SVG (Timeline/AmortizationTable render HTML), and even SVG visuals might be
absent (unanswered result). Fail silently (skip the image, don't block the PDF) if rasterization
throws — a download must never error out over a missing chart.

## Part 3 — wiring into `components/CalculatorWidget.tsx`'s `WidgetActions`

- Add a `data-export-chart` attribute to the div that already wraps the `visual` prop in
  `ResultPanel` (`components/CalculatorWidget.tsx`'s `ResultPanel` function) — this is the one
  place both widget types already render their visual, so one attribute covers both. Pass
  `chartSelector: '[data-export-chart] svg'` whenever a visual is present, regardless of type (the
  rasterizer itself no-ops on non-SVG content per Part 2).
- Extend `WidgetActionsProps` with `exportData: ExportPayload | null` (null hides the whole
  dropdown — shouldn't happen in practice since every calculator has at least inputs+result, but
  keep the guard).
- New `DownloadMenu` component (in `CalculatorWidget.tsx`, next to the existing `Share
  result`/`Copy result`/`Reset` buttons in `WidgetActions`'s returned JSX): a button that opens a
  small dropdown (reuse the disclosure pattern from `AmortizationTable.tsx`'s `Chevron`/open-state
  approach, or the existing `<details>` pattern already used elsewhere on the page — pick whichever
  is less code, this doesn't need new a11y machinery, a native `<select>` + a "Download" button is
  simplest and keeps this accessible for free: `<select>` with options `Print` / `PDF` / `PDF with
  table` (only rendered when `exportData.table` exists) / `CSV`, plus a "Download" button that
  dispatches based on the selected value (`window.print()` for Print, otherwise the matching
  `lib/exportPdf.ts`/`lib/exportCsv.ts` function). Loading state on the button while a dynamic
  import resolves (jsPDF is not instant to load on a slow connection) — disable + "Preparing…" text.
- `data/calculators/types.ts` needs no changes — `exportData` is built entirely from data the
  widgets already have (`solver`/`breakdown` config + resolved `all`/`solution` values), not a new
  calculator-config field.

## Part 4 — building `exportData` in `SolverCalculator.tsx` and `BreakdownCalculator.tsx`

Both already compute everything needed; this is assembly, not new calculation:
- `inputs`: every variable/input with a value, label, and its current unit's label (reuse the
  existing `display`/`show`/`withUnit`/`formatOutput` formatting functions each widget already
  calls for on-screen display — the export must show the exact same formatted text the page shows,
  never a separately-formatted number that could drift).
- `result` / `outputs`: same source as the on-screen `Headline`/`OutputList` rows.
- `table`: **only when a visual of `type: 'amortization'` is present** — call
  `amortizationMonthlySchedule(principal, annualRate, months, payment)` from `lib/amortization.ts`
  (already built in UX-07; reuse directly, do not recompute differently) with the resolved values,
  and shape it as `{ columns: ['Month', 'Interest', 'Principal', 'Balance'], rows: [...] }`. A
  small new helper `exportTableForVisual(visual, all): ExportTable | undefined` (put it in
  `lib/export.ts` next to the payload type) pattern-matches on `visual.type`; today it only
  handles `'amortization'` and returns `undefined` for every other visual type (donut/range-bar/
  timeline/log-scale/compare-bars) — easy to extend later, not a blocker now.
- Only build `exportData` (and pass it to `WidgetActions`) when `answered`/`complete` is true —
  same gating the on-screen result already uses. When not answered, `exportData` is `null` and the
  dropdown doesn't render (nothing useful to export yet).

## Part 5 — print stylesheet

**Shipped differently than originally planned, for the better**: rather than one `@media print`
block of hand-written selectors in `app/globals.css`, each component that should disappear when
printing got Tailwind's built-in `print:hidden` utility added directly to its own root element —
`Header.tsx`, `Footer.tsx`, `Breadcrumb.tsx`, `RelatedCalculators.tsx`, `HowItWorksCard.tsx`,
`TableOfContents.tsx`, plus a wrapping `<div className="... print:hidden">` in
`app/[locale]/calculators/[slug]/page.tsx` around everything from `{example}`/`{related}` through
the `ReferencesSection` (concept, how-to-use, formula, worked example, common values, reference
table, watch-out, FAQ, references — all of it). No global CSS needed; each component owns its own
print visibility, which is more maintainable than one selector list elsewhere that has to be kept
in sync by hand. `window.print()` remains the trigger, called directly from `DownloadMenu`.

## Acceptance checks

- `npm test` / `npm run lint` / `npm run build` all pass. `npm run build`'s bundle output should
  show `jspdf` in its own chunk, not inlined into every calculator page's shared bundle — spot-
  check the build output or `next build`'s bundle analysis if easy, don't block on a deep dive if
  it's not.
- Manual verification on at least 4 calculators, covering every path:
  - A plain solver calculator with no visual (e.g. `bmi-calculator`): dropdown shows
    Print/PDF/CSV only; PDF is a clean one-pager; CSV is the two-column summary.
  - A calculator with a chart visual (e.g. `mortgage-calculator`'s donut, or any `compareBars`/
    `rangeBar` page): PDF includes the rasterized chart image, not a broken/missing image.
  - A calculator with the amortization visual (`mortgage-calculator`, `loan-calculator`,
    `emi-calculator`, or `car-payment-calculator`): dropdown shows all 4 options; `PDF with table`
    and `CSV` both include the **full** schedule (reuse UX-07's monthly granularity — a 12-month
    EMI export should have 12 rows, not 1).
  - Print: `window.print()` preview (or an actual print-to-PDF) shows just the widget/result, not
    the header/footer/nav/ads.
- A live browser check (Claude in Chrome, if connected) of at least the mortgage-calculator PDF
  download is worth doing before merge — this is new user-facing functionality, not a copy change.

## Progress — DONE 2026-11-15

- [x] Step file written
- [x] `jspdf` ^4.2.1 + `jspdf-autotable` ^5.0.9 added — audited: the 33 pre-existing npm audit
      findings (wrangler/next/eslint toolchain) are unaffected, zero new vulnerabilities from
      either package (verified by diffing `npm audit` with/without the install)
- [x] `lib/export.ts` (`ExportPayload` type + `exportTableForVisual`, reuses UX-07's
      `amortizationMonthlySchedule` directly — full schedule, not whatever the on-screen table
      happens to be expanded to)
- [x] `lib/exportCsv.ts` (hand-rolled CSV escaping, `downloadBlob` helper)
- [x] `lib/exportPdf.ts` (`downloadSummaryPdf`, `downloadFullPdf`, `svgToPngDataUrl` chart
      rasterization — all dynamic-imported, confirmed jsPDF (~330KB) lands in its own build chunk,
      not the shared page bundle)
- [x] `WidgetActions` / `DownloadMenu` wired in `CalculatorWidget.tsx` — a `<select>` + "Download"
      button, "Preparing…" state while a dynamic import resolves
- [x] `SolverCalculator.tsx` builds and passes `exportData`
- [x] `BreakdownCalculator.tsx` builds and passes `exportData`
- [x] Print visibility via `print:hidden` on individual components (see Part 5 — shipped
      differently than planned)
- [x] `npm test` 1123/1123, `npm run lint` clean, `npx tsc --noEmit` clean, `npm run build` passes
- [x] Manual, end-to-end verification (not just visual) on 3 calculators, reading the actual
      downloaded files:
  - `mortgage-calculator` (amortization + donut chart): PDF summary (inputs/result/outputs/chart
    all correct), PDF with table (full 360-month schedule, paginated, headers repeat per page via
    jspdf-autotable), CSV (full schedule, correctly quoted). Verified via `pdftotext -layout` and
    `cat`, not just a screenshot.
  - `bmi-calculator` (RangeBar visual, no table): dropdown correctly omits "PDF with table" (only
    3 options). PDF and CSV both correct (`Field,Value` two-column fallback for CSV).
  - Print CSS confirmed via DOM inspection (`header`/`footer`/breadcrumb all carry `print:hidden`)
    rather than actually invoking `window.print()`, to avoid a blocking native OS dialog in this
    session.
- [x] STATUS.md updated
- [x] PR #78 opened and merged

### Follow-up polish (2026-11-15, after merge — user asked for the PDF/CSV to look "a little better")

PDF (`lib/exportPdf.ts`): added a solid brand-blue band at the top of every page (`Daily
Calculations` wordmark + `dailycalculations.com`), the clickable source URL via `textWithLink`,
the result rendered as its own light-blue rounded card (echoing the on-screen `ResultPanel`'s
accent wash) instead of plain text, light divider lines between input/output rows, and a footer
stamped on every page (download date + `Page X of Y`). The multi-page schedule variant repeats the
brand band on every page and gets its page-total right by stamping footers in a second pass after
`autoTable` finishes adding pages — doing it inside `didDrawPage` would show the wrong total, since
the final page count isn't known until the table is fully laid out.

CSV (`lib/exportCsv.ts`): added a small identifying header block (title, url, download date, then
a blank row) before the real data, the same convention most exported bank/report CSVs use — makes
a file opened later in a spreadsheet self-explanatory without needing the original filename.

Re-verified end-to-end the same way as the first pass (reading the regenerated files, not
screenshots): `mortgage-calculator`'s summary PDF, 12-page schedule PDF (brand band on page 2,
"Page 12 of 12" correct on the last page, 360 months ending at exactly $0.00 balance). `npm test`
1123/1123, lint clean, `npx tsc --noEmit` clean, `npm run build` passes.

### Second follow-up (2026-11-15, same session — layout + chart captions)

**Layout, asked for explicitly**: inputs and the chart now sit side by side as two bordered,
rounded-corner cards (mirroring the on-screen inputs|result split), with the result underneath as
its own highlighted card holding the headline plus its supporting outputs as the explanation
beneath it. A missing chart gives the inputs card the full width rather than an empty box. The
schedule table (`downloadFullPdf`) no longer stretches edge-to-edge — sized to
`min(contentWidth, columns × 34mm)` and centered, with `theme: 'grid'` for a fully bordered look
and a blue header row matching the brand band.

**Chart captions, asked for explicitly ("something written for the graphs and charts explaining
them")**: every visual component (`Donut`, `RangeBar`, `CompareBars`, `LogScale`, `Timeline`)
already carries a complete, human-readable summary in an `aria-label` — built for screen readers,
on the `<svg>` itself for `Donut` or on a wrapping `[role="img"]` element for the other four. Read
generically via `document.querySelector('[data-export-chart] [aria-label]')`, wrapped with
`doc.splitTextToSize` and centered under the chart image in small gray text. No new data plumbing
needed — this is the same accessibility string every visual already had, just surfaced into the
PDF.

**Known limitation, not fixed**: `RangeBar`'s floating value marker/pointer (the "BMI 23.4" badge
with its triangle, e.g. on `bmi-calculator`) is absolutely-positioned HTML layered over the `<svg>`
bar, not part of the SVG itself, so `svgToPngDataUrl` (which only rasterizes the `<svg>`) doesn't
capture it — the bar renders in the PDF with no marker. The caption text still correctly states the
value and which band it falls in, so the information isn't lost, just the visual indicator. A real
fix needs either a DOM-screenshot library (html2canvas-class dependency, against the "no new
infra" intent of the original chart-export design) or hand-duplicating `RangeBar`'s own marker
position math directly in `lib/exportPdf.ts`. Worth doing if/when `RangeBar`-based calculator PDFs
turn out to matter — not done now since the user's actual ask (explanatory text) is fully met by
the caption alone.

Re-verified again: `mortgage-calculator` (Donut — chart card shows "CHART" label, donut image, and
the full caption "$541,116.20 total paid: Principal $280,000.00 (52%), Interest $261,116.20 (48%)."
wrapped and centered) and `bmi-calculator` (RangeBar — caption "WHO adult BMI categories: 25.1
falls in the Overweight band." correct, marker-rendering gap noted above). `npm test` 1123/1123,
lint clean, `npx tsc --noEmit` clean, `npm run build` passes.

### Third follow-up (2026-11-15, same session — CSV→Excel pivot, PDF/Print redesign)

User kept pushing on output quality ("production ready for a corporate employee, not a basic
structure") and the literal request — colors, embedded images, white background — is impossible
for a real CSV (plain text, can't carry fills or images). Asked the user via `AskUserQuestion`;
answer: **replace CSV entirely with Excel (.xlsx)**. `lib/exportCsv.ts` deleted, `exceljs` ^4.4.0
added (new dependency — see below). A first `lib/exportExcel.ts` draft had a real, confirmed bug
(found independently two ways: my own round-trip read-back script, and the user's screenshot of
the actual output) — the "Inputs" and "Chart" sections both wrote into column 1, so the donut image
visually overlapped the input values, and numeric cells were pre-formatted strings, triggering
Excel's native "number stored as text" warning. Rather than keep patching, consulted an Opus
subagent for a proper corporate-spreadsheet design spec (two separate consultations: one for Excel,
one — "get the design patterns for all option of download" — for PDF + Print), then rewrote all
three against those specs.

**`lib/export.ts`**: `ExportRow` gained optional `raw: number` + `kind: ExportKind` ('currency' |
'percent' | 'integer' | 'decimal' | 'text') alongside the existing display `value: string` — Excel
needs a real typed number to apply a real number format; PDF keeps using the display string.
`ExportTable.columns` is now `{header, kind}[]` and `rows` are raw `number[][]` (previously
pre-formatted `(string|number)[][]`) — `formatByKind()` does the PDF-side formatting from the raw
numbers at render time. `SolverCalculator.tsx`/`BreakdownCalculator.tsx` both updated to populate
`raw`/`kind` on every input/result/output row (mapping each widget's own unit-dimension or
output-format vocabulary onto `ExportKind`; percent values are stored as the Excel-expected
fraction, e.g. 0.065 for 6.5%, not 6.5).

**`lib/exportChart.ts`** (new, factored out of `lib/exportPdf.ts` so Excel can reuse the same DOM
chart-reading logic): `ChartLegendItem` now carries `label`/`value: number | null` alongside the
existing `text`/`color`, split from the legend `<li>`'s per-child text nodes rather than regexed
off the joined string — Donut's row is exactly `[label, formatted amount, share %]` as three
separate DOM children, and regexing the *last* number off the joined text was grabbing the share
percentage ("52%") instead of the dollar amount in the middle. Verified against the live DOM in
Chrome: `["Principal", "$280,000.00", "52%"]` → `{label: "Principal", value: 280000}`.

**`lib/exportExcel.ts`** (full rewrite): two sheets — **Summary** (brand header, a tinted KPI card
for the result, key figures, inputs, the chart image with a real colored-swatch-bullet legend table
with Amount/Share columns and a `SUM()`-formula total row, notes) and **Schedule** (just the big
table) — because freeze panes apply to a whole sheet, and a 360-row table under the summary would
need its header frozen ~30 rows down. Inputs live in columns B:C, the chart/legend in E:H, with
column D as a deliberately-unwritten "hard wall" between them — the direct fix for the original
overlap bug. All numbers are real (`cell.value = 280000`, not `"$280,000.00"`) with Excel `numFmt`
strings applied per `ExportKind`. The Schedule sheet uses a native `ws.addTable()` (not manual
borders/fills) for sort/filter/structured totals, with conditional-formatting zebra striping
(`MOD(SUBTOTAL(3,...),2)=0`, not a static fill, so it survives sorting/filtering) and frozen panes
at the header row. Workbook metadata (creator/title/subject), tab colors, page setup and footers
set; no sheet protection (spec's words: "corporate users will annotate, extend and paste;
protection is hostile"). Verified via a round-trip read-back (`exceljs` reading the generated file
back and dumping every cell's value/numFmt) — confirmed real numbers with correct formats
throughout, the legend's Amount/Share columns showing real dollar figures (not the share-percent
bug), and the native table + image anchored with no column overlap.

**`lib/exportPdf.ts`** (full rewrite): dropped the "inputs card beside chart card" layout — Opus's
review called this out specifically (two cards of different height leave a ragged hole, and the
eye has to zig-zag between them) in favor of top-down full-width blocks matching how real summary
documents (loan estimates, bank statements) are laid out: masthead → title/meta → a tinted KPI band
(accent bar + the result in near-black ink, not blue — blue goes gray and loses weight on a
grayscale printer; drops the `M =` variable symbol in favor of the output's plain name) with up to
3 secondary figures as cells to its right → inputs flowed into 2 columns → the chart with its
legend as a real amount/share table beside it (not a caption paragraph below) → notes → the
schedule, which now always starts on its own page. The schedule table lost its blue header fill
(a solid fill prints as muddy gray and costs toner) for bold slate text on white with a rule
underneath, and got a slim running header on every page after the first for context during a long
printout. Added `doc.setProperties()` metadata and a dated, slugged filename
(`dailycalculations-{slug}-{date}.pdf`, matching the new Excel convention).

**Print (`app/globals.css`, `components/CalculatorWidget.tsx`)**: added a `@media print` block —
forces the site's dark theme back to light on paper (both the `dark` class and the OS
`prefers-color-scheme` query can still be active when the print dialog opens), a `.print-exact`
class (`print-color-adjust: exact`) on the result card and chart so their backgrounds/swatches
survive Chrome's default "strip backgrounds on print," removes shadows/backdrop-filter/animation,
collapses `.min-h-screen` (otherwise a trailing blank page), and flattens `<input>`/`<select>`
borders for print. `WidgetActions` now listens for `beforeprint`/`afterprint` to give the printed
page/"Save as PDF" a dated document title and force dark mode off (belt-and-braces alongside the
CSS fix), restoring both afterward. The whole Share/Copy/Reset/Download actions bar is
`print:hidden` — all meaningless on paper.

**Not implemented from the Opus specs** (time-boxed; real structural/correctness fixes took
priority over full pixel-fidelity) — revisit only if the user asks:
- PDF: the donut is still a rasterized PNG, not hand-drawn vector arcs; no year-subtotal grouping
  in the schedule table; no PDF outline/bookmarks; no landscape auto-switch for wide tables; no
  region-aware Letter-vs-A4 paper size (would need the region profile plumbed into `ExportPayload`).
- Print: inputs still render as native `<input>`/flattened-border fields rather than printed-only
  formatted `<span>` text (the input's raw unformatted value shows, e.g. `350000` not
  `$350,000.00`) — a real fix needs separately plumbing a formatted display string into `FieldRow`
  for both widget types.

Verified: `npm test` 1123/1123, `npm run lint` clean, `npx tsc --noEmit` clean (pre-existing,
unrelated failures in `data/calculators.spec.ts`/`lib/breakdown.spec.ts` untouched by this work),
`npm run build` passes. Live-tested in Chrome on `mortgage-calculator`: downloaded Excel's blob
captured and round-tripped through `exceljs` (not just a screenshot) confirming the two-sheet
layout, real numbers/formats, native table, and the legend fix above; the PDF-with-table path runs
without console errors; print CSS rules confirmed compiled and applied via DOM/stylesheet
inspection. Two stale dev-server processes left running from earlier in the session (one serving a
corrupted `.next` build) were found and killed while setting up this verification — unrelated to
the code changes, just session hygiene.

**New dependency**: `exceljs` ^4.4.0, replacing the removed `lib/exportCsv.ts`'s hand-rolled CSV.
Audited earlier in this session: adds exactly 2 new `npm audit` findings (`exceljs` + transitive
`uuid`, both moderate, "missing buffer bounds check when `buf` is provided") — assessed as low
real-world risk since this codebase never passes attacker-controlled input to the affected code
path, and no newer `exceljs` version fixes it.

### Fourth follow-up (2026-11-15, same session — dropped the Print option)

User's call: "when i say print it should actually print the pdf, actually we should remove the
print option because a person can prints its already downloaded pdf." The in-app `Print` dropdown
entry (`window.print()`) was redundant once PDF download exists — a visitor who wants a paper copy
can open the downloaded PDF and print that, which prints exactly what's in the file rather than
whatever happens to be on screen. Removed: `DownloadFormat` is now `'pdf' | 'pdf-table' | 'excel'`
(dropped `'print'`), the `<option value="print">` and its `window.print()` branch in
`DownloadMenu` (`components/CalculatorWidget.tsx`) are gone. **Not reverted**: the `@media print`
CSS added in the third follow-up (`app/globals.css`'s dark-mode-on-paper fix, `.print-exact`,
page-break rules; `WidgetActions`'s `beforeprint`/`afterprint` title/theme handling) — a visitor
can always hit Ctrl+P natively regardless of whether the app exposes a button for it, so that CSS
still has defensive value and costs nothing to keep. `npm test` 1123/1123, lint clean,
`npx tsc --noEmit` clean, `npm run build` passes. Verified live in Chrome: the download dropdown
now shows exactly `PDF` / `PDF with table` (when a schedule exists) / `Excel`, no `Print` entry.
