// Unit library checks. See mdFiles/steps/30-units-v2.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { UNITS, findUnit, fromBase, toBase, type UnitDimension } from './units.ts';

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
      'acceleration', 'area', 'count', 'currency', 'data', 'energy', 'force', 'fuelEconomy', 'length',
      'mass', 'percent', 'power', 'pressure', 'speed', 'temperature', 'term', 'time', 'volume'
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
  test('percent, count and currency are identity', () => {
    for (const dimension of ['percent', 'count', 'currency'] as const) {
      assert.equal(UNITS[dimension].length, 1, dimension);
      assert.equal(toBase(7.5, dimension, UNITS[dimension][0].id), 7.5);
    }
    assert.equal(UNITS.count[0].label, '');
  });
  test('term: base is months, 30 years = 360 months', () => {
    assert.equal(UNITS.term[0].id, 'mo');
    assert.equal(toBase(30, 'term', 'yr'), 360);
    assert.equal(fromBase(60, 'term', 'yr'), 5);
  });
});

// force-calculator's solver paths read these three dimensions. Pin the factors to their pre-step-30
// values and check the conversion is still exactly value × factor.
describe('force-calculator dimensions unchanged', () => {
  const PINNED: Record<'mass' | 'acceleration' | 'force', Record<string, number>> = {
    mass: { kg: 1, g: 0.001, t: 1000, lb: 0.45359237, oz: 0.028349523125 },
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
