'use client';

import { useMemo, useState } from 'react';
import { WidgetCard, widgetAccent, DownloadMenu } from '@/components/CalculatorWidget';
import type { ExportPayload } from '@/lib/export';

// FLAMES: cancel every letter two names share (frequency-based, one-for-one), then count out
// through F-L-A-M-E-S using the Josephus-style elimination Wikipedia's "FLAMES (game)" article
// describes. See data/calculators/fun.ts ("love-calculator") for the cited content.
const FLAMES_LETTERS = ['F', 'L', 'A', 'M', 'E', 'S'] as const;
const FLAMES_WORDS: Record<string, string> = {
  F: 'Friends',
  L: 'Lovers',
  A: 'Affectionate',
  M: 'Marriage',
  E: 'Enemies',
  S: 'Siblings'
};

function letterCounts(name: string) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '').split('');
  const counts: Record<string, number> = {};
  for (const letter of letters) counts[letter] = (counts[letter] ?? 0) + 1;
  return counts;
}

function remainingCount(nameA: string, nameB: string) {
  const a = letterCounts(nameA);
  const b = letterCounts(nameB);
  const allLetters = new Set([...Object.keys(a), ...Object.keys(b)]);
  let remaining = 0;
  for (const letter of allLetters) remaining += Math.abs((a[letter] ?? 0) - (b[letter] ?? 0));
  return remaining;
}

function eliminate(n: number) {
  if (n <= 0) return null;
  const arr: string[] = [...FLAMES_LETTERS];
  let start = 0;
  const eliminated: string[] = [];
  while (arr.length > 1) {
    const idx = (start + n - 1) % arr.length;
    eliminated.push(arr[idx]);
    arr.splice(idx, 1);
    start = idx % arr.length;
  }
  return { letter: arr[0], word: FLAMES_WORDS[arr[0]], eliminated };
}

export default function FlamesCalculator() {
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const accent = widgetAccent('fun');

  const result = useMemo(() => {
    if (nameA.trim() === '' || nameB.trim() === '') return null;
    const n = remainingCount(nameA, nameB);
    const outcome = eliminate(n);
    return { n, outcome };
  }, [nameA, nameB]);

  const exportData: ExportPayload | null = !result || !result.outcome ? null : {
    title: 'Love Calculator (FLAMES)',
    url: typeof window === 'undefined' ? '' : window.location.href,
    inputs: [
      { label: 'First name', value: nameA, kind: 'text' },
      { label: 'Second name', value: nameB, kind: 'text' }
    ],
    result: { label: 'FLAMES result', value: `${result.outcome.letter} - ${result.outcome.word}`, kind: 'text' },
    outputs: [
      { label: 'Letters remaining after cancellation', value: String(result.n), raw: result.n, kind: 'integer' },
      { label: 'Elimination order', value: result.outcome.eliminated.join(', '), kind: 'text' }
    ]
  };

  return (
    <WidgetCard>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">First name</span>
          <input
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            placeholder="e.g. Jordan"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Second name</span>
          <input
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            placeholder="e.g. Taylor"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
          />
        </label>
      </div>

      {result && result.outcome ? (
        <>
          <div className="rounded-2xl border p-4 text-center" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0F` }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>FLAMES result</p>
            <p className="mt-1 text-3xl font-bold" style={{ color: accent }}>{result.outcome.letter} &middot; {result.outcome.word}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <p>Letters remaining after cancelling what {nameA.trim() || 'the first name'} and {nameB.trim() || 'the second name'} share: <strong className="text-slate-800 dark:text-slate-200">{result.n}</strong></p>
            <p className="mt-1">Counting through F-L-A-M-E-S by {result.n}, in order: {result.outcome.eliminated.join(' -> ')} eliminated, leaving <strong className="text-slate-800 dark:text-slate-200">{result.outcome.letter}</strong>.</p>
          </div>
        </>
      ) : result && !result.outcome ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          These two names use exactly the same letters the same number of times, so nothing is left to count. Try full names, a nickname, or a middle name.
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">Enter two names to play FLAMES — for entertainment only.</p>
      )}

      <div className="flex justify-end">
        <DownloadMenu calculatorId="love-calculator" exportData={exportData} />
      </div>
    </WidgetCard>
  );
}
