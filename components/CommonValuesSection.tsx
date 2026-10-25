import type { CalculatorContent } from '@/data/calculators';
import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';
import { cellText, columnHeader, convert } from '@/lib/commonValues';

type Props = {
  title: string;
  commonValues: NonNullable<CalculatorContent['commonValues']>;
};

export default function CommonValuesSection({ title, commonValues }: Props) {
  const { dimension, from, to, values, reverse, decimals = 2, feetInches } = commonValues;
  const fromIsFeetInches = feetInches === 'from';
  const toIsFeetInches = feetInches === 'to';

  return (
    <section id="common-values" className={CARD}>
      <SectionHeading section="common-values" title={title} />
      <div className="mt-6 space-y-8">
        <div className="overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950/60">
          <table className="w-full text-sm">
            <caption className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">{commonValues.title}</caption>
            <thead>
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <th scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">{columnHeader(dimension, from, fromIsFeetInches)}</th>
                <th scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">{columnHeader(dimension, to, toIsFeetInches)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {values.map((value) => (
                <tr key={value}>
                  <td className="px-4 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">{cellText(value, dimension, from, decimals, fromIsFeetInches)}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {cellText(convert(value, dimension, from, to), dimension, to, decimals, toIsFeetInches)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reverse ? (
          <ReverseTable dimension={dimension} from={from} to={to} decimals={decimals} reverse={reverse} />
        ) : null}
      </div>
    </section>
  );
}

type ReverseProps = {
  dimension: NonNullable<CalculatorContent['commonValues']>['dimension'];
  from: string;
  to: string;
  decimals: number;
  reverse: NonNullable<NonNullable<CalculatorContent['commonValues']>['reverse']>;
};

// A reverse table's own columns, in its own left-to-right order: left = the forward table's `to`
// unit (its values), right = the forward table's `from` unit (computed back). `reverse.feetInches`
// is local to those two columns, same 'from' | 'to' convention as the forward table.
function ReverseTable({ dimension, from, to, decimals, reverse }: ReverseProps) {
  const leftIsFeetInches = reverse.feetInches === 'from';
  const rightIsFeetInches = reverse.feetInches === 'to';

  return (
    <div className="overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950/60">
      <table className="w-full text-sm">
        <caption className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">{reverse.title}</caption>
        <thead>
          <tr className="border-t border-slate-100 dark:border-slate-800">
            <th scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">{columnHeader(dimension, to, leftIsFeetInches)}</th>
            <th scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">{columnHeader(dimension, from, rightIsFeetInches)}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {reverse.values.map((value) => (
            <tr key={value}>
              <td className="px-4 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">{cellText(value, dimension, to, decimals, leftIsFeetInches)}</td>
              <td className="px-4 py-2.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                {cellText(convert(value, dimension, to, from), dimension, from, decimals, rightIsFeetInches)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
