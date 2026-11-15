'use client';

import { Fragment, useMemo, useState } from 'react';
import { formatMoney } from '@/lib/calculator';
import { amortizationSchedule, amortizationMonthlySchedule, type AmortizationMonth } from '@/lib/amortization';

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

const money = formatMoney;

// A year row's monthly breakdown, shaded and indented beneath it. Uses the overall 1-based month
// number (not reset per year) so a reader can tell where in the loan's life each row falls.
function MonthRows({ rows, format }: { rows: AmortizationMonth[]; format: (value: number) => string }) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.month} className="bg-slate-50 text-xs dark:bg-slate-900/40">
          <th scope="row" className="py-1 pr-2 pl-6 text-left font-normal text-slate-500 dark:text-slate-400">Month {row.month}</th>
          <td className="px-2 py-1 text-slate-600 dark:text-slate-300">{format(row.interest)}</td>
          <td className="px-2 py-1 text-slate-600 dark:text-slate-300">{format(row.principal)}</td>
          <td className="py-1 pl-2 font-medium text-slate-700 dark:text-slate-200">{format(row.balance)}</td>
        </tr>
      ))}
    </>
  );
}

// Matches the disclosure chevron used elsewhere (components/Header.tsx).
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={12}
      height={12}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Yearly interest, principal and balance, each year expandable to its monthly rows. The math lives
// in lib/amortization.ts.
export default function AmortizationTable({ principal, annualRate, months, payment, format = money, initialYears = 5 }: AmortizationTableProps) {
  const monthlyRows = useMemo(() => amortizationMonthlySchedule(principal, annualRate, months, payment), [principal, annualRate, months, payment]);
  // Only worth grouping into years once there's more than one year of monthly rows to collapse.
  const yearlyRows = useMemo(
    () => (months > 12 ? amortizationSchedule(principal, annualRate, months, payment) : []),
    [principal, annualRate, months, payment]
  );
  const monthsByYear = useMemo(() => {
    const map = new Map<number, AmortizationMonth[]>();
    for (const row of monthlyRows) {
      const list = map.get(row.year);
      if (list) list.push(row);
      else map.set(row.year, [row]);
    }
    return map;
  }, [monthlyRows]);

  const [expanded, setExpanded] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  if (!monthlyRows.length) return null;

  const toggleYear = (year: number) =>
    setExpandedYears((previous) => {
      const next = new Set(previous);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });

  // A term of a year or less has no useful yearly rollup — show the months directly.
  if (months <= 12) {
    return (
      <div className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[18rem] text-right text-sm tabular-nums">
            <caption className="sr-only">Amortization schedule by month: interest paid, principal paid and the balance at the end of each month.</caption>
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th scope="col" className="py-2 pr-2 text-left">Month</th>
                <th scope="col" className="px-2 py-2">Interest</th>
                <th scope="col" className="px-2 py-2">Principal</th>
                <th scope="col" className="py-2 pl-2">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
              {monthlyRows.map((row) => (
                <tr key={row.month}>
                  <th scope="row" className="py-1.5 pr-2 text-left font-medium text-slate-900 dark:text-white">{row.month}</th>
                  <td className="px-2 py-1.5">{format(row.interest)}</td>
                  <td className="px-2 py-1.5">{format(row.principal)}</td>
                  <td className="py-1.5 pl-2 font-semibold text-slate-900 dark:text-white">{format(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const visible = expanded ? yearlyRows : yearlyRows.slice(0, initialYears);
  const hidden = yearlyRows.length - visible.length;

  return (
    <div className="pt-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[18rem] text-right text-sm tabular-nums">
          <caption className="sr-only">
            Amortization schedule by year: interest paid, principal paid and the balance at the end of each year. Expand a year to see its monthly breakdown.
          </caption>
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th scope="col" className="py-2 pr-2 text-left">Year</th>
              <th scope="col" className="px-2 py-2">Interest</th>
              <th scope="col" className="px-2 py-2">Principal</th>
              <th scope="col" className="py-2 pl-2">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
            {visible.map((row) => {
              const isOpen = expandedYears.has(row.year);
              return (
                <Fragment key={row.year}>
                  <tr>
                    <th scope="row" className="py-1.5 pr-2 text-left font-medium text-slate-900 dark:text-white">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleYear(row.year)}
                        className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <Chevron open={isOpen} />
                        {row.year}
                      </button>
                    </th>
                    <td className="px-2 py-1.5">{format(row.interest)}</td>
                    <td className="px-2 py-1.5">{format(row.principal)}</td>
                    <td className="py-1.5 pl-2 font-semibold text-slate-900 dark:text-white">{format(row.balance)}</td>
                  </tr>
                  {isOpen ? <MonthRows rows={monthsByYear.get(row.year) ?? []} format={format} /> : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {yearlyRows.length > initialYears ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="mt-3 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {expanded ? `Show first ${initialYears} years` : `Show all ${yearlyRows.length} years (${hidden} more)`}
        </button>
      ) : null}
    </div>
  );
}
