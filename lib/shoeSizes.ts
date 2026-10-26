// Shared, cited shoe-size conversion formulas: foot length in millimetres (the Mondopoint value)
// to UK, US (men's/women's/kids') and EU sizes. See mdFiles/steps/42-wave-1-conversion.md, "Run 7".
//
// Unlike a unit-conversion factor, there is no single universal shoe-size standard. UK/US sizes
// step in barleycorns (1/3 inch) of LAST length — the shoe mould, longer than the bare foot by a
// fitting allowance. EU/Paris-point sizes step in 2/3 cm of last length, with their OWN, smaller
// allowance. Brands' own published charts routinely differ from both formulas by up to a size —
// see SHOE_SIZE_NIKE_CHECK below, a real cross-check, not a vague "brands vary" claim.
//
// Primary sources (fetched this run, not from memory):
// - Wikipedia, "Shoe size" (en.wikipedia.org/wiki/Shoe_size) — fetched as RAW WIKITEXT
//   (?action=raw) and read directly. A first attempt fetching the rendered page through an
//   AI-summarizing fetch gave inconsistent constants across two passes (one pass said
//   "male shoe size = 3 x foot - 24", another said "= 3 x foot - 22" for the same formula) — raw
//   wikitext was fetched instead so every constant below is read, not summarized.
// - The same article's "ISO 19407 and shoe size conversion" section, which gives the unified
//   UK/EUR formulas directly from foot length in millimetres.
// - Nike's published men's/women's/UK/EU size chart (nike.com/size-fit/mens-footwear), fetched as a
//   manufacturer cross-check only, never as a formula source.

const INCH_MM = 25.4;

export type ShoeCategory = 'mens' | 'womens' | 'kids';

/** The `category` <select> input's option values — fixed, inherently distinct codes (never a
 *  lookup value that could collide between rows; see the run 6 parked lesson in STATUS.md). */
export const CATEGORY_CODE: Record<ShoeCategory, number> = { mens: 0, womens: 1, kids: 2 };

export function categoryFromCode(code: number): ShoeCategory {
  return code === 1 ? 'womens' : code === 2 ? 'kids' : 'mens';
}

// --- Adults: ISO 19407's own unified formulas, quoted directly from the Wikipedia section above ---
// "UK shoe size = (L + 2x8.46(6)) / 8.46(6) - 25 = (3/25.4) x L - 23", L = foot length in mm.
export function ukAdultSize(footMm: number): number {
  return (3 / INCH_MM) * footMm - 23;
}

// "EUR = 1.27 x (UK + 23) + 2" combined with "L = 20/3 x (EUR - 2)" gives EUR = 0.15 x L + 2
// directly from foot length in mm (algebraically identical to the quoted pair, see the run's
// verification script). The EU allowance (2 Paris points, ~13.3 mm) is baked in here and is NOT
// the same as the UK/US allowance below — the two systems' own allowances are kept separate on
// purpose, never mixed into a single "foot to last" conversion.
export function euAdultSize(footMm: number): number {
  return 0.15 * footMm + 2;
}

// "the most common is the customary system where men's shoes are numbered higher by one than the
// UK equivalent" (Wikipedia, "United States" section).
export function usMensSize(footMm: number): number {
  return ukAdultSize(footMm) + 1;
}

// Two documented US women's scales (Wikipedia, "United States" section):
// - "common": women's = men's + 1.5 — matches Nike's own chart at every row checked, used here.
// - "standard"/FIA (Footwear Industries of America): women's = men's + 1.
export function usWomensSize(footMm: number, scale: 'common' | 'fia' = 'common'): number {
  return usMensSize(footMm) + (scale === 'common' ? 1.5 : 1);
}

// --- Children: literal quoted formulas, in last length (inches) ---
// "child foot size = 3 x last length (in) - 12" (UK); "= 3 x last length (in) - 11 3/4" (US).
// Children's last length (ISO 19407, quoted): "8% greater than foot length plus 6 mm" — a
// different, documented allowance from the adults' fixed last-length addition above.
export function childLastMm(footMm: number): number {
  return footMm * 1.08 + 6;
}

