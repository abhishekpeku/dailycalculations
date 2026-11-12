// VSEPR (Valence Shell Electron Pair Repulsion) electron-pair geometries and molecular shapes,
// keyed by (bonding pairs, lone pairs) on the central atom — up to 6 total electron domains, the
// standard general-chemistry teaching set. Sourced from OpenStax Chemistry 2e, §7.6 "Molecular
// Structure and Polarity," Figure 7.19 (fetched directly, 2026-11-13). Bond-angle text follows that
// figure's own wording exactly where it gives one (180°, 120°, 109.5°, water's 104.5°, the 90°/120°
// pair for trigonal bipyramidal, 90° for octahedral and square planar); combinations the figure only
// describes qualitatively ("less than 90°," "slightly smaller than 109.5°") are not given an invented
// precise number here, matching the source.
//
// A row's `code` (bondingPairs * 10 + lonePairs) is a stable, distinct integer used as a
// `BreakdownOutput.labels` key, the same device `electron-configuration-calculator` uses for its
// atomic-number-keyed lookups — see data/calculators/types.ts's `labels` doc comment.
//
// One combination from the source figure is intentionally left out: 5 electron domains with 3 lone
// pairs (linear, 2 bonding pairs) — rarely taught in a general-chemistry course and not worth the
// extra row; see molecular-geometry-calculator's own watchOut item.

export type GeometryEntry = {
  code: number;
  bondingPairs: number;
  lonePairs: number;
  domains: number;
  electronGeometry: string;
  molecularShape: string;
  bondAngle: string;
  examples: string;
};

const ROWS: Omit<GeometryEntry, 'code' | 'domains'>[] = [
  { bondingPairs: 2, lonePairs: 0, electronGeometry: 'Linear', molecularShape: 'Linear', bondAngle: '180°', examples: 'CO₂, BeF₂' },
  { bondingPairs: 3, lonePairs: 0, electronGeometry: 'Trigonal planar', molecularShape: 'Trigonal planar', bondAngle: '120°', examples: 'BF₃, SO₃' },
  { bondingPairs: 2, lonePairs: 1, electronGeometry: 'Trigonal planar', molecularShape: 'Bent', bondAngle: 'Slightly less than 120°', examples: 'SO₂, O₃' },
  { bondingPairs: 4, lonePairs: 0, electronGeometry: 'Tetrahedral', molecularShape: 'Tetrahedral', bondAngle: '109.5°', examples: 'CH₄, SiCl₄' },
  { bondingPairs: 3, lonePairs: 1, electronGeometry: 'Tetrahedral', molecularShape: 'Trigonal pyramidal', bondAngle: 'Slightly less than 109.5°', examples: 'NH₃, PCl₃' },
  { bondingPairs: 2, lonePairs: 2, electronGeometry: 'Tetrahedral', molecularShape: 'Bent', bondAngle: 'Slightly less than 109.5° (104.5° in water)', examples: 'H₂O, OF₂' },
  { bondingPairs: 5, lonePairs: 0, electronGeometry: 'Trigonal bipyramidal', molecularShape: 'Trigonal bipyramidal', bondAngle: '90° and 120°', examples: 'PCl₅' },
  { bondingPairs: 4, lonePairs: 1, electronGeometry: 'Trigonal bipyramidal', molecularShape: 'Seesaw', bondAngle: 'Less than 90° and less than 120°', examples: 'SF₄' },
  { bondingPairs: 3, lonePairs: 2, electronGeometry: 'Trigonal bipyramidal', molecularShape: 'T-shaped', bondAngle: 'Less than 90°', examples: 'ClF₃' },
  { bondingPairs: 6, lonePairs: 0, electronGeometry: 'Octahedral', molecularShape: 'Octahedral', bondAngle: '90°', examples: 'SF₆' },
  { bondingPairs: 5, lonePairs: 1, electronGeometry: 'Octahedral', molecularShape: 'Square pyramidal', bondAngle: 'Slightly less than 90°', examples: 'BrF₅' },
  { bondingPairs: 4, lonePairs: 2, electronGeometry: 'Octahedral', molecularShape: 'Square planar', bondAngle: '90°', examples: 'XeF₄' }
];

export const GEOMETRY_TABLE: GeometryEntry[] = ROWS.map((row) => ({
  ...row,
  code: row.bondingPairs * 10 + row.lonePairs,
  domains: row.bondingPairs + row.lonePairs
}));

export function findGeometry(bondingPairs: number, lonePairs: number): GeometryEntry | undefined {
  const bp = Math.round(bondingPairs);
  const lp = Math.round(lonePairs);
  return GEOMETRY_TABLE.find((entry) => entry.bondingPairs === bp && entry.lonePairs === lp);
}

/** `CalculatorInput.options` for the bonding-pairs field: value = count, label = the count itself. */
export const BONDING_PAIR_OPTIONS: { value: number; label: string }[] = [2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }));

/** `CalculatorInput.options` for the lone-pairs field. */
export const LONE_PAIR_OPTIONS: { value: number; label: string }[] = [0, 1, 2, 3].map((n) => ({ value: n, label: String(n) }));

/** `BreakdownOutput.labels`, keyed by `GeometryEntry.code`, one array per displayed field. */
export const ELECTRON_GEOMETRY_LABELS = GEOMETRY_TABLE.map((entry) => ({ value: entry.code, label: entry.electronGeometry }));
export const MOLECULAR_SHAPE_LABELS = GEOMETRY_TABLE.map((entry) => ({ value: entry.code, label: entry.molecularShape }));
export const BOND_ANGLE_LABELS = GEOMETRY_TABLE.map((entry) => ({ value: entry.code, label: entry.bondAngle }));
export const EXAMPLE_LABELS = GEOMETRY_TABLE.map((entry) => ({ value: entry.code, label: entry.examples }));
