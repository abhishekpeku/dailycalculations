// Root finder and numeric-solve checks. See mdFiles/steps/31-solver-v2.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import type { CalculatorSolver } from '../data/calculators/index.ts';
import { findRoot } from './solve.ts';
import { initialState, solveState, type SolverState } from './solverState.ts';
import { toBase } from './units.ts';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} ≈ ${expected}`
  );

describe('findRoot', () => {
  test('√2 from x² − 2 on [0, 2]', () => close(findRoot((x) => x * x - 2, { bounds: [0, 2] }), Math.SQRT2, 1e-12));
  test('cos x = x on [0, 1]', () => close(findRoot((x) => Math.cos(x) - x, { bounds: [0, 1] }), 0.7390851332151607, 1e-12));
  test('x³ − 2x − 5 without bounds, from a guess', () =>
    close(findRoot((x) => x ** 3 - 2 * x - 5, { guess: 2 }), 2.0945514815423265, 1e-12));
  test('grows the bracket from the guess when there are no bounds', () =>
    close(findRoot((x) => x - 1e6, { guess: 1 }), 1e6, 1e-12));
  test('a root on a bound', () => assert.equal(findRoot((x) => x - 3, { bounds: [3, 5] }), 3));
  test('a geometric grid finds a tiny root in a wide range', () =>
    close(findRoot((x) => x - 1e-6, { bounds: [1e-9, 1e3] }), 1e-6, 1e-10));
  test('picks the sign change nearest the guess', () => {
    close(findRoot(Math.sin, { bounds: [1, 10], guess: 3 }), Math.PI, 1e-12);
    close(findRoot(Math.sin, { bounds: [1, 10], guess: 6 }), 2 * Math.PI, 1e-12);
  });
  test('Newton fallback finds a double root (no sign change)', () =>
    close(findRoot((x) => (x - 1.2345) ** 2, { bounds: [-5, 5] }), 1.2345, 1e-4));
  test('skips points where f is not finite', () =>
    close(findRoot((x) => Math.log(x) - 1, { bounds: [-1, 5] }), Math.E, 1e-12));
  test('is deterministic and respects the iteration cap', () => {
    const f = (x: number) => Math.cos(x) - x;
    const capped = findRoot(f, { bounds: [0, 1], maxIterations: 2 });
    assert.ok(Number.isFinite(capped));
    assert.equal(findRoot(f, { bounds: [0, 1], maxIterations: 2 }), capped);
    assert.equal(findRoot(f, { bounds: [0, 1] }), findRoot(f, { bounds: [0, 1] }));
  });

  describe('NaN when there is no root', () => {
    test('x² + 1 on [−10, 10]', () => assert.ok(Number.isNaN(findRoot((x) => x * x + 1, { bounds: [-10, 10] }))));
    test('x² + 1 without bounds', () => assert.ok(Number.isNaN(findRoot((x) => x * x + 1, { guess: 3 }))));
    test('root outside the bounds', () => assert.ok(Number.isNaN(findRoot((x) => x - 20, { bounds: [0, 10] }))));
    test('a pole is not a root (1/x across 0)', () => assert.ok(Number.isNaN(findRoot((x) => 1 / x, { bounds: [-1, 2] }))));
    test('f is NaN everywhere', () => assert.ok(Number.isNaN(findRoot(() => NaN, { bounds: [0, 1] }))));
    test('empty bounds', () => assert.ok(Number.isNaN(findRoot((x) => x, { bounds: [1, -1] }))));
  });
});

// Test-only fixture: a standard amortized loan, monthly rate r = APR / 12. Percent is the percent number.
const monthlyPayment = (principal: number, months: number, apr: number) => {
  const r = apr / 100 / 12;
  return r === 0 ? principal / months : (principal * r) / (1 - (1 + r) ** -months);
};

const loan: CalculatorSolver = {
  defaultTarget: 'payment',
  variables: [
    { id: 'payment', label: 'Monthly payment', symbol: 'M', dimension: 'currency', defaultValue: 1199.1, defaultUnit: 'currency' },
    { id: 'principal', label: 'Loan amount', symbol: 'P', dimension: 'currency', defaultValue: 200000, defaultUnit: 'currency' },
    { id: 'months', label: 'Term', symbol: 'n', dimension: 'count', defaultValue: 360, defaultUnit: 'count', bounds: [1, 1200] },
    { id: 'rate', label: 'Interest rate', symbol: 'r', dimension: 'percent', defaultValue: 6, defaultUnit: '%', bounds: [0, 100] }
  ],
  solve: {
    payment: ({ principal, months, rate }) => monthlyPayment(principal, months, rate),
    principal: ({ payment, months, rate }) => payment / monthlyPayment(1, months, rate)
  },
  equation: ({ payment, principal, months, rate }) => payment - monthlyPayment(principal, months, rate),
  outputs: [
    { id: 'totalPaid', label: 'Total paid', dimension: 'currency', compute: ({ payment, months }) => payment * months },
    { id: 'totalInterest', label: 'Total interest', dimension: 'currency', compute: ({ payment, months, principal }) => payment * months - principal }
  ]
};

const solveLoan = (target: string, values: Record<string, string>) => {
  const state: SolverState = initialState(loan);
  state.values = { ...state.values, ...values };
  state.order = [target, ...state.order.filter((id) => id !== target)];
  return solveState(loan, state);
};

describe('amortized loan fixture', () => {
  test('closed-form payment: 200,000 over 360 months at 6% is 1,199.10', () =>
    assert.equal(Math.round(monthlyPayment(200000, 360, 6) * 100) / 100, 1199.1));

  test('solves the rate numerically: ≈ 6.00% APR', () => {
    const { result } = solveLoan('rate', { payment: '1199.10', principal: '200000', months: '360' });
    close(result, 6, 1e-3);
    assert.equal(result.toFixed(2), '6.00');
  });

  test('the solved rate round-trips through the closed-form payment', () => {
    const { result } = solveLoan('rate', { payment: '1199.10', principal: '200000', months: '360' });
    close(monthlyPayment(200000, 360, result), 1199.1, 1e-12);
    for (const apr of [0.5, 3.25, 6, 12.9, 24, 99]) {
      const payment = monthlyPayment(250000, 180, apr);
      close(solveLoan('rate', { payment: String(payment), principal: '250000', months: '180' }).result, apr, 1e-9);
    }
  });

  test('a 0% loan: payment = principal / months, and the rate solves back to 0', () => {
    close(solveLoan('payment', { principal: '36000', months: '36', rate: '0' }).result, 1000);
    close(solveLoan('rate', { payment: '1000', principal: '36000', months: '36' }).result, 0, 1e-9);
  });

  test('solves the term numerically', () =>
    close(solveLoan('months', { payment: '1199.10', principal: '200000', rate: '6' }).result, 360, 1e-4));

  test('a payment below principal / months has no rate ≥ 0: NaN', () =>
    assert.ok(Number.isNaN(solveLoan('rate', { payment: '500', principal: '200000', months: '360' }).result)));

  test('a payment that never covers the interest has no term: NaN', () =>
    assert.ok(Number.isNaN(solveLoan('months', { payment: '900', principal: '200000', rate: '6' }).result)));

  test('a closed-form entry wins over the equation', () =>
    close(solveLoan('principal', { payment: '1199.10', months: '360', rate: '6' }).result, 200000, 1e-5));
});

describe('extra outputs', () => {
  test('total paid and total interest from the solved set', () => {
    const { result, outputs, si } = solveLoan('payment', { principal: '200000', months: '360', rate: '6' });
    close(si.payment, result);
    close(outputs.totalPaid, result * 360);
    close(outputs.totalInterest, result * 360 - 200000);
    assert.equal(Math.round(outputs.totalInterest), 231676);
  });

  test('use the numerically solved value too', () => {
    const { outputs } = solveLoan('rate', { payment: '1199.10', principal: '200000', months: '360' });
    close(outputs.totalPaid, 431676);
    close(outputs.totalInterest, 231676);
  });

  test('are NaN when there is no answer', () => {
    const { outputs } = solveLoan('rate', { payment: '500', principal: '200000', months: '360' });
    assert.deepEqual(outputs, { totalPaid: NaN, totalInterest: NaN });
    assert.deepEqual(solveLoan('payment', { principal: '' }).outputs, { totalPaid: NaN, totalInterest: NaN });
  });
});

// Test-only fixture: compound interest with monthly contributions at the end of each month.
// Time is in SI seconds, so years = t / one year.
const YEAR = toBase(1, 'time', 'yr');
const futureValue = (principal: number, monthly: number, apr: number, seconds: number) => {
  const i = apr / 100 / 12;
  const n = (12 * seconds) / YEAR;
  return i === 0 ? principal + monthly * n : principal * (1 + i) ** n + (monthly * ((1 + i) ** n - 1)) / i;
};

const savings: CalculatorSolver = {
  defaultTarget: 'future',
  variables: [
    { id: 'future', label: 'Future value', symbol: 'FV', dimension: 'currency', defaultValue: 0, defaultUnit: 'currency' },
    { id: 'principal', label: 'Initial deposit', symbol: 'P', dimension: 'currency', defaultValue: 10000, defaultUnit: 'currency' },
    { id: 'monthly', label: 'Monthly contribution', symbol: 'C', dimension: 'currency', defaultValue: 200, defaultUnit: 'currency', fixed: true },
    { id: 'rate', label: 'Annual return', symbol: 'r', dimension: 'percent', defaultValue: 7, defaultUnit: '%', bounds: [0, 100] },
    { id: 'time', label: 'Time', symbol: 't', dimension: 'time', defaultValue: 20, defaultUnit: 'yr', bounds: [0, 200 * YEAR] }
  ],
  solve: { future: ({ principal, monthly, rate, time }) => futureValue(principal, monthly, rate, time) },
  equation: ({ future, principal, monthly, rate, time }) => future - futureValue(principal, monthly, rate, time)
};

describe('compound interest with monthly contributions', () => {
  const target = futureValue(10000, 200, 7, 20 * YEAR);
  const solveSavings = (id: string, values: Record<string, string>) => {
    const state = initialState(savings);
    state.values = { ...state.values, ...values };
    state.order = [id, ...state.order.filter((item) => item !== id)];
    return solveState(savings, state).result;
  };

  test('closed-form future value: 10,000 + 200/month at 7% for 20 years ≈ 144,573', () =>
    assert.equal(Math.round(target), 144573));

  test('solves the years numerically', () =>
    close(solveSavings('time', { future: String(target) }) / YEAR, 20, 1e-9));

  test('the auto field’s unit does not change the SI answer', () => {
    const state = initialState(savings);
    state.values.future = String(target);
    state.units.time = 'mo';
    state.order = ['time', ...state.order.filter((id) => id !== 'time')];
    close(solveState(savings, state).result, 20 * YEAR, 1e-9);
  });

  test('solves the rate numerically', () => close(solveSavings('rate', { future: String(target) }), 7, 1e-9));

  test('a goal below what you put in has no rate ≥ 0: NaN', () =>
    assert.ok(Number.isNaN(solveSavings('rate', { future: '50000' }))));
});
