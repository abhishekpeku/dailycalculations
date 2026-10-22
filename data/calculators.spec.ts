// Regression net for every compute() before the v2 / region rewrites. See mdFiles/steps/17-compute-snapshot-tests.md.
// Run: npm test · Update snapshots: npm run test:update
import { describe, test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { calculators, type CalculatorConfig, type CalculatorInput, type CalculatorInputValues } from './calculators/index.ts';

const CUSTOM_TOOLS = [
  'currency-converter',
  'character-counter',
  'hashtag-counter',
  'pomodoro-timer',
  'timezone-meeting-planner',
  'scientific-calculator'
];

// Current behavior at the edge set (calculator id -> output keys that are not finite). Asserted exactly.
const KNOWN_NON_FINITE: Record<string, string[]> = {
  'bmi-calculator': ['bmi'], // height 0 -> 0/0
  'percent-change-calculator': ['percentChange'], // old value 0 -> divide by zero
  'percent-difference-calculator': ['percentDifference'], // both values 0 -> average 0
  'ratio-calculator': ['d'], // a (the term being divided by) 0 -> divide by zero
  'weighted-average-calculator': ['weightedAverage'], // all weights 0 -> 0/0
  'logarithm-calculator': ['result', 'naturalLog', 'commonLog'], // base 0 and argument 0 -> invalid log domain
  'long-division-calculator': ['quotient', 'remainder', 'decimalResult', 'check'], // divisor 0 -> divide by zero
  'quadratic-formula-calculator': ['discriminant', 'root1', 'root2', 'realPart', 'imaginaryPart', 'vertexX', 'vertexY'], // a=0, b=0, c=0 -> no single equation (0 = 0)
  'lcm-calculator': ['lcm'], // both numbers 0 -> LCM(0, 0) is undefined by convention, not 0
  'triangle-calculator': ['sideA', 'sideB', 'sideC', 'angleA', 'angleB', 'angleC', 'perimeter', 'area'], // mode 1 (SSS), all three sides 0 -> fails the triangle inequality
  'slope-calculator': ['slope', 'angle', 'yIntercept'], // both points identical (0,0)-(0,0) -> no line at all, distance is still a legitimate 0
  'standard-deviation-calculator': ['sampleVariance', 'sampleStdDev'], // howMany=1 (its min) -> sample divides by n-1=0
  'variance-calculator': ['sampleVariance', 'sampleStdDev'], // howMany=1 (its min) -> sample divides by n-1=0
  'z-score-calculator': ['zScore'], // standard deviation 0 (no min set) -> divide by zero
  'normal-distribution-calculator': ['pLessThanX', 'pGreaterThanX', 'zScore', 'pBetween', 'xAtPercentile'], // standard deviation 0 (its min) -> honest no-answer
  'correlation-calculator': ['r', 'rSquared', 'tStatistic', 'pValue'], // xData/yData both [0,0] (listMin) -> zero variance, 0/0
  'linear-regression-calculator': ['slope', 'intercept', 'rSquared', 'standardError', 'predictedY'], // xData/yData both [0,0] (listMin) -> zero variance, 0/0
  't-test-calculator': ['tStatistic', 'pValue'], // mode's own min selects one-sample mode; sampleStdDev 0 and sampleMean=popMean=0 -> 0/0
  'chi-square-calculator': ['minExpected', 'count'] // mode's own min selects direct-entry mode, which never sets these two
};

// Pinned "today" for timeDependent calculators; the date the snapshots were recorded against.
const FIXED_TODAY_MS = new Date(2026, 5, 17).getTime();

const CALENDAR = /(?<!Per)(Year|Month|Day)$/;
const CLOCK = /(Hour|Minute)$/;

function roundToStep(value: number, step: number) {
  return Number((Math.round(value / step) * step).toPrecision(12));
}

function typicalValue(input: CalculatorInput) {
  const v = input.defaultValue;
  if (CALENDAR.test(input.id)) {
    if (input.id.endsWith('Year')) return v + 1;
    if (input.id.endsWith('Month')) return (v % 12) + 1;
    return Math.min(v + 9, 28);
  }
  if (CLOCK.test(input.id)) {
    return input.id.endsWith('Hour') ? (v + 3) % 24 : (v + 15) % 60;
  }
  const scaled = roundToStep(v * 1.5, input.step ?? 1);
  return Math.max(input.min ?? -Infinity, scaled);
}

type InputSet = { values: CalculatorInputValues; lists: Record<string, number[]> };

// A 'list' input has no single numeric default/typical/edge the way a scalar input does — it is
// excluded from `values` entirely (compute() never sees a list id as a key there, same as the live
// widget via lib/breakdown.ts's computeValues) and built into `lists` instead, from `listDefault`.
function typicalList(input: CalculatorInput): number[] {
  return (input.listDefault ?? []).map((v) => roundToStep(v * 1.5, 1));
}

function edgeList(input: CalculatorInput): number[] {
  return Array.from({ length: input.listMin ?? 1 }, () => 0);
}

function inputSets(calculator: CalculatorConfig): Record<string, InputSet> {
  const scalarInputs = calculator.inputs.filter((input) => input.type !== 'list');
  const listInputs = calculator.inputs.filter((input) => input.type === 'list');
  const buildValues = (pick: (input: CalculatorInput) => number) =>
    Object.fromEntries(scalarInputs.map((input) => [input.id, pick(input)]));
  const buildLists = (pick: (input: CalculatorInput) => number[]) =>
    Object.fromEntries(listInputs.map((input) => [input.id, pick(input)]));
  return {
    default: { values: buildValues((input) => input.defaultValue), lists: buildLists((input) => input.listDefault ?? []) },
    typical: { values: buildValues(typicalValue), lists: buildLists(typicalList) },
    edge: { values: buildValues((input) => input.min ?? 0), lists: buildLists(edgeList) }
  };
}

function normalize(value: number): number | string {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Number(value.toPrecision(10));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function nonFiniteKeys(result: Record<string, number>) {
  return Object.keys(result).filter((key) => !Number.isFinite(result[key]));
}

const run = (calculator: CalculatorConfig, set: InputSet) =>
  calculator.compute(calculator.timeDependent ? { ...set.values, todayMs: FIXED_TODAY_MS } : set.values, set.lists);

const defaults = (calculator: CalculatorConfig) => inputSets(calculator).default;
const computed = calculators.filter((c) => Object.keys(run(c, defaults(c))).length > 0);
let snapshotted = 0;

describe('compute() snapshots', () => {
  for (const calculator of computed) {
    test(calculator.id, (t: TestContext) => {
      const sets = inputSets(calculator);
      const snapshot: Record<string, unknown> = {};

      for (const [name, set] of Object.entries(sets)) {
        const result = run(calculator, set);
        const bad = nonFiniteKeys(result);
        const allowed = name === 'edge' ? KNOWN_NON_FINITE[calculator.id] ?? [] : [];
        assert.deepEqual(bad, allowed, `${calculator.id} ${name}: non-finite outputs`);
        // Only calculators with a list input carry a `lists` key — every other snapshot's `inputs`
        // shape is untouched, so this change does not move a single existing calculator's snapshot.
        snapshot[name] = {
          inputs: Object.keys(set.lists).length ? { ...set.values, lists: set.lists } : set.values,
          outputs: Object.fromEntries(Object.entries(result).map(([key, value]) => [key, normalize(value)]))
        };
      }

      // @types/node is 20.x, whose TestContextAssert predates snapshot().
      (t.assert as unknown as { snapshot(value: unknown): void }).snapshot(snapshot);
      snapshotted += 1;
    });
  }
});

describe('custom-tool calculators', () => {
  test('return {} from compute()', () => {
    for (const id of CUSTOM_TOOLS) {
      const calculator = calculators.find((c) => c.id === id);
      assert.ok(calculator, `${id} exists`);
      const set = defaults(calculator);
      assert.deepEqual(calculator.compute(set.values, set.lists), {}, id);
    }
  });

  test('are the only calculators with an empty compute()', () => {
    const empty = calculators.filter((c) => !computed.includes(c)).map((c) => c.id).sort();
    assert.deepEqual(empty, [...CUSTOM_TOOLS].sort());
  });
});

describe('time-dependent calculators', () => {
  test('pregnancy-due-date-calculator reads todayMs', () => {
    const calculator = calculators.find((c) => c.id === 'pregnancy-due-date-calculator');
    assert.ok(calculator?.timeDependent);
    const inputs = defaults(calculator).values;
    const june = calculator.compute({ ...inputs, todayMs: new Date(2026, 5, 17).getTime() }, {});
    const july = calculator.compute({ ...inputs, todayMs: new Date(2026, 6, 17).getTime() }, {});
    assert.equal(june.daysRemaining - july.daysRemaining, 30);
    assert.equal(july.gestationalDays - june.gestationalDays, 30);
  });
});

describe('force-calculator solver', () => {
  const solve = calculators.find((c) => c.id === 'force-calculator')?.solver?.solve;
  const close = (actual: number, expected: number) =>
    assert.ok(Math.abs(actual - expected) <= 1e-9 * Math.abs(expected), `${actual} ≈ ${expected}`);

  test('has force, mass and acceleration', () => {
    assert.ok(solve);
    assert.deepEqual(Object.keys(solve).sort(), ['acceleration', 'force', 'mass']);
  });

  test('force = m × a', () => close(solve!.force({ mass: 1500, acceleration: 2.78 }), 4170));
  test('acceleration = F ÷ m', () => close(solve!.acceleration({ force: 6000, mass: 2000 }), 3));
  test('mass = F ÷ a', () => close(solve!.mass({ force: 4170, acceleration: 2.78 }), 1500));
  test('divide by zero → NaN', () => {
    assert.ok(Number.isNaN(solve!.mass({ force: 4170, acceleration: 0 })));
    assert.ok(Number.isNaN(solve!.acceleration({ force: 6000, mass: 0 })));
  });
});

// Pre-merge review of PR #25 (statistics run 4) found three real bugs, each verified independently
// in the scratchpad's verify_run4_premerge_fixes.mjs before these permanent tests were written.
describe('statistics run 4 pre-merge review fixes (PR #25)', () => {
  const byId = (id: string) => {
    const calculator = calculators.find((c) => c.id === id);
    assert.ok(calculator, id);
    return calculator!;
  };

  describe('fix 1: a non-integer sample/population size is refused (NaN), never silently answered', () => {
    test('confidence-interval-calculator: a fractional sample size gives no answer', () => {
      const calc = byId('confidence-interval-calculator');
      const base = Object.fromEntries(calc.inputs.map((i) => [i.id, i.defaultValue]));
      const bad = calc.compute({ ...base, sampleSize: 10.5 });
      assert.ok(Number.isNaN(bad.degreesOfFreedom) && Number.isNaN(bad.marginOfError));
      const good = calc.compute({ ...base });
      assert.ok(Number.isFinite(good.marginOfError));
    });

    test('margin-of-error-calculator: a fractional sample size or nonzero population size gives no answer', () => {
      const calc = byId('margin-of-error-calculator');
      const base = Object.fromEntries(calc.inputs.map((i) => [i.id, i.defaultValue]));
      assert.ok(Number.isNaN(calc.compute({ ...base, sampleSize: 999.5 }).marginOfErrorPercent));
      assert.ok(Number.isFinite(calc.compute({ ...base, populationSize: 2000 }).marginOfErrorPercent));
      assert.ok(Number.isNaN(calc.compute({ ...base, populationSize: 2000.5 }).marginOfErrorPercent));
      // populationSize = 0 is a valid sentinel ("not applied"), not a fractional-input error.
      assert.ok(Number.isFinite(calc.compute({ ...base, populationSize: 0 }).marginOfErrorPercent));
    });

    test('sample-size-calculator: a fractional nonzero population size gives no answer', () => {
      const calc = byId('sample-size-calculator');
      const base = Object.fromEntries(calc.inputs.map((i) => [i.id, i.defaultValue]));
      assert.ok(Number.isFinite(calc.compute({ ...base, populationSize: 2000 }).sampleSize));
      assert.ok(Number.isNaN(calc.compute({ ...base, populationSize: 2000.5 }).sampleSize));
    });

    test('t-test-calculator: a fractional sample size gives no answer, in either mode', () => {
      const calc = byId('t-test-calculator');
      const oneSample = { mode: 1, tailType: 1, sampleMean: 85, popMean: 80, sampleStdDev: 12, sampleSize: 10.5, mean2: 78, stdDev2: 15, sampleSize2: 25 };
      const bad1 = calc.compute(oneSample);
      assert.ok(Number.isNaN(bad1.degreesOfFreedom) && Number.isNaN(bad1.pValue));
      const twoSample = { mode: 2, tailType: 1, sampleMean: 85, popMean: 80, sampleStdDev: 12, sampleSize: 30, mean2: 78, stdDev2: 15, sampleSize2: 24.5 };
      const bad2 = calc.compute(twoSample);
      assert.ok(Number.isNaN(bad2.degreesOfFreedom) && Number.isNaN(bad2.pValue));
    });

    test('standard-error-calculator: a fractional sample size (summary mode) gives no answer', () => {
      const calc = byId('standard-error-calculator');
      const bad = calc.compute({ mode: 1, sampleStdDev: 15, sampleSize: 36.5 }, { data: [12, 15, 18] });
      assert.ok(Number.isNaN(bad.standardError));
    });
  });

  describe('fix 2: a perfect fit shows an exact p-value of 0, never the underflow floor', () => {
    test('correlation-calculator: perfect correlation gives r=1, t=Infinity, pValue=0 exactly', () => {
      const calc = byId('correlation-calculator');
      const result = calc.compute({}, { xData: [1, 2, 3], yData: [2, 4, 6] });
      assert.equal(result.r, 1);
      assert.equal(result.tStatistic, Infinity);
      assert.equal(result.pValue, 0); // not floored to 1e-300 — the true value here IS exactly 0
    });

    test('t-test-calculator: a one-sample perfect fit (s=0, mean != hypothesized mean) gives t=Infinity, a finite df, and pValue=0 exactly', () => {
      const calc = byId('t-test-calculator');
      const result = calc.compute({ mode: 1, tailType: 1, sampleMean: 85, popMean: 80, sampleStdDev: 0, sampleSize: 30, mean2: 78, stdDev2: 15, sampleSize2: 25 });
      assert.equal(result.tStatistic, Infinity);
      assert.equal(result.degreesOfFreedom, 29); // a real, finite df — this is not the s=0-AND-equal-means NaN case
      assert.equal(result.pValue, 0);
    });

    test('linear-regression-calculator: a perfect fit gives a genuine, unfloored standard error of exactly 0', () => {
      const calc = byId('linear-regression-calculator');
      const result = calc.compute({ predictAtX: 4 }, { xData: [1, 2, 3], yData: [2, 4, 6] });
      assert.equal(result.standardError, 0);
      assert.equal(result.rSquared, 1);
    });
  });

  describe('fix 3: chi-square goodness-of-fit refuses mismatched totals and negative counts', () => {
    test('expected entered as proportions (totals do not match observed) gives no answer', () => {
      const calc = byId('chi-square-calculator');
      const result = calc.compute({ mode: 2, chiSquareStat: 0, degreesOfFreedom: 1 }, { observed: [24, 24, 12], expected: [0.4, 0.4, 0.2] });
      assert.ok(Number.isNaN(result.chiSquareStatistic) && Number.isNaN(result.pValue));
    });

    test('matching totals still compute normally', () => {
      const calc = byId('chi-square-calculator');
      const result = calc.compute({ mode: 2, chiSquareStat: 0, degreesOfFreedom: 1 }, { observed: [8, 12, 10, 14, 6, 10], expected: [10, 10, 10, 10, 10, 10] });
      assert.equal(result.chiSquareStatistic, 4);
    });

    test('a negative observed or expected count gives no answer', () => {
      const calc = byId('chi-square-calculator');
      const negObserved = calc.compute({ mode: 2, chiSquareStat: 0, degreesOfFreedom: 1 }, { observed: [-5, 15, 10], expected: [5, 10, 5] });
      assert.ok(Number.isNaN(negObserved.chiSquareStatistic));
      const negExpected = calc.compute({ mode: 2, chiSquareStat: 0, degreesOfFreedom: 1 }, { observed: [5, 10, 5], expected: [-5, 15, 10] });
      assert.ok(Number.isNaN(negExpected.chiSquareStatistic));
    });
  });
});

// Runs last: node:test executes a file's tests in declaration order.
test('every calculator with a non-empty compute() was snapshotted', () => {
  assert.equal(snapshotted, computed.length);
  assert.equal(snapshotted + CUSTOM_TOOLS.length, calculators.length);
});
