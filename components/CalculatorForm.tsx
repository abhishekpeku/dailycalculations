'use client';

import { useMemo, useState } from 'react';
import type { CalculatorClientConfig, CalculatorInputValues, CalculatorInput } from '@/data/calculators';
import { findCalculator } from '@/data/calculators';
import { evaluateCalculator, formatCurrency, formatNumber, formatFull } from '@/lib/calculator';

const formatValue = (key: string, value: number, input: CalculatorInput | null) => {
  if (input?.type === 'currency') return formatCurrency(value);
  if (input?.type === 'percent') return `${formatNumber(value)}%`;
  if (key.includes('Amount') || key.includes('Cost') || key.includes('Payment') || key.includes('Interest') || key.includes('Principal')) {
    return formatCurrency(value);
  }
  return formatNumber(value);
};

export default function CalculatorForm({ calculator }: { calculator: CalculatorClientConfig }) {
  const liveCalculator = findCalculator(calculator.id);
  if (!liveCalculator) {
    return null;
  }
  const initialState = calculator.inputs.reduce<CalculatorInputValues>((state, item) => ({
    ...state,
    [item.id]: item.defaultValue
  }), {});

  const [values, setValues] = useState(initialState);

  const results = useMemo(() => evaluateCalculator(liveCalculator, values), [liveCalculator, values]);

  return (
    <div className="space-y-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      <div className="grid gap-4 sm:grid-cols-2">
        {calculator.inputs.map((input) => (
          <label key={input.id} className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">{input.label}</span>
            <input
              type="number"
              value={values[input.id]}
              onChange={(event) => setValues((current) => ({
                ...current,
                [input.id]: Number(event.target.value)
              }))}
              step={input.step ?? 1}
              min={input.min}
              placeholder={input.placeholder}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(results).map(([key, value]) => {
          const inputDef = calculator.inputs.find((item) => item.id === key) ?? null;
          const display = formatValue(key, value, inputDef);
          const full = inputDef?.type === 'currency' || key.includes('Amount') || key.includes('Cost') || key.includes('Payment') || key.includes('Interest') || key.includes('Principal')
            ? formatFull(value, { currency: true })
            : formatFull(value);

          return (
            <div key={key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-slate-500 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</p>
              <p title={full} className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{display}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
