"use client";

import { useState } from 'react';

export default function SuggestionForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!message || message.trim().length < 5) {
      setError('Please provide a more detailed suggestion (at least 5 characters).');
      return;
    }

    setSubmitting(true);

    const title = `${name ? name + ' - ' : ''}Suggestion: ${message.split('\n')[0].slice(0, 80)}`;
    const body = `**From:** ${name || 'Anonymous'}\n**Email:** ${email || 'n/a'}\n\n${message}`;
    const labels = ['suggestion'];

    // Try server-side creation first
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, labels })
      });

      if (res.ok) {
        const json = await res.json();
        setSubmitting(false);
        setSent(true);
        setCreatedUrl(json.url || '');
        return;
      }

      // fallback to opening new issue page
    } catch (err) {
      // continue to fallback below
    }

    const repoUrl = 'https://github.com/abhishekpeku/calcora/issues/new';
    const params = `?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(labels.join(','))}`;
    window.open(`${repoUrl}${params}`, '_blank');
    setSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-[#E8F7EC] p-4 text-sm text-[#1E7A34] dark:bg-[#1E7A34]/15 dark:text-[#4CD964]">
        <p>Thanks — a prefilled GitHub issue has been opened or created successfully.</p>
        {createdUrl ? <p className="mt-2">View issue: <a className="font-medium underline" href={createdUrl} target="_blank" rel="noreferrer">{createdUrl}</a></p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <div className="rounded-2xl bg-[#FDEDEB] p-3 text-sm text-[#B5241C] dark:bg-[#B5241C]/15 dark:text-[#FF6B5E]">{error}</div> : null}
      <div>
        <label className="block text-sm font-medium text-[#515154] dark:text-slate-300">Name (optional)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F5F5F7] px-4 py-2.5 text-[#1D1D1F] outline-none transition focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#515154] dark:text-slate-300">Email (optional)</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F5F5F7] px-4 py-2.5 text-[#1D1D1F] outline-none transition focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#515154] dark:text-slate-300">Suggestion</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F5F5F7] px-4 py-2.5 text-[#1D1D1F] outline-none transition focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={submitting}
          type="submit"
          className="inline-flex items-center rounded-full bg-[#0066CC] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A58B0] disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Create GitHub issue'}
        </button>
        <a className="text-sm text-[#6E6E73] transition hover:text-[#1D1D1F] dark:text-slate-400 dark:hover:text-white" href="https://github.com/abhishekpeku/calcora/issues/new" target="_blank" rel="noreferrer">Or open a GitHub issue manually</a>
      </div>
    </form>
  );
}
