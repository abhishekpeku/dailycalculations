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
  'timezone-meeting-planner'
];

// Current behavior at the edge set (calculator id -> output keys that are not finite). Asserted exactly.
const KNOWN_NON_FINITE: Record<string, string[]> = {
  'bmi-calculator': ['bmi'] // height 0 -> 0/0
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

function inputSets(calculator: CalculatorConfig): Record<string, CalculatorInputValues> {
  const build = (pick: (input: CalculatorInput) => number) =>
    Object.fromEntries(calculator.inputs.map((input) => [input.id, pick(input)]));
  return {
    default: build((input) => input.defaultValue),
    typical: build(typicalValue),
    edge: build((input) => input.min ?? 0)
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

const run = (calculator: CalculatorConfig, inputs: CalculatorInputValues) =>
  calculator.compute(calculator.timeDependent ? { ...inputs, todayMs: FIXED_TODAY_MS } : inputs);

const defaults = (calculator: CalculatorConfig) => inputSets(calculator).default;
const computed = calculators.filter((c) => Object.keys(run(c, defaults(c))).length > 0);
let snapshotted = 0;

describe('compute() snapshots', () => {
  for (const calculator of computed) {
    test(calculator.id, (t: TestContext) => {
      const sets = inputSets(calculator);
      const snapshot: Record<string, unknown> = {};

      for (const [name, inputs] of Object.entries(sets)) {
        const result = run(calculator, inputs);
        const bad = nonFiniteKeys(result);
        const allowed = name === 'edge' ? KNOWN_NON_FINITE[calculator.id] ?? [] : [];
        assert.deepEqual(bad, allowed, `${calculator.id} ${name}: non-finite outputs`);
        snapshot[name] = {
          inputs,
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
      assert.deepEqual(calculator.compute(defaults(calculator)), {}, id);
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
    const inputs = defaults(calculator);
    const june = calculator.compute({ ...inputs, todayMs: new Date(2026, 5, 17).getTime() });
    const july = calculator.compute({ ...inputs, todayMs: new Date(2026, 6, 17).getTime() });
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

// Runs last: node:test executes a file's tests in declaration order.
test('every calculator with a non-empty compute() was snapshotted', () => {
  assert.equal(snapshotted, computed.length);
  assert.equal(snapshotted + CUSTOM_TOOLS.length, calculators.length);
});
