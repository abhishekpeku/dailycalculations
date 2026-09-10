'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import CalculatorCard from '@/components/CalculatorCard';
import { buildListingSearch, matchesQuery, parseListingParams, type SearchableCalculator } from '@/lib/search';

type BrowseItem = SearchableCalculator & { category: string };

type Props = {
  calculators: BrowseItem[];
  categories: { id: string; title: string }[];
};

// Only brand shades 50/100/500/700 exist in tailwind.config — anything else emits no class
// and the active chip renders white-on-white.
const chipBase = 'rounded-full border px-4 py-2 text-sm font-medium transition';
const chipOn = 'border-brand-700 bg-brand-700 text-white dark:border-brand-500 dark:bg-brand-500';
const chipOff = 'border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-brand-100';

export default function CalculatorBrowser({ calculators, categories }: Props) {
  // Strings are read here rather than passed down: `resultCount` needs a count at
  // render time, and a formatter function cannot cross the RSC boundary.
  const t = useTranslations('calculators');
  // Starts unfiltered on purpose. The page is `force-static`, so this initial render is
  // what ends up in the prerendered HTML — all 53 cards, crawlable. Reading the URL with
  // `useSearchParams` instead would bail the tree to a Suspense fallback and strip them.
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const applyUrl = () => {
      const params = parseListingParams(window.location.search);
      setQuery(params.q);
      setCategory(params.category);
    };
    applyUrl();
    window.addEventListener('popstate', applyUrl);
    return () => window.removeEventListener('popstate', applyUrl);
  }, []);

  // `replaceState` rather than `router.replace`: a static page has no RSC payload worth
  // re-fetching for a filter change.
  const syncUrl = useCallback((next: { q: string; category: string }) => {
    const search = buildListingSearch(next);
    window.history.replaceState(null, '', `${window.location.pathname}${search}`);
  }, []);

  const updateQuery = (value: string) => {
    setQuery(value);
    syncUrl({ q: value, category });
  };

  const updateCategory = (value: string) => {
    setCategory(value);
    syncUrl({ q: query, category: value });
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    syncUrl({ q: '', category: '' });
  };

  const visibleCategories = useMemo(
    () => categories.filter((item) => calculators.some((calculator) => calculator.category === item.id)),
    [calculators, categories]
  );

  const filtered = useMemo(
    () =>
      calculators.filter(
        (calculator) => (!category || calculator.category === category) && matchesQuery(calculator, query)
      ),
    [calculators, category, query]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-panel dark:border-slate-700 dark:bg-slate-950/80">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="calculator-browser-search">
          {t('searchLabel')}
        </label>
        <input
          id="calculator-browser-search"
          type="search"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label={t('filterLabel')}>
          <button type="button" aria-pressed={category === ''} onClick={() => updateCategory('')} className={`${chipBase} ${category === '' ? chipOn : chipOff}`}>
            {t('allCategories')}
          </button>
          {visibleCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => updateCategory(item.id)}
              className={`${chipBase} ${category === item.id ? chipOn : chipOff}`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
          {t('resultCount', { count: filtered.length, total: calculators.length })}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((calculator) => (
            <CalculatorCard key={calculator.id} calculator={calculator} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-panel dark:border-slate-700 dark:bg-slate-950/80">
          <p className="text-lg font-semibold text-slate-950 dark:text-white">{t('emptyTitle')}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('emptyBody')}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-full border border-brand-500 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-500 dark:text-brand-100 dark:hover:bg-brand-500/10"
          >
            {t('clearFilters')}
          </button>
        </div>
      )}
    </div>
  );
}
