// See mdFiles/steps/42-wave-1-conversion.md, "Kit addition (run 1): content.commonValues". Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { cellText, columnHeader, convert, formatFeetInches, isFeetUnit } from './commonValues.ts';
import { calculators } from '../data/calculators/index.ts';

const close = (actual: number, expected: number, tolerance = 1e-12) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} ≈ ${expected}`
  );

describe('formatFeetInches', () => {
  test('splits total inches into feet + inches', () => {
    assert.equal(formatFeetInches(0), '0 ft 0 in');
    assert.equal(formatFeetInches(5), '5 ft 0 in');
    assert.equal(formatFeetInches(5 + 11 / 12), '5 ft 11 in');
  });

  test('never prints 12 in: rounds the TOTAL inches first, then splits', () => {
    // 5 ft 11.9999 in is 71.9999 in, which rounds to 72 in = 6 ft 0 in, never "5 ft 12 in".
    const almostSix = 5 + 11.9999 / 12;
    assert.equal(formatFeetInches(almostSix), '6 ft 0 in');
    // Exactly on the rounding boundary (71.5 in -> rounds up to 72 in).
    assert.equal(formatFeetInches(71.5 / 12), '6 ft 0 in');
    for (let totalInches = -200; totalInches <= 200; totalInches += 1) {
      const text = formatFeetInches(totalInches / 12 + 0.00001 * Math.sin(totalInches));
      assert.ok(!/\b12 in\b/.test(text), `${totalInches}: ${text}`);
    }
  });

  test('handles negative feet (below absolute zero never reaches here, but the math must still hold)', () => {
    assert.equal(formatFeetInches(-1), '-1 ft 0 in');
  });
});

describe('isFeetUnit / columnHeader / cellText', () => {
  test('only length/ft is the feet-inches unit', () => {
    assert.ok(isFeetUnit('length', 'ft'));
    assert.ok(!isFeetUnit('length', 'm'));
    assert.ok(!isFeetUnit('mass', 'kg'));
  });

  test('columnHeader labels feet specially, everything else by its unit label', () => {
    assert.equal(columnHeader('length', 'ft'), 'ft & in');
    assert.equal(columnHeader('length', 'cm'), 'cm');
    assert.equal(columnHeader('mass', 'kg'), 'kg');
  });

  test('cellText renders feet as feet+inches and everything else as a plain decimal', () => {
    assert.equal(cellText(5.9167, 'length', 'ft', 2), formatFeetInches(5.9167));
    assert.equal(cellText(10.456, 'length', 'cm', 2), '10.46');
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

  for (const calculator of withTables) {
    test(`${calculator.id}: every row round-trips and no feet-inches cell says "12 in"`, () => {
      const cv = calculator.content!.commonValues!;
      for (const value of cv.values) {
        const roundTripped = convert(convert(value, cv.dimension, cv.from, cv.to), cv.dimension, cv.to, cv.from);
        close(roundTripped, value, 1e-9);
        const toText = cellText(convert(value, cv.dimension, cv.from, cv.to), cv.dimension, cv.to, cv.decimals ?? 2);
        assert.ok(!/\b12 in\b/.test(toText), `${calculator.id} forward: ${toText}`);
        const fromText = cellText(value, cv.dimension, cv.from, cv.decimals ?? 2);
        assert.ok(!/\b12 in\b/.test(fromText), `${calculator.id} forward from-column: ${fromText}`);
      }
      if (cv.reverse) {
        for (const value of cv.reverse.values) {
          const roundTripped = convert(convert(value, cv.dimension, cv.to, cv.from), cv.dimension, cv.from, cv.to);
          close(roundTripped, value, 1e-9);
          const toText = cellText(convert(value, cv.dimension, cv.to, cv.from), cv.dimension, cv.from, cv.decimals ?? 2);
          assert.ok(!/\b12 in\b/.test(toText), `${calculator.id} reverse: ${toText}`);
        }
      }
    });
  }
});
