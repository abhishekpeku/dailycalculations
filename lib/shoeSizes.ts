// Shared, cited shoe-size conversion: foot length in millimetres (the Mondopoint value) to UK, US
// (men's/women's/kids') and EU sizes. See mdFiles/steps/42-wave-1-conversion.md, "Run 7" and its
// "Pre-merge review fix" note.
//
// Unlike a unit-conversion factor, there is no single universal shoe-size standard, and — the
// pre-merge review found — the *theoretical* standards-body formula (ISO 19407, barleycorns/Paris
// points) does not actually match what shoe brands print on their own size charts: a shopper
// converting by the ISO formula would end up buying real shoes about a size too small. The
// HEADLINE numbers on every page are therefore the real, published **retail convention** below,
// built from brands' own size charts, actually fetched (not a theoretical formula). ISO 19407 is
// kept only as a secondary, explained concept (see `isoUkSize`/`isoEuSize`) — never the headline.
//
// Primary sources (fetched this run, not from memory):
// - adidas's own published men's, women's and kids' size charts, as reproduced (and explicitly
//   attributed: "Table rows follow adidas published size charts") by sizefit.org/guides/
//   adidas-shoe-size-chart, fetched directly. adidas's own US/UK/EU/foot-length numbers are a
//   single, exact, internally consistent linear relationship across the whole adult range (see
//   `lib/shoeSizes.spec.ts`), which is what every `*Size` function below reproduces exactly.
// - Nike's published men's/women's/UK/EU size chart (nike.com/size-fit/mens-footwear), fetched
//   directly, used as a second brand's cross-check: comparing the two brands AT THE SAME US SIZE
//   LABEL (not the same foot length — the two brands print different foot-length figures for the
//   same size, so that comparison is apples-to-oranges), UK matches exactly at every size checked,
//   and EU is within half a size at nearly every size checked (both expected, since Nike rounds EU
//   to the nearest half/whole size while adidas's own chart keeps the exact Paris-point third).
//   Nike's own men's-to-women's offset (+1.5) differs from adidas's own (+1) — a real, confirmed
//   brand disagreement, not a calculation error; adidas's is used as the primary (see
//   `usWomensSize`), Nike's named as the documented alternative.
// - Wikipedia, "Shoe size" (en.wikipedia.org/wiki/Shoe_size), fetched as raw wikitext, for the ISO
//   19407 section kept below as the secondary/theoretical concept, and for the children's
//   last-length allowance used nowhere in the primary path any more (superseded by the adidas kids'
//   chart) but still informative background.

const INCH_MM = 25.4;

export type ShoeCategory = 'mens' | 'womens' | 'kids';

/** The `category` <select> input's option values — fixed, inherently distinct codes (never a
 *  lookup value that could collide between rows; see the run 6 parked lesson in STATUS.md). */
export const CATEGORY_CODE: Record<ShoeCategory, number> = { mens: 0, womens: 1, kids: 2 };

export function categoryFromCode(code: number): ShoeCategory {
  return code === 1 ? 'womens' : code === 2 ? 'kids' : 'mens';
}

// ============================================================================================
// PRIMARY: the retail convention, fitted exactly to adidas's own published men's size chart
// (sizefit.org/guides/adidas-shoe-size-chart, "Table rows follow adidas published size charts").
// adidas's own chart is a single exact linear relationship across its whole published range
// (US men's 4-14.5): footMm = 10 x US men's size + 180, UK = US men's - 0.5, EU = (4 x US men's +
// 92) / 3. Every one of adidas's own rows round-trips through these three formulas exactly (see
// the spec file) — this is adidas's own data, not a fit with residual error.
// ============================================================================================

export function usMensSize(footMm: number): number {
  return (footMm - 180) / 10;
}

export function ukAdultSize(footMm: number): number {
  return (footMm - 185) / 10;
}

export function euAdultSize(footMm: number): number {
  return (2 * footMm + 100) / 15;
}

/**
 * Two documented US women's offsets, confirmed against each brand's own chart, not asserted:
 * - "fia" (adidas's own chart; also the older "FIA", Footwear Industries of America, scale):
 *   women's = men's + 1 — the primary scale used here, since it is the one backed by a full,
 *   directly-fetched brand chart across men's/women's/kids'.
 * - "common" (Nike's own chart, confirmed exactly at every size checked): women's = men's + 1.5.
 */
export function usWomensSize(footMm: number, scale: 'fia' | 'common' = 'fia'): number {
  return usMensSize(footMm) + (scale === 'common' ? 1.5 : 1);
}

export function roundToHalf(size: number): number {
  return Math.round(size * 2) / 2;
}

/** EU/Paris-point sizes come in thirds of a size (adidas's own chart uses exact thirds); rounding
 *  to the nearest whole number would throw away real precision its own source has. */
export function roundToThird(size: number): number {
  return Math.round(size * 3) / 3;
}

