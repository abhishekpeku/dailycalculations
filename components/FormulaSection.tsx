import type { CalculatorContent } from '@/data/calculators';
import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';

type Props = {
  title: string;
  formula: CalculatorContent['formula'];
};

export default function FormulaSection({ title, formula }: Props) {
  return (
    <section id="formula" className={CARD}>
      <SectionHeading section="formula" title={title} />
      <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">{formula.intro}</p>

      <pre className="mt-6 overflow-x-auto rounded-2xl bg-[#F6EEFD] p-5 font-mono text-base font-semibold leading-8 text-[#7A2BB0] dark:bg-[#2A1838] dark:text-[#E2B8FA]">
        <code>{formula.expression}</code>
      </pre>

      <dl className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
        {formula.terms.map((term) => (
          <div key={term.symbol} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-5">
            <dt className="shrink-0 sm:w-40">
              <span className="inline-block rounded-lg bg-[#F6EEFD] px-2.5 py-1 font-mono text-sm font-semibold text-[#7A2BB0] dark:bg-[#2A1838] dark:text-[#E2B8FA]">{term.symbol}</span>
            </dt>
            <dd className="text-sm leading-6 text-slate-600 dark:text-slate-300">{term.meaning}</dd>
          </div>
        ))}
      </dl>

      {formula.note ? (
        <p className="mt-6 text-sm leading-6 text-slate-500 dark:text-slate-400">{formula.note}</p>
      ) : null}
    </section>
  );
}
