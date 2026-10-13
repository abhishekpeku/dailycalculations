// Unit conversions to the base unit of each dimension (the first unit listed, factor 1). Exact where
// the definition is exact; otherwise NIST SP 811 Appendix B. See mdFiles/steps/30-units-v2.md.
export type UnitDimension =
  | 'mass'
  | 'acceleration'
  | 'force'
  | 'length'
  | 'area'
  | 'volume'
  | 'time'
  | 'speed'
  | 'temperature'
  | 'energy'
  | 'power'
  | 'pressure'
  | 'data'
  | 'fuelEconomy'
  | 'percent'
  | 'count'
  | 'currency';

// base = (value + offset) × factor. The offset is only for affine scales (temperature).
type LinearConversion = { factor: number; offset?: number };
// For conversions that are not linear, e.g. L/100 km ↔ mpg (reciprocal).
type FunctionConversion = { toBase: (value: number) => number; fromBase: (value: number) => number };

export type Unit = { id: string; label: string } & (LinearConversion | FunctionConversion);

const STANDARD_GRAVITY = 9.80665;
const INCH = 0.0254;
const FOOT = 0.3048;
const YARD = 0.9144;
const MILE = 1609.344;
const NAUTICAL_MILE = 1852;
const POUND = 0.45359237;
const POUND_FORCE = POUND * STANDARD_GRAVITY;
const US_GALLON = 3.785411784e-3;
const UK_GALLON = 4.54609e-3;
const US_FLUID_OUNCE = US_GALLON / 128;
const UK_FLUID_OUNCE = UK_GALLON / 160;
const CALORIE = 4.184;
const BTU = 1055.05585262;
const MM_HG = 133.322387415;
const HOUR = 3600;
const DAY = 86400;
const YEAR = 365.25 * DAY;
const BYTE = 8;

// Reciprocal unit: base = k / value, value = k / base.
const inverse = (k: number): FunctionConversion => ({ toBase: (value) => k / value, fromBase: (value) => k / value });

