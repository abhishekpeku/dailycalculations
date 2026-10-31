import { Link } from '@/i18n/navigation';
import IconTile from '@/components/IconTile';
import { findCalculator } from '@/data/calculators';
import { CARD, categoryTheme } from '@/lib/categoryTheme';
import type { RelatedLink } from '@/lib/seo';

type Props = {
  title: string;
  items: RelatedLink[];
  allLabel: string;
  allHref: string;
};

// Sits directly under the calculator, so the next tool is one click away before the long-form docs.
export default function RelatedCalculators({ title, items, allLabel, allHref }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="related" className={`${CARD} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
        <Link href={allHref} className="text-sm font-medium text-[#0066CC] transition hover:underline dark:text-brand-300">
          {allLabel} ›
        </Link>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
        {items.map((item) => {
          const theme = categoryTheme(findCalculator(item.id)?.category ?? '');
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex min-w-0 items-center gap-3 rounded-2xl bg-[#F5F5F7] p-3 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800"
            >
              <IconTile icon={theme.icon} color={theme.color} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-950 first-letter:uppercase dark:text-white">{item.anchor}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
