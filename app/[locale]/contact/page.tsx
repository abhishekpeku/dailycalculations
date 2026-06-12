import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { siteName, siteUrl } from '@/lib/seo';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const title = `${t('title')} | ${siteName}`;
  return {
    title,
    description: t('metaDescription'),
    alternates: { canonical: `${siteUrl}/contact` }
  };
}

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">{t('eyebrow')}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{t('title')}</h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{t('intro')}</p>

        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('githubTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('githubBody')}</p>
            <a
              href="https://github.com/anthropics/claude-code/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {t('githubCta')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('suggestTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('suggestBody')}</p>
            <Link
              href="/suggestions"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800"
            >
              {t('suggestCta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
