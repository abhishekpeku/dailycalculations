// Excel export (UX-09) — a corporate-grade formatted workbook, replacing the earlier plain-CSV
// option. Design follows a full spec reviewed with Opus (see mdFiles/steps/ux-09-download-export.md
// for the "Second follow-up: Excel redesign" section — two sheets, real typed numbers with Excel
// number formats, a native Excel Table with freeze panes + conditional-format zebra striping, a
// KPI card, a colored legend with real slice colors, and proper workbook/page setup). exceljs is
// dynamically imported here, inside the function — never at module top level — so it code-splits
// into its own chunk and only loads on click.
import { formatByKind, numFmtForKind, type ExportPayload, type ExportRow } from '@/lib/export';
import { resolveChart } from '@/lib/exportChart';
import type ExcelJS from 'exceljs';

const ACCENT = 'FF0066CC';
const ACCENT_DARK = 'FF004C99';
const ACCENT_TINT = 'FFE8F1FB';
const INK = 'FF111827';
const BODY = 'FF1F2937';
const LABEL = 'FF4B5563';
const MUTED = 'FF6B7280';
const RULE_LIGHT = 'FFE5E7EB';
const RULE_MID = 'FFD1D5DB';
const TOTAL_RULE = 'FF374151';
const ZEBRA = 'FFF5F8FC';
const WHITE = 'FFFFFFFF';
const FONT = 'Calibri';
const CURRENCY_FMT = numFmtForKind('currency') as string;
const PERCENT_SHARE_FMT = '0.0%';

// Left band (B:C) = labels/values; D is a hard wall (never written to); right band (E:H) = chart
// + legend. This separation is the direct fix for the original bug, where both sections wrote to
// column A and the chart image overlapped the input values.
const L_LABEL = 2;
const L_VALUE = 3;
const R_SWATCH = 5;
const R_TEXT = 6;
const R_AMOUNT = 7;
const R_SHARE = 8;
const LAST_COL = 9;

const thin = (color: string) => ({ style: 'thin' as const, color: { argb: color } });
const medium = (color: string) => ({ style: 'medium' as const, color: { argb: color } });
const double = (color: string) => ({ style: 'double' as const, color: { argb: color } });

function fillRange(ws: ExcelJS.Worksheet, r1: number, c1: number, r2: number, c2: number, color: string) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      ws.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    }
  }
}

function borderRange(ws: ExcelJS.Worksheet, r1: number, c1: number, r2: number, c2: number, color: string, style: Partial<ExcelJS.Border> = thin(color)) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = ws.getCell(r, c);
      const border: Partial<ExcelJS.Borders> = { ...cell.border };
      if (r === r1) border.top = style;
      if (r === r2) border.bottom = style;
      if (c === c1) border.left = style;
      if (c === c2) border.right = style;
      cell.border = border as ExcelJS.Borders;
    }
  }
}

function sectionHeader(ws: ExcelJS.Worksheet, row: number, c1: number, c2: number, text: string) {
  const cell = ws.getCell(row, c1);
  cell.value = text;
  cell.font = { name: FONT, bold: true, size: 11, color: { argb: BODY } };
  for (let c = c1; c <= c2; c++) ws.getCell(row, c).border = { bottom: medium(ACCENT) };
}

/** A real number in `raw`+`kind` when present; otherwise the plain display string as text. */
function writeTyped(cell: ExcelJS.Cell, row: ExportRow) {
  if (row.raw !== undefined && row.kind) {
    if (!Number.isFinite(row.raw)) {
      cell.value = 'n/a';
      cell.font = { name: FONT, italic: true, color: { argb: MUTED } };
      return;
    }
    cell.value = row.raw;
    const fmt = numFmtForKind(row.kind);
    if (fmt) cell.numFmt = fmt;
  } else {
    cell.value = row.value;
  }
}

