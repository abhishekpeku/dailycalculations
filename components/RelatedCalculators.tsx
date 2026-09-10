import { Link } from '@/i18n/navigation';
import type { RelatedLink } from '@/lib/seo';

type Props = {
  title: string;
  description: string;
  items: RelatedLink[];
};

export default function RelatedCalculators({ title, description, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="rounded-3xl border border-slate-200 bg-white/95 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 dark:border-slate-700 dark:bg-slate-950/90"
          >
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">{item.anchor}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
