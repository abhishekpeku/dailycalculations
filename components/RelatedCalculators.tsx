import { Link } from '@/i18n/navigation';
import IconTile from '@/components/IconTile';
import SectionHeading from '@/components/SectionHeading';
import { findCalculator } from '@/data/calculators';
import { CARD, categoryTheme } from '@/lib/categoryTheme';
import type { RelatedLink } from '@/lib/seo';

type Props = {
  title: string;
  description: string;
  items: RelatedLink[];
};

export default function RelatedCalculators({ title, description, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="related" className={CARD}>
      <SectionHeading section="related" title={title} />
      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const theme = categoryTheme(findCalculator(item.id)?.category ?? '');
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800"
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
