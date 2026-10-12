import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  title?: string;
  description?: string;
  items: FaqItem[];
};

// Questions are always listed; each answer opens on tap, iOS disclosure style.
export default function FaqSection({
  title = 'Frequently asked questions',
  description,
  items
}: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section id="faq" className={CARD}>
      <SectionHeading section="faq" title={title} />
      {description ? (
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}

      <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-slate-50 dark:divide-slate-800 dark:bg-slate-950/60">
        {items.map((item) => (
          <details key={item.question} className="group px-4 py-3.5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-semibold text-slate-950 dark:text-white">
              <span>{item.question}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400 transition group-open:rotate-90">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </summary>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
