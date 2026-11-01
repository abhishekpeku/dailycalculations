import { Link } from '@/i18n/navigation';
import GlyphBadge from '@/components/GlyphBadge';
import { categoryTheme } from '@/lib/categoryTheme';

// The "GlyphBadge + title + one-line description" card shape RelatedCalculators introduced
// (UX-03) for a single calculator — shared here by /calculators and the /categories/<id> grids
// so the three places a calculator is listed as a card look identical.
type Props = {
  calculator: { id: string; title: string; description: string; category: string; glyph: string };
};

export default function GlyphCalculatorCard({ calculator }: Props) {
  const theme = categoryTheme(calculator.category);
  return (
    <Link
      href={`/calculators/${calculator.id}`}
      className="flex min-w-0 items-center gap-3 rounded-2xl bg-[#F5F5F7] p-3 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800"
    >
      <GlyphBadge glyph={calculator.glyph} color={theme.color} size={36} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[#1D1D1F] dark:text-white">{calculator.title}</span>
        <span className="mt-0.5 block truncate text-xs text-[#6E6E73] dark:text-slate-400">{calculator.description}</span>
      </span>
    </Link>
  );
}
