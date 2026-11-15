// PDF export (UX-09). jsPDF + jspdf-autotable are dynamically imported here, inside each
// function — never at module top level — so they code-split into their own chunk and only load
// when a visitor actually clicks download, not on every calculator page's initial bundle.
// Layout follows a design reviewed with Opus (see mdFiles/steps/ux-09-download-export.md,
// "Second follow-up: PDF + Print redesign"): top-down full-width blocks (never inputs-beside-
// chart — two cards of different heights leave a ragged hole), a tinted KPI band instead of a
// bordered card, the chart's legend as a data table beside it, and a full-width schedule table
// with no header fill.
import { formatByKind, type ExportPayload } from '@/lib/export';
import { resolveChart } from '@/lib/exportChart';
// Type-only import — erased at compile time, so this doesn't pull jsPDF into the page bundle.
import type { jsPDF as JsPDF } from 'jspdf';

const MARGIN = 18;
const ROW_HEIGHT = 7;

// Shared palette (mdFiles/steps/ux-09-download-export.md has the rationale for each token —
// in short, no large solid fills and no text lighter than ink-2 survive a cheap printer).
const INK: [number, number, number] = [15, 23, 42];
const INK_2: [number, number, number] = [71, 85, 105];
const RULE: [number, number, number] = [203, 213, 225];
const RULE_SOFT: [number, number, number] = [226, 232, 240];
const BRAND: [number, number, number] = [0, 102, 204];
const TINT: [number, number, number] = [243, 247, 252];
const ZEBRA: [number, number, number] = [244, 246, 249];
const WHITE: [number, number, number] = [255, 255, 255];
const HEADER_TEXT: [number, number, number] = [51, 65, 85];

function setCharSpace0(doc: JsPDF) {
  // Character spacing persists on the doc until reset — always clear it right after an
  // uppercase-tracked label, or it bleeds into the next text drawn.
  doc.setCharSpace(0);
}

function drawMasthead(doc: JsPDF, pageWidth: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text('Daily Calculations', MARGIN, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...INK_2);
  doc.text('dailycalculations.com', pageWidth - MARGIN, 16, { align: 'right' });
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.26);
  doc.line(MARGIN, 19, pageWidth - MARGIN, 19);
}

// A slim running header on every page after page 1 — context for a reader flipping through a
// long schedule, without repeating "continued" text or carried-forward totals.
function drawRunningHeader(doc: JsPDF, pageWidth: number, title: string) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...INK_2);
  doc.text(`Daily Calculations · ${title}`, MARGIN, 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND);
  doc.text('Daily Calculations', pageWidth - MARGIN, 14, { align: 'right' });
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.18);
  doc.line(MARGIN, 17, pageWidth - MARGIN, 17);
}

function drawFooter(doc: JsPDF, pageWidth: number, pageHeight: number, title: string, url: string) {
  const page = doc.getCurrentPageInfo().pageNumber;
  const total = doc.getNumberOfPages();
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.18);
  doc.line(MARGIN, pageHeight - 15, pageWidth - MARGIN, pageHeight - 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...INK_2);
  doc.text(`Daily Calculations · ${title}`, MARGIN, pageHeight - 11);
  doc.text(`Page ${page} of ${total}`, pageWidth - MARGIN, pageHeight - 11, { align: 'right' });
  const date = new Date();
  const generated = date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  if (url) {
    doc.setTextColor(...BRAND);
    doc.textWithLink(`Generated ${generated} · ${url.replace(/^https?:\/\//, '')}`, MARGIN, pageHeight - 7.5, { url });
  } else {
    doc.text(`Generated ${generated}`, MARGIN, pageHeight - 7.5);
  }
}

function sectionLabel(doc: JsPDF, text: string, x: number, y: number, width: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_2);
  doc.setCharSpace(0.4);
  doc.text(text.toUpperCase(), x, y);
  setCharSpace0(doc);
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.18);
  doc.line(x, y + 2, x + width, y + 2);
}

/** Flowed into up to 2 columns (column-major, so reading order stays top-to-bottom then across). */
function drawInputsList(doc: JsPDF, rows: ExportPayload['inputs'], x: number, width: number, y: number): number {
  const columns = rows.length > 3 ? 2 : 1;
  const colWidth = columns === 2 ? (width - 10) / 2 : width;
  const perColumn = Math.ceil(rows.length / columns);
  let maxY = y;
  for (let col = 0; col < columns; col++) {
    let rowY = y;
    const colX = x + col * (colWidth + 10);
    for (let i = col * perColumn; i < Math.min((col + 1) * perColumn, rows.length); i++) {
      const row = rows[i];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...INK_2);
      doc.text(row.label, colX, rowY);
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(row.value, colX + colWidth, rowY, { align: 'right' });
      doc.setDrawColor(...RULE_SOFT);
      doc.setLineWidth(0.18);
      doc.line(colX, rowY + 2, colX + colWidth, rowY + 2);
      rowY += ROW_HEIGHT;
    }
    maxY = Math.max(maxY, rowY);
  }
  return maxY;
}

