import { formatSignificant } from '@/lib/calculator';
import { findBand, linearPosition, tint, type Band } from '@/lib/visuals';

type RangeBarProps = {
  /** Contiguous, ascending bands. The lower bound is inclusive, the upper exclusive. */
  bands: Band[];
  value: number;
  accent: string;
  title?: string;
  /** The value as shown on the marker, e.g. "BMI 23.4". Defaults to the formatted number. */
  valueLabel?: string;
  format?: (value: number) => string;
  summary?: string;
};

// Colored bands (BMI WHO categories, typical engagement rates) with a marker for the value.
export default function RangeBar({ bands, value, accent, title, valueLabel, format = formatSignificant, summary }: RangeBarProps) {
  if (!bands.length) return null;
  const min = bands[0].min;
  const max = bands[bands.length - 1].max;
  const span = max - min;
  const position = linearPosition(value, min, max);
  const active = findBand(bands, value);
  const shown = valueLabel ?? format(value);
  const color = (band: Band, index: number) => band.color ?? tint(accent, 0.25 + (0.75 * index) / Math.max(1, bands.length - 1));
  const label =
    summary ??
    (Number.isFinite(position) ? `${title ?? 'Range'}: ${shown} falls in the ${bands[active].label} band.` : `${title ?? 'Range'}: no value to show.`);

  return (
    <div className="pt-2">
      {title ? <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p> : null}
      {/* The marker is kept off the edges so its label never overflows a narrow screen. */}
      <div role="img" aria-label={label} className="mt-3">
        <div className="relative h-8">
          {Number.isFinite(position) ? (
            <div className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `clamp(1.75rem, ${position}%, calc(100% - 1.75rem))` }}>
              <span className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white" style={{ backgroundColor: accent }}>
                {shown}
              </span>
              <span className="h-0 w-0 border-x-4 border-t-4 border-x-transparent" style={{ borderTopColor: accent }} />
            </div>
          ) : null}
        </div>
        <svg className="mt-1 block h-3 w-full overflow-hidden rounded-full" aria-hidden="true">
          {bands.map((band, index) => (
            <rect
              key={band.label}
              x={`${((band.min - min) / span) * 100}%`}
              width={`${((band.max - band.min) / span) * 100}%`}
              height="100%"
              fill={color(band, index)}
              opacity={active === -1 || active === index ? 1 : 0.55}
            />
          ))}
        </svg>
        <div className="mt-1.5 flex text-[11px] leading-tight text-slate-500 dark:text-slate-400">
          {bands.map((band, index) => (
            <div key={band.label} className="min-w-0 px-0.5 first:pl-0 last:pr-0" style={{ width: `${((band.max - band.min) / span) * 100}%` }}>
              <p className={`break-words ${index === active ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>{band.label}</p>
              <p className="tabular-nums text-slate-400">{index === 0 ? `< ${format(band.max)}` : index === bands.length - 1 ? `≥ ${format(band.min)}` : `${format(band.min)}–${format(band.max)}`}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
