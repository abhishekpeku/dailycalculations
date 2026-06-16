'use client';

import { useState, useMemo } from 'react';

type Mode = 'character' | 'hashtag';

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function countSentences(text: string) {
  return text.trim() === '' ? 0 : (text.match(/[.!?]+/g) || []).length;
}

function countParagraphs(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\n\s*\n/).length;
}

function extractHashtags(text: string) {
  const matches = text.match(/#[\w]+/g) || [];
  return [...new Set(matches)];
}

function readingTime(words: number) {
  const minutes = words / 200;
  if (minutes < 1) return `${Math.round(minutes * 60)}s`;
  return `${Math.ceil(minutes)} min`;
}

const PLATFORM_LIMITS: { name: string; limit: number; color: string }[] = [
  { name: 'Twitter/X', limit: 280, color: 'bg-sky-500' },
  { name: 'Instagram caption', limit: 2200, color: 'bg-pink-500' },
  { name: 'LinkedIn post', limit: 3000, color: 'bg-blue-600' },
  { name: 'Facebook post', limit: 63206, color: 'bg-blue-500' },
  { name: 'YouTube title', limit: 100, color: 'bg-red-500' },
  { name: 'YouTube description', limit: 5000, color: 'bg-red-400' },
  { name: 'Meta description (SEO)', limit: 160, color: 'bg-green-500' },
  { name: 'SMS message', limit: 160, color: 'bg-purple-500' },
];

export default function TextToolsCalculator({ mode }: { mode?: Mode }) {
  const [text, setText] = useState('');
  const [activeMode, setActiveMode] = useState<Mode>(mode ?? 'character');

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = countWords(text);
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const lines = text === '' ? 0 : text.split('\n').length;
    const hashtags = extractHashtags(text);
    const uniqueHashtags = hashtags.length;
    const instagramHashtagOk = uniqueHashtags <= 30;
    return { chars, charsNoSpaces, words, sentences, paragraphs, lines, hashtags, uniqueHashtags, instagramHashtagOk };
  }, [text]);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex gap-2">
        {(['character', 'hashtag'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setActiveMode(m)}
            className={`rounded-2xl border px-4 py-1.5 text-sm font-medium capitalize transition ${activeMode === m ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}
          >
            {m === 'character' ? 'Character Counter' : 'Hashtag Counter'}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={activeMode === 'hashtag' ? 'Paste your caption with #hashtags here...' : 'Type or paste your text here...'}
        rows={6}
        className="w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400"
      />

      {activeMode === 'character' ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Characters', value: stats.chars },
              { label: 'No spaces', value: stats.charsNoSpaces },
              { label: 'Words', value: stats.words },
              { label: 'Sentences', value: stats.sentences },
              { label: 'Paragraphs', value: stats.paragraphs },
              { label: 'Lines', value: stats.lines },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Platform limits — {stats.chars} characters used
            </p>
            <div className="space-y-2">
              {PLATFORM_LIMITS.map(({ name, limit, color }) => {
                const pct = Math.min(100, (stats.chars / limit) * 100);
                const over = stats.chars > limit;
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                      <span>{name}</span>
                      <span className={over ? 'font-semibold text-red-500' : ''}>
                        {stats.chars}/{limit}{over ? ` (+${stats.chars - limit})` : ''}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-1.5 rounded-full transition-all ${over ? 'bg-red-500' : color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/30">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Reading time: <strong className="text-brand-700 dark:text-brand-300">{readingTime(stats.words)}</strong>
              {' '}at 200 words/min
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Unique hashtags', value: stats.uniqueHashtags },
              { label: 'Instagram limit', value: 30 },
              { label: 'Characters', value: stats.chars },
              { label: 'Words', value: stats.words },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-2xl border p-3 text-sm font-medium ${stats.instagramHashtagOk ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'}`}>
            {stats.instagramHashtagOk
              ? `Instagram OK — ${stats.uniqueHashtags}/30 hashtags used`
              : `Instagram limit exceeded — ${stats.uniqueHashtags}/30 hashtags (remove ${stats.uniqueHashtags - 30})`}
          </div>

          {stats.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stats.hashtags.map((h) => (
                <span key={h} className="rounded-xl bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
