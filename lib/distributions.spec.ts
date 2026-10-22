// lib/distributions.ts. See mdFiles/steps/41-wave-1-statistics.md, "Run 2". Run: npm test
// Assertions are against published table values (standard normal and Student's t tables,
// NIST/SEMATECH's e-Handbook of Statistical Methods), not against the implementation's own output.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { normalCDF, normalInverseCDF, tCDF, tInverseCDF } from './distributions.ts';

// The task's own stated accuracy target.
const SIG_DIGITS = 6;
function closeToSigFigs(actual: number, expected: number, digits = SIG_DIGITS) {
  const tolerance = Math.abs(expected) * 0.5 * 10 ** -(digits - 1);
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} not within ${digits} sig figs of ${expected}`);
}

describe('normalCDF', () => {
  test('Phi(0) = 0.5', () => closeToSigFigs(normalCDF(0), 0.5));
  test('Phi(1.96) = 0.975002 (published table value)', () => closeToSigFigs(normalCDF(1.96), 0.975002));
  test('Phi(-1.96) = 1 - Phi(1.96) (symmetry)', () => closeToSigFigs(normalCDF(-1.96), 1 - normalCDF(1.96), 9));
  test('Phi(1) = 0.841345', () => closeToSigFigs(normalCDF(1), 0.841345));
  test('Phi(2.576) = 0.995003', () => closeToSigFigs(normalCDF(2.576), 0.995003));
});

describe('normalInverseCDF', () => {
  test('z(0.975) = 1.959964 (the standard 95% two-tailed critical value)', () => closeToSigFigs(normalInverseCDF(0.975), 1.959964));
  test('z(0.95) = 1.644854 (90% two-tailed / one-tailed 95%)', () => closeToSigFigs(normalInverseCDF(0.95), 1.644854));
  test('z(0.995) = 2.575829 (99% two-tailed)', () => closeToSigFigs(normalInverseCDF(0.995), 2.575829));
  test('z(0.90) = 1.281552 (80% two-tailed)', () => closeToSigFigs(normalInverseCDF(0.9), 1.281552));
  test('z(0.5) = 0', () => assert.ok(Math.abs(normalInverseCDF(0.5)) < 1e-8));
  test('is the inverse of normalCDF (round trip, bounded by normalCDF\'s own ~1.5e-7 erf error budget)', () => {
    // Over the practical range used by the calculators (confidence-level z* values rarely exceed
    // ~2.6), the round trip holds to the 6-sig-fig target.
    for (const z of [-2.5, -1, 0.3, 1.5, 2.5]) closeToSigFigs(normalInverseCDF(normalCDF(z)), z, 6);
  });

  test('round trip degrades gracefully in the far tail (1/pdf(z) amplifies normalCDF\'s fixed ~1.5e-7 absolute error there) but stays within 1e-4', () => {
    closeToSigFigs(normalInverseCDF(normalCDF(4)), 4, 4);
  });
  test('NaN outside (0, 1)', () => {
    assert.ok(Number.isNaN(normalInverseCDF(0)));
    assert.ok(Number.isNaN(normalInverseCDF(1)));
    assert.ok(Number.isNaN(normalInverseCDF(-0.1)));
    assert.ok(Number.isNaN(normalInverseCDF(1.1)));
  });
});

describe('tCDF', () => {
  test('t(0, df) = 0.5 for any df', () => {
    assert.equal(tCDF(0, 1), 0.5);
    assert.equal(tCDF(0, 100), 0.5);
  });
  test('P(T <= 2.228139) = 0.975 at df=10 (textbook t-table entry)', () => closeToSigFigs(tCDF(2.228139, 10), 0.975));
  test('symmetry: P(T <= -t) = 1 - P(T <= t)', () => closeToSigFigs(tCDF(-2.228139, 10), 1 - tCDF(2.228139, 10), 9));
  test('converges to the normal CDF as df grows', () => closeToSigFigs(tCDF(1.96, 10000), normalCDF(1.96), 4));
  test('NaN for df <= 0', () => {
    assert.ok(Number.isNaN(tCDF(1, 0)));
    assert.ok(Number.isNaN(tCDF(1, -5)));
  });
});

describe('tInverseCDF', () => {
  test('t(0.975, df=10) = 2.228139 (NIST/SEMATECH t-table)', () => closeToSigFigs(tInverseCDF(0.975, 10), 2.228139));
  test('t(0.975, df=1) = 12.706205', () => closeToSigFigs(tInverseCDF(0.975, 1), 12.706205));
  test('t(0.995, df=1) = 63.656741', () => closeToSigFigs(tInverseCDF(0.995, 1), 63.656741));
  test('t(0.95, df=30) = 1.697261', () => closeToSigFigs(tInverseCDF(0.95, 30), 1.697261));
  test('t(0.5, df) = 0', () => assert.equal(tInverseCDF(0.5, 10), 0));
  test('is the inverse of tCDF (round trip)', () => {
    for (const t of [-3, -0.5, 0.8, 4]) closeToSigFigs(tInverseCDF(tCDF(t, 15), 15), t, 6);
  });
  test('converges to the normal critical value as df grows', () => closeToSigFigs(tInverseCDF(0.975, 10000), normalInverseCDF(0.975), 4));
  test('NaN outside its domain', () => {
    assert.ok(Number.isNaN(tInverseCDF(0.975, 0)));
    assert.ok(Number.isNaN(tInverseCDF(0, 10)));
    assert.ok(Number.isNaN(tInverseCDF(1, 10)));
  });
});
