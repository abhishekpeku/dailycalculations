import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700 dark:text-brand-300">404 — Page not found</p>
        <h1 className="mt-6 text-4xl font-semibold text-slate-950 dark:text-white">We couldn&apos;t find that page</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Try a calculator from the home page.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
