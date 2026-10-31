import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import CalculatorSearch from '@/components/CalculatorSearch';
import IconTile, { type TileColor } from '@/components/IconTile';
import { calculators, categories, findCalculator } from '@/data/calculators';
import FaqSection from '@/components/FaqSection';
import { buildCanonical, buildHomeJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { categoryTheme } from '@/lib/categoryTheme';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

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
  const t = await getTranslations({ locale, namespace: 'home' });
  // The homepage's title.template does not apply here (it's the index segment for [locale],
  // not a descendant of it) — unlike every other page, this one needs the brand suffix spelled
  // out manually or it renders with no suffix at all.
  const title = `Free Online Calculator — Mortgage, BMI, Loan, GPA & More | ${SITE_NAME}`;
  const fullTitle = title;
  const description = 'Use free online calculators for mortgage, BMI, loan, GPA, compound interest, auto loan, calorie, paycheck, age, investment, TDEE, and more. Fast, accurate, no signup required.';
  return {
    title,
    description,
    // Must stay identical to the array in layout.tsx — see the note there.
    keywords: [
      'calculator', 'mortgage calculator', 'bmi calculator', 'calorie calculator',
      'loan calculator', 'gpa calculator', 'compound interest calculator',
      'auto loan calculator', 'car loan calculator', 'car payment calculator',
      'paycheck calculator', 'age calculator', 'investment calculator',
      'tdee calculator', 'time calculator'
    ],
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/web-app-manifest-192x192.png`,
          width: 192,
          height: 192,
          alt: `${SITE_NAME} — Free Online Calculators`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      site: '@dailycalculations'
    },
    alternates: buildCanonical('')
  };
}

const searchItems = calculators.map(({ id, title, description, aliases }) => ({ id, title, description, aliases }));

// Short display labels for the hero's "Try:" row — the real calculator titles ("Mortgage
// Calculator") are too long for this compact line; the approved copy spells these out exactly.
const TRY_LINKS = [
  { id: 'mortgage-calculator', label: 'Mortgage' },
  { id: 'bmi-calculator', label: 'BMI' },
  { id: 'sales-tax-calculator', label: 'Sales tax' },
  { id: 'percentage-calculator', label: 'Percentage' }
];

// Light-mode tint per category color, for the small "Popular calculators" cards. Dark mode falls
// back to the site's usual dark card surface (see the render below) rather than a second,
// colored dark-mode system.
const POPULAR_TINT: Partial<Record<TileColor, string>> = {
  pink: 'bg-[#FDECEF]',
  red: 'bg-[#FDEDEB]',
  purple: 'bg-[#F4EAFB]',
  orange: 'bg-[#FFF3E0]'
};

// The first entry renders as the large green feature card; the rest as small tinted cards.
// `example` must be unit/currency-neutral (the site is region-aware) — verified by hand:
// 26.2 mi = 42.16 km (1 mi = 1.609344 km), 15% of 80 = 12. Cards with no `example` show the
// calculator's own description instead.
const POPULAR = [
  { id: 'mortgage-calculator' },
  { id: 'bmi-calculator' },
  { id: 'sales-tax-calculator' },
  { id: 'miles-to-kilometers-converter', example: '26.2 mi = 42.16 km' },
  { id: 'percentage-calculator', example: '15% of 80 = 12' }
];

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tSearch = await getTranslations({ locale, namespace: 'search' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tFaq = await getTranslations({ locale, namespace: 'homeFaq' });
  const tSeo = await getTranslations({ locale, namespace: 'homeSeo' });
  // "mortgage, BMI, loan, GPA and {count} more" — the 4 named calculators excluded, never a literal.
  const moreCount = calculators.length - 4;

  return (
    <div className="bg-[#F5F5F7] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="py-6 text-center sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0066CC] dark:text-brand-300">{t('eyebrow')}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white sm:text-5xl">{t('headline')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#515154] dark:text-slate-300">
            {t('subtitle', { count: moreCount })}
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <CalculatorSearch
              calculators={searchItems}
              searchLabel={tSearch('label')}
              searchPlaceholder={tSearch('placeholder')}
              noResultsLabel={tSearch('noResults')}
            />
          </div>

          <p className="mt-5 text-sm text-[#6E6E73] dark:text-slate-400">
            {t('tryLabel')}{' '}
            {TRY_LINKS.map((link, index) => (
              <span key={link.id}>
                {index > 0 && <span className="mx-1.5">·</span>}
                <Link href={`/calculators/${link.id}`} className="font-medium text-[#0066CC] transition hover:underline dark:text-brand-300">
                  {link.label}
                </Link>
              </span>
            ))}
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">{t('categoryHeadline')}</h2>
            <Link href="/calculators" className="text-sm font-medium text-[#0066CC] transition hover:underline dark:text-brand-300">
              {t('categoryViewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
            {categories.map((category) => {
              const theme = categoryTheme(category.id);
              const count = calculators.filter((c) => c.category === category.id).length;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="flex flex-col items-start gap-2 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_20px_rgba(15,23,42,0.05)] ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 dark:bg-slate-900 dark:ring-white/10"
                >
                  <IconTile icon={theme.icon} color={theme.color} size="md" />
                  <div>
                    <p className="text-base font-semibold text-[#1D1D1F] dark:text-white">{category.title}</p>
                    <p className="text-sm text-[#6E6E73] dark:text-slate-400">{tCommon('calculators', { count })}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-16 mt-12 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">{t('popularHeadline')}</h2>
            <p className="mt-1 text-sm text-[#6E6E73] dark:text-slate-400">{t('popularSubline')}</p>
          </div>
          <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR.map((card, index) => {
              const calculator = findCalculator(card.id);
              if (!calculator) return null;
              const theme = categoryTheme(calculator.category);

              if (index === 0) {
                // The large feature card: solid green gradient, white text, its own inset panel.
                const categoryLabel = categories.find((c) => c.id === calculator.category)?.title ?? '';
                return (
                  <Link
                    key={card.id}
                    href={`/calculators/${card.id}`}
                    className="flex flex-col justify-between rounded-3xl p-6 sm:col-span-2 lg:col-span-1 lg:row-span-2 text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 sm:p-8"
                    style={{ backgroundImage: 'linear-gradient(160deg, #34C759, #1E8E3E)' }}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">{categoryLabel}</p>
                      <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{calculator.title}</h3>
                      <p className="mt-3 max-w-md text-sm leading-6 text-white/90">{calculator.description}</p>
                    </div>
                    <div className="mt-6 rounded-2xl bg-white/15 p-4">
                      <div className="flex flex-wrap gap-2">
                        {['Monthly payment', 'Total interest', 'Amortization schedule'].map((chip) => (
                          <span key={chip} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                            {chip}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm font-semibold">Open calculator →</p>
                    </div>
                  </Link>
                );
              }

              const tint = POPULAR_TINT[theme.color] ?? 'bg-slate-100';
              return (
                <Link
                  key={card.id}
                  href={`/calculators/${card.id}`}
                  className={`flex flex-col justify-between rounded-3xl p-5 transition hover:-translate-y-0.5 dark:bg-slate-900 dark:ring-1 dark:ring-white/10 ${tint}`}
                >
                  <div className="flex items-center gap-3">
                    <IconTile icon={theme.icon} color={theme.color} size="lg" />
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white">{calculator.title}</h3>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#515154] dark:text-slate-300">
                    {card.example ? <span className="text-xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white">{card.example}</span> : calculator.description}
                  </p>
                </Link>
              );
            })}
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
    </div>
  );
}
