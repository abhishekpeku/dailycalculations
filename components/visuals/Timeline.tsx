import { linearPosition, tint } from '@/lib/visuals';

export type TimelinePhase = { label: string; from: number; to: number };
export type TimelineMilestone = { label: string; at: number };

type TimelineProps = {
  /** Any numeric axis, e.g. days from conception or epoch ms. Format dates into the labels yourself. */
  start: number;
  end: number;
  phases?: TimelinePhase[];
  milestones?: TimelineMilestone[];
  /**
   * Where "today" falls on the axis. Never read the clock during render (pages are static): pass it
   * after mount, and leave it undefined on the server.
   */
  today?: number;
  todayLabel?: string;
  startLabel?: string;
  endLabel?: string;
  accent: string;
  title?: string;
  summary?: string;
};

// A start → end span with phases (trimesters), milestones and a "today" marker (180-day visa window).
export default function Timeline({
  start,
  end,
  phases = [],
  milestones = [],
  today,
  todayLabel = 'Today',
  startLabel,
  endLabel,
  accent,
  title,
  summary
}: TimelineProps) {
  const position = (v: number) => linearPosition(v, start, end);
  const todayAt = today === undefined ? NaN : position(today);
  const current = today === undefined ? undefined : phases.find((phase) => today >= phase.from && today < phase.to);
  const label =
    summary ??
    [
      `${title ?? 'Timeline'}${startLabel && endLabel ? ` from ${startLabel} to ${endLabel}` : ''}.`,
      phases.length ? `Phases: ${phases.map((phase) => phase.label).join(', ')}.` : '',
      milestones.length ? `Milestones: ${milestones.map((m) => m.label).join(', ')}.` : '',
      Number.isFinite(todayAt) ? `${todayLabel} is ${Math.round(todayAt)}% of the way${current ? `, in ${current.label}` : ''}.` : ''
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <div className="pt-2">
      {title ? <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p> : null}
      <div role="img" aria-label={label}>
        <div className="relative mt-3 h-6">
          {Number.isFinite(todayAt) ? (
            <span
              className="absolute bottom-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ left: `clamp(1.5rem, ${todayAt}%, calc(100% - 1.5rem))`, backgroundColor: accent }}
            >
              {todayLabel}
            </span>
          ) : null}
        </div>
        <div className="relative h-7 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
          {phases.map((phase, index) => {
            const left = position(phase.from);
            const width = position(phase.to) - left;
            return (
              <div
                key={phase.label}
                className="absolute inset-y-0 flex items-center justify-center overflow-hidden border-l border-white px-1 text-[11px] font-medium leading-tight text-slate-700 first:border-l-0 dark:border-slate-950 dark:text-slate-100"
                style={{ left: `${left}%`, width: `${width}%`, backgroundColor: tint(accent, [0.18, 0.32, 0.46][index % 3]) }}
              >
                <span className="truncate">{phase.label}</span>
              </div>
            );
          })}
          {Number.isFinite(todayAt) ? <div className="absolute inset-y-0 w-0.5 -translate-x-1/2" style={{ left: `${todayAt}%`, backgroundColor: accent }} /> : null}
        </div>
        <div className={`relative ${milestones.length ? 'h-16' : 'h-2'}`}>
          {milestones.map((milestone, index) => {
            const at = position(milestone.at);
            // Labels near either end hang inward so they never spill past the card.
            const align = at < 12 ? 'left-0 text-left' : at > 88 ? 'right-0 text-right' : 'left-1/2 -translate-x-1/2 text-center';
            return (
              <div key={milestone.label} className="absolute top-0 -translate-x-1/2" style={{ left: `${at}%` }}>
                <div className="mx-auto h-2 w-px bg-slate-500/60" />
                <p className={`absolute w-20 text-[11px] leading-tight text-slate-500 dark:text-slate-400 ${align} ${index % 2 === 0 ? 'top-2.5' : 'top-7'}`}>
                  {milestone.label}
                </p>
              </div>
            );
          })}
        </div>
        {startLabel || endLabel ? (
          <div className="flex justify-between gap-4 text-[11px] tabular-nums text-slate-400">
            <span>{startLabel}</span>
            <span className="text-right">{endLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
