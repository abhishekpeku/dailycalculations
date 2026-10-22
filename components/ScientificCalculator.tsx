'use client';

import { useMemo, useState } from 'react';
import { WidgetCard, widgetAccent } from '@/components/CalculatorWidget';
import { evaluateExpression, type AngleMode } from '@/lib/scientificCalc';

// Buttons that insert text into the expression. Function keys append "name(" so the parser's
// no-parens fallback is never relied on in normal use (typing is still forgiving of it).
const FUNCTION_KEYS: { label: string; insert: string }[] = [
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'tan', insert: 'tan(' },
  { label: 'xʸ', insert: '^' },
  { label: '√', insert: '√(' },
  { label: 'sin⁻¹', insert: 'asin(' },
  { label: 'cos⁻¹', insert: 'acos(' },
  { label: 'tan⁻¹', insert: 'atan(' },
  { label: 'ln', insert: 'ln(' },
  { label: 'log', insert: 'log(' },
  { label: 'π', insert: 'π' },
  { label: 'e', insert: 'e' },
  { label: 'n!', insert: '!' }
];

// A full 4-column grid (iOS-style), one entry per cell; `span` widens a cell (the "=" row).
const PAD_KEYS: { label: string; insert?: string; action?: 'ac' | 'back' | 'equals'; span?: number }[] = [
  { label: 'AC', action: 'ac' }, { label: '⌫', action: 'back' }, { label: '(', insert: '(' }, { label: ')', insert: ')' },
  { label: '7', insert: '7' }, { label: '8', insert: '8' }, { label: '9', insert: '9' }, { label: '÷', insert: '÷' },
  { label: '4', insert: '4' }, { label: '5', insert: '5' }, { label: '6', insert: '6' }, { label: '×', insert: '×' },
  { label: '1', insert: '1' }, { label: '2', insert: '2' }, { label: '3', insert: '3' }, { label: '−', insert: '−' },
  { label: '0', insert: '0', span: 2 }, { label: '.', insert: '.' }, { label: '+', insert: '+' },
  { label: '=', action: 'equals', span: 4 }
];

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return 'Error';
  if (Object.is(n, -0)) return '0';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
  return Number(n.toPrecision(10)).toString();
}

export default function ScientificCalculator() {
  const [expression, setExpression] = useState('');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const accent = widgetAccent('math');

  const preview = useMemo(() => {
    try {
      const value = evaluateExpression(expression, angleMode);
      return Number.isFinite(value) ? formatResult(value) : null;
    } catch {
      return null;
    }
  }, [expression, angleMode]);

  // After an "Error" result, typing anything should start a fresh expression rather than
  // literally appending onto the word "Error" (post-review fix, pre-merge review of PR #20).
  const insert = (text: string) => setExpression((prev) => (prev === 'Error' ? text : prev + text));
  const clear = () => setExpression('');
  const backspace = () => setExpression((prev) => (prev === 'Error' ? '' : prev.slice(0, -1)));
  const equals = () => {
    try {
      const value = evaluateExpression(expression, angleMode);
      setExpression(Number.isFinite(value) ? formatResult(value) : 'Error');
    } catch {
      setExpression('Error');
    }
  };

  return (
    <WidgetCard>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Angle unit</p>
        <div className="flex gap-2">
          {(['deg', 'rad'] as AngleMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAngleMode(mode)}
              style={angleMode === mode ? { borderColor: accent, backgroundColor: `${accent}1A`, color: accent } : undefined}
              className={`rounded-xl border px-3 py-1 text-sm font-medium uppercase transition ${angleMode === mode ? '' : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') equals(); }}
          placeholder="Type or tap an expression, e.g. sin(30)+5!"
          aria-label="Expression"
          className="w-full bg-transparent text-right text-2xl font-semibold text-slate-900 outline-none placeholder:text-base placeholder:font-normal placeholder:text-slate-400 dark:text-slate-100"
        />
        <p className="mt-1 h-6 text-right text-sm text-slate-400 dark:text-slate-500">
          {expression.trim() !== '' && preview !== null ? `= ${preview}` : ' '}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {FUNCTION_KEYS.map((key) => (
          <button
            key={key.label}
            type="button"
            onClick={() => insert(key.insert)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            {key.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PAD_KEYS.map((key) => {
          const isEquals = key.action === 'equals';
          return (
            <button
              key={key.label}
              type="button"
              onClick={() => {
                if (key.action === 'ac') clear();
                else if (key.action === 'back') backspace();
                else if (key.action === 'equals') equals();
                else if (key.insert) insert(key.insert);
              }}
              style={isEquals ? { backgroundColor: accent } : undefined}
              className={`rounded-xl px-3 py-3 text-base font-semibold transition ${key.span === 2 ? 'col-span-2' : key.span === 4 ? 'col-span-4' : ''} ${
                isEquals
                  ? 'text-white hover:opacity-90'
                  : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {key.label}
            </button>
          );
        })}
      </div>
    </WidgetCard>
  );
}
