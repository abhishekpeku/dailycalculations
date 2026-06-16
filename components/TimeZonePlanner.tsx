'use client';

import { useState, useMemo } from 'react';

type Zone = {
  label: string;
  iana: string;
  region: string;
};

const ZONES: Zone[] = [
  { label: 'New York (ET)', iana: 'America/New_York', region: 'US' },
  { label: 'Chicago (CT)', iana: 'America/Chicago', region: 'US' },
  { label: 'Denver (MT)', iana: 'America/Denver', region: 'US' },
  { label: 'Los Angeles (PT)', iana: 'America/Los_Angeles', region: 'US' },
  { label: 'Anchorage (AK)', iana: 'America/Anchorage', region: 'US' },
  { label: 'Honolulu (HI)', iana: 'Pacific/Honolulu', region: 'US' },
  { label: 'London (GMT/BST)', iana: 'Europe/London', region: 'Europe' },
  { label: 'Paris / Berlin (CET)', iana: 'Europe/Paris', region: 'Europe' },
  { label: 'Istanbul', iana: 'Europe/Istanbul', region: 'Europe' },
  { label: 'Dubai (GST)', iana: 'Asia/Dubai', region: 'Middle East' },
  { label: 'Mumbai (IST)', iana: 'Asia/Kolkata', region: 'Asia' },
  { label: 'Bangkok (ICT)', iana: 'Asia/Bangkok', region: 'Asia' },
  { label: 'Singapore (SGT)', iana: 'Asia/Singapore', region: 'Asia' },
  { label: 'Hong Kong (HKT)', iana: 'Asia/Hong_Kong', region: 'Asia' },
  { label: 'Tokyo (JST)', iana: 'Asia/Tokyo', region: 'Asia' },
  { label: 'Seoul (KST)', iana: 'Asia/Seoul', region: 'Asia' },
  { label: 'Sydney (AEDT)', iana: 'Australia/Sydney', region: 'Pacific' },
  { label: 'Auckland (NZST)', iana: 'Pacific/Auckland', region: 'Pacific' },
  { label: 'Toronto (ET)', iana: 'America/Toronto', region: 'Americas' },
  { label: 'São Paulo (BRT)', iana: 'America/Sao_Paulo', region: 'Americas' },
  { label: 'Mexico City (CST)', iana: 'America/Mexico_City', region: 'Americas' },
];

const DEFAULT_SELECTED = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo',
];

function formatTime(date: Date, iana: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    weekday: 'short',
  }).format(date);
}

function getHour(date: Date, iana: string) {
  const h = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: iana, hour: 'numeric', hour12: false }).format(date),
    10
  );
  return h === 24 ? 0 : h;
}

function workingClass(hour: number) {
  if (hour >= 9 && hour < 17) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 20)) return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
}

function workingLabel(hour: number) {
  if (hour >= 9 && hour < 17) return 'Business hours';
  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 20)) return 'Early/Late';
  return 'Outside hours';
}

export default function TimeZonePlanner() {
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [baseZone, setBaseZone] = useState('America/New_York');
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);

  const baseDate = useMemo(() => {
    const now = new Date();
    const baseStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: baseZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(now);
    return new Date(`${baseStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
  }, [hour, minute, baseZone]);

  const toggleZone = (iana: string) => {
    setSelected((prev) =>
      prev.includes(iana) ? prev.filter((z) => z !== iana) : [...prev, iana]
    );
  };

  const regions = [...new Set(ZONES.map((z) => z.region))];

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      {/* Base time picker */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Your meeting time</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Hour (0–23)</label>
            <input
              type="number" value={hour} min={0} max={23}
              onChange={(e) => setHour(Math.min(23, Math.max(0, Number(e.target.value))))}
              className="w-20 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-center text-lg font-semibold text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <span className="pb-2 text-2xl font-bold text-slate-400">:</span>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Minute</label>
            <input
              type="number" value={minute} min={0} max={59} step={15}
              onChange={(e) => setMinute(Math.min(59, Math.max(0, Number(e.target.value))))}
              className="w-20 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-center text-lg font-semibold text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Your time zone</label>
            <select
              value={baseZone}
              onChange={(e) => setBaseZone(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {ZONES.map((z) => (
                <option key={z.iana} value={z.iana}>{z.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {selected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Meeting times across selected zones
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selected.map((iana) => {
              const zone = ZONES.find((z) => z.iana === iana);
              if (!zone) return null;
              const h = getHour(baseDate, iana);
              const cls = workingClass(h);
              const lbl = workingLabel(h);
              return (
                <div key={iana} className={`rounded-2xl border p-3 ${cls}`}>
                  <p className="text-xs font-semibold opacity-70">{zone.label}</p>
                  <p className="mt-1 text-xl font-bold">{formatTime(baseDate, iana)}</p>
                  <p className="mt-0.5 text-xs opacity-60">{lbl}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zone selector */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Select zones to compare</p>
        {regions.map((region) => (
          <div key={region}>
            <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{region}</p>
            <div className="flex flex-wrap gap-2">
              {ZONES.filter((z) => z.region === region).map((z) => (
                <button
                  key={z.iana}
                  onClick={() => toggleZone(z.iana)}
                  className={`rounded-xl border px-3 py-1 text-xs transition ${selected.includes(z.iana) ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-400" /> Business hours (9am–5pm)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-300" /> Early / late (7–9am, 5–8pm)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Outside hours</span>
      </div>
    </div>
  );
}
