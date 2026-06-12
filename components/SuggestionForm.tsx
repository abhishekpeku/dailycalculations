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
      <div>
        <p className="rounded-md bg-green-50 p-4 text-sm text-green-800">Thanks — a prefilled GitHub issue has been opened or created successfully.</p>
        {createdUrl ? <p className="mt-2 text-sm">View issue: <a className="text-blue-600" href={createdUrl} target="_blank" rel="noreferrer">{createdUrl}</a></p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
      <div>
        <label className="block text-sm font-medium text-slate-700">Name (optional)</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Email (optional)</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Suggestion</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>
      <div className="flex items-center gap-2">
        <button disabled={submitting} type="submit" className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{submitting ? 'Submitting…' : 'Create GitHub issue'}</button>
        <a className="text-sm text-slate-600" href="https://github.com/abhishekpeku/calcora/issues/new" target="_blank" rel="noreferrer">Or open a GitHub issue manually</a>
      </div>
    </form>
  );
}
