'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { matchesQuery, type SearchableCalculator } from '@/lib/search';

type SearchItem = SearchableCalculator;

type Props = {
  calculators: SearchItem[];
  searchLabel?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
};

// Homepage-only hero search: an empty query shows nothing (no default grid), and a non-empty one
// overlays a dropdown of results instead of pushing the page's layout down.
export default function CalculatorSearch({
  calculators,
  searchLabel = 'Search calculators',
  searchPlaceholder = 'Mortgage, BMI, miles, sales tax...',
  noResultsLabel = 'No calculators match.'
}: Props) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return [];
    return calculators.filter((calculator) => matchesQuery(calculator, trimmed)).slice(0, 8);
  }, [calculators, trimmed]);

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="search">
        {searchLabel}
      </label>
      <div className="relative">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E6E73] dark:text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('');
          }}
          placeholder={searchPlaceholder}
          autoComplete="off"
          className="h-[60px] w-full rounded-full border border-slate-200 bg-white pl-14 pr-5 text-base text-[#1D1D1F] shadow-[0_8px_30px_rgba(15,23,42,0.08)] outline-none transition focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      {trimmed && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-white text-left shadow-[0_20px_50px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
          {filtered.length > 0 ? (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {filtered.map((calculator) => (
                <li key={calculator.id}>
                  <Link href={`/calculators/${calculator.id}`} className="block px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                    <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">{calculator.title}</p>
                    <p className="mt-0.5 text-xs text-[#6E6E73] dark:text-slate-400">{calculator.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-[#6E6E73] dark:text-slate-400">{noResultsLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
