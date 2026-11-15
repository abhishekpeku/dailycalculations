// PDF export (UX-09). jsPDF + jspdf-autotable are dynamically imported here, inside each
// function — never at module top level — so they code-split into their own chunk and only load
// when a visitor actually clicks download, not on every calculator page's initial bundle.
// See mdFiles/steps/ux-09-download-export.md.
import type { ExportPayload } from '@/lib/export';
// Type-only import — erased at compile time, so this doesn't pull jsPDF into the page bundle.
import type { jsPDF as JsPDF } from 'jspdf';

const MARGIN = 14;
const BAND_HEIGHT = 14;

// The site's own brand palette (lib/categoryTheme.ts's brand blue, Tailwind's slate scale) —
// reused here so a downloaded PDF reads as the same product as the page it came from.
const ACCENT: [number, number, number] = [0, 102, 204];
const ACCENT_TINT: [number, number, number] = [235, 244, 255];
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_200: [number, number, number] = [226, 232, 240];

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
  doc.setTextColor(255, 255, 255);
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

function labelValueRows(doc: JsPDF, rows: ExportPayload['inputs'], pageWidth: number, y: number): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (const row of rows) {
    doc.setTextColor(...SLATE_500);
    doc.text(row.label, MARGIN, y);
    doc.setTextColor(...SLATE_900);
    doc.text(row.value, pageWidth - MARGIN, y, { align: 'right' });
    y += 5.5;
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y - 2, pageWidth - MARGIN, y - 2);
  }
  return y + 3;
}

// Brand band, title, url, inputs, the headline result (its own tinted card), outputs, and the
// chart image if one resolves. Shared by both PDF variants; returns the y-position to continue
// writing from.
async function writeSummary(doc: JsPDF, payload: ExportPayload): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
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
  y += 7;

  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 9;

  if (payload.inputs.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...ACCENT);
    doc.text('INPUTS', MARGIN, y);
    y += 6;
    y = labelValueRows(doc, payload.inputs, pageWidth, y);
    y += 3;
  }

  // The result as its own tinted card, echoing the on-screen ResultPanel's accent wash.
  const cardWidth = pageWidth - MARGIN * 2;
  const cardTop = y;
  const cardHeight = 22;
  doc.setFillColor(...ACCENT_TINT);
  doc.roundedRect(MARGIN, cardTop, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.text(payload.result.label.toUpperCase(), MARGIN + 6, cardTop + 8);
  doc.setFontSize(17);
  doc.text(payload.result.value, MARGIN + 6, cardTop + 17);
  y = cardTop + cardHeight + 9;

  if (payload.outputs.length) {
    y = labelValueRows(doc, payload.outputs, pageWidth, y);
    y += 3;
  }

  if (payload.chartSelector) {
    const svg = document.querySelector<SVGSVGElement>(`${payload.chartSelector} svg`);
    if (svg) {
      try {
        const dataUrl = await svgToPngDataUrl(svg);
        const aspect = (svg.clientHeight || 1) / (svg.clientWidth || 1);
        const width = Math.min(pageWidth - MARGIN * 2, 80);
        const height = width * aspect;
        doc.addImage(dataUrl, 'PNG', MARGIN, y, width, height);
        y += height + 6;
      } catch {
        // A missing/unrasterizable chart should never block the rest of the download.
      }
    }
  }

  return y;
}

/** Inputs + result + outputs + chart image, if any. Never includes payload.table. */
export async function downloadSummaryPdf(calculatorId: string, payload: ExportPayload) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  await writeSummary(doc, payload);
  drawFooter(doc, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
  doc.save(`${calculatorId}-result.pdf`);
}

/** Everything downloadSummaryPdf does, plus the full schedule via jspdf-autotable. */
export async function downloadFullPdf(calculatorId: string, payload: ExportPayload) {
  if (!payload.table) return;
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = await writeSummary(doc, payload);
  autoTable(doc, {
    startY: y + 2,
    head: [payload.table.columns],
    body: payload.table.rows,
    margin: { left: MARGIN, right: MARGIN, top: BAND_HEIGHT + 6, bottom: 14 },
    styles: { fontSize: 9, textColor: SLATE_900 },
    headStyles: { fillColor: SLATE_200, textColor: SLATE_900, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    // Every page after the first (the summary already drew its own band on page 1) still gets the
    // brand band, so a reader flipping through a 30-page schedule never loses context.
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
