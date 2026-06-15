import { Link } from '@/i18n/navigation';
import type { CalculatorConfig } from '@/data/calculators';

type Props = {
  calculator: CalculatorConfig;
  locale: string;
  variant?: 'default' | 'compact';
};

export default function CalculatorCard({ calculator, locale, variant = 'default' }: Props) {
  return (
    <article className={`group rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel transition hover:-translate-y-0.5 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-950/95 ${variant === 'compact' ? 'p-4' : ''}`}>
      <Link href={`/calculators/${calculator.id}`} locale={locale} className="block">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{calculator.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{calculator.description}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{calculator.category}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