/** Shrinks font size until `text` fits `maxWidth`, down to `min`. */
function shrinkToFit(doc: JsPDF, text: string, size: number, min: number, maxWidth: number): number {
  doc.setFontSize(size);
  while (size > min && doc.getTextWidth(text) > maxWidth) {
    size -= 2;
    doc.setFontSize(size);
  }
  return size;
}

// The headline result: a tinted band with a brand accent bar, the number in near-black ink
// (blue goes gray and loses weight on a grayscale printer), and up to 3 secondary figures in
// cells to its right.
function drawKpiBand(doc: JsPDF, payload: ExportPayload, x: number, width: number, y: number): number {
  const height = 30;
  doc.setFillColor(...TINT);
  doc.rect(x, y, width, height, 'F');
  doc.setFillColor(...BRAND);
  doc.rect(x, y, 1.5, height, 'F');

  const leftWidth = width * 0.42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND);
  doc.setCharSpace(0.4);
  doc.text(payload.result.label.toUpperCase(), x + 6, y + 9);
  setCharSpace0(doc);
  doc.setTextColor(...INK);
  const size = shrinkToFit(doc, payload.result.value, 26, 18, leftWidth - 10);
  doc.setFontSize(size);
  doc.text(payload.result.value, x + 6, y + 22);

  const secondary = payload.outputs.slice(0, 3);
  if (secondary.length) {
    const rightX = x + leftWidth;
    const rightWidth = width - leftWidth;
    const cellWidth = rightWidth / 3;
    secondary.forEach((output, index) => {
      const cellX = rightX + index * cellWidth;
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.18);
      doc.line(cellX, y + 6, cellX, y + 24);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...INK_2);
      doc.setCharSpace(0.3);
      const label = doc.splitTextToSize(output.label.toUpperCase(), cellWidth - 6)[0] ?? output.label.toUpperCase();
      doc.text(label, cellX + 4, y + 11);
      setCharSpace0(doc);
      doc.setTextColor(...INK);
      const valueSize = shrinkToFit(doc, output.value, 12, 9, cellWidth - 6);
      doc.setFontSize(valueSize);
      doc.text(output.value, cellX + 4, y + 20);
    });
  }

  return y + height;
}

// Donut (or whichever visual) on the left, its legend as a swatch/label/amount/% table on the
// right, with a Total row when the legend's figures are real numbers.
async function drawBreakdown(doc: JsPDF, chart: NonNullable<Awaited<ReturnType<typeof resolveChart>>>, x: number, width: number, y: number): Promise<number> {
  const imgSize = 44;
  const imgAspected = imgSize * chart.aspect;
  doc.addImage(chart.dataUrl, 'PNG', x, y, imgSize, imgAspected);

  const numeric = chart.legend.filter((item) => item.value !== null);
  const legendX = x + imgSize + 12;
  const legendWidth = Math.min(width - imgSize - 12, 100);

  if (numeric.length) {
    const total = numeric.reduce((sum, item) => sum + (item.value ?? 0), 0);
    let rowY = y + 3;
    const amountColWidth = 28;
    const pctColWidth = 14;
    const labelColWidth = legendWidth - amountColWidth - pctColWidth - 6;
    for (const item of numeric) {
      const value = item.value as number;
      doc.setFillColor(...item.color);
      doc.roundedRect(legendX, rowY - 2.6, 3, 3, 0.5, 0.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      const labelLines = doc.splitTextToSize(item.label, labelColWidth - 6);
      doc.text(labelLines[0] ?? item.label, legendX + 5.5, rowY);
      doc.text(formatByKind(value, 'currency'), legendX + 5.5 + labelColWidth + amountColWidth, rowY, { align: 'right' });
      doc.setTextColor(...INK_2);
      const share = total > 0 ? (value / total) * 100 : 0;
      doc.text(`${share.toFixed(1)}%`, legendX + 5.5 + labelColWidth + amountColWidth + pctColWidth, rowY, { align: 'right' });
      doc.setDrawColor(...RULE_SOFT);
      doc.setLineWidth(0.18);
      doc.line(legendX, rowY + 2.2, legendX + legendWidth, rowY + 2.2);
      rowY += 7;
    }
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.26);
    doc.line(legendX, rowY - 4.5, legendX + legendWidth, rowY - 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text('Total', legendX + 5.5, rowY);
    doc.text(formatByKind(total, 'currency'), legendX + 5.5 + labelColWidth + amountColWidth, rowY, { align: 'right' });
    doc.text('100.0%', legendX + 5.5 + labelColWidth + amountColWidth + pctColWidth, rowY, { align: 'right' });
    return Math.max(y + imgAspected, rowY + 4);
  }

  if (chart.caption) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...INK_2);
    const lines = doc.splitTextToSize(chart.caption, legendWidth);
    let lineY = y + 4;
    for (const line of lines) {
      doc.text(line, legendX, lineY);
      lineY += 3.8;
    }
    return Math.max(y + imgAspected, lineY);
  }

  return y + imgAspected;
}

