import type { CalculatorContent } from '@/data/calculators';
import SectionHeading from '@/components/SectionHeading';
import { CARD } from '@/lib/categoryTheme';

type Props = {
  title: string;
  items: CalculatorContent['watchOut'];
};

export default function WatchOutSection({ title, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="watch-out" className={CARD}>
      <SectionHeading section="watch-out" title={title} />
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item.title} className="rounded-2xl bg-[#FFF0EF] p-4 dark:bg-[#3A1614]">
            <h3 className="text-base font-semibold text-[#B3261E] dark:text-[#FFA59E]">{item.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
