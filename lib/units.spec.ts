// Unit library checks. See mdFiles/steps/30-units-v2.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { UNITS, findUnit, fromBase, toBase, type UnitDimension } from './units.ts';
import { currencySymbol } from './calculator.ts';

const dimensions = Object.keys(UNITS) as UnitDimension[];

const close = (actual: number, expected: number, tolerance = 1e-12) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} ≈ ${expected}`
  );

// Convert a value between two units of the same dimension.
const convert = (value: number, dimension: UnitDimension, from: string, to: string) =>
  fromBase(toBase(value, dimension, from), dimension, to);

describe('unit tables', () => {
  test('every dimension has units with unique ids', () => {
    for (const dimension of dimensions) {
      const ids = UNITS[dimension].map((unit) => unit.id);
      assert.ok(ids.length > 0, dimension);
      assert.equal(new Set(ids).size, ids.length, `${dimension}: duplicate unit id`);
    }
  });

  test('every dimension’s first unit is its base (factor 1, no offset)', () => {
    for (const dimension of dimensions) {
      const base = UNITS[dimension][0];
      assert.ok('factor' in base, `${dimension}: base must be a factor unit`);
      assert.equal(base.factor, 1, dimension);
      assert.ok(!base.offset, `${dimension}: base has an offset`);
      for (const x of [0, 1, -3.5, 1234.5678]) {
        assert.equal(toBase(x, dimension, base.id), x);
        assert.equal(fromBase(x, dimension, base.id), x);
      }
    }
  });

  test('covers the dimensions the v2 rollout needs', () => {
    assert.deepEqual([...dimensions].sort(), [
      'absorbance', 'acceleration', 'amountOfSubstance', 'angle', 'angularMomentum', 'angularVelocity', 'area', 'basePairs', 'capacitance', 'cellDensity', 'charge', 'concentration', 'count', 'currency', 'current', 'data',
      'decibel', 'density', 'electricField', 'energy', 'evEfficiency', 'force', 'frequency', 'fuelEconomy', 'fuelPrice', 'inductance', 'length', 'magneticFlux', 'magneticFluxDensity', 'mass', 'massConcentration', 'molalConstant', 'molality', 'molarAbsorptivity', 'molarEnergy', 'molarEntropy', 'molarHeatCapacity', 'molarMass', 'momentOfInertia', 'momentum',
      'normality', 'osmolarity', 'pH', 'pace', 'percent', 'power', 'pressure', 'rateConstant', 'relativeCentrifugalForce', 'resistance', 'specificHeat', 'specificLatentHeat', 'speed', 'springConstant', 'temperature', 'temperatureDelta', 'term', 'thermalExpansionCoeff', 'time',
      'torque', 'voltage', 'volume'
    ]);
  });

  test('findUnit falls back to the base unit for an unknown id', () => {
    for (const dimension of dimensions) {
      assert.equal(findUnit(dimension, 'no-such-unit'), UNITS[dimension][0]);
    }
  });
});

describe('round trips', () => {
  const values = [1, 0.5, 42, 1234.5678, 1e-3, 1e6];
  for (const dimension of dimensions) {
    test(dimension, () => {
      for (const unit of UNITS[dimension]) {
        for (const x of values) {
          close(fromBase(toBase(x, dimension, unit.id), dimension, unit.id), x);
          if (dimension === 'temperature') close(fromBase(toBase(-x, dimension, unit.id), dimension, unit.id), -x);
        }
      }
    });
  }
});

describe('anchor values', () => {
  test('temperature: 32 °F = 0 °C = 273.15 K', () => {
    close(toBase(32, 'temperature', 'F'), 273.15);
    close(toBase(0, 'temperature', 'C'), 273.15);
    close(convert(32, 'temperature', 'F', 'C'), 0);
  });
  test('temperature: 100 °C = 212 °F, −40 °C = −40 °F, 0 K = −459.67 °F', () => {
    close(convert(100, 'temperature', 'C', 'F'), 212);
    close(convert(-40, 'temperature', 'C', 'F'), -40);
    close(convert(0, 'temperature', 'K', 'F'), -459.67);
    close(convert(491.67, 'temperature', 'R', 'F'), 32);
  });
  test('mass: 1 st = 14 lb = 6.35029318 kg', () => {
    close(toBase(1, 'mass', 'st'), 6.35029318);
    close(convert(1, 'mass', 'st', 'lb'), 14);
  });
  test('mass: 1 µg = 1000 ng = 1e-9 kg', () => {
    close(toBase(1, 'mass', 'ug'), 1e-9);
    close(toBase(1, 'mass', 'ng'), 1e-12);
    close(convert(1, 'mass', 'ug', 'ng'), 1000);
  });
  test('basePairs: 1 kb = 1000 bp', () => {
    assert.equal(UNITS.basePairs[0].id, 'bp');
    close(convert(1, 'basePairs', 'kb', 'bp'), 1000);
  });
  test('relativeCentrifugalForce: single unit ×g, factor 1', () => {
    assert.equal(UNITS.relativeCentrifugalForce[0].id, 'xg');
    close(toBase(5000, 'relativeCentrifugalForce', 'xg'), 5000);
  });
  test('length: 1 mi = 1.609344 km, 1 ft = 12 in, 1 nmi = 1852 m', () => {
    close(convert(1, 'length', 'mi', 'km'), 1.609344);
    close(convert(1, 'length', 'ft', 'in'), 12);
    close(convert(1, 'length', 'mi', 'ft'), 5280);
    close(toBase(1, 'length', 'nmi'), 1852);
  });
  test('area: 1 acre = 43,560 ft², 1 ha = 10,000 m²', () => {
    close(convert(1, 'area', 'acre', 'ft2'), 43560);
    close(convert(640, 'area', 'acre', 'mi2'), 1);
    close(toBase(1, 'area', 'ha'), 1e4);
  });
  test('volume: 1 US gal = 3.785411784 L, 1 imperial gal = 4.54609 L', () => {
    close(convert(1, 'volume', 'gal', 'L'), 3.785411784);
    close(convert(1, 'volume', 'galUK', 'L'), 4.54609);
    close(convert(1, 'volume', 'gal', 'in3'), 231);
    close(convert(1, 'volume', 'gal', 'floz'), 128);
    close(convert(1, 'volume', 'cup', 'tbsp'), 16);
    close(convert(1, 'volume', 'tbsp', 'tsp'), 3);
    close(convert(1, 'volume', 'galUK', 'flozUK'), 160);
    close(convert(1, 'volume', 'yd3', 'ft3'), 27);
  });
  test('time: 1 week = 168 h, 1 year = 12 months = 365.25 days', () => {
    close(convert(1, 'time', 'wk', 'h'), 168);
    close(convert(1, 'time', 'yr', 'mo'), 12);
    close(convert(1, 'time', 'yr', 'd'), 365.25);
  });
  test('speed: 60 mph = 96.56064 km/h, 1 kn = 1.852 km/h, 1 km/s = 1000 m/s', () => {
    close(convert(60, 'speed', 'mph', 'km/h'), 96.56064);
    close(convert(1, 'speed', 'kn', 'km/h'), 1.852);
    close(convert(36, 'speed', 'km/h', 'm/s'), 10);
    close(toBase(1, 'speed', 'km/s'), 1000);
    close(convert(11.186, 'speed', 'km/s', 'm/s'), 11186);
  });
  test('energy: 1 kWh = 3.6 MJ, 1 kcal = 4184 J, 1 BTU ≈ 1055.056 J', () => {
    close(convert(1, 'energy', 'kWh', 'MJ'), 3.6);
    close(toBase(1, 'energy', 'kcal'), 4184);
    close(toBase(1, 'energy', 'BTU'), 1055.056, 1e-6);
  });
  test('power: 1 hp ≈ 745.7 W, 1 PS = 735.49875 W', () => {
    close(toBase(1, 'power', 'hp'), 745.69987158227, 1e-12);
    close(toBase(1, 'power', 'PS'), 735.49875);
  });
  test('pressure: 1 psi ≈ 6894.76 Pa, 1 atm = 101325 Pa = 760 mmHg ≈ 29.92 inHg', () => {
    close(toBase(1, 'pressure', 'psi'), 6894.757293168, 1e-12);
    close(toBase(1, 'pressure', 'atm'), 101325);
    close(convert(1, 'pressure', 'atm', 'Torr'), 760);
    close(convert(1, 'pressure', 'atm', 'mmHg'), 760, 1e-5);
    close(convert(1, 'pressure', 'atm', 'inHg'), 29.9213, 1e-5);
    close(convert(1, 'pressure', 'bar', 'kPa'), 100);
    close(toBase(1, 'pressure', 'GPa'), 1e9);
    close(convert(200, 'pressure', 'GPa', 'MPa'), 200000); // steel's Young's modulus, OpenStax Table 12.1
  });
  test('data: 1 KiB = 1024 B, 1 KB = 1000 B, 1 B = 8 bit', () => {
    assert.equal(convert(1, 'data', 'KiB', 'B'), 1024);
    assert.equal(convert(1, 'data', 'KB', 'B'), 1000);
    assert.equal(convert(1, 'data', 'B', 'bit'), 8);
    assert.equal(convert(1, 'data', 'GiB', 'MiB'), 1024);
    close(convert(1, 'data', 'TB', 'GB'), 1000);
  });
  test('fuel economy: 30 mpg (US) ≈ 7.84 L/100 km, inverse units', () => {
    close(convert(30, 'fuelEconomy', 'mpg', 'L/100km'), 7.8404861, 1e-7);
    close(convert(30, 'fuelEconomy', 'mpgUK', 'L/100km'), 9.4160312, 1e-7);
    close(convert(1, 'fuelEconomy', 'mpgUK', 'mpg'), 3.785411784 / 4.54609); // UK gallon is bigger
    close(convert(10, 'fuelEconomy', 'km/L', 'L/100km'), 10);
    close(convert(5, 'fuelEconomy', 'L/100km', 'km/L'), 20);
    // Higher mpg means less fuel per distance.
    assert.ok(toBase(40, 'fuelEconomy', 'mpg') < toBase(20, 'fuelEconomy', 'mpg'));
  });
  test('fuel price: $3.75/gal (US) ≈ $0.9906/L, UK gallon is bigger', () => {
    close(convert(3.75, 'fuelPrice', 'cur/gal', 'cur/L'), 3.75 / 3.785411784);
    close(convert(1, 'fuelPrice', 'cur/L', 'cur/galUK'), 4.54609);
    // 180 mi at 28 mpg and $3.75/gal: cost = distance × economy × price in base units.
    close(toBase(180, 'length', 'mi') * toBase(28, 'fuelEconomy', 'mpg') * toBase(3.75, 'fuelPrice', 'cur/gal'), (180 / 28) * 3.75);
    assert.ok(UNITS.fuelPrice.every((unit) => unit.label.startsWith(currencySymbol())));
  });
  test('EV efficiency: 4 mi/kWh = 25 kWh/100 mi = 250 Wh/mi ≈ 15.53 kWh/100 km', () => {
    close(convert(4, 'evEfficiency', 'mi/kWh', 'kWh/100mi'), 25);
    close(convert(25, 'evEfficiency', 'kWh/100mi', 'Wh/mi'), 250);
    close(convert(25, 'evEfficiency', 'kWh/100mi', 'kWh/100km'), 25 / 1.609344);
    close(convert(10, 'evEfficiency', 'km/kWh', 'kWh/100km'), 10);
    assert.ok(toBase(5, 'evEfficiency', 'mi/kWh') < toBase(3, 'evEfficiency', 'mi/kWh'));
  });
  test('percent, count, currency, decibel and pH are identity', () => {
    for (const dimension of ['percent', 'count', 'currency', 'decibel', 'pH'] as const) {
      assert.equal(UNITS[dimension].length, 1, dimension);
      assert.equal(toBase(7.5, dimension, UNITS[dimension][0].id), 7.5);
    }
    assert.equal(UNITS.count[0].label, '');
  });
  test('pace: 5 min/km = 0.3 s/m = 8.047 min/mi', () => {
    assert.equal(UNITS.pace[0].id, 's/m');
    close(toBase(5, 'pace', 'min/km'), 0.3);
    close(convert(5, 'pace', 'min/km', 'min/mi'), 8.04672);
    close(convert(8, 'pace', 'min/mi', 'min/km'), 4.97097, 1e-5);
  });
  test('currency label is the real symbol from lib/calculator.ts, never the ¤ placeholder', () => {
    assert.equal(UNITS.currency[0].label, currencySymbol());
    for (const units of Object.values(UNITS)) for (const unit of units) assert.ok(!unit.label.includes('¤'), unit.id);
  });
  test('angle: base is radians, 180° = pi rad, 90° = pi/2 rad', () => {
    assert.equal(UNITS.angle[0].id, 'rad');
    close(toBase(180, 'angle', 'deg'), Math.PI);
    close(convert(90, 'angle', 'deg', 'rad'), Math.PI / 2);
    close(convert(1, 'angle', 'rad', 'deg'), 180 / Math.PI);
  });
  test('angular velocity: 1 rpm = 2π/60 rad/s ≈ 0.10472 rad/s, 1 rev/s = 2π rad/s, 250 rpm ≈ 26.18 rad/s', () => {
    assert.equal(UNITS.angularVelocity[0].id, 'rad/s');
    close(toBase(1, 'angularVelocity', 'rpm'), (2 * Math.PI) / 60);
    close(toBase(1, 'angularVelocity', 'rev/s'), 2 * Math.PI);
    close(convert(90, 'angularVelocity', 'deg/s', 'rad/s'), Math.PI / 2);
    // Cross-checked against OpenStax University Physics Volume 1 §10.1, Example 10.2 (250 rev/min
    // converts to 26.2 rad/s).
    close(toBase(250, 'angularVelocity', 'rpm'), 26.179938779914945, 1e-9);
  });
  test('term: base is months, 30 years = 360 months', () => {
    assert.equal(UNITS.term[0].id, 'mo');
    assert.equal(toBase(30, 'term', 'yr'), 360);
    assert.equal(fromBase(60, 'term', 'yr'), 5);
  });
  test('momentum: kg·m/s and N·s are numerically identical (N = kg·m/s²)', () => {
    assert.equal(UNITS.momentum[0].id, 'kgm/s');
    close(toBase(1, 'momentum', 'Ns'), 1);
    close(convert(30, 'momentum', 'kgm/s', 'Ns'), 30);
  });
  test('density: 1 g/cm3 = 1000 kg/m3, 1 lb/ft3 ≈ 16.0185 kg/m3, 1 g/L = 1 kg/m3 exactly', () => {
    assert.equal(UNITS.density[0].id, 'kg/m3');
    close(toBase(1, 'density', 'g/cm3'), 1000);
    close(toBase(1, 'density', 'lb/ft3'), 16.018463373960138, 1e-9);
    close(convert(19.3, 'density', 'g/cm3', 'kg/m3'), 19300);
    close(toBase(1.25, 'density', 'g/L'), 1.25); // nitrogen gas at STP, gas-density-calculator
  });
  test('spring constant: 1 N/mm = 1000 N/m, 1 lbf/in ≈ 175.1268 N/m; Hooke\'s law stays a plain multiplication', () => {
    assert.equal(UNITS.springConstant[0].id, 'N/m');
    close(toBase(1, 'springConstant', 'N/mm'), 1000);
    close(toBase(1, 'springConstant', 'lbf/in'), 175.12683525, 1e-9);
    // F = k × x: 250 N/m stretched 0.12 m gives 30 N, with no stray conversion factor.
    close(toBase(250, 'springConstant', 'N/m') * toBase(0.12, 'length', 'm'), toBase(30, 'force', 'N'));
  });
  test('thermal expansion coefficient: 1/°C = 1/K (interval, no offset), ×10⁻⁶/°C is the practical unit', () => {
    assert.equal(UNITS.thermalExpansionCoeff[0].id, '1/K');
    close(toBase(1, 'thermalExpansionCoeff', '1/C'), 1);
    close(toBase(12, 'thermalExpansionCoeff', 'u/C'), 12e-6);
    // ΔL = α × L0 × ΔT: steel's 12×10⁻⁶/°C over 50 m and a 30°C rise gives 0.018 m (18 mm), with no
    // stray conversion factor (OpenStax University Physics Volume 2 §1.3, Table 1.2).
    close(
      toBase(12, 'thermalExpansionCoeff', 'u/C') * toBase(50, 'length', 'm') * toBase(30, 'temperatureDelta', 'C'),
      toBase(0.018, 'length', 'm')
    );
  });
  test('torque: 1 lbf·ft ≈ 1.355818 N·m; τ = Fr sinθ stays a plain multiplication', () => {
    assert.equal(UNITS.torque[0].id, 'Nm');
    close(toBase(1, 'torque', 'lbfft'), 1.3558179483314003, 1e-9);
    close(toBase(1, 'torque', 'lbfin'), 0.11298482902761668, 1e-9);
    // tau = F x r x sin(theta): 40 N at 4 m, perpendicular (90deg), gives 160 N*m, no stray factor
    // (OpenStax University Physics Volume 1, Example 10.14).
    close(toBase(40, 'force', 'N') * toBase(4, 'length', 'm') * Math.sin(Math.PI / 2), toBase(160, 'torque', 'Nm'));
  });
  test('moment of inertia: 1 lb·ft² ≈ 0.04214011 kg·m²; I = mr² stays a plain multiplication', () => {
    assert.equal(UNITS.momentOfInertia[0].id, 'kgm2');
    close(toBase(1, 'momentOfInertia', 'lbft2'), 0.042140110093804806, 1e-9);
    // I = m x r^2: a 2 kg point mass at 1 m from the axis gives 2 kg*m^2, no stray factor
    // (OpenStax University Physics Volume 1 §10.4, I = sum m_i r_i^2).
    close(toBase(2, 'mass', 'kg') * toBase(1, 'length', 'm') ** 2, toBase(2, 'momentOfInertia', 'kgm2'));
  });
  test('angular momentum: L = Iω stays a plain multiplication; lb·ft²/s shares momentOfInertia’s factor', () => {
    assert.equal(UNITS.angularMomentum[0].id, 'kgm2/s');
    close(toBase(1, 'angularMomentum', 'lbft2/s'), 0.042140110093804806, 1e-9);
    // L = I x omega: a 2 kg*m^2 moment of inertia spinning at 3 rad/s gives 6 kg*m^2/s, no stray
    // factor (OpenStax University Physics Volume 1 §11.2, Equation 11.9, L = Iω).
    close(toBase(2, 'momentOfInertia', 'kgm2') * toBase(3, 'angularVelocity', 'rad/s'), toBase(6, 'angularMomentum', 'kgm2/s'));
  });
  test('inductance: 1 mH = 1e-3 H, 1 µH = 1e-6 H; LC resonant frequency stays a plain expression', () => {
    assert.equal(UNITS.inductance[0].id, 'H');
    close(toBase(1, 'inductance', 'mH'), 1e-3);
    close(toBase(1, 'inductance', 'uH'), 1e-6);
    // omega = 1/sqrt(LC): L = 2.0e-2 H, C = 8.0e-6 F gives omega = 2.5e3 rad/s (OpenStax
    // University Physics Volume 2 §14.5, Example 14.6).
    close(1 / Math.sqrt(toBase(2.0e-2, 'inductance', 'H') * toBase(8.0e-6, 'capacitance', 'F')), 2500, 1e-3);
  });
  test('electric field: N/C and V/m are numerically identical (1 V/m = 1 N/C); E = kq/r² stays a plain expression', () => {
    assert.equal(UNITS.electricField[0].id, 'N/C');
    close(toBase(1, 'electricField', 'V/m'), 1);
    close(convert(4.1e12, 'electricField', 'N/C', 'V/m'), 4.1e12);
  });
  test('magnetic flux density: 1 mT = 0.001 T, 1 G = 1e-4 T exactly; F = BIL sinθ stays a plain multiplication', () => {
    assert.equal(UNITS.magneticFluxDensity[0].id, 'T');
    close(toBase(1, 'magneticFluxDensity', 'mT'), 1e-3);
    close(toBase(1, 'magneticFluxDensity', 'G'), 1e-4);
    close(convert(1, 'magneticFluxDensity', 'T', 'G'), 1e4);
    // OpenStax University Physics Volume 2, Example 11.4: F = BIL (sinθ = 1, perpendicular) with
    // B = 0.50 T, I = 0.39 A, L = 0.50 m gives 0.0975 N, no stray conversion factor.
    close(
      toBase(0.5, 'magneticFluxDensity', 'T') * toBase(0.39, 'current', 'A') * toBase(0.5, 'length', 'm'),
      toBase(0.0975, 'force', 'N')
    );
  });
  test('magnetic flux: 1 mWb = 0.001 Wb, 1 µWb = 1e-6 Wb; Φ = BA cos θ stays a plain multiplication', () => {
    assert.equal(UNITS.magneticFlux[0].id, 'Wb');
    close(toBase(1, 'magneticFlux', 'mWb'), 1e-3);
    close(toBase(1, 'magneticFlux', 'uWb'), 1e-6);
    close(convert(1, 'magneticFlux', 'Wb', 'mWb'), 1000);
    // OpenStax University Physics Volume 2 §13.1: a 0.25 m square loop (A = 0.0625 m²)
    // perpendicular to a 0.8 T field has Φ = BA = 0.05 Wb, no stray conversion factor.
    close(
      toBase(0.8, 'magneticFluxDensity', 'T') * toBase(0.0625, 'area', 'm2') * Math.cos(0),
      toBase(0.05, 'magneticFlux', 'Wb')
    );
  });
  test('voltage: 1 kV = 1000 V = 1,000,000 mV', () => {
    assert.equal(UNITS.voltage[0].id, 'V');
    close(toBase(1, 'voltage', 'kV'), 1000);
    close(convert(1, 'voltage', 'kV', 'mV'), 1e6);
  });
  test('current: 1 A = 1000 mA = 1,000,000 µA, 1 kA = 1000 A', () => {
    assert.equal(UNITS.current[0].id, 'A');
    close(convert(1, 'current', 'A', 'mA'), 1000);
    close(convert(1, 'current', 'A', 'uA'), 1e6);
    close(toBase(1, 'current', 'kA'), 1000);
  });
  test('resistance: 1 kΩ = 1000 Ω, 1 MΩ = 1,000,000 Ω, 1 Ω = 1000 mΩ', () => {
    assert.equal(UNITS.resistance[0].id, 'ohm');
    close(toBase(1, 'resistance', 'kohm'), 1000);
    close(toBase(1, 'resistance', 'Mohm'), 1e6);
    close(convert(1, 'resistance', 'ohm', 'mohm'), 1000);
  });
  test('capacitance: 1 F = 1e6 µF = 1e12 pF, 1 µF = 1000 nF', () => {
    assert.equal(UNITS.capacitance[0].id, 'F');
    close(convert(1, 'capacitance', 'F', 'uF'), 1e6);
    close(convert(1, 'capacitance', 'F', 'pF'), 1e12);
    close(convert(1, 'capacitance', 'uF', 'nF'), 1000);
  });
  test('charge: 1 C = 1000 mC = 1,000,000 µC, 1 mC = 1,000,000 nC', () => {
    assert.equal(UNITS.charge[0].id, 'C');
    close(convert(1, 'charge', 'C', 'mC'), 1000);
    close(convert(1, 'charge', 'C', 'uC'), 1e6);
    close(convert(1, 'charge', 'mC', 'nC'), 1e6);
  });
  test('frequency: 1 MHz = 1,000,000 Hz, 1 GHz = 1000 MHz', () => {
    assert.equal(UNITS.frequency[0].id, 'Hz');
    close(toBase(1, 'frequency', 'MHz'), 1e6);
    close(convert(1, 'frequency', 'GHz', 'MHz'), 1000);
  });
  test('specific heat: 1 J/(g·K) = 1000 J/(kg·K), 1 cal/(g·°C) = 4184 J/(kg·K) (water’s specific heat)', () => {
    assert.equal(UNITS.specificHeat[0].id, 'J/kgK');
    close(toBase(1, 'specificHeat', 'J/gK'), 1000);
    close(toBase(1, 'specificHeat', 'cal/gC'), 4184);
  });
  test('specific latent heat: 1 kJ/kg = 1000 J/kg, water’s heat of fusion (≈334 kJ/kg) round-trips', () => {
    assert.equal(UNITS.specificLatentHeat[0].id, 'J/kg');
    close(toBase(1, 'specificLatentHeat', 'kJ/kg'), 1000);
    close(convert(334, 'specificLatentHeat', 'kJ/kg', 'J/kg'), 334000);
    close(fromBase(toBase(2412, 'specificLatentHeat', 'kJ/kg'), 'specificLatentHeat', 'kJ/kg'), 2412); // round-trip
  });
  test('temperature delta is an interval, not a reading: 1°C change = 1 K change, 1°F change = 5/9 K change', () => {
    assert.equal(UNITS.temperatureDelta[0].id, 'K');
    close(toBase(1, 'temperatureDelta', 'C'), 1);
    close(toBase(1, 'temperatureDelta', 'F'), 5 / 9);
    close(convert(18, 'temperatureDelta', 'F', 'C'), 10); // an 18°F swing is the same as a 10°C swing
  });
  test('amount of substance: 1 mol = 1000 mmol = 1,000,000 µmol', () => {
    assert.equal(UNITS.amountOfSubstance[0].id, 'mol');
    close(convert(1, 'amountOfSubstance', 'mol', 'mmol'), 1000);
    close(convert(1, 'amountOfSubstance', 'mol', 'umol'), 1e6);
  });
  test('concentration: 1 mol/L = 1000 mol/m³ = 1000 mmol/L, molarity (M) is the common unit', () => {
    assert.equal(UNITS.concentration[0].id, 'mol/m3');
    close(toBase(1, 'concentration', 'mol/L'), 1000);
    close(convert(1, 'concentration', 'mol/L', 'mmol/L'), 1000);
    close(convert(1, 'concentration', 'mmol/L', 'umol/L'), 1000);
    // moles / volume, both already SI base above, gives mol/m3 with no stray conversion factor.
    close(toBase(2, 'amountOfSubstance', 'mol') / toBase(1, 'volume', 'L'), toBase(2, 'concentration', 'mol/L'));
  });
  test('osmolarity: 1 Osm/L = 1000 mOsm/L; molarity × particles per formula unit = osmolarity with no stray factor', () => {
    assert.equal(UNITS.osmolarity[0].id, 'mOsm/L');
    close(toBase(1, 'osmolarity', 'Osm/L'), 1000);
    // 0.154 mol/L NaCl (i = 2, Na+ and Cl-) is 308 mOsm/L — StatPearls (NCBI Bookshelf NBK545210),
    // "Normal Saline": 154 mEq/L Na+ and 154 mEq/L Cl-, osmolarity 308 mOsm/L.
    close(toBase(0.154, 'concentration', 'mol/L') * 2, toBase(308, 'osmolarity', 'mOsm/L'));
  });
  test('normality: 1 eq/L = 1000 meq/L; molarity × equivalents per mole = normality with no stray factor', () => {
    assert.equal(UNITS.normality[0].id, 'meq/L');
    close(toBase(1, 'normality', 'eq/L'), 1000);
    // 0.1 mol/L H2SO4 (n = 2, diprotic) is 0.2 N.
    close(toBase(0.1, 'concentration', 'mol/L') * 2, toBase(0.2, 'normality', 'eq/L'));
  });
  test('molar mass: 1 g/mol = 0.001 kg/mol; mass / amount of substance = molar mass with no stray factor', () => {
    assert.equal(UNITS.molarMass[0].id, 'kg/mol');
    close(toBase(1, 'molarMass', 'g/mol'), 0.001);
    close(convert(18.015, 'molarMass', 'g/mol', 'kg/mol'), 0.018015);
    // water: 18.015 g of H2O is 1 mol, so mass(kg) / moles(mol) = molarMass(kg/mol) must equal 18.015 g/mol.
    close(toBase(18.015, 'mass', 'g') / toBase(1, 'amountOfSubstance', 'mol'), toBase(18.015, 'molarMass', 'g/mol'));
  });
  test('rate constant: 1 h⁻¹ = 1/3600 s⁻¹, 1 min⁻¹ = 1/60 s⁻¹ (reciprocals of time’s own hour/minute factors)', () => {
    assert.equal(UNITS.rateConstant[0].id, 's-1');
    close(toBase(3600, 'rateConstant', 'h-1'), 1);
    close(toBase(60, 'rateConstant', 'min-1'), 1);
    close(convert(60, 'rateConstant', 'min-1', 'h-1'), 3600);
  });
  test('rate constant: 1 yr⁻¹ is the reciprocal of time’s own year factor (365.25 days)', () => {
    close(toBase(365.25 * 86400, 'rateConstant', 'yr-1'), 1);
    close(convert(1, 'rateConstant', 'yr-1', 'h-1'), 1 / (365.25 * 24));
  });
  test('molar absorptivity: 1 L/(mol·cm) = 0.1 m²/mol (IUPAC Gold Book)', () => {
    assert.equal(UNITS.molarAbsorptivity[0].id, 'm2/mol');
    close(toBase(1, 'molarAbsorptivity', 'L/molcm'), 0.1);
    close(convert(10, 'molarAbsorptivity', 'L/molcm', 'm2/mol'), 1);
  });
  test('absorbance is a single-unit (unitless) dimension, like pH and decibel', () => {
    assert.equal(UNITS.absorbance.length, 1);
    assert.equal(UNITS.absorbance[0].id, 'AU');
    close(toBase(0.3, 'absorbance', 'AU'), 0.3);
  });
  test('molar energy: 1 kJ/mol = 1000 J/mol, 1 kcal/mol = 4184 J/mol', () => {
    assert.equal(UNITS.molarEnergy[0].id, 'J/mol');
    close(toBase(1, 'molarEnergy', 'kJ/mol'), 1000);
    close(toBase(1, 'molarEnergy', 'kcal/mol'), 4184);
  });
  test('molar entropy: 1 kJ/(mol·K) = 1000 J/(mol·K), 1 cal/(mol·K) = 4.184 J/(mol·K)', () => {
    assert.equal(UNITS.molarEntropy[0].id, 'J/molK');
    close(toBase(1, 'molarEntropy', 'kJ/molK'), 1000);
    close(toBase(1, 'molarEntropy', 'cal/molK'), 4.184);
  });
  test('molar heat capacity: 1 kJ/(mol·K) = 1000 J/(mol·K), 1 cal/(mol·K) = 4.184 J/(mol·K); Cp - Cv = R', () => {
    assert.equal(UNITS.molarHeatCapacity[0].id, 'J/molK');
    close(toBase(1, 'molarHeatCapacity', 'kJ/molK'), 1000);
    close(toBase(1, 'molarHeatCapacity', 'cal/molK'), 4.184);
    // OpenStax University Physics Volume 2 §3.5 "Heat Capacities of an Ideal Gas", Equation 3.10
    // (Cp = Cv + R) and Table 3.3 (a monatomic ideal gas: Cv = 3/2 R, Cp = 5/2 R).
    const R = 8.31446261815324; // NIST CODATA molar gas constant, exact per the 2019 SI redefinition
    close(toBase(2.5 * R, 'molarHeatCapacity', 'J/molK') - toBase(1.5 * R, 'molarHeatCapacity', 'J/molK'), R);
  });
  test('molality: 1 mol/kg = 1000 mmol/kg; moles of solute ÷ kg of solvent = molality with no stray factor', () => {
    assert.equal(UNITS.molality[0].id, 'mol/kg');
    close(convert(1, 'molality', 'mol/kg', 'mmol/kg'), 1000);
    // 35.8 mol of solute in 2.00 kg of solvent is 17.9 mol/kg (OpenStax Chemistry 2e Example 11.3).
    close(toBase(35.8, 'amountOfSubstance', 'mol') / toBase(2, 'mass', 'kg'), toBase(17.9, 'molality', 'mol/kg'));
  });
  test('molal constant: 1 K·kg/mol = 1 °C·kg/mol; constant × molality = a temperature delta with no stray factor', () => {
    assert.equal(UNITS.molalConstant[0].id, 'Ckgmol');
    close(toBase(1, 'molalConstant', 'Kkgmol'), 1);
    // Water's Kf (1.86 °C·kg/mol, OpenStax Chemistry 2e §11.4) applied to the 17.9 mol/kg antifreeze
    // from Example 11.3 (the same figure molality-calculator's own worked example uses) gives a
    // freezing-point depression of 33.294°C.
    close(toBase(1.86, 'molalConstant', 'Ckgmol') * toBase(17.9, 'molality', 'mol/kg'), toBase(33.294, 'temperatureDelta', 'C'));
  });
  test('mass concentration: mg/L and ppm are numerically identical (dilute-aqueous convention), 1 g/L = 1000 mg/L, 1 ppb = 1 µg/L', () => {
    assert.equal(UNITS.massConcentration[0].id, 'mg/L');
    close(toBase(1, 'massConcentration', 'ppm'), 1);
    close(convert(5, 'massConcentration', 'mg/L', 'ppm'), 5);
    close(toBase(1, 'massConcentration', 'g/L'), 1000);
    close(convert(1, 'massConcentration', 'ppb', 'ug/L'), 1);
    close(convert(1000, 'massConcentration', 'ppb', 'ppm'), 1);
    // ng/µL, µg/mL and mg/L are all numerically identical (dna-concentration-calculator,
    // protein-concentration-calculator); mg/mL = 1 g/L exactly.
    close(toBase(1, 'massConcentration', 'ng/uL'), 1);
    close(toBase(1, 'massConcentration', 'ug/mL'), 1);
    close(toBase(1, 'massConcentration', 'mg/mL'), 1000);
    close(convert(50, 'massConcentration', 'ng/uL', 'mg/L'), 50);
  });
  test('cell density: 1 ×10⁶ cells/mL = 1,000,000 cells/mL, 1 cell/µL = 1000 cells/mL, CFU/mL shares the base factor', () => {
    assert.equal(UNITS.cellDensity[0].id, 'cells/mL');
    close(toBase(1, 'cellDensity', 'Mcells/mL'), 1e6);
    close(toBase(1, 'cellDensity', 'cells/uL'), 1000);
    close(toBase(1, 'cellDensity', 'CFU/mL'), 1);
    close(toBase(1, 'cellDensity', 'cells/L'), 0.001);
    // C1V1 = C2V2 for a cell suspension: diluting 2 mL of a 5x10^6 cells/mL stock to 10 mL gives
    // 1x10^6 cells/mL, with the volume ratio alone (no stray factor) since both volumes share a unit.
    close(
      (toBase(5, 'cellDensity', 'Mcells/mL') * toBase(2, 'volume', 'mL')) / toBase(10, 'volume', 'mL'),
      toBase(1, 'cellDensity', 'Mcells/mL')
    );
  });
});

// force-calculator's solver paths read these three dimensions. Pin the factors to their pre-step-30
// values and check the conversion is still exactly value × factor.
describe('force-calculator dimensions unchanged', () => {
  const PINNED: Record<'mass' | 'acceleration' | 'force', Record<string, number>> = {
    // Stone appended in step 36: force-calculator's mass menu gains "st"; the other factors are
    // untouched. µg/ng appended in step 48 batch 3 (ligation-calculator's insert/vector DNA mass);
    // same "append only" discipline.
    mass: { kg: 1, g: 0.001, t: 1000, lb: 0.45359237, oz: 0.028349523125, st: 14 * 0.45359237, ug: 1e-9, ng: 1e-12 },
    acceleration: { 'm/s2': 1, 'ft/s2': 0.3048, g0: 9.80665, 'kmh/s': 1000 / 3600 },
    force: { N: 1, kN: 1000, MN: 1e6, lbf: 0.45359237 * 9.80665, kgf: 9.80665, dyn: 1e-5 }
  };
  for (const [dimension, factors] of Object.entries(PINNED) as [keyof typeof PINNED, Record<string, number>][]) {
    test(dimension, () => {
      assert.deepEqual(UNITS[dimension].map((unit) => unit.id), Object.keys(factors));
      for (const [id, factor] of Object.entries(factors)) {
        for (const x of [1, 2.78, 1500, 4170]) {
          assert.equal(toBase(x, dimension, id), x * factor, `${dimension} ${id}`);
          assert.equal(fromBase(x, dimension, id), x / factor, `${dimension} ${id}`);
        }
      }
    });
  }
});
