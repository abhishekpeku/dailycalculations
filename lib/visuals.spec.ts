// Visuals-kit geometry. See mdFiles/steps/32-visuals-kit.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { arcPath, barWidths, clamp, donutSegments, findBand, linearPosition, logPosition, tint, type Band } from './visuals.ts';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected}`);

describe('donutSegments', () => {
  test('sweeps sum to 360° and are contiguous', () => {
    const segments = donutSegments([200000, 231676.38, 1234.5]);
    close(segments.reduce((sum, s) => sum + s.sweep, 0), 360);
    close(segments[segments.length - 1].end, 360);
    for (let i = 1; i < segments.length; i++) assert.equal(segments[i].start, segments[i - 1].end);
    close(segments.reduce((sum, s) => sum + s.fraction, 0), 1);
  });

  test('a 1:3 split is 90° and 270°', () => {
    const [a, b] = donutSegments([1, 3]);
    close(a.sweep, 90);
    close(b.start, 90);
    close(b.sweep, 270);
  });

  test('zero, negative and non-finite values count as 0', () => {
    const segments = donutSegments([0, -5, 10, NaN, Infinity, 30]);
    assert.deepEqual(segments.map((s) => s.sweep), [0, 0, 90, 0, 0, 270]);
    close(segments.reduce((sum, s) => sum + s.sweep, 0), 360);
  });

  test('all zero gives empty sweeps, not NaN', () => {
    const segments = donutSegments([0, 0, -1]);
    assert.ok(segments.every((s) => s.sweep === 0 && s.fraction === 0 && s.start === 0));
    assert.deepEqual(donutSegments([]), []);
  });
});

describe('arcPath', () => {
  test('a zero sweep draws nothing', () => {
    assert.equal(arcPath(50, 50, 48, 32, 90, 90), '');
  });

  test('a quarter starts at 12 o’clock and ends at 3 o’clock', () => {
    const d = arcPath(50, 50, 48, 32, 0, 90);
    assert.ok(d.startsWith('M 50 2 A 48 48 0 0 1 98 50 L 82 50 A 32 32 0 0 0 50 18'), d);
  });

  test('more than 180° sets the large-arc flag', () => {
    assert.match(arcPath(50, 50, 48, 32, 0, 270), /A 48 48 0 1 1/);
  });

  test('a full ring is two half arcs', () => {
    const d = arcPath(50, 50, 48, 32, 0, 360);
    assert.equal(d.match(/M /g)?.length, 2);
    assert.ok(!d.includes('NaN'));
  });
});

describe('linearPosition / logPosition', () => {
  test('linear positions and clamping', () => {
    assert.equal(linearPosition(25, 0, 100), 25);
    assert.equal(linearPosition(15, 10, 20), 50);
    assert.equal(linearPosition(-5, 0, 10), 0);
    assert.equal(linearPosition(50, 0, 10), 100);
    assert.ok(Number.isNaN(linearPosition(NaN, 0, 10)));
    assert.ok(Number.isNaN(linearPosition(5, 10, 10)));
  });

  test('log positions on the force scale (10^-2 to 10^9)', () => {
    assert.equal(logPosition(0.01, -2, 9), 0);
    assert.equal(logPosition(1e9, -2, 9), 100);
    close(logPosition(1, -2, 9), (2 / 11) * 100);
    close(logPosition(686, -2, 9), ((Math.log10(686) + 2) / 11) * 100);
  });

  test('log positions clamp, and values ≤ 0 are not plotted', () => {
    assert.equal(logPosition(1e-9, -2, 9), 0);
    assert.equal(logPosition(1e15, -2, 9), 100);
    assert.ok(Number.isNaN(logPosition(0, -2, 9)));
    assert.ok(Number.isNaN(logPosition(-3, -2, 9)));
    assert.ok(Number.isNaN(logPosition(Infinity, -2, 9)));
  });

  test('clamp', () => {
    assert.equal(clamp(5, 0, 1), 1);
    assert.equal(clamp(-5, 0, 1), 0);
    assert.equal(clamp(0.5, 0, 1), 0.5);
  });
});

describe('findBand', () => {
  // WHO adult BMI categories.
  const bmi: Band[] = [
    { label: 'Underweight', min: 12, max: 18.5 },
    { label: 'Healthy', min: 18.5, max: 25 },
    { label: 'Overweight', min: 25, max: 30 },
    { label: 'Obese', min: 30, max: 40 }
  ];

  test('the lower bound is inclusive and the upper exclusive', () => {
    assert.equal(findBand(bmi, 18.4999), 0);
    assert.equal(findBand(bmi, 18.5), 1);
    assert.equal(findBand(bmi, 24.9), 1);
    assert.equal(findBand(bmi, 25), 2);
    assert.equal(findBand(bmi, 29.99), 2);
    assert.equal(findBand(bmi, 30), 3);
  });

  test('outside the range clamps to the first or last band', () => {
    assert.equal(findBand(bmi, 12), 0);
    assert.equal(findBand(bmi, 5), 0);
    assert.equal(findBand(bmi, -Infinity), 0);
    assert.equal(findBand(bmi, 40), 3);
    assert.equal(findBand(bmi, 65), 3);
    assert.equal(findBand(bmi, Infinity), 3);
  });

  test('NaN and empty bands give -1', () => {
    assert.equal(findBand(bmi, NaN), -1);
    assert.equal(findBand([], 20), -1);
  });
});

describe('barWidths', () => {
  test('scaled to the largest value', () => {
    assert.deepEqual(barWidths([50, 100, 25]), [50, 100, 25]);
  });

  test('negative, zero and non-finite values are empty bars', () => {
    assert.deepEqual(barWidths([-10, 0, NaN, 40]), [0, 0, 0, 100]);
    assert.deepEqual(barWidths([0, 0]), [0, 0]);
  });
});

describe('tint', () => {
  test('appends a hex alpha to #RRGGBB, and leaves other colors alone', () => {
    assert.equal(tint('#0A6CFF', 1), '#0A6CFFff');
    assert.equal(tint('#0A6CFF', 0), '#0A6CFF00');
    assert.equal(tint('#0A6CFF', 0.5), '#0A6CFF80');
    assert.equal(tint('red', 0.5), 'red');
  });
});
