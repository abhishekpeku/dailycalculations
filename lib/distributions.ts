// Dependency-free standard normal and Student's t distribution functions, for the confidence
// interval, margin of error, sample size and p-value calculators. See mdFiles/steps/41-wave-1-statistics.md,
// "Run 2: ... The distribution module" and its "Pre-merge review fix" note, for the full accuracy
// writeup, citations and the bug this version fixes.
//
// normalCDF / normalSF: the standard normal tail Q(z) = P(Z > z) is computed as one-half of the
// *upper* regularized incomplete gamma function, Q(z) = 0.5 * Q_gamma(1/2, z^2/2) — the standard
// identity relating erfc to the incomplete gamma function (see e.g. Numerical Recipes §6.2). The
// incomplete gamma itself is evaluated with Numerical Recipes' own method: a power series for
// z^2/2 < a+1, a continued fraction (Lentz's algorithm, the same technique already used below for
// the incomplete beta) otherwise — the continued fraction branch is what every calculator's tail
// p-value actually exercises, and it is evaluated *directly*, never as 1 minus something close to
// 1, so it keeps full relative precision all the way into the far tail (z = 8, 10, ...). The
// previous version of this file used Abramowitz & Stegun 7.1.26 (a rational approximation to erf
// with ~1.5e-7 *absolute* error), which is nowhere near good enough once the thing being measured
// is itself smaller than 1.5e-7 — a p-value calculator's whole job past about z = 5. See the
// "Pre-merge review fix" note in the step file for the measured digit-level errors this replaced.
//
// normalInverseCDF: Peter J. Acklam's rational approximation for the standard normal quantile
//   function ("An algorithm for computing the inverse normal cumulative distribution function",
//   2003, public domain), ~1.15e-9 relative error over 0 < p < 1, refined by one step of Halley's
//   method (Acklam's own suggested refinement, using the exact normalCDF above) to push the result
//   to within a few ULPs of double precision.
// tCDF / tSF: the regularized incomplete beta function via the standard Student's t identity, with
//   the incomplete beta evaluated by Numerical Recipes' continued-fraction method (Lentz's
//   algorithm) and a Lanczos-approximation logGamma for its prefactor. tSF (the upper tail) is
//   computed directly from the incomplete beta for its own sign of t, exactly like normalSF, so a
//   right-tailed or two-tailed p-value for a large |t| is never derived by subtracting a tiny
//   number from 1.
// tInverseCDF: found by Brent's-method root-finding (lib/solve.ts's findRoot, already used
//   elsewhere by the solver widget) on tCDF, rather than a second, separately-erred closed-form
//   inverse-t approximation — tCDF is strictly monotonic in t for any df > 0, so there is exactly
//   one root.
//
// Accuracy target: >= 6 significant digits (the task's original instruction); in practice the
// normal tail functions hold a *relative* error well under 1e-9 across the whole tested range
// (verified in lib/distributions.spec.ts against published high-precision reference values), and
// the Student's t functions inherit the same continued-fraction/Lanczos precision.

import { findRoot } from './solve.ts';

const MAX_ITERATIONS = 200;
const EPSILON = 3e-16; // close to double precision; both continued fractions below converge to this
const FLOOR = 1e-300; // avoids a literal division by zero without biasing the result

/** Lanczos approximation (g=7, n=9), ~15-digit accuracy. */
function logGamma(x: number): number {
  const g = 7;
  const coeffs = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  const xm1 = x - 1;
  let a = coeffs[0];
  const t = xm1 + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += coeffs[i] / (xm1 + i);
  return 0.5 * Math.log(2 * Math.PI) + (xm1 + 0.5) * Math.log(t) - t + Math.log(a);
}

// ---------- Upper incomplete gamma (Numerical Recipes §6.2, "gammq") ----------

/** Series expansion for the lower regularized incomplete gamma P(a, x), valid for x < a + 1. */
function gammaPSeries(a: number, x: number): number {
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let n = 1; n <= MAX_ITERATIONS; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPSILON) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

