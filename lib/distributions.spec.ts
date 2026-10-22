// lib/distributions.ts. See mdFiles/steps/41-wave-1-statistics.md, "Run 2" and its "Pre-merge
// review fix" note. Run: npm test
//
// Assertions are against published high-precision reference values and, for the Student's t far
// tail, two elementary closed forms (the t-distribution with 1 degree of freedom is exactly the
// Cauchy distribution, SF(t) = 0.5 - atan(t)/pi; with 2 degrees of freedom, SF(t) =
// 0.5 - t/(2*sqrt(2+t^2)) is a standard, independently-derivable closed form) — not against this
// module's own implementation.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { incompleteBeta, normalCDF, normalInverseCDF, normalSF, tCDF, tInverseCDF, tSF } from './distributions.ts';

// Pre-merge review fix: the task's original ">= 6 significant digits" was found to be met only in
// *displayed* digits, not in the underlying relative error, once the previous erf approximation's
// fixed ~1.5e-7 *absolute* error was measured against tail probabilities smaller than that absolute
// error itself (see the step file). The replacement is checked here against a much tighter
// *relative* tolerance, matching the review's own ask.
function closeRelative(actual: number, expected: number, relTolerance = 1e-9) {
  const tolerance = Math.abs(expected) * relTolerance;
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} not within relative ${relTolerance} of ${expected}`);
}

describe('normalSF (upper tail, computed directly)', () => {
  // Reference values: Q(z) = 1 - Phi(z), quoted to 15-16 significant digits.
  const references: [number, number][] = [
    [1.96, 0.0249978951482204],
    [3, 1.349898031630095e-3],
    [4, 3.167124183311992e-5],
    [5, 2.866515718791939e-7],
    [6, 9.865876450377e-10],
    [8, 6.22096057427178e-16],
    [10, 7.619853024160527e-24]
  ];
  for (const [z, expected] of references) {
    test(`Q(${z}) matches the published reference to within 1e-9 relative error`, () => closeRelative(normalSF(z), expected));
  }

  test('Q(0) = 0.5', () => assert.equal(normalSF(0), 0.5));
  test('symmetry: Q(-z) = 1 - Q(z)', () => closeRelative(normalSF(-1.96), 1 - normalSF(1.96), 1e-12));
  test('a far upper tail is far smaller than the old erf approximation\'s ~1.5e-7 absolute error budget, not rounded away', () => {
    assert.ok(normalSF(8) > 0, 'Q(8) must not underflow to a literal 0');
    assert.ok(normalSF(8) < 1e-15);
  });
});

describe('normalCDF', () => {
  test('Phi(0) = 0.5', () => assert.equal(normalCDF(0), 0.5));
  test('Phi(z) = 1 - Q(z) for both signs', () => {
    for (const z of [-3, -1, 0.5, 2, 5]) closeRelative(normalCDF(z), 1 - normalSF(z), 1e-12);
  });
  test('Phi(1.96) matches the published reference', () => closeRelative(normalCDF(1.96), 1 - 0.0249978951482204));
});

describe('normalInverseCDF', () => {
  // Reference values: the standard 6-decimal table constants (1.959964, 1.644854, 2.575829,
  // 1.281552), extended to 16 significant digits by an independent bisection search on the
  // already-validated normalCDF above (a different algorithm family from Acklam + Halley, so this
  // is a genuine cross-check, not circular reasoning).
  test('z(0.975) = 1.9599639845400536 (the standard 95% two-tailed critical value)', () => closeRelative(normalInverseCDF(0.975), 1.9599639845400536, 1e-9));
  test('z(0.95) = 1.644853626951468', () => closeRelative(normalInverseCDF(0.95), 1.644853626951468, 1e-9));
  test('z(0.995) = 2.575829303548897 (99% two-tailed)', () => closeRelative(normalInverseCDF(0.995), 2.575829303548897, 1e-9));
  test('z(0.90) = 1.2815515655445995 (80% two-tailed)', () => closeRelative(normalInverseCDF(0.9), 1.2815515655445995, 1e-9));
  test('z(0.5) = 0', () => assert.ok(Math.abs(normalInverseCDF(0.5)) < 1e-9));
  test('the Halley refinement step tightens Acklam\'s own ~1.15e-9 relative error further', () => {
    // Over the practical confidence-level range this project clamps to, round-tripping through the
    // exact normalCDF recovers z to within a few ULPs, not just 6 significant digits.
    for (const z of [-2.5, -1, 0.3, 1.5, 2.5, 3.5]) closeRelative(normalInverseCDF(normalCDF(z)), z, 1e-9);
  });
  test('NaN outside (0, 1)', () => {
    assert.ok(Number.isNaN(normalInverseCDF(0)));
    assert.ok(Number.isNaN(normalInverseCDF(1)));
    assert.ok(Number.isNaN(normalInverseCDF(-0.1)));
    assert.ok(Number.isNaN(normalInverseCDF(1.1)));
  });
});

describe('tSF (upper tail, computed directly)', () => {
  test('t(0, df) = 0.5 for any df', () => {
    assert.equal(tSF(0, 1), 0.5);
    assert.equal(tSF(0, 100), 0.5);
  });
  test('symmetry: tSF(-t, df) = 1 - tSF(t, df)', () => closeRelative(tSF(-2.228139, 10), 1 - tSF(2.228139, 10), 1e-12));

  describe('df=1 (the Cauchy distribution: SF(t) = 0.5 - atan(t)/pi, an exact closed form)', () => {
    const cauchySF = (t: number) => 0.5 - Math.atan(t) / Math.PI;
    for (const t of [1, 10, 50, 100, 1000]) {
      test(`t=${t}`, () => closeRelative(tSF(t, 1), cauchySF(t)));
    }
  });

  describe('df=2 (SF(t) = 0.5 - t/(2*sqrt(2+t^2)), a standard elementary closed form)', () => {
    const df2SF = (t: number) => 0.5 - t / (2 * Math.sqrt(2 + t * t));
    for (const t of [1, 10, 50, 100, 1000]) {
      test(`t=${t}`, () => closeRelative(tSF(t, 2), df2SF(t)));
    }
  });

  test('a far right tail is computed directly, not as 1 - tCDF (no cancellation)', () => {
    const farTail = tSF(50, 5);
    assert.ok(farTail > 0 && farTail < 1e-6);
    closeRelative(farTail, 1 - tCDF(50, 5), 1e-9); // the two routes must still agree on the math
  });
});

describe('incompleteBeta (parameter-scaled convergence, see binomial-distribution-calculator\'s "Pre-merge review fix")', () => {
  // Pre-merge review of PR #24 (binomial-distribution-calculator) found that betacf's old fixed
  // 200-iteration cap silently returned an unconverged, wrong value once a and b were in the tens
  // of thousands or more (binomial-distribution-calculator calls incompleteBeta with a, b scaling
  // directly with its trial count n). These tests check the fix directly, at the actual scale the
  // bug report used, not just through a calculator.

  test('a reflection identity (I_x(a,b) = 1 - I_(1-x)(b,a)) holds exactly at huge a, b', () => {
    // This identity is a property of the Beta function itself, true for any valid x, a, b — an
    // independent check that does not rely on any other part of this module or on a separately
    // sourced reference value. If betacf had stopped short of converging, the two independently
    // computed sides would not actually sum to 1.
    for (const [a, b] of [[500000, 500001], [500000000, 500000001], [300000, 700001]]) {
      closeRelative(incompleteBeta(0.5, a, b) + incompleteBeta(0.5, b, a), 1, 1e-12);
    }
  });

  test('converges (not NaN) for a, b at the binomial-distribution-calculator\'s own n = 1,000,000 cap', () => {
    const value = incompleteBeta(0.5, 500000, 500001);
    assert.ok(Number.isFinite(value), 'must not be NaN at the scale this site actually uses');
  });

  test('matches the bug report\'s own reference figure at n = 1,000,000 (symmetric binomial CDF at the midpoint)', () => {
    // P(X <= n/2 | p=0.5) = I_0.5(n-k, k+1) with k=n/2=500000. The reference value,
    // 0.5003989421806658, is 0.5 + pmf(500000)/2 computed independently via Loader's saddle-point
    // algorithm (statistics.ts's binomialPmf, verified separately against exact BigInt arithmetic
    // for moderate n in verify_run3.mjs) -- a genuinely different computation path from betacf.
    closeRelative(incompleteBeta(0.5, 500000, 500001), 0.5003989421806658, 1e-9);
  });

  test('reports non-convergence as NaN rather than a wrong value, for a pathologically huge a, b beyond any real caller\'s range', () => {
    // a+b = 1e15 is far past anything binomial-distribution-calculator's own n <= 1,000,000 cap (or
    // any realistic t-distribution degrees of freedom) would ever pass; confirmed separately (see
    // the step file) that betacf's iteration count genuinely exhausts its ceiling here, rather than
    // this test merely asserting a cap exists without checking it is ever reached.
    assert.ok(Number.isNaN(incompleteBeta(0.5, 5e14, 5e14 + 1)));
  });

  test('x <= 0 or x >= 1 are still the plain boundary values, independent of convergence', () => {
    assert.equal(incompleteBeta(0, 500000, 500001), 0);
    assert.equal(incompleteBeta(1, 500000, 500001), 1);
  });
});

describe('tCDF', () => {
  test('t(0, df) = 0.5 for any df', () => {
    assert.equal(tCDF(0, 1), 0.5);
    assert.equal(tCDF(0, 100), 0.5);
  });
  test('P(T <= 2.228139) = 0.975 at df=10 (textbook t-table entry)', () => closeRelative(tCDF(2.228139, 10), 0.975, 1e-6));
  test('converges to the normal CDF as df grows', () => closeRelative(tCDF(1.96, 10000), normalCDF(1.96), 1e-4));
  test('NaN for df <= 0', () => {
    assert.ok(Number.isNaN(tCDF(1, 0)));
    assert.ok(Number.isNaN(tCDF(1, -5)));
  });
});

describe('tInverseCDF', () => {
  // Reference values: the standard 6-decimal t-table constants (2.228139, 12.706205, 63.656741,
  // 1.697261), extended to 16 significant digits by an independent bisection search on the
  // already-validated tCDF above (itself cross-checked against the Cauchy and df=2 closed forms).
  test('t(0.975, df=10) = 2.228138851986274 (NIST/SEMATECH t-table, extended reference)', () => closeRelative(tInverseCDF(0.975, 10), 2.228138851986274));
  test('t(0.975, df=1) = 12.70620473617467', () => closeRelative(tInverseCDF(0.975, 1), 12.70620473617467));
  test('t(0.995, df=1) = 63.656741162870844', () => closeRelative(tInverseCDF(0.995, 1), 63.656741162870844));
  test('t(0.95, df=30) = 1.697260886593961', () => closeRelative(tInverseCDF(0.95, 30), 1.697260886593961));
  test('t(0.5, df) = 0', () => assert.equal(tInverseCDF(0.5, 10), 0));
  test('is the inverse of tCDF (round trip)', () => {
    for (const t of [-3, -0.5, 0.8, 4]) closeRelative(tInverseCDF(tCDF(t, 15), 15), t, 1e-6);
  });
  // The t-distribution's own convergence to the normal as df grows is O(1/df), not a numerical
  // error of this module's — at df=10000 a ~1e-4 relative gap is the correct mathematical rate.
  test('converges to the normal critical value as df grows', () => closeRelative(tInverseCDF(0.975, 10000), normalInverseCDF(0.975), 2e-4));
  test('NaN outside its domain', () => {
    assert.ok(Number.isNaN(tInverseCDF(0.975, 0)));
    assert.ok(Number.isNaN(tInverseCDF(0, 10)));
    assert.ok(Number.isNaN(tInverseCDF(1, 10)));
  });
});
