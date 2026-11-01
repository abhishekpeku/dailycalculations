import { Link } from '@/i18n/navigation';
import GlyphBadge from './GlyphBadge';
import { categoryTheme } from '@/lib/categoryTheme';
import type { NavCalculator } from '@/lib/navData';

// One calculator entry in the categories menu's right pane (desktop grid) or the phone sheet's
// category screen (vertical list) — same markup, the parent controls the layout container.
type Props = {
  calculator: NavCalculator;
  onNavigate: () => void;
};

export default function CalculatorMenuItem({ calculator, onNavigate }: Props) {
  const theme = categoryTheme(calculator.category);
  return (
    <Link
      href={`/calculators/${calculator.id}`}
      onClick={onNavigate}
      className="flex items-start gap-2.5 rounded-[12px] p-2 transition hover:bg-[#F7F7F8] dark:hover:bg-slate-800/60"
    >
      <GlyphBadge glyph={calculator.glyph} color={theme.color} size={32} />
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block truncate text-[14px] font-semibold text-slate-900 dark:text-white">{calculator.title}</span>
        <span className="block truncate text-[12px] text-[#6E6E73] dark:text-slate-400">{calculator.description}</span>
      </span>
    </Link>
  );
}
