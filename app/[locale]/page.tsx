import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import CalculatorSearch from '@/components/CalculatorSearch';
import CategoryGrid from '@/components/CategoryGrid';
import { calculators, categories } from '@/data/calculators';
import CalculatorCard from '@/components/CalculatorCard';
import FaqSection from '@/components/FaqSection';
import { buildHomeJsonLd, siteName, siteUrl } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const title = `Free Online Calculator — Mortgage, BMI, Loan, GPA & More | ${siteName}`;
  const description = 'Use free online calculators for mortgage, BMI, loan, GPA, compound interest, auto loan, calorie, paycheck, age, investment, TDEE, and more. Fast, accurate, no signup required.';
  return {
    title,
    description,
    keywords: [
      'calculator', 'mortgage calculator', 'bmi calculator', 'calorie calculator',
      'loan calculator', 'gpa calculator', 'compound interest calculator',
      'auto loan calculator', 'car loan calculator', 'scientific calculator',
      'percentage calculator', 'car payment calculator', 'paycheck calculator',
      'age calculator', 'investment calculator', 'tdee calculator',
      'final grade calculator', 'graphing calculator', 'time calculator'
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: siteUrl,
      siteName,
      images: [
        {
          url: `${siteUrl}/web-app-manifest-192x192.png`,
          width: 192,
          height: 192,
          alt: `${siteName} — Free Online Calculators`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@dailycalculations'
    },
    alternates: {
      canonical: siteUrl
    }
  };
}

const featured = calculators.filter((c) =>
  ['mortgage-calculator', 'sales-tax-calculator', 'bmi-calculator', 'miles-to-kilometers-converter'].includes(c.id)
);
const searchItems = calculators.map(({ id, title, description }) => ({ id, title, description }));

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tSearch = await getTranslations({ locale, namespace: 'search' });
  const tFaq = await getTranslations({ locale, namespace: 'homeFaq' });
  const tSeo = await getTranslations({ locale, namespace: 'homeSeo' });
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-6 py-10">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700 dark:text-brand-300">{t('eyebrow')}</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{t('headline')}</h1>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{t('description')}</p>
          </div>
          <CalculatorSearch calculators={searchItems} searchLabel={tSearch('label')} searchPlaceholder={tSearch('placeholder')} />
        </div>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryGrid key={category.id} category={category} locale={locale} />
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-400">{t('featuredEyebrow')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{t('featuredHeadline')}</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((calculator) => (
            <CalculatorCard key={calculator.id} calculator={calculator} locale={locale} variant="compact" />
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-400">Site information</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Helpful pages</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: '/about', title: 'About Us', description: 'Learn what Daily Calculations offers and how the tools are built.' },
            { href: '/contact', title: 'Contact Us', description: 'Report a bug, ask a question, or suggest a new calculator.' },
            { href: '/privacy-policy', title: 'Privacy Policy', description: 'Read how calculator inputs, preferences, and data are handled.' },
            { href: '/terms', title: 'Terms & Conditions', description: 'Review the rules and disclaimers for using the calculators.' }
          ].map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-panel transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-800 dark:border-slate-800 dark:bg-slate-950/90 dark:hover:border-brand-700 dark:hover:text-brand-200"
            >
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">{page.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{page.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHomeJsonLd()) }} />

      <FaqSection
        title={tFaq('title')}
        description={tFaq('description')}
        items={Array.from({ length: 14 }, (_, i) => ({
          question: tFaq(`q${i}`),
          answer: tFaq(`a${i}`)
        }))}
      />

      <section className="mt-16">
        <details className="group rounded-2xl border border-slate-200 bg-white/90 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5">
            <span className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{tSeo('title')}</span>
            <span className="mt-1 text-lg text-brand-700 transition group-open:rotate-45 dark:text-brand-300" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="space-y-4 border-t border-slate-200 p-5 text-base leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <p>{tSeo('p1')}</p>
            <p>{tSeo('p2')}</p>
            <p>{tSeo('p3')}</p>
            <p>{tSeo('p4')}</p>
            <p>{tSeo('p5')}</p>
            <p>{tSeo('p6')}</p>
            <p>{tSeo('p7')}</p>
          </div>
        </details>
      </section>
    </div>
  );
}
