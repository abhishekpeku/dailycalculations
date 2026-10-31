import type { Flow } from '@/lib/howItWorks';
import { TILE_COLORS } from '@/components/IconTile';
import { categoryTheme, CARD } from '@/lib/categoryTheme';

// The intro card beside a v2 calculator's widget: an automatic inputs -> output diagram (from
// lib/howItWorks.ts), the description, "Also called" tags and a compact trust row. Every string is
// already translated/formatted by page.tsx — this component is plain presentation, no translator.
// See mdFiles/steps/ux-02-calculator-intro-diagram.md.

// Fixed so the SVG connector's math is exact, independent of font metrics.
const PILL_HEIGHT = 36;
const PILL_GAP = 6;
const MAX_PILLS = 4;

type TrustItem = { icon?: 'check' | 'book'; text: string; href?: string };

type Props = {
  category: string;
  flow: Flow | null;
  description: string;
  aliases: string[];
  diagramSummary: string | null;
  howItWorksLabel: string;
  orSolveAnyLabel: string;
  /** Pre-formatted "+N more" text, or null when there are 5 or fewer inputs. */
  moreInputsLabel: string | null;
  alsoCalledLabel: string;
  trust: TrustItem[];
};

function Pill({ symbol, label }: { symbol?: string; label: string }) {
  return (
    <div className="flex h-9 min-w-0 items-center gap-1.5 rounded-[10px] bg-[#F5F5F7] px-2.5 dark:bg-slate-800" title={label}>
      {symbol ? (
        <span className="w-[14px] shrink-0 font-serif text-[14px] italic font-bold leading-none text-[#6E6E73] dark:text-slate-400">{symbol}</span>
      ) : null}
      <span className="min-w-0 truncate text-[13px] text-slate-700 dark:text-slate-200">{label}</span>
    </div>
  );
}

// aria-hidden checkmark/book glyphs, sized to sit inline with the 12px trust-row text.
function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="#28A745" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM19 19v2H6" />
    </svg>
  );
}

// The inputs -> output connector: one bezier per pill, converging on the pill column's own vertical
// center. Because the pill column and this SVG are the same height and sit in the same
// `items-center` row as the output box, that center line is also the output box's center — no DOM
// measurement needed.
function Connector({ pillCount }: { pillCount: number }) {
  const height = pillCount * PILL_HEIGHT + (pillCount - 1) * PILL_GAP;
  const cy = height / 2;
  return (
    <svg aria-hidden="true" width={64} height={height} viewBox={`0 0 64 ${height}`} className="shrink-0">
      {Array.from({ length: pillCount }, (_, index) => {
        const y = index * (PILL_HEIGHT + PILL_GAP) + PILL_HEIGHT / 2;
        return <path key={index} d={`M0,${y} C26,${y} 26,${cy} 48,${cy}`} fill="none" stroke="#AEAEB2" strokeWidth={1.5} strokeLinecap="round" />;
      })}
      <path d={`M46,${cy - 4} L60,${cy} L46,${cy + 4} Z`} fill="#AEAEB2" />
    </svg>
  );
}

function OutputBox({ output, orSolveAnyLabel, solveAny, category }: { output: Flow['output']; orSolveAnyLabel: string; solveAny: boolean; category: string }) {
  const [from, to] = TILE_COLORS[categoryTheme(category).color];
  return (
    <div className="w-[120px] shrink-0 rounded-2xl p-3.5 text-center text-white" style={{ backgroundImage: `linear-gradient(160deg, ${from}, ${to})` }}>
      {output.symbol ? <p className="font-serif text-[28px] italic font-bold leading-none">{output.symbol}</p> : null}
      <p className={`text-[13px] font-semibold leading-snug ${output.symbol ? 'mt-1' : ''}`}>{output.label}</p>
      {solveAny ? <p className="mt-0.5 text-[11px] leading-snug text-white/80">{orSolveAnyLabel}</p> : null}
    </div>
  );
}

export default function HowItWorksCard({
  category,
  flow,
  description,
  aliases,
  diagramSummary,
  howItWorksLabel,
  orSolveAnyLabel,
  moreInputsLabel,
  alsoCalledLabel,
  trust
}: Props) {
  const pills = flow ? flow.inputs.slice(0, flow.inputs.length > 5 ? MAX_PILLS : flow.inputs.length) : [];
  const moreCount = flow && flow.inputs.length > 5 ? flow.inputs.length - MAX_PILLS : 0;
  const pillCount = pills.length + (moreCount > 0 ? 1 : 0);

  return (
    <div className={`${CARD} space-y-5`}>
      {flow ? (
        <div className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#6E6E73] dark:text-slate-400">{howItWorksLabel}</p>
          <div className="flex items-center gap-2" aria-hidden="true">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              {pills.map((input, index) => (
                <Pill key={index} symbol={input.symbol} label={input.label} />
              ))}
              {moreCount > 0 && moreInputsLabel ? <Pill label={moreInputsLabel} /> : null}
            </div>
            <Connector pillCount={pillCount} />
            <OutputBox output={flow.output} orSolveAnyLabel={orSolveAnyLabel} solveAny={flow.solveAny} category={category} />
          </div>
          {diagramSummary ? <p className="sr-only">{diagramSummary}</p> : null}
        </div>
      ) : null}

      <p className="text-[15px] leading-relaxed text-[#3A3A3C] dark:text-slate-300">{description}</p>

      {aliases.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] text-[#6E6E73] dark:text-slate-400">{alsoCalledLabel}</span>
          {aliases.map((alias) => (
            <span key={alias} className="rounded-md bg-[#F2F2F7] px-2 py-1 text-[12px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {alias}
            </span>
          ))}
        </div>
      ) : null}

      {trust.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#515154] dark:text-slate-400">
          {trust.map((item, index) => (
            <span key={index} className="inline-flex items-center gap-1.5">
              {item.icon === 'check' ? <CheckIcon /> : item.icon === 'book' ? <BookIcon /> : null}
              {item.href ? (
                <a href={item.href} className="hover:underline">
                  {item.text}
                </a>
              ) : (
                item.text
              )}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
