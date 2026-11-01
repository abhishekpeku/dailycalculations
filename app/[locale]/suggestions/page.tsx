import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import SuggestionForm from '@/components/SuggestionForm';
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
  const t = await getTranslations({ locale, namespace: 'suggestions' });
  return {
    title: t('headline'),
    description: t('description'),
    alternates: buildCanonical('/suggestions')
  };
}

export default async function SuggestionsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'suggestions' });
  return (
    <div className="bg-[#F5F5F7] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <section className={CARD}>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">{t('headline')}</h1>
          <p className="mt-2 text-[#515154] dark:text-slate-300">{t('description')}</p>
          <div className="mt-6">
            <SuggestionForm />
          </div>
        </section>
      </div>
    </div>
  );
}
