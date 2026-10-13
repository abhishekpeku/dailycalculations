// Auto-solve widget state: rotation, fixed fields, share links, no-answer cases.
// See mdFiles/steps/31-solver-v2.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators, type CalculatorSolver } from '../data/calculators.ts';
import { editOrder, initialState, isSingleUnit, parse, plain, readShareParams, shareParams, solveFor, solveState } from './solverState.ts';
import { toBase } from './units.ts';

const force = calculators.find((c) => c.id === 'force-calculator')?.solver as CalculatorSolver;

const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(expected)), `${actual} ≈ ${expected}`);

describe('force-calculator state (unchanged behavior)', () => {
  test('defaults: force is auto, then mass, then acceleration', () => {
    assert.deepEqual(initialState(force), {
      values: { force: '4170', mass: '1500', acceleration: '2.78' },
      units: { force: 'N', mass: 'kg', acceleration: 'm/s2' },
      order: ['force', 'mass', 'acceleration']
    });
  });

  test('typing into the auto field hands auto to the least recently edited field', () => {
    let order = initialState(force).order;
    order = editOrder(order, 'force');
    assert.deepEqual(order, ['mass', 'acceleration', 'force']);
    order = editOrder(order, 'acceleration');
    assert.deepEqual(order, ['mass', 'force', 'acceleration']);
    order = editOrder(order, 'mass');
    assert.deepEqual(order, ['force', 'acceleration', 'mass']);
  });

  test('solves the auto field', () => {
    const state = initialState(force);
    close(solveState(force, state).result, 1500 * 2.78);
    close(solveState(force, { ...state, order: ['mass', 'acceleration', 'force'] }).result, 4170 / 2.78);
    close(solveState(force, { ...state, units: { ...state.units, mass: 't' } }).result, 1.5e6 * 2.78);
  });

  test('blank, non-numeric and divide-by-zero inputs give no answer', () => {
    const state = initialState(force);
    assert.ok(Number.isNaN(solveState(force, { ...state, values: { ...state.values, mass: '' } }).result));
    assert.ok(Number.isNaN(solveState(force, { ...state, values: { ...state.values, mass: 'abc' } }).result));
    const mass = { ...state, order: ['mass', 'force', 'acceleration'] };
    assert.ok(Number.isNaN(solveState(force, { ...mass, values: { ...mass.values, acceleration: '0' } }).result));
  });

  test('share link format: ?solve=…&<id>=…&<id>_unit=…, auto value left out', () => {
    assert.equal(
      shareParams(force, initialState(force)),
      'solve=force&force_unit=N&mass=1500&mass_unit=kg&acceleration=2.78&acceleration_unit=m%2Fs2'
    );
  });

  test('share links round-trip', () => {
    const state = { ...initialState(force), order: ['mass', 'acceleration', 'force'], units: { force: 'kN', mass: 'lb', acceleration: 'g0' } };
    const back = readShareParams(force, initialState(force), `?${shareParams(force, state)}`);
    // Only the auto field travels; the rest keep their default order.
    assert.deepEqual(back.order, ['mass', 'force', 'acceleration']);
    assert.deepEqual(back.units, state.units);
    assert.equal(back.values.force, state.values.force);
    assert.equal(back.values.acceleration, state.values.acceleration);
  });

  test('share links ignore unknown targets, units and non-numbers', () => {
    const defaults = initialState(force);
    assert.equal(readShareParams(force, defaults, ''), defaults);
    const state = readShareParams(force, defaults, '?solve=nope&mass=abc&mass_unit=stone&force=12');
    assert.deepEqual(state.order, defaults.order);
    assert.equal(state.values.mass, '1500');
    assert.equal(state.units.mass, 'kg');
    assert.equal(state.values.force, '12');
  });
});

// Test-only fixture: a mortgage-like solver with an input-only down payment.
const withFixed: CalculatorSolver = {
  defaultTarget: 'a',
  variables: [
    { id: 'a', label: 'A', symbol: 'a', dimension: 'currency', defaultValue: 0, defaultUnit: 'currency' },
    { id: 'b', label: 'B', symbol: 'b', dimension: 'currency', defaultValue: 10, defaultUnit: 'currency' },
    { id: 'down', label: 'Down payment', symbol: 'd', dimension: 'currency', defaultValue: 2, defaultUnit: 'currency', fixed: true },
    { id: 'c', label: 'C', symbol: 'c', dimension: 'count', defaultValue: 4, defaultUnit: 'count' }
  ],
  solve: {
    a: ({ b, down, c }) => (b - down) * c,
    b: ({ a, down, c }) => (c === 0 ? NaN : a / c + down),
    c: ({ a, b, down }) => (b === down ? NaN : a / (b - down))
  }
};

