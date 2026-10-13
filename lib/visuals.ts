// Geometry and data helpers for components/visuals. Pure, so they are unit-tested in visuals.spec.ts.

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Position of `value` on a linear min→max axis, as 0–100 (clamped). NaN when it can't be plotted. */
export function linearPosition(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || !(max > min)) return NaN;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

/** Position on a log axis from 10^minExp to 10^maxExp, as 0–100 (clamped). NaN for values ≤ 0. */
export function logPosition(value: number, minExp: number, maxExp: number) {
  if (!Number.isFinite(value) || value <= 0 || !(maxExp > minExp)) return NaN;
  return clamp(((Math.log10(value) - minExp) / (maxExp - minExp)) * 100, 0, 100);
}

const usable = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export type DonutSegment = { start: number; end: number; sweep: number; fraction: number };

/** Angles in degrees, clockwise from 12 o'clock. Negative and non-finite values count as 0. */
export function donutSegments(values: number[]): DonutSegment[] {
  const clean = values.map(usable);
  const total = clean.reduce((sum, v) => sum + v, 0);
  let angle = 0;
  return clean.map((v) => {
    const fraction = total > 0 ? v / total : 0;
    const sweep = fraction * 360;
    const segment = { start: angle, end: angle + sweep, sweep, fraction };
    angle += sweep;
    return segment;
  });
}

const point = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return `${+(cx + r * Math.cos(rad)).toFixed(3)} ${+(cy + r * Math.sin(rad)).toFixed(3)}`;
};

/** SVG path for a ring segment. A full ring is drawn as two halves: an arc whose ends meet draws nothing. */
export function arcPath(cx: number, cy: number, outer: number, inner: number, start: number, end: number): string {
  const sweep = end - start;
  if (!(sweep > 0)) return '';
  if (sweep >= 359.999) {
    return `${arcPath(cx, cy, outer, inner, start, start + 180)} ${arcPath(cx, cy, outer, inner, start + 180, start + 360)}`;
  }
  const large = sweep > 180 ? 1 : 0;
  return [
    `M ${point(cx, cy, outer, start)}`,
    `A ${outer} ${outer} 0 ${large} 1 ${point(cx, cy, outer, end)}`,
    `L ${point(cx, cy, inner, end)}`,
    `A ${inner} ${inner} 0 ${large} 0 ${point(cx, cy, inner, start)}`,
    'Z'
  ].join(' ');
}

export type Band = { label: string; min: number; max: number; color?: string };

/**
 * Index of the band holding `value`: lower bound inclusive, upper exclusive (BMI 25.0 is overweight).
 * Clamps to the first/last band outside the range; -1 for NaN or no bands.
 */
export function findBand(bands: Band[], value: number) {
  if (!bands.length || Number.isNaN(value)) return -1;
  if (value < bands[0].min) return 0;
  const index = bands.findIndex((band) => value >= band.min && value < band.max);
  return index === -1 ? bands.length - 1 : index;
}

/** Each value as a percent of the largest one. Negative and non-finite values count as 0. */
export function barWidths(values: number[]) {
  const clean = values.map(usable);
  const max = Math.max(0, ...clean);
  return clean.map((v) => (max > 0 ? (v / max) * 100 : 0));
}

/** A translucent tint of a #RRGGBB color: alpha 0–1. */
export function tint(color: string, alpha: number) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  return `${color}${Math.round(clamp(alpha, 0, 1) * 255).toString(16).padStart(2, '0')}`;
}

