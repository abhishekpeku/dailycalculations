// Parser/evaluator checks for the scientific-calculator custom widget. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from './scientificCalc.ts';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected}`);

describe('scientificCalc: arithmetic and precedence', () => {
  test('basic operators', () => {
    assert.equal(evaluateExpression('2+3'), 5);
    assert.equal(evaluateExpression('10-4'), 6);
    assert.equal(evaluateExpression('6*7'), 42);
    assert.equal(evaluateExpression('9/2'), 4.5);
  });

  test('standard order of operations (PEMDAS)', () => {
    assert.equal(evaluateExpression('2+3*4'), 14);
    assert.equal(evaluateExpression('(2+3)*4'), 20);
    assert.equal(evaluateExpression('2*3+4*5'), 26);
    assert.equal(evaluateExpression('2+3^2'), 11);
  });

  test('exponents are right-associative', () => {
    assert.equal(evaluateExpression('2^3^2'), 512); // 2^(3^2), not (2^3)^2 = 64
  });

  test('unary minus binds looser than exponentiation', () => {
    assert.equal(evaluateExpression('-2^2'), -4); // -(2^2), the standard math-class convention
    close(evaluateExpression('2^-2'), 0.25);
  });

  test('implicit multiplication', () => {
    assert.equal(evaluateExpression('2(3+4)'), 14);
    assert.equal(evaluateExpression('(2)(3)'), 6);
    close(evaluateExpression('2pi'), 2 * Math.PI);
  });

  test('typographic calculator symbols', () => {
    assert.equal(evaluateExpression('6×7'), 42);
    assert.equal(evaluateExpression('9÷2'), 4.5);
    assert.equal(evaluateExpression('5−3'), 2);
    close(evaluateExpression('√9'), 3);
  });

  test('is case-insensitive', () => {
    close(evaluateExpression('SIN(30)'), 0.5);
    close(evaluateExpression('LOG(100)'), 2);
  });
});

describe('scientificCalc: constants', () => {
  test('pi and e', () => {
    assert.equal(evaluateExpression('pi'), Math.PI);
    assert.equal(evaluateExpression('e'), Math.E);
  });
});

describe('scientificCalc: factorial', () => {
  test('n! for small nonnegative integers', () => {
    assert.equal(evaluateExpression('0!'), 1);
    assert.equal(evaluateExpression('5!'), 120);
    assert.equal(evaluateExpression('10!'), 3628800);
  });

  test('binds tighter than ^, looser than unary minus', () => {
    assert.equal(evaluateExpression('3!^2'), 36); // (3!)^2
    assert.equal(evaluateExpression('-3!'), -6); // -(3!)
  });

  test('refuses a non-integer or negative argument, not a wrong number', () => {
    assert.ok(Number.isNaN(evaluateExpression('2.5!')));
    assert.ok(Number.isNaN(evaluateExpression('(-3)!')));
  });

  test('overflows honestly past 170!', () => {
    assert.equal(evaluateExpression('170!'), 170 * evaluateExpression('169!'));
    assert.equal(evaluateExpression('171!'), Infinity);
  });
});

