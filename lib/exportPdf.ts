// PDF export (UX-09). jsPDF + jspdf-autotable are dynamically imported here, inside each
// function — never at module top level — so they code-split into their own chunk and only load
// when a visitor actually clicks download, not on every calculator page's initial bundle.
// See mdFiles/steps/ux-09-download-export.md.
import type { ExportPayload } from '@/lib/export';
// Type-only import — erased at compile time, so this doesn't pull jsPDF into the page bundle.
import type { jsPDF as JsPDF } from 'jspdf';

const MARGIN = 14;
const BAND_HEIGHT = 14;
const CARD_GAP = 6;
const CARD_RADIUS = 3;
const CARD_PADDING = 6;
const ROW_HEIGHT = 6.5;

// The site's own brand palette (lib/categoryTheme.ts's brand blue, Tailwind's slate scale) —
// reused here so a downloaded PDF reads as the same product as the page it came from.
const ACCENT: [number, number, number] = [0, 102, 204];
const ACCENT_TINT: [number, number, number] = [235, 244, 255];
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_200: [number, number, number] = [226, 232, 240];
const WHITE: [number, number, number] = [255, 255, 255];

// Rasterizes a live <svg> into a PNG data URL for embedding in the PDF. Not every visual is an
// SVG (AmortizationTable/Timeline render HTML) — callers only invoke this once they've confirmed
// a real <svg> element exists. Throws on failure; callers catch and skip the image rather than
// block the whole download over a missing chart.
async function svgToPngDataUrl(svg: SVGSVGElement): Promise<string> {
  const xml = new XMLSerializer().serializeToString(svg);
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('svg failed to rasterize'));
    img.src = svgDataUrl;
  });
  const scale = 2; // crisper than 1:1 in the PDF
  const width = (svg.clientWidth || img.width || 400) * scale;
  const height = (svg.clientHeight || img.height || 200) * scale;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, svg.clientWidth || img.width, svg.clientHeight || img.height);
  return canvas.toDataURL('image/png');
}

// The brand band every page opens with: a solid accent bar, the wordmark, and the domain.
function drawBrandBand(doc: JsPDF, pageWidth: number) {
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageWidth, BAND_HEIGHT, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...WHITE);
  doc.text('Daily Calculations', MARGIN, BAND_HEIGHT / 2 + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('dailycalculations.com', pageWidth - MARGIN, BAND_HEIGHT / 2 + 3.5, { align: 'right' });
}

// A light gray footer stamped on every page: download date + page number.
function drawFooter(doc: JsPDF, pageWidth: number, pageHeight: number) {
  const page = doc.getCurrentPageInfo().pageNumber;
  const total = doc.getNumberOfPages();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_500);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.text(`Downloaded ${date} from dailycalculations.com`, MARGIN, pageHeight - 8);
  doc.text(`Page ${page} of ${total}`, pageWidth - MARGIN, pageHeight - 8, { align: 'right' });
}

// A rounded-corner card: a plain bordered box, or (with fill) a tinted+bordered one.
function drawCard(doc: JsPDF, x: number, y: number, w: number, h: number, fill?: [number, number, number], border: [number, number, number] = SLATE_200) {
  doc.setDrawColor(...border);
  doc.setLineWidth(fill ? 0.5 : 0.35);
  if (fill) {
    doc.setFillColor(...fill);
    doc.roundedRect(x, y, w, h, CARD_RADIUS, CARD_RADIUS, 'FD');
  } else {
    doc.roundedRect(x, y, w, h, CARD_RADIUS, CARD_RADIUS, 'S');
  }
}

function drawSectionLabel(doc: JsPDF, text: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.text(text.toUpperCase(), x, y);
}

function drawRows(doc: JsPDF, rows: ExportPayload['inputs'], x: number, width: number, y: number): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (const row of rows) {
    doc.setTextColor(...SLATE_500);
    doc.text(row.label, x, y);
    doc.setTextColor(...SLATE_900);
    doc.text(row.value, x + width, y, { align: 'right' });
    y += ROW_HEIGHT;
  }
  return y;
}

