'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';

type SearchItem = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  calculators: SearchItem[];
  searchLabel?: string;
  searchPlaceholder?: string;
};

const fuzzyFilter = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase());

export default function CalculatorSearch({ calculators, searchLabel = 'Search calculators', searchPlaceholder = 'Mortgage, BMI, miles, sales tax...' }: Props) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query.trim()) return calculators.slice(0, 6);
    return calculators.filter((calculator) => fuzzyFilter(calculator.title, query) || fuzzyFilter(calculator.description, query)).slice(0, 8);
  }, [calculators, query]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="search">
        {searchLabel}
      </label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((calculator) => (
          <Link key={calculator.id} href={`/calculators/${calculator.id}`} className="rounded-3xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-800 transition hover:border-brand-200 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100">
            <p className="font-semibold">{calculator.title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{calculator.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
