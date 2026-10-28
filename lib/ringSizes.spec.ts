// See mdFiles/steps/42-wave-1-conversion.md, "Run 8". Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  circumferenceFromDiameter,
  circumferenceFromUkIndex,
  circumferenceFromUsSize,
  diameterFromCircumference,
  euSizeFromCircumference,
  formatUkLetter,
  isValidRingMeasurement,
  UK_LETTER_LABELS,
  ukIndexFromCircumference,
  usSizeFromCircumference
} from './ringSizes.ts';

const CLOSE = 1e-9;
const close = (a: number, b: number, tol = CLOSE) => assert.ok(Math.abs(a - b) <= tol, `${a} ~ ${b}`);

describe('geometry', () => {
  test('diameter <-> circumference round-trip exactly, via pi', () => {
    close(diameterFromCircumference(circumferenceFromDiameter(17.3)), 17.3);
    close(circumferenceFromDiameter(diameterFromCircumference(54.4)), 54.4);
  });
});

describe('EU/ISO 8653:2016 (size = inner circumference, mm)', () => {
  test('rounds to the nearest whole mm', () => {
    assert.equal(euSizeFromCircumference(54.4), 54);
    assert.equal(euSizeFromCircumference(54.6), 55);
  });

  test('invalid (<=0) circumference has no EU size', () => {
    assert.ok(Number.isNaN(euSizeFromCircumference(0)));
    assert.ok(Number.isNaN(euSizeFromCircumference(-5)));
  });
});

// BS baseline sanity: ring size C (index 4) is exactly 40mm, per British Standard 6820:1987's own
// stated baseline, quoted via Wikipedia's raw wikitext.
describe('UK/Ireland/Australia (British Standard 6820:1987)', () => {
  test('ring size C (index 4) is exactly 40mm circumference, the Standard\'s own baseline', () => {
    close(circumferenceFromUkIndex(4), 40);
  });

  test('A is index 0, Z is index 50', () => {
    assert.equal(formatUkLetter(0), 'A');
    assert.equal(formatUkLetter(50), 'Z');
    assert.equal(formatUkLetter(1), 'A½');
    assert.equal(formatUkLetter(27), 'N½');
  });

  test('round-trips through circumference', () => {
    for (const index of [0, 4, 13, 26, 37, 50]) {
      const c = circumferenceFromUkIndex(index);
      assert.equal(ukIndexFromCircumference(c), index);
    }
  });

  test('outside A..Z (index 0..50) has no UK letter', () => {
    assert.equal(formatUkLetter(-1), null);
    assert.equal(formatUkLetter(51), null);
    assert.ok(Number.isNaN(ukIndexFromCircumference(circumferenceFromUkIndex(-1))));
    assert.ok(Number.isNaN(ukIndexFromCircumference(circumferenceFromUkIndex(51))));
  });

  test('UK_LETTER_LABELS covers exactly A..Z (51 entries, half-letter granularity)', () => {
    assert.equal(UK_LETTER_LABELS.length, 51);
    assert.deepEqual(UK_LETTER_LABELS[0], { value: 0, label: 'A' });
    assert.deepEqual(UK_LETTER_LABELS[50], { value: 50, label: 'Z' });
    assert.deepEqual(UK_LETTER_LABELS[26], { value: 26, label: 'N' });
  });

  // Cross-check against Goldsmiths' own published UK chart (goldsmiths.co.uk/i/know-your-ring-size),
  // fetched directly. Using their diameter column (the more fundamental of their two
  // slightly-inconsistent columns -- their own circumference and diameter columns do not always
  // agree with each other to the stated precision).
  describe('cross-check against Goldsmiths\' own chart (goldsmiths.co.uk/i/know-your-ring-size)', () => {
    const rows: [string, number][] = [
      ['A', 11.9], ['B', 12.3], ['C', 12.7], ['D', 13.1], ['E', 13.5], ['F', 13.9], ['G', 14.3],
      ['H', 14.7], ['I', 15.1], ['J', 15.5], ['K', 15.9], ['L', 16.3], ['M', 16.7], ['N', 17.1],
      ['O', 17.5], ['P', 17.9], ['S', 19.1], ['T', 19.5], ['V', 20.3], ['W', 20.7], ['Y', 21.5], ['Z', 21.9]
    ];
    for (const [letter, diamMm] of rows) {
      test(`${letter} (diameter ${diamMm}mm) matches exactly`, () => {
        const circ = circumferenceFromDiameter(diamMm);
        assert.equal(formatUkLetter(ukIndexFromCircumference(circ)), letter);
      });
    }
  });
});

// Wikipedia's NA formula, cross-checked against Angara's own published US chart
// (angara.com/blog/ring-size-guide), fetched directly.
describe('US/Canada (North America formula, Wikipedia via the 1921 Bureau of Standards circular)', () => {
  const rows: [number, number][] = [
    [3, 44.3], [3.5, 45.6], [4, 46.8], [4.5, 48.1], [5, 49.3], [6, 51.9], [7, 54.4], [8, 56.9],
    [9, 59.7], [10, 62.2], [11, 64.7], [12, 67.2], [13, 70.1]
  ];
  for (const [usSize, circListed] of rows) {
    test(`US ${usSize}: computed circumference is within 0.5mm of Angara's listed ${circListed}mm`, () => {
      close(circumferenceFromUsSize(usSize), circListed, 0.5);
    });
  }

  test('round-trips through circumference, at quarter-size granularity', () => {
    for (const s of [3, 5, 7, 9.5, 13]) {
      assert.equal(usSizeFromCircumference(circumferenceFromUsSize(s)), s);
    }
  });

  test('a circumference too small for a non-negative US size has no answer', () => {
    assert.ok(Number.isNaN(usSizeFromCircumference(10))); // (10-36.5)/2.55 is negative
  });

  test('invalid (<=0) circumference has no US size', () => {
    assert.ok(Number.isNaN(usSizeFromCircumference(0)));
    assert.ok(Number.isNaN(usSizeFromCircumference(-5)));
  });
});

describe('isValidRingMeasurement', () => {
  test('positive only', () => {
    assert.equal(isValidRingMeasurement(0.1), true);
    assert.equal(isValidRingMeasurement(0), false);
    assert.equal(isValidRingMeasurement(-1), false);
  });
});
