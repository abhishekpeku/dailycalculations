'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-lg dark:border-slate-800 dark:bg-slate-950/90">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700 dark:text-blue-300">500 — Critical error</p>
            <h1 className="mt-6 text-4xl font-semibold text-slate-950 dark:text-white">Something went seriously wrong</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              The application encountered a critical error. Please try again.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-700 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
