// Type-B breakdown widget state. See mdFiles/steps/33-type-b-widget.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators, type CalculatorConfig, type CalculatorInput } from '../data/calculators/index.ts';
import {
  alsoInText,
  breakdownShareParams,
  changeUnit,
  computeValues,
  describeKey,
  evaluateBreakdown,
  formatOutput,
  initialBreakdownState,
  inputUnitLabel,
  prettify,
  readBreakdownShareParams,
  resolveBreakdown,
  visualParts
} from './breakdown.ts';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} ≈ ${expected}`);

const byId = (id: string) => {
  const calculator = calculators.find((item) => item.id === id);
  assert.ok(calculator, id);
  return calculator;
};

// A small calculator with a unit field, a percent field and a derived figure.
const roomInputs: CalculatorInput[] = [
  { id: 'length', label: 'Length', type: 'number', placeholder: '10', defaultValue: 10, dimension: 'length', unit: 'ft' },
  { id: 'width', label: 'Width', type: 'number', placeholder: '12', defaultValue: 12, dimension: 'length', unit: 'ft' },
  { id: 'pricePerSqFt', label: 'Price per sq ft', type: 'currency', placeholder: '4', defaultValue: 4 },
  { id: 'waste', label: 'Waste', type: 'percent', placeholder: '10', defaultValue: 10 }
];
const room: Pick<CalculatorConfig, 'inputs' | 'breakdown' | 'compute'> = {
  inputs: roomInputs,
  breakdown: {
    headline: 'totalCost',
    outputs: [
      { id: 'totalCost', label: 'Total' },
      { id: 'area', dimension: 'area', unit: 'ft2', alsoIn: ['m2'] },
      { id: 'wasteCost' }
    ],
    groups: [{ title: 'Room', inputs: ['width', 'length', 'missing'] }, { title: 'Extras', inputs: ['waste'], optional: true }],
    derive: (all) => ({ wasteCost: all.totalCost - all.area * all.pricePerSqFt })
  },
  compute: (v) => {
    const area = v.length * v.width;
    return { totalCost: area * v.pricePerSqFt * (1 + v.waste / 100), area };
  }
};

describe('prettify', () => {
  test('camelCase keys become sentence case', () => {
    assert.equal(prettify('gallonsWithBuffer'), 'Gallons with buffer');
    assert.equal(prettify('monthlyPayment'), 'Monthly payment');
    assert.equal(prettify('bmi'), 'Bmi');
    assert.equal(prettify('co2Kg'), 'Co2 kg');
  });
});

describe('resolveBreakdown', () => {
  test('no config: first compute key is the headline, the rest are rows, one group', () => {
    const mortgage = byId('mortgage-calculator');
    const keys = Object.keys(mortgage.compute(Object.fromEntries(mortgage.inputs.map((i) => [i.id, i.defaultValue]))));
    const resolved = resolveBreakdown(mortgage, keys);
    assert.equal(resolved.headline.id, 'monthlyPayment');
    assert.equal(resolved.headline.label, 'Monthly payment');
    assert.deepEqual(resolved.rows.map((row) => row.id), ['totalCost', 'totalInterest', 'loanPrincipal']);
    assert.ok([resolved.headline, ...resolved.rows].every((output) => output.format === 'currency'));
    assert.equal(resolved.groups.length, 1);
    assert.equal(resolved.groups[0].inputs.length, mortgage.inputs.length);
  });

  test("default formats keep CalculatorForm's money rule", () => {
    const resolved = resolveBreakdown({ inputs: roomInputs }, ['pricePerSqFt', 'waste', 'fuelCost', 'interestRate', 'count']);
    assert.equal(resolved.headline.format, 'currency'); // a currency input's id
    assert.deepEqual(resolved.rows.map((row) => row.format), ['percent', 'currency', 'number', 'number']);
  });

  test('config: order, labels, groups (unknown ids skipped, unlisted inputs last)', () => {
    const resolved = resolveBreakdown(room, ['totalCost', 'area']);
    assert.equal(resolved.headline.label, 'Total');
    assert.equal(resolved.headline.format, 'currency');
    assert.deepEqual(resolved.rows.map((row) => [row.id, row.label, row.format]), [
      ['area', 'Area', 'number'],
      ['wasteCost', 'Waste cost', 'currency']
    ]);
    assert.deepEqual(
      resolved.groups.map((group) => [group.title, group.optional, group.inputs.map((input) => input.id)]),
      [
        ['Room', false, ['width', 'length']],
        ['Extras', true, ['waste']],
        [undefined, false, ['pricePerSqFt']]
      ]
    );
  });

  test('headlineLabel overrides the output label', () => {
    const resolved = resolveBreakdown({ inputs: roomInputs, breakdown: { headline: 'area', headlineLabel: 'Floor' } }, ['totalCost', 'area']);
    assert.equal(resolved.headline.label, 'Floor');
    assert.deepEqual(resolved.rows.map((row) => row.id), ['totalCost']);
  });

  test('describeKey falls back to inputs, then to a guess', () => {
    const resolved = resolveBreakdown(room, ['totalCost', 'area']);
    assert.equal(describeKey('area', resolved, roomInputs).dimension, 'area');
    const width = describeKey('width', resolved, roomInputs);
    assert.deepEqual([width.label, width.dimension, width.unit, width.format], ['Width', 'length', 'ft', 'number']);
    assert.equal(describeKey('pricePerSqFt', resolved, roomInputs).format, 'currency');
    assert.equal(describeKey('repairCost', resolved, roomInputs).format, 'currency');
  });
});

describe('evaluateBreakdown', () => {
  test('every calculator BreakdownCalculator renders gives exactly compute() at its defaults', () => {
    const todayMs = Date.UTC(2026, 5, 17);
    let checked = 0;
    for (const calculator of calculators) {
      if (calculator.solver) continue;
      const defaults = Object.fromEntries(calculator.inputs.map((input) => [input.id, input.defaultValue]));
      const extra: Record<string, number> = calculator.timeDependent ? { todayMs } : {};
      const expected = calculator.compute({ ...defaults, ...extra });
      if (Object.keys(expected).length === 0) continue; // custom tools (type C)
      const { all, outputKeys, complete } = evaluateBreakdown(calculator, initialBreakdownState(calculator.inputs), extra);
      assert.ok(complete, calculator.id);
      assert.deepEqual(outputKeys, Object.keys(expected), calculator.id);
      for (const key of outputKeys) assert.ok(Object.is(all[key], expected[key]), `${calculator.id}.${key}: ${all[key]} vs ${expected[key]}`);
      checked++;
    }
    // Guards against an empty loop only: the count falls as the rollout batches move calculators to type A.
    assert.ok(checked >= 20, `checked ${checked}`);
  });

  test('typed values reach compute() unchanged', () => {
    const tip = byId('tip-calculator');
    const state = initialBreakdownState(tip.inputs);
    state.values.billAmount = '1,234.5';
    const { all } = evaluateBreakdown(tip, state);
    const expected = tip.compute({ ...computeValues(tip.inputs, initialBreakdownState(tip.inputs)), billAmount: 1234.5 });
    for (const [key, value] of Object.entries(expected)) assert.equal(all[key], value);
  });

  test('a blank field computes nothing but keeps the output keys', () => {
    const state = initialBreakdownState(roomInputs);
    state.values.width = ' ';
    const { all, outputKeys, complete } = evaluateBreakdown(room, state);
    assert.equal(complete, false);
    assert.deepEqual(outputKeys, ['totalCost', 'area']);
    assert.ok(Number.isNaN(all.totalCost) && Number.isNaN(all.area));
    assert.equal(all.wasteCost, undefined);
  });

  test('derive adds display-only figures; extra joins the inputs', () => {
    const { all } = evaluateBreakdown(room, initialBreakdownState(roomInputs), { todayMs: 5 });
    close(all.area, 120);
    close(all.totalCost, 528);
    close(all.wasteCost, 48);
    assert.equal(all.todayMs, 5);
  });

  test('a field in another unit is converted to the unit compute() expects', () => {
    const state = changeUnit(roomInputs[0], initialBreakdownState(roomInputs), 'm');
    assert.equal(state.units.length, 'm');
    assert.equal(state.values.length, '3.048');
    close(computeValues(roomInputs, state).length, 10);
    state.values.length = '6.096';
    close(evaluateBreakdown(room, state).all.area, 240);
  });
});

describe('commute-cost-calculator (the demo config)', () => {
  const commute = byId('commute-cost-calculator');

  test('the donut parts add up to the monthly total', () => {
    const { all } = evaluateBreakdown(commute, initialBreakdownState(commute.inputs));
    close(all.monthlyFuel + all.monthlyParking + all.monthlyTolls + all.monthlyWear, all.monthlyTotal);
    const state = initialBreakdownState(commute.inputs);
    state.values.dailyParking = '15';
    state.values.dailyTolls = '3';
    const paid = evaluateBreakdown(commute, state).all;
    close(paid.monthlyTolls, 66);
    close(paid.monthlyFuel + paid.monthlyParking + paid.monthlyTolls + paid.monthlyWear, paid.monthlyTotal);
  });

  test('km and L/100 km give the same cost as the miles and mpg they equal', () => {
    const miles = evaluateBreakdown(commute, initialBreakdownState(commute.inputs)).all;
    let state = initialBreakdownState(commute.inputs);
    state = changeUnit(commute.inputs.find((input) => input.id === 'roundTripMiles')!, state, 'km');
    state = changeUnit(commute.inputs.find((input) => input.id === 'mpg')!, state, 'L/100km');
    const metric = evaluateBreakdown(commute, state).all;
    close(metric.monthlyTotal, miles.monthlyTotal, 1e-5);
    close(metric.roundTripMiles, 25, 1e-5);
  });
});

describe('share params', () => {
  test('only changes are written, and they read back', () => {
    const defaults = initialBreakdownState(roomInputs);
    assert.equal(breakdownShareParams(roomInputs, defaults), '');
    const state = changeUnit(roomInputs[1], { ...defaults, values: { ...defaults.values, waste: '15' } }, 'm');
    const query = breakdownShareParams(roomInputs, state);
    assert.equal(query, 'width=3.6576&width_unit=m&waste=15');
    assert.deepEqual(readBreakdownShareParams(roomInputs, defaults, `?${query}`), state);
  });

  test('unknown ids, non-numbers and unknown units are ignored', () => {
    const defaults = initialBreakdownState(roomInputs);
    const read = readBreakdownShareParams(roomInputs, defaults, '?length=abc&width_unit=parsec&waste_unit=m&nope=4&pricePerSqFt=5');
    assert.deepEqual(read, { ...defaults, values: { ...defaults.values, pricePerSqFt: '5' } });
  });

  test('a menu input only accepts one of its options', () => {
    const inputs: CalculatorInput[] = [
      { id: 'status', label: 'Status', type: 'number', placeholder: '0', defaultValue: 0, options: [{ value: 0, label: 'A' }, { value: 1, label: 'B' }] }
    ];
    const defaults = initialBreakdownState(inputs);
    assert.equal(readBreakdownShareParams(inputs, defaults, '?status=1').values.status, '1');
    assert.equal(readBreakdownShareParams(inputs, defaults, '?status=7').values.status, '0');
  });
});

describe('formatting', () => {
  const output = (o: Parameters<typeof formatOutput>[1]) => o;

  test('currency, percent, number, integer, significant', () => {
    assert.equal(formatOutput(1234.5, output({ id: 'a', label: 'A', format: 'currency' })), '$1,234.50');
    assert.equal(formatOutput(12.345, output({ id: 'a', label: 'A', format: 'percent' })), '12.35%');
    assert.equal(formatOutput(12345.678, output({ id: 'a', label: 'A', format: 'number' })), '12,345.68');
    assert.equal(formatOutput(new Date(2026, 11, 6).getTime(), output({ id: 'a', label: 'A', format: 'date' })), 'December 6, 2026');
    assert.equal(formatOutput(12345.678, output({ id: 'a', label: 'A', format: 'integer' })), '12,346');
    assert.equal(formatOutput(0.000123456, output({ id: 'a', label: 'A', format: 'significant' })), '1.235 × 10^-4');
    assert.equal(formatOutput(NaN, output({ id: 'a', label: 'A', format: 'number' })), '—');
    assert.equal(formatOutput(Infinity, output({ id: 'a', label: 'A', format: 'currency' })), '—');
  });

  test('units follow the value', () => {
    const area = output({ id: 'area', label: 'Area', format: 'number', dimension: 'area', unit: 'ft2', alsoIn: ['m2'] });
    assert.match(formatOutput(120, area), /^120 ft/);
    assert.equal(alsoInText(120, area).length, 1);
    assert.match(alsoInText(120, area)[0], /^11\.15 m/);
    assert.deepEqual(alsoInText(NaN, area), []);
  });

  test('input unit labels', () => {
    assert.equal(inputUnitLabel(roomInputs[0], 'm'), 'm');
    assert.equal(inputUnitLabel(roomInputs[2], ''), '$');
    assert.equal(inputUnitLabel(roomInputs[3], ''), '%');
    assert.equal(inputUnitLabel({ ...roomInputs[3], type: 'number' }, ''), '');
  });
});

describe('visualParts', () => {
  test('parts read inputs, outputs and derived figures, with labels', () => {
    const { all } = evaluateBreakdown(room, initialBreakdownState(roomInputs));
    const parts = visualParts([{ from: 'totalCost' }, { from: 'wasteCost', label: 'Waste', color: '#000000' }, { from: 'nothing' }], all, prettify);
    assert.deepEqual(parts.map((part) => part.label), ['Total cost', 'Waste', 'Nothing']);
    close(parts[0].value, 528);
    assert.equal(parts[1].color, '#000000');
    assert.ok(Number.isNaN(parts[2].value));
  });
});
