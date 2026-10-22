import type { CalculatorConfig, CalculatorInput } from './types.ts';
import { chiSquareSF, incompleteBeta, logGamma, normalCDF, normalInverseCDF, normalSF, tCDF, tInverseCDF, tSF } from '../../lib/distributions.ts';

// p-value-calculator: a floor on the displayed p-value and cumulative probability. For an extreme
// test statistic (z or t beyond roughly +-39) the true probability underflows below the smallest
// representable double (~5e-324) and is mathematically, not just displayably, indistinguishable
// from 0 in double precision. Rather than show a bare "0" (which reads as "no evidence at all,"
// not "smaller than this calculator can represent"), this floor keeps the displayed figure a
// genuine, nonzero, honestly tiny number that formats in scientific notation — see the watch-out
// item on p-value-calculator for the wording shown to the reader.
const P_VALUE_FLOOR = 1e-300;
const floorTinyProbability = (value: number) => Math.max(value, P_VALUE_FLOOR);

// binomial-distribution-calculator: unlike p-value-calculator's floor above (where the true answer
// is a continuous quantity that can genuinely underflow but is never exactly 0), several binomial
// inputs produce a mathematically EXACT 0 or 1 (p = 0% or p = 100%, or k outside 0..n) — flooring
// those would turn a correct exact answer into a misleading tiny-but-nonzero number, a real bug a
// pre-merge review of PR #24 found. This floor only touches a value that is already nonzero but
// small enough to risk displaying as a bare, misleading 0; an exact 0 (or a NaN from an invalid
// input) passes through unchanged.
const floorNonzeroProbability = (value: number) => (value === 0 || !Number.isFinite(value) ? value : Math.max(value, P_VALUE_FLOOR));

// A confidence level has no natural upper bound in this kit (CalculatorInput has no `max`), and the
// snapshot harness's own "typical" input set scales every default by 1.5x — so a 95% default would
// become 142.5% there. Clamping keeps every confidence-level field honest instead of producing NaN
// for a meaningless >=100% or <=0% input; same precedent as percentile-calculator's own clamp.
function clampConfidence(level: number) {
  return Math.min(99.99, Math.max(0.01, level));
}

// Pre-merge review fix (run 4, PR #25): several statistics calculators take a literal count — a
// sample size, a finite population size — that mathematically must be a whole number. A fractional
// "n" (e.g. 10.5) was silently accepted and answered a different question (a fractional degrees of
// freedom, a fractional standard error) without saying so — the same bug class a pre-merge review
// of binomial-distribution-calculator found in run 3 (there, Math.round silently changed the
// question; here, prior to this fix, nothing rounded OR refused it). Returns the value unchanged
// when it is a whole number >= min, otherwise NaN — never a rounded guess.
function requireIntegerAtLeast(value: number, min: number) {
  return Number.isInteger(value) && value >= min ? value : NaN;
}

// Pre-merge review fix (run 4, PR #25): a perfect correlation or fit (r = +-1, or a one-sample
// t-test where every value is identical) makes the t-statistic exactly +-Infinity — a real,
// legitimate result (tCDF/tSF already return an exact 0 or 1 there, never NaN), not a missing
// calculation. The true p-value at t = +-Infinity is EXACTLY 0 (P(T > Infinity) = 0 by definition),
// not a continuous quantity that underflowed double precision the way a merely large FINITE t's
// p-value genuinely can — flooring an exact 0 to 1e-300 would misrepresent a provably perfect
// result as "immeasurably tiny" rather than "impossible to be more extreme." Same "exact vs.
// underflowed" distinction a pre-merge review of binomial-distribution-calculator already
// established (run 3, floorNonzeroProbability above) — here the discriminator is the test
// statistic's own finiteness, not whether the computed probability happens to equal 0.
function floorFiniteTailProbability(rawPValue: number, statistic: number) {
  return Number.isFinite(statistic) ? floorTinyProbability(rawPValue) : rawPValue;
}

// Pre-merge review fix (run 4, PR #25): chi-square-calculator's goodness-of-fit totals check
// (observed and expected must sum to the same total, within float noise) — see its own compute()
// comment for the full reasoning. 1e-6 relative is tight enough to catch a real mismatch (observed
// summing to 60, expected entered as proportions summing to 1) while tolerating ordinary floating-
// point rounding in the sums themselves.
const TOTALS_RELATIVE_TOLERANCE = 1e-6;

// Shared "data list" input: a paste-a-list textarea (CalculatorInput.type: 'list'), parsed by
// lib/listParse.ts. Replaces the "How many numbers?" + numbered-slot stopgap statistics run 1
// shipped with — see mdFiles/steps/41-wave-1-statistics.md, "List input (between run 1 and run 2)",
// for why and the full design. Every list-based calculator in this category reuses this one helper.
function listInput(defaults: number[], min = 1): CalculatorInput {
  return {
    id: 'data',
    label: 'Your numbers',
    type: 'list',
    placeholder: 'Paste or type numbers — commas, spaces or new lines between them. $, % and thousands commas like 1,000 are understood.',
    defaultValue: 0,
    listDefault: defaults,
    listMin: min
  };
}

// Population and sample variance of a list, shared by standard-deviation-calculator and
// variance-calculator so the two pages can never silently disagree on the underlying numbers.
function varianceOf(list: number[]) {
  const n = list.length;
  const mean = list.reduce((a, b) => a + b, 0) / n;
  const sumSq = list.reduce((a, b) => a + (b - mean) ** 2, 0);
  return { mean, sumSq, populationVariance: sumSq / n, sampleVariance: sumSq / (n - 1) };
}

// NIST/SEMATECH Engineering Statistics Handbook §7.2.6.2 "Percentiles": set p(N+1) = k + d (k an
// integer, 0 <= d < 1), then linearly interpolate between the k-th and (k+1)-th order statistics.
// This is Hyndman & Fan's "type 6" definition (NIST's own Dataplot software default) — a different,
// equally standard convention from Excel's PERCENTILE.INC ("type 7"), which can give a slightly
// different answer for the same data; see the watch-out item on percentile-calculator's page.
function percentileOf(sorted: number[], targetPercentile: number) {
  const n = sorted.length;
  const rank = (targetPercentile / 100) * (n + 1);
  const k = Math.floor(rank);
  const d = rank - k;
  if (k <= 0) return sorted[0];
  if (k >= n) return sorted[n - 1];
  return sorted[k - 1] + d * (sorted[k] - sorted[k - 1]);
}

// Exact integer arithmetic (BigInt) for permutation-calculator and combination-calculator, so a
// large nPr/nCr is never silently shown as a rounded double pretending to be exact — same precedent
// as factorial-calculator (step 40 run 3). Capped at the same practical n = 1,000 that calculator uses.
const COUNTING_MAX_N = 1000;

// nPr(n, r) = n x (n-1) x ... x (n-r+1), r terms — computed directly rather than via n!/(n-r)!, so a
// large n with a small or moderate r (e.g. n=1000, r=2) never needs a needlessly huge intermediate
// factorial just to produce a much smaller answer. r > n is 0 ways by the standard convention (not
// "undefined") — Wolfram MathWorld's Permutation entry states this explicitly.
function nPrBig(n: number, r: number): bigint {
  if (r > n) return 0n;
  let result = 1n;
  const nBig = BigInt(n);
  for (let i = 0n; i < BigInt(r); i++) result *= nBig - i;
  return result;
}

function factorialBig(n: number): bigint {
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result;
}

// nCr = nPr(n, r) / r!, exact BigInt division — always exact because nCr is always a whole number,
// a standard combinatorial fact, so BigInt's floor-division never actually floors anything here.
function nCrBig(n: number, r: number): bigint {
  if (r > n) return 0n;
  return nPrBig(n, r) / factorialBig(r);
}

// BigInt -> a display number, honestly: Number(big) past Number.MAX_SAFE_INTEGER (2^53 - 1) is a
// correctly-rounded double, not the exact integer — exactly factorial-calculator's own note. The
// digit count, from the BigInt's own string form, stays exact at any size.
function bigToDisplay(big: bigint) {
  return { value: Number(big), digitCount: big.toString().length };
}

// Binomial PMF/CDF/SF, shared by binomial-distribution-calculator.
//
// Pre-merge review of PR #24 found two real bugs in the first version of this block, both from the
// same root cause: a plain log(n!) - log(k!) - log((n-k)!) PMF, and a CDF/SF built on
// lib/distributions.ts's incomplete beta function, both lean on logGamma evaluated at n, k and n-k
// directly. logGamma's own relative error (~1e-15) is fine on its own, but once n is in the millions
// logGamma(n) is itself a large number (around 1.3e7 at n=1e6, around 2e10 at n=1e9), so that same
// relative error becomes an ABSOLUTE error of several units in the last few digits once three such
// large logGamma values are subtracted — exactly the kind of cancellation this file's other
// functions (normalSF, tSF) were built to avoid. Separately, lib/distributions.ts's betacf continued
// fraction (used by incompleteBeta) needs roughly sqrt(a+b) iterations to actually converge, and its
// fixed 200-iteration cap was silently returning an unconverged, wrong value for any n past about
// 40,000 — with no signal anything had gone wrong. Full writeup, the specific wrong numbers found,
// and the fix verification: mdFiles/steps/41-wave-1-statistics.md's "Pre-merge review fix" note.
//
// The fix has three parts:
// 1. betacf/incompleteBeta (lib/distributions.ts) now scale their iteration budget to the parameters
//    and report non-convergence as NaN instead of a silently wrong partial result — a general fix
//    that also protects every other incompleteBeta caller (tCDF/tSF), not just this file.
// 2. The PMF is now Catherine Loader's saddle-point algorithm ("Fast and Accurate Computation of
//    Binomial Probabilities", 2000) — the same algorithm R's own dbinom() uses — via stirlerr/bd0
//    below. It regroups the Stirling/log-likelihood terms so the dangerous subtraction never
//    involves a quantity anywhere near logGamma(n)'s own magnitude, keeping full relative precision
//    (verified to the 1e-13–1e-16 level against exact BigInt arithmetic) at any n this page allows.
// 3. BINOMIAL_MAX_N is lowered from an unproven 1e9 to 1,000,000 — the largest n this file could
//    actually verify the CDF/SF to within 1e-9 relative error (the logGamma-cancellation error above
//    grows with n; empirically it crosses 1e-9 somewhere around n=2–3 million, so 1,000,000 keeps a
//    safety margin), stated honestly in the page's own watch-out copy rather than claimed past where
//    it was actually checked.
const BINOMIAL_MAX_N = 1_000_000;

// Loader's stirlerr(n): the exact correction term in ln(n!) = (n+0.5)ln(n) - n + 0.5ln(2*pi) +
// stirlerr(n). For n <= 15 it is a lookup table of exact values (SFERR_HALVES, indexed by 2n since
// every entry is a half-integer step) rather than the series, which would lose precision for a small
// argument; for n > 15 it is Loader's own asymptotic series. Crucially, stirlerr(n) is a TINY,
// directly-computed number for large n (about 1/(12n), nowhere near logGamma(n)'s own magnitude), so
// using it instead of raw logGamma differences is what avoids this file's original cancellation bug.
const SFERR_HALVES = [
  0, 0.1534264097200273452913848, 0.0810614667953272582196702, 0.0548141210519176538961390, 0.0413406959554092940938221,
  0.03316287351993628748511048, 0.02767792568499833914878929, 0.02374616365629749597132920, 0.02079067210376509311152277,
  0.01848845053267318523077934, 0.01664469118982119216319487, 0.01513497322191737887351255, 0.01387612882307074799874573,
  0.01281046524292022692424986, 0.01189670994589177009505572, 0.01110455975820691732662991, 0.010411265261972096497478567,
  0.009799416126158803298389475, 0.009255462182712732917728637, 0.008768700134139385462952823, 0.008330563433362871256469318,
  0.007934114564314020547248100, 0.007573675487951840794972024, 0.007244554301320383179543912, 0.006942840107209529865664152,
  0.006665247032707682442354394, 0.006408994188004207068439631, 0.006171712263039457647532867, 0.005951370112758847735624416,
  0.005746216513010115682023589, 0.005554733551962801371038690
];
const STIRLERR_S0 = 1 / 12, STIRLERR_S1 = 1 / 360, STIRLERR_S2 = 1 / 1260, STIRLERR_S3 = 1 / 1680, STIRLERR_S4 = 1 / 1188;

function stirlerr(n: number) {
  if (n <= 15) {
    const doubled = n + n;
    if (Number.isInteger(doubled)) return SFERR_HALVES[doubled];
    return logGamma(n + 1) - (n + 0.5) * Math.log(n) + n - 0.5 * Math.log(2 * Math.PI);
  }
  const nn = n * n;
  if (n > 500) return (STIRLERR_S0 - STIRLERR_S1 / nn) / n;
  if (n > 80) return (STIRLERR_S0 - (STIRLERR_S1 - STIRLERR_S2 / nn) / nn) / n;
  if (n > 35) return (STIRLERR_S0 - (STIRLERR_S1 - (STIRLERR_S2 - STIRLERR_S3 / nn) / nn) / nn) / n;
  return (STIRLERR_S0 - (STIRLERR_S1 - (STIRLERR_S2 - (STIRLERR_S3 - STIRLERR_S4 / nn) / nn) / nn) / nn) / n;
}

// Loader's bd0(x, np): a numerically careful "deviance" x*ln(x/np) + np - x. The naive formula
// cancels catastrophically when x is close to np (exactly the region every realistic k/n*p
// comparison falls in), so bd0 uses a convergent series there instead and the naive formula only
// where it is safe (x and np far apart, where there is no cancellation to begin with).
function bd0(x: number, np: number) {
  if (Math.abs(x - np) < 0.1 * (x + np)) {
    let v = (x - np) / (x + np);
    let s = (x - np) * v;
    if (s === 0) return 0;
    let ej = 2 * x * v;
    v *= v;
    for (let j = 1; j < 1000; j++) {
      ej *= v;
      const s1 = s + ej / (2 * j + 1);
      if (s1 === s) return s1;
      s = s1;
    }
    return s;
  }
  return x * Math.log(x / np) + np - x;
}

// P(X = k): Loader's saddle-point formula, accurate to the limits of double precision at any n this
// file allows (see the block comment above) — never the earlier version's log(choose) + k*log(p) +
// (n-k)*log(1-p), which loses digits once logGamma(n) itself is large.
function binomialPmf(n: number, k: number, p: number) {
  if (p === 0) return k === 0 ? 1 : 0; // 0 * log(0) would otherwise be NaN, not 0
  if (p === 1) return k === n ? 1 : 0;
  if (k < 0 || k > n) return 0; // standard convention: more successes than trials is impossible, not undefined
  const q = 1 - p;
  if (k === 0) {
    if (n === 0) return 1;
    const lc = p < 0.1 ? -bd0(n, n * q) - n * p : n * Math.log(q);
    return Math.exp(lc);
  }
  if (k === n) {
    const lc = q < 0.1 ? -bd0(n, n * p) - n * q : n * Math.log(p);
    return Math.exp(lc);
  }
  const lc = stirlerr(n) - stirlerr(k) - stirlerr(n - k) - bd0(k, n * p) - bd0(n - k, n * q);
  const lf = Math.log(2 * Math.PI) + Math.log(k) + Math.log1p(-k / n);
  return Math.exp(lc - 0.5 * lf);
}

// The CDF and SF are each computed directly from the regularized incomplete beta function via the
// standard binomial-beta identity (NIST DLMF §8.17.5) — never as 1 - CDF, so a deep upper-tail
// probability keeps full relative precision instead of losing it to "1 - (1 - tiny)" cancellation.
// incompleteBeta (lib/distributions.ts) now reports non-convergence as NaN rather than a silently
// wrong value (see the block comment above) — that NaN propagates here honestly rather than being
// masked.
function binomialCdf(n: number, k: number, p: number) {
  if (k < 0) return 0;
  if (k >= n) return 1;
  return incompleteBeta(1 - p, n - k, k + 1); // P(X <= k) = I_(1-p)(n-k, k+1)
}

function binomialSf(n: number, k: number, p: number) {
  if (k <= 0) return 1;
  if (k > n) return 0;
  return incompleteBeta(p, k, n - k + 1); // P(X >= k) = I_p(k, n-k+1), computed directly, never as 1 - CDF
}

// Paired x/y list inputs for correlation-calculator and linear-regression-calculator. Reuses the
// same `type: 'list'` mechanism as every other list input, just twice with distinct ids — the kit
// already parses/shares/completeness-checks each list input independently by its own id (see
// lib/breakdown.ts's computeLists/evaluateBreakdown), so two of them need no new plumbing there.
// The one thing the kit does NOT do on its own is check the two lists are the SAME length — a
// wrong-paste-length mistake (9 x-values, 10 y-values) would otherwise silently mispair every
// point after the mismatch. `breakdown.pairedLists` (data/calculators/types.ts, lib/breakdown.ts)
// shows a specific "lengths don't match" message in the live widget; compute() below independently
// checks the same thing and returns NaN for every output — never truncating or padding to force an
// answer — because data/calculators.spec.ts's snapshot harness calls compute() directly and must
// see the same honest behavior without going through the widget at all. This is the design the
// Parked note on weighted-average-calculator's own two-list (value/weight) idea was waiting on; see
// mdFiles/steps/41-wave-1-statistics.md, "Run 4", for whether that retrofit is viable now.
function pairedListInputs(xDefaults: number[], yDefaults: number[], min = 2): CalculatorInput[] {
  return [
    { id: 'xData', label: 'X values', type: 'list', placeholder: 'Paste or type your x-values — commas, spaces or new lines between them.', defaultValue: 0, listDefault: xDefaults, listMin: min },
    {
      id: 'yData',
      label: 'Y values',
      type: 'list',
      placeholder: 'Paste or type your y-values, in the same order as the x-values above (one y for every x).',
      defaultValue: 0,
      listDefault: yDefaults,
      listMin: min
    }
  ];
}

// Mean-centered, two-pass sums shared by correlation-calculator and linear-regression-calculator,
// so the two pages can never silently disagree on the underlying numbers (same precedent as
// variance-calculator/standard-deviation-calculator sharing varianceOf). Deliberately NOT the
// textbook single-pass shortcut Sxy = Sum(xy) - n*xbar*ybar: that shortcut subtracts two numbers
// that are both huge and nearly equal whenever x or y is itself large (e.g. values around 1e9 —
// years as a raw timestamp, population counts), which cancels away most of the precision it is
// trying to compute. Centering first (every term is a small x[i]-xbar difference before it is ever
// squared or multiplied) avoids that catastrophic cancellation regardless of how large the raw
// values are — verified directly in the run's scratch script with x values around 1e9.
function pairedStats(xs: number[], ys: number[]) {
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  return { n, meanX, meanY, sxx, syy, sxy };
}

