'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import GlyphCalculatorCard from '@/components/GlyphCalculatorCard';
import { matchesQuery, type SearchableCalculator } from '@/lib/search';

type Item = SearchableCalculator & { category: string; glyph: string; group?: string };

type Props = {
  calculators: Item[];
};

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5';
// Reuses HowItWorksCard's section-eyebrow classes so the two "small uppercase label" spots on the
// site stay visually identical.
const GROUP_HEADING = 'text-[12px] font-semibold uppercase tracking-wide text-[#6E6E73] dark:text-slate-400';

// Splits into labeled sections (UX-06) in the order each `group` is first seen in `items` — i.e.
// the category's own data-file order, not alphabetical. Returns null (no sections, fall back to
// one flat grid) unless every item has a non-empty `group` — a category that hasn't been tagged
// yet, or only partly tagged, should never silently drop a card into nowhere.
function buildGroups(items: Item[]) {
  if (items.length === 0 || items.some((item) => !item.group)) return null;
  const order: string[] = [];
  const byLabel = new Map<string, Item[]>();
  for (const item of items) {
    const label = item.group as string;
    if (!byLabel.has(label)) {
      byLabel.set(label, []);
      order.push(label);
    }
    byLabel.get(label)!.push(item);
  }
  return order.map((label) => ({ label, items: byLabel.get(label)! }));
}

// Search box shown only on the big category pages (today: measurements/math/statistics — see
// the threshold in categories/[category]/page.tsx). Narrows the same category's own grid.
// Unfiltered, a grouped category (every calculator has a `group`) renders labeled sections in
// data-file order (UX-06); typing a query drops back to one flat matched grid — searching should
// surface matches regardless of topic, not fragment them by group. Unfiltered state is what's in
// the prerendered HTML, same `force-static` principle as CalculatorBrowser.
export default function CategoryCalculatorFilter({ calculators }: Props) {
  const t = useTranslations('calculators');
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const filtered = useMemo(
    () => (trimmed ? calculators.filter((calculator) => matchesQuery(calculator, trimmed)) : calculators),
    [calculators, trimmed]
  );
  const groups = useMemo(() => (trimmed ? null : buildGroups(calculators)), [calculators, trimmed]);

  return (
    <div className="space-y-4">
      <label className="sr-only" htmlFor="category-calculator-search">
        {t('searchLabel')}
      </label>
      <input
        id="category-calculator-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full rounded-full border border-slate-200 bg-[#F5F5F7] px-5 py-3 text-[#1D1D1F] outline-none transition focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {trimmed ? (
        <p className="text-sm text-[#6E6E73] dark:text-slate-400" aria-live="polite">
          {t('resultCount', { count: filtered.length, total: calculators.length })}
        </p>
      ) : null}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#6E6E73] dark:text-slate-400">{t('emptyTitle')}</p>
      ) : groups ? (
        <div className="space-y-6">
          {groups.map((section) => (
            <div key={section.label} className="space-y-3">
              <p className={GROUP_HEADING}>
                {section.label} ({section.items.length})
              </p>
              <div className={GRID}>
                {section.items.map((calculator) => (
                  <GlyphCalculatorCard key={calculator.id} calculator={calculator} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={GRID}>
          {filtered.map((calculator) => (
            <GlyphCalculatorCard key={calculator.id} calculator={calculator} />
          ))}
        </div>
      )}
    </div>
  );
}
