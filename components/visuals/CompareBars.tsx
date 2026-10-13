import { formatSignificant } from '@/lib/calculator';
import { barWidths, tint } from '@/lib/visuals';

export type CompareBar = { label: string; value: number; color?: string };

type CompareBarsProps = {
  /** 2–4 bars, scaled to the largest. Negative values draw as empty bars. */
  bars: CompareBar[];
  accent: string;
  title?: string;
  /** Index of the bar to draw in the full accent (the user's choice, the cheaper option). Default 0. */
  highlight?: number;
  format?: (value: number) => string;
  summary?: string;
};

// Side-by-side amounts: EV vs gas, before vs after, then vs now.
export default function CompareBars({ bars, accent, title, highlight = 0, format = formatSignificant, summary }: CompareBarsProps) {
  const shown = bars.slice(0, 4);
  const widths = barWidths(shown.map((bar) => bar.value));
  const label = summary ?? `${title ?? 'Comparison'}: ${shown.map((bar) => `${bar.label} ${format(bar.value)}`).join(', ')}.`;

  return (
    <div className="pt-2">
      {title ? <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p> : null}
      <div role="img" aria-label={label} className="mt-3 space-y-3">
        {shown.map((bar, index) => (
          <div key={bar.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 text-slate-600 dark:text-slate-300">{bar.label}</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{format(bar.value)}</span>
            </div>
            <svg className="mt-1 block h-3 w-full" aria-hidden="true">
              <rect width="100%" height="100%" rx="6" className="fill-slate-100 dark:fill-slate-800" />
              {widths[index] > 0 ? (
                <rect width={`${Math.max(widths[index], 1.5)}%`} height="100%" rx="6" fill={bar.color ?? (index === highlight ? accent : tint(accent, 0.45))} />
              ) : null}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
