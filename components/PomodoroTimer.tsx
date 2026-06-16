'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type Phase = 'work' | 'short' | 'long';

const DEFAULTS = { work: 25, short: 5, long: 15, longAfter: 4 };

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function PomodoroTimer() {
  const [workMin, setWorkMin] = useState(DEFAULTS.work);
  const [shortMin, setShortMin] = useState(DEFAULTS.short);
  const [longMin, setLongMin] = useState(DEFAULTS.long);
  const [longAfter, setLongAfter] = useState(DEFAULTS.longAfter);
  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work * 60);
  const [running, setRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseDuration = useCallback((p: Phase) => {
    if (p === 'work') return workMin * 60;
    if (p === 'short') return shortMin * 60;
    return longMin * 60;
  }, [workMin, shortMin, longMin]);

  const advance = useCallback(() => {
    setPomodorosCompleted((prev) => {
      const next = prev + (phase === 'work' ? 1 : 0);
      const nextPhase: Phase = phase === 'work'
        ? (next % longAfter === 0 ? 'long' : 'short')
        : 'work';
      setPhase(nextPhase);
      setSecondsLeft(phaseDuration(nextPhase));
      return next;
    });
  }, [phase, longAfter, phaseDuration]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) { advance(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, advance]);

  const reset = () => {
    setRunning(false);
    setPhase('work');
    setSecondsLeft(workMin * 60);
    setPomodorosCompleted(0);
  };

  const skipPhase = () => {
    setRunning(false);
    advance();
  };

  const totalSeconds = phaseDuration(phase);
  const progress = 1 - secondsLeft / totalSeconds;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference * (1 - progress);

  const phaseColors: Record<Phase, string> = {
    work: 'text-red-500',
    short: 'text-green-500',
    long: 'text-blue-500',
  };
  const phaseLabels: Record<Phase, string> = {
    work: 'Focus', short: 'Short Break', long: 'Long Break',
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      {/* Timer display */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="196" height="196" className="-rotate-90">
            <circle cx="98" cy="98" r="80" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
            <circle
              cx="98" cy="98" r="80" fill="none" stroke="currentColor" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={phaseColors[phase]}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold tabular-nums ${phaseColors[phase]}`}>
              {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
            </span>
            <span className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{phaseLabels[phase]}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: longAfter }, (_, i) => (
            <div key={i} className={`h-2.5 w-2.5 rounded-full ${i < (pomodorosCompleted % longAfter) ? 'bg-red-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{pomodorosCompleted} pomodoros completed</p>

        <div className="flex gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="rounded-2xl bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={skipPhase}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Skip
          </button>
          <button
            onClick={reset}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Settings (minutes)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Focus', value: workMin, set: setWorkMin },
            { label: 'Short break', value: shortMin, set: setShortMin },
            { label: 'Long break', value: longMin, set: setLongMin },
            { label: 'Long after', value: longAfter, set: setLongAfter },
          ].map(({ label, value, set }) => (
            <label key={label} className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <span className="text-xs font-medium">{label}</span>
              <input
                type="number"
                value={value}
                min={1}
                onChange={(e) => { set(Number(e.target.value)); reset(); }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
