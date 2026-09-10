import type { CalculatorContent } from '@/data/calculators';

type Props = {
  title: string;
  example: CalculatorContent['workedExample'];
};

export default function WorkedExampleSection({ title, example }: Props) {
  return (
    <section id="worked-example" className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{example.intro}</p>

      <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {example.rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
            <dt className="text-sm text-slate-600 dark:text-slate-300">{row.label}</dt>
            <dd className="text-sm font-medium text-slate-900 dark:text-white">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 rounded-2xl bg-brand-50 px-5 py-4 text-base font-semibold text-brand-700 dark:bg-slate-900 dark:text-brand-100">
        {example.result}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{example.explanation}</p>
    </section>
  );
}
