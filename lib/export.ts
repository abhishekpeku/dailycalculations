// Shared payload shape for the download/export feature (UX-09). Built by SolverCalculator /
// BreakdownCalculator from data they already have; consumed by lib/exportCsv.ts and
// lib/exportPdf.ts. See mdFiles/steps/ux-09-download-export.md for the design.
import type { BreakdownVisual } from '@/data/calculators';
import { amortizationMonthlySchedule } from '@/lib/amortization';
import { formatMoney } from '@/lib/calculator';

export type ExportRow = { label: string; value: string };
export type ExportTable = { columns: string[]; rows: (string | number)[][] };
export type ExportPayload = {
  title: string;
  url: string;
  inputs: ExportRow[];
  result: ExportRow;
  outputs: ExportRow[];
  /** Present only when the visual is a schedule (today: just the amortization table). */
  table?: ExportTable;
  /** CSS selector for the SVG chart to rasterize into the PDF, when one exists. */
  chartSelector?: string;
};

const money = formatMoney;

/**
 * The full schedule for the `amortization` visual, independent of whatever the on-screen
 * AmortizationTable is currently expanded to — a download always includes every row. Returns
 * undefined for every other visual type; not every result has a table worth exporting.
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
    columns: ['Month', 'Interest', 'Principal', 'Balance'],
    rows: rows.map((row) => [row.month, money(row.interest), money(row.principal), money(row.balance)])
  };
}