// Brand band, title, url, then a two-column row (inputs card | chart card — whichever exist; a
// missing chart gives the inputs card the full width rather than leaving an empty box), then the
// result as its own highlighted card with its supporting outputs as the "explanation" beneath the
// headline. Shared by both PDF variants; returns the y-position to continue writing from.
async function writeSummary(doc: JsPDF, payload: ExportPayload): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;
  drawBrandBand(doc, pageWidth);
  let y = BAND_HEIGHT + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...SLATE_900);
  doc.text(payload.title, MARGIN, y);
  y += 7;

  if (payload.url) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...ACCENT);
    doc.textWithLink(payload.url, MARGIN, y, { url: payload.url });
  }
  y += 10;

  // Resolve the chart image up front so we know whether to lay out one column or two. Every
  // visual component already carries a complete, human-readable summary in an `aria-label` (on
  // the <svg> itself for Donut, on a wrapping [role="img"] div for the others) — built for screen
  // readers, and just as useful here as a caption explaining what the chart shows.
  let chartDataUrl: string | null = null;
  let chartAspect = 1;
  let chartCaption: string | null = null;
  if (payload.chartSelector) {
    const svg = document.querySelector<SVGSVGElement>(`${payload.chartSelector} svg`);
    const labeled = document.querySelector<HTMLElement>(`${payload.chartSelector} [aria-label]`);
    chartCaption = labeled?.getAttribute('aria-label') ?? null;
    if (svg) {
      try {
        chartDataUrl = await svgToPngDataUrl(svg);
        chartAspect = (svg.clientHeight || 1) / (svg.clientWidth || 1);
      } catch {
        chartDataUrl = null; // a missing/unrasterizable chart should never block the download
      }
    }
  }

  const hasInputs = payload.inputs.length > 0;
  const twoColumns = hasInputs && chartDataUrl;
  const colWidth = twoColumns ? (contentWidth - CARD_GAP) / 2 : contentWidth;
  const inputsCardHeight = hasInputs ? CARD_PADDING * 2 + 7 + payload.inputs.length * ROW_HEIGHT : 0;

  const CAPTION_LINE_HEIGHT = 3.6;
  let captionLines: string[] = [];
  if (chartDataUrl && chartCaption) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    captionLines = doc.splitTextToSize(chartCaption, colWidth - CARD_PADDING * 2);
  }
  const captionBlockHeight = captionLines.length ? captionLines.length * CAPTION_LINE_HEIGHT + 4 : 0;
  const CHART_HEADER = 14; // matches the inputs card's own label-to-first-row offset, for symmetry
  const CHART_MIN_IMAGE_HEIGHT = 40;
  const chartCardHeight = chartDataUrl ? Math.max(inputsCardHeight, CHART_HEADER + CHART_MIN_IMAGE_HEIGHT + captionBlockHeight + CARD_PADDING) : 0;
  const topRowHeight = Math.max(inputsCardHeight, chartCardHeight);

  if (hasInputs) {
    drawCard(doc, MARGIN, y, colWidth, topRowHeight);
    drawSectionLabel(doc, 'Inputs', MARGIN + CARD_PADDING, y + CARD_PADDING + 3);
    drawRows(doc, payload.inputs, MARGIN + CARD_PADDING, colWidth - CARD_PADDING * 2, y + CARD_PADDING + 14);
  }

  if (chartDataUrl) {
    const chartX = hasInputs ? MARGIN + colWidth + CARD_GAP : MARGIN;
    drawCard(doc, chartX, y, colWidth, topRowHeight);
    drawSectionLabel(doc, 'Chart', chartX + CARD_PADDING, y + CARD_PADDING + 3);

    const imgTop = y + CHART_HEADER;
    const availW = colWidth - CARD_PADDING * 2;
    const availH = y + topRowHeight - CARD_PADDING - captionBlockHeight - imgTop;
    let imgWidth = availW;
    let imgHeight = imgWidth * chartAspect;
    if (imgHeight > availH) {
      imgHeight = availH;
      imgWidth = imgHeight / chartAspect;
    }
    const imgX = chartX + (colWidth - imgWidth) / 2;
    const imgY = imgTop + Math.max(0, (availH - imgHeight) / 2);
    doc.addImage(chartDataUrl, 'PNG', imgX, imgY, imgWidth, imgHeight);

    if (captionLines.length) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_500);
      let capY = imgY + imgHeight + 5;
      for (const line of captionLines) {
        doc.text(line, chartX + colWidth / 2, capY, { align: 'center' });
        capY += CAPTION_LINE_HEIGHT;
      }
    }
  }

  if (topRowHeight > 0) y += topRowHeight + 8;

  // The result: a highlighted card (echoing the on-screen ResultPanel's accent wash), with the
  // supporting outputs listed underneath the headline as its explanation.
  const resultCardHeight = CARD_PADDING * 2 + 18 + (payload.outputs.length ? payload.outputs.length * ROW_HEIGHT + 4 : 0);
  drawCard(doc, MARGIN, y, contentWidth, resultCardHeight, ACCENT_TINT, ACCENT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.text(payload.result.label.toUpperCase(), MARGIN + CARD_PADDING, y + CARD_PADDING + 2);
  doc.setFontSize(17);
  doc.text(payload.result.value, MARGIN + CARD_PADDING, y + CARD_PADDING + 11);
  if (payload.outputs.length) {
    drawRows(doc, payload.outputs, MARGIN + CARD_PADDING, contentWidth - CARD_PADDING * 2, y + CARD_PADDING + 11 + 7);
  }
  y += resultCardHeight + 9;

  return y;
}