/** Continued fraction for the upper regularized incomplete gamma Q(a, x), valid for x >= a + 1. */
function gammaQContinuedFraction(a: number, x: number): number {
  let b = x + 1 - a;
  let c = 1 / FLOOR;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FLOOR) d = FLOOR;
    c = b + an / c;
    if (Math.abs(c) < FLOOR) c = FLOOR;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPSILON) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/**
 * The upper regularized incomplete gamma function Q(a, x) = 1 - P(a, x), for a > 0 and x >= 0.
 * Dispatches to whichever of the two classical methods converges quickly (Numerical Recipes'
 * "gammq"): a power series when x is small relative to a, a continued fraction otherwise. The
 * continued-fraction branch computes Q directly, never as 1 minus the series — exactly the
 * property this module's tail functions need for a p-value far out in the tail.
 */
function gammaQ(a: number, x: number): number {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 1;
  if (x < a + 1) return 1 - gammaPSeries(a, x);
  return gammaQContinuedFraction(a, x);
}

// ---------- Standard normal ----------

/** P(Z > z), the upper tail, computed directly (never as 1 - normalCDF(z)). */
export function normalSF(z: number): number {
  if (z >= 0) return 0.5 * gammaQ(0.5, (z * z) / 2);
  return 1 - normalSF(-z); // "1 - tiny" loses no precision; only "tiny - tiny" or "1 - (1 - tiny)" would
}

/** P(Z <= z) for the standard normal distribution. */
export function normalCDF(z: number): number {
  return z >= 0 ? 1 - normalSF(z) : normalSF(-z);
}

/** Peter J. Acklam's rational approximation (2003), ~1.15e-9 relative error for 0 < p < 1. */
function acklamInverse(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0];
  const low = 0.02425;
  const high = 1 - low;

  if (p < low) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= high) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/**
 * The z such that P(Z <= z) = p. NaN outside 0 < p < 1 (never a flat 0/1 for a meaningless input).
 * Acklam's closed-form approximation, then one step of Halley's method (Acklam's own suggested
 * refinement) using the exact normalCDF/normalSF above, which pushes the ~1.15e-9 relative error
 * of the closed form down to within a few ULPs of double precision.
 */
export function normalInverseCDF(p: number): number {
  if (!(p > 0 && p < 1)) return NaN;
  const x = acklamInverse(p);
  const e = normalCDF(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

// ---------- Student's t ----------

/** Continued fraction for the incomplete beta function (Numerical Recipes §6.4, Lentz's algorithm). */
function betacf(x: number, a: number, b: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FLOOR) d = FLOOR;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX_ITERATIONS; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FLOOR) d = FLOOR;
    c = 1 + aa / c;
    if (Math.abs(c) < FLOOR) c = FLOOR;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FLOOR) d = FLOOR;
    c = 1 + aa / c;
    if (Math.abs(c) < FLOOR) c = FLOOR;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPSILON) break;
  }
  return h;
}

/** Regularized incomplete beta function I_x(a, b), 0 <= x <= 1. */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const prefactor = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (prefactor * betacf(x, a, b)) / a;
  return 1 - (prefactor * betacf(1 - x, b, a)) / b;
}

/** P(T > t), the upper tail, computed directly from the incomplete beta (never as 1 - tCDF(t, df)). */
export function tSF(t: number, df: number): number {
  if (!(df > 0)) return NaN;
  if (t === 0) return 0.5;
  if (t > 0) {
    const x = df / (df + t * t);
    return 0.5 * incompleteBeta(x, df / 2, 0.5);
  }
  return 1 - tSF(-t, df); // "1 - tiny" is safe; see normalSF's identical reasoning above
}

/** P(T <= t) for Student's t distribution with `df` degrees of freedom. NaN for df <= 0. */
export function tCDF(t: number, df: number): number {
  if (!(df > 0)) return NaN;
  return t >= 0 ? 1 - tSF(t, df) : tSF(-t, df);
}

/** The t such that P(T <= t) = p, for df > 0 and 0 < p < 1 (root-found on tCDF). */
export function tInverseCDF(p: number, df: number): number {
  if (!(df > 0) || !(p > 0 && p < 1)) return NaN;
  if (p === 0.5) return 0;
  return findRoot((t) => tCDF(t, df) - p, { guess: 0 });
}
