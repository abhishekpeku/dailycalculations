// The "How it works" diagram data. See mdFiles/steps/ux-02-calculator-intro-diagram.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators } from '../data/calculators/index.ts';
import { buildFlow, describeFlow, joinAnd } from './howItWorks.ts';

const byId = (id: string) => {
  const calculator = calculators.find((item) => item.id === id);
  assert.ok(calculator, id);
  return calculator;
};

describe('joinAnd', () => {
  test('one, two, and three+ items', () => {
    assert.equal(joinAnd(['a']), 'a');
    assert.equal(joinAnd(['a', 'b']), 'a and b');
    assert.equal(joinAnd(['a', 'b', 'c']), 'a, b, and c');
  });
});

describe('buildFlow', () => {
  test('every calculator is null (special widgets only) or a flow with >= 1 input and a non-empty output label', () => {
    const SPECIAL_WIDGETS = new Set([
      'currency-converter',
      'character-counter',
      'hashtag-counter',
      'pomodoro-timer',
      'timezone-meeting-planner',
      'scientific-calculator'
    ]);
    let flows = 0;
    for (const calculator of calculators) {
      const flow = buildFlow(calculator);
      if (flow === null) {
        assert.ok(SPECIAL_WIDGETS.has(calculator.id), `${calculator.id} returned null but isn't a special widget`);
        continue;
      }
      assert.ok(flow.inputs.length >= 1, calculator.id);
      assert.ok(flow.output.label.length > 0, calculator.id);
      flows++;
    }
    assert.equal(flows, calculators.length - SPECIAL_WIDGETS.size);
  });

  test('mortgage-calculator: output symbol M, solveAny true, down payment included as a fixed input', () => {
    const flow = buildFlow(byId('mortgage-calculator'));
    assert.ok(flow);
    assert.deepEqual(flow.output, { symbol: 'M', label: 'Monthly payment (P&I)' });
    assert.equal(flow.solveAny, true);
    assert.deepEqual(flow.inputs.map((input) => input.symbol), ['H', 'D', 'n', 'APR']);
  });

  test('bmi-calculator: two inputs, both solver variables, solveAny true', () => {
    const flow = buildFlow(byId('bmi-calculator'));
    assert.ok(flow);
    assert.equal(flow.output.symbol, 'BMI');
    assert.equal(flow.solveAny, true);
    assert.deepEqual(flow.inputs.map((input) => input.symbol), ['m', 'h']);
  });

  test('freelancer-rate-calculator: 7 variables -> 6 inputs (more than 5, for the "+N more" pill)', () => {
    const flow = buildFlow(byId('freelancer-rate-calculator'));
    assert.ok(flow);
    assert.equal(flow.inputs.length, 6);
    assert.ok(flow.inputs.length > 5);
  });

  test('standard-deviation-calculator (breakdown, list input): one input, no symbols, solveAny false', () => {
    const flow = buildFlow(byId('standard-deviation-calculator'));
    assert.ok(flow);
    assert.deepEqual(flow.inputs, [{ label: 'Your numbers' }]);
    assert.equal(flow.output.symbol, undefined);
    assert.equal(flow.output.label, 'Standard deviation (sample, s)'); // the headlineLabel override, same as the widget shows
    assert.equal(flow.solveAny, false);
  });

  test('miles-to-kilometers-converter (a 2-variable solver, like every pair converter): one input, solveAny true', () => {
    const flow = buildFlow(byId('miles-to-kilometers-converter'));
    assert.ok(flow);
    assert.deepEqual(flow.inputs, [{ symbol: 'mi', label: 'Miles' }]);
    assert.deepEqual(flow.output, { symbol: 'km', label: 'Kilometers' });
    assert.equal(flow.solveAny, true); // either field can be entered and the other is calculated
  });

  test('currency-converter and the other special widgets: null', () => {
    for (const id of ['currency-converter', 'character-counter', 'hashtag-counter', 'pomodoro-timer', 'timezone-meeting-planner', 'scientific-calculator']) {
      assert.equal(buildFlow(byId(id)), null, id);
    }
  });
});

describe('describeFlow', () => {
  test('builds a lowercase-first, Oxford-comma sentence pair for the sr-only summary', () => {
    const flow = buildFlow(byId('mortgage-calculator'));
    assert.ok(flow);
    const { inputs, output } = describeFlow(flow);
    assert.equal(inputs, 'home price, down payment, loan term, and interest rate (APR)');
    assert.equal(output, 'monthly payment (P&I)');
  });
});
