import type { CalculatorContent } from '@/data/calculators';

type Props = {
  title: string;
  formula: CalculatorContent['formula'];
};

export default function FormulaSection({ title, formula }: Props) {
  return (
    <section id="formula" className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{formula.intro}</p>

      <pre className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <code>{formula.expression}</code>
      </pre>

      <dl className="mt-6 space-y-4">
        {formula.terms.map((term) => (
          <div key={term.symbol} className="sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="font-mono text-sm font-semibold text-brand-700 dark:text-brand-100">{term.symbol}</dt>
            <dd className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:col-span-2 sm:mt-0">{term.meaning}</dd>
          </div>
        ))}
      </dl>

      {formula.note ? (
        <p className="mt-6 text-sm leading-6 text-slate-500 dark:text-slate-400">{formula.note}</p>
      ) : null}
    </section>
  );
}
