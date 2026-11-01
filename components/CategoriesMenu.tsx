'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import IconTile from './IconTile';
import CategoryMenuRow from './CategoryMenuRow';
import CalculatorMenuItem from './CalculatorMenuItem';
import { categoryTheme } from '@/lib/categoryTheme';
import { matchesQuery } from '@/lib/search';
import type { NavData } from '@/lib/navData';

// A handful of well-known calculators, shown in the right pane's footer row regardless of the
// selected category — a fast path to the site's most-opened tools.
const POPULAR_IDS = ['mortgage-calculator', 'bmi-calculator', 'percentage-calculator', 'miles-to-kilometers-converter'];

type Props = {
  nav: NavData;
  onNavigate: () => void;
};

export default function CategoriesMenu({ nav, onNavigate }: Props) {
  const t = useTranslations('navMenu');
  const defaultCategory = nav.categories.find((category) => category.id === 'finance')?.id ?? nav.categories[0]?.id ?? '';
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [query, setQuery] = useState('');
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const trimmedQuery = query.trim();
  const filtered = useMemo(
    () => (trimmedQuery ? nav.calculators.filter((calculator) => matchesQuery(calculator, trimmedQuery)) : []),
    [nav.calculators, trimmedQuery]
  );

  const activeCategory = nav.categories.find((category) => category.id === selectedCategory) ?? nav.categories[0];
  const categoryCalculators = useMemo(
    () => (activeCategory ? nav.calculators.filter((calculator) => calculator.category === activeCategory.id) : []),
    [nav.calculators, activeCategory]
  );
  const activeTheme = activeCategory ? categoryTheme(activeCategory.id) : categoryTheme('');
  const popular = POPULAR_IDS.map((id) => nav.calculators.find((calculator) => calculator.id === id)).filter(
    (calculator): calculator is NonNullable<typeof calculator> => Boolean(calculator)
  );

  // Arrow-key roving focus across the category rows.
  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const buttons = rowRefs.current.filter((button): button is HTMLButtonElement => button !== null);
    const currentIndex = buttons.findIndex((button) => button === document.activeElement);
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + delta + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  };

  return (
    <div className="flex max-h-[min(640px,80vh)] overflow-hidden rounded-[22px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      {/* Left pane: filter + category list */}
      <div className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="shrink-0 p-3">
          <label htmlFor="categories-menu-filter" className="sr-only">
            {t('filterLabel', { count: nav.calculators.length })}
          </label>
          <input
            id="categories-menu-filter"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('filterLabel', { count: nav.calculators.length })}
            className="w-full rounded-[10px] border border-slate-200 bg-[#F5F5F7] px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div role="listbox" aria-label={t('categoriesHeading')} onKeyDown={handleListKeyDown} className="flex-1 overflow-y-auto px-2 pb-3">
          {nav.categories.map((category, index) => (
            <CategoryMenuRow
              key={category.id}
              category={category}
              active={!trimmedQuery && category.id === selectedCategory}
              chevron
              ref={(element: HTMLButtonElement | null) => {
                rowRefs.current[index] = element;
              }}
              onClick={() => {
                setSelectedCategory(category.id);
                setQuery('');
              }}
            />
          ))}
        </div>
      </div>

      {/* Right pane: either the selected category, or cross-category search results */}
      <div className="flex-1 overflow-y-auto p-5">
        {trimmedQuery ? (
          filtered.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-1">
              {filtered.map((calculator) => (
                <CalculatorMenuItem key={calculator.id} calculator={calculator} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('noMatches', { query: trimmedQuery })}</p>
          )
        ) : activeCategory ? (
          <>
            <div className="mb-4 flex items-start gap-3">
              <IconTile icon={activeTheme.icon} color={activeTheme.color} size="xl" />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-950 dark:text-white">{activeCategory.title}</h3>
                <p className="mt-0.5 text-sm text-[#6E6E73] dark:text-slate-400">{activeCategory.description}</p>
                <Link
                  href={`/categories/${activeCategory.id}`}
                  onClick={onNavigate}
                  className="mt-1 inline-block text-sm font-medium text-brand-700 transition hover:text-brand-500 dark:text-brand-300"
                >
                  {t('openCategoryPage', { category: activeCategory.title })}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-1">
              {categoryCalculators.map((calculator) => (
                <CalculatorMenuItem key={calculator.id} calculator={calculator} onNavigate={onNavigate} />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
              <p className="text-[#6E6E73] dark:text-slate-400">
                {t('popularLabel')}{' '}
                {popular.map((calculator, index) => (
                  <span key={calculator.id}>
                    <Link href={`/calculators/${calculator.id}`} onClick={onNavigate} className="font-medium text-slate-700 underline-offset-2 hover:underline dark:text-slate-200">
                      {calculator.title.replace(' Calculator', '').replace(' Converter', '')}
                    </Link>
                    {index < popular.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </p>
              <Link href="/categories" onClick={onNavigate} className="font-medium text-brand-700 transition hover:text-brand-500 dark:text-brand-300">
                {t('browseAllCategories')}
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
