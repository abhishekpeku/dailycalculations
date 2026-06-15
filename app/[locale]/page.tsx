import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import CalculatorSearch from '@/components/CalculatorSearch';
import CategoryGrid from '@/components/CategoryGrid';
import { calculators, categories } from '@/data/calculators';
import CalculatorCard from '@/components/CalculatorCard';
import FaqSection from '@/components/FaqSection';
import { buildHomeJsonLd, homeFaqs, siteName, siteUrl } from '@/lib/seo';
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
        description="Quick answers about free calculators, U.S.-focused defaults, common formulas, and how to use the tools."
        items={homeFaqs}
      />

      <section className="mt-16">
        <details className="group rounded-2xl border border-slate-200 bg-white/90 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5">
            <span className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Free Online Calculator — Instant, Accurate & No Signup Required</span>
            <span className="mt-1 text-lg text-brand-700 transition group-open:rotate-45 dark:text-brand-300" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="space-y-4 border-t border-slate-200 p-5 text-base leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <p>
            Whether you need a <strong className="text-slate-800 dark:text-slate-200">mortgage calculator</strong> to plan your home purchase, a <strong className="text-slate-800 dark:text-slate-200">loan calculator</strong> to compare repayment options, or a <strong className="text-slate-800 dark:text-slate-200">BMI calculator</strong> to track your health goals, Daily Calculations gives you fast, reliable answers — completely free, with no account required. Every <strong className="text-slate-800 dark:text-slate-200">calculator</strong> on this site is designed to load instantly, work on any device, and return results the moment you enter your numbers.
          </p>
          <p>
            Managing money starts with understanding the numbers. Our <strong className="text-slate-800 dark:text-slate-200">mortgage calculator</strong> lets you enter your home price, down payment, interest rate, and loan term to see your exact monthly payment and total interest cost. The <strong className="text-slate-800 dark:text-slate-200">auto loan calculator</strong> — also called a <strong className="text-slate-800 dark:text-slate-200">car loan calculator</strong> — does the same for vehicle financing, giving you a clear <strong className="text-slate-800 dark:text-slate-200">car payment calculator</strong> so you know exactly what you'll owe each month before you sign. For longer-term wealth building, the <strong className="text-slate-800 dark:text-slate-200">compound interest calculator</strong> shows how your savings or investments grow over time, and the <strong className="text-slate-800 dark:text-slate-200">investment calculator</strong> models returns across different contribution amounts and time horizons.
          </p>
          <p>
            Health and fitness tools are just as important. The <strong className="text-slate-800 dark:text-slate-200">BMI calculator</strong> uses your height and weight to compute your Body Mass Index and helps you understand where you fall on standard health ranges. The <strong className="text-slate-800 dark:text-slate-200">calorie calculator</strong> estimates your daily caloric needs based on age, weight, height, and activity level, while the <strong className="text-slate-800 dark:text-slate-200">TDEE calculator</strong> (Total Daily Energy Expenditure) gives you a precise maintenance calorie target to support weight loss, maintenance, or muscle gain goals.
          </p>
          <p>
            Students and professionals rely on Daily Calculations for academic planning too. The <strong className="text-slate-800 dark:text-slate-200">GPA calculator</strong> helps you compute your current grade point average or project what grades you need to hit your target. The <strong className="text-slate-800 dark:text-slate-200">final grade calculator</strong> is especially handy at the end of a semester — enter your current grade and the weight of your final exam to see exactly what score you need to pass or earn a specific letter grade.
          </p>
          <p>
            Everyday math is easier with the right tools. The <strong className="text-slate-800 dark:text-slate-200">percentage calculator</strong> handles tip splits, discounts, tax rates, and markups. The <strong className="text-slate-800 dark:text-slate-200">paycheck calculator</strong> breaks down your gross pay, federal and state withholdings, and net take-home amount so you always know what to expect on payday. The <strong className="text-slate-800 dark:text-slate-200">age calculator</strong> tells you your exact age in years, months, and days — useful for everything from birthday planning to legal and medical forms. The <strong className="text-slate-800 dark:text-slate-200">time calculator</strong> adds and subtracts hours and minutes for scheduling, billing, and time tracking.
          </p>
          <p>
            For more advanced needs, Daily Calculations includes a <strong className="text-slate-800 dark:text-slate-200">scientific calculator</strong> for trigonometric, logarithmic, and exponential functions, and a <strong className="text-slate-800 dark:text-slate-200">graphing calculator</strong> for visualizing equations and functions. Every tool is built with accessibility in mind — clear labels, high contrast, and keyboard support — so anyone can use them regardless of device or ability.
          </p>
          <p>
            Daily Calculations' mission is simple: give everyone access to accurate, fast, and free calculators for the decisions that matter most — financial, health, academic, and everyday. Bookmark this page and use it as your go-to calculator hub whenever you need a quick, trustworthy answer.
          </p>
          </div>
        </details>
      </section>
    </div>
  );
}
