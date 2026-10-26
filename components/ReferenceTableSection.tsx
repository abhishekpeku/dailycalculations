import type { CalculatorContent } from '@/data/calculators';
import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';
import { formatDecimal } from '@/lib/calculator';

type Props = {
  title: string;
  referenceTable: NonNullable<CalculatorContent['referenceTable']>;
};

// A generic computed reference table, parallel to CommonValuesSection but for pages whose numbers
// are not a lib/units.ts unit factor (e.g. an ingredient's density) — see
// mdFiles/steps/42-wave-1-conversion.md, "Run 6". Server-rendered, static, same card/table styling.
export default function ReferenceTableSection({ title, referenceTable }: Props) {
  const { columns, rows, decimals = 0, note } = referenceTable;

  return (
    <section id="reference-table" className={CARD}>
      <SectionHeading section="reference-table" title={title} />
      <div className="mt-6 overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950/60">
        <table className="w-full text-sm">
          <caption className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">{referenceTable.title}</caption>
          <thead>
            <tr className="border-t border-slate-100 dark:border-slate-800">
              {columns.map((column) => (
                <th key={column} scope="col" className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{row.label}</td>
                {row.values.map((value, index) => (
                  <td key={index} className="px-4 py-2.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatDecimal(value, decimals)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{note}</p> : null}
    </section>
  );
}
