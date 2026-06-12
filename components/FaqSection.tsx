type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  title?: string;
  description?: string;
  items: FaqItem[];
};

export default function FaqSection({
  title = 'Frequently asked questions',
  description,
  items
}: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <details className="group rounded-2xl border border-slate-200 bg-white/95 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5">
          <span>
            <span className="block text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</span>
            {description ? (
              <span className="mt-2 block text-base leading-7 text-slate-600 dark:text-slate-300">{description}</span>
            ) : null}
          </span>
          <span className="mt-1 text-lg text-brand-700 transition group-open:rotate-45 dark:text-brand-300" aria-hidden="true">
            +
          </span>
        </summary>

        <div className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {items.map((item) => (
            <details key={item.question} className="group/item p-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold text-slate-950 dark:text-white">
                <span>{item.question}</span>
                <span className="mt-1 text-sm text-brand-700 transition group-open/item:rotate-45 dark:text-brand-300" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </details>
    </section>
  );
}
