'use client';

import { useState, useMemo } from 'react';
import { WidgetCard, widgetAccent, DownloadMenu } from '@/components/CalculatorWidget';
import { findCalculator } from '@/data/calculators';
import type { ExportPayload } from '@/lib/export';
import { PLATFORM_LIMITS } from '@/lib/platformLimits';

type Mode = 'character' | 'hashtag' | 'word' | 'syllable';

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

// Vowel-group syllable estimate, simplified from the heuristic chain Lingua::EN::Syllable (Perl,
// Greg Fast) -> Text-Statistics (PHP, Dave Child) -> syllable (JS, Titus Wormer/wooorm): count
// runs of vowels, drop a silent trailing "e", add back a syllable for a consonant + "-le" ending
// ("table", "little", "people"), minimum of 1 per word. See references for the full chain.
function countWordSyllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/e$/, '');
  const groups = trimmed.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 0;
  if (/[^aeiouy]le$/.test(w)) count += 1;
  return count < 1 ? 1 : count;
}

function syllableBreakdown(text: string) {
  const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
  let totalSyllables = 0;
  let complexWords = 0;
  for (const w of words) {
    const n = countWordSyllables(w);
    totalSyllables += n;
    if (n >= 3) complexWords += 1;
  }
  return { totalSyllables, complexWords };
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

const MODE_LABELS: Record<Mode, string> = {
  character: 'Character Counter',
  hashtag: 'Hashtag Counter',
  word: 'Word Counter',
  syllable: 'Syllable Counter'
};

const MODE_CALCULATOR_IDS: Record<Mode, string> = {
  character: 'character-counter',
  hashtag: 'hashtag-counter',
  word: 'word-counter-calculator',
  syllable: 'syllable-counter-calculator'
};

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
    const { totalSyllables, complexWords } = syllableBreakdown(text);
    const avgSyllablesPerWord = words === 0 ? 0 : totalSyllables / words;
    return {
      chars, charsNoSpaces, words, sentences, paragraphs, lines, hashtags, uniqueHashtags, instagramHashtagOk,
      totalSyllables, complexWords, avgSyllablesPerWord
    };
  }, [text]);

  const accent = widgetAccent('text');

  // Shared by three different calculator pages -- derive the id/title from the already-known mode
  // rather than hardcoding one slug or adding a prop page.tsx doesn't need to pass.
  const calculatorId = MODE_CALCULATOR_IDS[activeMode];
  const calculatorTitle = findCalculator(calculatorId)?.title ?? MODE_LABELS[activeMode];

  const exportDataByMode: Record<Mode, ExportPayload> = {
    character: {
      title: calculatorTitle,
      url: typeof window === 'undefined' ? '' : window.location.href,
      inputs: [],
      result: { label: 'Characters', value: stats.chars.toLocaleString('en-US'), raw: stats.chars, kind: 'integer' },
      outputs: [
        { label: 'Characters (no spaces)', value: stats.charsNoSpaces.toLocaleString('en-US'), raw: stats.charsNoSpaces, kind: 'integer' },
        { label: 'Words', value: stats.words.toLocaleString('en-US'), raw: stats.words, kind: 'integer' },
        { label: 'Sentences', value: stats.sentences.toLocaleString('en-US'), raw: stats.sentences, kind: 'integer' },
        { label: 'Paragraphs', value: stats.paragraphs.toLocaleString('en-US'), raw: stats.paragraphs, kind: 'integer' },
        { label: 'Lines', value: stats.lines.toLocaleString('en-US'), raw: stats.lines, kind: 'integer' },
        { label: 'Reading time', value: readingTime(stats.words), kind: 'text' }
      ]
    },
    hashtag: {
      title: calculatorTitle,
      url: typeof window === 'undefined' ? '' : window.location.href,
      inputs: [],
      result: { label: 'Unique hashtags', value: stats.uniqueHashtags.toLocaleString('en-US'), raw: stats.uniqueHashtags, kind: 'integer' },
      outputs: [
        { label: 'Characters', value: stats.chars.toLocaleString('en-US'), raw: stats.chars, kind: 'integer' },
        { label: 'Words', value: stats.words.toLocaleString('en-US'), raw: stats.words, kind: 'integer' },
        {
          label: 'Instagram limit (30)',
          value: stats.instagramHashtagOk ? `OK — ${stats.uniqueHashtags}/30` : `Exceeded — ${stats.uniqueHashtags}/30`,
          kind: 'text'
        }
      ]
    },
    word: {
      title: calculatorTitle,
      url: typeof window === 'undefined' ? '' : window.location.href,
      inputs: [],
      result: { label: 'Words', value: stats.words.toLocaleString('en-US'), raw: stats.words, kind: 'integer' },
      outputs: [
        { label: 'Characters', value: stats.chars.toLocaleString('en-US'), raw: stats.chars, kind: 'integer' },
        { label: 'Sentences', value: stats.sentences.toLocaleString('en-US'), raw: stats.sentences, kind: 'integer' },
        { label: 'Paragraphs', value: stats.paragraphs.toLocaleString('en-US'), raw: stats.paragraphs, kind: 'integer' },
        { label: 'Reading time', value: readingTime(stats.words), kind: 'text' }
      ]
    },
    syllable: {
      title: calculatorTitle,
      url: typeof window === 'undefined' ? '' : window.location.href,
      inputs: [],
      result: { label: 'Syllables', value: stats.totalSyllables.toLocaleString('en-US'), raw: stats.totalSyllables, kind: 'integer' },
      outputs: [
        { label: 'Words', value: stats.words.toLocaleString('en-US'), raw: stats.words, kind: 'integer' },
        { label: 'Avg syllables per word', value: stats.avgSyllablesPerWord.toFixed(2), raw: stats.avgSyllablesPerWord, kind: 'decimal' },
        { label: 'Complex words (3+ syllables)', value: stats.complexWords.toLocaleString('en-US'), raw: stats.complexWords, kind: 'integer' }
      ]
    }
  };
  const exportData: ExportPayload | null = text.trim() === '' ? null : exportDataByMode[activeMode];

  return (
    <WidgetCard>
      <div className="flex flex-wrap gap-2">
        {(['character', 'hashtag', 'word', 'syllable'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setActiveMode(m)}
            style={activeMode === m ? { borderColor: accent, backgroundColor: `${accent}1A`, color: accent } : undefined}
            className={`rounded-2xl border px-4 py-1.5 text-sm font-medium capitalize transition ${activeMode === m ? '' : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={activeMode === 'hashtag' ? 'Paste your caption with #hashtags here...' : 'Type or paste your text here...'}
        rows={6}
        className="w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
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

          <div className="rounded-2xl border p-4" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0F` }}>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Reading time: <strong style={{ color: accent }}>{readingTime(stats.words)}</strong>
              {' '}at 200 words/min
            </p>
          </div>
        </>
      ) : activeMode === 'hashtag' ? (
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
                <span key={h} className="rounded-xl px-2 py-1 text-xs font-medium" style={{ backgroundColor: `${accent}1A`, color: accent }}>
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : activeMode === 'word' ? (
        <>
          <div className="rounded-2xl border p-4 text-center" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0F` }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>Words</p>
            <p className="mt-1 text-4xl font-bold" style={{ color: accent }}>{stats.words.toLocaleString('en-US')}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Characters', value: stats.chars },
              { label: 'Sentences', value: stats.sentences },
              { label: 'Paragraphs', value: stats.paragraphs },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Reading time: <strong style={{ color: accent }}>{readingTime(stats.words)}</strong>
              {' '}at 200 words/min
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-2xl border p-4 text-center" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0F` }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>Syllables</p>
            <p className="mt-1 text-4xl font-bold" style={{ color: accent }}>{stats.totalSyllables.toLocaleString('en-US')}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Words', value: stats.words },
              { label: 'Avg/word', value: stats.avgSyllablesPerWord.toFixed(2) },
              { label: 'Complex words (3+)', value: stats.complexWords },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A vowel-group estimate, not a dictionary lookup — feed this word, sentence, and syllable count into the{' '}
              <strong style={{ color: accent }}>Readability Score Calculator</strong> for a Flesch-Kincaid grade level.
            </p>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <DownloadMenu calculatorId={calculatorId} exportData={exportData} />
      </div>
    </WidgetCard>
  );
}
