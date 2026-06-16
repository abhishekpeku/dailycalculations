'use client';

import { useState, useMemo } from 'react';

// Static rates relative to USD — updated periodically; not live
const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.53,
  CHF: 0.90, CNY: 7.24, INR: 83.2, MXN: 17.2, BRL: 4.97, KRW: 1330,
  SGD: 1.34, HKD: 7.82, NOK: 10.6, SEK: 10.4, DKK: 6.89, NZD: 1.63,
  ZAR: 18.6, AED: 3.67, SAR: 3.75, THB: 35.1, IDR: 15600, PHP: 55.8,
  TRY: 32.1, PLN: 4.01, CZK: 22.9, HUF: 360, RON: 4.57, BGN: 1.80,
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan', INR: 'Indian Rupee', MXN: 'Mexican Peso',
  BRL: 'Brazilian Real', KRW: 'South Korean Won', SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar', NOK: 'Norwegian Krone', SEK: 'Swedish Krona',
  DKK: 'Danish Krone', NZD: 'New Zealand Dollar', ZAR: 'South African Rand',
  AED: 'UAE Dirham', SAR: 'Saudi Riyal', THB: 'Thai Baht',
  IDR: 'Indonesian Rupiah', PHP: 'Philippine Peso', TRY: 'Turkish Lira',
  PLN: 'Polish Zloty', CZK: 'Czech Koruna', HUF: 'Hungarian Forint',
  RON: 'Romanian Leu', BGN: 'Bulgarian Lev',
};

const CURRENCIES = Object.keys(RATES).sort();

function fmt(v: number, code: string) {
  const large = ['JPY', 'KRW', 'IDR', 'HUF'];
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: large.includes(code) ? 0 : 2,
    maximumFractionDigits: large.includes(code) ? 0 : 4,
  }).format(v);
}

function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>{c} – {CURRENCY_NAMES[c]}</option>
      ))}
    </select>
  );
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');

  const result = useMemo(() => {
    const n = parseFloat(amount);
    if (isNaN(n)) return null;
    const usd = n / RATES[from];
    const converted = usd * RATES[to];
    const rate = RATES[to] / RATES[from];
    const inverseRate = RATES[from] / RATES[to];
    return { converted, rate, inverseRate };
  }, [amount, from, to]);

  const swap = () => { setFrom(to); setTo(from); };

  // Popular conversions relative to current `from`
  const popular = useMemo(() => {
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR']
      .filter((c) => c !== from)
      .slice(0, 6)
      .map((c) => {
        const n = parseFloat(amount) || 1;
        const usd = n / RATES[from];
        return { code: c, value: usd * RATES[c] };
      });
  }, [from, amount]);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            step="any"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400"
          />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
            <Select value={from} onChange={setFrom} />
          </div>
          <button
            onClick={swap}
            className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-slate-600 transition hover:bg-brand-50 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            aria-label="Swap currencies"
          >
            ⇄
          </button>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
            <Select value={to} onChange={setTo} />
          </div>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-950/30">
          <p className="text-sm text-slate-500 dark:text-slate-400">{amount} {from} =</p>
          <p className="mt-1 text-4xl font-bold text-brand-700 dark:text-brand-300">
            {fmt(result.converted, to)} <span className="text-2xl">{to}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>1 {from} = {fmt(result.rate, to)} {to}</span>
            <span>1 {to} = {fmt(result.inverseRate, from)} {from}</span>
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Popular conversions for {parseFloat(amount) || 1} {from}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {popular.map((p) => (
            <button
              key={p.code}
              onClick={() => setTo(p.code)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.code}</p>
              <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">{fmt(p.value, p.code)}</p>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Rates are approximate and for reference only. Not live data.
      </p>
    </div>
  );
}