/** label (left-aligned, indented) | value (typed, right-aligned) rows. Returns the row after. */
function keyValueRows(ws: ExcelJS.Worksheet, startRow: number, labelCol: number, valueCol: number, rows: ExportRow[]): number {
  let row = startRow;
  for (const item of rows) {
    const labelCell = ws.getCell(row, labelCol);
    labelCell.value = item.label;
    labelCell.font = { name: FONT, size: 10, color: { argb: LABEL } };
    labelCell.alignment = { indent: 1, vertical: 'middle' };
    const valueCell = ws.getCell(row, valueCol);
    writeTyped(valueCell, item);
    valueCell.font = { name: FONT, size: 10, color: { argb: BODY } };
    valueCell.alignment = { horizontal: 'right', indent: 1 };
    ws.getCell(row, labelCol).border = { bottom: thin(RULE_LIGHT) };
    ws.getCell(row, valueCol).border = { bottom: thin(RULE_LIGHT) };
    row++;
  }
  return row;
}

function brandHeader(ws: ExcelJS.Worksheet, title: string, url: string) {
  ws.getRow(1).height = 5;
  fillRange(ws, 1, 1, 1, LAST_COL, ACCENT);

  ws.getRow(2).height = 20;
  const brandCell = ws.getCell(2, L_LABEL);
  brandCell.value = 'Daily Calculations';
  brandCell.font = { name: FONT, bold: true, size: 10, color: { argb: ACCENT } };
  ws.mergeCells(2, R_AMOUNT, 2, R_SHARE);
  const generated = ws.getCell(2, R_AMOUNT);
  generated.value = `Generated ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
  generated.font = { name: FONT, size: 9, color: { argb: MUTED } };
  generated.alignment = { horizontal: 'right' };

  ws.getRow(3).height = 30;
  ws.mergeCells(3, L_LABEL, 3, R_SHARE);
  const titleCell = ws.getCell(3, L_LABEL);
  titleCell.value = title;
  titleCell.font = { name: FONT, bold: true, size: 18, color: { argb: INK } };
  titleCell.alignment = { vertical: 'middle' };

  if (url) {
    ws.getRow(4).height = 18;
    ws.mergeCells(4, L_LABEL, 4, R_SHARE);
    const linkCell = ws.getCell(4, L_LABEL);
    linkCell.value = { text: 'View this calculation online ›', hyperlink: url };
    linkCell.font = { name: FONT, size: 9, color: { argb: ACCENT }, underline: true };
    ws.getCell(4, L_LABEL).border = { bottom: thin(RULE_LIGHT) };
    for (let c = L_LABEL; c <= R_SHARE; c++) ws.getCell(4, c).border = { bottom: thin(RULE_LIGHT) };
  }
}

async function buildSummarySheet(workbook: ExcelJS.Workbook, payload: ExportPayload) {
  const ws = workbook.addWorksheet('Summary', {
    properties: { tabColor: { argb: ACCENT } },
    views: [{ showGridLines: false, zoomScale: 100 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } as ExcelJS.Margins }
  });
  ws.columns = [{ width: 2 }, { width: 32 }, { width: 20 }, { width: 4 }, { width: 4 }, { width: 24 }, { width: 16 }, { width: 10 }, { width: 2 }];
  ws.headerFooter.oddFooter = '&L&8Daily Calculations · dailycalculations.com&R&8Page &P of &N';

  brandHeader(ws, payload.title, payload.url);

  const topRow = 6;
  const chart = await resolveChart(payload.chartSelector);

  // Left band: Result, then Key figures, then Inputs — the answer first, assumptions after.
  sectionHeader(ws, topRow, L_LABEL, L_VALUE, 'Result');
  const kpiLabelRow = topRow + 1;
  const kpiValueRow = topRow + 2;
  ws.getCell(kpiLabelRow, L_LABEL).value = payload.result.label.toUpperCase();
  ws.getCell(kpiLabelRow, L_LABEL).font = { name: FONT, bold: true, size: 9, color: { argb: ACCENT } };
  ws.mergeCells(kpiValueRow, L_LABEL, kpiValueRow, L_VALUE);
  const kpiCell = ws.getCell(kpiValueRow, L_LABEL);
  writeTyped(kpiCell, payload.result);
  kpiCell.font = { name: FONT, bold: true, size: 20, color: { argb: ACCENT_DARK } };
  kpiCell.alignment = { vertical: 'middle', indent: 1 };
  fillRange(ws, kpiLabelRow, L_LABEL, kpiValueRow, L_VALUE, ACCENT_TINT);
  borderRange(ws, kpiLabelRow, L_LABEL, kpiValueRow, L_VALUE, ACCENT, { style: 'medium', color: { argb: ACCENT } });
  for (let r = kpiLabelRow; r <= kpiValueRow; r++) ws.getCell(r, L_LABEL).border = { ...ws.getCell(r, L_LABEL).border, left: { style: 'thick', color: { argb: ACCENT } } };

  let leftRow = kpiValueRow + 2;
  if (payload.outputs.length) {
    sectionHeader(ws, leftRow, L_LABEL, L_VALUE, 'Key figures');
    leftRow = keyValueRows(ws, leftRow + 1, L_LABEL, L_VALUE, payload.outputs) + 1;
  }
  if (payload.inputs.length) {
    sectionHeader(ws, leftRow, L_LABEL, L_VALUE, 'Inputs');
    leftRow = keyValueRows(ws, leftRow + 1, L_LABEL, L_VALUE, payload.inputs) + 1;
  }

  // Right band: chart image + its colored legend (or plain caption when there's no discrete legend).
  let rightRow = topRow;
  if (chart) {
    sectionHeader(ws, topRow, R_SWATCH, R_SHARE, 'Breakdown');
    const imageId = workbook.addImage({ base64: chart.dataUrl, extension: 'png' });
    const imgSizePx = 200;
    ws.addImage(imageId, {
      tl: { col: R_SWATCH - 1, row: topRow },
      ext: { width: imgSizePx, height: imgSizePx * chart.aspect },
      editAs: 'oneCell'
    });
    const imageRows = Math.max(6, Math.ceil((imgSizePx * chart.aspect) / 18));
    let row = topRow + 1 + imageRows;

    const numericLegend = chart.legend.filter((item) => item.value !== null);
    if (numericLegend.length) {
      const total = numericLegend.reduce((sum, item) => sum + (item.value ?? 0), 0);
      const headerRow = row;
      ws.getCell(headerRow, R_TEXT).value = 'Component';
      ws.getCell(headerRow, R_AMOUNT).value = 'Amount';
      ws.getCell(headerRow, R_SHARE).value = 'Share';
      for (const c of [R_TEXT, R_AMOUNT, R_SHARE]) {
        const cell = ws.getCell(headerRow, c);
        cell.font = { name: FONT, bold: true, size: 9, color: { argb: MUTED } };
        cell.alignment = { horizontal: c === R_TEXT ? 'left' : 'right' };
        cell.border = { bottom: thin(RULE_MID) };
      }
      row++;
      const legendStart = row;
      for (const item of numericLegend) {
        const value = item.value as number;
        const swatch = ws.getCell(row, R_SWATCH);
        swatch.value = '●';
        swatch.font = { name: FONT, size: 12, color: { argb: `FF${item.color.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()}` } };
        swatch.alignment = { horizontal: 'center' };
        const nameCell = ws.getCell(row, R_TEXT);
        nameCell.value = item.label;
        nameCell.font = { name: FONT, size: 10, color: { argb: BODY } };
        const amountCell = ws.getCell(row, R_AMOUNT);
        amountCell.value = value;
        amountCell.numFmt = CURRENCY_FMT;
        amountCell.font = { name: FONT, size: 10, color: { argb: BODY } };
        amountCell.alignment = { horizontal: 'right' };
        const shareCell = ws.getCell(row, R_SHARE);
        shareCell.value = total > 0 ? value / total : 0;
        shareCell.numFmt = PERCENT_SHARE_FMT;
        shareCell.font = { name: FONT, size: 10, color: { argb: BODY } };
        shareCell.alignment = { horizontal: 'right' };
        for (const c of [R_SWATCH, R_TEXT, R_AMOUNT, R_SHARE]) ws.getCell(row, c).border = { bottom: thin(RULE_LIGHT) };
        row++;
      }
      ws.getCell(row, R_TEXT).value = 'Total';
      ws.getCell(row, R_TEXT).font = { name: FONT, bold: true, size: 10, color: { argb: BODY } };
      const totalCell = ws.getCell(row, R_AMOUNT);
      totalCell.value = { formula: `SUM(${ws.getCell(legendStart, R_AMOUNT).address}:${ws.getCell(row - 1, R_AMOUNT).address})`, result: total };
      totalCell.numFmt = CURRENCY_FMT;
      totalCell.font = { name: FONT, bold: true, size: 10, color: { argb: BODY } };
      totalCell.alignment = { horizontal: 'right' };
      const totalShare = ws.getCell(row, R_SHARE);
      totalShare.value = 1;
      totalShare.numFmt = PERCENT_SHARE_FMT;
      totalShare.font = { name: FONT, bold: true, size: 10, color: { argb: BODY } };
      totalShare.alignment = { horizontal: 'right' };
      for (const c of [R_AMOUNT, R_SHARE]) {
        ws.getCell(row, c).border = { top: thin(TOTAL_RULE), bottom: double(TOTAL_RULE) };
      }
      row++;
    } else if (chart.legend.length) {
      // Legend rows exist but none parsed to a real number — list them as plain labelled text
      // rather than silently dropping them.
      for (const item of chart.legend) {
        const swatch = ws.getCell(row, R_SWATCH);
        swatch.value = '●';
        swatch.font = { name: FONT, size: 12, color: { argb: `FF${item.color.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()}` } };
        swatch.alignment = { horizontal: 'center' };
        ws.mergeCells(row, R_TEXT, row, R_SHARE);
        const textCell = ws.getCell(row, R_TEXT);
        textCell.value = item.text;
        textCell.font = { name: FONT, size: 10, color: { argb: BODY } };
        ws.getCell(row, R_SWATCH).border = { bottom: thin(RULE_LIGHT) };
        ws.getCell(row, R_TEXT).border = { bottom: thin(RULE_LIGHT) };
        row++;
      }
    } else if (chart.caption) {
      ws.mergeCells(row, R_SWATCH, row + 1, R_SHARE);
      const captionCell = ws.getCell(row, R_SWATCH);
      captionCell.value = chart.caption;
      captionCell.font = { name: FONT, italic: true, size: 9, color: { argb: MUTED } };
      captionCell.alignment = { wrapText: true, vertical: 'top' };
      ws.getRow(row).height = 30;
      row += 2;
    }
    rightRow = row;
    borderRange(ws, topRow, R_SWATCH, rightRow - 1, R_SHARE, RULE_LIGHT);
  }

  // Notes block, below whichever band ran longer.
  let row = Math.max(leftRow, rightRow) + 1;
  sectionHeader(ws, row, L_LABEL, R_SHARE, 'Notes');
  row++;
  ws.mergeCells(row, L_LABEL, row + 1, R_SHARE);
  const noteCell = ws.getCell(row, L_LABEL);
  noteCell.value = 'Estimates for informational purposes only; not financial, tax or legal advice. Figures are rounded to the cent.';
  noteCell.font = { name: FONT, italic: true, size: 9, color: { argb: MUTED } };
  noteCell.alignment = { wrapText: true, vertical: 'top' };
  ws.getRow(row).height = 15;
  row += 2;
  if (payload.table) {
    const linkCell = ws.getCell(row, L_LABEL);
    linkCell.value = { text: 'Full schedule ›', hyperlink: "#'Schedule'!A1" };
    linkCell.font = { name: FONT, size: 9, color: { argb: ACCENT }, underline: true };
    row++;
  }

  ws.pageSetup.printArea = chart ? `A1:I${row}` : `A1:D${row}`;
  return ws;
}

function buildScheduleSheet(workbook: ExcelJS.Workbook, payload: ExportPayload) {
  if (!payload.table) return;
  const ws = workbook.addWorksheet('Schedule', {
    properties: { tabColor: { argb: MUTED } },
    views: [{ state: 'frozen', ySplit: 4, topLeftCell: 'A5', activeCell: 'A5', showGridLines: true }],
    pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '4:4', margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } as ExcelJS.Margins }
  });
  ws.headerFooter.oddFooter = '&L&8Daily Calculations · dailycalculations.com&R&8Page &P of &N';

  const colCount = payload.table.columns.length;
  ws.columns = payload.table.columns.map((col, index) => ({ width: index === 0 ? 10 : 16 }));

  ws.getCell(1, 1).value = `${payload.title} — full schedule`;
  ws.getCell(1, 1).font = { name: FONT, bold: true, size: 13, color: { argb: INK } };
  ws.getCell(2, 1).value = `${payload.title} · ${payload.table.rows.length} rows · Amounts in USD`;
  ws.getCell(2, 1).font = { name: FONT, size: 9, color: { argb: MUTED } };

  const headerRow = 4;
  const table = ws.addTable({
    name: 'ScheduleTable',
    ref: `A${headerRow}`,
    headerRow: true,
    totalsRow: true,
    style: { theme: 'TableStyleLight1', showRowStripes: false },
    columns: payload.table.columns.map((col, index) => ({
      name: col.header,
      filterButton: true,
      totalsRowLabel: index === 0 ? 'Total' : undefined,
      totalsRowFunction: index === 0 ? undefined : col.kind === 'currency' ? 'sum' : 'none'
    })),
    rows: payload.table.rows
  });
  table.commit();

  // Style the native table's own cells — header row (brand fill, white bold text), body (typed
  // number formats, bottom hairline rule), and the totals row (bold, top+double-bottom rule).
  const lastDataRow = headerRow + payload.table.rows.length;
  const totalsRow = lastDataRow + 1;
  payload.table.columns.forEach((col, index) => {
    const c = index + 1;
    const headerCell = ws.getCell(headerRow, c);
    headerCell.font = { name: FONT, bold: true, size: 10, color: { argb: WHITE } };
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ACCENT } };
    headerCell.alignment = { horizontal: index === 0 ? 'center' : 'right', vertical: 'middle', wrapText: true };
    ws.getRow(headerRow).height = 24;

    for (let r = headerRow + 1; r <= lastDataRow; r++) {
      const cell = ws.getCell(r, c);
      cell.font = { name: FONT, size: 10, color: { argb: BODY } };
      cell.alignment = { horizontal: index === 0 ? 'center' : 'right' };
      const fmt = numFmtForKind(col.kind);
      if (fmt) cell.numFmt = fmt;
      cell.border = { bottom: thin(RULE_LIGHT) };
    }

    const totalsCell = ws.getCell(totalsRow, c);
    totalsCell.font = { name: FONT, bold: true, size: 10, color: { argb: BODY } };
    totalsCell.alignment = { horizontal: index === 0 ? 'center' : 'right' };
    if (index !== 0 && col.kind === 'currency') totalsCell.numFmt = CURRENCY_FMT;
    totalsCell.border = { top: thin(TOTAL_RULE), bottom: double(TOTAL_RULE) };
  });

  // Zebra striping via conditional formatting (not a static fill) so it survives sorting and
  // filtering — SUBTOTAL(3, …) counts only visible rows.
  const firstDataRow = headerRow + 1;
  ws.addConditionalFormatting({
    ref: `A${firstDataRow}:${ws.getCell(lastDataRow, colCount).address}`,
    rules: [
      {
        type: 'expression',
        priority: 1,
        formulae: [`MOD(SUBTOTAL(3,$A$${firstDataRow}:$A${firstDataRow}),2)=0`],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: ZEBRA } } }
      }
    ]
  });

  return ws;
}

export async function downloadExcel(calculatorId: string, payload: ExportPayload) {
  const ExcelJSModule = (await import('exceljs')).default;
  const workbook = new ExcelJSModule.Workbook();
  workbook.creator = 'Daily Calculations';
  workbook.lastModifiedBy = 'Daily Calculations';
  workbook.company = 'Daily Calculations';
  workbook.title = payload.title;
  workbook.subject = 'Calculation report';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  await buildSummarySheet(workbook, payload);
  buildScheduleSheet(workbook, payload);
  // Summary is added first, so it's already the sheet Excel opens to — no explicit view needed.

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().slice(0, 10);
  link.download = `dailycalculations-${calculatorId}-${date}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// formatByKind is re-exported for callers that need a quick display string from the same payload
// shape without pulling in the rest of this (dynamically-imported) module.
export { formatByKind };
