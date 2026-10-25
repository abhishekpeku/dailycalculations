// See mdFiles/steps/42-wave-1-conversion.md, "Kit addition (run 1): content.commonValues". Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { cellText, columnHeader, convert, formatFeetInches, formatStoneLbs } from './commonValues.ts';
import { calculators } from '../data/calculators/index.ts';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} ≈ ${expected}`
  );

describe('formatFeetInches', () => {
  test('splits total inches into feet + inches', () => {
    assert.equal(formatFeetInches(0), '0 ft 0 in');
    assert.equal(formatFeetInches(60), '5 ft 0 in');
    assert.equal(formatFeetInches(71), '5 ft 11 in');
  });

  test('never prints 12 in: rounds the TOTAL inches first, then splits', () => {
    // 71.9999 total inches rounds to 72 in = 6 ft 0 in, never "5 ft 12 in".
    assert.equal(formatFeetInches(71.9999), '6 ft 0 in');
    // Exactly on the rounding boundary.
    assert.equal(formatFeetInches(71.5), '6 ft 0 in');
    for (let totalInches = -200; totalInches <= 200; totalInches += 1) {
      const text = formatFeetInches(totalInches + 0.0001 * Math.sin(totalInches));
      assert.ok(!/\b12 in\b/.test(text), `${totalInches}: ${text}`);
    }
  });

  test('handles negative total inches', () => {
    assert.equal(formatFeetInches(-12), '-1 ft 0 in');
  });
});

describe('formatStoneLbs', () => {
  test('splits total pounds into stone + pounds', () => {
    assert.equal(formatStoneLbs(0), '0 st 0 lb');
    assert.equal(formatStoneLbs(140), '10 st 0 lb');
    assert.equal(formatStoneLbs(158), '11 st 4 lb');
  });

  test('never prints 14 lb: rounds the TOTAL pounds first, then splits', () => {
    // 153.9999 total pounds rounds to 154 lb = 11 st 0 lb, never "10 st 14 lb".
    assert.equal(formatStoneLbs(153.9999), '11 st 0 lb');
    assert.equal(formatStoneLbs(153.5), '11 st 0 lb');
    for (let totalPounds = -300; totalPounds <= 300; totalPounds += 1) {
      const text = formatStoneLbs(totalPounds + 0.0001 * Math.sin(totalPounds));
      assert.ok(!/\b14 lb\b/.test(text), `${totalPounds}: ${text}`);
    }
  });

  test('handles negative total pounds', () => {
    assert.equal(formatStoneLbs(-14), '-1 st 0 lb');
  });
});

describe('columnHeader / cellText', () => {
  test('columnHeader: feetInches columns say "ft & in", stoneLbs columns say "st & lb", otherwise the unit label', () => {
    assert.equal(columnHeader('length', 'ft', true), 'ft & in');
    assert.equal(columnHeader('length', 'in', true), 'ft & in'); // a cm<->in height row can use this too
    assert.equal(columnHeader('length', 'cm', false), 'cm');
    assert.equal(columnHeader('mass', 'kg', false), 'kg');
    assert.equal(columnHeader('mass', 'kg', 'stoneLbs'), 'st & lb');
    assert.equal(columnHeader('mass', 'st', 'stoneLbs'), 'st & lb');
  });

  test('cellText: a feetInches column re-expresses its value as inches, any length unit', () => {
    // 5.9167 ft (71 in) -> "5 ft 11 in"
    assert.equal(cellText(5.9167, 'length', 'ft', 2, true), formatFeetInches(convert(5.9167, 'length', 'ft', 'in')));
    assert.equal(cellText(71, 'length', 'in', 2, true), '5 ft 11 in');
    assert.equal(cellText(180, 'length', 'cm', 2, true), formatFeetInches(convert(180, 'length', 'cm', 'in')));
  });

  test('cellText: a stoneLbs column re-expresses its value as pounds, any mass unit', () => {
    // 70 kg -> 154.3236 lb -> rounds to 154 lb -> "11 st 0 lb"
    assert.equal(cellText(70, 'mass', 'kg', 2, 'stoneLbs'), formatStoneLbs(convert(70, 'mass', 'kg', 'lb')));
    assert.equal(cellText(11, 'mass', 'st', 2, 'stoneLbs'), '11 st 0 lb');
    assert.equal(cellText(158, 'mass', 'lb', 2, 'stoneLbs'), '11 st 4 lb');
  });

  test('cellText: a plain column is a decimal number', () => {
    assert.equal(cellText(10.456, 'length', 'cm', 2, false), '10.46');
  });
});

describe('convert', () => {
  test('round-trips through the base unit', () => {
    close(convert(convert(100, 'length', 'cm', 'in'), 'length', 'in', 'cm'), 100);
    close(convert(convert(68, 'temperature', 'F', 'C'), 'temperature', 'C', 'F'), 68);
  });
});

// Walks every calculator that has shipped a content.commonValues table and checks both of the
// template's accuracy rules against the REAL data, not a synthetic example: every row round-trips
// (from -> to -> from) and no feet+inches cell ever reads "12 in".
describe('every calculator commonValues table', () => {
  const withTables = calculators.filter((c) => c.content?.commonValues);

  test('at least one calculator has shipped a commonValues table', () => {
    assert.ok(withTables.length > 0);
  });

  // A column's display mode: 'stoneLbs' wins if set (mass columns), else the feetInches boolean.
  const displayMode = (side: 'from' | 'to', feetInches?: 'from' | 'to', stoneLbs?: 'from' | 'to') =>
    stoneLbs === side ? ('stoneLbs' as const) : feetInches === side;

  for (const calculator of withTables) {
    test(`${calculator.id}: every row round-trips, no feet-inches cell says "12 in", no stone-lb cell says "14 lb"`, () => {
      const cv = calculator.content!.commonValues!;
      const decimals = cv.decimals ?? 2;

      for (const value of cv.values) {
        const toValue = convert(value, cv.dimension, cv.from, cv.to);
        close(convert(toValue, cv.dimension, cv.to, cv.from), value);
        const fromText = cellText(value, cv.dimension, cv.from, decimals, displayMode('from', cv.feetInches, cv.stoneLbs));
        const toText = cellText(toValue, cv.dimension, cv.to, decimals, displayMode('to', cv.feetInches, cv.stoneLbs));
        assert.ok(!/\b12 in\b/.test(fromText), `${calculator.id} forward from-column: ${fromText}`);
        assert.ok(!/\b12 in\b/.test(toText), `${calculator.id} forward to-column: ${toText}`);
        assert.ok(!/\b14 lb\b/.test(fromText), `${calculator.id} forward from-column: ${fromText}`);
        assert.ok(!/\b14 lb\b/.test(toText), `${calculator.id} forward to-column: ${toText}`);
      }

      if (cv.reverse) {
        const reverseFeetInches = cv.reverse.feetInches;
        const reverseStoneLbs = cv.reverse.stoneLbs;
        for (const value of cv.reverse.values) {
          const backValue = convert(value, cv.dimension, cv.to, cv.from);
          close(convert(backValue, cv.dimension, cv.from, cv.to), value);
          const leftText = cellText(value, cv.dimension, cv.to, decimals, displayMode('from', reverseFeetInches, reverseStoneLbs));
          const rightText = cellText(backValue, cv.dimension, cv.from, decimals, displayMode('to', reverseFeetInches, reverseStoneLbs));
          assert.ok(!/\b12 in\b/.test(leftText), `${calculator.id} reverse left: ${leftText}`);
          assert.ok(!/\b12 in\b/.test(rightText), `${calculator.id} reverse right: ${rightText}`);
          assert.ok(!/\b14 lb\b/.test(leftText), `${calculator.id} reverse left: ${leftText}`);
          assert.ok(!/\b14 lb\b/.test(rightText), `${calculator.id} reverse right: ${rightText}`);
        }
      }
    });
  }
});