describe('scientificCalc: trig, deg/rad toggle', () => {
  test('degrees (default)', () => {
    close(evaluateExpression('sin(30)'), 0.5);
    close(evaluateExpression('cos(60)'), 0.5);
    close(evaluateExpression('tan(45)'), 1);
  });

  test('radians', () => {
    close(evaluateExpression('sin(pi/6)', 'rad'), 0.5);
    close(evaluateExpression('cos(pi/3)', 'rad'), 0.5);
  });

  // Post-review fix (pre-merge review of PR #20): IEEE 754 double precision can't represent pi
  // exactly, so a naive Math.sin(Math.PI) lands a few ulps away from 0 (and Math.tan(Math.PI/2)
  // is a huge finite number) instead of the true, mathematically exact answer.
  test('degree mode is exact at multiples of 90°, not a floating-point approximation', () => {
    assert.equal(evaluateExpression('cos(90)'), 0);
    assert.equal(evaluateExpression('sin(180)'), 0);
    assert.equal(evaluateExpression('tan(180)'), 0);
    assert.equal(evaluateExpression('cos(450)'), 0); // 450° = 90° + a full turn
    assert.equal(evaluateExpression('sin(-180)'), 0);
    assert.equal(evaluateExpression('sin(90)'), 1);
    assert.equal(evaluateExpression('cos(180)'), -1);
  });

  test('tan is undefined (NaN, not a huge number) exactly at 90° and 270°', () => {
    assert.ok(Number.isNaN(evaluateExpression('tan(90)')));
    assert.ok(Number.isNaN(evaluateExpression('tan(270)')));
  });

  test('a value merely close to 90°, not exactly on it, still returns the real tangent', () => {
    const t = evaluateExpression('tan(89.9999)');
    assert.ok(Number.isFinite(t) && t > 1000); // genuinely huge, but a real finite number
  });

  test('radian mode snaps a near-zero sin/cos result to exactly 0', () => {
    assert.equal(evaluateExpression('sin(pi)', 'rad'), 0);
    assert.equal(evaluateExpression('cos(pi/2)', 'rad'), 0);
  });

  test('radian mode: tan is NaN wherever cos snaps to 0', () => {
    assert.ok(Number.isNaN(evaluateExpression('tan(pi/2)', 'rad')));
    assert.ok(Number.isNaN(evaluateExpression('tan(3*pi/2)', 'rad')));
  });

  test('inverse trig returns in the selected angle mode', () => {
    close(evaluateExpression('asin(0.5)'), 30);
    close(evaluateExpression('asin(0.5)', 'rad'), Math.PI / 6);
    close(evaluateExpression('acos(0.5)'), 60);
    close(evaluateExpression('atan(1)'), 45);
  });

  test('asin/acos refuse an out-of-domain argument', () => {
    assert.ok(Number.isNaN(evaluateExpression('asin(2)')));
    assert.ok(Number.isNaN(evaluateExpression('acos(-2)')));
  });
});

describe('scientificCalc: logs and roots', () => {
  test('ln is natural log, log is base 10', () => {
    close(evaluateExpression('ln(e)'), 1);
    assert.equal(evaluateExpression('log(100)'), 2);
    assert.equal(evaluateExpression('log(1000)'), 3);
  });

  test('refuse a non-positive argument, not a wrong number', () => {
    assert.ok(Number.isNaN(evaluateExpression('ln(0)')));
    assert.ok(Number.isNaN(evaluateExpression('ln(-5)')));
    assert.ok(Number.isNaN(evaluateExpression('log(-1)')));
  });

  test('sqrt refuses a negative radicand', () => {
    assert.equal(evaluateExpression('sqrt(16)'), 4);
    assert.ok(Number.isNaN(evaluateExpression('sqrt(-1)')));
  });
});

describe('scientificCalc: a combined expression', () => {
  test('matches the site\'s own worked example', () => {
    // sin(30°) + log(100) × 5! = 0.5 + 2 × 120 = 240.5
    close(evaluateExpression('sin(30) + log(100) * 5!'), 240.5);
  });

  test('nested function composition', () => {
    close(evaluateExpression('sin(cos(0))'), Math.sin(Math.PI / 180)); // cos(0)=1 (deg argument to sin)
    close(evaluateExpression('ln(e^2)'), 2);
    close(evaluateExpression('sqrt(sqrt(16))'), 2);
  });

  test('implicit multiplication combined with a function call', () => {
    close(evaluateExpression('2sin(90)'), 2); // 2 * sin(90deg) = 2 * 1
    close(evaluateExpression('3√(4)'), 6); // 3 * sqrt(4) = 3 * 2
  });

  test('a long expression mixing every feature at once', () => {
    // (2+3)^2 - 4! / ln(e) + 2pi = 25 - 24/1 + 2pi = 1 + 2pi
    close(evaluateExpression('(2+3)^2 - 4!/ln(e) + 2pi'), 1 + 2 * Math.PI);
  });
});

describe('scientificCalc: malformed input', () => {
  test('throws rather than guessing', () => {
    assert.throws(() => evaluateExpression('(2+3'));
    assert.throws(() => evaluateExpression('2+3)'));
    assert.throws(() => evaluateExpression('2+'));
    assert.throws(() => evaluateExpression('2$3'));
    assert.throws(() => evaluateExpression('sin30)'));
  });

  test('empty input is NaN, not an error', () => {
    assert.ok(Number.isNaN(evaluateExpression('')));
    assert.ok(Number.isNaN(evaluateExpression('   ')));
  });
});
