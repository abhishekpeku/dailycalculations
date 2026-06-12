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
  const t = await getTranslations({ locale, namespace: 'about' });
  const title = `${t('title')} | ${siteName}`;
  return {
    title,
    description: t('metaDescription'),
    alternates: { canonical: `${siteUrl}/about` }
  };
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">{t('eyebrow')}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{t('title')}</h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{t('intro')}</p>

        <div className="mt-8 space-y-8 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('missionTitle')}</h2>
            <p className="mt-3 leading-7">{t('missionBody')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('whatWeOfferTitle')}</h2>
            <p className="mt-3 leading-7">{t('whatWeOfferBody')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('whyFreeTitle')}</h2>
            <p className="mt-3 leading-7">{t('whyFreeBody')}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('accuracyTitle')}</h2>
            <p className="mt-3 leading-7">{t('accuracyBody')}</p>
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