// Masthead, title, meta line, KPI band, inputs, breakdown, notes — top-down, full width.
// Shared by both PDF variants; returns the y-position to continue writing from.
async function writeSummary(doc: JsPDF, payload: ExportPayload): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;
  drawMasthead(doc, pageWidth);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(payload.title, MARGIN, 30);

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...INK_2);
  doc.text(`Results summary · Generated ${date}`, MARGIN, 36);

  let y = drawKpiBand(doc, payload, MARGIN, contentWidth, 42) + 12;

  if (payload.inputs.length) {
    sectionLabel(doc, 'Inputs', MARGIN, y, contentWidth);
    y = drawInputsList(doc, payload.inputs, MARGIN, contentWidth, y + 8) + 6;
  }

  const chart = await resolveChart(payload.chartSelector);
  if (chart) {
    sectionLabel(doc, 'Breakdown', MARGIN, y, contentWidth);
    y = (await drawBreakdown(doc, chart, MARGIN, contentWidth, y + 8)) + 6;
  }

  if (payload.url) {
    sectionLabel(doc, 'Notes', MARGIN, y, contentWidth);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...INK_2);
    doc.text('Estimates for informational purposes only; not financial, tax or legal advice.', MARGIN, y);
    y += 5;
    doc.text('Recalculate or adjust these inputs:', MARGIN, y);
    doc.setTextColor(...BRAND);
    doc.textWithLink(payload.url, MARGIN + 45, y, { url: payload.url });
    y += 8;
  }

  return y;
}

function filename(calculatorId: string, suffix: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `dailycalculations-${calculatorId}-${date}${suffix}.pdf`;
}

function setDocumentMetadata(doc: JsPDF, payload: ExportPayload) {
  doc.setProperties({
    title: `${payload.title} — Results`,
    subject: `${payload.result.label}: ${payload.result.value}`,
    author: 'Daily Calculations',
    creator: 'dailycalculations.com',
    keywords: payload.title
  });
}

/** KPI band + inputs + breakdown + notes. Never includes payload.table. */
export async function downloadSummaryPdf(calculatorId: string, payload: ExportPayload) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ compress: true, putOnlyUsedFonts: true });
  setDocumentMetadata(doc, payload);
  await writeSummary(doc, payload);
  drawFooter(doc, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), payload.title, payload.url);
  doc.save(filename(calculatorId, '-result'));
}

/** Everything downloadSummaryPdf does, plus the full schedule — always starting on its own page,
 * full content width, with no header fill (a solid blue bar prints as muddy gray and costs toner). */
export async function downloadFullPdf(calculatorId: string, payload: ExportPayload) {
  if (!payload.table) return;
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ compress: true, putOnlyUsedFonts: true });
  setDocumentMetadata(doc, payload);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  await writeSummary(doc, payload);

  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text('Full schedule', MARGIN, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_2);
  doc.text(`${payload.title} · ${payload.table.rows.length} rows`, MARGIN, 36);

  const kinds = payload.table.columns.map((col) => col.kind);
  // payload.table.rows are raw numbers (so Excel can store real numbers) — the PDF formats each
  // one for display here, by its column's kind, rather than printing an unformatted "1166.67".
  const formattedRows = payload.table.rows.map((row) => row.map((value, index) => formatByKind(value, kinds[index])));
  const periodColumn = payload.table.columns[0]?.header.toLowerCase() === 'month' || payload.table.columns[0]?.kind === 'integer';

  autoTable(doc, {
    startY: 42,
    margin: { top: 20, bottom: 20, left: MARGIN, right: MARGIN },
    theme: 'plain',
    tableWidth: 'auto',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: INK,
      lineWidth: 0,
      cellPadding: { top: 1.1, bottom: 1.1, left: 2, right: 2 },
      valign: 'middle',
      overflow: 'linebreak'
    },
    head: [payload.table.columns.map((col) => col.header)],
    body: formattedRows,
    columnStyles: periodColumn ? { 0: { cellWidth: 16, halign: 'right' } } : undefined,
    headStyles: {
      fontStyle: 'bold',
      fontSize: 7.5,
      textColor: HEADER_TEXT,
      fillColor: false,
      valign: 'bottom',
      halign: 'right',
      lineWidth: { bottom: 0.26 },
      lineColor: INK
    },
    bodyStyles: { halign: 'right' },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index % 2 === 1) {
        data.cell.styles.fillColor = ZEBRA;
      }
    },
    didDrawPage: (data) => {
      // The schedule's own first page already has "Full schedule" + the meta line drawn above
      // (writeSummary's masthead covers page 1); every page after that gets the slim running
      // header instead, so context survives a long, flipped-through printout.
      if (data.pageNumber > 1) drawRunningHeader(doc, pageWidth, payload.title);
    }
  });

  // Footers are stamped in a second pass, after the table has finished adding pages — the total
  // page count isn't known yet inside didDrawPage, so "Page X of Y" would show the wrong Y there.
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    drawFooter(doc, pageWidth, pageHeight, payload.title, payload.url);
  }
  doc.save(filename(calculatorId, '-schedule'));
}
