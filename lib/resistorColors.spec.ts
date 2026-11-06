// See lib/resistorColors.ts for sourcing. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DIGIT_COLORS, MULTIPLIER_COLORS, TOLERANCE_COLORS, resistanceFromColorBands } from './resistorColors.ts';

describe('resistor color tables', () => {
  test('digit colors: 10 colors, black=0 through white=9, no duplicate values', () => {
    assert.equal(DIGIT_COLORS.length, 10);
    assert.deepEqual(DIGIT_COLORS.map((c) => c.value), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.equal(DIGIT_COLORS[0].label, 'Black');
    assert.equal(DIGIT_COLORS[9].label, 'White');
  });

  test('multiplier colors: the 10 digit colors as powers of ten, plus gold (0.1) and silver (0.01), all distinct', () => {
    assert.equal(MULTIPLIER_COLORS.length, 12);
    const values = MULTIPLIER_COLORS.map((c) => c.value);
    assert.equal(new Set(values).size, values.length, 'no duplicate multiplier values');
    assert.equal(MULTIPLIER_COLORS.find((c) => c.label === 'Black')?.value, 1);
    assert.equal(MULTIPLIER_COLORS.find((c) => c.label === 'Red')?.value, 100);
    assert.equal(MULTIPLIER_COLORS.find((c) => c.label === 'Blue')?.value, 1e6);
    assert.equal(MULTIPLIER_COLORS.find((c) => c.label === 'Gold')?.value, 0.1);
    assert.equal(MULTIPLIER_COLORS.find((c) => c.label === 'Silver')?.value, 0.01);
  });

  test('tolerance colors: brown=1%, red=2%, gold=5%, silver=10%, none=20%, all distinct', () => {
    const values = TOLERANCE_COLORS.map((c) => c.value);
    assert.equal(new Set(values).size, values.length, 'no duplicate tolerance values');
    assert.equal(TOLERANCE_COLORS.find((c) => c.label === 'Brown')?.value, 1);
    assert.equal(TOLERANCE_COLORS.find((c) => c.label === 'Red')?.value, 2);
    assert.equal(TOLERANCE_COLORS.find((c) => c.label === 'Gold')?.value, 5);
    assert.equal(TOLERANCE_COLORS.find((c) => c.label === 'Silver')?.value, 10);
    assert.equal(TOLERANCE_COLORS.find((c) => c.label.startsWith('None'))?.value, 20);
  });
});

describe('resistanceFromColorBands', () => {
  // Wikipedia, "Electronic color code": "a resistor with bands of red, violet, green, and gold has
  // first digit 2 (red), second digit 7 (violet), followed by 5 (green) zeroes: 2,700,000 ohms."
  test('4-band: red, violet, green, gold = 2,700,000 Ω (the Wikipedia worked example)', () => {
    const digit1 = DIGIT_COLORS.find((c) => c.label === 'Red')!.value;
    const digit2 = DIGIT_COLORS.find((c) => c.label === 'Violet')!.value;
    const multiplier = MULTIPLIER_COLORS.find((c) => c.label === 'Green')!.value;
    assert.equal(resistanceFromColorBands(digit1, digit2, 0, multiplier, 0), 2700000);
  });

  // This page's own worked example: yellow, violet, red, gold = 4,700 Ω, ±5%.
  test('4-band: yellow, violet, red, gold = 4,700 Ω', () => {
    const digit1 = DIGIT_COLORS.find((c) => c.label === 'Yellow')!.value;
    const digit2 = DIGIT_COLORS.find((c) => c.label === 'Violet')!.value;
    const multiplier = MULTIPLIER_COLORS.find((c) => c.label === 'Red')!.value;
    assert.equal(resistanceFromColorBands(digit1, digit2, 0, multiplier, 0), 4700);
  });

  test('5-band uses all three significant digits', () => {
    // brown, black, black, brown (×10) -> digits 100, ×10 = 1,000 Ω.
    const brown = DIGIT_COLORS.find((c) => c.label === 'Brown')!.value;
    const black = DIGIT_COLORS.find((c) => c.label === 'Black')!.value;
    const multiplier = MULTIPLIER_COLORS.find((c) => c.label === 'Brown')!.value;
    assert.equal(resistanceFromColorBands(brown, black, black, multiplier, 1), 1000);
  });

  test('a 4-band resistor ignores the third digit entirely', () => {
    const brown = DIGIT_COLORS.find((c) => c.label === 'Brown')!.value;
    const black = DIGIT_COLORS.find((c) => c.label === 'Black')!.value;
    const multiplier = MULTIPLIER_COLORS.find((c) => c.label === 'Brown')!.value;
    assert.equal(resistanceFromColorBands(brown, black, 9, multiplier, 0), resistanceFromColorBands(brown, black, 0, multiplier, 0));
  });
});
