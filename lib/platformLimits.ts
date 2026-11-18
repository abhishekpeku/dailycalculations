// Shared by TextToolsCalculator.tsx (character-counter) and tweet-thread-length-calculator, so the
// cited figures live in one place. Every limit here is confirmed from an official platform doc or
// telecom standard (see character-counter's own `content.references` in data/calculators/text.ts)
// as of 2026-10-21. A platform's limit that could not be confirmed from an official source (e.g.
// Facebook's often-quoted 63,206, and a single fixed number for a Google meta description, which
// Google's own docs say has no character limit) is left out rather than guessed.
export type PlatformLimit = { id: string; name: string; limit: number; color: string };

export const PLATFORM_LIMITS: PlatformLimit[] = [
  { id: 'x', name: 'X (Twitter) post', limit: 280, color: 'bg-sky-500' },
  { id: 'instagram', name: 'Instagram caption', limit: 2200, color: 'bg-pink-500' },
  { id: 'linkedin', name: 'LinkedIn post', limit: 3000, color: 'bg-blue-600' },
  { id: 'youtube-title', name: 'YouTube title', limit: 100, color: 'bg-red-500' },
  { id: 'youtube-description', name: 'YouTube description', limit: 5000, color: 'bg-red-400' },
  { id: 'sms', name: 'SMS (GSM-7 standard text)', limit: 160, color: 'bg-purple-500' },
  { id: 'sms-unicode', name: 'SMS (emoji / non-Latin script)', limit: 70, color: 'bg-purple-400' }
];
