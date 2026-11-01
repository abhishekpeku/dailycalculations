import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { calculators, categories } from '@/data/calculators';
import CalculatorBrowser from '@/components/CalculatorBrowser';
import { routing } from '@/i18n/routing';
import { buildCanonical } from '@/lib/seo';
import { CARD } from '@/lib/categoryTheme';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ locale: routing.defaultLocale }];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators' });
  return {
    title: t('headline'),
    description: t('description'),
    alternates: buildCanonical('/calculators')
  };
}

// Trimmed for the client boundary — `compute` and the FAQ strings stay on the server.
const browseItems = calculators.map(({ id, category, title, description, aliases, glyph }) => ({
  id,
  category,
  title,
  description,
  aliases,
  glyph
}));

// One section per category, count derived (never hardcoded) so a future calculator addition
// updates this page for free.
const browseCategories = categories.map((category) => ({
  id: category.id,
  title: category.title,
  description: category.description,
  count: calculators.filter((item) => item.category === category.id).length
}));

export default async function CalculatorsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'calculators' });
  return (
    <div className="bg-[#F5F5F7] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className={CARD}>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0066CC] dark:text-brand-300">{t('eyebrow')}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white">{t('headline')}</h1>
            <p className="mt-4 text-[#515154] dark:text-slate-300">{t('description')}</p>
            <p className="mt-2 text-sm text-[#6E6E73] dark:text-slate-400">
              {t('countLine', { count: calculators.length, categoryCount: categories.length })}
            </p>
          </div>

          <CalculatorBrowser calculators={browseItems} categories={browseCategories} />
        </div>
      </div>
    </div>
  );
}
