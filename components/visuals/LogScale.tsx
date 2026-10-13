import { logPosition } from '@/lib/visuals';

export type Benchmark = { label: string; value: number };

type LogScaleProps = {
  value: number;
  /** Powers of ten at the two ends: -2 and 9 draw 0.01 to 1e9. */
  min: number;
  max: number;
  /** Tick labels, spread evenly under the track: pick evenly spaced exponents. */
  ticks: string[];
  benchmarks: Benchmark[];
  accent: string;
  title?: string;
  /** Accessible name of the marker, e.g. "Your force". */
  valueLabel?: string;
  summary?: string;
};

// Orders of magnitude with everyday reference points. Values ≤ 0 draw no marker.
export default function LogScale({ value, min, max, ticks, benchmarks, accent, title, valueLabel = 'Your value', summary }: LogScaleProps) {
  const position = (v: number) => logPosition(v, min, max);
  const valid = Number.isFinite(position(value));
  const below = benchmarks.filter((b) => b.value <= value).sort((a, b) => b.value - a.value)[0];
  const above = benchmarks.filter((b) => b.value > value).sort((a, b) => a.value - b.value)[0];
  const where = [below ? `above ${below.label}` : '', above ? `below ${above.label}` : ''].filter(Boolean).join(' and ');
  const label =
    summary ??
    `${title ?? 'Scale'} (${ticks[0] ?? ''} to ${ticks[ticks.length - 1] ?? ''}): ${valid ? `${valueLabel.toLowerCase()} is ${where || 'marked'}` : 'no value to show'}.`;

  return (
    <div className="pt-2">
      {title ? <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p> : null}
      <div role="img" aria-label={label}>
        <div className="relative mt-10 h-2 rounded-full bg-gradient-to-r from-sky-200 via-indigo-300 to-rose-300 dark:from-sky-900 dark:via-indigo-800 dark:to-rose-900">
          {benchmarks.map((benchmark, index) => (
            <div key={benchmark.label} className="absolute top-0 -translate-x-1/2" style={{ left: `${position(benchmark.value)}%` }}>
              <div className="mx-auto h-2 w-px bg-slate-500/60" />
              <p
                className={`absolute left-1/2 w-24 -translate-x-1/2 text-center text-[11px] leading-tight text-slate-500 dark:text-slate-400 ${index % 2 === 0 ? 'top-4' : '-top-9'}`}
              >
                {benchmark.label}
              </p>
            </div>
          ))}
          {valid ? (
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow transition-all dark:border-slate-950"
              style={{ left: `${position(value)}%`, backgroundColor: accent }}
            />
          ) : null}
        </div>
        <div className="mt-12 flex justify-between text-[11px] text-slate-400">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
