import type { CalculatorContent } from '@/data/calculators';
import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';
import { cellText, columnHeader, convert } from '@/lib/commonValues';

type Props = {
  title: string;
  commonValues: NonNullable<CalculatorContent['commonValues']>;
};

export default function CommonValuesSection({ title, commonValues }: Props) {
  const { dimension, from, to, values, reverse, decimals = 2 } = commonValues;

  return (
    <section id="common-values" className={CARD}>
      <SectionHeading section="common-values" title={title} />
      <div className="mt-6 space-y-8">
        <div className="overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950/60">
          <table className="w-full text-sm">
            <caption className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">{commonValues.title}</caption>
            <thead>
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <th scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">{columnHeader(dimension, from)}</th>
                <th scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">{columnHeader(dimension, to)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {values.map((value) => (
                <tr key={value}>
                  <td className="px-4 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">{cellText(value, dimension, from, decimals)}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {cellText(convert(value, dimension, from, to), dimension, to, decimals)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reverse ? (
          <div className="overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950/60">
            <table className="w-full text-sm">
              <caption className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">{reverse.title}</caption>
              <thead>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">{columnHeader(dimension, to)}</th>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">{columnHeader(dimension, from)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reverse.values.map((value) => (
                  <tr key={value}>
                    <td className="px-4 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">{cellText(value, dimension, to, decimals)}</td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                      {cellText(convert(value, dimension, to, from), dimension, from, decimals)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
