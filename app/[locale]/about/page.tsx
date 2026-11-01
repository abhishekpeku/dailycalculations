import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
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
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildCanonical('/about')
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
    <div className="bg-[#F5F5F7] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <article className={CARD}>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0066CC] dark:text-brand-300">{t('eyebrow')}</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#1D1D1F] dark:text-white">{t('title')}</h1>
          <p className="mt-3 leading-7 text-[#515154] dark:text-slate-300">{t('intro')}</p>

          <div className="mt-8 space-y-8 text-[#515154] dark:text-slate-300">
            <section>
              <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-white">{t('missionTitle')}</h2>
              <p className="mt-3 leading-7">{t('missionBody')}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-white">{t('whatWeOfferTitle')}</h2>
              <p className="mt-3 leading-7">{t('whatWeOfferBody')}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-white">{t('whyFreeTitle')}</h2>
              <p className="mt-3 leading-7">{t('whyFreeBody')}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-white">{t('accuracyTitle')}</h2>
              <p className="mt-3 leading-7">{t('accuracyBody')}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-white">{t('contactTitle')}</h2>
              <p className="mt-3 leading-7">{t('contactBody')}</p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
