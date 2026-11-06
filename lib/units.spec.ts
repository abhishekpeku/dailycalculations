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
      'acceleration', 'amountOfSubstance', 'angle', 'area', 'capacitance', 'charge', 'concentration', 'count', 'currency', 'current', 'data',
      'decibel', 'density', 'energy', 'evEfficiency', 'force', 'frequency', 'fuelEconomy', 'fuelPrice', 'length', 'mass', 'molarMass', 'momentum',
      'pace', 'percent', 'power', 'pressure', 'resistance', 'specificHeat', 'speed', 'temperature', 'temperatureDelta', 'term', 'time', 'voltage',
      'volume'
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
  test('speed: 60 mph = 96.56064 km/h, 1 kn = 1.852 km/h', () => {
    close(convert(60, 'speed', 'mph', 'km/h'), 96.56064);
    close(convert(1, 'speed', 'kn', 'km/h'), 1.852);
    close(convert(36, 'speed', 'km/h', 'm/s'), 10);
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
  test('percent, count, currency and decibel are identity', () => {
    for (const dimension of ['percent', 'count', 'currency', 'decibel'] as const) {
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
  test('density: 1 g/cm3 = 1000 kg/m3, 1 lb/ft3 ≈ 16.0185 kg/m3', () => {
    assert.equal(UNITS.density[0].id, 'kg/m3');
    close(toBase(1, 'density', 'g/cm3'), 1000);
    close(toBase(1, 'density', 'lb/ft3'), 16.018463373960138, 1e-9);
    close(convert(19.3, 'density', 'g/cm3', 'kg/m3'), 19300);
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
  test('molar mass: 1 g/mol = 0.001 kg/mol; mass / amount of substance = molar mass with no stray factor', () => {
    assert.equal(UNITS.molarMass[0].id, 'kg/mol');
    close(toBase(1, 'molarMass', 'g/mol'), 0.001);
    close(convert(18.015, 'molarMass', 'g/mol', 'kg/mol'), 0.018015);
    // water: 18.015 g of H2O is 1 mol, so mass(kg) / moles(mol) = molarMass(kg/mol) must equal 18.015 g/mol.
    close(toBase(18.015, 'mass', 'g') / toBase(1, 'amountOfSubstance', 'mol'), toBase(18.015, 'molarMass', 'g/mol'));
  });
});

// force-calculator's solver paths read these three dimensions. Pin the factors to their pre-step-30
// values and check the conversion is still exactly value × factor.
describe('force-calculator dimensions unchanged', () => {
  const PINNED: Record<'mass' | 'acceleration' | 'force', Record<string, number>> = {
    // Stone appended in step 36: force-calculator's mass menu gains "st"; the other factors are untouched.
    mass: { kg: 1, g: 0.001, t: 1000, lb: 0.45359237, oz: 0.028349523125, st: 14 * 0.45359237 },
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
