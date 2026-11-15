// Shared chart extraction for the download/export feature (UX-09) — used by both
// lib/exportPdf.ts and lib/exportExcel.ts so the DOM-reading logic lives in exactly one place.
// See mdFiles/steps/ux-09-download-export.md.

export type ChartLegendItem = {
  color: [number, number, number];
  /** The full joined text of the legend row (label + formatted value), for simple display. */
  text: string;
  /** `text` with the trailing numeric token stripped, e.g. "Principal" from "Principal $280,000.00". */
  label: string;
  /** The trailing numeric token parsed back to a real number (strips $, %, commas), or null if `text` has no parseable number — real tables/cells should prefer this over re-parsing `text`. */
  value: number | null;
};
export type ChartExtract = {
  dataUrl: string;
  aspect: number; // height / width
  /** Colored legend rows, when the chart has a discrete <li>+swatch legend (today: Donut only). */
  legend: ChartLegendItem[];
  /** The chart's own accessible summary (every visual's aria-label) — used when there's no legend. */
  caption: string | null;
};

// Rasterizes a live <svg> into a PNG data URL for embedding in a PDF or spreadsheet. Throws on
// failure; callers catch and skip the image rather than block the whole download over it.
async function svgToPngDataUrl(svg: SVGSVGElement): Promise<string> {
  const xml = new XMLSerializer().serializeToString(svg);
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('svg failed to rasterize'));
    img.src = svgDataUrl;
  });
  const scale = 2; // crisper than 1:1 in the output
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

function parseRgbString(value: string): [number, number, number] {
  const match = value.match(/(\d+(?:\.\d+)?)/g);
  if (match && match.length >= 3) return [Math.round(Number(match[0])), Math.round(Number(match[1])), Math.round(Number(match[2]))];
  return [148, 163, 184]; // slate-400 fallback — never block a download over an unparseable color
}

const PERCENT_TOKEN = /^-?[\d.]+%$/;
const NUMERIC_TOKEN = /-?\$?[\d,]+(?:\.\d+)?/;

// Donut's own legend row is exactly [label, formatted value, share %] as three separate text
// nodes (see components/visuals/Donut.tsx) — reading them apart, rather than regexing the last
// number out of the joined string, is what keeps this from grabbing the share percentage (e.g.
// "52%") when the caller actually wants the dollar amount ("$280,000.00") in the middle.
function splitLabelAndValue(parts: string[]): { label: string; value: number | null } {
  const withoutShare = parts.length > 1 && PERCENT_TOKEN.test(parts[parts.length - 1]) ? parts.slice(0, -1) : parts;
  if (withoutShare.length < 2) return { label: parts.join('  '), value: null };
  const valueText = withoutShare[withoutShare.length - 1];
  const match = valueText.match(NUMERIC_TOKEN);
  const numeric = match ? Number(match[0].replace(/[$,]/g, '')) : NaN;
  if (!Number.isFinite(numeric)) return { label: parts.join('  '), value: null };
  return { label: withoutShare.slice(0, -1).join(' '), value: numeric };
}

// A colored legend list, when the chart has one (today: Donut's <ul><li> of swatch+label+value —
// RangeBar/CompareBars/LogScale/Timeline don't use this pattern, so this returns empty for them
// and callers fall back to the plain aria-label caption instead).
function extractLegend(container: Element): ChartLegendItem[] {
  const items: ChartLegendItem[] = [];
  container.querySelectorAll('li').forEach((li) => {
    const swatch = li.querySelector<HTMLElement>('[style*="background-color"]');
    if (!swatch) return;
    const color = parseRgbString(getComputedStyle(swatch).backgroundColor);
    const parts = Array.from(li.children)
      .filter((child) => child !== swatch)
      .map((child) => child.textContent?.trim())
      .filter((part): part is string => Boolean(part));
    if (parts.length) items.push({ color, text: parts.join('  '), ...splitLabelAndValue(parts) });
  });
  return items;
}

/** Resolves everything exportable about the calculator's visual, or null if there isn't one. */
export async function resolveChart(chartSelector: string | undefined): Promise<ChartExtract | null> {
  if (!chartSelector) return null;
  const container = document.querySelector(chartSelector);
  const svg = container?.querySelector<SVGSVGElement>('svg');
  if (!container || !svg) return null;
  try {
    const dataUrl = await svgToPngDataUrl(svg);
    const aspect = (svg.clientHeight || 1) / (svg.clientWidth || 1);
    const legend = extractLegend(container);
    const labeled = container.querySelector<HTMLElement>('[aria-label]');
    const caption = labeled?.getAttribute('aria-label') ?? null;
    return { dataUrl, aspect, legend, caption };
  } catch {
    return null; // a missing/unrasterizable chart should never block the rest of the download
  }
}
