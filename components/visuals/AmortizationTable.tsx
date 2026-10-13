'use client';

import { useMemo, useState } from 'react';
import { formatFull } from '@/lib/calculator';
import { amortizationSchedule } from '@/lib/amortization';

type AmortizationTableProps = {
  principal: number;
  /** Annual rate as the percent number: 6 means 6%. */
  annualRate: number;
  months: number;
  /** A payment other than the level one (e.g. with extra principal). Default: the level payment. */
  payment?: number;
  format?: (value: number) => string;
  /** Rows shown before "Show all years". */
  initialYears?: number;
};

const money = (value: number) => formatFull(Math.round(value * 100) / 100);

// Yearly interest, principal and balance. The math lives in lib/amortization.ts.
export default function AmortizationTable({ principal, annualRate, months, payment, format = money, initialYears = 5 }: AmortizationTableProps) {
  const rows = useMemo(() => amortizationSchedule(principal, annualRate, months, payment), [principal, annualRate, months, payment]);
  const [expanded, setExpanded] = useState(false);
  if (!rows.length) return null;
  const visible = expanded ? rows : rows.slice(0, initialYears);
  const hidden = rows.length - visible.length;

  return (
    <div className="pt-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[18rem] text-right text-sm tabular-nums">
          <caption className="sr-only">Amortization schedule by year: interest paid, principal paid and the balance at the end of each year.</caption>
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th scope="col" className="py-2 pr-2 text-left">Year</th>
              <th scope="col" className="px-2 py-2">Interest</th>
              <th scope="col" className="px-2 py-2">Principal</th>
              <th scope="col" className="py-2 pl-2">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
            {visible.map((row) => (
              <tr key={row.year}>
                <th scope="row" className="py-1.5 pr-2 text-left font-medium text-slate-900 dark:text-white">{row.year}</th>
                <td className="px-2 py-1.5">{format(row.interest)}</td>
                <td className="px-2 py-1.5">{format(row.principal)}</td>
                <td className="py-1.5 pl-2 font-semibold text-slate-900 dark:text-white">{format(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > initialYears ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="mt-3 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {expanded ? `Show first ${initialYears} years` : `Show all ${rows.length} years (${hidden} more)`}
        </button>
      ) : null}
    </div>
  );
}
