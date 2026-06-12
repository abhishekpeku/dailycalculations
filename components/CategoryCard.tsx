import { Link } from '@/i18n/navigation';
import type { CalculatorCategory } from '@/data/calculators';

type Props = {
  category: CalculatorCategory;
  count: number;
  toolsLabel?: string;
};

export default function CategoryCard({ category, count, toolsLabel }: Props) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="group block rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel transition hover:-translate-y-0.5 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-950/90"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{category.title}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{category.description}</p>
        </div>
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {toolsLabel ?? `${count} tools`}
        </span>
      </div>
    </Link>
  );
}
