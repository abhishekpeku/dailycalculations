// Conversion factors to the SI base unit of each dimension. Exact where the definition is exact
// (lb, ft, g0); otherwise NIST SP 811 Appendix B.
export type UnitDimension = 'mass' | 'acceleration' | 'force';

export type Unit = {
  id: string;
  label: string;
  toBase: number;
};

const STANDARD_GRAVITY = 9.80665;

export const UNITS: Record<UnitDimension, Unit[]> = {
  mass: [
    { id: 'kg', label: 'kg', toBase: 1 },
    { id: 'g', label: 'g', toBase: 0.001 },
    { id: 't', label: 't', toBase: 1000 },
    { id: 'lb', label: 'lb', toBase: 0.45359237 },
    { id: 'oz', label: 'oz', toBase: 0.028349523125 }
  ],
  acceleration: [
    { id: 'm/s2', label: 'm/s²', toBase: 1 },
    { id: 'ft/s2', label: 'ft/s²', toBase: 0.3048 },
    { id: 'g0', label: 'g', toBase: STANDARD_GRAVITY },
    { id: 'kmh/s', label: 'km/h per s', toBase: 1000 / 3600 }
  ],
  force: [
    { id: 'N', label: 'N', toBase: 1 },
    { id: 'kN', label: 'kN', toBase: 1000 },
    { id: 'MN', label: 'MN', toBase: 1e6 },
    { id: 'lbf', label: 'lbf', toBase: 0.45359237 * STANDARD_GRAVITY },
    { id: 'kgf', label: 'kgf', toBase: STANDARD_GRAVITY },
    { id: 'dyn', label: 'dyn', toBase: 1e-5 }
  ]
};

export function findUnit(dimension: UnitDimension, unitId: string) {
  return UNITS[dimension].find((unit) => unit.id === unitId) ?? UNITS[dimension][0];
}

export function toBase(value: number, dimension: UnitDimension, unitId: string) {
  return value * findUnit(dimension, unitId).toBase;
}

export function fromBase(value: number, dimension: UnitDimension, unitId: string) {
  return value / findUnit(dimension, unitId).toBase;
}
