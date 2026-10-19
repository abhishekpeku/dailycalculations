import type { BreakdownVisual as VisualConfig } from '@/data/calculators';
import { formatOutput, visualKeys, visualParts, type ResolvedOutput } from '@/lib/breakdown';
import AmortizationTable from '@/components/visuals/AmortizationTable';
import CompareBars from '@/components/visuals/CompareBars';
import Donut from '@/components/visuals/Donut';
import LogScale from '@/components/visuals/LogScale';
import RangeBar from '@/components/visuals/RangeBar';
import Timeline from '@/components/visuals/Timeline';

type BreakdownVisualProps = {
  visual: VisualConfig;
  /** Every input, output and derived figure, in display units. */
  all: Record<string, number>;
  describe: (id: string) => ResolvedOutput;
  accent: string;
};

// The type-B visual slot: one kit component, fed by key. Values print like the first key they read.
export default function BreakdownVisual({ visual, all, describe, accent }: BreakdownVisualProps) {
  const label = (id: string) => describe(id).label;
  const first = describe(visualKeys(visual)[0] ?? '');
  const format = (value: number) => formatOutput(value, first);

  switch (visual.type) {
    case 'donut':
      return (
        <Donut
          segments={visualParts(visual.segments, all, label)}
          accent={accent}
          centerLabel={formatOutput(all[visual.center] ?? NaN, describe(visual.center))}
          centerSub={visual.centerSub ?? label(visual.center)}
          format={format}
        />
      );
    case 'compareBars':
      return <CompareBars bars={visualParts(visual.bars, all, label)} accent={accent} title={visual.title} highlight={visual.highlight} format={format} />;
    case 'rangeBar':
      return <RangeBar bands={visual.bands} value={all[visual.value] ?? NaN} accent={accent} title={visual.title} valueLabel={visual.valueLabel} format={format} />;
    case 'timeline':
      return (
        <Timeline
          start={all[visual.start] ?? NaN}
          end={all[visual.end] ?? NaN}
          phases={visual.phases?.map((phase) => ({ label: phase.label, from: all[phase.from] ?? NaN, to: all[phase.to] ?? NaN }))}
          milestones={visual.milestones?.map((milestone) => ({ label: milestone.label, at: all[milestone.at] ?? NaN }))}
          today={visual.today === undefined ? undefined : all[visual.today]}
          startLabel={visual.startLabel}
          endLabel={visual.endLabel}
          accent={accent}
          title={visual.title}
        />
      );
    case 'amortization':
      return (
        <AmortizationTable
          principal={all[visual.principal] ?? NaN}
          annualRate={all[visual.annualRate] ?? NaN}
          months={all[visual.months] ?? NaN}
          payment={visual.payment === undefined ? undefined : all[visual.payment]}
        />
      );
    case 'logScale':
      return (
        <LogScale
          value={all[visual.value] ?? NaN}
          min={visual.min}
          max={visual.max}
          ticks={visual.ticks}
          benchmarks={visual.benchmarks}
          accent={accent}
          title={visual.title}
          valueLabel={visual.valueLabel}
        />
      );
  }
}