// ISO's casual-footwear Mondopoint interval (5 mm; protective footwear uses 7.5 mm, not used here).
// Mondopoint is just the foot length itself — independent of the brand/retail convention above.
export function roundMondopoint(footMm: number, intervalMm = 5): number {
  return Math.round(footMm / intervalMm) * intervalMm;
}

// adidas's own published men's range starts at US men's 4 (foot 220 mm) and the women's range at
// US women's 5 (the same 220 mm, one size up on the women's-only numbering) — below that, there is
// no adult row in either chart to be confident in, so the formula is not asserted as valid there.
export function isValidAdultFoot(footMm: number): boolean {
  return footMm >= 220;
}

// ============================================================================================
// Children: a real lookup table (not a formula), since adidas's own published kids' sizing is NOT
// one linear relationship across its full range — it is three overlapping/adjoining size runs
// (babies & toddlers, little kids, big kids) and the US and UK *labels* each separately reset
// partway through (the kids' size resets other pages' watch-outs describe), which a single
// formula cannot represent. Every row is adidas's own chart value; `kidsSizeAt` interpolates
// between rows for a foot length that falls between two published sizes, and never interpolates
// *through* a label reset (see `safeInterp`).
// ============================================================================================

type KidsRow = { usSize: number; ukSize: number; euSize: number; footMm: number };

// adidas's own published "Babies & Toddlers" (1k-10k), "Little Kids" (10.5k-3) and "Big Kids"
// (3.5-7.5) charts, merged in one foot-length-ascending table. The 'k' suffix (toddler/little-kid
// sizing) vs. no suffix (youth sizing, from size 1 up) is a labeling convention, not a different
// number — both are stored as the plain number adidas itself prints.
const KIDS_CHART: KidsRow[] = [
  { usSize: 1, ukSize: 0, euSize: 16, footMm: 80 },
  { usSize: 2, ukSize: 1, euSize: 17, footMm: 90 },
  { usSize: 3, ukSize: 2, euSize: 18, footMm: 100 },
  { usSize: 4, ukSize: 3, euSize: 19, footMm: 105 },
  { usSize: 5, ukSize: 4, euSize: 20, footMm: 115 },
  { usSize: 5.5, ukSize: 5, euSize: 21, footMm: 120 },
  { usSize: 6, ukSize: 5.5, euSize: 22, footMm: 125 },
  { usSize: 6.5, ukSize: 6, euSize: 23, footMm: 130 },
  { usSize: 7, ukSize: 6.5, euSize: 23.5, footMm: 135 },
  { usSize: 7.5, ukSize: 7, euSize: 24, footMm: 140 },
  { usSize: 8, ukSize: 7.5, euSize: 25, footMm: 145 },
  { usSize: 8.5, ukSize: 8, euSize: 25.5, footMm: 150 },
  { usSize: 9, ukSize: 8.5, euSize: 26, footMm: 155 },
  { usSize: 9.5, ukSize: 9, euSize: 26.5, footMm: 155 },
  { usSize: 10, ukSize: 9.5, euSize: 27, footMm: 160 },
  { usSize: 10.5, ukSize: 10, euSize: 28, footMm: 165 },
  { usSize: 11, ukSize: 10.5, euSize: 28.5, footMm: 170 },
  { usSize: 11.5, ukSize: 11, euSize: 29, footMm: 175 },
  { usSize: 12, ukSize: 11.5, euSize: 30, footMm: 180 },
  { usSize: 12.5, ukSize: 12, euSize: 30.5, footMm: 180 },
  { usSize: 13, ukSize: 12.5, euSize: 31, footMm: 185 },
  { usSize: 13.5, ukSize: 13, euSize: 31.5, footMm: 190 },
  // US resets here (13.5 -> 1); UK does not reset until the next row.
  { usSize: 1, ukSize: 13.5, euSize: 32, footMm: 195 },
  // UK resets here (13.5 -> 1); US does not reset until here either — both land on this row's
  // *neighbors*, never on the same single row, per adidas's own chart.
  { usSize: 1.5, ukSize: 1, euSize: 33, footMm: 200 },
  { usSize: 2, ukSize: 1.5, euSize: 33.5, footMm: 205 },
  { usSize: 2.5, ukSize: 2, euSize: 34, footMm: 210 },
  { usSize: 3, ukSize: 2.5, euSize: 35, footMm: 210 },
  { usSize: 3.5, ukSize: 3, euSize: 35.5, footMm: 215 },
  { usSize: 4, ukSize: 3.5, euSize: 36, footMm: 220 },
  { usSize: 4.5, ukSize: 4, euSize: 36 + 2 / 3, footMm: 225 },
  { usSize: 5, ukSize: 4.5, euSize: 37 + 1 / 3, footMm: 230 },
  { usSize: 5.5, ukSize: 5, euSize: 38, footMm: 235 },
  { usSize: 6, ukSize: 5.5, euSize: 38 + 2 / 3, footMm: 240 },
  { usSize: 6.5, ukSize: 6, euSize: 39 + 1 / 3, footMm: 240 },
  { usSize: 7, ukSize: 6.5, euSize: 40, footMm: 245 },
  { usSize: 7.5, ukSize: 7, euSize: 40 + 2 / 3, footMm: 250 }
];

