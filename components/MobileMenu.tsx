'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ThemeToggle } from './Header';
import IconTile from './IconTile';
import CategoryMenuRow from './CategoryMenuRow';
import CalculatorMenuItem from './CalculatorMenuItem';
import { categoryTheme } from '@/lib/categoryTheme';
import { matchesQuery } from '@/lib/search';
import type { NavData } from '@/lib/navData';

type Props = {
  nav: NavData;
  open: boolean;
  onClose: () => void;
};

// Full-height drill-down sheet for small screens: a category list that swaps to a per-category
// screen, plus a search field that behaves like the desktop panel's filter.
export default function MobileMenu({ nav, open, onClose }: Props) {
  const t = useTranslations('navMenu');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Not just an early return: also a guard for createPortal's document access below, and for a
  // (never-hit in practice, since `open` starts false) server render of this client component.
  if (!open || typeof document === 'undefined') return null;

  const trimmedQuery = query.trim();
  const filtered = trimmedQuery ? nav.calculators.filter((calculator) => matchesQuery(calculator, trimmedQuery)) : [];
  const activeCategory = categoryId ? nav.categories.find((category) => category.id === categoryId) : undefined;
  const activeTheme = activeCategory ? categoryTheme(activeCategory.id) : undefined;
  const activeCalculators = activeCategory ? nav.calculators.filter((calculator) => calculator.category === activeCategory.id) : [];

  const close = () => {
    setCategoryId(null);
    setQuery('');
    onClose();
  };

  // Portaled to <body>: the header's `backdrop-blur` makes it a CSS containing block for fixed
  // descendants (same rule as `transform`/`filter`), which would pin a plain `fixed inset-0` child
  // to the header's own ~70px box instead of the viewport — exactly the bug a portal sidesteps.
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 lg:hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        {activeCategory ? (
          <button type="button" onClick={() => setCategoryId(null)} className="text-sm font-medium text-brand-700 dark:text-brand-300">
            {t('backToCategories')}
          </button>
        ) : (
          <p className="text-base font-semibold text-slate-950 dark:text-white">{t('menuTitle')}</p>
        )}
        <button
          type="button"
          onClick={close}
          aria-label={t('closeMenu')}
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeCategory && activeTheme ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <IconTile icon={activeTheme.icon} color={activeTheme.color} size="xl" />
              <div>
                <h3 className="text-base font-semibold text-slate-950 dark:text-white">{activeCategory.title}</h3>
                <p className="text-sm text-[#6E6E73] dark:text-slate-400">{tCommon('tools', { count: activeCategory.count })}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {activeCalculators.map((calculator) => (
                <CalculatorMenuItem key={calculator.id} calculator={calculator} onNavigate={close} />
              ))}
            </div>

            <Link
              href={`/categories/${activeCategory.id}`}
              onClick={close}
              className="mt-4 inline-block text-sm font-medium text-brand-700 dark:text-brand-300"
            >
              {t('openCategoryPageMobile', { category: activeCategory.title })}
            </Link>
          </>
        ) : (
          <>
            <label htmlFor="mobile-menu-search" className="sr-only">
              {t('searchLabel', { count: nav.calculators.length })}
            </label>
            <input
              id="mobile-menu-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('searchLabel', { count: nav.calculators.length })}
              className="mb-4 w-full rounded-[10px] border border-slate-200 bg-[#F5F5F7] px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            {trimmedQuery ? (
              filtered.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filtered.map((calculator) => (
                    <CalculatorMenuItem key={calculator.id} calculator={calculator} onNavigate={close} />
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('noMatches', { query: trimmedQuery })}</p>
              )
            ) : (
              <>
                <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-[#8E8E93] dark:text-slate-500">
                  {t('categoriesHeading')}
                </p>
                <div role="list" className="mb-4 flex flex-col gap-0.5">
                  {nav.categories.map((category) => (
                    <CategoryMenuRow key={category.id} category={category} chevron onClick={() => setCategoryId(category.id)} />
                  ))}
                </div>
                <div className="flex flex-col gap-1 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
                  <Link href="/" onClick={close} className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    {tNav('home')}
                  </Link>
                  <Link href="/calculators" onClick={close} className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    {tNav('allCalculators')}
                  </Link>
                  <Link href="/about" onClick={close} className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    {tNav('about')}
                  </Link>
                  <Link href="/suggestions" onClick={close} className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    {tNav('suggest')}
                  </Link>
                  <div className="px-3 py-1">
                    <ThemeToggle />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
