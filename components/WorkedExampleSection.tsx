import type { CalculatorContent } from '@/data/calculators';
import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';

type Props = {
  title: string;
  example: CalculatorContent['workedExample'];
};

export default function WorkedExampleSection({ title, example }: Props) {
  return (
    <section id="worked-example" className={CARD}>
      <SectionHeading section="worked-example" title={title} />
      <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">{example.intro}</p>

      <dl className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-slate-50 dark:divide-slate-800 dark:bg-slate-950/60">
        {example.rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
            <dt className="text-sm text-slate-600 dark:text-slate-300">{row.label}</dt>
            <dd className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 rounded-2xl bg-[#FFF3E0] px-5 py-4 text-lg font-bold tabular-nums text-[#A64B00] dark:bg-[#3A2410] dark:text-[#FFC27A]">
        {example.result}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{example.explanation}</p>
    </section>
  );
}
