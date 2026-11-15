// Shared payload shape for the download/export feature (UX-09). Built by SolverCalculator /
// BreakdownCalculator from data they already have; consumed by lib/exportPdf.ts and
// lib/exportExcel.ts. See mdFiles/steps/ux-09-download-export.md for the design.
import type { BreakdownVisual } from '@/data/calculators';
import { amortizationMonthlySchedule } from '@/lib/amortization';
import { formatMoney, formatSignificant } from '@/lib/calculator';

// A row's real, typed value, alongside the same display string the page already shows (PDF just
// draws the string; Excel uses `raw`+`kind` to store a real number with a real number format —
// see lib/exportExcel.ts). `raw`/`kind` are optional so a row with nothing sensible to type (rare)
// still works everywhere, just as plain text in Excel too.
export type ExportKind = 'currency' | 'percent' | 'integer' | 'decimal' | 'text';
export type ExportRow = { label: string; value: string; raw?: number; kind?: ExportKind };
export type ExportTable = { columns: { header: string; kind: ExportKind }[]; rows: number[][] };
export type ExportPayload = {
  title: string;
  url: string;
  inputs: ExportRow[];
  result: ExportRow;
  outputs: ExportRow[];
  /** Present only when the visual is a schedule (today: just the amortization table). Raw numbers
   * only — never pre-formatted strings, so Excel can store real numbers with real number formats. */
  table?: ExportTable;
  /** CSS selector for the SVG chart to rasterize into the PDF, when one exists. */
  chartSelector?: string;
};

const money = formatMoney;

/** Excel's own number-format string for a given kind — see mdFiles/steps/ux-09-download-export.md. */
export function numFmtForKind(kind: ExportKind): string | undefined {
  switch (kind) {
    case 'currency':
      return '"$"#,##0.00_);[Red]("$"#,##0.00)';
    case 'percent':
      return '0.00%';
    case 'integer':
      return '#,##0';
    case 'decimal':
      return '#,##0.00';
    default:
      return undefined; // text — no number format
  }
}

/** The same figure, formatted for display (used by the PDF, which just draws text). */
export function formatByKind(value: number, kind: ExportKind): string {
  if (!Number.isFinite(value)) return 'n/a';
  switch (kind) {
    case 'currency':
      return money(value);
    case 'percent':
      return `${(value * 100).toFixed(2)}%`;
    case 'integer':
      return Math.round(value).toLocaleString('en-US');
    case 'decimal':
      return formatSignificant(value);
    default:
      return String(value);
  }
}

/**
 * The full schedule for the `amortization` visual, independent of whatever the on-screen
 * AmortizationTable is currently expanded to — a download always includes every row. Returns
 * undefined for every other visual type; not every result has a table worth exporting. Raw
 * numbers only (Month as a plain integer, the money columns in dollars) — formatting is the
 * caller's job (PDF formats for display; Excel sets a real number format on the cell).
 */
export function exportTableForVisual(visual: BreakdownVisual | undefined, all: Record<string, number>): ExportTable | undefined {
  if (!visual || visual.type !== 'amortization') return undefined;
  const principal = all[visual.principal];
  const annualRate = all[visual.annualRate];
  const months = all[visual.months];
  const payment = visual.payment === undefined ? undefined : all[visual.payment];
  const rows = amortizationMonthlySchedule(principal, annualRate, months, payment);
  if (!rows.length) return undefined;
  return {
    columns: [
      { header: 'Month', kind: 'integer' },
      { header: 'Interest', kind: 'currency' },
      { header: 'Principal', kind: 'currency' },
      { header: 'Balance', kind: 'currency' }
    ],
    rows: rows.map((row) => [row.month, row.interest, row.principal, row.balance])
  };
}
