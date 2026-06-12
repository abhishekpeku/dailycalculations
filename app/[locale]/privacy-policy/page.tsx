import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
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
  const t = await getTranslations({ locale, namespace: 'privacyPolicy' });
  const title = `${t('title')} | ${siteName}`;
  return {
    title,
    description: t('metaDescription'),
    alternates: { canonical: `${siteUrl}/privacy-policy` }
  };
}

export default async function PrivacyPolicyPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'privacyPolicy' });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">{t('title')}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('lastUpdated')}</p>

        <div className="mt-8 space-y-8 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('section1Title')}</h2>
            <p className="mt-3 leading-7">{t('section1Body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('section2Title')}</h2>
            <p className="mt-3 leading-7">{t('section2Body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('section3Title')}</h2>
            <p className="mt-3 leading-7">{t('section3Body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('section4Title')}</h2>
            <p className="mt-3 leading-7">{t('section4Body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('section5Title')}</h2>
            <p className="mt-3 leading-7">{t('section5Body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('section6Title')}</h2>
            <p className="mt-3 leading-7">{t('section6Body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('contactTitle')}</h2>
            <p className="mt-3 leading-7">{t('contactBody')}</p>
          </section>
        </div>
      </article>
    </div>
  );
}
