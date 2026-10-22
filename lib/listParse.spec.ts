// lib/listParse.ts. See mdFiles/steps/41-wave-1-statistics.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumberList, LIST_MAX, parseNumberList } from './listParse.ts';

describe('parseNumberList', () => {
  test('comma-separated', () => {
    assert.deepEqual(parseNumberList('1,2,3').values, [1, 2, 3]);
  });

  test('space-separated', () => {
    assert.deepEqual(parseNumberList('1 2 3').values, [1, 2, 3]);
  });

  test('tab- and newline-separated (a pasted spreadsheet column)', () => {
    assert.deepEqual(parseNumberList('1\t2\n3').values, [1, 2, 3]);
  });

  test('semicolon-separated', () => {
    assert.deepEqual(parseNumberList('1;2;3').values, [1, 2, 3]);
  });

  test('a mix of separators, with repeats and surrounding whitespace', () => {
    assert.deepEqual(parseNumberList('  1,  2 ;3\n\n4,,,5  ').values, [1, 2, 3, 4, 5]);
  });

  test('empty string parses to an empty list, not an error', () => {
    assert.deepEqual(parseNumberList(''), { values: [], ignored: [], truncated: false, groupedAsThousands: [] });
  });

  test('whitespace-only string parses to an empty list', () => {
    assert.deepEqual(parseNumberList('   \n\t  '), { values: [], ignored: [], truncated: false, groupedAsThousands: [] });
  });

  test('bad tokens are dropped from values and reported in ignored, in order', () => {
    const result = parseNumberList('1, abc, 2, xyz, 3');
    assert.deepEqual(result.values, [1, 2, 3]);
    assert.deepEqual(result.ignored, ['abc', 'xyz']);
  });

  test('NaN and Infinity as literal text are rejected, not treated as numbers', () => {
    const result = parseNumberList('1, NaN, Infinity, -Infinity, 2');
    assert.deepEqual(result.values, [1, 2]);
    assert.deepEqual(result.ignored, ['NaN', 'Infinity', '-Infinity']);
  });

  test('negative numbers', () => {
    assert.deepEqual(parseNumberList('-5, -3.2, 4').values, [-5, -3.2, 4]);
  });

  test('negative zero normalizes to 0', () => {
    const result = parseNumberList('-0, 0, -0.0');
    assert.deepEqual(result.values, [0, 0, 0]);
    assert.ok(result.values.every((v) => !Object.is(v, -0)));
  });

  test('decimal forms: leading dot, trailing dot, plain', () => {
    assert.deepEqual(parseNumberList('.5, 5., 5.5').values, [0.5, 5, 5.5]);
  });

  test('scientific notation, upper and lower case, signed exponent', () => {
    assert.deepEqual(parseNumberList('1e3, 1.5E-2, 2e+2').values, [1000, 0.015, 200]);
  });

  test('a leading plus sign', () => {
    assert.deepEqual(parseNumberList('+5, +3.2').values, [5, 3.2]);
  });

  test('caps at max and flags truncated', () => {
    const raw = Array.from({ length: 1005 }, (_, i) => i).join(',');
    const result = parseNumberList(raw);
    assert.equal(result.values.length, LIST_MAX);
    assert.equal(result.truncated, true);
    assert.deepEqual(result.values.slice(0, 3), [0, 1, 2]);
  });

  test('exactly max is not flagged truncated', () => {
    const raw = Array.from({ length: LIST_MAX }, (_, i) => i).join(',');
    const result = parseNumberList(raw);
    assert.equal(result.values.length, LIST_MAX);
    assert.equal(result.truncated, false);
  });

  test('a custom max', () => {
    const result = parseNumberList('1,2,3,4,5', 3);
    assert.deepEqual(result.values, [1, 2, 3]);
    assert.equal(result.truncated, true);
  });
});

