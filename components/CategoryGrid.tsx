import { Link } from '@/i18n/navigation';
import type { CalculatorCategory } from '@/data/calculators';

export default function CategoryGrid({ category }: { category: CalculatorCategory }) {
  return (
    <Link href={`/categories/${category.id}`} className="group rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel transition hover:-translate-y-0.5 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700 dark:text-brand-300">{category.title}</p>
        <p className="text-base leading-7 text-slate-700 dark:text-slate-300">{category.description}</p>
      </div>
    </Link>
  );
}
