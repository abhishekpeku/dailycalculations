'use client';

import { useMemo, useState } from 'react';
import { WidgetCard, widgetAccent, DownloadMenu } from '@/components/CalculatorWidget';
import type { ExportPayload } from '@/lib/export';

// Shannon-style password entropy, H = L x log2(N): N is the size of the character set the typed
// password actually draws from, L is its length. See data/calculators/tech.ts
// ("password-strength-checker") for the cited formula and the NIST SP 800-63B guidance this page
// quotes. The standard 33 printable-ASCII symbols, including the space character.
const SYMBOL_CHARS = " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

function analyze(password: string) {
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = [...password].some((ch) => SYMBOL_CHARS.includes(ch));
  const hasOther = [...password].some((ch) => !/[a-zA-Z0-9]/.test(ch) && !SYMBOL_CHARS.includes(ch));
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += SYMBOL_CHARS.length;
  const entropyBits = length === 0 || poolSize === 0 ? 0 : length * Math.log2(poolSize);
  return { length, hasLower, hasUpper, hasDigit, hasSymbol, hasOther, poolSize, entropyBits };
}

// An informal, widely used way to group a raw bit count into a read-at-a-glance label — not an
// official NIST (or any standards body's) scale. NIST's current SP 800-63B deliberately does not
// score passwords by entropy at all; see the watch-outs below the widget.
function strengthLabel(bits: number) {
  if (bits === 0) return { label: 'No password', pct: 0 };
  if (bits < 28) return { label: 'Very weak', pct: 15 };
  if (bits < 36) return { label: 'Weak', pct: 35 };
  if (bits < 60) return { label: 'Reasonable', pct: 60 };
  if (bits < 80) return { label: 'Strong', pct: 85 };
  return { label: 'Very strong', pct: 100 };
}

function formatCombinations(bits: number) {
  if (bits === 0) return '0';
  const exponent = bits * Math.log10(2);
  const mantissa = 10 ** (exponent - Math.floor(exponent));
  return `${mantissa.toFixed(2)} × 10^${Math.floor(exponent)}`;
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const accent = widgetAccent('tech');

  const stats = useMemo(() => analyze(password), [password]);
  const { label, pct } = strengthLabel(stats.entropyBits);

  const categories = [
    { name: 'Lowercase (a-z)', active: stats.hasLower, pool: 26 },
    { name: 'Uppercase (A-Z)', active: stats.hasUpper, pool: 26 },
    { name: 'Digits (0-9)', active: stats.hasDigit, pool: 10 },
    { name: 'Symbols (space + punctuation)', active: stats.hasSymbol, pool: SYMBOL_CHARS.length }
  ];

  const exportData: ExportPayload | null =
    password === ''
      ? null
      : {
          title: 'Password Strength Checker',
          url: typeof window === 'undefined' ? '' : window.location.href,
          inputs: [{ label: 'Password length', value: String(stats.length), raw: stats.length, kind: 'integer' }],
          result: { label: 'Estimated entropy', value: `${stats.entropyBits.toFixed(1)} bits (${label})`, kind: 'text' },
          outputs: [
            { label: 'Character-set size used', value: String(stats.poolSize), raw: stats.poolSize, kind: 'integer' },
            { label: 'Approximate combinations (2^entropy)', value: formatCombinations(stats.entropyBits), kind: 'text' }
          ]
        };

  return (
    <WidgetCard>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Password</span>
        <div className="flex gap-2">
          <input
            type={reveal ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password to check its strength"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
          />
          <button
            onClick={() => setReveal((v) => !v)}
            type="button"
            className="shrink-0 rounded-2xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          >
            {reveal ? 'Hide' : 'Show'}
          </button>
        </div>
      </label>

      {password === '' ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Type a password above to see its estimated entropy. Nothing you type ever leaves this page.</p>
      ) : (
        <>
          <div className="rounded-2xl border p-4" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0F` }}>
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>{label}</p>
              <p className="text-sm font-semibold" style={{ color: accent }}>{stats.entropyBits.toFixed(1)} bits</p>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: accent }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c) => (
              <div
                key={c.name}
                className={`rounded-2xl border p-3 text-center text-xs ${c.active ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900' : 'border-slate-100 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'}`}
              >
                <p className={c.active ? 'text-slate-600 dark:text-slate-300' : ''}>{c.name}</p>
                <p className="mt-1 font-semibold">{c.active ? `+${c.pool}` : 'not used'}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <p>
              Length <strong className="text-slate-800 dark:text-slate-200">{stats.length}</strong> characters, drawn from a{' '}
              <strong className="text-slate-800 dark:text-slate-200">{stats.poolSize}</strong>-character set
              {stats.hasOther ? ' (plus other characters not counted toward the character-set size — see the watch-outs below)' : ''} →{' '}
              about <strong className="text-slate-800 dark:text-slate-200">{formatCombinations(stats.entropyBits)}</strong> possible combinations.
            </p>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <DownloadMenu calculatorId="password-strength-checker" exportData={exportData} />
      </div>
    </WidgetCard>
  );
}