export const UNITS: Record<UnitDimension, Unit[]> = {
  mass: [
    { id: 'kg', label: 'kg', factor: 1 },
    { id: 'g', label: 'g', factor: 0.001 },
    { id: 't', label: 't', factor: 1000 },
    { id: 'lb', label: 'lb', factor: POUND },
    { id: 'oz', label: 'oz', factor: 0.028349523125 }
  ],
  acceleration: [
    { id: 'm/s2', label: 'm/s²', factor: 1 },
    { id: 'ft/s2', label: 'ft/s²', factor: FOOT },
    { id: 'g0', label: 'g', factor: STANDARD_GRAVITY },
    { id: 'kmh/s', label: 'km/h per s', factor: 1000 / 3600 }
  ],
  force: [
    { id: 'N', label: 'N', factor: 1 },
    { id: 'kN', label: 'kN', factor: 1000 },
    { id: 'MN', label: 'MN', factor: 1e6 },
    { id: 'lbf', label: 'lbf', factor: POUND_FORCE },
    { id: 'kgf', label: 'kgf', factor: STANDARD_GRAVITY },
    { id: 'dyn', label: 'dyn', factor: 1e-5 }
  ],
  // International yard and pound agreement (1959): exact. Nautical mile: exact (1852 m).
  length: [
    { id: 'm', label: 'm', factor: 1 },
    { id: 'km', label: 'km', factor: 1000 },
    { id: 'cm', label: 'cm', factor: 0.01 },
    { id: 'mm', label: 'mm', factor: 0.001 },
    { id: 'mi', label: 'mi', factor: MILE },
    { id: 'yd', label: 'yd', factor: YARD },
    { id: 'ft', label: 'ft', factor: FOOT },
    { id: 'in', label: 'in', factor: INCH },
    { id: 'nmi', label: 'nmi', factor: NAUTICAL_MILE }
  ],
  // Squares of the exact lengths; acre = 4840 yd² (international, not US survey).
  area: [
    { id: 'm2', label: 'm²', factor: 1 },
    { id: 'km2', label: 'km²', factor: 1e6 },
    { id: 'cm2', label: 'cm²', factor: 1e-4 },
    { id: 'mm2', label: 'mm²', factor: 1e-6 },
    { id: 'ha', label: 'ha', factor: 1e4 },
    { id: 'mi2', label: 'mi²', factor: MILE * MILE },
    { id: 'acre', label: 'acre', factor: 4840 * YARD * YARD },
    { id: 'yd2', label: 'yd²', factor: YARD * YARD },
    { id: 'ft2', label: 'ft²', factor: FOOT * FOOT },
    { id: 'in2', label: 'in²', factor: INCH * INCH }
  ],
  // US gallon = 231 in³ and imperial gallon = 4.54609 L, both exact; US cup = 8 US fl oz (customary).
  volume: [
    { id: 'm3', label: 'm³', factor: 1 },
    { id: 'L', label: 'L', factor: 1e-3 },
    { id: 'mL', label: 'mL', factor: 1e-6 },
    { id: 'gal', label: 'gal (US)', factor: US_GALLON },
    { id: 'qt', label: 'qt (US)', factor: US_GALLON / 4 },
    { id: 'pt', label: 'pt (US)', factor: US_GALLON / 8 },
    { id: 'cup', label: 'cup (US)', factor: US_FLUID_OUNCE * 8 },
    { id: 'floz', label: 'fl oz (US)', factor: US_FLUID_OUNCE },
    { id: 'tbsp', label: 'tbsp (US)', factor: US_FLUID_OUNCE / 2 },
    { id: 'tsp', label: 'tsp (US)', factor: US_FLUID_OUNCE / 6 },
    { id: 'galUK', label: 'gal (UK)', factor: UK_GALLON },
    { id: 'ptUK', label: 'pt (UK)', factor: UK_GALLON / 8 },
    { id: 'flozUK', label: 'fl oz (UK)', factor: UK_FLUID_OUNCE },
    { id: 'cupMetric', label: 'cup (metric)', factor: 250e-6 },
    { id: 'tbspMetric', label: 'tbsp (metric)', factor: 15e-6 },
    { id: 'tspMetric', label: 'tsp (metric)', factor: 5e-6 },
    { id: 'ft3', label: 'ft³', factor: FOOT ** 3 },
    { id: 'yd3', label: 'yd³', factor: YARD ** 3 },
    { id: 'in3', label: 'in³', factor: INCH ** 3 }
  ],
  // Exact SI multiples; year = Julian year (365.25 d) and month = year / 12, as averages.
  time: [
    { id: 's', label: 's', factor: 1 },
    { id: 'ms', label: 'ms', factor: 0.001 },
    { id: 'min', label: 'min', factor: 60 },
    { id: 'h', label: 'h', factor: HOUR },
    { id: 'd', label: 'days', factor: DAY },
    { id: 'wk', label: 'weeks', factor: 7 * DAY },
    { id: 'mo', label: 'months', factor: YEAR / 12 },
    { id: 'yr', label: 'years', factor: YEAR }
  ],
  // Ratios of the exact lengths and times above; knot = 1852 m/h.
  speed: [
    { id: 'm/s', label: 'm/s', factor: 1 },
    { id: 'km/h', label: 'km/h', factor: 1000 / HOUR },
    { id: 'mph', label: 'mph', factor: MILE / HOUR },
    { id: 'kn', label: 'kn', factor: NAUTICAL_MILE / HOUR },
    { id: 'ft/s', label: 'ft/s', factor: FOOT }
  ],
  // Affine and exact: K = °C + 273.15, K = (°F + 459.67) × 5/9, K = °R × 5/9.
  temperature: [
    { id: 'K', label: 'K', factor: 1 },
    { id: 'C', label: '°C', factor: 1, offset: 273.15 },
    { id: 'F', label: '°F', factor: 5 / 9, offset: 459.67 },
    { id: 'R', label: '°R', factor: 5 / 9 }
  ],
  // Thermochemical calorie (4.184 J, exact; food "Calories" are kcal); International Table Btu (NIST SP 811 B.8).
  energy: [
    { id: 'J', label: 'J', factor: 1 },
    { id: 'kJ', label: 'kJ', factor: 1000 },
    { id: 'MJ', label: 'MJ', factor: 1e6 },
    { id: 'cal', label: 'cal', factor: CALORIE },
    { id: 'kcal', label: 'kcal', factor: CALORIE * 1000 },
    { id: 'Wh', label: 'Wh', factor: HOUR },
    { id: 'kWh', label: 'kWh', factor: HOUR * 1000 },
    { id: 'BTU', label: 'BTU', factor: BTU },
    { id: 'ftlbf', label: 'ft·lbf', factor: FOOT * POUND_FORCE }
  ],
  // Mechanical hp = 550 ft·lbf/s and metric hp (PS) = 75 kgf·m/s, both exact from their definitions.
  power: [
    { id: 'W', label: 'W', factor: 1 },
    { id: 'kW', label: 'kW', factor: 1000 },
    { id: 'MW', label: 'MW', factor: 1e6 },
    { id: 'hp', label: 'hp', factor: 550 * FOOT * POUND_FORCE },
    { id: 'PS', label: 'PS (metric hp)', factor: 75 * STANDARD_GRAVITY },
    { id: 'BTU/h', label: 'BTU/h', factor: BTU / HOUR }
  ],
  // atm, bar and psi exact from definitions; mmHg/inHg conventional (13.5951 g/cm³ × g0, NIST SP 811 B.8).
  pressure: [
    { id: 'Pa', label: 'Pa', factor: 1 },
    { id: 'kPa', label: 'kPa', factor: 1000 },
    { id: 'MPa', label: 'MPa', factor: 1e6 },
    { id: 'bar', label: 'bar', factor: 1e5 },
    { id: 'mbar', label: 'mbar', factor: 100 },
    { id: 'psi', label: 'psi', factor: POUND_FORCE / (INCH * INCH) },
    { id: 'atm', label: 'atm', factor: 101325 },
    { id: 'mmHg', label: 'mmHg', factor: MM_HG },
    { id: 'inHg', label: 'inHg', factor: MM_HG * 25.4 },
    { id: 'Torr', label: 'Torr', factor: 101325 / 760 }
  ],
  // IEC 80000-13: decimal prefixes are powers of 1000 (KB = 1000 B), binary prefixes powers of 1024 (KiB).
  data: [
    { id: 'bit', label: 'bit', factor: 1 },
    { id: 'kbit', label: 'kbit', factor: 1e3 },
    { id: 'Mbit', label: 'Mbit', factor: 1e6 },
    { id: 'Gbit', label: 'Gbit', factor: 1e9 },
    { id: 'B', label: 'B', factor: BYTE },
    { id: 'KB', label: 'KB', factor: BYTE * 1e3 },
    { id: 'MB', label: 'MB', factor: BYTE * 1e6 },
    { id: 'GB', label: 'GB', factor: BYTE * 1e9 },
    { id: 'TB', label: 'TB', factor: BYTE * 1e12 },
    { id: 'PB', label: 'PB', factor: BYTE * 1e15 },
    { id: 'KiB', label: 'KiB', factor: BYTE * 2 ** 10 },
    { id: 'MiB', label: 'MiB', factor: BYTE * 2 ** 20 },
    { id: 'GiB', label: 'GiB', factor: BYTE * 2 ** 30 },
    { id: 'TiB', label: 'TiB', factor: BYTE * 2 ** 40 }
  ],
  // Base is volume per distance (m³/m), so L/100 km is a factor and the distance-per-volume units are
  // reciprocals. Built from the exact mile and gallons above.
  fuelEconomy: [
    { id: 'm3/m', label: 'm³/m', factor: 1 },
    { id: 'L/100km', label: 'L/100 km', factor: 1e-3 / 1e5 },
    { id: 'mpg', label: 'mpg (US)', ...inverse(US_GALLON / MILE) },
    { id: 'mpgUK', label: 'mpg (UK)', ...inverse(UK_GALLON / MILE) },
    { id: 'km/L', label: 'km/L', ...inverse(1e-3 / 1000) }
  ],
  // Unit-less. The base value is the percent number itself (5 means 5%).
  percent: [{ id: '%', label: '%', factor: 1 }],
  count: [{ id: 'count', label: '', factor: 1 }],
  // Placeholder until the region step sets the currency symbol and formatting.
  currency: [{ id: 'currency', label: '¤', factor: 1 }]
};

export function findUnit(dimension: UnitDimension, unitId: string) {
  return UNITS[dimension].find((unit) => unit.id === unitId) ?? UNITS[dimension][0];
}

export function toBase(value: number, dimension: UnitDimension, unitId: string) {
  const unit = findUnit(dimension, unitId);
  if (!('factor' in unit)) return unit.toBase(value);
  return unit.offset ? (value + unit.offset) * unit.factor : value * unit.factor;
}

export function fromBase(value: number, dimension: UnitDimension, unitId: string) {
  const unit = findUnit(dimension, unitId);
  if (!('factor' in unit)) return unit.fromBase(value);
  return unit.offset ? value / unit.factor - unit.offset : value / unit.factor;
}
