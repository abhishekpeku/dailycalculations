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

Add a `@media print` block to `app/globals.css`: hide `header`, `footer`, the breadcrumb, the
"Related calculators" block, any ad slot, and the categories dropdown/mobile menu; show only the
page's `<h1>`, the calculator widget, and the result. Keep it simple — this doesn't need a
dedicated print-only layout component, just visibility rules keyed off existing component class
names/structure (read `app/[locale]/calculators/[slug]/page.tsx` to see what wraps what before
writing the selectors). `window.print()` is the trigger, no new component needed for "Print" itself.

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

## Progress

- [ ] Step file written, branch created
- [ ] `jspdf` + `jspdf-autotable` added, noted in STATUS.md
- [ ] `lib/export.ts` (payload type + `exportTableForVisual`)
- [ ] `lib/exportCsv.ts`
- [ ] `lib/exportPdf.ts` (summary + full variants, chart rasterization)
- [ ] `WidgetActions` / `DownloadMenu` wired in `CalculatorWidget.tsx`
- [ ] `SolverCalculator.tsx` builds and passes `exportData`
- [ ] `BreakdownCalculator.tsx` builds and passes `exportData`
- [ ] Print stylesheet in `app/globals.css`
- [ ] `npm test` / `npm run lint` / `npm run build` all pass
- [ ] Manual verification across the 4 calculator types above
- [ ] STATUS.md updated (including the new-dependency note), PR opened
