// Amortization schedule. See mdFiles/steps/32-visuals-kit.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { amortizationSchedule, monthlyPayment } from './amortization.ts';

const close = (actual: number, expected: number, tolerance: number) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected}`);
const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);

describe('monthlyPayment', () => {
  test('$200,000 at 6% for 30 years is $1,199.10', () => {
    assert.equal(Math.round(monthlyPayment(200000, 6, 360) * 100) / 100, 1199.1);
  });

  test('0% is the loan split evenly', () => {
    assert.equal(monthlyPayment(12000, 0, 12), 1000);
  });

  test('no term gives NaN', () => {
    assert.ok(Number.isNaN(monthlyPayment(1000, 5, 0)));
  });
});

describe('amortizationSchedule', () => {
  const rows = amortizationSchedule(200000, 6, 360);

  test('$200,000 at 6% for 30 years: 30 yearly rows', () => {
    assert.equal(rows.length, 30);
    assert.deepEqual(rows.map((row) => row.year), Array.from({ length: 30 }, (_, i) => i + 1));
  });

  // The step brief said ≈ $11,933.85. The closed form 12M − (P − B₁₂) and a cent-rounded schedule
  // both give $11,933.19, so that is the anchor.
  test('year-1 interest ≈ $11,933.19', () => {
    close(rows[0].interest, 11933.19, 0.01);
    close(rows[0].interest + rows[0].principal, monthlyPayment(200000, 6, 360) * 12, 1e-6);
  });

  test('ends at a balance of 0, and the principal sums to the loan', () => {
    assert.equal(rows[rows.length - 1].balance, 0);
    close(sum(rows.map((row) => row.principal)), 200000, 1e-6);
  });

  test('total interest is the payments minus the loan', () => {
    const payment = monthlyPayment(200000, 6, 360);
    close(sum(rows.map((row) => row.interest)), payment * 360 - 200000, 1e-4);
  });

  test('balances fall every year', () => {
    for (let i = 1; i < rows.length; i++) assert.ok(rows[i].balance < rows[i - 1].balance);
  });

  test('a partial last year', () => {
    const short = amortizationSchedule(10000, 5, 18);
    assert.equal(short.length, 2);
    assert.equal(short[1].balance, 0);
    close(sum(short.map((row) => row.principal)), 10000, 1e-6);
  });

  test('0% interest', () => {
    const flat = amortizationSchedule(12000, 0, 24);
    assert.equal(flat.length, 2);
    assert.equal(flat[0].interest, 0);
    close(flat[0].principal, 6000, 1e-9);
    assert.equal(flat[1].balance, 0);
  });

  test('a larger payment pays off early', () => {
    const fast = amortizationSchedule(200000, 6, 360, 2000);
    assert.ok(fast.length < 30);
    assert.equal(fast[fast.length - 1].balance, 0);
    close(sum(fast.map((row) => row.principal)), 200000, 1e-6);
  });

  test('unusable inputs give no rows', () => {
    assert.deepEqual(amortizationSchedule(0, 6, 360), []);
    assert.deepEqual(amortizationSchedule(200000, 6, 0), []);
    assert.deepEqual(amortizationSchedule(200000, NaN, 360), []);
    // $1,000 a month never covers $1,000 of monthly interest.
    assert.deepEqual(amortizationSchedule(200000, 6, 360, 1000), []);
  });
});
