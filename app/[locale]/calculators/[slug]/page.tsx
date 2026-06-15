import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import CalculatorForm from '@/components/CalculatorForm';
import FaqSection from '@/components/FaqSection';
import { calculators, findCalculator, categories } from '@/data/calculators';
import { buildCalculatorMetadata, buildPageJsonLd } from '@/lib/seo';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    calculators.map((calculator) => ({ locale, slug: calculator.id }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return buildCalculatorMetadata(resolvedParams.slug);
}

export default async function CalculatorPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const calculator = findCalculator(slug);
  if (!calculator) notFound();

  const { compute, ...clientCalculator } = calculator;
  const jsonLd = buildPageJsonLd(slug);
  const t = await getTranslations({ locale, namespace: 'calculator' });

  const categoryObj = categories.find((c) => c.id === calculator.category);
  const categoryTitle = categoryObj ? categoryObj.title : calculator.category;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
          <div className="space-y-4">
            <Link
              href={`/categories/${calculator.category}`}
              locale={locale}
              className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700 dark:text-brand-300 inline-block"
            >
              {categoryTitle}
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{calculator.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{calculator.description}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Example: {calculator.example}</p>
          </div>
        </section>

        <CalculatorForm calculator={clientCalculator} />

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{t('howToUse')}</h2>
          <div className="mt-4 space-y-4 text-slate-600 dark:text-slate-300">
            <p>{t('howToUseDesc1')}</p>
            <p>{t('howToUseDesc2')}</p>
          </div>
        </section>

        <FaqSection
          title={`${calculator.title} FAQ`}
          description={`Common questions about using the ${calculator.title.toLowerCase()} and understanding the results.`}
          items={calculator.seo.faq}
        />
      </div>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </div>
  );
}