describe('parseNumberList: thousands separators', () => {
  test('a bare comma list with no other separator keeps every comma as a plain separator', () => {
    const result = parseNumberList('100,200,300');
    assert.deepEqual(result.values, [100, 200, 300]);
    assert.deepEqual(result.groupedAsThousands, []);
  });

  test('plain bare-comma single digits are unaffected', () => {
    assert.deepEqual(parseNumberList('1,2,3').values, [1, 2, 3]);
  });

  test('newline-separated grouped numbers are read as one value each', () => {
    const result = parseNumberList('1,000\n2,500');
    assert.deepEqual(result.values, [1000, 2500]);
    assert.deepEqual(result.groupedAsThousands, ['1,000', '2,500']);
  });

  test('comma-and-space-separated grouped numbers (the motivating bug)', () => {
    const result = parseNumberList('1,000, 2,500, 3,000');
    assert.deepEqual(result.values, [1000, 2500, 3000]);
    assert.deepEqual(result.groupedAsThousands, ['1,000', '2,500', '3,000']);
    assert.deepEqual(result.ignored, []);
  });

  test('a decimal tail on a grouped number', () => {
    const result = parseNumberList('1,234.5 2,000');
    assert.deepEqual(result.values, [1234.5, 2000]);
  });

  test('a negative grouped number', () => {
    const result = parseNumberList('-1,000 2,500');
    assert.deepEqual(result.values, [-1000, 2500]);
  });

  test('"1,23, 4": "1,23" is not a valid 3-digit group, so it is read as two separate numbers', () => {
    const result = parseNumberList('1,23, 4');
    assert.deepEqual(result.values, [1, 23, 4]);
    assert.deepEqual(result.groupedAsThousands, []);
    assert.deepEqual(result.ignored, []);
  });

  test('share-link round trip is exact: a grouped-comma paste re-serializes with no grouping commas', () => {
    const parsed = parseNumberList('1,000, 2,500');
    const serialized = formatNumberList(parsed.values);
    assert.equal(serialized, '1000,2500'); // no commas left to re-interpret as grouping or separators
    assert.deepEqual(parseNumberList(serialized).values, parsed.values);
    assert.deepEqual(parseNumberList(serialized).groupedAsThousands, []); // nothing left to flag
  });
});

describe('parseNumberList: unicode minus, currency and percent', () => {
  test('typographic minus (U+2212)', () => {
    assert.deepEqual(parseNumberList('−3, 5').values, [-3, 5]);
  });

  test('en dash used as a minus (U+2013)', () => {
    assert.deepEqual(parseNumberList('–3, 5').values, [-3, 5]);
  });

  test('a leading currency symbol is stripped, sign preserved on either side of it', () => {
    assert.deepEqual(parseNumberList('$12.50, $8').values, [12.5, 8]);
    assert.deepEqual(parseNumberList('-$5, $-5').values, [-5, -5]);
    assert.deepEqual(parseNumberList('£10 €20 ₹30 ¥40').values, [10, 20, 30, 40]);
  });

  test('a trailing percent sign is stripped; the number is unchanged (45% reads as 45)', () => {
    const result = parseNumberList('45%, 50%');
    assert.deepEqual(result.values, [45, 50]);
    assert.deepEqual(result.ignored, []);
  });

  test('a currency-prefixed, comma-grouped, decimal value together', () => {
    assert.deepEqual(parseNumberList('$1,234.50 $2,000').values, [1234.5, 2000]);
  });

  test('parentheses negatives and hex remain unsupported and reported', () => {
    const result = parseNumberList('(123), 0x1F, 5');
    assert.deepEqual(result.values, [5]);
    assert.deepEqual(result.ignored, ['(123)', '0x1F']);
  });
});

describe('formatNumberList', () => {
  test('comma-joined, no spaces', () => {
    assert.equal(formatNumberList([1, 2.5, -3]), '1,2.5,-3');
  });

  test('empty list formats to an empty string', () => {
    assert.equal(formatNumberList([]), '');
  });

  test('round-trips through parseNumberList', () => {
    const values = [1, -2.5, 1000, 0.001];
    assert.deepEqual(parseNumberList(formatNumberList(values)).values, values);
  });
});
