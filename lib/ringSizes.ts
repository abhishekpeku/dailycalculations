// Shared, cited ring-size conversion: inner circumference in millimetres to US/Canada, UK/Ireland/
// Australia (letter + half) and EU/ISO sizes, and inner diameter. See
// mdFiles/steps/42-wave-1-conversion.md, "Run 8".
//
// Unlike a unit-conversion factor, there is no single universal ring-size standard across regions —
// but unlike run 7's shoe sizes, there is no "theory vs. retail" gap here either: every formula below
// is an officially defined standard (ISO 8653:2016, British Standard 6820:1987, the North American
// Bureau-of-Standards-derived scale), and each is checked below against a real jeweler's own
// published chart, matching closely (within normal chart-rounding noise), not the kind of
// size-too-small gap run 7 found between the shoe-size theoretical standard and real retail charts.
//
// Primary sources (fetched this run, not from memory):
// - Wikipedia, "Ring size" (en.wikipedia.org/wiki/Ring_size), fetched as raw wikitext (not an
//   AI-summarized fetch, the same lesson as run 7). Gives, verbatim:
//   - ISO 8653:2016 "defines standard ring sizes in terms of the inner circumference of the ring
//     measured in millimeters" (cited there to iso.org/standard/65408.html).
//   - The North America (US/Canada/Mexico) formula, attributed to the 1921 Circular of the Bureau
//     of Standards No. 43: "a numerical scale with 1/4 steps, where whole sizes differ by 0.032 in
//     of internal diameter" -- giving C_ISO = 2.55 x s_NA + 36.5 and d_ISO = 0.8128 x s_NA + 11.63.
//   - The UK/Ireland/Australia system, attributed to British Standard 6820:1987: "one alphabetical
//     size division equals 1.25 mm of circumferential length. For a baseline, ring size C has a
//     circumference of 40 mm."
// - Goldsmiths, a real UK jeweler's published ring size chart
//   (goldsmiths.co.uk/i/know-your-ring-size), fetched directly, used as the UK cross-check: of the
//   26 letters A-Z, 22 match this module's BS-6820-derived formula exactly (using Goldsmiths' own
//   diameter column, the more fundamental of their two slightly-inconsistent columns); the other 4
//   (Q, R, U, X) differ by exactly one half-letter, consistent with Goldsmiths' own 1-decimal
//   rounding landing right on a half-letter boundary, not a real disagreement.
// - Angara, a real US jeweler's published ring size guide (angara.com/blog/ring-size-guide),
//   fetched directly, used as the US cross-check: this module's US-size formula reproduces Angara's
//   own listed circumference within 0.5 mm at every size 3-13 (normal chart-rounding noise). Their
//   UK column (a US retailer's own international conversion, not a UK-specific authority) is
//   consistently about half a letter different from this module's BS-6820 figure throughout -- a
//   real, bounded disagreement, documented on each page's watch-out, with the Standard's own
//   definition (validated against the real UK chart above) used as this module's primary figure.

const PI = Math.PI;

/** The `measureBy` <select> input's option values -- fixed, inherently distinct codes (never a
 *  lookup value that could collide; see the run 6 parked lesson in STATUS.md). */
// Circumference is coded 0 (the default) so the snapshot test harness's "typical" input (1.5x the
// default, per data/calculators.spec.ts) leaves this selector unchanged (0 x 1.5 = 0) instead of
// landing on an invalid option code — the same reason lib/shoeSizes.ts's CATEGORY_CODE.mens is 0.
export const MEASURE_BY = { circumference: 0, diameter: 1 } as const;

// ============================================================================================
// Geometry (exact) and EU/ISO (ISO 8653:2016's own definition: size = inner circumference, mm).
// ============================================================================================

export function diameterFromCircumference(circumferenceMm: number): number {
  return circumferenceMm / PI;
}

export function circumferenceFromDiameter(diameterMm: number): number {
  return diameterMm * PI;
}

/** ISO 8653:2016: the size number IS the inner circumference in mm, rounded to the nearest whole
 *  mm (most ISO-market brands sell whole sizes; some offer half-mm sizes -- see the watch-out). */
export function euSizeFromCircumference(circumferenceMm: number): number {
  return isValidRingMeasurement(circumferenceMm) ? Math.round(circumferenceMm) : NaN;
}

export function isValidRingMeasurement(circumferenceMm: number): boolean {
  return circumferenceMm > 0;
}

// ============================================================================================
// US/Canada/Mexico: the North America formula (Wikipedia, cited to the 1921 Bureau of Standards
// circular), checked against Angara's real chart (see module header). Quarter-size granularity,
// per Wikipedia's own "1/4 steps" description of the scale.
// ============================================================================================

export function circumferenceFromUsSize(usSize: number): number {
  return 2.55 * usSize + 36.5;
}

function roundToQuarter(size: number): number {
  return Math.round(size * 4) / 4;
}

/** NaN below 0 -- a negative ring size does not exist (the "no negative length" accuracy rule). */
export function usSizeFromCircumference(circumferenceMm: number): number {
  if (!isValidRingMeasurement(circumferenceMm)) return NaN;
  const size = roundToQuarter((circumferenceMm - 36.5) / 2.55);
  return size >= 0 ? size : NaN;
}

// ============================================================================================
// UK/Ireland/Australia: British Standard 6820:1987's own cited definition. `index` is in
// half-letter units: 0 = A, 1 = A½, 2 = B, 3 = B½, ... 50 = Z (26 letters x 2 - 2). One FULL letter
// is BS 6820's own 1.25 mm; one half-letter (one index step) is therefore 0.625 mm. The baseline
// (index 4 = C) sits at exactly 40 mm, matching the Standard's own stated baseline exactly.
// ============================================================================================

const UK_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const UK_MIN_INDEX = 0; // A
export const UK_MAX_INDEX = 50; // Z

export function circumferenceFromUkIndex(index: number): number {
  return 0.625 * index + 37.5;
}

/** NaN outside A..Z (index 0..50) -- no UK letter is shown past that range (not extrapolated),
 *  the same "chart-defined range, NaN outside" precedent as run 7's shoe charts: there is no
 *  single authoritative standard for a ring size past Z. */
export function ukIndexFromCircumference(circumferenceMm: number): number {
  if (!isValidRingMeasurement(circumferenceMm)) return NaN;
  const index = Math.round((circumferenceMm - 37.5) / 0.625);
  return index >= UK_MIN_INDEX && index <= UK_MAX_INDEX ? index : NaN;
}

/** "A", "A½", "B", ... "Z". `null` outside A..Z (use `ukIndexFromCircumference`'s own NaN guard
 *  before calling this for display -- see `UK_LETTER_LABELS`). */
export function formatUkLetter(index: number): string | null {
  if (!Number.isFinite(index) || index < UK_MIN_INDEX || index > UK_MAX_INDEX) return null;
  const letter = UK_LETTERS[Math.floor(index / 2)];
  return index % 2 === 1 ? `${letter}½` : letter;
}

/** The `ukIndex` output's `labels` lookup (kit addition, data/calculators/types.ts) -- generated
 *  once from `formatUkLetter`, never a second hand-typed list of letters. */
export const UK_LETTER_LABELS: { value: number; label: string }[] = Array.from(
  { length: UK_MAX_INDEX - UK_MIN_INDEX + 1 },
  (_, i) => UK_MIN_INDEX + i
).map((index) => ({ value: index, label: formatUkLetter(index)! }));
