// Fixed-rate loan schedule for components/visuals/AmortizationTable. Tested in amortization.spec.ts.

export type AmortizationYear = { year: number; interest: number; principal: number; balance: number };

/** Level monthly payment. `annualRate` is the percent number (6 means 6%). */
export function monthlyPayment(principal: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  if (!(months > 0) || !Number.isFinite(principal) || !Number.isFinite(r)) return NaN;
  return r === 0 ? principal / months : (principal * r) / (1 - (1 + r) ** -months);
}

/**
 * Month-by-month amortization rolled up into yearly rows. The final payment is trimmed so the balance
 * ends at exactly 0 and the principal column sums to the loan. Empty when the payment never covers
 * the interest or the inputs are not usable.
 */
export function amortizationSchedule(principal: number, annualRate: number, months: number, payment?: number): AmortizationYear[] {
  const r = annualRate / 100 / 12;
  const pay = payment ?? monthlyPayment(principal, annualRate, months);
  if (!(principal > 0) || !(months > 0) || !(r >= 0) || !(pay > 0) || pay <= principal * r) return [];

  const rows: AmortizationYear[] = [];
  let balance = principal;
  // A custom payment can pay off early; cap the length so a tiny payment can't loop for ever.
  const limit = Math.min(Math.ceil(months), 1200);
  for (let month = 1; month <= limit && balance > 0; month++) {
    const interest = balance * r;
    const toPrincipal = month === limit ? balance : Math.min(balance, pay - interest);
    balance -= toPrincipal;
    if (balance < 1e-6) balance = 0;
    const year = Math.ceil(month / 12);
    if (rows.length < year) rows.push({ year, interest: 0, principal: 0, balance: 0 });
    const row = rows[year - 1];
    row.interest += interest;
    row.principal += toPrincipal;
    row.balance = balance;
  }
  return rows;
}
