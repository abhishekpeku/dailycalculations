// PDF export (UX-09). jsPDF + jspdf-autotable are dynamically imported here, inside each
// function — never at module top level — so they code-split into their own chunk and only load
// when a visitor actually clicks download, not on every calculator page's initial bundle.
// See mdFiles/steps/ux-09-download-export.md.
import type { ExportPayload } from '@/lib/export';
// Type-only import — erased at compile time, so this doesn't pull jsPDF into the page bundle.
import type { jsPDF as JsPDF } from 'jspdf';

const MARGIN = 14;

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

// Title, url, inputs, the headline result, outputs, and the chart image if one resolves. Shared
// by both PDF variants; returns the y-position to continue writing from.
async function writeSummary(doc: JsPDF, payload: ExportPayload): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = MARGIN;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(payload.title, MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(payload.url, MARGIN, y);
  doc.setTextColor(0);
  y += 6;

  doc.setDrawColor(220);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 8;

  if (payload.inputs.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Inputs', MARGIN, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const row of payload.inputs) {
      doc.text(row.label, MARGIN, y);
      doc.text(row.value, pageWidth - MARGIN, y, { align: 'right' });
      y += 5.5;
    }
    y += 4;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(payload.result.label, MARGIN, y);
  y += 7;
  doc.setFontSize(16);
  doc.text(payload.result.value, MARGIN, y);
  y += 9;

  if (payload.outputs.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const row of payload.outputs) {
      doc.text(row.label, MARGIN, y);
      doc.text(row.value, pageWidth - MARGIN, y, { align: 'right' });
      y += 5.5;
    }
    y += 4;
  }

  if (payload.chartSelector) {
    const svg = document.querySelector<SVGSVGElement>(`${payload.chartSelector} svg`);
    if (svg) {
      try {
        const dataUrl = await svgToPngDataUrl(svg);
        const maxWidth = pageWidth - MARGIN * 2;
        const aspect = (svg.clientHeight || 1) / (svg.clientWidth || 1);
        const width = Math.min(maxWidth, 90);
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
  doc.save(`${calculatorId}-result.pdf`);
}

/** Everything downloadSummaryPdf does, plus the full schedule via jspdf-autotable. */
export async function downloadFullPdf(calculatorId: string, payload: ExportPayload) {
  if (!payload.table) return;
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  const y = await writeSummary(doc, payload);
  autoTable(doc, {
    startY: y + 2,
    head: [payload.table.columns],
    body: payload.table.rows,
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] }
  });
  doc.save(`${calculatorId}-schedule.pdf`);
}
