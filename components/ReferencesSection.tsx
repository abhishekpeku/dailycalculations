import type { CalculatorContent } from '@/data/calculators';
import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';

type Props = {
  title: string;
  references: NonNullable<CalculatorContent['references']>;
};

export default function ReferencesSection({ title, references }: Props) {
  if (references.length === 0) return null;

  return (
    <section id="references" className={CARD}>
      <SectionHeading section="references" title={title} />
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600 marker:text-slate-400 dark:text-slate-300">
        {references.map((reference) => (
          <li key={reference.url}>
            <a href={reference.url} rel="noopener" target="_blank" className="text-[#0A6CFF] hover:underline dark:text-[#64B0FF]">
              {reference.label}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
