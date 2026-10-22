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
    assert.deepEqual(parseNumberList(''), { values: [], ignored: [], truncated: false });
  });

  test('whitespace-only string parses to an empty list', () => {
    assert.deepEqual(parseNumberList('   \n\t  '), { values: [], ignored: [], truncated: false });
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