const KIDS_MIN_FOOT_MM = KIDS_CHART[0].footMm;
const KIDS_MAX_FOOT_MM = KIDS_CHART[KIDS_CHART.length - 1].footMm;

export function isValidChildFoot(footMm: number): boolean {
  return footMm >= KIDS_MIN_FOOT_MM && footMm <= KIDS_MAX_FOOT_MM;
}

// Interpolates v0 -> v1 by t in [0, 1], except across a label reset (v1 < v0, e.g. US 13.5 -> 1):
// a reset is never a real "in-between" value, so this snaps to whichever endpoint t is closer to.
function safeInterp(v0: number, v1: number, t: number): number {
  if (v1 < v0) return t < 0.5 ? v0 : v1;
  return v0 + (v1 - v0) * t;
}

/** Interpolates adidas's own kids' chart (`KIDS_CHART`) for an arbitrary foot length (mm). Returns
 *  `null` outside the chart's published range (use `isValidChildFoot` to check first). */
export function kidsSizeAt(footMm: number): { usSize: number; ukSize: number; euSize: number } | null {
  if (!isValidChildFoot(footMm)) return null;
  let i = 0;
  while (i < KIDS_CHART.length - 2 && KIDS_CHART[i + 1].footMm < footMm) i++;
  const a = KIDS_CHART[i];
  const b = KIDS_CHART[i + 1];
  const span = b.footMm - a.footMm;
  const t = span === 0 ? 0 : (footMm - a.footMm) / span;
  return {
    usSize: safeInterp(a.usSize, b.usSize, t),
    ukSize: safeInterp(a.ukSize, b.ukSize, t),
    euSize: safeInterp(a.euSize, b.euSize, t)
  };
}

export type ShoeSizeResult = { usSize: number; ukSize: number; euSize: number; mondopoint: number };

/**
 * Every size from one foot length (mm), for one category — the live calculator's only entry
 * point. Adults use the exact adidas-chart formulas; kids use the adidas-chart lookup table.
 */
export function shoeSizesFromFootMm(footMm: number, category: ShoeCategory): ShoeSizeResult {
  const mondopoint = roundMondopoint(footMm);
  if (category === 'kids') {
    const kids = kidsSizeAt(footMm);
    if (!kids) return { usSize: NaN, ukSize: NaN, euSize: NaN, mondopoint };
    return {
      usSize: roundToHalf(kids.usSize),
      ukSize: roundToHalf(kids.ukSize),
      euSize: roundToThird(kids.euSize),
      mondopoint
    };
  }
  if (!isValidAdultFoot(footMm)) return { usSize: NaN, ukSize: NaN, euSize: NaN, mondopoint };
  return {
    usSize: roundToHalf(category === 'womens' ? usWomensSize(footMm) : usMensSize(footMm)),
    ukSize: roundToHalf(ukAdultSize(footMm)),
    euSize: roundToThird(euAdultSize(footMm)),
    mondopoint
  };
}

/** Foot length (mm) for a target US men's adult size — the exact inverse of `usMensSize`, used
 *  only to build the static men's/women's chart tables from a round US size. */
export function footMmFromUsMen(usMen: number): number {
  return 10 * usMen + 180;
}

// ============================================================================================
// SECONDARY: ISO 19407 — the theoretical barleycorn/Paris-point standard. Kept only as an
// explained concept (the formula note on each page), never as a page's headline numbers — see the
// module comment above for why. Quoted directly from Wikipedia's raw wikitext, not summarized.
// ============================================================================================

/** "UK shoe size = (L + 2x8.46...)/8.46... - 25 = (3/25.4) x L - 23" (ISO 19407, via Wikipedia). */
export function isoUkSize(footMm: number): number {
  return (3 / INCH_MM) * footMm - 23;
}

/** "EUR = 1.27 x (UK + 23) + 2" combined with "L = 20/3 x (EUR - 2)" gives EUR = 0.15 x L + 2
 *  directly from foot length in mm (ISO 19407, via Wikipedia). */
export function isoEuSize(footMm: number): number {
  return 0.15 * footMm + 2;
}

/** "the most common is the customary system where men's shoes are numbered higher by one than
 *  the UK equivalent" (Wikipedia, "United States" section) — ISO's own US offset, kept only to
 *  show, at the same US size LABEL, how far its foot-length basis sits from the retail chart's. */
export function isoUsMenSize(footMm: number): number {
  return isoUkSize(footMm) + 1;
}

/** The ISO/theoretical foot length (mm) for a target US men's size, via `isoUsMenSize`'s own
 *  UK = target - 1 rule — the comparison point for the "ISO vs. retail" gap (see the spec file and
 *  the formula note on each page): the SAME LABEL implies a shorter foot under ISO than under the
 *  retail chart (`footMmFromUsMen`). */
export function isoFootMmFromUsMen(usMen: number): number {
  const iso3rdBarleycorn = 25.4 / 3;
  return (usMen - 1 + 23) * iso3rdBarleycorn;
}
