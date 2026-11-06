// Resistor color-code tables (IEC 60062:2016, "Marking codes for resistors and capacitors"). The
// standard itself is paywalled; the table below reproduces the color -> digit/multiplier/tolerance
// mapping exactly as given in Wikipedia's "Electronic color code" article (en.wikipedia.org, via its
// {{Electronic colour code}} data template, fetched directly) and cross-checked against the body
// text of "Electronic color code" (the worked example there: red-violet-green-gold = 2,700,000 Ω,
// ±5% — reproduced in resistorColors.spec.ts). See mdFiles/steps/46-47-wave-3-physics-chemistry.md,
// "Physics electricity/circuits run".
//
// A `CalculatorInput`'s `options` carries the VALUE each color contributes directly (the digit 0-9,
// the multiplier as a plain number, or the tolerance as a plain percent number) rather than an
// abstract code, since every one of those values is already distinct within its own list (no
// collision risk — see template §2 "Select options are keyed by id or code, never by the lookup
// value itself").

export type ColorOption = { value: number; label: string };

/** Significant-digit bands (1st, 2nd, and the 5-band-only 3rd): black=0 through white=9. */
export const DIGIT_COLORS: ColorOption[] = [
  { value: 0, label: 'Black' },
  { value: 1, label: 'Brown' },
  { value: 2, label: 'Red' },
  { value: 3, label: 'Orange' },
  { value: 4, label: 'Yellow' },
  { value: 5, label: 'Green' },
  { value: 6, label: 'Blue' },
  { value: 7, label: 'Violet' },
  { value: 8, label: 'Grey' },
  { value: 9, label: 'White' }
];

/** Multiplier band: the same ten colors as ×10^digit, plus gold (×0.1) and silver (×0.01). */
export const MULTIPLIER_COLORS: ColorOption[] = [
  ...DIGIT_COLORS.map((color) => ({ value: 10 ** color.value, label: color.label })),
  { value: 0.1, label: 'Gold' },
  { value: 0.01, label: 'Silver' }
];

/** Tolerance band. 'None' (no band at all) means ±20%, the widest, least-precise tolerance. */
export const TOLERANCE_COLORS: ColorOption[] = [
  { value: 1, label: 'Brown' },
  { value: 2, label: 'Red' },
  { value: 0.05, label: 'Orange' },
  { value: 0.02, label: 'Yellow' },
  { value: 0.5, label: 'Green' },
  { value: 0.25, label: 'Blue' },
  { value: 0.1, label: 'Violet' },
  { value: 0.01, label: 'Grey' },
  { value: 5, label: 'Gold' },
  { value: 10, label: 'Silver' },
  { value: 20, label: 'None (no tolerance band)' }
];

/**
 * Decodes a resistor's nominal value (ohms) from its color bands. `bandCount` 0 = 4-band
 * (digit1, digit2, multiplier, tolerance), 1 = 5-band (adds a third significant digit).
 * `digit3` is ignored for a 4-band resistor.
 */
export function resistanceFromColorBands(
  digit1: number,
  digit2: number,
  digit3: number,
  multiplier: number,
  bandCount: number
): number {
  const significant = bandCount === 1 ? digit1 * 100 + digit2 * 10 + digit3 : digit1 * 10 + digit2;
  return significant * multiplier;
}
