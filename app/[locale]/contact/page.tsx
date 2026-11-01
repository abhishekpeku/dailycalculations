import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { buildCanonical } from '@/lib/seo';
import { CARD } from '@/lib/categoryTheme';

export function generateStaticParams() {
  return [{ locale: routing.defaultLocale }];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildCanonical('/contact')
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
    <div className="bg-[#F5F5F7] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <section className={CARD}>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0066CC] dark:text-brand-300">{t('eyebrow')}</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#1D1D1F] dark:text-white">{t('title')}</h1>
          <p className="mt-3 leading-7 text-[#515154] dark:text-slate-300">{t('intro')}</p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-[#F5F5F7] p-6 dark:bg-slate-950/60">
              <h2 className="font-semibold text-[#1D1D1F] dark:text-white">{t('githubTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-[#515154] dark:text-slate-300">{t('githubBody')}</p>
              <a
                href="https://github.com/anthropics/claude-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0066CC] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A58B0]"
              >
                {t('githubCta')}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            <div className="rounded-2xl bg-[#F5F5F7] p-6 dark:bg-slate-950/60">
              <h2 className="font-semibold text-[#1D1D1F] dark:text-white">{t('suggestTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-[#515154] dark:text-slate-300">{t('suggestBody')}</p>
              <Link
                href="/suggestions"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-[#1D1D1F] transition hover:bg-slate-100 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800"
              >
                {t('suggestCta')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
