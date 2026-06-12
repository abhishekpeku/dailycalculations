import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700 dark:text-brand-300">Page not found</p>
        <h1 className="mt-6 text-4xl font-semibold text-slate-950 dark:text-white">We couldn&apos;t find that calculator</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">Try a different tool from the home page or browse the calculator list.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
          Back to Daily Calculations home
        </Link>
      </div>
    </main>
  );
}