describe('fixed variables', () => {
  test('are left out of the rotation', () => assert.deepEqual(initialState(withFixed).order, ['a', 'b', 'c']));

  test('editing a fixed field does not move auto', () => {
    const order = initialState(withFixed).order;
    assert.equal(editOrder(order, 'down'), order);
  });

  test('auto rotates through the other fields only', () => {
    let order = initialState(withFixed).order;
    const autos: string[] = [];
    for (const id of ['a', 'down', 'b', 'down', 'c', 'a']) {
      order = editOrder(order, id);
      autos.push(order[0]);
    }
    assert.deepEqual(autos, ['b', 'b', 'c', 'c', 'a', 'b']);
  });

  test('are always read as inputs', () => {
    const state = initialState(withFixed);
    close(solveState(withFixed, state).result, 32);
    close(solveState(withFixed, { ...state, order: ['c', 'a', 'b'], values: { ...state.values, a: '32' } }).result, 4);
  });

  test('a share link cannot make a fixed field auto', () => {
    const state = readShareParams(withFixed, initialState(withFixed), '?solve=down&down=5');
    assert.deepEqual(state.order, ['a', 'b', 'c']);
    assert.equal(state.values.down, '5');
  });
});

describe('non-finite values mean no answer', () => {
  // volume = distance × economy, economy in m³/m (so 0 mpg is Infinity in SI).
  const fuel: CalculatorSolver = {
    defaultTarget: 'volume',
    variables: [
      { id: 'volume', label: 'Fuel', symbol: 'V', dimension: 'volume', defaultValue: 10, defaultUnit: 'gal' },
      { id: 'distance', label: 'Distance', symbol: 'd', dimension: 'length', defaultValue: 300, defaultUnit: 'mi' },
      { id: 'economy', label: 'Fuel economy', symbol: 'e', dimension: 'fuelEconomy', defaultValue: 30, defaultUnit: 'mpg' }
    ],
    // No zero guards on purpose: the widget must catch the Infinity itself.
    solve: {
      volume: ({ distance, economy }) => distance * economy,
      distance: ({ volume, economy }) => volume / economy,
      economy: ({ volume, distance }) => volume / distance
    }
  };

  test('30 mpg over 300 mi is 10 gal', () => close(solveState(fuel, initialState(fuel)).result, toBase(10, 'volume', 'gal')));

  test('0 mpg as an input (Infinity in SI)', () => {
    const state = initialState(fuel);
    const solution = solveState(fuel, { ...state, values: { ...state.values, economy: '0' } });
    assert.ok(Number.isNaN(solution.result));
  });

  test('an infinite result (distance 0)', () => {
    const state = { ...initialState(fuel), order: ['economy', 'volume', 'distance'] };
    assert.ok(Number.isNaN(solveState(fuel, { ...state, values: { ...state.values, distance: '0' } }).result));
  });

  test('a solver with neither a solve entry nor an equation', () => {
    assert.ok(Number.isNaN(solveFor({ ...fuel, solve: {} }, 'volume', { distance: 1, economy: 1 })));
  });
});

describe('helpers', () => {
  test('single-unit dimensions', () => {
    assert.ok(isSingleUnit('percent'));
    assert.ok(isSingleUnit('count'));
    assert.ok(isSingleUnit('currency'));
    assert.ok(!isSingleUnit('force'));
  });

  test('parse and plain', () => {
    assert.equal(parse('1,500'), 1500);
    assert.ok(Number.isNaN(parse('  ')));
    assert.equal(plain(1 / 3), '0.333333');
  });
});

describe('every shipped solver is well-formed', () => {
  for (const calculator of calculators.filter((c) => c.solver)) {
    const solver = calculator.solver!;
    test(calculator.id, () => {
      const ids = solver.variables.map((v) => v.id);
      assert.equal(new Set(ids).size, ids.length, 'duplicate variable id');
      const target = solver.variables.find((v) => v.id === solver.defaultTarget);
      assert.ok(target && !target.fixed, 'defaultTarget must be a non-fixed variable');
      for (const variable of solver.variables.filter((v) => !v.fixed)) {
        assert.ok(solver.solve?.[variable.id] || solver.equation, `${variable.id}: no solve entry and no equation`);
      }
      for (const output of solver.outputs ?? []) assert.ok(!ids.includes(output.id), `${output.id}: output id clashes`);
    });
  }
});