export const statisticsCalculators: CalculatorConfig[] = [
  {
    id: 'mean-median-mode-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['mean median mode calculator', 'measures of central tendency calculator', 'median calculator', 'find the mode calculator', 'central tendency calculator'],
    related: ['average-calculator', 'standard-deviation-calculator', 'percentile-calculator', 'weighted-average-calculator'],
    title: 'Mean, Median & Mode Calculator',
    description: 'Find the mean, median and mode of a list of numbers — up to 1,000 of them — the three most common ways to summarize a data set with one typical value, and how they can disagree.',
    example: "Five kids at a party are 7, 9, 7, 10 and 8 years old. The mean is 8.2, the median is 8, and the mode is 7 (it's the only age that repeats).",
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What are mean, median and mode?',
        paragraphs: [
          'Mean, median and mode are the three most common "measures of central tendency" — three different ways of answering the same question, "what is a typical value in this data set?" They usually land close to each other, but not always, and the gap between them is often the most useful thing a data set can tell you.',
          'The mean is the arithmetic average: add every value and divide by how many there are (the same calculation this site\'s average calculator does). The median is the middle value once the list is sorted — half the data falls below it, half above. The mode is simply the value that shows up most often; a data set can have one mode, several (multimodal), or none at all if every value is different.',
          'They diverge most clearly on skewed data. Household income is the classic example: a handful of very high earners pull the mean upward, while the median — unaffected by how extreme the biggest values get, only by their rank — stays close to what a "typical" household actually earns. That is why income statistics are almost always reported as a median, not a mean.',
          'This calculator covers all three together. For a plain mean on its own, see the average calculator; for how spread out the data is around the mean, see the standard deviation and variance calculators.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, separated by commas, spaces or new lines — a column copied straight out of a spreadsheet works as-is.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines. A genuine 0 among them counts normally; order does not matter, since the calculator sorts the list itself.' },
          { name: 'Check the count', text: 'The box shows a live count of how many numbers it understood. Anything that isn\'t a number is dropped and listed below the box, so a stray label or unit does not silently throw off your result.' },
          { name: 'Read the mean', text: 'The headline is the arithmetic mean: the sum of your numbers divided by how many there are.' },
          { name: 'Check the median and mode', text: 'The rows below show the median (the middle value once sorted) and the mode (the most frequent value), plus how many values are tied for that mode.' },
          { name: 'See the sum, min, max and range', text: 'The remaining rows give the total, the smallest and largest values, and the range between them.' },
          { name: 'Compare the three', text: 'The chart plots your lowest value, your mean and your highest value side by side, so you can see at a glance where the mean sits relative to the spread.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Three separate calculations on the same sorted list of numbers.',
        expression: 'Mean = (x₁ + x₂ + ... + xₙ) ÷ n\nMedian = the middle value when sorted (or the average of the two middle values if n is even)\nMode = the value(s) that occur most often',
        terms: [
          { symbol: 'x₁, x₂, ..., xₙ', meaning: 'Each number in the list.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' }
        ],
        note: 'If every value in a list of 2 or more is different, there is no mode by the usual definition — this calculator reports that honestly (as "—") rather than guessing. A single-number list is the one exception: its one value counts as its own mode.'
      },
      workedExample: {
        intro: 'Five kids at a birthday party, ages 7, 9, 7, 10 and 8.',
        rows: [
          { label: 'Sorted', value: '7, 7, 8, 9, 10' },
          { label: 'Sum (7 + 9 + 7 + 10 + 8)', value: '41' },
          { label: 'Mean (41 ÷ 5)', value: '8.2' },
          { label: 'Median (the middle of 5 sorted values)', value: '8' },
          { label: 'Mode (the only age that repeats)', value: '7 (appears twice)' }
        ],
        result: 'Mean 8.2, median 8, mode 7',
        explanation: 'All three sit close together here, which is typical of data with no extreme values. The mean (8.2) is not a whole number and does not have to be; the median (8) is always an actual value from the list, or exactly halfway between two of them.'
      },
      watchOut: [
        { title: 'The mean is sensitive to outliers; the median usually is not', body: 'Change the largest age in the example from 10 to 50 and the mean jumps to 16.2 — no longer a believable "typical" age — while the median stays at 8, since it only cares about rank, not magnitude.' },
        { title: 'No mode, or more than one, are both normal outcomes', body: 'If every value in a list of 2 or more numbers is different, this calculator reports no mode at all (shown as "—"), rather than picking one arbitrarily. If two or more values are tied for the most frequent, it reports all of them as tied (a multimodal data set) and names the smallest as the "primary" one shown on the chart.' },
        { title: 'The median formula depends on whether the count is odd or even', body: 'With an odd count, the median is the single middle value after sorting. With an even count, it is the average of the two middle values — which, unlike the mean of the whole list, can be a number that falls exactly between two data points.' },
        { title: 'This is not the same as a weighted average', body: 'Mean, median and mode all treat every number in the list equally. If some numbers should count more than others — like a final exam worth more than a quiz — use the weighted average calculator instead.' },
        { title: 'Non-numeric tokens are dropped, not averaged in as zero', body: 'Anything pasted into the box that is not a number — a stray label, a unit, a trailing comma — is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers; a bare comma-only list like 100,200,300 still reads as three numbers.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §2.5 Measures of the Center of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data' },
        { label: 'Wolfram MathWorld, Statistical Median', url: 'https://mathworld.wolfram.com/StatisticalMedian.html' },
        { label: 'Wolfram MathWorld, Mode', url: 'https://mathworld.wolfram.com/Mode.html' }
      ]
    },
    inputs: [listInput([7, 9, 7, 10, 8], 1)],
    breakdown: {
      headline: 'mean',
      headlineLabel: 'Mean (average)',
      outputs: [
        { id: 'mean', label: 'Mean (average)', format: 'significant' },
        { id: 'median', label: 'Median', format: 'significant' },
        { id: 'primaryMode', label: 'Mode', format: 'significant' },
        { id: 'modeCount', label: 'Values tied for the mode', format: 'integer' },
        { id: 'sum', label: 'Sum', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' },
        { id: 'min', label: 'Lowest value', format: 'significant' },
        { id: 'max', label: 'Highest value', format: 'significant' },
        { id: 'range', label: 'Range', format: 'significant' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'min', label: 'Lowest value' }, { from: 'mean', label: 'Mean' }, { from: 'max', label: 'Highest value' }],
        title: 'Lowest, mean, highest',
        highlight: 1
      }
    },
    seo: {
      title: 'Mean, Median & Mode Calculator – Central Tendency',
      description: 'Free mean, median and mode calculator. Paste a list of up to 1,000 numbers to find all three measures of central tendency, with a worked example and clear mode rules.',
      faq: [
        { question: 'How do I find the mean, median and mode?', answer: 'The mean is the sum divided by the count. The median is the middle value once the list is sorted. The mode is the value that appears most often. For 7, 9, 7, 10, 8: mean 8.2, median 8, mode 7.' },
        { question: 'What is the difference between mean, median and mode?', answer: 'They are three different ways to describe a "typical" value. The mean uses every number\'s exact size; the median only uses rank (position once sorted); the mode only uses frequency (how often a value repeats).' },
        { question: 'Which measure should I use?', answer: 'The mean is standard for symmetric data with no extreme outliers. The median is more reliable for skewed data — incomes and home prices are almost always reported as a median. The mode is most useful for categorical or clustered data, like the most common shoe size sold.' },
        { question: 'What if there is no mode?', answer: 'If every value in a list of 2 or more numbers is different, there is no mode — this calculator shows "—" rather than guessing one. A list with only one number counts that number as its own mode.' },
        { question: 'Can a data set have more than one mode?', answer: 'Yes — if two or more values are tied for the highest frequency, the data set is multimodal. This calculator reports how many values are tied and shows the smallest of them as the "primary" one on the chart.' },
        { question: 'How is the median calculated for an even number of values?', answer: 'Average the two middle values after sorting. For 4 sorted values, that is the average of the 2nd and 3rd.' },
        { question: 'Why is my mean not one of the numbers I entered?', answer: 'The mean is a calculated balance point, not a value that has to already appear in the list — the same as the average calculator\'s result.' },
        { question: 'Is the mode the same as an outlier?', answer: 'No — they are opposites in a sense. The mode is the most common value; an outlier is an unusually rare, extreme value far from the rest of the data.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines — a column copied from a spreadsheet pastes in as-is.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const n = list.length;
      const sum = list.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const sorted = [...list].sort((a, b) => a - b);
      const median = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      const freq = new Map<number, number>();
      for (const value of list) freq.set(value, (freq.get(value) ?? 0) + 1);
      const maxFreq = Math.max(...freq.values());
      const modeExists = maxFreq > 1 || n === 1;
      const tiedModes = modeExists
        ? [...freq.entries()].filter(([, count]) => count === maxFreq).map(([value]) => value).sort((a, b) => a - b)
        : [];
      const min = sorted[0];
      const max = sorted[n - 1];
      return {
        mean,
        median,
        primaryMode: modeExists ? tiedModes[0] : NaN,
        modeCount: modeExists ? tiedModes.length : 0,
        sum,
        count: n,
        min,
        max,
        range: max - min
      };
    }
  },
  {
    id: 'standard-deviation-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['std dev calculator', 'standard deviation of a data set calculator', 'population standard deviation calculator', 'sample standard deviation calculator', 'sigma calculator'],
    related: ['variance-calculator', 'mean-median-mode-calculator', 'z-score-calculator', 'average-calculator'],
    title: 'Standard Deviation Calculator',
    description: 'Find the population and sample standard deviation of a list of numbers — up to 1,000 of them — shown side by side with every step of the calculation.',
    example: 'Five test scores of 72, 85, 90, 78 and 95 have a mean of 84, a population standard deviation of about 8.22, and a sample standard deviation of about 9.19.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is standard deviation?',
        paragraphs: [
          'Standard deviation measures how spread out a list of numbers is around its mean. A small standard deviation means most values sit close to the mean; a large one means the values are spread widely. It is the square root of variance (see the variance calculator), expressed in the same units as the original data, which is why standard deviation is usually the easier of the two figures to interpret directly.',
          'There are two versions of the formula, and the difference between them matters. The population standard deviation (symbol σ, "sigma") divides by n, the full count — use it when your list genuinely is the entire group you care about. The sample standard deviation (symbol s) divides by n − 1 instead, a correction (sometimes called Bessel\'s correction) that compensates for a sample tending to underestimate the true spread of the larger population it was drawn from. Most real-world data — a handful of test scores, a batch of measurements, a survey of some but not all customers — is a sample, which is why spreadsheet software (Excel\'s STDEV, Google Sheets\' STDEV) treats the sample version as the default.',
          'This calculator shows both, clearly labeled, rather than quietly picking one and hiding the other.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, separated by commas, spaces or new lines — the calculation does not depend on the order they are in.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines, in any order — up to 1,000 of them.' },
          { name: 'Check the count', text: 'Anything that isn\'t a number is dropped and listed below the box, along with the live count of numbers it understood.' },
          { name: 'Read the sample standard deviation', text: 'The headline divides by n − 1, the common default for data that is a sample of a larger group.' },
          { name: 'Check the population standard deviation', text: 'The row below divides by n instead — use this one only if your numbers are the entire population, not a sample of it.' },
          { name: 'See both variances', text: 'The variance rows show each standard deviation\'s value before the square root — useful if you need variance directly for a further calculation.' },
          { name: 'Compare the two', text: 'The chart places the population and sample figures side by side; the sample value is always the larger of the two (division by a smaller number).' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Both versions start the same way: find the mean, subtract it from every value, square each difference, and add those squares up. They differ only in what they divide that total by.',
        expression: 'Population: σ = √(Σ(xᵢ − mean)² ÷ n)\nSample: s = √(Σ(xᵢ − mean)² ÷ (n − 1))',
        terms: [
          { symbol: 'xᵢ', meaning: 'Each number in the list.' },
          { symbol: 'mean', meaning: 'The arithmetic mean of the list.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' }
        ],
        note: 'This is an estimate of spread, not a prediction — a different sample from the same underlying population would give a slightly different number. Use the population version only when your list is genuinely the entire group of interest, not a sample drawn from something larger.'
      },
      workedExample: {
        intro: 'Five test scores: 72, 85, 90, 78 and 95.',
        rows: [
          { label: 'Mean (72 + 85 + 90 + 78 + 95) ÷ 5', value: '84' },
          { label: 'Squared differences from the mean', value: '144, 1, 36, 36, 121' },
          { label: 'Sum of squared differences', value: '338' },
          { label: 'Population variance (338 ÷ 5)', value: '67.6' },
          { label: 'Sample variance (338 ÷ 4)', value: '84.5' },
          { label: 'Population standard deviation (√67.6)', value: '≈ 8.22' },
          { label: 'Sample standard deviation (√84.5)', value: '≈ 9.19' }
        ],
        result: 'Population σ ≈ 8.22, sample s ≈ 9.19',
        explanation: 'The sample figure is always larger here because dividing by 4 (n − 1) instead of 5 (n) spreads the same total (338) over a smaller number, which is exactly the correction the n − 1 convention is designed to make.'
      },
      watchOut: [
        { title: 'Dividing by n or n − 1 is not a rounding choice — it changes which question you are answering', body: 'Population and sample standard deviation are two different, equally valid calculations, not two roundings of the same answer. Picking the wrong one for your situation gives a number that technically answers a different question than the one you meant to ask.' },
        { title: 'A single value has no sample standard deviation', body: 'With only one number, the sample formula divides by n − 1 = 0 — a genuine 0 ÷ 0, mathematically undefined. This calculator shows that honestly as "—" rather than guessing a value. The population standard deviation of a single value is still a legitimate 0 (one point has no spread).' },
        { title: 'Standard deviation is sensitive to outliers, like the mean it is built around', body: 'Because every deviation is squared before being averaged, one unusually far-off value can dominate the result far more than its single vote would suggest.' },
        { title: 'This is a point estimate, not the "true" spread', body: 'A different sample of the same size from the same underlying group would almost certainly produce a slightly different standard deviation. The n − 1 correction reduces the bias of that estimate; it does not eliminate the sampling variation itself.' },
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §2.7 Measures of the Spread of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data' },
        { label: 'Wolfram MathWorld, Standard Deviation', url: 'https://mathworld.wolfram.com/StandardDeviation.html' }
      ]
    },
    inputs: [listInput([72, 85, 90, 78, 95], 1)],
    breakdown: {
      headline: 'sampleStdDev',
      headlineLabel: 'Standard deviation (sample, s)',
      outputs: [
        { id: 'sampleStdDev', label: 'Standard deviation (sample, s)', format: 'significant' },
        { id: 'populationStdDev', label: 'Standard deviation (population, σ)', format: 'significant' },
        { id: 'sampleVariance', label: 'Variance (sample, s²)', format: 'significant' },
        { id: 'populationVariance', label: 'Variance (population, σ²)', format: 'significant' },
        { id: 'mean', label: 'Mean', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'populationStdDev', label: 'Population (σ)' }, { from: 'sampleStdDev', label: 'Sample (s)' }],
        title: 'Population vs. sample standard deviation',
        highlight: 1
      }
    },
    seo: {
      title: 'Standard Deviation Calculator – Population & Sample',
      description: 'Free standard deviation calculator. Paste a list of up to 1,000 numbers to find both the population and sample standard deviation, with variance and a worked example.',
      faq: [
        { question: 'How do I calculate standard deviation?', answer: 'Find the mean, subtract it from each number and square the result, add those squares up, divide by n (population) or n − 1 (sample), then take the square root.' },
        { question: "What is the difference between population and sample standard deviation?", answer: 'Population standard deviation divides by n, the full count — use it only when your data is the entire group you care about. Sample standard deviation divides by n − 1, the common choice when your data is a sample of a larger group.' },
        { question: 'Why divide by n − 1 for a sample?', answer: "Dividing by a smaller number makes the result a bit larger, which corrects for the tendency of a sample to underestimate the true spread of the population it came from — a correction often called Bessel's correction." },
        { question: 'What does a standard deviation of 0 mean?', answer: 'Every value in the list is identical — there is no spread at all.' },
        { question: 'Can I find standard deviation with only one number?', answer: 'The population standard deviation of a single value is 0 (no spread). The sample standard deviation is undefined — it needs at least two values, since its formula divides by n − 1.' },
        { question: 'How is standard deviation related to variance?', answer: 'Standard deviation is the square root of variance. Variance is in squared units (useful for further statistics); standard deviation is in the original units, which is usually easier to interpret.' },
        { question: 'Which spreadsheet function matches this calculator?', answer: "Excel and Google Sheets' STDEV (and STDEV.S) match this calculator's sample standard deviation; STDEVP (or STDEV.P) matches the population figure." },
        { question: 'Does the order I enter numbers in matter?', answer: 'No — standard deviation only depends on which values are in the list, not the order they were typed in.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const { mean, populationVariance, sampleVariance } = varianceOf(list);
      return {
        mean,
        count: list.length,
        populationVariance,
        sampleVariance,
        populationStdDev: Math.sqrt(populationVariance),
        sampleStdDev: Math.sqrt(sampleVariance)
      };
    }
  },
  {
    id: 'variance-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['variance of a data set calculator', 'population variance calculator', 'sample variance calculator', 'find the variance calculator'],
    related: ['standard-deviation-calculator', 'mean-median-mode-calculator', 'z-score-calculator', 'average-calculator'],
    title: 'Variance Calculator',
    description: 'Find the population and sample variance of a list of up to 1,000 numbers, shown side by side — the squared-units measure of spread behind standard deviation.',
    example: 'The same five test scores as the standard deviation calculator — 72, 85, 90, 78 and 95 — have a population variance of 67.6 and a sample variance of 84.5.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is variance?',
        paragraphs: [
          'Variance measures how spread out a list of numbers is around its mean, in squared units. It is the same underlying calculation as standard deviation — in fact, variance is exactly standard deviation squared — but without the final square root step.',
          'Because it is in squared units (a variance of test scores is in "points squared," which has no real-world meaning on its own), variance is rarely the number reported directly to a general audience; standard deviation, in the original units, is usually easier to interpret. Variance matters anyway because it is the figure several further statistical formulas are built on directly — including, further down this site\'s statistics category, z-scores and confidence intervals — so it is worth being able to find on its own, not just as a stepping stone inside the standard deviation calculator.',
          'Like standard deviation, variance comes in a population version (dividing by n) and a sample version (dividing by n − 1) — see that calculator\'s concept section for the full reasoning behind the distinction, which applies here identically.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, separated by commas, spaces or new lines, in any order.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines — up to 1,000 of them.' },
          { name: 'Check the count', text: 'Anything that isn\'t a number is dropped and listed below the box, along with the live count of numbers it understood.' },
          { name: 'Read the sample variance', text: 'The headline divides by n − 1, the common default for a sample of a larger group.' },
          { name: 'Check the population variance', text: 'The row below divides by n instead — use it only when your numbers are the entire population.' },
          { name: 'See the matching standard deviations', text: 'The last two rows show each variance\'s square root, tying this page directly to the standard deviation calculator\'s own numbers.' },
          { name: 'Compare the two', text: 'The chart places the population and sample variance side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Find the mean, subtract it from every value, square each difference, then average those squares — dividing by n for the population version or n − 1 for the sample version.',
        expression: 'Population: σ² = Σ(xᵢ − mean)² ÷ n\nSample: s² = Σ(xᵢ − mean)² ÷ (n − 1)',
        terms: [
          { symbol: 'xᵢ', meaning: 'Each number in the list.' },
          { symbol: 'mean', meaning: 'The arithmetic mean of the list.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' }
        ],
        note: 'Variance is standard deviation before the final square root, so σ² = σ × σ and s² = s × s always hold exactly.'
      },
      workedExample: {
        intro: 'The same five test scores the standard deviation calculator uses: 72, 85, 90, 78 and 95.',
        rows: [
          { label: 'Mean (72 + 85 + 90 + 78 + 95) ÷ 5', value: '84' },
          { label: 'Squared differences from the mean', value: '144, 1, 36, 36, 121' },
          { label: 'Sum of squared differences', value: '338' },
          { label: 'Population variance (338 ÷ 5)', value: '67.6' },
          { label: 'Sample variance (338 ÷ 4)', value: '84.5' }
        ],
        result: 'Population variance 67.6, sample variance 84.5',
        explanation: 'Taking the square root of each figure gives exactly the standard deviation calculator\'s worked example (≈ 8.22 and ≈ 9.19) — the two pages describe the same spread, one in squared units and one in the original units.'
      },
      watchOut: [
        { title: 'Variance is in squared units', body: 'A variance of 67.6 on test scores out of 100 is "67.6 points squared" — a real number with no direct real-world reading. Its square root, standard deviation, is the figure usually quoted to a general audience.' },
        { title: 'A single value has no sample variance', body: 'The sample formula divides by n − 1 = 0 when n = 1 — a genuine 0 ÷ 0. This calculator reports that honestly as "—." Population variance of a single value is still a legitimate 0.' },
        { title: 'Dividing by n or n − 1 is not interchangeable', body: 'Same as standard deviation: population and sample variance answer different questions, not two roundings of one answer. Use population variance only when your numbers are the entire group of interest.' },
        { title: 'Variance and standard deviation are not independent findings', body: 'They come from exactly the same calculation up to the final square root — if you already have one, you already have the other, and cross-checking a variance calculator against a standard deviation calculator on the same data is really just checking the same arithmetic twice.' },
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §2.7 Measures of the Spread of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data' },
        { label: 'Wolfram MathWorld, Variance', url: 'https://mathworld.wolfram.com/Variance.html' }
      ]
    },
    inputs: [listInput([72, 85, 90, 78, 95], 1)],
    breakdown: {
      headline: 'sampleVariance',
      headlineLabel: 'Variance (sample, s²)',
      outputs: [
        { id: 'sampleVariance', label: 'Variance (sample, s²)', format: 'significant' },
        { id: 'populationVariance', label: 'Variance (population, σ²)', format: 'significant' },
        { id: 'mean', label: 'Mean', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' },
        { id: 'sampleStdDev', label: 'Standard deviation (sample), for reference', format: 'significant' },
        { id: 'populationStdDev', label: 'Standard deviation (population), for reference', format: 'significant' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'populationVariance', label: 'Population (σ²)' }, { from: 'sampleVariance', label: 'Sample (s²)' }],
        title: 'Population vs. sample variance',
        highlight: 1
      }
    },
    seo: {
      title: 'Variance Calculator – Population & Sample',
      description: 'Free variance calculator. Paste a list of up to 1,000 numbers to find both the population and sample variance, plus the matching standard deviations, with a worked example.',
      faq: [
        { question: 'How do I calculate variance?', answer: 'Find the mean, subtract it from each number and square the result, add those squares up, then divide by n (population) or n − 1 (sample).' },
        { question: 'What is the difference between variance and standard deviation?', answer: 'Variance is the average of squared differences from the mean; standard deviation is its square root. They measure the same spread — variance in squared units, standard deviation in the original units.' },
        { question: 'What is the difference between population and sample variance?', answer: 'Population variance divides by n, the full count. Sample variance divides by n − 1, which corrects for a sample tending to underestimate the spread of the larger group it was drawn from.' },
        { question: 'Why are my numbers so much bigger than the standard deviation?', answer: 'Variance is in squared units. A standard deviation of 9.19 corresponds to a variance of about 84.5 (9.19² ≈ 84.5) — the numbers only look different because one has been squared.' },
        { question: 'Can variance be negative?', answer: 'No. Every term being summed is a squared difference, which can never be negative, so variance is always zero or positive.' },
        { question: 'What does a variance of 0 mean?', answer: 'Every value in the list is identical — there is no spread at all.' },
        { question: 'Which spreadsheet function matches this calculator?', answer: "Excel and Google Sheets' VAR (and VAR.S) match this calculator's sample variance; VARP (or VAR.P) matches the population figure." },
        { question: 'Can I find variance with only one number?', answer: 'Population variance of a single value is 0. Sample variance is undefined, since its formula divides by n − 1 = 0.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const { mean, populationVariance, sampleVariance } = varianceOf(list);
      return {
        mean,
        count: list.length,
        populationVariance,
        sampleVariance,
        populationStdDev: Math.sqrt(populationVariance),
        sampleStdDev: Math.sqrt(sampleVariance)
      };
    }
  },
  {
    id: 'z-score-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['z score calculator', 'standard score calculator', 'number of standard deviations calculator', 'z value calculator'],
    related: ['standard-deviation-calculator', 'percentile-calculator', 'mean-median-mode-calculator', 'variance-calculator'],
    title: 'Z-Score Calculator',
    description: 'Solve z = (x − mean) ÷ standard deviation for any of its four quantities — how many standard deviations a value sits from the mean.',
    example: 'An SAT score of 1200, against a mean of 1050 and a standard deviation of 200, gives a z-score of 0.75 — three-quarters of a standard deviation above average.',
    solver: {
      defaultTarget: 'zScore',
      variables: [
        { id: 'value', label: 'Value', symbol: 'x', dimension: 'count', defaultValue: 1200, defaultUnit: 'count' },
        { id: 'mean', label: 'Mean', symbol: 'μ', dimension: 'count', defaultValue: 1050, defaultUnit: 'count' },
        { id: 'standardDeviation', label: 'Standard deviation', symbol: 'σ', dimension: 'count', defaultValue: 200, defaultUnit: 'count' },
        { id: 'zScore', label: 'Z-score', symbol: 'z', dimension: 'count', defaultValue: 0.75, defaultUnit: 'count' }
      ],
      solve: {
        zScore: ({ value, mean, standardDeviation }) => (standardDeviation === 0 ? NaN : (value - mean) / standardDeviation),
        value: ({ mean, standardDeviation, zScore }) => mean + zScore * standardDeviation,
        mean: ({ value, standardDeviation, zScore }) => value - zScore * standardDeviation,
        standardDeviation: ({ value, mean, zScore }) => {
          if (zScore === 0) return NaN; // z = 0 means value = mean regardless of sigma: no unique sigma solves it
          const sd = (value - mean) / zScore;
          return sd > 0 ? sd : NaN; // a standard deviation cannot be zero or negative
        }
      },
      visuals: [
        {
          type: 'rangeBar',
          value: 'zScore',
          bands: [
            { label: 'Far below average', min: -4, max: -2 },
            { label: 'Below average', min: -2, max: -1 },
            { label: 'Typical (within 1 SD)', min: -1, max: 1 },
            { label: 'Above average', min: 1, max: 2 },
            { label: 'Far above average', min: 2, max: 4 }
          ],
          title: 'Where this z-score falls',
          valueLabel: 'Your z-score'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a z-score?',
        paragraphs: [
          'A z-score (or "standard score") says how many standard deviations a value is above or below the mean of its data set. A z-score of 0 means the value equals the mean exactly; positive means above the mean, negative means below it. A z-score of 2 is unusual in most real data sets — only about 2.3% of values in a normal distribution sit above it — while a z-score of 0.75, this calculator\'s default, is well within the ordinary range.',
          'The point of converting a raw value into a z-score is comparability: an SAT score of 1200, a height of 180 cm and a test result of 72°F are all on different scales, but "0.75 standard deviations above average" means the same thing for any of them. This is exactly how a test score gets compared against a national average, or how a lab result gets flagged as unusually high or low.',
          'Z-scores and standard deviation are the same idea applied in two directions: the standard deviation calculator finds how spread out a whole data set is, while this calculator takes one value from (or being compared against) that data set and says precisely where it sits within that spread.'
        ]
      },
      howTo: {
        intro: 'Enter any three of the four fields — value, mean, standard deviation, z-score — and the fourth, marked auto, is calculated.',
        steps: [
          { name: 'Find a z-score', text: 'Enter the value, the mean and the standard deviation. The z-score field, marked auto, fills in as (value − mean) ÷ standard deviation.' },
          { name: 'Find the value for a known z-score', text: 'Enter the mean, the standard deviation and the z-score to find what raw value produces it.' },
          { name: 'Find the mean', text: 'Enter the value, the standard deviation and the z-score to work backward to the mean.' },
          { name: 'Find the standard deviation', text: 'Enter the value, the mean and a nonzero z-score to solve for the standard deviation that fits them.' },
          { name: 'Switch which field is calculated', text: 'Type into the auto field and it becomes an input again; the field you left alone the longest becomes the new calculated one.' },
          { name: 'Read the chart', text: 'The bar shows where your z-score falls against five bands from far below to far above average.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'One relationship, rearranged four ways.',
        expression: 'z = (x − μ) ÷ σ\nx = μ + zσ\nμ = x − zσ\nσ = (x − μ) ÷ z  (when z ≠ 0 and the result is positive)',
        terms: [
          { symbol: 'x', meaning: 'The individual value being compared.' },
          { symbol: 'μ (mean)', meaning: 'The mean of the data set x belongs to.' },
          { symbol: 'σ (standard deviation)', meaning: 'How spread out that data set is — see the standard deviation calculator.' },
          { symbol: 'z', meaning: 'How many standard deviations x is from the mean — negative if x is below it.' }
        ],
        note: 'Solving for standard deviation needs a nonzero z-score (if z = 0, the value already equals the mean and any standard deviation would satisfy the equation) and refuses a result of zero or negative, since a standard deviation cannot be either.'
      },
      workedExample: {
        intro: 'An SAT score of 1200, where the mean score is 1050 and the standard deviation is 200.',
        rows: [
          { label: 'Difference from the mean (1200 − 1050)', value: '150' },
          { label: 'Z-score (150 ÷ 200)', value: '0.75' }
        ],
        result: 'z = 0.75',
        explanation: 'A z-score of 0.75 means this score is three-quarters of a standard deviation above average — clearly above the mean, but not unusually so (a z-score typically has to pass roughly ±2 before it starts being called statistically unusual).'
      },
      watchOut: [
        { title: 'A z-score needs the right mean and standard deviation for the comparison you want', body: 'The same raw score gives a different z-score against a national average than against a single class\'s average. Make sure the mean and standard deviation you enter describe the group you actually want to compare against.' },
        { title: 'Z-scores assume the spread is meaningfully described by a mean and standard deviation', body: 'This works best for roughly symmetric, "bell-shaped" data. For heavily skewed data (like income), a percentile is often a more honest way to describe where a value sits — see the percentile calculator.' },
        { title: 'Solving for standard deviation can refuse to answer', body: 'If the z-score you enter is 0, or the value you enter already equals the mean, there is no single standard deviation that uniquely fits — and if the arithmetic would produce a negative or zero standard deviation, this calculator shows "—" rather than a nonsensical result.' },
        { title: 'A positive z-score is not automatically "good"', body: 'It only means "above the mean." Whether above or below the mean is the better outcome depends entirely on what is being measured — a high z-score on a golf score, for instance, is worse, not better.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §6.1 The Standard Normal Distribution', url: 'https://openstax.org/books/introductory-statistics-2e/pages/6-1-the-standard-normal-distribution' },
        { label: 'Wolfram MathWorld, Standard Deviation', url: 'https://mathworld.wolfram.com/StandardDeviation.html' }
      ]
    },
    inputs: [
      { id: 'value', label: 'Value', type: 'number', placeholder: '1200', defaultValue: 1200, step: 1 },
      { id: 'mean', label: 'Mean', type: 'number', placeholder: '1050', defaultValue: 1050, step: 1 },
      { id: 'standardDeviation', label: 'Standard deviation', type: 'number', placeholder: '200', defaultValue: 200, step: 1 }
    ],
    seo: {
      title: 'Z-Score Calculator – Standard Score, Any Variable',
      description: 'Free z-score calculator. Solve z = (x − mean) ÷ standard deviation for the value, mean, standard deviation or z-score, with a worked SAT-score example.',
      faq: [
        { question: 'How do I calculate a z-score?', answer: 'Subtract the mean from the value, then divide by the standard deviation: z = (x − μ) ÷ σ. A score of 1200 against a mean of 1050 and a standard deviation of 200 gives z = 0.75.' },
        { question: 'What does a z-score of 0 mean?', answer: 'The value is exactly equal to the mean.' },
        { question: 'What does a negative z-score mean?', answer: 'The value is below the mean. A z-score of −1 means the value is one standard deviation below average.' },
        { question: 'What is considered a "high" z-score?', answer: 'There is no universal cutoff, but in a roughly normal distribution, values beyond about ±2 are relatively uncommon (roughly the top or bottom 2–3%), and beyond ±3 are rare.' },
        { question: 'How do I find the original value from a z-score?', answer: 'Rearrange the formula: x = μ + zσ. A z-score of 0.75 with mean 1050 and standard deviation 200 gives x = 1050 + 0.75 × 200 = 1200.' },
        { question: 'Can I solve for the standard deviation instead?', answer: 'Yes: σ = (x − μ) ÷ z, as long as z is not 0 and the arithmetic gives a positive result — a standard deviation of zero or less is not mathematically meaningful.' },
        { question: 'Is a z-score the same as a percentile?', answer: 'No, though they are related. A z-score says how many standard deviations from the mean a value is; converting that to a percentile additionally requires assuming a specific distribution shape (typically the normal distribution).' },
        { question: 'Why would I compare values on different scales using a z-score?', answer: 'Converting each to "how many standard deviations from its own average" puts them on the same scale — the whole reason a 1200 SAT score and a lab result in milligrams per deciliter can both be described as "0.75 standard deviations above average."' }
      ]
    },
    compute(values) {
      const { value, mean, standardDeviation } = values;
      return { zScore: standardDeviation === 0 ? NaN : (value - mean) / standardDeviation };
    }
  },
  {
    id: 'percentile-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['percentile rank calculator', 'find the percentile calculator', 'percentile of a data set calculator', 'what percentile calculator'],
    related: ['mean-median-mode-calculator', 'standard-deviation-calculator', 'z-score-calculator', 'average-calculator'],
    title: 'Percentile Calculator',
    description: 'Find any percentile of a list of up to 1,000 numbers using linear interpolation between the closest ranked values — the method NIST\'s own statistics handbook documents.',
    example: 'Six exam scores — 55, 60, 65, 70, 78 and 90 — have a 75th percentile of 81 and a 50th percentile (the median) of 67.5.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a percentile?',
        paragraphs: [
          'The Pth percentile of a list is the value below which roughly P% of the data falls. The 50th percentile is the median; the 25th and 75th percentiles mark the bottom and top quarters of the data. A test score at the 90th percentile means roughly 90% of the comparison group scored at or below it — a common way results get reported in standardized testing and pediatric growth charts.',
          'There is more than one accepted way to calculate a percentile that does not land exactly on a value already in the list, and different tools genuinely disagree with each other because of it — not because one is wrong. This calculator uses linear interpolation between the two nearest ranked values, specifically the method documented in the NIST/SEMATECH Engineering Statistics Handbook (also the default in NIST\'s own Dataplot software and in Minitab), sometimes called Hyndman & Fan\'s "type 6" definition. See "Watch out" below for how this can differ from Excel\'s built-in percentile function.',
          'A percentile answers a related but distinct question from a z-score: a z-score says how many standard deviations a value is from the mean, assuming the data is roughly bell-shaped; a percentile makes no such assumption and works directly off the ranked data, which makes it a more honest choice for skewed data.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, then set the percentile you want to find.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines, in any order — up to 1,000 of them. The calculator sorts the list itself.' },
          { name: 'Check the count', text: 'Anything that isn\'t a number is dropped and listed below the box, along with the live count of numbers it understood.' },
          { name: 'Set the target percentile', text: 'Enter the percentile you want to find, from 0 to 100. The default, 75, finds the value marking the top quarter of the data.' },
          { name: 'Read the result', text: 'The headline is the value at that percentile, interpolated between the two closest ranked numbers when it does not land exactly on one of them.' },
          { name: 'Check the rank', text: 'The rank row shows the exact (possibly fractional) position in the sorted list that the target percentile corresponds to.' },
          { name: 'Compare to the range', text: 'The chart plots your lowest value, your chosen percentile\'s value, and your highest value side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Sort the list, find the fractional rank the target percentile corresponds to, then interpolate between the two values on either side of it.',
        expression: 'rank = (P ÷ 100) × (n + 1)\nvalue = Y(k) + d × (Y(k+1) − Y(k)),  where k = ⌊rank⌋ and d = rank − k',
        terms: [
          { symbol: 'P', meaning: 'The target percentile, 0 to 100.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' },
          { symbol: 'Y(k)', meaning: 'The k-th smallest value in the sorted list (Y(1) is the minimum).' }
        ],
        note: 'If the rank falls at or before the first value, or at or beyond the last, the result is simply the minimum or maximum — entering a percentile below 0 or above 100 behaves the same as entering exactly 0 or 100, since the formula\'s own boundary rule already clamps it.'
      },
      workedExample: {
        intro: 'Six exam scores: 55, 60, 65, 70, 78 and 90. Finding the 75th percentile.',
        rows: [
          { label: 'Sorted', value: '55, 60, 65, 70, 78, 90' },
          { label: 'Rank (0.75 × (6 + 1))', value: '5.25' },
          { label: 'k = 5, d = 0.25', value: 'between the 5th value (78) and the 6th (90)' },
          { label: 'Interpolated value (78 + 0.25 × (90 − 78))', value: '81' }
        ],
        result: '75th percentile = 81',
        explanation: 'The rank, 5.25, falls between the 5th and 6th sorted values, so the result is 25% of the way from the 5th value (78) toward the 6th (90) — not simply one of the six original scores.'
      },
      watchOut: [
        { title: 'Different tools can give different percentile answers for the same data', body: 'Microsoft Excel\'s PERCENTILE and PERCENTILE.INC functions use a different interpolation rule ("type 7": rank = P ÷ 100 × (n − 1) + 1) than the NIST-documented method this calculator uses ("type 6"). Both are standard, cited, legitimate methods — they are not a bug in either tool, just two different conventions, and they tend to agree closely but not exactly.' },
        { title: 'A single value is its own every percentile', body: 'With only one number in the list, the rank formula always resolves to that one value, regardless of what percentile you ask for — there is nothing else for it to interpolate between.' },
        { title: 'The 50th percentile is not always identical to the median formula taught separately', body: 'For this calculator\'s method, they do agree — the 50th percentile and the textbook "average of the two middle values" median give the same answer. That is a property of this particular method, not a universal guarantee across every percentile definition.' },
        { title: 'Percentile is not the same as percentage', body: 'Scoring in the 90th percentile does not mean getting 90% of questions right — it means scoring at or above roughly 90% of whoever you are being compared against, which depends entirely on how that group performed.' },
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers.' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §7.2.6.2 Percentiles', url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm' },
        { label: 'OpenStax, Introductory Statistics 2e, §2.5 Measures of the Center of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data' }
      ]
    },
    inputs: [
      listInput([60, 55, 90, 65, 78, 70], 1),
      { id: 'targetPercentile', label: 'Target percentile', type: 'percent', placeholder: '75', defaultValue: 75, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'percentileValue',
      headlineLabel: 'Value at this percentile',
      outputs: [
        { id: 'percentileValue', label: 'Value at this percentile', format: 'significant' },
        { id: 'rank', label: 'Rank in the sorted list', format: 'number' },
        { id: 'median', label: 'Median (50th percentile), for reference', format: 'significant' },
        { id: 'min', label: 'Lowest value', format: 'significant' },
        { id: 'max', label: 'Highest value', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'min', label: 'Lowest value' }, { from: 'percentileValue', label: 'Your percentile' }, { from: 'max', label: 'Highest value' }],
        title: 'Lowest, your percentile, highest',
        highlight: 1
      }
    },
    seo: {
      title: 'Percentile Calculator – Rank & Interpolate',
      description: 'Free percentile calculator. Paste a list of up to 1,000 numbers and find any percentile using the NIST-documented linear interpolation method, with a worked example.',
      faq: [
        { question: 'How do I calculate a percentile?', answer: 'Sort the data, convert the target percentile into a fractional rank, then interpolate between the two sorted values on either side of that rank. For 55, 60, 65, 70, 78, 90, the 75th percentile is 81.' },
        { question: 'What percentile method does this calculator use?', answer: 'Linear interpolation between the closest ranked values, following the NIST/SEMATECH Engineering Statistics Handbook\'s definition (Hyndman & Fan\'s "type 6") — the same method NIST\'s own Dataplot software defaults to.' },
        { question: 'Why does this give a different answer than Excel?', answer: "Excel's PERCENTILE/PERCENTILE.INC functions use a slightly different interpolation rule (\"type 7\"). Both are standard, documented methods; they usually agree closely but can differ by a small amount." },
        { question: 'What is the 50th percentile?', answer: "The median — the value with half the data at or below it and half at or above it. For this calculator's method, it always matches the textbook median formula exactly." },
        { question: 'What happens if I enter a percentile above 100 or below 0?', answer: 'The result clamps to the maximum or minimum value in the list, the same as entering exactly 100 or 0 — the field has no upper limit of its own, so this is handled inside the calculation instead.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines.' },
        { question: 'Is a percentile the same as a percentage score?', answer: "No. A percentile compares a value's rank against other values in the same data set; a percentage score (like 90% correct) is a raw fraction of possible points, unrelated to how anyone else performed." },
        { question: 'Does the order I enter numbers in matter?', answer: 'No — the calculator sorts the list itself before finding the percentile.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const sorted = [...list].sort((a, b) => a - b);
      const n = sorted.length;
      const targetPercentile = Math.min(100, Math.max(0, values.targetPercentile));
      const rank = (targetPercentile / 100) * (n + 1);
      return {
        percentileValue: percentileOf(sorted, targetPercentile),
        rank: Math.min(n, Math.max(1, rank)),
        median: percentileOf(sorted, 50),
        min: sorted[0],
        max: sorted[n - 1],
        count: n
      };
    }
  },
  {
    id: 'confidence-interval-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['confidence interval calculator', 'ci calculator', 'margin of error for a mean calculator', 'confidence interval for the mean calculator'],
    related: ['margin-of-error-calculator', 'standard-deviation-calculator', 'sample-size-calculator', 'z-score-calculator'],
    title: 'Confidence Interval Calculator',
    description: 'Find a confidence interval for a population mean from a sample — using the z-distribution when the population standard deviation is known, or the t-distribution when you only have a sample standard deviation.',
    example: 'A sample of 36 students studies 15.2 hours a week on average, with a sample standard deviation of 4.1 hours. The 95% confidence interval (t-distribution) is about 13.81 to 16.59 hours.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a confidence interval?',
        paragraphs: [
          'A confidence interval is a range built around a sample statistic — here, a sample mean — that is likely to contain the true value for the whole population. A "95% confidence interval" does not mean there is a 95% chance the true mean falls in this specific interval; it means that if you repeated the same sampling process many times and built an interval the same way each time, about 95% of those intervals would contain the true population mean. The interval itself is either right or wrong — the 95% describes the method\'s long-run reliability, not this one result.',
          'Every confidence interval for a mean has the same shape: the sample mean, plus or minus a margin of error. The margin of error is a critical value (how many standard errors wide the interval needs to be for the chosen confidence level) multiplied by the standard error (how precisely the sample mean estimates the true mean, which shrinks as the sample gets larger).',
          'The critical value comes from one of two distributions, and which one you use is not a stylistic choice. If the population standard deviation (σ) is genuinely known in advance — rare outside of quality-control settings with a long production history — the standard normal (z) distribution is correct. In every other case, including almost all real survey and experimental data, the population standard deviation is unknown and only a sample standard deviation (s) is available; the Student\'s t-distribution, with n − 1 degrees of freedom, replaces the normal distribution to honestly account for the extra uncertainty of having estimated σ from the same sample. The t-distribution is wider than the normal distribution (giving a larger margin of error) for the same confidence level, and the gap between the two narrows as the sample size grows — by a few hundred data points, they are nearly indistinguishable.'
        ]
      },
      howTo: {
        intro: 'Choose whether you know the population standard deviation, then enter your sample mean, standard deviation, sample size and confidence level.',
        steps: [
          { name: 'Choose z or t', text: 'Pick "known population standard deviation" only if σ is genuinely known ahead of time. Otherwise — the usual case — pick "only a sample standard deviation," which uses the t-distribution.' },
          { name: 'Enter your sample mean', text: 'The average of your sample data. If you have the raw data instead of just the mean, the mean/median/mode calculator finds it for you.' },
          { name: 'Enter the standard deviation', text: 'σ if known (z-mode), or your sample\'s standard deviation s (t-mode) — the standard deviation calculator finds s from raw data.' },
          { name: 'Enter the sample size', text: 'How many observations your sample has. In t-mode, this also sets the degrees of freedom (n − 1) for the t-distribution.' },
          { name: 'Set the confidence level', text: 'Usually 90%, 95% or 99%. Higher confidence always means a wider interval for the same data — there is no way to be more confident without giving up precision.' },
          { name: 'Read the interval', text: 'The result is the lower and upper bound of the confidence interval, plus the margin of error and the exact critical value used.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The same shape either way — sample mean plus or minus a critical value times the standard error — with the critical value coming from the z or t distribution.',
        expression: 'Known σ (z-interval): x̄ ± z(α/2) × (σ ÷ √n)\nSample s (t-interval): x̄ ± t(α/2, df) × (s ÷ √n),  df = n − 1',
        terms: [
          { symbol: 'x̄', meaning: 'The sample mean.' },
          { symbol: 'σ, s', meaning: 'The population standard deviation (if known) or the sample standard deviation.' },
          { symbol: 'n', meaning: 'The sample size.' },
          { symbol: 'α', meaning: '1 − confidence level (as a fraction); e.g. 0.05 for a 95% confidence level.' },
          { symbol: 'z(α/2), t(α/2, df)', meaning: 'The critical value that cuts off α/2 in each tail of the normal or t distribution.' }
        ],
        note: 'The critical values are computed directly from the standard normal and Student\'s t distributions (see this calculator\'s references), not read from a printed table, so this calculator works for any confidence level, not just 90/95/99%.'
      },
      workedExample: {
        intro: 'A sample of 36 university students reports a mean study time of 15.2 hours per week, with a sample standard deviation of 4.1 hours. Find a 95% confidence interval for the true mean study time across all students (t-interval, since only a sample standard deviation is known).',
        rows: [
          { label: 'Degrees of freedom (36 − 1)', value: '35' },
          { label: 't-critical value for 95% confidence, df = 35', value: '≈ 2.0301' },
          { label: 'Standard error (4.1 ÷ √36)', value: '≈ 0.6833' },
          { label: 'Margin of error (2.0301 × 0.6833)', value: '≈ 1.3872' },
          { label: 'Lower bound (15.2 − 1.3872)', value: '≈ 13.8128' },
          { label: 'Upper bound (15.2 + 1.3872)', value: '≈ 16.5872' }
        ],
        result: '95% CI ≈ [13.81, 16.59] hours per week',
        explanation: 'This says: if this same sampling process were repeated many times, about 95% of the intervals built this way would contain the true mean study time of the whole student population. It does not say there is a 95% chance the true mean is specifically between 13.81 and 16.59 for this one sample.'
      },
      watchOut: [
        { title: 'A wider interval is not a worse answer', body: 'A 99% confidence interval is wider than a 95% one for the same data — that is the price of more confidence, not a sign of a weaker result. There is no way to get both a narrower interval and higher confidence without a larger sample.' },
        { title: 'Picking z when you should pick t overstates your precision', body: 'Using the normal distribution when you only actually have a sample standard deviation gives an interval that is narrower than it should be, because it ignores the extra uncertainty of having estimated σ from the sample itself. When in doubt, use the t-interval — it is the more conservative, more honest choice, and the two converge anyway as the sample grows.' },
        { title: 'This assumes the sampling distribution of the mean is approximately normal', body: 'By the central limit theorem this is a safe assumption for most samples of 30 or more, or for any sample size if the underlying population itself is roughly normal. For small, heavily skewed samples the result can be unreliable.' },
        { title: 'A confidence level is not a probability about this specific interval', body: 'Once a sample is collected and the interval is calculated, it either does or does not contain the true mean — there is no remaining randomness to attach a 95% probability to. The 95% describes the reliability of the method over many repeated samples, not this one outcome.' },
        { title: 'Confidence level is clamped between 0.01% and 99.99%', body: 'A 100% confidence level would require an interval infinitely wide (the only way to be completely certain), which is not a useful answer, so this calculator treats anything at or above 100% the same as 99.99%, and anything at or below 0% the same as 0.01%.' },
        { title: 'Sample size must be a whole number of at least 2', body: 'A sample of 10.5 observations is not a real count, and a sample of 1 has no degrees of freedom left for a t-interval. Entering a fractional or sub-2 sample size shows no answer rather than quietly computing a confidence interval for a different, fractional-sized sample than the one you actually have.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §8.1 A Single Population Mean using the Normal Distribution', url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-1-a-single-population-mean-using-the-normal-distribution' },
        { label: 'OpenStax, Introductory Statistics 2e, §8.2 A Single Population Mean using the Student t Distribution', url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-2-a-single-population-mean-using-the-student-t-distribution' },
        { label: 'Wolfram MathWorld, Confidence Interval', url: 'https://mathworld.wolfram.com/ConfidenceInterval.html' },
        { label: 'Wolfram MathWorld, Student\'s t-Distribution', url: 'https://mathworld.wolfram.com/Studentst-Distribution.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'What do you know about the standard deviation?',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Known population standard deviation (z-interval)' },
          { value: 2, label: 'Only a sample standard deviation (t-interval)' }
        ]
      },
      { id: 'sampleMean', label: 'Sample mean (x̄)', type: 'number', placeholder: '15.2', defaultValue: 15.2, step: 0.1 },
      { id: 'stdDev', label: 'Standard deviation (σ known, or sample s)', type: 'number', placeholder: '4.1', defaultValue: 4.1, step: 0.1 },
      { id: 'sampleSize', label: 'Sample size (n)', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 2 },
      { id: 'confidenceLevel', label: 'Confidence level', type: 'percent', placeholder: '95', defaultValue: 95, step: 1, min: 1 }
    ],
    breakdown: {
      headline: 'marginOfError',
      headlineLabel: 'Margin of error (±)',
      outputs: [
        { id: 'marginOfError', label: 'Margin of error (±)', format: 'significant' },
        { id: 'lowerBound', label: 'Lower bound', format: 'significant' },
        { id: 'upperBound', label: 'Upper bound', format: 'significant' },
        { id: 'criticalValue', label: 'Critical value (z* or t*)', format: 'significant' },
        { id: 'standardError', label: 'Standard error', format: 'significant' },
        { id: 'degreesOfFreedom', label: 'Degrees of freedom (n − 1), used in t-mode only', format: 'integer' }
      ],
      groups: [
        { inputs: ['mode'] },
        { inputs: ['sampleMean', 'stdDev', 'sampleSize', 'confidenceLevel'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'lowerBound', label: 'Lower bound' }, { from: 'sampleMean', label: 'Sample mean' }, { from: 'upperBound', label: 'Upper bound' }],
        title: 'Your confidence interval',
        highlight: 1
      }
    },
    seo: {
      title: 'Confidence Interval Calculator – Mean, z or t',
      description: 'Free confidence interval calculator for a mean. Choose z (known σ) or t (sample s); critical values are computed directly, not rounded from a printed table.',
      faq: [
        { question: 'How do I calculate a confidence interval for a mean?', answer: 'Take the sample mean, then add and subtract a margin of error: a critical value (from the z or t distribution) times the standard error (standard deviation ÷ √n). For a sample of 36 with mean 15.2 and sample standard deviation 4.1 at 95% confidence, the interval is about 13.81 to 16.59.' },
        { question: 'When do I use the z-interval instead of the t-interval?', answer: 'Only when the population standard deviation (σ) is genuinely known ahead of time, independent of your sample. In almost every other real situation, you only have a sample standard deviation, and the t-interval (with n − 1 degrees of freedom) is the correct, more conservative choice.' },
        { question: 'Why is the t-interval wider than the z-interval for the same data?', answer: 'The t-distribution has heavier tails than the normal distribution, which accounts for the extra uncertainty of estimating the population standard deviation from the sample itself rather than knowing it exactly. As the sample size grows, the t-distribution converges to the normal distribution and the gap shrinks.' },
        { question: 'What does "95% confidence" actually mean?', answer: 'It describes the reliability of the method, not this one interval: if you repeated the same sampling and interval-building process many times, about 95% of the resulting intervals would contain the true population mean. Any single interval either does or does not contain it.' },
        { question: 'Does a bigger sample size give a narrower interval?', answer: 'Yes — the standard error shrinks as the sample size grows (it is divided by √n), so a larger sample gives a narrower margin of error for the same confidence level, all else equal.' },
        { question: 'What are the degrees of freedom?', answer: 'For the t-interval, degrees of freedom equal the sample size minus 1 (n − 1). They control exactly how wide the t-distribution\'s tails are; smaller samples have fewer degrees of freedom and a wider t-distribution.' },
        { question: 'Can I use any confidence level, not just 90%, 95% or 99%?', answer: 'Yes — this calculator computes the critical value directly from the distribution for any confidence level between 0.01% and 99.99%, rather than looking one up in a printed table limited to a few common values.' },
        { question: 'How is this different from the margin of error calculator?', answer: 'This calculator is specifically for a population mean built from a sample mean, standard deviation and sample size. The margin of error calculator focuses on survey proportions (percentages) instead — see it directly for that case.' }
      ]
    },
    compute(values) {
      const { mode, sampleMean, stdDev, sampleSize, confidenceLevel } = values;
      const n = requireIntegerAtLeast(sampleSize, 2); // a fractional or sub-2 sample size is an honest NaN, not a silently-answered different question
      const confidence = clampConfidence(confidenceLevel);
      const alpha = 1 - confidence / 100;
      const degreesOfFreedom = n - 1;
      const useZ = mode === 1;
      const criticalValue = useZ ? normalInverseCDF(1 - alpha / 2) : tInverseCDF(1 - alpha / 2, degreesOfFreedom);
      const standardError = stdDev / Math.sqrt(n);
      const marginOfError = criticalValue * standardError;
      return {
        marginOfError,
        lowerBound: sampleMean - marginOfError,
        upperBound: sampleMean + marginOfError,
        criticalValue,
        standardError,
        degreesOfFreedom
      };
    }
  },
  {
    id: 'margin-of-error-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['margin of error calculator', 'survey margin of error calculator', 'poll margin of error calculator', 'error bound for a proportion calculator'],
    related: ['sample-size-calculator', 'confidence-interval-calculator', 'z-score-calculator', 'percentile-calculator'],
    title: 'Margin of Error Calculator',
    description: 'Find the margin of error for a survey or poll proportion, given the sample size and confidence level, using the Wald method — with an optional finite population correction.',
    example: 'A survey of 1,000 voters finds 54% support a measure. At 95% confidence, the margin of error is about ±3.09 percentage points.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is margin of error?',
        paragraphs: [
          'Margin of error is the "plus or minus" figure attached to a survey or poll result — "54%, margin of error ±3 points" means the true proportion in the whole population is estimated to lie somewhere between about 51% and 57%, at the stated confidence level. It exists because a sample, however carefully chosen, is not the whole population, and a different sample of the same size would almost certainly give a slightly different result.',
          'Margin of error depends on three things: how confident you want to be (a higher confidence level widens the margin), how large the sample is (a bigger sample narrows it, but only by the square root of the sample size — quadrupling the sample only halves the margin), and how close the measured proportion is to 50%. A proportion near 50% has the most sampling variability and the widest margin of error of any proportion at a given sample size; a proportion near 0% or 100% has much less, because there is much less room for a repeated sample to disagree.',
          'This calculator uses the Wald method, the simplest and most widely taught way to compute it: margin = critical value × standard error, where the standard error comes directly from the sample proportion and size. For very small samples or a proportion very close to 0% or 100%, more advanced methods like the Wilson score interval handle the edge cases more accurately — see "Watch out" below.'
        ]
      },
      howTo: {
        intro: 'Enter the sample proportion, the sample size and the confidence level.',
        steps: [
          { name: 'Enter the sample proportion', text: 'The percentage of your sample that gave the response you are measuring, e.g. 54 for 54%.' },
          { name: 'Enter the sample size', text: 'How many people or items were actually sampled.' },
          { name: 'Set the confidence level', text: 'Usually 95%. A higher confidence level widens the margin of error for the same sample.' },
          { name: 'Optional: enter the population size', text: 'Only needed for a finite population correction — leave it at 0 to treat the population as effectively infinite, the usual case for a large general population.' },
          { name: 'Read the margin and the range', text: 'The result is the margin of error in percentage points, plus the resulting lower and upper bound around your sample proportion.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The Wald margin of error for a proportion, with an optional correction when sampling a large fraction of a known, finite population.',
        expression: 'margin = z(α/2) × √(p̂(1 − p̂) ÷ n) × fpc\nfpc = √((N − n) ÷ (N − 1))  (only applied when a population size N > n is given)',
        terms: [
          { symbol: 'p̂', meaning: 'The sample proportion, as a fraction (54% = 0.54).' },
          { symbol: 'n', meaning: 'The sample size.' },
          { symbol: 'N', meaning: 'The population size, if known and finite.' },
          { symbol: 'z(α/2)', meaning: 'The critical value of the standard normal distribution for the chosen confidence level.' }
        ],
        note: 'The finite population correction only matters when the sample is a substantial fraction of a known, finite population — surveying 500 of a town\'s 2,000 residents, say. For a large or effectively unlimited population (most national surveys), it makes almost no difference and is left out by default.'
      },
      workedExample: {
        intro: 'A survey of 1,000 randomly selected voters finds that 54% support a ballot measure. Find the margin of error at 95% confidence.',
        rows: [
          { label: 'Sample proportion (p̂)', value: '0.54' },
          { label: 'Standard error (√(0.54 × 0.46 ÷ 1000))', value: '≈ 0.015761' },
          { label: 'Critical value for 95% confidence', value: '≈ 1.959964' },
          { label: 'Margin of error (1.959964 × 0.015761)', value: '≈ 0.030890, i.e. ±3.09 percentage points' }
        ],
        result: '54% ± 3.09 percentage points (95% confidence)',
        explanation: 'This means the poll\'s method would, across many repeated surveys of this size, produce an interval containing the true proportion of all voters about 95% of the time — reported here as "support is between about 50.9% and 57.1%."'
      },
      watchOut: [
        { title: 'The Wald method can understate the margin for small samples or extreme proportions', body: 'When the sample size is small, or the proportion is very close to 0% or 100%, the Wald interval this calculator uses can be noticeably less accurate than alternatives like the Wilson score interval, which many statistical software packages use by default for exactly this reason. For large samples (several hundred or more) with a proportion not near the extremes, the difference is small.' },
        { title: 'Margin of error only covers sampling error', body: 'It says nothing about bias from how the sample was chosen — a poorly designed survey (a non-random sample, leading questions, low response rates) can be wrong by far more than the stated margin of error, which assumes a properly randomized sample.' },
        { title: '"54% ± 3%" does not mean the true value is definitely between 51% and 57%', body: 'Like any confidence interval, the stated confidence level (usually 95%) describes how often the method gets it right across many repeated samples, not the probability for this one survey.' },
        { title: 'The finite population correction is off by default for a reason', body: 'Setting the population size to 0 treats the population as effectively infinite — the standard assumption for national or other very large surveys. Only enter a real population size when your sample is a meaningful fraction of a genuinely finite group.' },
        { title: 'A margin of error near 50% is as wide as this calculation gets', body: 'Because p̂(1 − p̂) is largest at p̂ = 0.5, a result close to an even 50/50 split carries the widest possible margin of error for a given sample size — a 50% result is less statistically precise than a 90% or 10% result from the same size sample, even though it is reported with the same ± figure convention.' },
        { title: 'Sample size and population size must be whole numbers', body: 'A sample or population of 1,000.5 is not a real count. A fractional sample size (at least 2) shows no answer; a fractional, nonzero population size is treated the same way, rather than silently applying the finite population correction to the wrong-scale number.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §8.3 A Population Proportion', url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-3-a-population-proportion' },
        { label: 'Wolfram MathWorld, Confidence Interval', url: 'https://mathworld.wolfram.com/ConfidenceInterval.html' }
      ]
    },
    inputs: [
      { id: 'sampleProportion', label: 'Sample proportion (p̂)', type: 'percent', placeholder: '54', defaultValue: 54, step: 1, min: 0 },
      { id: 'sampleSize', label: 'Sample size (n)', type: 'number', placeholder: '1000', defaultValue: 1000, step: 1, min: 2 },
      { id: 'confidenceLevel', label: 'Confidence level', type: 'percent', placeholder: '95', defaultValue: 95, step: 1, min: 1 },
      { id: 'populationSize', label: 'Population size (0 = treat as infinite)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'marginOfErrorPercent',
      headlineLabel: 'Margin of error (± percentage points)',
      outputs: [
        { id: 'marginOfErrorPercent', label: 'Margin of error (± percentage points)', format: 'percent' },
        { id: 'lowerBound', label: 'Lower bound', format: 'percent' },
        { id: 'upperBound', label: 'Upper bound', format: 'percent' },
        { id: 'criticalValue', label: 'Critical value (z*)', format: 'significant' },
        { id: 'standardErrorPercent', label: 'Standard error', format: 'percent' }
      ],
      groups: [
        { inputs: ['sampleProportion', 'sampleSize', 'confidenceLevel'] },
        { title: 'Finite population correction (optional)', inputs: ['populationSize'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'lowerBound', label: 'Lower bound' }, { from: 'sampleProportion', label: 'Sample proportion' }, { from: 'upperBound', label: 'Upper bound' }],
        title: 'Estimated range for the true proportion',
        highlight: 1
      }
    },
    seo: {
      title: 'Margin of Error Calculator – Survey & Poll Proportions',
      description: 'Free margin of error calculator for a survey proportion, from the sample proportion, size and confidence level, with an optional finite population correction.',
      faq: [
        { question: 'How do I calculate margin of error?', answer: 'Multiply the critical value for your confidence level by the standard error, √(p̂(1 − p̂) ÷ n). For a sample proportion of 54% out of 1,000 people at 95% confidence, the margin of error is about ±3.09 percentage points.' },
        { question: 'Why does a 50% result have the largest margin of error?', answer: 'The standard error formula depends on p̂(1 − p̂), which is largest when p̂ = 0.5. A result near 0% or 100% produces a smaller margin of error for the same sample size.' },
        { question: 'Does a bigger sample always shrink the margin of error?', answer: 'Yes, but not proportionally — the standard error is divided by √n, so you need 4 times the sample size to cut the margin of error in half, and 100 times the sample to cut it to a tenth.' },
        { question: 'What confidence level should I use?', answer: '95% is the standard default in most published polling and survey results. 99% gives a wider, more conservative margin; 90% gives a narrower one.' },
        { question: 'What is the finite population correction?', answer: 'A factor that shrinks the margin of error slightly when your sample is a substantial fraction of a known, finite population (for example, 500 out of 2,000 residents). It makes little difference for large or effectively unlimited populations, which is why it defaults to off.' },
        { question: 'Is the Wald method the only way to calculate this?', answer: 'No — it is the simplest and most commonly taught method. The Wilson score interval is a more accurate alternative for small samples or proportions near 0% or 100%, and some statistical software uses it by default.' },
        { question: 'Does margin of error account for a biased or non-random sample?', answer: 'No. Margin of error only measures random sampling variability, assuming the sample was properly randomized. It says nothing about errors from a poorly designed survey, such as a non-representative sample or leading questions.' },
        { question: 'How is this different from the confidence interval calculator?', answer: 'This calculator is specifically for a survey proportion (a percentage). The confidence interval calculator covers a population mean instead, built from a sample mean and standard deviation, and can use either the z or t distribution.' }
      ]
    },
    compute(values) {
      const { sampleProportion, sampleSize, confidenceLevel, populationSize } = values;
      const n = requireIntegerAtLeast(sampleSize, 2); // a fractional sample size is an honest NaN, not a silently-answered different question
      const confidence = clampConfidence(confidenceLevel);
      const alpha = 1 - confidence / 100;
      const z = normalInverseCDF(1 - alpha / 2);
      const p = Math.min(100, Math.max(0, sampleProportion)) / 100;
      const standardError = Math.sqrt((p * (1 - p)) / n);
      // populationSize = 0 is a valid sentinel ("treat as infinite"/not applied); any other value
      // must itself be a whole number — a fractional population was silently ignored before this
      // fix (N > n compares false against NaN, which looks identical to "FPC not needed"), the same
      // gap as a fractional sample size, just hidden one comparison deeper.
      const N = populationSize === 0 ? 0 : requireIntegerAtLeast(populationSize, 1);
      const applyFpc = !Number.isNaN(N) && N > n;
      const fpc = Number.isNaN(N) ? NaN : applyFpc ? Math.sqrt((N - n) / (N - 1)) : 1;
      const marginOfError = z * standardError * fpc;
      const marginOfErrorPercent = marginOfError * 100;
      const sampleProportionPercent = p * 100;
      return {
        marginOfErrorPercent,
        lowerBound: Math.max(0, sampleProportionPercent - marginOfErrorPercent),
        upperBound: Math.min(100, sampleProportionPercent + marginOfErrorPercent),
        criticalValue: z,
        standardErrorPercent: standardError * 100
      };
    }
  },
  {
    id: 'sample-size-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['sample size calculator', 'survey sample size calculator', 'how many people to survey calculator', 'minimum sample size calculator'],
    related: ['margin-of-error-calculator', 'confidence-interval-calculator', 'z-score-calculator', 'percentile-calculator'],
    title: 'Sample Size Calculator',
    description: 'Find the minimum sample size needed for a survey or poll to hit a target margin of error at a given confidence level, with a conservative 50% default proportion and an optional finite population correction.',
    example: 'To estimate a proportion within ±4 percentage points at 95% confidence, assuming the worst-case 50% split, you need at least 601 respondents.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is sample size planning?',
        paragraphs: [
          'This calculator answers the question behind the margin of error calculator: instead of starting with a sample size and finding the resulting margin of error, it starts with a target margin of error and confidence level and finds the smallest sample size that achieves them. The two calculators use exactly the same formula, just solved for a different variable.',
          'Because the true proportion is not known until after the survey runs, this calculator needs an estimate of it in advance. The conservative, standard default is 50% — the proportion that produces the largest possible margin of error (and therefore the largest required sample size) for any given sample size, since p(1 − p) is maximized at p = 0.5. Using 50% when you genuinely have no better estimate guarantees the sample is large enough no matter what the true proportion turns out to be. If you have good reason to expect a lopsided result (say, around 20%), entering that instead gives a smaller, still-valid sample size.',
          'The result is always rounded up to the next whole person or item, never down and never left as a fraction — a sample size of 600.2 does not exist, and rounding down would fall just short of the target precision you asked for.'
        ]
      },
      howTo: {
        intro: 'Enter your target confidence level, your target margin of error, and (optionally) your best estimate of the true proportion.',
        steps: [
          { name: 'Set the confidence level', text: 'Usually 95%. A higher confidence level needs a larger sample for the same margin of error.' },
          { name: 'Set the target margin of error', text: 'How precise you want the result to be, in percentage points — 4 for ±4 points, for example. A smaller target margin needs a larger sample.' },
          { name: 'Set the estimated proportion', text: 'Leave it at 50% if you have no prior information — the conservative, largest-sample-size assumption. Enter a narrower estimate if you have good reason to expect a lopsided result.' },
          { name: 'Optional: enter the population size', text: 'Only if you are sampling from a small, known, finite population — leave it at 0 to treat the population as effectively unlimited, the usual case.' },
          { name: 'Read the required sample size', text: 'The result is always rounded up to the next whole number, with the exact (unrounded) calculation shown alongside it.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The margin of error formula, rearranged to solve for the sample size instead.',
        expression: 'n₀ = z(α/2)² × p(1 − p) ÷ e²\nn = n₀ ÷ (1 + (n₀ − 1) ÷ N)  (only applied when a finite population size N is given)',
        terms: [
          { symbol: 'p', meaning: 'The estimated proportion, as a fraction (50% = 0.5 is the conservative default).' },
          { symbol: 'e', meaning: 'The target margin of error, as a fraction (4% = 0.04).' },
          { symbol: 'z(α/2)', meaning: 'The critical value of the standard normal distribution for the chosen confidence level.' },
          { symbol: 'N', meaning: 'The population size, if known and finite.' }
        ],
        note: 'The result is always rounded up (a fractional person or survey response does not exist), so the sample size shown may be 1 more than the raw calculation — stated explicitly rather than rounded to the nearest whole number, which could under-deliver on the target precision.'
      },
      workedExample: {
        intro: 'Planning a survey that wants a margin of error of no more than ±4 percentage points at 95% confidence, with no prior estimate of the true proportion (so the conservative 50% is used).',
        rows: [
          { label: 'Critical value for 95% confidence', value: '≈ 1.959964' },
          { label: 'p(1 − p) at the conservative p = 0.5', value: '0.25' },
          { label: 'Target margin as a fraction (4%)', value: '0.04' },
          { label: 'Unrounded sample size (1.959964² × 0.25 ÷ 0.04²)', value: '≈ 600.23' },
          { label: 'Rounded up', value: '601' }
        ],
        result: 'Minimum sample size = 601',
        explanation: 'Even though the raw calculation came to about 600.23, the survey needs 601 full respondents — rounding down to 600 would leave the margin of error very slightly wider than the ±4 point target.'
      },
      watchOut: [
        { title: 'Always rounds up, never to the nearest whole number', body: 'A sample size of 600.23 rounds up to 601, not down to 600. Rounding to the nearest whole number can quietly fall just short of the margin of error you asked for.' },
        { title: 'Using 50% when the true proportion is different does not make the result wrong — only larger than strictly necessary', body: 'The 50% default is a safety margin. If the true proportion later turns out to be, say, 20%, your resulting margin of error at the actual sample size will be narrower than the ±4% you planned for, not wider.' },
        { title: 'This plans for sampling error only', body: 'It does not account for non-response (people who decline to answer) or any bias in how the sample is chosen. Real survey planning typically inflates this number further to allow for an expected response rate.' },
        { title: 'The finite population correction only shrinks the required sample — it never increases it', body: 'It matters only when the population itself is small relative to the sample you would otherwise need; for a large or effectively unlimited population it makes negligible difference, which is why it is off by default (population size = 0).' },
        { title: 'A smaller margin of error or higher confidence always costs more sample, not less', body: 'Both tightening the margin of error and raising the confidence level increase the required sample size — there is no way to get a more precise, more confident result from fewer respondents.' },
        { title: 'A nonzero population size must be a whole number', body: 'A population of 2,000.5 is not a real count. Leave population size at 0 to skip the finite population correction entirely; any other value must be a whole number, or this calculator shows no answer rather than applying the correction to a fractional population.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §8.3 A Population Proportion', url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-3-a-population-proportion' },
        { label: 'Wolfram MathWorld, Confidence Interval', url: 'https://mathworld.wolfram.com/ConfidenceInterval.html' }
      ]
    },
    inputs: [
      { id: 'confidenceLevel', label: 'Confidence level', type: 'percent', placeholder: '95', defaultValue: 95, step: 1, min: 1 },
      { id: 'marginOfError', label: 'Target margin of error', type: 'percent', placeholder: '4', defaultValue: 4, step: 0.5, min: 0.1 },
      { id: 'estimatedProportion', label: 'Estimated proportion (50% is the conservative default)', type: 'percent', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'populationSize', label: 'Population size (0 = treat as infinite)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'sampleSize',
      headlineLabel: 'Minimum sample size needed',
      outputs: [
        { id: 'sampleSize', label: 'Minimum sample size needed', format: 'integer' },
        { id: 'rawSampleSize', label: 'Exact (unrounded) calculation', format: 'significant' },
        { id: 'criticalValue', label: 'Critical value (z*)', format: 'significant' },
        { id: 'marginOfErrorPercent', label: 'Target margin of error', format: 'percent' },
        { id: 'estimatedProportionPercent', label: 'Estimated proportion used', format: 'percent' }
      ],
      groups: [
        { inputs: ['confidenceLevel', 'marginOfError', 'estimatedProportion'] },
        { title: 'Finite population correction (optional)', inputs: ['populationSize'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'rawSampleSize', label: 'Exact calculation' }, { from: 'sampleSize', label: 'Rounded up (final answer)' }],
        title: 'Why we round up',
        highlight: 1
      }
    },
    seo: {
      title: 'Sample Size Calculator – Surveys & Polls',
      description: 'Free sample size calculator for surveys. Enter a target margin of error, confidence level and estimated proportion to find the minimum respondents needed.',
      faq: [
        { question: 'How do I calculate the sample size I need?', answer: 'Use n = z(α/2)² × p(1 − p) ÷ e², where z is the critical value for your confidence level, p is your estimated proportion (50% if unknown) and e is your target margin of error. For 95% confidence, a 4% margin and p = 50%, the result is about 600.23, rounded up to 601.' },
        { question: 'Why does this use 50% as the default proportion?', answer: 'Because p(1 − p) — the term driving the required sample size — is largest when p = 50%, using it as a default guarantees your sample is large enough regardless of what the true proportion turns out to be. It is the standard, conservative assumption when you have no better estimate.' },
        { question: 'Why does the answer always round up?', answer: 'A fractional respondent does not exist, and rounding down would leave your actual margin of error very slightly wider than the target you asked for. Rounding up is the only direction that is guaranteed not to undershoot your precision goal.' },
        { question: 'Does a bigger population need a bigger sample?', answer: 'Not necessarily, and often barely at all — past a certain size, population size has almost no effect on the required sample for a given margin of error. The finite population correction only meaningfully shrinks the required sample when the sample would otherwise be a large fraction of a genuinely small, known population.' },
        { question: 'What if I already have a good estimate of the true proportion?', answer: 'Enter it instead of 50% — a narrower, more accurate estimate (say, 20% if you strongly expect a lopsided result) produces a smaller, still-valid required sample size for the same target margin of error and confidence level.' },
        { question: 'How much more sample do I need for a smaller margin of error?', answer: 'Sample size grows with the square of 1 ÷ margin of error, so cutting the target margin of error in half requires roughly 4 times the sample size.' },
        { question: 'Does this account for people who do not respond to the survey?', answer: 'No — this is the number of completed responses needed. Real surveys typically plan for a larger initial outreach to allow for an expected non-response rate.' },
        { question: 'How is this different from the margin of error calculator?', answer: 'The margin of error calculator starts from a sample size and finds the resulting margin of error. This calculator runs the same formula in the opposite direction: starting from a target margin of error, it finds the required sample size.' }
      ]
    },
    compute(values) {
      const { confidenceLevel, marginOfError, estimatedProportion, populationSize } = values;
      const confidence = clampConfidence(confidenceLevel);
      const alpha = 1 - confidence / 100;
      const z = normalInverseCDF(1 - alpha / 2);
      const p = Math.min(100, Math.max(0, estimatedProportion)) / 100;
      const e = Math.max(0.01, marginOfError) / 100;
      const rawSampleSizeUnadjusted = (z * z * p * (1 - p)) / (e * e);
      // populationSize = 0 is a valid sentinel ("treat as infinite"); any other value must itself
      // be a whole number, same fix and reasoning as margin-of-error-calculator's own populationSize.
      const N = populationSize === 0 ? 0 : requireIntegerAtLeast(populationSize, 1);
      const applyFpc = !Number.isNaN(N) && N > rawSampleSizeUnadjusted;
      const rawSampleSize = Number.isNaN(N)
        ? NaN
        : applyFpc
          ? rawSampleSizeUnadjusted / (1 + (rawSampleSizeUnadjusted - 1) / N)
          : rawSampleSizeUnadjusted;
      return {
        sampleSize: Math.ceil(rawSampleSize), // Math.ceil(NaN) is NaN — stays an honest no-answer
        rawSampleSize,
        criticalValue: z,
        marginOfErrorPercent: e * 100,
        estimatedProportionPercent: p * 100
      };
    }
  },
  {
    id: 'p-value-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['p value calculator', 'p-value from z score calculator', 'p-value from t score calculator', 'significance calculator'],
    related: ['z-score-calculator', 'confidence-interval-calculator', 'standard-deviation-calculator', 'percentile-calculator'],
    title: 'P-Value Calculator',
    description: 'Find the p-value for a z-score or t-score, left-tailed, right-tailed or two-tailed, computed directly from the standard normal or Student\'s t distribution.',
    example: 'A z-score of 2.15 gives a two-tailed p-value of about 0.0316 — under the common 0.05 threshold, so the result would usually be called statistically significant.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a p-value?',
        paragraphs: [
          'A p-value answers a specific, narrow question: assuming the null hypothesis is actually true (there is no real effect or difference), how likely is it to see a test statistic at least as extreme as the one observed, just from random sampling variation alone? A small p-value means the observed result would be unusual if there really were nothing going on — which is treated as evidence against the null hypothesis, not proof that it is false.',
          'A p-value is built from a test statistic (a z-score or t-score) and a choice of how "extreme" is measured. A two-tailed test asks about extremeness in either direction and is the standard default; a one-tailed test asks only about one direction, used when the question itself is directional ("is the new process faster," not just "is it different"). The same test statistic gives three different p-values depending on which of the three is asked, which is why the tail type is not a cosmetic setting — it has to match the actual question being asked, decided before looking at the data, not chosen afterward to produce a smaller p-value.',
          'This calculator finds the cumulative probability (the CDF) of the chosen distribution directly at the test statistic, then converts it to the requested tail\'s p-value — the same arithmetic a statistical software package performs internally, shown here explicitly.'
        ]
      },
      howTo: {
        intro: 'Choose whether your test statistic is a z-score or a t-score, enter it, and pick the tail type that matches your hypothesis.',
        steps: [
          { name: 'Choose z or t', text: 'Pick a z-score when the population standard deviation is known or the sample is large; pick a t-score (and enter its degrees of freedom) for a small-sample test using a sample standard deviation — the same distinction the confidence interval calculator makes.' },
          { name: 'Enter the test statistic', text: 'The z-score or t-score from your test — this calculator does not compute it from raw data, only converts it to a p-value.' },
          { name: 'Enter degrees of freedom', text: 'Only used in t-mode: typically the sample size minus 1 for a one-sample t-test.' },
          { name: 'Choose the tail type', text: 'Two-tailed (the usual default) for "is there any difference," or left/right-tailed for a specifically directional hypothesis decided in advance.' },
          { name: 'Read the p-value', text: 'Compare it to your chosen significance threshold (commonly 0.05) — a p-value below the threshold is usually called "statistically significant" at that level.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The one-sided cumulative probability, read off in one of three ways depending on the tail type.',
        expression: 'Two-tailed: p = 2 × min(CDF, 1 − CDF)\nLeft-tailed (≤): p = CDF\nRight-tailed (≥): p = 1 − CDF',
        terms: [
          { symbol: 'CDF', meaning: 'P(statistic ≤ your test statistic), from the standard normal or Student\'s t distribution.' },
          { symbol: 'df', meaning: 'Degrees of freedom, used only for the t-distribution.' }
        ],
        note: 'A p-value is always between 0 and 1. Values close to 0 are strong evidence against the null hypothesis under the test\'s own assumptions; values close to 1 mean the data is entirely consistent with it.'
      },
      workedExample: {
        intro: 'A two-tailed z-test produces a test statistic of z = 2.15. Find the p-value.',
        rows: [
          { label: 'CDF at z = 2.15 (the cumulative probability up to 2.15)', value: '≈ 0.98422' },
          { label: '1 − CDF', value: '≈ 0.01578' },
          { label: 'Two-tailed p-value (2 × min(0.98422, 0.01578))', value: '2 × 0.01578 ≈ 0.03155' }
        ],
        result: 'p ≈ 0.0316',
        explanation: 'Since 0.0316 is below the common 0.05 significance threshold, this result would usually be reported as statistically significant at the 5% level — meaning a result this extreme would happen by chance alone less than 5% of the time if the null hypothesis were true.'
      },
      watchOut: [
        { title: 'A p-value is not the probability the null hypothesis is true', body: 'It is the probability of seeing data this extreme if the null hypothesis were true — a statement about the data given the hypothesis, not about the hypothesis given the data. These are frequently confused, even in print.' },
        { title: 'A small p-value does not mean a large or important effect', body: 'With a large enough sample, even a tiny, practically meaningless difference can produce a very small p-value. Statistical significance and real-world significance are different questions.' },
        { title: 'The tail type must be decided before seeing the data, not after', body: 'Choosing a one-tailed test (or switching between tail types) after seeing which direction the result went in artificially inflates the chance of a "significant" finding. Pick the tail type from the actual research question, in advance.' },
        { title: 'Very small p-values are shown in scientific notation, not rounded to zero', body: 'A p-value of 0.0000005742 is shown as such, not as a misleading flat 0.0000. Published results often report anything below a threshold as "p < 0.0001" rather than the exact tiny figure — both are honest; this calculator shows the real computed number.' },
        { title: 'An extreme test statistic (beyond roughly ±39) shows a floor value, not a literal zero', body: 'Past that point, the true p-value is smaller than the smallest number a computer can represent at all (about 5 × 10⁻³²⁴) — it is not wrong, it is simply beyond double-precision arithmetic. Rather than display a bare "0," which would read as "no evidence whatsoever" rather than "immeasurably small," this calculator shows 1 × 10⁻³⁰⁰ as an honest stand-in: read any value at or below it as "far smaller than this figure, beyond what this calculator can distinguish," not as the test statistic\'s exact probability.' },
        { title: 'This calculator starts from a test statistic, not raw data', body: 'It does not compute a z-score or t-score itself — use the z-score calculator, or compute a sample mean and standard deviation first, to get the test statistic this page converts into a p-value.' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §7.1.3.1 Critical values and p values', url: 'https://www.itl.nist.gov/div898/handbook/prc/section1/prc131.htm' },
        { label: 'Wolfram MathWorld, P-Value', url: 'https://mathworld.wolfram.com/P-Value.html' },
        { label: 'Wolfram MathWorld, Student\'s t-Distribution', url: 'https://mathworld.wolfram.com/Studentst-Distribution.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'What is your test statistic?',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'A z-score' },
          { value: 2, label: 'A t-score' }
        ]
      },
      { id: 'testStatistic', label: 'Test statistic', type: 'number', placeholder: '2.15', defaultValue: 2.15, step: 0.01 },
      { id: 'degreesOfFreedom', label: 'Degrees of freedom (t-score only)', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      {
        id: 'tailType',
        label: 'Tail type',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Two-tailed (is there any difference?)' },
          { value: 2, label: 'Left-tailed (is it less than?)' },
          { value: 3, label: 'Right-tailed (is it greater than?)' }
        ]
      }
    ],
    breakdown: {
      headline: 'pValue',
      headlineLabel: 'P-value',
      outputs: [
        { id: 'pValue', label: 'P-value', format: 'significant' },
        { id: 'cdfValue', label: 'Cumulative probability up to this score', format: 'significant' }
      ],
      groups: [
        { inputs: ['mode', 'testStatistic', 'tailType'] },
        { title: 'Only used for a t-score', inputs: ['degreesOfFreedom'], optional: true }
      ],
      visual: {
        type: 'rangeBar',
        value: 'pValue',
        bands: [
          { label: 'Highly significant', min: 0, max: 0.01 },
          { label: 'Significant', min: 0.01, max: 0.05 },
          { label: 'Marginally significant', min: 0.05, max: 0.1 },
          { label: 'Not significant', min: 0.1, max: 1 }
        ],
        title: 'Where this p-value falls (common thresholds)',
        valueLabel: 'Your p-value'
      }
    },
    seo: {
      title: 'P-Value Calculator – From a Z-Score or T-Score',
      description: 'Free p-value calculator. Enter a z-score or t-score and choose two-, left- or right-tailed to find the exact p-value, computed directly from the distribution.',
      faq: [
        { question: 'How do I find a p-value from a z-score?', answer: 'Find the cumulative probability (CDF) at that z-score from the standard normal distribution, then convert it based on the tail type: two-tailed is 2 × min(CDF, 1 − CDF). For z = 2.15, two-tailed, the p-value is about 0.0316.' },
        { question: 'How do I find a p-value from a t-score?', answer: 'Same idea, using the Student\'s t distribution with your degrees of freedom (usually sample size minus 1) instead of the normal distribution. For t = 2.5 with 20 degrees of freedom, a right-tailed p-value is about 0.0106.' },
        { question: 'What is the difference between one-tailed and two-tailed?', answer: 'A two-tailed test measures how extreme a result is in either direction and is the standard default. A one-tailed test (left or right) measures extremeness in only one specific direction, used only when the research question itself is directional and decided in advance.' },
        { question: 'What p-value counts as "statistically significant"?', answer: 'There is no universal cutoff, but 0.05 is by far the most common convention: a p-value below 0.05 is typically called significant at the 5% level, below 0.01 at the 1% level. The threshold should be chosen before looking at the data, not after.' },
        { question: 'Can a p-value be exactly 0?', answer: 'Mathematically, no — it can get extremely small (a z-score of 5, two-tailed, gives about 5.733 × 10⁻⁷, shown in scientific notation) but never reaches exactly 0 for a finite test statistic. For a very extreme test statistic (beyond roughly ±39), the true value is smaller than a computer can represent at all; this calculator shows 1 × 10⁻³⁰⁰ in that case rather than a misleading flat 0. Many published results simply report "p < 0.0001" once it is below a practical reporting threshold.' },
        { question: 'Does a smaller p-value mean a bigger effect?', answer: 'No. A p-value measures how surprising the result would be if there were truly no effect, not the size of the effect itself. A large sample can produce a very small p-value for a practically tiny difference.' },
        { question: 'How do I get the test statistic to put into this calculator?', answer: 'Use the z-score calculator for a z-score, or compute a t-statistic from a sample mean, standard deviation and hypothesized value — this calculator converts an already-calculated test statistic into a p-value, it does not derive one from raw data.' },
        { question: 'What does the degrees of freedom field do?', answer: 'It is only used in t-score mode, where it controls the exact shape of the Student\'s t distribution — typically the sample size minus 1 for a one-sample test. It has no effect in z-score mode.' }
      ]
    },
    compute(values) {
      const { mode, testStatistic, degreesOfFreedom, tailType } = values;
      const useT = mode === 2;
      const df = Math.max(1, degreesOfFreedom);
      // leftTail and rightTail are each computed by their own direct, symmetric formula (never by
      // subtracting one from 1), so a two-tailed or right-tailed p-value for a large |testStatistic|
      // never loses precision to floating-point cancellation — see lib/distributions.ts.
      const leftTail = useT ? tCDF(testStatistic, df) : normalCDF(testStatistic);
      const rightTail = useT ? tSF(testStatistic, df) : normalSF(testStatistic);
      const rawPValue = tailType === 2 ? leftTail : tailType === 3 ? rightTail : 2 * Math.min(leftTail, rightTail);
      return { pValue: floorTinyProbability(rawPValue), cdfValue: floorTinyProbability(leftTail) };
    }
  },
  {
    id: 'quartile-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['quartile calculator', 'iqr calculator', 'interquartile range calculator', 'find the quartiles calculator', 'q1 q3 calculator'],
    related: ['percentile-calculator', 'mean-median-mode-calculator', 'standard-deviation-calculator', 'average-calculator'],
    title: 'Quartile & IQR Calculator',
    description: 'Find Q1, the median (Q2), Q3, the interquartile range and Tukey\'s outlier fences for a list of up to 1,000 numbers — using the same method as this site\'s percentile calculator.',
    example: 'Eight exam scores — 60, 65, 70, 72, 78, 85, 90 and 95 — have Q1 = 66.25, a median of 75, Q3 = 88.75, and an interquartile range of 22.5, with no outliers.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What are quartiles and the IQR?',
        paragraphs: [
          'Quartiles split a sorted list of numbers into four equal-sized groups. Q1 (the first quartile, also the 25th percentile) marks the boundary below which the lowest quarter of the data falls; Q2 is the median, the 50th percentile; Q3 (the third quartile, the 75th percentile) marks the boundary below which the lowest three-quarters falls. Together with the minimum and maximum, these five numbers are the classic "five-number summary" of a data set.',
          'The interquartile range (IQR = Q3 − Q1) measures the spread of the middle 50% of the data — the part least affected by a few unusually high or low values. Because it ignores the top and bottom quarters entirely, the IQR is a more outlier-resistant measure of spread than the standard deviation, which is pulled around by every value, extreme ones included.',
          'This calculator finds Q1, Q2 and Q3 using exactly the same linear-interpolation method (and the same underlying calculation) as this site\'s percentile calculator, so the two pages can never silently disagree on the same data — see that page for the method\'s source and for finding any other percentile, not just the quarter-boundaries.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines, in any order — up to 1,000 of them. The calculator sorts the list itself.' },
          { name: 'Check the count', text: 'Anything that isn\'t a number is dropped and listed below the box, along with the live count of numbers it understood.' },
          { name: 'Read the interquartile range', text: 'The headline is the IQR, Q3 minus Q1 — the spread of the middle half of your data.' },
          { name: 'Check Q1, the median and Q3', text: 'The rows below show all three quartile boundaries individually.' },
          { name: 'Check the outlier fences', text: 'The lower and upper fence rows mark Tukey\'s classic 1.5 × IQR outlier boundaries, plus a count of how many of your values fall outside them.' },
          { name: 'Compare the three quartiles', text: 'The chart plots Q1, the median and Q3 side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Q1, Q2 and Q3 are the 25th, 50th and 75th percentiles of the sorted list (see the percentile calculator\'s formula for the full interpolation method). The IQR and outlier fences follow directly from them.',
        expression: 'IQR = Q3 − Q1\nLower fence = Q1 − 1.5 × IQR\nUpper fence = Q3 + 1.5 × IQR',
        terms: [
          { symbol: 'Q1, Q2, Q3', meaning: 'The 25th, 50th (median) and 75th percentiles of the sorted data.' },
          { symbol: 'IQR', meaning: 'The interquartile range, Q3 − Q1 — the spread of the middle 50% of the data.' }
        ],
        note: 'The 1.5 × IQR fence is a widely used convention (sometimes called Tukey\'s fences, after statistician John Tukey) for flagging a value as a likely outlier, not a strict mathematical boundary — a value just outside a fence is not automatically wrong or invalid, only unusual relative to the rest of this particular data set.'
      },
      workedExample: {
        intro: 'Eight exam scores, already sorted: 60, 65, 70, 72, 78, 85, 90, 95.',
        rows: [
          { label: 'Q1 (25th percentile)', value: '66.25' },
          { label: 'Median / Q2 (50th percentile)', value: '75' },
          { label: 'Q3 (75th percentile)', value: '88.75' },
          { label: 'IQR (88.75 − 66.25)', value: '22.5' },
          { label: 'Lower fence (66.25 − 1.5 × 22.5)', value: '32.5' },
          { label: 'Upper fence (88.75 + 1.5 × 22.5)', value: '122.5' }
        ],
        result: 'Q1 = 66.25, median = 75, Q3 = 88.75, IQR = 22.5, no outliers',
        explanation: 'Both the lowest score (60) and the highest (95) fall comfortably inside the fences (32.5 to 122.5), so none of these eight scores would be flagged as an outlier by this rule.'
      },
      watchOut: [
        { title: 'Different tools can give slightly different quartiles for the same data', body: 'Like percentiles, there are several accepted ways to interpolate a quartile that doesn\'t land exactly on a value in the list. This calculator uses the same method as the percentile calculator; Excel and some graphing calculators (TI) use a different convention and can give a slightly different answer for the same data.' },
        { title: 'The 1.5 × IQR fence is a convention, not a certainty', body: 'A value just outside the fence is flagged as statistically unusual relative to the rest of this data set, not proven to be an error or an invalid measurement. Always check what an outlier actually is before deciding what to do about it.' },
        { title: 'A single value is its own every quartile', body: 'With only one number in the list, Q1, the median and Q3 are all that same value, the IQR is 0, and both fences collapse onto it — there is nothing else for the calculation to interpolate between.' },
        { title: 'The IQR ignores the top and bottom quarters entirely', body: 'That is exactly why it resists outliers, but it also means two data sets with very different extreme values can have the same IQR if their middle halves happen to match.' },
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. A leading $, a trailing %, and thousands-separator commas (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers.' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §7.2.6.2 Percentiles', url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm' },
        { label: 'Wolfram MathWorld, Interquartile Range', url: 'https://mathworld.wolfram.com/InterquartileRange.html' }
      ]
    },
    inputs: [listInput([60, 65, 70, 72, 78, 85, 90, 95], 1)],
    breakdown: {
      headline: 'iqr',
      headlineLabel: 'Interquartile range (IQR)',
      outputs: [
        { id: 'iqr', label: 'Interquartile range (IQR)', format: 'significant' },
        { id: 'q1', label: 'Q1 (25th percentile)', format: 'significant' },
        { id: 'median', label: 'Median / Q2 (50th percentile)', format: 'significant' },
        { id: 'q3', label: 'Q3 (75th percentile)', format: 'significant' },
        { id: 'lowerFence', label: 'Lower outlier fence', format: 'significant' },
        { id: 'upperFence', label: 'Upper outlier fence', format: 'significant' },
        { id: 'outlierCount', label: 'Values outside the fences', format: 'integer' },
        { id: 'count', label: 'Count', format: 'integer' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'q1', label: 'Q1' }, { from: 'median', label: 'Median (Q2)' }, { from: 'q3', label: 'Q3' }],
        title: 'Q1, median and Q3',
        highlight: 1
      }
    },
    seo: {
      title: 'Quartile & IQR Calculator – Q1, Median, Q3, Outlier Fences',
      description: 'Free quartile calculator. Paste a list of up to 1,000 numbers to find Q1, the median, Q3, the interquartile range and Tukey\'s 1.5×IQR outlier fences.',
      faq: [
        { question: 'How do I find the quartiles of a data set?', answer: 'Sort the data, then find the 25th, 50th and 75th percentiles using linear interpolation between the closest ranked values. For 60, 65, 70, 72, 78, 85, 90, 95, that gives Q1 = 66.25, median = 75, Q3 = 88.75.' },
        { question: 'How do I calculate the interquartile range?', answer: 'Subtract Q1 from Q3: IQR = Q3 − Q1. For the worked example, 88.75 − 66.25 = 22.5.' },
        { question: 'What are the outlier fences?', answer: 'Tukey\'s classic convention: the lower fence is Q1 − 1.5 × IQR, and the upper fence is Q3 + 1.5 × IQR. A value outside these fences is flagged as a likely outlier.' },
        { question: 'Why does this use the same method as the percentile calculator?', answer: 'Q1, the median and Q3 are just the 25th, 50th and 75th percentiles, so this calculator reuses the percentile calculator\'s exact method (NIST/SEMATECH\'s linear interpolation, Hyndman & Fan\'s "type 6") rather than risking a second, disagreeing calculation of the same thing.' },
        { question: 'Why does Excel give a different answer?', answer: 'Excel\'s QUARTILE and PERCENTILE functions use a different, also standard, interpolation convention ("type 7"). Both are legitimate methods that usually agree closely but not exactly — see the percentile calculator for the full comparison.' },
        { question: 'Is a value outside the fences definitely an error?', answer: 'No. It is flagged as statistically unusual relative to the rest of this specific data set, which is a prompt to look closer, not proof that the value is wrong.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const sorted = [...list].sort((a, b) => a - b);
      const n = sorted.length;
      const q1 = percentileOf(sorted, 25);
      const median = percentileOf(sorted, 50);
      const q3 = percentileOf(sorted, 75);
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;
      const outlierCount = list.filter((value) => value < lowerFence || value > upperFence).length;
      return { iqr, q1, median, q3, lowerFence, upperFence, outlierCount, count: n };
    }
  },
  {
    id: 'probability-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['probability of two events calculator', 'and or probability calculator', 'independent events calculator', 'probability calculator'],
    related: ['permutation-calculator', 'combination-calculator', 'binomial-distribution-calculator', 'z-score-calculator'],
    title: 'Probability Calculator',
    description: 'Find the probability of two independent events both happening, either happening, neither happening, or exactly one happening, from each event\'s own probability.',
    example: 'A student has a 70% chance of passing math and a 60% chance of passing science, independently. The chance of passing both is 42%, and the chance of passing at least one is 88%.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is the probability of two events?',
        paragraphs: [
          'This calculator starts from the probability of two separate events, A and B, and finds the probability of several combinations of them: both happening, at least one happening, neither happening, exactly one happening, and each event not happening on its own. All of it follows from basic probability rules once A and B are independent.',
          'Two events are independent when knowing the outcome of one tells you nothing about the other — a coin flip and a dice roll, or (per this calculator\'s own assumption) the worked example\'s math and science results. Independence is what makes "P(A and B) = P(A) × P(B)" valid; for dependent events (passing a prerequisite course changes your chance of passing the next one, say), this simple multiplication rule does not apply, and a different, conditional-probability calculation would be needed instead.',
          'Every probability on this page is entered and shown as a percentage between 0% and 100% — 0% meaning the event never happens, 100% meaning it always does, and everything in between describing how likely it is relative to those two extremes.'
        ]
      },
      howTo: {
        intro: 'Enter the probability of event A and the probability of event B, each as a percentage.',
        steps: [
          { name: 'Enter P(A)', text: 'The probability that event A happens, from 0% to 100%.' },
          { name: 'Enter P(B)', text: 'The probability that event B happens, from 0% to 100%, assumed independent of A.' },
          { name: 'Read P(A and B)', text: 'The headline is the chance both events happen, found by multiplying the two probabilities together.' },
          { name: 'Check the other combinations', text: 'The rows below show P(A or B) (at least one happens), P(not A), P(exactly one, but not both) and P(neither).' },
          { name: 'Compare them', text: 'The chart places P(A and B), P(A or B) and P(neither) side by side, the three combinations that together summarize the whole picture.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Five combinations, all built from the same two independent probabilities.',
        expression: 'P(A and B) = P(A) × P(B)\nP(A or B) = P(A) + P(B) − P(A and B)\nP(not A) = 1 − P(A)\nP(exactly one) = P(A) × P(not B) + P(not A) × P(B)\nP(neither) = P(not A) × P(not B)',
        terms: [
          { symbol: 'P(A), P(B)', meaning: 'The probability of each event, independently of the other.' },
          { symbol: 'P(not A)', meaning: 'The probability event A does not happen, 1 − P(A).' }
        ],
        note: 'These formulas only hold because A and B are assumed independent. For two events that are not independent (one influences the other), P(A and B) requires a conditional probability, P(B given A), which this calculator does not ask for and should not be used for.'
      },
      workedExample: {
        intro: 'A student has a 70% chance of passing math (event A) and a 60% chance of passing science (event B), with the two results assumed independent of each other.',
        rows: [
          { label: 'P(A and B) = 0.70 × 0.60', value: '0.42, i.e. 42%' },
          { label: 'P(A or B) = 0.70 + 0.60 − 0.42', value: '0.88, i.e. 88%' },
          { label: 'P(not A) = 1 − 0.70', value: '0.30, i.e. 30%' },
          { label: 'P(exactly one) = 0.70 × 0.40 + 0.30 × 0.60', value: '0.46, i.e. 46%' },
          { label: 'P(neither) = 0.30 × 0.40', value: '0.12, i.e. 12%' }
        ],
        result: 'P(both) = 42%, P(at least one) = 88%, P(neither) = 12%',
        explanation: 'As a check, P(A or B) always equals 1 − P(neither): 1 − 0.12 = 0.88, matching the direct calculation — "at least one happens" and "neither happens" are opposite outcomes, so their probabilities must add to 100%.'
      },
      watchOut: [
        { title: 'This assumes A and B are independent — check that before trusting the result', body: 'If one event changes the likelihood of the other (drawing two cards from a deck without replacement, say), these formulas give the wrong answer. Independence has to come from how the events actually work, not from how the numbers happen to look.' },
        { title: '"Exactly one" is not the same as "at least one"', body: 'P(A or B) (at least one, including possibly both) and P(exactly one) (one or the other, but not both) are two different, equally valid questions. This calculator reports both separately rather than assuming which one you meant.' },
        { title: 'Probabilities are clamped to the 0%–100% range', body: 'A probability outside that range is not meaningful, so any input is treated as the nearest valid percentage before anything else is calculated.' },
        { title: 'P(A and B) being small does not mean either event alone is unlikely', body: 'Two individually fairly likely events (70% and 60% here) still have a combined "both happen" probability well under either one on its own, simply because requiring both to happen is a stricter condition than requiring just one.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §3.2 Independent and Mutually Exclusive Events', url: 'https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events' },
        { label: 'Wolfram MathWorld, Independent Statistics', url: 'https://mathworld.wolfram.com/IndependentStatistics.html' }
      ]
    },
    inputs: [
      { id: 'probabilityA', label: 'P(A)', type: 'percent', placeholder: '70', defaultValue: 70, step: 1, min: 0 },
      { id: 'probabilityB', label: 'P(B)', type: 'percent', placeholder: '60', defaultValue: 60, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'bothPercent',
      headlineLabel: 'P(A and B) — both happen',
      outputs: [
        { id: 'bothPercent', label: 'P(A and B) — both happen', format: 'percent' },
        { id: 'eitherPercent', label: 'P(A or B) — at least one happens', format: 'percent' },
        { id: 'exactlyOnePercent', label: 'P(exactly one) — one but not both', format: 'percent' },
        { id: 'neitherPercent', label: 'P(neither) happens', format: 'percent' },
        { id: 'notAPercent', label: 'P(not A)', format: 'percent' },
        { id: 'notBPercent', label: 'P(not B)', format: 'percent' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'bothPercent', label: 'Both' }, { from: 'eitherPercent', label: 'At least one' }, { from: 'neitherPercent', label: 'Neither' }],
        title: 'Both, at least one, or neither',
        highlight: 0
      }
    },
    seo: {
      title: 'Probability Calculator – Two Independent Events',
      description: 'Free probability calculator. Find P(A and B), P(A or B), P(neither) and P(exactly one) for two independent events from each one\'s own probability.',
      faq: [
        { question: 'How do I find the probability of two independent events both happening?', answer: 'Multiply their individual probabilities: P(A and B) = P(A) × P(B). For a 70% and a 60% chance, that is 0.70 × 0.60 = 0.42, or 42%.' },
        { question: 'How do I find the probability that at least one of two events happens?', answer: 'Add the two probabilities and subtract the chance both happen: P(A or B) = P(A) + P(B) − P(A and B). For 70% and 60%, that is 70 + 60 − 42 = 88%.' },
        { question: 'What does "independent" mean here?', answer: 'It means the outcome of one event has no effect on the probability of the other — knowing A happened would not change your estimate of how likely B is. This calculator\'s formulas only work under that assumption.' },
        { question: 'What is the difference between "at least one" and "exactly one"?', answer: '"At least one" (P(A or B)) includes the case where both happen. "Exactly one" excludes it, counting only the cases where one event happens and the other does not.' },
        { question: 'How do I find the probability that neither event happens?', answer: 'Multiply the two "not" probabilities: P(neither) = (1 − P(A)) × (1 − P(B)). For 70% and 60%, that is 0.30 × 0.40 = 0.12, or 12%.' },
        { question: 'Can I enter a probability as a decimal instead of a percentage?', answer: 'This calculator\'s fields take a percentage (0 to 100). Enter 0.7 as 70, not as 0.7 — a plain 0.7 would be read as 0.7%, not 70%.' },
        { question: 'What if the two events are not independent?', answer: 'These formulas no longer apply — P(A and B) would need the conditional probability of B given A, which is not something this calculator asks for or computes.' },
        { question: 'Why is P(A and B) smaller than either P(A) or P(B) alone?', answer: 'Requiring two things to both happen is always at least as restrictive as requiring just one of them, so the combined probability can never be larger than the smaller of the two individual probabilities.' }
      ]
    },
    compute(values) {
      const pA = Math.min(100, Math.max(0, values.probabilityA)) / 100;
      const pB = Math.min(100, Math.max(0, values.probabilityB)) / 100;
      const notA = 1 - pA;
      const notB = 1 - pB;
      const both = pA * pB;
      const either = pA + pB - both;
      const exactlyOne = pA * notB + notA * pB;
      const neither = notA * notB;
      return {
        bothPercent: both * 100,
        eitherPercent: either * 100,
        exactlyOnePercent: exactlyOne * 100,
        neitherPercent: neither * 100,
        notAPercent: notA * 100,
        notBPercent: notB * 100
      };
    }
  },
  {
    id: 'permutation-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['npr calculator', 'permutations calculator', 'order matters calculator', 'arrangements calculator'],
    related: ['combination-calculator', 'factorial-calculator', 'probability-calculator', 'binomial-distribution-calculator'],
    title: 'Permutation Calculator',
    description: 'Find nPr, the number of ways to arrange r items out of n in order, computed exactly with integer math — plus the ordered count when repetition is allowed.',
    example: 'There are 5 runners in a race. There are 5P3 = 60 ways to award 1st, 2nd and 3rd place among them.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a permutation?',
        paragraphs: [
          'A permutation is an arrangement of items where order matters — 1st, 2nd and 3rd place among 5 runners are a different outcome if the same three runners finish in a different order. The number of ways to arrange r items chosen from a set of n, without reusing any item, is written nPr (or P(n, r)), and it is always counting distinct orderings, not just distinct selections.',
          'This is different from a combination, which counts selections where order does not matter (which three runners make the podium, regardless of who came first) — see the combination calculator for that question. nPr is always at least as large as nCr for the same n and r, by exactly a factor of r!, since every unordered selection corresponds to r! different orderings of it.',
          'This calculator also shows the related count when repetition is allowed — choosing r items in order from n options where the same option can be picked more than once (a 3-digit PIN from 10 digits, say) — which is simply nʳ, a different and much simpler formula that does not involve factorials at all.'
        ]
      },
      howTo: {
        intro: 'Enter n (how many items there are) and r (how many you are arranging).',
        steps: [
          { name: 'Enter n', text: 'How many distinct items are available in total.' },
          { name: 'Enter r', text: 'How many of them you are arranging, in order.' },
          { name: 'Read nPr', text: 'The headline is the number of ways to arrange r of the n items without repeating any of them, computed with exact integer arithmetic.' },
          { name: 'Check the exact digit count', text: 'The digit count stays exact even once nPr itself is too large for a 64-bit number to hold precisely — see "Watch out" below.' },
          { name: 'Check the with-repetition count', text: 'The remaining rows show nʳ, the number of ordered sequences of length r from n options if repeating an option is allowed — a different question with its own formula.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Without repetition, nPr multiplies r consecutive descending factors starting from n. With repetition, it is simply n raised to the power r.',
        expression: 'Without repetition: nPr = n × (n−1) × (n−2) × ... × (n−r+1) = n! ÷ (n−r)!\nWith repetition: nʳ',
        terms: [
          { symbol: 'n', meaning: 'How many distinct items are available (0 to 1,000).' },
          { symbol: 'r', meaning: 'How many items are being arranged, in order (0 to 1,000).' }
        ],
        note: 'By convention, nPr = 0 when r > n (there is no way to arrange more distinct items than exist). nPr with r = 0 is 1 — there is exactly one way to arrange nothing, the same "empty arrangement" convention the factorial calculator uses for 0!.'
      },
      workedExample: {
        intro: 'Of 5 runners, 1st, 2nd and 3rd place are awarded — r = 3 ordered positions from n = 5 people, no repeats (nobody can finish in two places at once).',
        rows: [
          { label: 'nPr = 5 × 4 × 3 (3 descending factors starting at 5)', value: '60' },
          { label: 'With repetition, for comparison: 5³', value: '125' }
        ],
        result: '5P3 = 60 ways to award the podium',
        explanation: 'The with-repetition figure, 125, answers a different question — it would be the count if the "same runner" could occupy more than one podium spot, which cannot happen in a real race, which is exactly why the two numbers do not match.'
      },
      watchOut: [
        { title: 'This calculator is exact up to n = 1,000', body: 'Above that, the factor-by-factor multiplication would take an impractically long time to stay exact, so this calculator shows no answer for an n or r larger than 1,000 — the same practical cap the factorial calculator uses.' },
        { title: 'Past 2^53 − 1 (about 9.007 quadrillion), the displayed number is a rounded approximation, not the exact integer', body: 'For example, 25P20 is exactly 129,260,083,694,424,883,200,000 (24 digits) — but a standard 64-bit number can only hold about 15–17 significant digits exactly, so the headline value, shown in scientific notation past that size, is a correctly-rounded approximation. The digit count is computed separately with exact integer arithmetic and stays exact at any size.' },
        { title: 'r > n gives 0 for the without-repetition count, not an error', body: 'You cannot arrange more distinct items than you have, so this calculator reports 0 ways rather than refusing to answer — a standard mathematical convention, not a special case invented for this page.' },
        { title: 'Order matters here — this is not the same question as the combination calculator', body: 'If you only care which items are chosen, not what order they come in, use the combination calculator instead; it will always give a smaller number for the same n and r (nCr = nPr ÷ r!).' },
        { title: 'Non-integer n or r are rounded to the nearest whole number first', body: 'Permutations only make sense for counting whole, indivisible items, so a decimal typed into either field is rounded before this calculator computes anything with it.' }
      ],
      references: [
        { label: 'Wolfram MathWorld, Permutation', url: 'https://mathworld.wolfram.com/Permutation.html' },
        { label: 'NIST Digital Library of Mathematical Functions, §26.1 Combinatorial Analysis: Permutations', url: 'https://dlmf.nist.gov/26.1' }
      ]
    },
    inputs: [
      { id: 'n', label: 'n (items available)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'r', label: 'r (items arranged)', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'permutations',
      headlineLabel: 'nPr (without repetition)',
      outputs: [
        { id: 'permutations', label: 'nPr (without repetition)', format: 'significant' },
        { id: 'digitCount', label: 'Exact digit count', format: 'integer' },
        { id: 'permutationsWithRepetition', label: 'nʳ (with repetition)', format: 'significant' },
        { id: 'digitCountWithRepetition', label: 'Exact digit count (with repetition)', format: 'integer' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'permutations', label: 'Without repetition (nPr)' }, { from: 'permutationsWithRepetition', label: 'With repetition (nʳ)' }],
        title: 'Without vs. with repetition',
        highlight: 0
      }
    },
    seo: {
      title: 'Permutation Calculator – nPr, Exact Integer Math',
      description: 'Free permutation calculator. Find nPr (and the with-repetition count nʳ) for any n and r up to 1,000, with exact integer arithmetic and digit counts.',
      faq: [
        { question: 'How do I calculate a permutation?', answer: 'Multiply r consecutive descending factors starting from n: nPr = n × (n−1) × ... × (n−r+1). For n=5, r=3: 5 × 4 × 3 = 60.' },
        { question: 'What is the difference between a permutation and a combination?', answer: 'A permutation (nPr) counts arrangements where order matters; a combination (nCr) counts selections where it does not. nPr is always nCr × r! — larger by a factor of however many ways the r chosen items could be reordered.' },
        { question: 'What does nPr mean when r is greater than n?', answer: 'It is 0 — you cannot arrange more distinct items than you have. This calculator reports 0 rather than treating it as an error.' },
        { question: 'What is nPr with repetition?', answer: 'If the same item can be chosen more than once, the count of ordered sequences of length r from n options is simply nʳ, not nPr — a 4-digit PIN (digits can repeat) has 10⁴ = 10,000 possibilities, not 10P4 = 5,040.' },
        { question: 'What is 5P3?', answer: '5P3 = 5 × 4 × 3 = 60.' },
        { question: 'What is nPr when r = 0?', answer: '1 — there is exactly one way to arrange zero items, the same "empty arrangement" convention as 0! = 1.' },
        { question: 'How large an n or r can this calculator handle?', answer: 'Up to 1,000 for each, computed with exact integer (BigInt) arithmetic. Past about 2^53 − 1, the displayed headline number is a correctly-rounded approximation rather than the exact integer, but the digit count stays exact.' },
        { question: 'Can n or r be negative or a decimal?', answer: 'Permutations are only defined for non-negative whole numbers. A decimal is rounded to the nearest whole number first; a negative value gives no answer.' }
      ]
    },
    compute(values) {
      const n = Math.round(values.n);
      const r = Math.round(values.r);
      const noAnswer = { permutations: NaN, digitCount: NaN, permutationsWithRepetition: NaN, digitCountWithRepetition: NaN };
      if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || n > COUNTING_MAX_N || r > COUNTING_MAX_N) return noAnswer;
      const without = bigToDisplay(nPrBig(n, r));
      const withRepetition = bigToDisplay(BigInt(n) ** BigInt(r));
      return {
        permutations: without.value,
        digitCount: without.digitCount,
        permutationsWithRepetition: withRepetition.value,
        digitCountWithRepetition: withRepetition.digitCount
      };
    }
  },
  {
    id: 'combination-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['ncr calculator', 'combinations calculator', 'n choose r calculator', 'binomial coefficient calculator'],
    related: ['permutation-calculator', 'factorial-calculator', 'binomial-distribution-calculator', 'probability-calculator'],
    title: 'Combination Calculator',
    description: 'Find nCr ("n choose r"), the number of ways to select r items out of n where order does not matter, computed exactly with integer math — plus the count with repetition allowed.',
    example: 'A poker hand draws 5 cards from a 52-card deck. There are 52C5 = 2,598,960 possible 5-card hands.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a combination?',
        paragraphs: [
          'A combination is a selection of items where order does not matter — a 5-card poker hand is the same hand no matter what order the cards were dealt in. The number of ways to choose r items from a set of n, with no repeats and no regard to order, is written nCr, "n choose r," or as the binomial coefficient (ⁿᵣ). It is the same quantity that gives the binomial distribution its name and appears directly in its formula.',
          'nCr is always smaller than (or equal to, at the edges) nPr for the same n and r, specifically by a factor of r! — the number of orders the same r chosen items could have been arranged in, which a combination deliberately ignores. See the permutation calculator for that related, order-sensitive count.',
          'This calculator also shows the count when repetition is allowed — choosing r items from n types where the same type can be picked more than once and order still does not matter (2 scoops of ice cream from 3 flavors, say, where "vanilla + vanilla" is a valid choice) — a different formula called a multiset coefficient, nCr applied to (n + r − 1, r) instead of (n, r).'
        ]
      },
      howTo: {
        intro: 'Enter n (how many items there are) and r (how many you are choosing).',
        steps: [
          { name: 'Enter n', text: 'How many distinct items are available in total.' },
          { name: 'Enter r', text: 'How many of them you are selecting, with order not mattering.' },
          { name: 'Read nCr', text: 'The headline is the number of ways to choose r of the n items with no repeats, computed with exact integer arithmetic.' },
          { name: 'Check the exact digit count', text: 'The digit count stays exact even once nCr itself is too large for a 64-bit number to hold precisely — see "Watch out" below.' },
          { name: 'Check the with-repetition count', text: 'The remaining rows show the multiset coefficient — the number of ways to choose r items from n types if repeating a type is allowed.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Without repetition, nCr divides nPr by r! to remove the orderings a combination does not care about. With repetition, the same nCr formula is applied to a shifted pair of numbers.',
        expression: 'Without repetition: nCr = nPr ÷ r! = n! ÷ (r! × (n−r)!)\nWith repetition: C(n + r − 1, r)',
        terms: [
          { symbol: 'n', meaning: 'How many distinct items (or types) are available (0 to 1,000).' },
          { symbol: 'r', meaning: 'How many items are being chosen (0 to 1,000).' }
        ],
        note: 'By convention, nCr = 0 when r > n (there is no way to choose more distinct items than exist, without repeats). nCr with r = 0 is 1 — there is exactly one way to choose nothing, the empty selection.'
      },
      workedExample: {
        intro: 'A 5-card poker hand is dealt from a standard 52-card deck — choosing r = 5 cards from n = 52, with no repeats and no regard to the order dealt.',
        rows: [
          { label: 'nPr(52, 5) = 52 × 51 × 50 × 49 × 48', value: '311,875,200' },
          { label: '5! (the orderings a combination ignores)', value: '120' },
          { label: 'nCr = 311,875,200 ÷ 120', value: '2,598,960' }
        ],
        result: '52C5 = 2,598,960 possible hands',
        explanation: 'This is the well-known total count of distinct 5-card poker hands — the number used as the denominator in every poker-hand-probability calculation (the chance of a royal flush, for instance, is 4 ÷ 2,598,960).'
      },
      watchOut: [
        { title: 'This calculator is exact up to n = 1,000', body: 'Above that, the calculation would take an impractically long time to stay exact, so this calculator shows no answer for an n or r larger than 1,000 — the same practical cap the factorial and permutation calculators use.' },
        { title: 'Past 2^53 − 1 (about 9.007 quadrillion), the displayed number is a rounded approximation, not the exact integer', body: 'For example, 60C30 is exactly 118,264,581,564,861,424 (18 digits) — a standard 64-bit number only holds about 15–17 significant digits exactly, so the headline value, shown in scientific notation past that size, is a correctly-rounded approximation of the true integer. The digit count is computed separately with exact integer arithmetic and stays exact at any size.' },
        { title: 'r > n gives 0 for the without-repetition count, not an error', body: 'You cannot choose more distinct items than you have without repeating one, so this calculator reports 0 ways rather than refusing to answer — a standard convention, not a special case invented for this page.' },
        { title: 'Order does not matter here — this is not the same question as the permutation calculator', body: 'If the order of the chosen items matters (who finishes 1st vs. 2nd, not just who makes the podium), use the permutation calculator instead; it will always give a larger number for the same n and r.' },
        { title: 'Non-integer n or r are rounded to the nearest whole number first', body: 'Combinations only make sense for counting whole, indivisible items, so a decimal typed into either field is rounded before this calculator computes anything with it.' }
      ],
      references: [
        { label: 'Wolfram MathWorld, Binomial Coefficient', url: 'https://mathworld.wolfram.com/BinomialCoefficient.html' },
        { label: 'NIST Digital Library of Mathematical Functions, §26.1 Combinatorial Analysis: Combinations', url: 'https://dlmf.nist.gov/26.1' }
      ]
    },
    inputs: [
      { id: 'n', label: 'n (items available)', type: 'number', placeholder: '52', defaultValue: 52, step: 1, min: 0 },
      { id: 'r', label: 'r (items chosen)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'combinations',
      headlineLabel: 'nCr (without repetition)',
      outputs: [
        { id: 'combinations', label: 'nCr (without repetition)', format: 'significant' },
        { id: 'digitCount', label: 'Exact digit count', format: 'integer' },
        { id: 'combinationsWithRepetition', label: 'With repetition (multiset)', format: 'significant' },
        { id: 'digitCountWithRepetition', label: 'Exact digit count (with repetition)', format: 'integer' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'combinations', label: 'Without repetition (nCr)' }, { from: 'combinationsWithRepetition', label: 'With repetition' }],
        title: 'Without vs. with repetition',
        highlight: 0
      }
    },
    seo: {
      title: 'Combination Calculator – nCr, Exact Integer Math',
      description: 'Free combination calculator. Find nCr ("n choose r") and the with-repetition count for any n and r up to 1,000, with exact integer arithmetic and digit counts.',
      faq: [
        { question: 'How do I calculate a combination?', answer: 'Divide nPr by r!: nCr = n! ÷ (r! × (n−r)!). For a 52-card deck choosing 5 cards, 52C5 = 2,598,960.' },
        { question: 'What is the difference between a combination and a permutation?', answer: 'A combination (nCr) counts selections where order does not matter; a permutation (nPr) counts arrangements where it does. nPr = nCr × r! — permutations are always the larger (or equal) count.' },
        { question: 'What does nCr mean when r is greater than n?', answer: 'It is 0 — you cannot choose more distinct items than you have without repeating one. This calculator reports 0 rather than treating it as an error.' },
        { question: 'What is a combination with repetition?', answer: 'If the same item can be chosen more than once and order still does not matter — 2 scoops of ice cream from 3 flavors, where two scoops of the same flavor is valid — the count is the "multiset coefficient" C(n + r − 1, r), a different and larger number than plain nCr.' },
        { question: 'What is 49 choose 6?', answer: '49C6 = 13,983,816 — the number of possible 6-number combinations in a classic lottery format.' },
        { question: 'What is nCr when r = 0?', answer: '1 — there is exactly one way to choose nothing, the empty selection.' },
        { question: 'How large an n or r can this calculator handle?', answer: 'Up to 1,000 for each, computed with exact integer (BigInt) arithmetic. Past about 2^53 − 1, the displayed headline number is a correctly-rounded approximation rather than the exact integer, but the digit count stays exact.' },
        { question: 'Can n or r be negative or a decimal?', answer: 'Combinations are only defined for non-negative whole numbers. A decimal is rounded to the nearest whole number first; a negative value gives no answer.' }
      ]
    },
    compute(values) {
      const n = Math.round(values.n);
      const r = Math.round(values.r);
      const noAnswer = { combinations: NaN, digitCount: NaN, combinationsWithRepetition: NaN, digitCountWithRepetition: NaN };
      if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || n > COUNTING_MAX_N || r > COUNTING_MAX_N) return noAnswer;
      const without = bigToDisplay(nCrBig(n, r));
      // Multiset coefficient C(n+r-1, r), special-cased at n=0: choosing nothing (r=0) is always the
      // one "empty selection" even from zero types, but choosing any r > 0 items from zero types is
      // impossible — n+r-1 would be -1 there, which nCrBig does not need to handle as a real input.
      const withRepetitionBig = r === 0 ? 1n : n === 0 ? 0n : nCrBig(n + r - 1, r);
      const withRepetition = bigToDisplay(withRepetitionBig);
      return {
        combinations: without.value,
        digitCount: without.digitCount,
        combinationsWithRepetition: withRepetition.value,
        digitCountWithRepetition: withRepetition.digitCount
      };
    }
  },
  {
    id: 'binomial-distribution-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['binomial probability calculator', 'binomial distribution calculator', 'binomial pmf calculator', 'binomial cdf calculator'],
    related: ['combination-calculator', 'normal-distribution-calculator', 'probability-calculator', 'z-score-calculator'],
    title: 'Binomial Distribution Calculator',
    description: 'Find P(X = k), P(X ≤ k) and P(X ≥ k) for a binomial distribution with n trials and success probability p, plus its mean and standard deviation, exact to double precision for n up to 1,000,000.',
    example: 'Flip a fair coin 10 times. The probability of exactly 6 heads is about 20.51%, and the probability of 6 or more heads is about 37.70%.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a binomial distribution?',
        paragraphs: [
          'A binomial distribution describes the number of successes in a fixed number of independent trials, n, each with the same probability of success, p — a coin flipped 10 times, a product tested off a line with a known defect rate, or a fixed number of survey respondents each independently answering yes or no. The random outcome, X, is the count of successes, which can be anywhere from 0 to n.',
          'Three questions come up constantly: the exact probability of a specific count (P(X = k), the probability mass function), the probability of k or fewer successes (P(X ≤ k)), and the probability of k or more (P(X ≥ k)). All three follow from the same underlying formula, which involves the binomial coefficient nCr (see the combination calculator) weighting how many different orders give the same count of successes.',
          'This calculator keeps full precision even for a large n (into the hundreds of thousands or more) using two different numerically careful methods rather than the naive textbook formula, which breaks down well before that: P(X = k) uses a saddle-point algorithm (Loader, 2000 — the same method R\'s own dbinom function uses) that avoids the digit-cancellation a direct factorial-based calculation runs into once n is large, and P(X ≤ k)/P(X ≥ k) are each computed directly from the regularized incomplete beta function — never by summing potentially millions of individual terms one at a time, and never by subtracting a probability from 1 once that probability is already extremely small (which would lose precision exactly where it matters most). See "Watch out" below for this calculator\'s proven accuracy range and its practical cap on n.'
        ]
      },
      howTo: {
        intro: 'Enter the number of trials, the probability of success per trial, and the number of successes you want to find a probability for.',
        steps: [
          { name: 'Enter the number of trials (n)', text: 'How many independent trials there are in total.' },
          { name: 'Enter the probability of success (p)', text: 'The chance of success on any single trial, the same for every trial, as a percentage.' },
          { name: 'Enter the number of successes (k)', text: 'The specific count of successes the probabilities below are calculated around.' },
          { name: 'Read P(X = k)', text: 'The headline is the exact probability of getting precisely k successes, no more and no fewer.' },
          { name: 'Check the cumulative probabilities', text: 'The rows below show P(X ≤ k) (k or fewer successes) and P(X ≥ k) (k or more), plus the distribution\'s mean (np) and standard deviation.' },
          { name: 'Read the chart', text: 'The bar shows where P(X = k) falls against common statistical-significance thresholds — the same bands the p-value calculator uses, since a binomial tail probability is often itself used as a p-value.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The probability mass function, and the mean and standard deviation that follow directly from it.',
        expression: 'P(X = k) = nCk × pᵏ × (1 − p)ⁿ⁻ᵏ\nMean = np\nStandard deviation = √(np(1 − p))',
        terms: [
          { symbol: 'n', meaning: 'The number of independent trials.' },
          { symbol: 'p', meaning: 'The probability of success on each trial, the same every time.' },
          { symbol: 'k', meaning: 'The number of successes being asked about, from 0 to n.' },
          { symbol: 'nCk', meaning: 'The number of ways k successes can be arranged among n trials — see the combination calculator.' }
        ],
        note: 'This calculator does not evaluate nCk × pᵏ × (1 − p)ⁿ⁻ᵏ directly — for a large n that formula needs a huge binomial coefficient and a tiny probability to cancel out to many more digits of precision than a standard number can hold, which loses accuracy well before n reaches even a few thousand. It instead uses a saddle-point algorithm (Loader, 2000) that regroups the same underlying arithmetic into pieces that never individually blow up or lose precision, giving the identical mathematical answer but computed in a numerically safe way.'
      },
      workedExample: {
        intro: 'A fair coin (p = 50%) is flipped n = 10 times. Find the probability of exactly 6 heads, and of 6 or more.',
        rows: [
          { label: 'nCk = 10C6', value: '210' },
          { label: 'P(X = 6) = 210 × 0.5⁶ × 0.5⁴', value: '210 ÷ 1024 ≈ 0.205078, i.e. ≈ 20.51%' },
          { label: 'P(X ≤ 6) (6 or fewer heads)', value: '848 ÷ 1024 = 0.828125, i.e. 82.81%' },
          { label: 'P(X ≥ 6) (6 or more heads)', value: '386 ÷ 1024 = 0.376953, i.e. ≈ 37.70%' },
          { label: 'Mean (10 × 0.5) and standard deviation (√(10 × 0.5 × 0.5))', value: '5 heads, ≈ 1.58 heads' }
        ],
        result: 'P(X=6) ≈ 20.51%, P(X≥6) ≈ 37.70%',
        explanation: 'Because p = 0.5 exactly, every one of these probabilities is a simple fraction with denominator 1,024 = 2¹⁰, which is why they check out to clean values here — for any other p, the same formula still applies but rarely lands on such tidy fractions.'
      },
      watchOut: [
        { title: 'P(X ≤ k) and P(X ≥ k) overlap by exactly P(X = k)', body: 'They are not complementary on their own — P(X ≤ k) + P(X ≥ k) = 1 + P(X = k), not 1, because both ranges include k itself. P(X ≤ k) and P(X ≥ k + 1) are the pair that actually add to exactly 1.' },
        { title: 'For a large n and an extreme k, the probability can be far smaller than it looks', body: 'With n = 1,000 fair coin flips, P(X ≥ 600) is only about 1.364 × 10⁻¹⁰ — vanishingly small, even though 600 out of 1,000 (60%) does not sound especially extreme at a glance. This calculator computes that figure directly, in scientific notation, rather than rounding it to a misleading 0.' },
        { title: 'This assumes every trial has the same, fixed probability of success', body: 'If the success probability changes between trials, or the trials are not independent of each other, the binomial distribution — and every formula on this page — no longer applies.' },
        { title: 'This calculator has a practical cap of n = 1,000,000 trials, chosen because it is where accuracy was actually verified', body: 'Every figure this calculator produces for n up to 1,000,000 has been checked against independent references to within 1 part in a billion (see this page\'s own development notes for the full verification). Above that cap, this calculator shows no answer rather than quietly extrapolating past where it has been checked.' },
        { title: 'n and k must be whole numbers — a decimal is refused, not rounded', body: 'Typing 10.5 trials or 6.5 successes shows no answer rather than silently rounding to the nearest whole number, since rounding first would answer a different question than the one actually typed in.' },
        { title: 'k greater than n is 0 or 1 by definition, not an error — but a negative k is refused', body: 'Asking for more successes than there are trials is a well-defined, always-impossible question: P(X = k) is 0, P(X ≤ k) is 1, and P(X ≥ k) is 0 whenever k > n, the same "0 by convention" rule this site\'s permutation and combination calculators use for choosing more items than exist. A negative k, by contrast, is not a valid count of successes at all, so this calculator shows no answer for one rather than picking an arbitrary convention for it.' },
        { title: 'p = 0% or p = 100% are edge cases, not errors', body: 'At p = 0%, X is always exactly 0, so P(X = k) is exactly 0 for every other k — shown as a genuine 0, never rounded up to a misleadingly tiny nonzero number. At p = 100%, X is always exactly n, handled the same way.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §4.3 Binomial Distribution', url: 'https://openstax.org/books/introductory-statistics-2e/pages/4-3-binomial-distribution' },
        { label: 'NIST Digital Library of Mathematical Functions, §8.17 Incomplete Beta Function: Relation to the Binomial Distribution', url: 'https://dlmf.nist.gov/8.17' },
        { label: 'Catherine Loader, "Fast and Accurate Computation of Binomial Probabilities" (R technical report) — the saddle-point algorithm this calculator\'s P(X = k) uses, also the basis of R\'s dbinom function', url: 'https://www.r-project.org/doc/reports/CLoader-dbinom-2002.pdf' },
        { label: 'Wolfram MathWorld, Binomial Distribution', url: 'https://mathworld.wolfram.com/BinomialDistribution.html' }
      ]
    },
    inputs: [
      { id: 'trials', label: 'Number of trials (n)', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'probability', label: 'Probability of success (p)', type: 'percent', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'successes', label: 'Number of successes (k)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'pmfAtK',
      headlineLabel: 'P(X = k)',
      outputs: [
        { id: 'pmfAtK', label: 'P(X = k)', format: 'significant' },
        { id: 'cdfAtK', label: 'P(X ≤ k)', format: 'significant' },
        { id: 'sfAtK', label: 'P(X ≥ k)', format: 'significant' },
        { id: 'mean', label: 'Mean (np)', format: 'significant' },
        { id: 'standardDeviation', label: 'Standard deviation', format: 'significant' }
      ],
      visual: {
        type: 'rangeBar',
        value: 'pmfAtK',
        bands: [
          { label: 'Highly significant', min: 0, max: 0.01 },
          { label: 'Significant', min: 0.01, max: 0.05 },
          { label: 'Marginally significant', min: 0.05, max: 0.1 },
          { label: 'Not significant', min: 0.1, max: 1 }
        ],
        title: 'Where P(X = k) falls (common thresholds)',
        valueLabel: 'Your P(X = k)'
      }
    },
    seo: {
      title: 'Binomial Distribution Calculator – PMF & CDF',
      description: 'Free binomial distribution calculator. Find P(X = k), P(X ≤ k) and P(X ≥ k), plus mean and standard deviation, accurate for n up to 1,000,000.',
      faq: [
        { question: 'How do I calculate a binomial probability?', answer: 'P(X = k) = nCk × pᵏ × (1 − p)ⁿ⁻ᵏ. For n = 10 fair coin flips and k = 6, that is 210 × 0.5⁶ × 0.5⁴ ≈ 0.2051, or about 20.51%. (This calculator does not evaluate that formula directly for larger n — see the next question.)' },
        { question: 'What is the difference between P(X = k), P(X ≤ k) and P(X ≥ k)?', answer: 'P(X = k) is the probability of exactly k successes. P(X ≤ k) adds up every count from 0 through k. P(X ≥ k) adds up every count from k through n. The two cumulative figures overlap at k itself.' },
        { question: 'What is the mean of a binomial distribution?', answer: 'np — the number of trials times the success probability. For 10 flips of a fair coin, the mean is 10 × 0.5 = 5 heads.' },
        { question: 'What is the standard deviation of a binomial distribution?', answer: '√(np(1 − p)). For 10 flips of a fair coin, that is √(10 × 0.5 × 0.5) = √2.5 ≈ 1.58 heads.' },
        { question: 'Can this calculator handle a very large number of trials?', answer: 'Yes, up to n = 1,000,000 — the largest n this calculator\'s accuracy was actually checked against independent references. P(X = k) uses Catherine Loader\'s saddle-point algorithm (the same one R\'s dbinom function uses) rather than the textbook formula, which loses accuracy for even a moderately large n; P(X ≤ k) and P(X ≥ k) are computed directly from the incomplete beta function rather than summed term by term.' },
        { question: 'Why is my probability shown in scientific notation?', answer: 'Binomial tail probabilities can become extremely small for a large n and an extreme k — for example, P(X ≥ 600) out of 1,000 fair coin flips is only about 1.364 × 10⁻¹⁰. This calculator shows that honestly rather than rounding it to a misleading 0.' },
        { question: 'What if p is 0% or 100%, or I enter a decimal number of trials or successes?', answer: 'At p = 0%, the outcome is always 0 successes, so P(X = k) for any other k is a genuine, exact 0 (never a tiny nonzero number); at p = 100%, it is always n successes, handled the same way. A decimal count — 10.5 trials or 6.5 successes — is not a valid input at all, so this calculator shows no answer rather than silently rounding it to a different question than the one actually typed in.' },
        { question: 'How is this related to the combination calculator?', answer: 'The binomial coefficient nCk inside the binomial probability formula is exactly what the combination calculator computes — it counts how many different orders of trials produce the same number of successes.' }
      ]
    },
    compute(values) {
      const n = values.trials;
      const k = values.successes;
      const p = Math.min(100, Math.max(0, values.probability)) / 100;
      const noAnswer = { pmfAtK: NaN, cdfAtK: NaN, sfAtK: NaN, mean: NaN, standardDeviation: NaN };
      // n and k must already be non-negative integers — silently rounding a typed-in 10.5 would
      // answer a different question than the one actually asked, a real bug a pre-merge review of
      // PR #24 found (Math.round(10.5) silently became 11). k > n is still a valid, well-defined
      // question (0 by convention, handled inside binomialPmf/Cdf/Sf — see their own comments and
      // this page's watch-out item), not refused here; only a genuinely invalid n or k is.
      if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || n > BINOMIAL_MAX_N) return noAnswer;
      return {
        pmfAtK: floorNonzeroProbability(binomialPmf(n, k, p)),
        cdfAtK: floorNonzeroProbability(binomialCdf(n, k, p)),
        sfAtK: floorNonzeroProbability(binomialSf(n, k, p)),
        mean: n * p,
        standardDeviation: Math.sqrt(n * p * (1 - p))
      };
    }
  },
  {
    id: 'normal-distribution-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['normal distribution calculator', 'gaussian distribution calculator', 'bell curve calculator', 'normal probability calculator'],
    related: ['z-score-calculator', 'binomial-distribution-calculator', 'percentile-calculator', 'standard-deviation-calculator'],
    title: 'Normal Distribution Calculator',
    description: 'Find probabilities and percentiles for a normal distribution, given its mean and standard deviation: P(X < x), P(X > x), P(a < X < b), the z-score, and the value at any percentile.',
    example: 'IQ scores are normal with mean 100 and standard deviation 15. A score of 115 has a z-score of 1, and about 84.13% of scores fall below it.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a normal distribution?',
        paragraphs: [
          'The normal (or Gaussian) distribution is the familiar symmetric, bell-shaped curve that many real-world measurements approximately follow — heights, measurement errors, IQ scores, and many manufacturing tolerances among them. It is fully described by just two numbers: its mean (μ), where the curve is centered, and its standard deviation (σ), which controls how spread out it is.',
          'This calculator answers the questions that come up most often once you have those two numbers and a value of interest: what fraction of the distribution lies below a value (P(X < x)), above it (P(X > x)), or between two values (P(a < X < b)); how many standard deviations a value is from the mean (its z-score, the same calculation the z-score calculator performs on its own); and, working backward, what value corresponds to a given percentile.',
          'All of it is built from the cumulative distribution function (CDF) of the standard normal distribution, the same function behind this site\'s confidence interval, margin of error and p-value calculators — just applied here directly to a mean and standard deviation of your choosing rather than to a sample statistic.'
        ]
      },
      howTo: {
        intro: 'Enter the distribution\'s mean and standard deviation, then any value, range or percentile you want to check.',
        steps: [
          { name: 'Enter the mean and standard deviation', text: 'These two numbers fully describe the normal distribution being used.' },
          { name: 'Enter a value (x)', text: 'The headline shows what fraction of the distribution falls below this value, plus its z-score.' },
          { name: 'Enter a range (a and b)', text: 'A separate row shows the probability of falling between these two values — in either order, this calculator sorts them automatically.' },
          { name: 'Enter a percentile', text: 'A separate row works backward from a percentile (0 to 100) to the value at that point in the distribution.' },
          { name: 'Read the chart', text: 'The bar shows where your value\'s z-score falls against five bands from far below to far above average, the same bands the z-score calculator uses.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Every probability here comes from the standard normal CDF, Φ, applied to a z-score.',
        expression: 'z = (x − μ) ÷ σ\nP(X < x) = Φ(z)\nP(X > x) = 1 − Φ(z)\nP(a < X < b) = Φ(zᵦ) − Φ(zₐ)\nx at percentile p = μ + Φ⁻¹(p ÷ 100) × σ',
        terms: [
          { symbol: 'μ (mean), σ (standard deviation)', meaning: 'The two numbers that fully describe this normal distribution.' },
          { symbol: 'Φ', meaning: 'The standard normal cumulative distribution function — the probability of being below a given z-score.' },
          { symbol: 'Φ⁻¹', meaning: 'Its inverse: the z-score below which a given probability of the distribution falls.' }
        ],
        note: 'P(X > x) is computed directly as its own tail probability, not as 1 − Φ(z) — the two give the same mathematical answer, but computing the tail directly avoids losing precision for a value far out in the tail, where Φ(z) rounds to a number indistinguishable from 1 in ordinary floating-point arithmetic.'
      },
      workedExample: {
        intro: 'IQ scores are modeled as normal with mean μ = 100 and standard deviation σ = 15. Find how a score of x = 115 compares, and the 90th-percentile score.',
        rows: [
          { label: 'z = (115 − 100) ÷ 15', value: '1' },
          { label: 'P(X < 115) = Φ(1)', value: '≈ 0.8413, i.e. ≈ 84.13%' },
          { label: 'P(X > 115) = 1 − Φ(1), computed directly', value: '≈ 0.1587, i.e. ≈ 15.87%' },
          { label: 'P(85 < X < 115) (within 1 standard deviation of the mean)', value: '≈ 0.6827, i.e. ≈ 68.27%' },
          { label: 'Score at the 90th percentile: 100 + Φ⁻¹(0.90) × 15', value: '≈ 119.22' }
        ],
        result: 'z = 1, P(X < 115) ≈ 84.13%, 90th percentile ≈ 119.22',
        explanation: 'A score of 115 sits exactly one standard deviation above average — the same "68-95-99.7 rule" behind the ≈ 68.27% figure for the range 85 to 115, the well-known statement that about 68% of a normal distribution falls within one standard deviation of its mean.'
      },
      watchOut: [
        { title: 'This assumes the data actually is approximately normal', body: 'Not every real-world measurement is — heavily skewed data (like income) is a common example where a normal-distribution model gives a misleading answer. Check that assumption before trusting the result.' },
        { title: 'A and b are automatically sorted for you', body: 'If you enter a larger number in the "lower bound" field than the "upper bound" field, this calculator swaps them before calculating P(a < X < b), rather than returning a nonsensical negative probability.' },
        { title: 'The standard deviation must be a positive number', body: 'A standard deviation of zero would mean every value is identical (no distribution at all), and a negative one is not mathematically meaningful. This calculator shows no answer for either.' },
        { title: 'The percentile field is clamped between 0.01% and 99.99%', body: 'A value of exactly 0% or 100% would correspond to negative or positive infinity, which has no useful numeric answer, so this calculator treats anything at or beyond those limits as the nearest valid percentage.' },
        { title: 'Deep-tail probabilities are computed directly, never by subtracting from 1', body: 'For an extreme value (several standard deviations out), computing P(X > x) as "1 minus a number very close to 1" would lose almost all of its meaningful digits. This calculator computes that tail probability directly instead, the same approach this site\'s p-value calculator uses.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §6.1 The Standard Normal Distribution', url: 'https://openstax.org/books/introductory-statistics-2e/pages/6-1-the-standard-normal-distribution' },
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.6.6.1 Normal Distribution', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm' },
        { label: 'Wolfram MathWorld, Normal Distribution', url: 'https://mathworld.wolfram.com/NormalDistribution.html' }
      ]
    },
    inputs: [
      { id: 'mean', label: 'Mean (μ)', type: 'number', placeholder: '100', defaultValue: 100, step: 1 },
      { id: 'standardDeviation', label: 'Standard deviation (σ)', type: 'number', placeholder: '15', defaultValue: 15, step: 1, min: 0 },
      { id: 'x', label: 'Value (x)', type: 'number', placeholder: '115', defaultValue: 115, step: 1 },
      { id: 'lowerBound', label: 'Range lower bound (a)', type: 'number', placeholder: '85', defaultValue: 85, step: 1 },
      { id: 'upperBound', label: 'Range upper bound (b)', type: 'number', placeholder: '115', defaultValue: 115, step: 1 },
      { id: 'percentile', label: 'Percentile', type: 'percent', placeholder: '90', defaultValue: 90, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'pLessThanX',
      headlineLabel: 'P(X < x)',
      outputs: [
        { id: 'pLessThanX', label: 'P(X < x)', format: 'significant' },
        { id: 'pGreaterThanX', label: 'P(X > x)', format: 'significant' },
        { id: 'zScore', label: 'Z-score of x', format: 'significant' },
        { id: 'pBetween', label: 'P(a < X < b)', format: 'significant' },
        { id: 'xAtPercentile', label: 'Value at the chosen percentile', format: 'significant' }
      ],
      groups: [
        { inputs: ['mean', 'standardDeviation'] },
        { inputs: ['x'] },
        { title: 'A range (optional)', inputs: ['lowerBound', 'upperBound'], optional: true },
        { title: 'A percentile, worked backward (optional)', inputs: ['percentile'], optional: true }
      ],
      visual: {
        type: 'rangeBar',
        value: 'zScore',
        bands: [
          { label: 'Far below average', min: -4, max: -2 },
          { label: 'Below average', min: -2, max: -1 },
          { label: 'Typical (within 1 SD)', min: -1, max: 1 },
          { label: 'Above average', min: 1, max: 2 },
          { label: 'Far above average', min: 2, max: 4 }
        ],
        title: 'Where x falls',
        valueLabel: 'Z-score of x'
      }
    },
    seo: {
      title: 'Normal Distribution Calculator – Probability & Percentile',
      description: 'Free normal distribution calculator. Find P(X < x), P(X > x), P(a < X < b), the z-score, and the value at any percentile, from a mean and standard deviation.',
      faq: [
        { question: 'How do I find a probability from a normal distribution?', answer: 'Convert the value to a z-score, z = (x − μ) ÷ σ, then look up (or compute directly) the standard normal CDF at that z. For μ = 100, σ = 15, x = 115: z = 1, and P(X < 115) ≈ 84.13%.' },
        { question: 'How do I find the value at a given percentile?', answer: 'Use the inverse CDF: x = μ + Φ⁻¹(p ÷ 100) × σ. For the 90th percentile with μ = 100, σ = 15, that is 100 + 1.2816 × 15 ≈ 119.22.' },
        { question: 'What is the 68-95-99.7 rule?', answer: 'For any normal distribution, about 68% of values fall within 1 standard deviation of the mean, about 95% within 2, and about 99.7% within 3 — this calculator computes the exact figure for any range you enter, not just those three.' },
        { question: 'What is the difference between this and the z-score calculator?', answer: 'The z-score calculator solves z = (x − μ) ÷ σ for any one of its four variables. This calculator takes that same z-score further, converting it into actual probabilities and percentiles.' },
        { question: 'Why is P(X > x) not just 1 − P(X < x) here?', answer: "Mathematically they are equal, but this calculator computes P(X > x) directly rather than subtracting from 1, which avoids a precision loss that shows up specifically for values several standard deviations from the mean." },
        { question: 'What if my lower bound is bigger than my upper bound?', answer: 'This calculator automatically swaps them before calculating the probability between them, so the range is always treated correctly regardless of which order you typed them in.' },
        { question: 'Can the standard deviation be 0 or negative?', answer: 'No — a standard deviation of 0 means there is no spread at all (every value would be identical), and a negative one is not meaningful. This calculator shows no answer for either.' },
        { question: 'Does this assume my data is normally distributed?', answer: 'Yes — every calculation on this page assumes the data genuinely follows a normal distribution. For skewed data, a percentile calculated directly from the raw data (see the percentile calculator) is more honest than one derived from a normal-distribution assumption.' }
      ]
    },
    compute(values) {
      const { mean, standardDeviation, x, percentile } = values;
      const noAnswer = { pLessThanX: NaN, pGreaterThanX: NaN, zScore: NaN, pBetween: NaN, xAtPercentile: NaN };
      if (!(standardDeviation > 0)) return noAnswer;
      const zScore = (x - mean) / standardDeviation;
      const pLessThanX = normalCDF(zScore);
      const pGreaterThanX = normalSF(zScore);

      const lo = Math.min(values.lowerBound, values.upperBound);
      const hi = Math.max(values.lowerBound, values.upperBound);
      const zLo = (lo - mean) / standardDeviation;
      const zHi = (hi - mean) / standardDeviation;
      // P(a < X < b) as a difference of two tails on the SAME side of the mean, never a difference of
      // two values both close to 1 (or both close to 0 in magnitude but on opposite sides) — see the
      // module comment on normalSF in lib/distributions.ts for why this ordering avoids cancellation.
      const pBetween = zLo >= 0 && zHi >= 0 ? normalSF(zLo) - normalSF(zHi) : normalCDF(zHi) - normalCDF(zLo);

      const clampedPercentile = Math.min(99.99, Math.max(0.01, percentile));
      const xAtPercentile = mean + normalInverseCDF(clampedPercentile / 100) * standardDeviation;

      return { pLessThanX, pGreaterThanX, zScore, pBetween, xAtPercentile };
    }
  },
  {
    id: 'correlation-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['correlation calculator', 'pearson correlation calculator', 'correlation coefficient calculator', 'r value calculator'],
    related: ['linear-regression-calculator', 'standard-deviation-calculator', 'mean-median-mode-calculator', 'p-value-calculator'],
    title: 'Correlation Coefficient Calculator',
    description: 'Find the Pearson correlation coefficient (r), r² and a p-value for a pair of x and y lists — how strongly two variables move together, and whether that relationship is likely to be real.',
    example: 'Six students\' study hours (2, 3, 5, 7, 8, 9) and exam scores (65, 70, 75, 85, 88, 95) have a Pearson correlation of r ≈ 0.9926 — a very strong positive relationship.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is the correlation coefficient?',
        paragraphs: [
          'The Pearson correlation coefficient, r, measures how strongly two variables move together in a straight-line sense. It always falls between −1 and +1: +1 means the two variables increase together perfectly, −1 means one increases exactly as the other decreases, and 0 means there is no linear relationship at all between them (though a strong non-linear one could still exist and go undetected by r).',
          'This calculator finds the Pearson correlation specifically — the standard, most widely used correlation measure, built on the actual values of your data. It is not the Spearman rank correlation, a different, related measure that works on the rank order of the data instead of the raw values and is more resistant to outliers and to relationships that are monotonic but not straight-line. If your data has extreme outliers or a clearly curved relationship, a Spearman correlation (not computed here) can tell a more honest story.',
          'r² (r squared), also called the coefficient of determination, restates the same relationship as the share of the variation in y that is "explained" by its straight-line relationship with x. An r of 0.99 sounds almost perfect, but r² = 0.98 is the number that says 98% of y\'s variation lines up with x.',
          'A correlation this strong is also unlikely to show up in a genuinely unrelated pair of variables by pure chance, which is what this calculator\'s p-value measures: the probability of seeing a correlation at least this strong, in either direction, if the true relationship were actually zero.'
        ]
      },
      howTo: {
        intro: 'Paste your x-values and y-values, keeping each y lined up with its matching x.',
        steps: [
          { name: 'Paste the x-values', text: 'Enter the first variable\'s values, in the box, separated by commas, spaces, semicolons or new lines.' },
          { name: 'Paste the y-values, in the same order', text: 'Enter the second variable\'s values directly below, one for every x-value, in the same order — the first y pairs with the first x, and so on.' },
          { name: 'Check the counts match', text: 'Each box shows a live count of numbers it understood. If the two counts differ, the result area says so explicitly and shows no answer — nothing is cut off or padded to force a result.' },
          { name: 'Read r', text: 'The headline is the Pearson correlation coefficient, from −1 to +1.' },
          { name: 'Check r² and the p-value', text: 'r² restates the strength as a share of variation explained; the p-value says how likely a correlation this strong is by chance alone if x and y were truly unrelated.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Pearson\'s r compares how x and y vary together (their covariance) to how much each varies on its own.',
        expression: 'r = Σ(x − x̄)(y − ȳ) ÷ √[Σ(x − x̄)² × Σ(y − ȳ)²]\nt = r × √[(n − 2) ÷ (1 − r²)],  df = n − 2',
        terms: [
          { symbol: 'x̄, ȳ', meaning: 'The mean of the x-values and of the y-values.' },
          { symbol: 'n', meaning: 'The number of paired (x, y) points.' },
          { symbol: 't, df', meaning: 'The t-statistic used to test whether r is significantly different from 0, and its degrees of freedom.' }
        ],
        note: 'The p-value comes from the t-distribution with n − 2 degrees of freedom (the standard test for Pearson\'s r), computed directly rather than read from a table.'
      },
      workedExample: {
        intro: 'Six students report their weekly study hours (x) and their exam score out of 100 (y): (2, 65), (3, 70), (5, 75), (7, 85), (8, 88), (9, 95).',
        rows: [
          { label: 'Mean x̄', value: '5.6667' },
          { label: 'Mean ȳ', value: '79.6667' },
          { label: 'Σ(x − x̄)(y − ȳ)', value: '≈ 160.3333' },
          { label: 'Σ(x − x̄)²', value: '≈ 39.3333' },
          { label: 'Σ(y − ȳ)²', value: '≈ 663.3333' },
          { label: 'r = 160.3333 ÷ √(39.3333 × 663.3333)', value: '≈ 0.9926' }
        ],
        result: 'r ≈ 0.9926, r² ≈ 0.9853, p-value ≈ 8.177 × 10⁻⁵',
        explanation: 'r is close to +1: more study hours line up very closely with higher exam scores in this small data set. r² says about 98.5% of the variation in exam scores lines up with study hours. The tiny p-value says a correlation this strong would be very unlikely to appear by chance if study hours and exam scores were truly unrelated — though with only 6 students, this is a small, illustrative sample, not proof that studying causes a higher score.'
      },
      watchOut: [
        { title: 'Correlation is not causation', body: 'A strong r only says two variables move together, never that one causes the other. Both could be driven by a third factor, or the relationship could run the other way, or it could simply be a coincidence in a small sample.' },
        { title: 'This measures a straight-line relationship only', body: 'Two variables can have a strong, obvious curved relationship (like a U-shape) and still show an r close to 0, because Pearson\'s r only detects the straight-line part of how they move together. Always look at a plot of the actual data, not just the number.' },
        { title: 'Your x and y lists must be the same length', body: 'Every x-value needs exactly one matching y-value, in the same order. If the two lists have different counts, this calculator shows no answer rather than guessing by cutting off the extra values or padding the shorter list.' },
        { title: 'A p-value needs at least 3 pairs', body: 'The significance test needs n − 2 degrees of freedom to be at least 1, so with only 2 points, r is still computed (and is always exactly +1 or −1 for 2 points, since any 2 points lie on a line) but the p-value is not meaningful and shows no answer.' },
        { title: 'This is Pearson\'s r, not Spearman\'s', body: 'If your data has strong outliers or a relationship that is monotonic but not straight ("always increasing, but curving"), a Spearman rank correlation is often more honest — this calculator does not compute it.' },
        { title: 'A perfect fit (r = +1 or −1) shows the t-statistic as "—", not an error', body: 'When every point lies exactly on a straight line, the t-statistic used for the p-value is mathematically infinite, which this site displays the same way as any other no-answer case: a dash. The p-value, however, is a genuine, exact 0 in that case (not a tiny underflowed number), because a correlation this perfect could not happen by chance at all.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §12.4 The Regression Equation (covers r and its significance test)', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-4-the-regression-equation' },
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §6.5.5 Measures of Correlation', url: 'https://www.itl.nist.gov/div898/handbook/pmc/section5/pmc55.htm' },
        { label: 'Wolfram MathWorld, Correlation Coefficient', url: 'https://mathworld.wolfram.com/CorrelationCoefficient.html' }
      ]
    },
    inputs: pairedListInputs([2, 3, 5, 7, 8, 9], [65, 70, 75, 85, 88, 95], 2),
    breakdown: {
      headline: 'r',
      headlineLabel: 'Correlation coefficient (r)',
      outputs: [
        { id: 'r', label: 'Correlation coefficient (r)', format: 'number' },
        { id: 'rSquared', label: 'r² (share of variation explained)', format: 'number' },
        { id: 'pValue', label: 'P-value (two-tailed)', format: 'significant' },
        { id: 'tStatistic', label: 't-statistic', format: 'number' },
        { id: 'degreesOfFreedom', label: 'Degrees of freedom (n − 2)', format: 'integer' },
        { id: 'count', label: 'Number of pairs (n)', format: 'integer' }
      ],
      pairedLists: ['xData', 'yData'],
      visual: {
        type: 'rangeBar',
        value: 'r',
        bands: [
          { label: 'Strong negative', min: -1, max: -0.7 },
          { label: 'Moderate negative', min: -0.7, max: -0.3 },
          { label: 'Weak or none', min: -0.3, max: 0.3 },
          { label: 'Moderate positive', min: 0.3, max: 0.7 },
          { label: 'Strong positive', min: 0.7, max: 1.0000001 }
        ],
        title: 'How strong is the relationship?',
        valueLabel: 'r'
      }
    },
    seo: {
      title: 'Correlation Calculator – Pearson r, r², P-value',
      description: 'Free correlation coefficient calculator. Paste paired x and y lists to find Pearson\'s r, r² and a p-value, computed with numerically stable, mean-centered sums.',
      faq: [
        { question: 'How do I calculate the correlation coefficient?', answer: 'Center both lists on their own means, then divide the sum of the paired products Σ(x−x̄)(y−ȳ) by the square root of Σ(x−x̄)² times Σ(y−ȳ)². For six students\' study hours and scores, that gives r ≈ 0.9926.' },
        { question: 'What does a correlation of 0 mean?', answer: 'It means there is no straight-line relationship detectable between the two variables — not necessarily that they are unrelated, since a strong curved relationship can still produce r ≈ 0.' },
        { question: 'What is the difference between r and r²?', answer: 'r (from −1 to +1) shows the direction and strength of a linear relationship. r² (always 0 to 1) restates the strength as the share of one variable\'s variation that lines up with the other — r = 0.9926 gives r² ≈ 0.9853, meaning about 98.5% of the variation in y lines up with x.' },
        { question: 'Does a strong correlation prove causation?', answer: 'No. A strong r only shows that two variables move together; it says nothing about whether one causes the other, whether a third factor causes both, or whether the pattern is simply a coincidence in a small sample.' },
        { question: 'What does the p-value tell me here?', answer: 'It is the probability of seeing a correlation at least this strong, in either direction, purely by chance, if the true correlation were actually 0. A small p-value (conventionally under 0.05) suggests the relationship is unlikely to be chance alone.' },
        { question: 'What is the smallest sample size this calculator can test?', answer: 'r itself can be computed from as few as 2 pairs (and is always exactly +1 or −1 for exactly 2 points). The p-value needs at least 3 pairs, since its degrees of freedom (n − 2) must be at least 1.' },
        { question: 'What happens if my x and y lists are different lengths?', answer: 'This calculator refuses to guess: it shows no result and a message stating the two counts, rather than silently cutting off extra values or padding the shorter list with anything.' },
        { question: 'Is this the same as the correlation Excel\'s CORREL function gives?', answer: 'Yes — both compute the same Pearson correlation coefficient. This calculator additionally reports r², the t-statistic, and a p-value, which CORREL alone does not.' }
      ]
    },
    compute(_values, lists) {
      const xs = lists.xData;
      const ys = lists.yData;
      const noAnswer = { r: NaN, rSquared: NaN, pValue: NaN, tStatistic: NaN, degreesOfFreedom: NaN, count: NaN };
      if (xs.length !== ys.length) return noAnswer; // honest no-answer, never truncated/padded — see pairedListInputs' comment
      const { n, sxx, syy, sxy } = pairedStats(xs, ys);
      const r = sxy / Math.sqrt(sxx * syy); // 0/0 (zero variance in x or y) is an honest NaN, not a divide-by-zero crash
      const rSquared = r * r;
      const degreesOfFreedom = n - 2;
      const tStatistic = r * Math.sqrt(degreesOfFreedom / (1 - rSquared));
      // Guarded explicitly rather than relying on tSF's own NaN short-circuit: r = +-1 makes
      // tStatistic exactly +-Infinity (a legitimate, finite-producing case for tSF), but a NaN
      // tStatistic (zero variance) must never reach tSF at all, by this function's own contract.
      // Pre-merge review fix (run 4, PR #25): at a perfect fit (r = +-1), tStatistic is +-Infinity
      // and the true p-value is EXACTLY 0 — floorFiniteTailProbability skips the underflow floor in
      // that case (see its own comment above) rather than showing a misleadingly tiny 1e-300.
      const pValue = degreesOfFreedom > 0 && Number.isFinite(rSquared)
        ? floorFiniteTailProbability(2 * tSF(Math.abs(tStatistic), degreesOfFreedom), tStatistic)
        : NaN;
      return { r, rSquared, tStatistic, degreesOfFreedom, pValue, count: n };
    }
  },
  {
    id: 'linear-regression-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['linear regression calculator', 'least squares calculator', 'line of best fit calculator', 'regression equation calculator'],
    related: ['correlation-calculator', 'slope-calculator', 'standard-deviation-calculator', 'p-value-calculator'],
    title: 'Linear Regression Calculator',
    description: 'Find the least-squares line of best fit (slope, intercept, r² and the standard error of the estimate) for a pair of x and y lists, with an optional prediction at any x.',
    example: 'For six students\' study hours (2, 3, 5, 7, 8, 9) and exam scores (65, 70, 75, 85, 88, 95), the line of best fit is y ≈ 56.57 + 4.08x, so 6 hours of study predicts a score of about 81.0.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is linear regression?',
        paragraphs: [
          'Linear regression finds the straight line through a set of (x, y) points that makes the best overall prediction of y from x — specifically, the "least squares" line, the one that minimizes the sum of the squared vertical distances between each actual point and the line. That line is written y = a + bx, where b is the slope (how much y changes for each one-unit increase in x) and a is the intercept (the predicted y when x is 0).',
          'This calculator uses exactly the same paired x/y data as this site\'s correlation calculator, and the two are closely related: the slope of the regression line and Pearson\'s r always have the same sign, and r² here (the share of y\'s variation explained by the line) is the square of the correlation coefficient on that page.',
          'The standard error of the estimate measures how far the actual y-values typically fall from the fitted line — in the same units as y. A small standard error means the line is a tight fit; a large one means the points scatter widely around it even if the slope is clearly nonzero.'
        ]
      },
      howTo: {
        intro: 'Paste your x-values and y-values, keeping each y lined up with its matching x.',
        steps: [
          { name: 'Paste the x-values', text: 'Enter the first variable\'s values — the one you are predicting from.' },
          { name: 'Paste the y-values, in the same order', text: 'Enter the second variable\'s values directly below, one for every x-value, in the same order.' },
          { name: 'Check the counts match', text: 'If the two lists have different counts, the result area says so and shows no answer, rather than guessing.' },
          { name: 'Read the slope and intercept', text: 'The headline is the slope; the intercept row completes the line\'s equation, y = intercept + slope × x.' },
          { name: 'Check r² and the standard error', text: 'r² is the share of y\'s variation the line explains; the standard error of the estimate shows the typical size of the leftover scatter, in y\'s own units.' },
          { name: 'Predict a y-value (optional)', text: 'Change "Predict y at x" to any x-value to see the line\'s predicted y there — it defaults to a value already in the example data.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The least-squares slope and intercept, from the same centered sums the correlation calculator uses.',
        expression: 'slope (b) = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)²\nintercept (a) = ȳ − b × x̄\nstandard error of the estimate = √[(Σ(y − ȳ)² − b × Σ(x − x̄)(y − ȳ)) ÷ (n − 2)]',
        terms: [
          { symbol: 'x̄, ȳ', meaning: 'The mean of the x-values and of the y-values.' },
          { symbol: 'b, a', meaning: 'The fitted line\'s slope and intercept: ŷ = a + bx.' },
          { symbol: 'n', meaning: 'The number of paired (x, y) points.' }
        ],
        note: 'All three sums are computed by centering the data on its own mean first (x[i] − x̄, not the raw x and y values multiplied together), which keeps the result accurate even when x or y themselves are very large numbers.'
      },
      workedExample: {
        intro: 'The same six (study hours, exam score) pairs as the correlation calculator\'s example: (2, 65), (3, 70), (5, 75), (7, 85), (8, 88), (9, 95).',
        rows: [
          { label: 'Slope (b = 160.3333 ÷ 39.3333)', value: '≈ 4.0763' },
          { label: 'Intercept (a = 79.6667 − 4.0763 × 5.6667)', value: '≈ 56.5678' },
          { label: 'r² (same data as the correlation calculator)', value: '≈ 0.9853' },
          { label: 'Standard error of the estimate', value: '≈ 1.5629' },
          { label: 'Predicted y at x = 6', value: '≈ 81.0254' }
        ],
        result: 'y ≈ 56.57 + 4.08x',
        explanation: 'Each extra study hour predicts about 4.08 more points on the exam, starting from a baseline of about 56.57 points at zero hours (an extrapolation — nobody in this small sample studied 0 hours). A student studying 6 hours is predicted to score about 81.0, close to the actual scores of the students who studied 5 and 7 hours.'
      },
      watchOut: [
        { title: 'Your x and y lists must be the same length', body: 'Every x-value needs exactly one matching y-value, in the same order. If the counts differ, this calculator shows no answer rather than cutting off the extra values or padding the shorter list.' },
        { title: 'The intercept can be a meaningless extrapolation', body: 'The intercept is the predicted y at x = 0, even when no data near x = 0 actually exists. Treat it as part of the line\'s equation, not necessarily as a realistic prediction on its own.' },
        { title: 'Predicting far outside your data range is extrapolation', body: 'The fitted line is only tested by the data you gave it. Predicting a y-value for an x far beyond your actual x-values assumes the same straight-line relationship keeps holding, which may not be true.' },
        { title: 'A regression line does not prove x causes y', body: 'Exactly like correlation, a fitted line only describes how the data points relate on average — it does not establish that changing x would actually change y.' },
        { title: 'Zero variance in x has no defined slope', body: 'If every x-value is identical, there is no line to fit (division by zero in the slope formula), so this calculator shows no answer rather than a false result.' },
        { title: 'A standard error of exactly 0 means a perfect fit, not an error', body: 'When every point lies exactly on the fitted line (the same perfect-fit case as r = +1 or −1 on the correlation calculator), the standard error of the estimate is a genuine, correctly computed 0 — every actual y-value matches its predicted value exactly, with no leftover scatter to measure.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §12.3 The Regression Equation', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-3-the-regression-equation' },
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §4.1.4.2 Partitioning the sums of squares (standard error of the estimate)', url: 'https://www.itl.nist.gov/div898/handbook/pri/section1/pri142.htm' },
        { label: 'Wolfram MathWorld, Least Squares Fitting', url: 'https://mathworld.wolfram.com/LeastSquaresFitting.html' }
      ]
    },
    inputs: [
      ...pairedListInputs([2, 3, 5, 7, 8, 9], [65, 70, 75, 85, 88, 95], 2),
      { id: 'predictAtX', label: 'Predict y at x (optional)', type: 'number', placeholder: '6', defaultValue: 6, step: 0.1 }
    ],
    breakdown: {
      headline: 'slope',
      headlineLabel: 'Slope',
      outputs: [
        { id: 'slope', label: 'Slope (b)', format: 'number' },
        { id: 'intercept', label: 'Intercept (a)', format: 'number' },
        { id: 'rSquared', label: 'r² (share of variation explained)', format: 'number' },
        { id: 'standardError', label: 'Standard error of the estimate', format: 'number' },
        { id: 'predictedY', label: 'Predicted y at your chosen x', format: 'number' },
        { id: 'count', label: 'Number of pairs (n)', format: 'integer' }
      ],
      groups: [
        { title: 'Your data', inputs: ['xData', 'yData'] },
        { title: 'Predict y at x (optional)', inputs: ['predictAtX'] }
      ],
      pairedLists: ['xData', 'yData'],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'intercept', label: 'Intercept (a)' }, { from: 'predictedY', label: 'Predicted y' }],
        title: 'The fitted line',
        highlight: 1
      }
    },
    seo: {
      title: 'Linear Regression Calculator – Slope, Intercept, R²',
      description: 'Free linear regression calculator. Paste paired x and y lists to find the least-squares slope, intercept, r² and standard error of the estimate.',
      faq: [
        { question: 'How do I calculate a linear regression line?', answer: 'Center both lists on their own means, find the slope as Σ(x−x̄)(y−ȳ) ÷ Σ(x−x̄)², then the intercept as ȳ minus the slope times x̄. For six students\' study hours and scores, that gives y ≈ 56.57 + 4.08x.' },
        { question: 'What does the slope mean?', answer: 'It is the predicted change in y for every one-unit increase in x. A slope of 4.08 means each extra hour of study predicts about 4.08 more exam points, on average, for this data.' },
        { question: 'What is the standard error of the estimate?', answer: 'It measures the typical size of the gap between the actual y-values and the line\'s predicted y-values, in y\'s own units — here, about 1.56 exam points.' },
        { question: 'How is this related to the correlation calculator?', answer: 'They use the same underlying sums. r² on this page is exactly the square of the correlation coefficient (r) on that one, and the slope always has the same sign as r.' },
        { question: 'Can I predict a y-value for a new x?', answer: 'Yes — change "Predict y at x" to any value and this calculator applies the fitted line directly. Predictions far outside your actual x-range are extrapolations and less trustworthy.' },
        { question: 'What if my x and y lists are different lengths?', answer: 'This calculator shows no result and states both counts, rather than silently cutting off extra values or padding the shorter list.' },
        { question: 'Does a good fit mean x causes y?', answer: 'No. A strong linear fit only describes how the two variables move together in this data; it does not by itself establish that x causes y.' }
      ]
    },
    compute(values, lists) {
      const xs = lists.xData;
      const ys = lists.yData;
      const noAnswer = { slope: NaN, intercept: NaN, rSquared: NaN, standardError: NaN, predictedY: NaN, count: NaN };
      if (xs.length !== ys.length) return noAnswer; // honest no-answer, never truncated/padded
      const { n, meanX, meanY, sxx, syy, sxy } = pairedStats(xs, ys);
      const slope = sxy / sxx; // 0/0 (zero variance in x) is an honest NaN, not a divide-by-zero crash
      const intercept = meanY - slope * meanX;
      const rSquared = (sxy * sxy) / (sxx * syy);
      const degreesOfFreedom = n - 2;
      const sse = syy - slope * sxy; // Sum of squared residuals, from the same identity as rSquared — never a second, separately-rounded pass over the raw residuals
      const standardError = degreesOfFreedom > 0 ? Math.sqrt(Math.max(sse, 0) / degreesOfFreedom) : NaN;
      const predictedY = intercept + slope * values.predictAtX;
      return { slope, intercept, rSquared, standardError, predictedY, count: n };
    }
  },
  {
    id: 't-test-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['t test calculator', 't-test calculator', 'two sample t test calculator', 'student t test calculator'],
    related: ['p-value-calculator', 'confidence-interval-calculator', 'z-score-calculator', 'standard-error-calculator'],
    title: 'T-Test Calculator',
    description: 'A one-sample or two-sample (Welch) t-test from summary statistics — t-statistic, degrees of freedom and a two-, left- or right-tailed p-value.',
    example: 'Two classes\' test scores — class A: mean 85, sd 12, n=30; class B: mean 78, sd 15, n=25 — give a Welch t-statistic of about 1.884 (df ≈ 45.7) and a two-tailed p-value of about 0.0659.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a t-test?',
        paragraphs: [
          'A t-test checks whether a sample mean is significantly different from a known or hypothesized value (a one-sample t-test), or whether two samples\' means are significantly different from each other (a two-sample t-test). Both work the same way: compute a t-statistic (the observed difference divided by its standard error), then convert that t-statistic into a p-value using the Student\'s t distribution.',
          'This calculator\'s two-sample mode uses Welch\'s t-test, which does not assume the two groups have equal variances — it is the more conservative, more broadly applicable default (and, since 2017, the one R\'s own t.test() function uses by default) compared to the classic Student\'s pooled-variance t-test, which requires that assumption to hold. Welch\'s version uses the Welch–Satterthwaite equation to find an adjusted, often non-whole-number degrees of freedom that accounts for the two samples\' different variances and sizes.',
          'Degrees of freedom control exactly how wide the t-distribution\'s tails are — fewer degrees of freedom (smaller samples) mean a wider distribution and a larger critical value for the same confidence level, which is why the same t-statistic can be significant with a large sample and not with a small one.'
        ]
      },
      howTo: {
        intro: 'Choose one-sample or two-sample, enter your summary statistics, and pick the tail type that matches your hypothesis.',
        steps: [
          { name: 'Choose one-sample or two-sample', text: 'One-sample compares a sample mean to a known or hypothesized value. Two-sample (Welch) compares two independent samples\' means to each other.' },
          { name: 'Enter your summary statistics', text: 'One-sample: your sample\'s mean, hypothesized mean, standard deviation and size. Two-sample: both samples\' means, standard deviations and sizes.' },
          { name: 'Choose the tail type', text: 'Two-tailed (the usual default) for "is there any difference," or left/right-tailed for a specifically directional hypothesis decided in advance.' },
          { name: 'Read the t-statistic and degrees of freedom', text: 'The headline is the t-statistic; the degrees of freedom row shows what it was tested against (non-whole-number in two-sample mode, by design).' },
          { name: 'Read the p-value', text: 'Compare it to your chosen significance threshold (commonly 0.05).' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The same t = (difference) ÷ (standard error) shape either way, with the standard error and degrees of freedom built differently for one vs. two samples.',
        expression: 'One-sample: t = (x̄ − μ₀) ÷ (s ÷ √n),  df = n − 1\nTwo-sample (Welch): t = (x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂)\ndf = (s₁²/n₁ + s₂²/n₂)² ÷ [(s₁²/n₁)²/(n₁−1) + (s₂²/n₂)²/(n₂−1)]',
        terms: [
          { symbol: 'x̄, μ₀', meaning: 'The sample mean, and the hypothesized population mean (one-sample mode).' },
          { symbol: 'x̄₁, x̄₂, s₁, s₂, n₁, n₂', meaning: 'Each sample\'s mean, standard deviation and size (two-sample mode).' },
          { symbol: 'df', meaning: 'Degrees of freedom — always a whole number in one-sample mode, usually not in Welch\'s two-sample mode.' }
        ],
        note: 'The p-value is computed directly from the Student\'s t distribution at the exact (possibly non-whole-number) degrees of freedom, not rounded to the nearest table entry.'
      },
      workedExample: {
        intro: 'Two classes\' test scores: class A has a mean of 85, a standard deviation of 12, and 30 students; class B has a mean of 78, a standard deviation of 15, and 25 students. Is the difference statistically significant (two-tailed)?',
        rows: [
          { label: 'Standard error (√(12²/30 + 15²/25))', value: '≈ 3.7148' },
          { label: 't-statistic ((85 − 78) ÷ 3.7148)', value: '≈ 1.8843' },
          { label: 'Welch–Satterthwaite degrees of freedom', value: '≈ 45.67' },
          { label: 'Two-tailed p-value', value: '≈ 0.0659' }
        ],
        result: 't ≈ 1.884, df ≈ 45.67, p ≈ 0.0659',
        explanation: 'At the common 0.05 threshold, a p-value of about 0.0659 would usually be reported as not statistically significant — the observed 7-point gap between the two classes is plausibly just sampling variation, though the result is close enough to the threshold that a larger sample might resolve it either way.'
      },
      watchOut: [
        { title: 'Welch\'s t-test does not assume equal variances', body: 'That is why its degrees of freedom usually come out as a non-whole number — it is a deliberate correction for the two samples having different amounts of variability, not a rounding artifact. This calculator does not offer the classic equal-variance (pooled) version.' },
        { title: 'A t-test assumes independent, roughly normal samples', body: 'For small samples that are heavily skewed, or for paired/matched data (the same subjects measured twice), the plain one- or two-sample t-test used here is not the right tool — a paired t-test or a non-parametric test would be more appropriate.' },
        { title: 'The tail type must be decided before seeing the data, not after', body: 'Choosing a one-tailed test (or switching direction) after seeing which way the result leans artificially inflates the chance of a "significant" finding.' },
        { title: 'Statistical significance is not the same as practical importance', body: 'With a large enough sample, even a tiny, practically meaningless difference can produce a very small p-value. Always consider the actual size of the difference, not just whether the p-value clears a threshold.' },
        { title: 'Very small p-values are shown in scientific notation, not rounded to zero', body: 'Exactly as on the p-value calculator, an extreme t-statistic produces a p-value shown in scientific notation, floored at 1 × 10⁻³⁰⁰ for the rare case where the true value underflows a computer\'s smallest representable number. The one exception is a perfect one-sample fit (every value in the sample exactly equal, and different from the hypothesized mean) — there the t-statistic is mathematically infinite (shown as "—", not a missing result) and the p-value is an exact 0, not floored, since it is not an underflow of a nonzero number.' },
        { title: 'Sample sizes must be whole numbers of at least 2', body: 'A sample of 10.5 observations is not a real count, and a sample of 1 leaves no degrees of freedom. Entering a fractional or sub-2 sample size (either sample, in two-sample mode) shows no answer rather than quietly computing a t-test for a different, fractional-sized sample.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §10.1 Two Population Means with Unknown Standard Deviations (Welch\'s t-test)', url: 'https://openstax.org/books/introductory-statistics-2e/pages/10-1-two-population-means-with-unknown-standard-deviations' },
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.5.3 Two-Sample t-Test for Equal Means', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda353.htm' },
        { label: 'Wolfram MathWorld, Student\'s t-Distribution', url: 'https://mathworld.wolfram.com/Studentst-Distribution.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'One sample or two?',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'One sample vs. a hypothesized mean' },
          { value: 2, label: 'Two independent samples (Welch)' }
        ]
      },
      {
        id: 'tailType',
        label: 'Tail type',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Two-tailed (is there any difference?)' },
          { value: 2, label: 'Left-tailed (is it less than?)' },
          { value: 3, label: 'Right-tailed (is it greater than?)' }
        ]
      },
      { id: 'sampleMean', label: 'Sample 1 mean (x̄₁)', type: 'number', placeholder: '85', defaultValue: 85, step: 0.1 },
      { id: 'popMean', label: 'Hypothesized mean (μ₀), one-sample only', type: 'number', placeholder: '80', defaultValue: 80, step: 0.1 },
      { id: 'sampleStdDev', label: 'Sample 1 standard deviation (s₁)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.1, min: 0 },
      { id: 'sampleSize', label: 'Sample 1 size (n₁)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 2 },
      { id: 'mean2', label: 'Sample 2 mean (x̄₂), two-sample only', type: 'number', placeholder: '78', defaultValue: 78, step: 0.1 },
      { id: 'stdDev2', label: 'Sample 2 standard deviation (s₂), two-sample only', type: 'number', placeholder: '15', defaultValue: 15, step: 0.1, min: 0 },
      { id: 'sampleSize2', label: 'Sample 2 size (n₂), two-sample only', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 2 }
    ],
    breakdown: {
      headline: 'tStatistic',
      headlineLabel: 't-statistic',
      outputs: [
        { id: 'tStatistic', label: 't-statistic', format: 'number' },
        { id: 'degreesOfFreedom', label: 'Degrees of freedom', format: 'number' },
        { id: 'pValue', label: 'P-value', format: 'significant' },
        { id: 'standardError', label: 'Standard error', format: 'number' }
      ],
      groups: [
        { inputs: ['mode', 'tailType'] },
        { title: 'Sample 1', inputs: ['sampleMean', 'popMean', 'sampleStdDev', 'sampleSize'] },
        { title: 'Sample 2 (two-sample only)', inputs: ['mean2', 'stdDev2', 'sampleSize2'] }
      ],
      visual: {
        type: 'rangeBar',
        value: 'pValue',
        bands: [
          { label: 'Highly significant', min: 0, max: 0.01 },
          { label: 'Significant', min: 0.01, max: 0.05 },
          { label: 'Marginally significant', min: 0.05, max: 0.1 },
          { label: 'Not significant', min: 0.1, max: 1 }
        ],
        title: 'Where this p-value falls (common thresholds)',
        valueLabel: 'Your p-value'
      }
    },
    seo: {
      title: 'T-Test Calculator – One-Sample & Welch Two-Sample',
      description: 'Free t-test calculator from summary statistics. One-sample vs. a hypothesized mean, or Welch\'s two-sample test for unequal variances, with the exact p-value.',
      faq: [
        { question: 'How do I calculate a one-sample t-test?', answer: 'Divide the difference between your sample mean and the hypothesized mean by the standard error (sample standard deviation ÷ √n). Degrees of freedom are sample size minus 1.' },
        { question: 'How do I calculate a two-sample t-test?', answer: 'This calculator uses Welch\'s method: divide the difference between the two sample means by the combined standard error √(s₁²/n₁ + s₂²/n₂), with degrees of freedom from the Welch–Satterthwaite equation.' },
        { question: 'Why does the two-sample t-test use Welch\'s method instead of the classic pooled version?', answer: "Welch's method does not require assuming the two samples have equal variances, which makes it the safer default — the classic Student's pooled-variance t-test can give a misleading result when the two variances genuinely differ." },
        { question: 'Why are the degrees of freedom not a whole number?', answer: "That is expected for Welch's t-test — the Welch–Satterthwaite equation deliberately produces a fractional value that accounts for the two samples' different variances and sizes, not a rounding error." },
        { question: 'What p-value counts as statistically significant?', answer: 'There is no universal cutoff, but 0.05 is the most common convention. The tail type (two-, left- or right-tailed) should be chosen from your actual research question before looking at the results, not after.' },
        { question: 'Does this calculator work from raw data?', answer: 'No — it takes summary statistics (means, standard deviations, sample sizes) directly. Use the mean/median/mode and standard deviation calculators first if you only have a raw list of numbers.' },
        { question: 'Can I run a one-tailed t-test?', answer: 'Yes — choose left-tailed or right-tailed instead of the two-tailed default, for a specifically directional hypothesis decided in advance.' }
      ]
    },
    compute(values) {
      const { mode, tailType, sampleMean, popMean, sampleStdDev, sampleSize, mean2, stdDev2, sampleSize2 } = values;
      const noAnswer = { tStatistic: NaN, degreesOfFreedom: NaN, pValue: NaN, standardError: NaN };
      // Every sample size is a literal count of observations — a fractional 10.5 is an honest NaN,
      // not a silently-answered different question (same bug class a pre-merge review found in
      // binomial-distribution-calculator, run 3: there it was Math.round silently rounding; here,
      // before this fix, nothing refused it at all, so a df of 9.5 or 44.17 was computed and shown
      // as if it meant something).
      const n1 = requireIntegerAtLeast(sampleSize, 2);
      const n2 = requireIntegerAtLeast(sampleSize2, 2);
      let tStatistic: number;
      let degreesOfFreedom: number;
      let standardError: number;
      if (mode === 1) {
        standardError = sampleStdDev / Math.sqrt(n1);
        tStatistic = (sampleMean - popMean) / standardError; // 0/0 (s=0 and means equal) is an honest NaN
        degreesOfFreedom = n1 - 1;
      } else {
        const v1 = (sampleStdDev * sampleStdDev) / n1;
        const v2 = (stdDev2 * stdDev2) / n2;
        standardError = Math.sqrt(v1 + v2);
        tStatistic = (sampleMean - mean2) / standardError;
        // Welch-Satterthwaite: a genuinely non-integer df by design, not a rounding artifact — tCDF/tSF
        // (lib/distributions.ts) work with any df > 0, integer or not.
        degreesOfFreedom = (v1 + v2) ** 2 / (v1 ** 2 / (n1 - 1) + v2 ** 2 / (n2 - 1));
      }
      // Guarded explicitly, same reasoning as correlation-calculator: a zero standard error with
      // equal means makes tStatistic an honest NaN (0/0), which must never reach tCDF/tSF (it would
      // recurse forever — see tSF's own NaN guard in lib/distributions.ts). A zero standard error
      // with UNEQUAL means is a legitimate +-Infinity, which tCDF/tSF already handle directly.
      if (Number.isNaN(tStatistic) || !(degreesOfFreedom > 0)) {
        return { ...noAnswer, tStatistic, degreesOfFreedom, standardError };
      }
      const leftTail = tCDF(tStatistic, degreesOfFreedom);
      const rightTail = tSF(tStatistic, degreesOfFreedom);
      const rawPValue = tailType === 2 ? leftTail : tailType === 3 ? rightTail : 2 * Math.min(leftTail, rightTail);
      // Pre-merge review fix (run 4, PR #25): a one-sample test where every value is identical
      // (sampleStdDev = 0, mean != hypothesized mean) makes tStatistic exactly +-Infinity with a
      // perfectly finite, valid degreesOfFreedom — the true p-value there is EXACTLY 0, not a
      // continuous quantity that underflowed, so it must not be floored (floorFiniteTailProbability
      // above).
      return { tStatistic, degreesOfFreedom, pValue: floorFiniteTailProbability(rawPValue, tStatistic), standardError };
    }
  },
  {
    id: 'chi-square-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['chi square calculator', 'chi-square test calculator', 'goodness of fit calculator', 'chi square p value calculator'],
    related: ['p-value-calculator', 't-test-calculator', 'binomial-distribution-calculator', 'confidence-interval-calculator'],
    title: 'Chi-Square Calculator',
    description: 'Find a chi-square p-value directly from a χ² statistic and degrees of freedom, or run a goodness-of-fit test from observed and expected counts.',
    example: 'Rolling a die 60 times gives observed counts of 8, 12, 10, 14, 6 and 10 against an expected 10 per face — χ² = 4 with 5 degrees of freedom, a p-value of about 0.5494 (not significant).',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a chi-square test?',
        paragraphs: [
          'The chi-square (χ²) distribution is used to test how well a set of observed category counts matches what was expected. The goodness-of-fit test compares observed counts against expected counts across two or more categories (like the six faces of a die, or survey responses across several options), and asks whether the differences are bigger than random chance would typically produce.',
          'The χ² statistic itself is always zero or positive: it sums, across every category, the squared difference between what was observed and what was expected, scaled by the expected count. A perfect match gives χ² = 0; bigger mismatches give a bigger χ², and a bigger χ² (for the same degrees of freedom) gives a smaller p-value.',
          'This calculator covers the goodness-of-fit test directly (observed vs. expected counts) and also lets you enter an already-computed χ² statistic and degrees of freedom directly — useful if a test of independence (a contingency table) or another chi-square test gave you those two numbers from somewhere else, since this calculator does not build a contingency table itself.'
        ]
      },
      howTo: {
        intro: 'Either enter a χ² statistic and degrees of freedom directly, or switch to goodness-of-fit and paste your observed and expected counts.',
        steps: [
          { name: 'Choose how you want to enter data', text: '"Enter directly" if you already have a χ² statistic and degrees of freedom from elsewhere. "Goodness-of-fit" to compute them from category counts.' },
          { name: 'For direct entry, enter χ² and df', text: 'Type the statistic and its degrees of freedom.' },
          { name: 'For goodness-of-fit, paste your counts', text: 'Enter the observed count for each category, then the expected count for each category in the same order — one expected value for every observed value.' },
          { name: 'Check the counts match', text: 'If the observed and expected lists have different lengths, the result area says so and shows no answer.' },
          { name: 'Read the p-value', text: 'A small p-value (conventionally under 0.05) suggests the observed counts differ from what was expected by more than chance alone.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The goodness-of-fit statistic sums each category\'s squared, scaled mismatch; the p-value is the upper tail of the chi-square distribution at that statistic.',
        expression: 'χ² = Σ [(observed − expected)² ÷ expected]\ndf = (number of categories) − 1\np-value = P(X > χ²), X ~ chi-square(df)',
        terms: [
          { symbol: 'χ²', meaning: 'The chi-square test statistic — always ≥ 0.' },
          { symbol: 'df', meaning: 'Degrees of freedom: one less than the number of categories for a goodness-of-fit test.' }
        ],
        note: 'The p-value is computed directly from the upper regularized incomplete gamma function (the standard way to evaluate a chi-square tail), not read from a table limited to a handful of common df/significance combinations.'
      },
      workedExample: {
        intro: 'A fair six-sided die is rolled 60 times. If it is fair, each face is expected 10 times. The actual counts are: 8, 12, 10, 14, 6, 10.',
        rows: [
          { label: '(8−10)²/10', value: '0.4' },
          { label: '(12−10)²/10', value: '0.4' },
          { label: '(10−10)²/10', value: '0' },
          { label: '(14−10)²/10', value: '1.6' },
          { label: '(6−10)²/10', value: '1.6' },
          { label: '(10−10)²/10', value: '0' },
          { label: 'χ² (sum of all six)', value: '4' },
          { label: 'Degrees of freedom (6 categories − 1)', value: '5' }
        ],
        result: 'χ² = 4, df = 5, p-value ≈ 0.5494',
        explanation: 'A p-value of about 0.55 is well above the common 0.05 threshold, so there is no evidence here that the die is unfair — these counts are entirely consistent with ordinary random variation around an expected 10 per face.'
      },
      watchOut: [
        { title: 'The goodness-of-fit test needs enough expected counts', body: 'The chi-square approximation becomes unreliable when any category\'s expected count is below about 5 — a common rule of thumb, not a hard mathematical line. This calculator always shows the smallest expected count it was given, so you can check this yourself.' },
        { title: 'Your observed and expected lists must be the same length', body: 'Every observed count needs exactly one matching expected count, in the same category order. If the two lists have different counts, this calculator shows no answer rather than guessing.' },
        { title: 'This does not build a contingency table (test of independence)', body: 'A chi-square test of independence between two categorical variables (a contingency table) is a related but different setup. This calculator only computes the single-row goodness-of-fit statistic — if you already have a χ² statistic and degrees of freedom from a contingency table test done elsewhere, "enter directly" mode still finds its p-value correctly.' },
        { title: 'A large p-value does not prove the categories match perfectly', body: 'It only means this data does not provide strong evidence against the expected distribution — a small sample can fail to detect a real but modest mismatch.' },
        { title: 'Observed and expected must be entered as counts on the same scale, not proportions', body: 'This calculator checks that your observed and expected lists add up to the same total (within a tiny rounding tolerance) before computing anything. If you enter expected values as proportions or percentages (0.4, 0.4, 0.2, or 40, 40, 20) while observed stays as raw counts, the totals will not match and this calculator shows no answer, rather than silently rescaling one list to match the other and risking a guess in the wrong direction. Convert your expected values to counts on the same scale as observed first — e.g. multiply each proportion by the total number of observations.' },
        { title: 'Negative counts are refused outright', body: 'An observed or expected count can never be negative. This calculator shows no answer rather than a nonsensical or misleading result if either list contains a negative value.' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.5.15 Chi-Square Goodness-of-Fit Test', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda35f.htm' },
        { label: 'OpenStax, Introductory Statistics 2e, §11.2 Goodness-of-Fit Test', url: 'https://openstax.org/books/introductory-statistics-2e/pages/11-2-goodness-of-fit-test' },
        { label: 'Wolfram MathWorld, Chi-Squared Distribution', url: 'https://mathworld.wolfram.com/Chi-SquaredDistribution.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'How do you want to enter data?',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Enter χ² and df directly' },
          { value: 2, label: 'Goodness-of-fit (observed vs. expected)' }
        ]
      },
      { id: 'chiSquareStat', label: 'χ² statistic (direct entry)', type: 'number', placeholder: '10.5', defaultValue: 10.5, step: 0.1, min: 0 },
      { id: 'degreesOfFreedom', label: 'Degrees of freedom (direct entry)', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 },
      // Deliberately all-even values (pre-merge review fix, run 4, PR #25): the snapshot harness's
      // "typical" case scales every list value by 1.5x independently and rounds each to the nearest
      // integer (data/calculators.spec.ts's typicalList), which can shift observed's and expected's
      // totals apart by rounding alone if either list has an odd value — tripping this calculator's
      // own new "totals must match" guard on a harness artifact, not a real calculator bug. Every
      // value here and in `expected` below is even, so 1.5x is always an exact integer with no
      // rounding on either list, keeping their scaled totals equal (90 and 90) the same way the
      // unscaled ones are (60 and 60).
      {
        id: 'observed',
        label: 'Observed counts',
        type: 'list',
        placeholder: 'Paste or type each category\'s observed count — commas, spaces or new lines between them.',
        defaultValue: 0,
        listDefault: [8, 12, 10, 14, 6, 10],
        listMin: 2
      },
      {
        id: 'expected',
        label: 'Expected counts',
        type: 'list',
        placeholder: 'Paste or type each category\'s expected count, in the same order as the observed counts above.',
        defaultValue: 0,
        listDefault: [10, 10, 10, 10, 10, 10],
        listMin: 2
      }
    ],
    breakdown: {
      headline: 'chiSquareStatistic',
      headlineLabel: 'χ² statistic',
      outputs: [
        { id: 'chiSquareStatistic', label: 'χ² statistic', format: 'number' },
        { id: 'degreesOfFreedom', label: 'Degrees of freedom', format: 'integer' },
        { id: 'pValue', label: 'P-value', format: 'significant' },
        { id: 'minExpected', label: 'Smallest expected count (goodness-of-fit only)', format: 'number' },
        { id: 'count', label: 'Number of categories (goodness-of-fit only)', format: 'integer' }
      ],
      groups: [
        { inputs: ['mode'] },
        { title: 'Enter χ² and df directly', inputs: ['chiSquareStat', 'degreesOfFreedom'] },
        { title: 'Goodness-of-fit (observed vs. expected)', inputs: ['observed', 'expected'] }
      ],
      pairedLists: ['observed', 'expected'],
      visual: {
        type: 'rangeBar',
        value: 'pValue',
        bands: [
          { label: 'Highly significant', min: 0, max: 0.01 },
          { label: 'Significant', min: 0.01, max: 0.05 },
          { label: 'Marginally significant', min: 0.05, max: 0.1 },
          { label: 'Not significant', min: 0.1, max: 1 }
        ],
        title: 'Where this p-value falls (common thresholds)',
        valueLabel: 'Your p-value'
      }
    },
    seo: {
      title: 'Chi-Square Calculator – Goodness-of-Fit P-value',
      description: 'Free chi-square calculator. Enter χ² and df directly, or run a goodness-of-fit test from observed and expected category counts, with the exact p-value.',
      faq: [
        { question: 'How do I calculate a chi-square goodness-of-fit statistic?', answer: 'For each category, square the difference between the observed and expected count, divide by the expected count, then add up every category. For six die-roll categories (observed 8,12,10,14,6,10, all expected 10), χ² = 4.' },
        { question: 'How do I find a chi-square p-value from χ² and df?', answer: 'This calculator computes it directly from the chi-square distribution\'s upper tail — no table lookup needed, and it works for any degrees of freedom, not just the handful of common ones printed in textbook tables.' },
        { question: 'What does a small chi-square p-value mean?', answer: 'It means the observed counts differ from the expected counts by more than would typically happen by chance alone — conventionally, a p-value under 0.05 is called statistically significant.' },
        { question: 'What is the "expected count below 5" warning about?', answer: 'The chi-square approximation becomes less reliable when a category\'s expected count is small — a widely used rule of thumb sets the caution line at 5. This calculator shows the smallest expected count you entered so you can check this directly.' },
        { question: 'Can this calculator test a contingency table (test of independence)?', answer: 'Not directly — it does not build a contingency table from raw cross-tabulated data. If you already have a χ² statistic and degrees of freedom from a contingency table test, "enter directly" mode finds its p-value correctly.' },
        { question: 'How many categories can I enter?', answer: 'Up to 1,000 observed values and 1,000 expected values, pasted as two separate lists — though realistic goodness-of-fit tests usually have far fewer categories than that.' },
        { question: 'What happens if my observed and expected lists are different lengths?', answer: 'This calculator shows no result rather than guessing — every observed count needs exactly one matching expected count, in the same order.' },
        { question: 'Why does this show no answer when I enter expected values as percentages or proportions?', answer: 'This calculator checks that your observed and expected lists sum to the same total before computing anything, since the goodness-of-fit formula assumes both are counts on the same scale. If expected is entered as proportions (0.4, 0.4, 0.2) or percentages (40, 40, 20) while observed stays as raw counts, the totals will not match, and it shows no answer rather than silently rescaling one list to match the other. Convert expected to counts on the observed total first — multiply each proportion by the number of observations.' }
      ]
    },
    compute(values, lists) {
      const { mode, chiSquareStat, degreesOfFreedom } = values;
      const noAnswer = { chiSquareStatistic: NaN, degreesOfFreedom: NaN, pValue: NaN, minExpected: NaN, count: NaN };
      if (mode === 1) {
        const pValue = degreesOfFreedom > 0 ? floorTinyProbability(chiSquareSF(chiSquareStat, degreesOfFreedom)) : NaN;
        return { chiSquareStatistic: chiSquareStat, degreesOfFreedom, pValue, minExpected: NaN, count: NaN };
      }
      const observed = lists.observed;
      const expected = lists.expected;
      if (observed.length !== expected.length) return noAnswer; // honest no-answer, never truncated/padded
      // Pre-merge review fix (run 4, PR #25): a negative count is never a real observed or expected
      // frequency, and a goodness-of-fit chi-square assumes both lists are counts on the SAME total
      // scale (e.g. both raw counts summing to the same sample size). If a user enters "expected" as
      // proportions or percentages (0.4, 0.4, 0.2, or 40, 40, 20) while observed stays as raw
      // counts, every term's denominator is on a different scale and the statistic is silently
      // meaningless — refused outright here (an honest NaN), rather than guessing which scale was
      // intended and rescaling for them.
      if (observed.some((value) => value < 0) || expected.some((value) => value < 0)) return noAnswer;
      const n = observed.length;
      const totalObserved = observed.reduce((a, b) => a + b, 0);
      const totalExpected = expected.reduce((a, b) => a + b, 0);
      const totalsMismatch = Math.abs(totalObserved - totalExpected) > TOTALS_RELATIVE_TOLERANCE * Math.max(totalObserved, totalExpected, 1);
      if (totalsMismatch) return noAnswer;
      let statistic = 0;
      for (let i = 0; i < n; i++) {
        const diff = observed[i] - expected[i];
        statistic += (diff * diff) / expected[i]; // expected[i] === 0 gives an honest Infinity/NaN term, not a crash
      }
      const degreesOfFreedomComputed = n - 1;
      const minExpected = Math.min(...expected);
      const pValue = degreesOfFreedomComputed > 0 ? floorTinyProbability(chiSquareSF(statistic, degreesOfFreedomComputed)) : NaN;
      return { chiSquareStatistic: statistic, degreesOfFreedom: degreesOfFreedomComputed, pValue, minExpected, count: n };
    }
  },
  {
    id: 'standard-error-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['standard error calculator', 'standard error of the mean calculator', 'sem calculator', 'standard error of mean calculator'],
    related: ['standard-deviation-calculator', 'confidence-interval-calculator', 'margin-of-error-calculator', 'mean-median-mode-calculator'],
    title: 'Standard Error Calculator',
    description: 'Find the standard error of the mean, from summary statistics or directly from a raw data list — how precisely a sample mean estimates the true population mean.',
    example: 'A sample of 36 with a standard deviation of 15 has a standard error of the mean of 15 ÷ √36 = 2.5.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is the standard error of the mean?',
        paragraphs: [
          'The standard error of the mean (often just "standard error" or "SE") measures how precisely a sample\'s mean estimates the true mean of the whole population it was drawn from. It is not the same thing as the standard deviation: the standard deviation describes how spread out the individual data points are, while the standard error describes how much the sample mean itself would vary if you repeated the sampling process many times.',
          'The two are directly related: standard error equals the sample standard deviation divided by the square root of the sample size. That square root means the standard error shrinks as the sample gets bigger — a sample four times as large has a standard error only half as large, not a quarter — so there are sharply diminishing returns to collecting ever more data for a given gain in precision.',
          'This calculator focuses specifically on the standard error of the mean. For the standard error of a sample proportion (the kind used in survey and poll results), see the margin of error calculator, which already shows it as one of its rows — building a second, separate page for the exact same proportion arithmetic would just duplicate it.'
        ]
      },
      howTo: {
        intro: 'Enter your sample standard deviation and size directly, or switch to a raw data list and let this calculator find the standard deviation for you.',
        steps: [
          { name: 'Choose how you want to enter data', text: '"From summary statistics" if you already know your sample\'s standard deviation and size. "From a list of data" to paste the raw numbers instead.' },
          { name: 'Enter your standard deviation and size, or paste your list', text: 'For summary statistics, enter the sample standard deviation (s) and sample size (n) directly. For a raw list, paste the data — this calculator finds s and n itself.' },
          { name: 'Read the standard error', text: 'The headline is the standard error of the mean, in the same units as your original data.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The sample standard deviation, divided by the square root of the sample size.',
        expression: 'SE = s ÷ √n',
        terms: [
          { symbol: 's', meaning: 'The sample standard deviation.' },
          { symbol: 'n', meaning: 'The sample size.' }
        ],
        note: 'From a raw data list, s is the sample standard deviation (dividing by n − 1), the same convention this site\'s standard deviation calculator uses as its own headline figure.'
      },
      workedExample: {
        intro: 'A sample of 36 observations has a sample standard deviation of 15.',
        rows: [
          { label: '√n (√36)', value: '6' },
          { label: 'SE (15 ÷ 6)', value: '2.5' }
        ],
        result: 'SE = 2.5',
        explanation: 'If this same sampling process were repeated many times, the resulting sample means would typically differ from the true population mean by around 2.5, in the data\'s own units.'
      },
      watchOut: [
        { title: 'Standard error is not standard deviation', body: 'The standard deviation describes spread in the raw data; the standard error describes precision in the sample mean. They are related by ÷√n, but answer different questions, and mixing them up is a common source of confusing a plot\'s error bars.' },
        { title: 'A single data point has no standard error', body: 'With only one value, the sample standard deviation itself is undefined (there is nothing to measure spread against), so this calculator shows no answer rather than a false 0.' },
        { title: 'For a proportion, use the margin of error calculator instead', body: 'This page is specifically for the standard error of a mean. The standard error of a proportion (used for survey and poll percentages) already appears as a row on the margin of error calculator.' },
        { title: 'A smaller standard error does not mean a more accurate sample', body: 'It means a more precise estimate of whatever the sample is actually measuring. A large, precise sample can still be biased (for example, by who was surveyed) in a way that no amount of precision fixes.' },
        { title: 'Sample size must be a whole number', body: 'When entering summary statistics directly, a sample size of 36.5 is not a real count — this calculator shows no answer rather than quietly computing a standard error for a fractional sample. (Pasting a data list always gives a whole-number count automatically.)' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.5.2 Confidence Limits for the Mean (defines the standard error of the mean)', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda352.htm' },
        { label: 'OpenStax, Introductory Statistics 2e, §7.1 The Central Limit Theorem for Sample Means', url: 'https://openstax.org/books/introductory-statistics-2e/pages/7-1-the-central-limit-theorem-for-sample-means' },
        { label: 'Wolfram MathWorld, Standard Error', url: 'https://mathworld.wolfram.com/StandardError.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'How do you want to enter data?',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'From summary statistics' },
          { value: 2, label: 'From a list of data' }
        ]
      },
      { id: 'sampleStdDev', label: 'Sample standard deviation (s)', type: 'number', placeholder: '15', defaultValue: 15, step: 0.1, min: 0 },
      { id: 'sampleSize', label: 'Sample size (n)', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 1 },
      listInput([12, 15, 18, 21, 24, 27, 30], 1)
    ],
    breakdown: {
      headline: 'standardError',
      headlineLabel: 'Standard error of the mean',
      outputs: [
        { id: 'standardError', label: 'Standard error of the mean', format: 'number' },
        { id: 'sampleStdDevUsed', label: 'Sample standard deviation used', format: 'number' },
        { id: 'sampleSizeUsed', label: 'Sample size used', format: 'integer' }
      ],
      groups: [
        { inputs: ['mode'] },
        { title: 'From summary statistics', inputs: ['sampleStdDev', 'sampleSize'] },
        { title: 'From a list of data', inputs: ['data'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'sampleStdDevUsed', label: 'Standard deviation' }, { from: 'standardError', label: 'Standard error' }],
        title: 'Spread vs. precision',
        highlight: 1
      }
    },
    seo: {
      title: 'Standard Error Calculator – Standard Error of the Mean',
      description: 'Free standard error of the mean calculator. Enter summary statistics or a raw data list to find SE = s ÷ √n.',
      faq: [
        { question: 'How do I calculate the standard error of the mean?', answer: 'Divide the sample standard deviation by the square root of the sample size: SE = s ÷ √n. For s = 15 and n = 36, SE = 15 ÷ 6 = 2.5.' },
        { question: 'What is the difference between standard error and standard deviation?', answer: 'Standard deviation measures how spread out the individual data points are. Standard error measures how precisely the sample mean estimates the true population mean, and it shrinks as the sample size grows — standard deviation does not.' },
        { question: 'Why does the standard error use the square root of n, not n itself?', answer: 'This comes directly from the central limit theorem: the variance of a sample mean is the population variance divided by n, and standard error is a standard deviation (a square root of variance), so it is divided by √n, not n.' },
        { question: 'Can I compute this from raw data instead of a standard deviation?', answer: 'Yes — switch to "from a list of data" and paste your numbers; this calculator finds the sample standard deviation and size for you before dividing.' },
        { question: 'Does a bigger sample always give a smaller standard error?', answer: 'Yes, for the same underlying spread — but the relationship is a square root, so a sample 4 times as large only halves the standard error, not quarters it.' },
        { question: 'What about the standard error of a proportion?', answer: 'That is a different formula (built from the proportion itself, not a standard deviation), and already appears as a row on the margin of error calculator — this page is specifically for the standard error of a mean.' },
        { question: 'What happens with only one data point?', answer: 'A single value has no sample standard deviation to work with, so this calculator shows no answer rather than a misleading 0.' }
      ]
    },
    compute(values, lists) {
      const { mode, sampleStdDev, sampleSize } = values;
      let s: number;
      let n: number;
      if (mode === 1) {
        s = sampleStdDev;
        n = requireIntegerAtLeast(sampleSize, 1); // a fractional sample size is an honest NaN, not a silently-answered different question
      } else {
        const list = lists.data;
        n = list.length;
        s = Math.sqrt(varianceOf(list).sampleVariance); // n=1 -> sample variance is 0/0, an honest NaN
      }
      const standardError = s / Math.sqrt(n);
      return { standardError, sampleStdDevUsed: s, sampleSizeUsed: n };
    }
  }
];
