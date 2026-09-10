import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import CalculatorForm from '@/components/CalculatorForm';
import GpaCalculator from '@/components/GpaCalculator';
import PaycheckCalculator from '@/components/PaycheckCalculator';
import CurrencyConverter from '@/components/CurrencyConverter';
import TextToolsCalculator from '@/components/TextToolsCalculator';
import PomodoroTimer from '@/components/PomodoroTimer';
import TimeZonePlanner from '@/components/TimeZonePlanner';
import FaqSection from '@/components/FaqSection';
import Breadcrumb from '@/components/Breadcrumb';
import FormulaSection from '@/components/FormulaSection';
import WorkedExampleSection from '@/components/WorkedExampleSection';
import WatchOutSection from '@/components/WatchOutSection';
import RelatedCalculators from '@/components/RelatedCalculators';
import { calculators, findCalculator } from '@/data/calculators';
import { buildAliasSentence, buildBreadcrumbs, buildCalculatorMetadata, buildHowToSteps, buildPageJsonLd, buildRelatedLinks } from '@/lib/seo';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return calculators.map((calculator) => ({ locale: routing.defaultLocale, slug: calculator.id }));
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

  const { compute, content, ...clientCalculator } = calculator;
  const jsonLd = buildPageJsonLd(slug);
  const t = await getTranslations({ locale, namespace: 'calculator' });

  const breadcrumbs = buildBreadcrumbs(slug);
  const howToSteps = buildHowToSteps(slug);
  const aliasSentence = buildAliasSentence(slug);
  const relatedLinks = buildRelatedLinks(slug);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Deliberately not a card: the hero is compressed so the widget stays above the fold. */}
        <header className="space-y-3">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{calculator.title}</h1>
          {aliasSentence ? (
            <p className="max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{aliasSentence}</p>
          ) : null}
          <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{calculator.description}</p>
        </header>

        {slug === 'gpa-calculator' ? <GpaCalculator /> :
         slug === 'paycheck-calculator' ? <PaycheckCalculator /> :
         slug === 'currency-converter' ? <CurrencyConverter /> :
         slug === 'character-counter' ? <TextToolsCalculator mode="character" /> :
         slug === 'hashtag-counter' ? <TextToolsCalculator mode="hashtag" /> :
         slug === 'pomodoro-timer' ? <PomodoroTimer /> :
         slug === 'timezone-meeting-planner' ? <TimeZonePlanner /> :
         <CalculatorForm calculator={clientCalculator} />}

        <p className="text-sm text-slate-500 dark:text-slate-400">Example: {calculator.example}</p>

        <section id="how-to-use" className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{t('howToUse')}</h2>
          <div className="mt-4 space-y-4 text-slate-600 dark:text-slate-300">
            <p>{content ? content.howTo.intro : t('howToUseDesc1')}</p>
            <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-brand-700 dark:marker:text-brand-300">
              {howToSteps.map((step) => (
                <li key={step.name}>
                  <span className="font-medium text-slate-900 dark:text-white">{step.name}.</span>{' '}
                  {step.text}
                </li>
              ))}
            </ol>
            <p>{content ? content.howTo.outro ?? t('howToUseDesc2') : t('howToUseDesc2')}</p>
          </div>
        </section>

        {content ? <FormulaSection title={t('formulaTitle')} formula={content.formula} /> : null}
        {content ? <WorkedExampleSection title={t('workedExampleTitle')} example={content.workedExample} /> : null}
        {content ? <WatchOutSection title={t('watchOutTitle')} items={content.watchOut} /> : null}

        <FaqSection
          title={`${calculator.title} FAQ`}
          description={`Common questions about using the ${calculator.title.toLowerCase()} and understanding the results.`}
          items={calculator.seo.faq}
        />

        <RelatedCalculators title={t('relatedTitle')} description={t('relatedDescription')} items={relatedLinks} />
      </div>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </div>
  );
}
