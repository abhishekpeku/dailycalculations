import type { CalculatorContent } from '@/data/calculators';
import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';

type Props = {
  concept: NonNullable<CalculatorContent['concept']>;
};

export default function ConceptSection({ concept }: Props) {
  return (
    <section id="concept" className={CARD}>
      <SectionHeading section="concept" title={concept.title} />
      <div className="mt-5 space-y-4 text-base leading-7 text-slate-600 dark:text-slate-300">
        {concept.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
