// Dependency-free standard normal and Student's t distribution functions, for the confidence
// interval, margin of error, sample size and p-value calculators. See mdFiles/steps/41-wave-1-statistics.md,
// "Run 2: ... The distribution module", for the full accuracy writeup and citations.
//
// normalCDF: Abramowitz & Stegun, Handbook of Mathematical Functions, formula 7.1.26 — a rational
//   approximation to erf with max absolute error 1.5e-7.
// normalInverseCDF: Peter J. Acklam's rational approximation for the standard normal quantile
//   function ("An algorithm for computing the inverse normal cumulative distribution function",
//   2003, public domain), accurate to about 1.15e-9 relative error over 0 < p < 1. A closed form,
//   not a root-find.
// tCDF: the regularized incomplete beta function via the standard Student's t identity, with the
//   incomplete beta evaluated by Numerical Recipes' continued-fraction method (Lentz's algorithm)
//   and a Lanczos-approximation logGamma for its prefactor.
// tInverseCDF: found by Brent's-method root-finding (lib/solve.ts's findRoot, already used
//   elsewhere by the solver widget) on tCDF, rather than a second, separately-erred closed-form
//   inverse-t approximation — tCDF is strictly monotonic in t for any df > 0, so there is exactly
//   one root.
//
// Accuracy target: >= 6 significant digits, verified in lib/distributions.spec.ts against
// published table values (standard normal and Student's t tables, NIST/SEMATECH).

import { findRoot } from './solve.ts';

// ---------- Standard normal ----------

/** Abramowitz & Stegun 7.1.26, max absolute error 1.5e-7. */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-ax * ax);
  return sign * y;
}

/** P(Z <= z) for the standard normal distribution. */
export function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
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

/** The z such that P(Z <= z) = p. NaN outside 0 < p < 1 (never a flat 0/1 for a meaningless input). */
export function normalInverseCDF(p: number): number {
  if (!(p > 0 && p < 1)) return NaN;
  return acklamInverse(p);
}

// ---------- Student's t ----------

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

/** Continued fraction for the incomplete beta function (Numerical Recipes §6.4, Lentz's algorithm). */
function betacf(x: number, a: number, b: number): number {
  const MAX_ITERATIONS = 200;
  const EPSILON = 3e-16;
  const FLOOR = 1e-300; // avoids a literal division by zero without biasing the result
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

/** P(T <= t) for Student's t distribution with `df` degrees of freedom. NaN for df <= 0. */
export function tCDF(t: number, df: number): number {
  if (!(df > 0)) return NaN;
  if (t === 0) return 0.5;
  const x = df / (df + t * t);
  const ib = incompleteBeta(x, df / 2, 0.5);
  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

/** The t such that P(T <= t) = p, for df > 0 and 0 < p < 1 (root-found on tCDF). */
export function tInverseCDF(p: number, df: number): number {
  if (!(df > 0) || !(p > 0 && p < 1)) return NaN;
  if (p === 0.5) return 0;
  return findRoot((t) => tCDF(t, df) - p, { guess: 0 });
}