export function ukChildSize(footMm: number): number {
  return 3 * (childLastMm(footMm) / INCH_MM) - 12;
}

export function usChildSize(footMm: number): number {
  return 3 * (childLastMm(footMm) / INCH_MM) - 11.75;
}

// No separately published Paris-point formula for children's lasts was found. This applies the
// article's general principle ("shoe size is the last length in Paris points ... for adults and
// children alike") to the ISO children's last-length figure above — the least-certain of the
// three converted sizes, flagged as such in the kids page's copy.
export function euChildSize(footMm: number): number {
  return 1.5 * (childLastMm(footMm) / 10);
}

export function roundToHalf(size: number): number {
  return Math.round(size * 2) / 2;
}

export function roundToWhole(size: number): number {
  return Math.round(size);
}

// ISO's casual-footwear Mondopoint interval (5 mm; protective footwear uses 7.5 mm, not used here).
export function roundMondopoint(footMm: number, intervalMm = 5): number {
  return Math.round(footMm / intervalMm) * intervalMm;
}

// Last length 4 in = UK child 0; 8 1/2 in = UK child 13 1/2 (both quoted). A foot outside this
// range has no valid UK/US/EU children's size.
export function isValidChildFoot(footMm: number): boolean {
  if (!(footMm > 0)) return false;
  const uk = ukChildSize(footMm);
  return uk >= 0 && uk <= 13.5;
}

// Last length 8 2/3 in = UK adult 1 (quoted). A foot shorter than that has no valid adult size.
export function isValidAdultFoot(footMm: number): boolean {
  return footMm > 0 && ukAdultSize(footMm) >= 1;
}

export type ShoeSizeResult = { usSize: number; ukSize: number; euSize: number; mondopoint: number };

/**
 * Every size from one foot length (mm), for one category — the live calculator's only entry
 * point. Always computes UK/US/EU straight from `footMm`, never by inverting one system's result
 * and re-deriving through another's (see the kids'-table note in lib/shoeSizes.spec.ts for why
 * that round trip is floating-point-fragile and avoided here).
 */
export function shoeSizesFromFootMm(footMm: number, category: ShoeCategory): ShoeSizeResult {
  const mondopoint = roundMondopoint(footMm);
  if (category === 'kids') {
    if (!isValidChildFoot(footMm)) return { usSize: NaN, ukSize: NaN, euSize: NaN, mondopoint };
    return {
      usSize: roundToHalf(usChildSize(footMm)),
      ukSize: roundToHalf(ukChildSize(footMm)),
      euSize: roundToWhole(euChildSize(footMm)),
      mondopoint
    };
  }
  if (!isValidAdultFoot(footMm)) return { usSize: NaN, ukSize: NaN, euSize: NaN, mondopoint };
  return {
    usSize: roundToHalf(category === 'womens' ? usWomensSize(footMm) : usMensSize(footMm)),
    ukSize: roundToHalf(ukAdultSize(footMm)),
    euSize: roundToWhole(euAdultSize(footMm)),
    mondopoint
  };
}

/** Foot length (mm) for a target UK/US-men's adult size — single hop, used only to build the
 *  static men's/women's chart tables (US men's = UK + 1, so a target US men's size `m` inverts via
 *  UK = m - 1). */
export function footMmFromUkAdult(ukSize: number): number {
  return (ukSize + 23) * (INCH_MM / 3);
}

/**
 * Foot length (mm) and every children's size for a target US kids' size, computed from ONE shared
 * last-length value (never by inverting usChildSize/ukChildSize's own footMm and re-deriving
 * through the other). Used only to build the static kids' chart table — see
 * lib/shoeSizes.spec.ts, "children's round-trip hazard", for why the two-hop version can
 * mis-round an exact half-size tie.
 */
export function kidsSizesFromTargetUsSize(targetUsSize: number): { usSize: number; ukSize: number; euSize: number; footMm: number } {
  const lastIn = (targetUsSize + 11.75) / 3;
  const lastMm = lastIn * INCH_MM;
  return {
    usSize: targetUsSize,
    ukSize: 3 * lastIn - 12,
    euSize: 1.5 * (lastMm / 10),
    footMm: (lastMm - 6) / 1.08
  };
}