/** Inputs/chart row + the result card. Never includes payload.table. */
export async function downloadSummaryPdf(calculatorId: string, payload: ExportPayload) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  await writeSummary(doc, payload);
  drawFooter(doc, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
  doc.save(`${calculatorId}-result.pdf`);
}

/** Everything downloadSummaryPdf does, plus the full schedule, sized to its own content — not
 * stretched edge-to-edge — with a full grid of borders for a clean, bordered-table look. */
export async function downloadFullPdf(calculatorId: string, payload: ExportPayload) {
  if (!payload.table) return;
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = await writeSummary(doc, payload);

  drawSectionLabel(doc, 'Schedule', MARGIN, y);

  // A sensible width per column rather than stretching across the full page margin-to-margin —
  // a 4-column numeric table doesn't need 180mm to be readable.
  const tableWidth = Math.min(pageWidth - MARGIN * 2, payload.table.columns.length * 34);
  const sideMargin = (pageWidth - tableWidth) / 2;

  autoTable(doc, {
    startY: y + 6,
    head: [payload.table.columns],
    body: payload.table.rows,
    theme: 'grid',
    tableWidth,
    margin: { left: sideMargin, right: sideMargin, top: BAND_HEIGHT + 6, bottom: 14 },
    styles: { fontSize: 9, textColor: SLATE_900, lineColor: SLATE_200, lineWidth: 0.2 },
    headStyles: { fillColor: ACCENT, textColor: WHITE, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    // Every page after the first (the summary already drew its own band on page 1) still gets the
    // brand band, so a reader flipping through a long schedule never loses context.
    didDrawPage: (data) => {
      if (data.pageNumber > 1) drawBrandBand(doc, pageWidth);
    }
  });

  // Footers are stamped in a second pass, after the table has finished adding pages — the total
  // page count isn't known yet inside didDrawPage, so "Page X of Y" would show the wrong Y there.
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    drawFooter(doc, pageWidth, pageHeight);
  }
  doc.save(`${calculatorId}-schedule.pdf`);
}
