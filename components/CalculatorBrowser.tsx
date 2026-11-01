'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import IconTile from '@/components/IconTile';
import GlyphCalculatorCard from '@/components/GlyphCalculatorCard';
import { categoryTheme, CARD } from '@/lib/categoryTheme';
import { buildListingSearch, matchesQuery, parseListingParams, type SearchableCalculator } from '@/lib/search';

type BrowseCalculator = SearchableCalculator & { category: string; glyph: string };
type BrowseCategory = { id: string; title: string; description: string; count: number };

type Props = {
  calculators: BrowseCalculator[];
  categories: BrowseCategory[];
};

// `/calculators`: a search box above every category as its own section. Starts unfiltered on
// purpose — the page is `force-static`, so this initial render (every category, every
// calculator) is what ends up in the prerendered HTML. Typing swaps the grouped listing for a
// flat cross-category result grid, same pattern as the header's CategoriesMenu filter.
export default function CalculatorBrowser({ calculators, categories }: Props) {
  const t = useTranslations('calculators');
  const tCommon = useTranslations('common');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const applyUrl = () => setQuery(parseListingParams(window.location.search).q);
    applyUrl();
    window.addEventListener('popstate', applyUrl);
    return () => window.removeEventListener('popstate', applyUrl);
  }, []);

  // `replaceState` rather than `router.replace`: a static page has no RSC payload worth
  // re-fetching for a filter change.
  const syncUrl = useCallback((next: string) => {
    const search = buildListingSearch({ q: next, category: '' });
    window.history.replaceState(null, '', `${window.location.pathname}${search}`);
  }, []);

  const updateQuery = (value: string) => {
    setQuery(value);
    syncUrl(value);
  };

  const trimmedQuery = query.trim();
  const filtered = useMemo(
    () => (trimmedQuery ? calculators.filter((calculator) => matchesQuery(calculator, trimmedQuery)) : []),
    [calculators, trimmedQuery]
  );

  return (
    <div className="space-y-6">
      <div className={CARD}>
        <label className="block text-sm font-medium text-[#515154] dark:text-slate-300" htmlFor="calculators-page-search">
          {t('searchLabel')}
        </label>
        <input
          id="calculators-page-search"
          type="search"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="mt-2 w-full rounded-full border border-slate-200 bg-[#F5F5F7] px-5 py-3 text-[#1D1D1F] outline-none transition focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {trimmedQuery ? (
        <div className="space-y-4">
          <p className="text-sm text-[#6E6E73] dark:text-slate-400" aria-live="polite">
            {t('resultCount', { count: filtered.length, total: calculators.length })}
          </p>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
              {filtered.map((calculator) => (
                <GlyphCalculatorCard key={calculator.id} calculator={calculator} />
              ))}
            </div>
          ) : (
            <div className={`${CARD} text-center`}>
              <p className="text-lg font-semibold text-[#1D1D1F] dark:text-white">{t('emptyTitle')}</p>
              <p className="mt-2 text-sm text-[#6E6E73] dark:text-slate-400">{t('emptyBody')}</p>
              <button
                type="button"
                onClick={() => updateQuery('')}
                className="mt-4 rounded-full border border-[#0066CC] px-4 py-2 text-sm font-medium text-[#0066CC] transition hover:bg-[#0066CC]/10"
              >
                {t('clearFilters')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const theme = categoryTheme(category.id);
            const categoryCalculators = calculators.filter((calculator) => calculator.category === category.id);
            if (categoryCalculators.length === 0) return null;
            return (
              <section key={category.id} id={category.id} className={CARD}>
                <div className="flex items-start gap-4">
                  <IconTile icon={theme.icon} color={theme.color} size="lg" />
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">{category.title}</h2>
                    <p className="mt-1 text-sm text-[#515154] dark:text-slate-300">{category.description}</p>
                    <p className="mt-1 text-xs font-medium text-[#6E6E73] dark:text-slate-400">{tCommon('calculators', { count: category.count })}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                  {categoryCalculators.map((calculator) => (
                    <GlyphCalculatorCard key={calculator.id} calculator={calculator} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
