import type { CalculatorContent } from '@/data/calculators';

type Props = {
  title: string;
  items: CalculatorContent['watchOut'];
};

export default function WatchOutSection({ title, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="watch-out" className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      <ul className="mt-6 space-y-5">
        {items.map((item) => (
          <li key={item.title}>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
