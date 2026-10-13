import { TILE_COLORS } from '@/components/IconTile';
import { formatSignificant } from '@/lib/calculator';
import { arcPath, donutSegments } from '@/lib/visuals';

export type DonutPart = { label: string; value: number; color?: string };

type DonutProps = {
  /** 2–6 parts. Negative and non-finite values draw as 0. */
  segments: DonutPart[];
  accent: string;
  /** Big text in the hole, e.g. the total. */
  centerLabel: string;
  centerSub?: string;
  format?: (value: number) => string;
  summary?: string;
};

// The accent first, then a neutral slate that reads in both themes, then other tile colors.
const PALETTE = ['#94A3B8', TILE_COLORS.orange[1], TILE_COLORS.teal[1], TILE_COLORS.pink[1], TILE_COLORS.indigo[1]];

// Parts of a whole: principal vs interest, where a paycheck goes, a budget split.
export default function Donut({ segments, accent, centerLabel, centerSub, format = formatSignificant, summary }: DonutProps) {
  const parts = segments.slice(0, 6);
  const arcs = donutSegments(parts.map((part) => part.value));
  const colors = parts.map((part, index) => part.color ?? (index === 0 ? accent : PALETTE[(index - 1) % PALETTE.length]));
  const percent = (fraction: number) => `${Math.round(fraction * 100)}%`;
  const label =
    summary ??
    `${centerLabel}${centerSub ? ` ${centerSub}` : ''}: ${parts.map((part, index) => `${part.label} ${format(part.value)} (${percent(arcs[index].fraction)})`).join(', ')}.`;

  return (
    <div className="flex flex-col items-center gap-5 pt-2 sm:flex-row sm:items-center">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={label}>
          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="16" className="stroke-slate-100 dark:stroke-slate-800" />
          {arcs.map((arc, index) => (
            <path key={parts[index].label} d={arcPath(50, 50, 48, 32, arc.start, arc.end)} fill={colors[index]} />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center" aria-hidden="true">
          <span className="text-base font-bold leading-tight tabular-nums text-slate-900 dark:text-white">{centerLabel}</span>
          {centerSub ? <span className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">{centerSub}</span> : null}
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-2 text-sm">
        {parts.map((part, index) => (
          <li key={part.label} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: colors[index] }} aria-hidden="true" />
            <span className="min-w-0 flex-1 text-slate-600 dark:text-slate-300">{part.label}</span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{format(part.value)}</span>
            <span className="w-10 text-right text-xs tabular-nums text-slate-400">{percent(arcs[index].fraction)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
