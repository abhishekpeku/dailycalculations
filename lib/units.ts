import { currencySymbol } from './calculator.ts';

// Unit conversions to the base unit of each dimension (the first unit listed, factor 1). Exact where
// the definition is exact; otherwise NIST SP 811 Appendix B. See mdFiles/steps/30-units-v2.md.
export type UnitDimension =
  | 'mass'
  | 'acceleration'
  | 'force'
  | 'angle'
  | 'length'
  | 'area'
  | 'volume'
  | 'time'
  | 'speed'
  | 'pace'
  | 'temperature'
  | 'energy'
  | 'power'
  | 'pressure'
  | 'momentum'
  | 'density'
  | 'voltage'
  | 'current'
  | 'resistance'
  | 'capacitance'
  | 'charge'
  | 'frequency'
  | 'decibel'
  | 'specificHeat'
  | 'temperatureDelta'
  | 'amountOfSubstance'
  | 'concentration'
  | 'osmolarity'
  | 'normality'
  | 'molarMass'
  | 'rateConstant'
  | 'molarEnergy'
  | 'molarEntropy'
  | 'molality'
  | 'massConcentration'
  | 'pH'
  | 'data'
  | 'fuelEconomy'
  | 'fuelPrice'
  | 'evEfficiency'
  | 'percent'
  | 'count'
  | 'currency'
  | 'term';

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
    { id: 'oz', label: 'oz', factor: 0.028349523125 },
    // Stone (UK body weight) = 14 lb, exact. Appended last so the earlier menu order is unchanged.
    { id: 'st', label: 'st', factor: 14 * POUND }
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
  // SI derived unit is the radian; degree = pi/180 rad exactly, by definition (BIPM SI Brochure §2.3.3).
  angle: [
    { id: 'rad', label: 'rad', factor: 1 },
    { id: 'deg', label: '°', factor: Math.PI / 180 }
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
  // Running pace, time per distance (the reciprocal of speed). Exact from the mile and kilometer.
  pace: [
    { id: 's/m', label: 's/m', factor: 1 },
    { id: 'min/km', label: 'min/km', factor: 60 / 1000 },
    { id: 'min/mi', label: 'min/mi', factor: 60 / MILE },
    { id: 's/100m', label: 's/100 m', factor: 1 / 100 }
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
  // SI derived unit kg·m/s. A newton is defined as 1 kg·m/s² (BIPM SI Brochure), so N·s = kg·m/s²·s
  // = kg·m/s exactly — the same unit under the name conventionally used for impulse rather than momentum.
  momentum: [
    { id: 'kgm/s', label: 'kg·m/s', factor: 1 },
    { id: 'Ns', label: 'N·s', factor: 1 }
  ],
  // SI derived unit kg/m³. 1 g/cm³ = 1000 kg/m³ exactly (cm³ is 1e-6 m³, g is 1e-3 kg); lb/ft³ from
  // the exact pound and foot above (NIST SP 811 Appendix B).
  density: [
    { id: 'kg/m3', label: 'kg/m³', factor: 1 },
    { id: 'g/cm3', label: 'g/cm³', factor: 1000 },
    { id: 'lb/ft3', label: 'lb/ft³', factor: POUND / FOOT ** 3 }
  ],
  // SI derived unit (BIPM SI Brochure): 1 V = 1 W/A. Decimal multiples per NIST SP 811 §4.
  voltage: [
    { id: 'V', label: 'V', factor: 1 },
    { id: 'mV', label: 'mV', factor: 1e-3 },
    { id: 'kV', label: 'kV', factor: 1e3 }
  ],
  // SI base unit since the 2019 redefinition (BIPM SI Brochure, via the elementary charge).
  current: [
    { id: 'A', label: 'A', factor: 1 },
    { id: 'mA', label: 'mA', factor: 1e-3 },
    { id: 'uA', label: 'µA', factor: 1e-6 },
    { id: 'kA', label: 'kA', factor: 1e3 }
  ],
  // SI derived unit (BIPM SI Brochure): 1 Ω = 1 V/A.
  resistance: [
    { id: 'ohm', label: 'Ω', factor: 1 },
    { id: 'mohm', label: 'mΩ', factor: 1e-3 },
    { id: 'kohm', label: 'kΩ', factor: 1e3 },
    { id: 'Mohm', label: 'MΩ', factor: 1e6 }
  ],
  // SI derived unit (BIPM SI Brochure): 1 F = 1 C/V. Real capacitors mostly sit at mF and below.
  capacitance: [
    { id: 'F', label: 'F', factor: 1 },
    { id: 'mF', label: 'mF', factor: 1e-3 },
    { id: 'uF', label: 'µF', factor: 1e-6 },
    { id: 'nF', label: 'nF', factor: 1e-9 },
    { id: 'pF', label: 'pF', factor: 1e-12 }
  ],
  // SI derived unit (BIPM SI Brochure): 1 C = 1 A·s. A capacitor's stored charge (Q = CV) is
  // conventionally reported in µC or mC, since typical capacitor/voltage combinations give
  // sub-coulomb answers.
  charge: [
    { id: 'C', label: 'C', factor: 1 },
    { id: 'mC', label: 'mC', factor: 1e-3 },
    { id: 'uC', label: 'µC', factor: 1e-6 },
    { id: 'nC', label: 'nC', factor: 1e-9 }
  ],
  // SI derived unit (BIPM SI Brochure): 1 Hz = 1 cycle per second = 1 s⁻¹.
  frequency: [
    { id: 'Hz', label: 'Hz', factor: 1 },
    { id: 'kHz', label: 'kHz', factor: 1e3 },
    { id: 'MHz', label: 'MHz', factor: 1e6 },
    { id: 'GHz', label: 'GHz', factor: 1e9 }
  ],
  // Unitless logarithmic ratio (IEC 60027-3 / ISO 80000-3: the bel is log10 of a power ratio, the
  // decibel is one tenth of a bel). The base value is the dB number itself, like percent/count.
  decibel: [{ id: 'dB', label: 'dB', factor: 1 }],
  // SI derived unit J/(kg·K). 1 J/(g·K) = 1000 J/(kg·K) exactly; 1 cal/(g·°C) = 4184 J/(kg·K) exactly
  // (thermochemical calorie × 1000, since 1 g = 0.001 kg and a 1°C interval equals a 1 K interval).
  specificHeat: [
    { id: 'J/kgK', label: 'J/(kg·K)', factor: 1 },
    { id: 'J/gK', label: 'J/(g·K)', factor: 1000 },
    { id: 'cal/gC', label: 'cal/(g·°C)', factor: CALORIE * 1000 }
  ],
  // A temperature INTERVAL, not an absolute reading — no offset, unlike `temperature` above. A 1°C
  // change equals a 1 K change exactly; a 1°F change is 5/9 of a K change exactly (NIST SP 811 §B.9).
  temperatureDelta: [
    { id: 'K', label: 'K', factor: 1 },
    { id: 'C', label: '°C', factor: 1 },
    { id: 'F', label: '°F', factor: 5 / 9 }
  ],
  // The mole, SI base unit of amount of substance since the 2019 redefinition (BIPM SI Brochure) —
  // one mole is exactly 6.02214076e23 elementary entities, same precedent as `current`'s comment.
  amountOfSubstance: [
    { id: 'mol', label: 'mol', factor: 1 },
    { id: 'mmol', label: 'mmol', factor: 1e-3 },
    { id: 'umol', label: 'µmol', factor: 1e-6 }
  ],
  // SI-coherent derived unit mol/m³ (amountOfSubstance / volume, both already SI base above), same
  // pattern as `density` (kg/m³). Chemists report concentration (molarity) in mol/L ("M") almost
  // exclusively, so that is the practical display unit even though it is not this dimension's base:
  // 1 mol/L = 1 mol / 1e-3 m³ = 1000 mol/m³ (NIST SP 811 Appendix B, the liter is exactly 1e-3 m³).
  concentration: [
    { id: 'mol/m3', label: 'mol/m³', factor: 1 },
    { id: 'mol/L', label: 'mol/L (M)', factor: 1000 },
    { id: 'mmol/L', label: 'mmol/L', factor: 1 },
    { id: 'umol/L', label: 'µmol/L', factor: 1e-3 }
  ],
  // Osmolarity: total concentration of dissolved particles (a formula unit counted once per piece
  // it actually splits into in solution), the same per-volume counting convention as
  // `concentration` but tracking particles rather than specific formula units. OpenStax Chemistry
  // 2e Section 11.4 "Colligative Properties" defines the van't Hoff factor i (moles of particles in
  // solution ÷ moles of formula units dissolved) that scales a molarity into this quantity. Kept as
  // its own dimension (not folded into `concentration`) so a plain molarity field's unit menu never
  // offers "Osm/L" — same reasoning as `massConcentration` being kept separate from `density`. Base
  // mOsm/L, factor 1 — numerically identical to `concentration`'s mmol/L (both are "per-thousandth-
  // of-base per litre"), which is what keeps osmolarity = molarity × i a plain multiplication with
  // no stray factor between the two dimensions' SI values.
  osmolarity: [
    { id: 'mOsm/L', label: 'mOsm/L', factor: 1 },
    { id: 'Osm/L', label: 'Osm/L', factor: 1000 }
  ],
  // Normality: equivalents of solute per litre, N = molarity × n (n = equivalents per mole — an
  // acid or base's valence, or a redox couple's electron count). NIST SP 811, "Guide for the Use of
  // the International System of Units", Chapter 8 Section 8.6.5 calls the term "normality" and the
  // symbol N obsolete in favor of amount-of-substance concentration, but the unit remains standard
  // in titrimetric analytical chemistry, which is why it is kept as its own dimension rather than
  // folded into `concentration` (same reasoning as `osmolarity` above). Base meq/L, factor 1 — same
  // numeric-scale reasoning as `osmolarity`, so N = M × n stays a plain multiplication.
  normality: [
    { id: 'meq/L', label: 'meq/L', factor: 1 },
    { id: 'eq/L', label: 'eq/L (N)', factor: 1000 }
  ],
  // SI-coherent derived unit kg/mol (mass / amountOfSubstance, both SI base above), so n = m/M stays
  // a plain division with no stray unit factor. Molar mass is conventionally reported in g/mol —
  // 1 g/mol = 1e-3 kg/mol, exact (the gram is exactly 1e-3 kg).
  molarMass: [
    { id: 'kg/mol', label: 'kg/mol', factor: 1 },
    { id: 'g/mol', label: 'g/mol', factor: 1e-3 }
  ],
  // A first-order rate constant, dimension 1/time (BIPM SI Brochure: 1 Hz = 1 s⁻¹, the same
  // physical unit as `frequency` above) — kept as its own dimension because chemists report rate
  // constants in s⁻¹, min⁻¹ or h⁻¹, never Hz/kHz/MHz. The min⁻¹/h⁻¹ factors are the reciprocals of
  // `time`'s own minute (60 s) and hour (3600 s) factors. Also used for the Arrhenius equation's
  // pre-exponential factor A, which shares k's units for a first-order reaction.
  rateConstant: [
    { id: 's-1', label: 's⁻¹', factor: 1 },
    { id: 'min-1', label: 'min⁻¹', factor: 1 / 60 },
    { id: 'h-1', label: 'h⁻¹', factor: 1 / 3600 }
  ],
  // SI-coherent derived unit J/mol (energy / amountOfSubstance, both SI base above) — the unit
  // molar quantities like the Arrhenius equation's activation energy are reported in. kJ/mol is
  // the practical display unit in general chemistry; cal/mol and kcal/mol use the same
  // thermochemical calorie (CALORIE) as the `energy` dimension above.
  molarEnergy: [
    { id: 'J/mol', label: 'J/mol', factor: 1 },
    { id: 'kJ/mol', label: 'kJ/mol', factor: 1000 },
    { id: 'cal/mol', label: 'cal/mol', factor: CALORIE },
    { id: 'kcal/mol', label: 'kcal/mol', factor: CALORIE * 1000 }
  ],
  // SI-coherent derived unit J/(mol·K) (molarEnergy ÷ temperature, both SI base above) — molar
  // entropy, the unit Gibbs free energy's TΔS term needs. kJ/(mol·K) and cal/(mol·K) follow the
  // same factors as `molarEnergy`'s own kJ/mol and cal/mol, since dividing both by the same
  // kelvin leaves the ratio between them unchanged.
  molarEntropy: [
    { id: 'J/molK', label: 'J/(mol·K)', factor: 1 },
    { id: 'kJ/molK', label: 'kJ/(mol·K)', factor: 1000 },
    { id: 'cal/molK', label: 'cal/(mol·K)', factor: CALORIE }
  ],
  // Molality, SI-coherent derived unit mol/kg (amountOfSubstance / mass, both SI base above), same
  // pattern as `concentration` (mol/m³) and `molarMass` (kg/mol): b = n ÷ m stays a plain division
  // with no stray unit factor. "Molal" is the common shorthand name for this unit (IUPAC symbol b,
  // often written m in US general-chemistry texts).
  molality: [
    { id: 'mol/kg', label: 'mol/kg (molal)', factor: 1 },
    { id: 'mmol/kg', label: 'mmol/kg', factor: 1e-3 }
  ],
  // Mass of solute per volume of solution, SI-coherent derived unit kg/m³ — the same physical
  // dimension as `density` above, but kept separate because its practical units (mg/L, ppm) are
  // dilute-solution concentration units, not bulk densities. Base mg/L, factor 1. "ppm" and "ppb"
  // here are the EPA/USGS water-quality convention: for a dilute AQUEOUS solution, whose density is
  // within a fraction of a percent of pure water's 1.00 g/mL, 1 ppm by mass is numerically the same
  // as 1 mg per liter of solution — so ppm and mg/L share a factor here, the same way `momentum`'s
  // kg·m/s and N·s share one (two conventional names for one identical number), not an independent
  // unit conversion. See content.watchOut on solution-concentration-calculator for the condition.
  massConcentration: [
    { id: 'mg/L', label: 'mg/L', factor: 1 },
    { id: 'ppm', label: 'ppm (≈ mg/L, dilute aqueous)', factor: 1 },
    { id: 'g/L', label: 'g/L', factor: 1000 },
    { id: 'ug/L', label: 'µg/L', factor: 0.001 },
    { id: 'ppb', label: 'ppb (≈ µg/L, dilute aqueous)', factor: 0.001 }
  ],
  // Unitless logarithmic scale (IUPAC Gold Book, "pH"): pH = −log₁₀[H⁺], pOH = −log₁₀[OH⁻]. The base
  // value is the pH/pOH number itself, same single-unit precedent as `decibel` and `percent`.
  pH: [{ id: 'pH', label: 'pH', factor: 1 }],
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
  // Money per volume of fuel, so a price follows the fuel-economy unit (US prices per gallon, most
  // others per liter). Base is currency per m³; the gallons are the exact ones above.
  fuelPrice: [
    { id: 'cur/m3', label: `${currencySymbol()}/m³`, factor: 1 },
    { id: 'cur/L', label: `${currencySymbol()}/L`, factor: 1 / 1e-3 },
    { id: 'cur/gal', label: `${currencySymbol()}/gal (US)`, factor: 1 / US_GALLON },
    { id: 'cur/galUK', label: `${currencySymbol()}/gal (UK)`, factor: 1 / UK_GALLON }
  ],
  // Electric-vehicle energy use. Base is energy per distance (J/m), like fuelEconomy; EPA labels use
  // kWh/100 mi. Exact from the kWh (3.6 MJ) and the mile; distance-per-energy units are reciprocals.
  evEfficiency: [
    { id: 'J/m', label: 'J/m', factor: 1 },
    { id: 'kWh/100mi', label: 'kWh/100 mi', factor: (HOUR * 1000) / (100 * MILE) },
    { id: 'kWh/100km', label: 'kWh/100 km', factor: (HOUR * 1000) / 1e5 },
    { id: 'Wh/mi', label: 'Wh/mi', factor: HOUR / MILE },
    { id: 'Wh/km', label: 'Wh/km', factor: HOUR / 1000 },
    { id: 'mi/kWh', label: 'mi/kWh', ...inverse((HOUR * 1000) / MILE) },
    { id: 'km/kWh', label: 'km/kWh', ...inverse((HOUR * 1000) / 1000) }
  ],
  // Unit-less. The base value is the percent number itself (5 means 5%).
  percent: [{ id: '%', label: '%', factor: 1 }],
  count: [{ id: 'count', label: '', factor: 1 }],
  // The symbol comes from lib/calculator.ts so the solver and breakdown widgets agree.
  currency: [{ id: 'currency', label: currencySymbol(), factor: 1 }],
  // A loan or savings term in whole calendar months: 1 year = 12 months, exact by definition.
  term: [
    { id: 'mo', label: 'months', factor: 1 },
    { id: 'yr', label: 'years', factor: 12 }
  ]
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
