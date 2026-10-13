import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import CalculatorForm from '@/components/CalculatorForm';
import BreakdownCalculator from '@/components/BreakdownCalculator';
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
import SolverCalculator from '@/components/SolverCalculator';
import ConceptSection from '@/components/ConceptSection';
import ReferencesSection from '@/components/ReferencesSection';
import TableOfContents from '@/components/TableOfContents';
import IconTile from '@/components/IconTile';
import SectionHeading from '@/components/SectionHeading';
import { CARD, categoryTheme } from '@/lib/categoryTheme';
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

  const { compute, content, solver, ...clientCalculator } = calculator;
  const jsonLd = buildPageJsonLd(slug);
  const t = await getTranslations({ locale, namespace: 'calculator' });

  const breadcrumbs = buildBreadcrumbs(slug);
  const howToSteps = buildHowToSteps(slug);
  const aliasSentence = buildAliasSentence(slug);
  const relatedLinks = buildRelatedLinks(slug);
  const faqTitle = `${calculator.title} FAQ`;

  // The table of contents only appears on v2 pages — the ones with a concept section.
  const tocItems = content?.concept
    ? [
        { id: 'concept', label: content.concept.title },
        { id: 'how-to-use', label: t('howToUse') },
        { id: 'formula', label: t('formulaTitle') },
        { id: 'worked-example', label: t('workedExampleTitle') },
        ...(content.watchOut.length > 0 ? [{ id: 'watch-out', label: t('watchOutTitle') }] : []),
        { id: 'faq', label: t('faqTocLabel') },
        ...(content.references?.length ? [{ id: 'references', label: t('referencesTitle') }] : [])
      ]
    : null;
  const reviewedDate = content?.lastReviewed
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(content.lastReviewed))
    : null;

  const widget = solver ? <SolverCalculator calculatorId={calculator.id} /> :
    calculator.breakdown ? <BreakdownCalculator calculatorId={calculator.id} /> :
    slug === 'gpa-calculator' ? <GpaCalculator /> :
    slug === 'paycheck-calculator' ? <PaycheckCalculator /> :
    slug === 'currency-converter' ? <CurrencyConverter /> :
    slug === 'character-counter' ? <TextToolsCalculator mode="character" /> :
    slug === 'hashtag-counter' ? <TextToolsCalculator mode="hashtag" /> :
    slug === 'pomodoro-timer' ? <PomodoroTimer /> :
    slug === 'timezone-meeting-planner' ? <TimeZonePlanner /> :
    <CalculatorForm calculator={clientCalculator} />;
  const example = <p className="text-sm text-slate-500 dark:text-slate-400">Example: {calculator.example}</p>;

  const intro = (
    <>
      {aliasSentence ? (
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{aliasSentence}</p>
      ) : null}
      <p className="text-base leading-7 text-slate-700 dark:text-slate-300">{calculator.description}</p>
      {reviewedDate ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('byline')} · <time dateTime={content?.lastReviewed}>{t('lastReviewed', { date: reviewedDate })}</time>
        </p>
      ) : null}
    </>
  );

  return (
    <div className={`mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 ${tocItems ? 'max-w-6xl' : 'max-w-5xl'}`}>
      <div className="space-y-8">
        {/* Deliberately not a card: the hero is compressed so the widget stays above the fold. */}
        <header className="space-y-3">
          <Breadcrumb items={breadcrumbs} />
          <div className="flex items-center gap-4">
            <IconTile icon={categoryTheme(calculator.category).icon} color={categoryTheme(calculator.category).color} size="lg" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{calculator.title}</h1>
          </div>
          {tocItems ? null : <div className="max-w-3xl space-y-3">{intro}</div>}
        </header>

        {tocItems ? (
          // v2 pages: calculator in the wide column; intro + table of contents in a narrower panel beside it.
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
            <div className="space-y-4">
              {widget}
              {example}
            </div>
            <aside className="space-y-6 lg:sticky lg:top-6">
              <div className={`${CARD} space-y-3`}>{intro}</div>
              <TableOfContents title={t('contentsTitle')} items={tocItems} />
            </aside>
          </div>
        ) : (
          <>
            {widget}
            {example}
          </>
        )}

        {content?.concept ? <ConceptSection concept={content.concept} /> : null}

        <section id="how-to-use" className={CARD}>
          <SectionHeading section="how-to-use" title={t('howToUse')} />
          <div className="mt-5 space-y-5 text-base leading-7 text-slate-600 dark:text-slate-300">
            <p>{content ? content.howTo.intro : t('howToUseDesc1')}</p>
            <ol className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-slate-50 dark:divide-slate-800 dark:bg-slate-950/60">
              {howToSteps.map((step, index) => (
                <li key={step.name} className="flex gap-4 px-4 py-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#28A745] text-xs font-bold text-white">{index + 1}</span>
                  <p className="text-sm leading-6">
                    <span className="font-semibold text-slate-900 dark:text-white">{step.name}.</span>{' '}
                    {step.text}
                  </p>
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
          title={faqTitle}
          description={`Common questions about using the ${calculator.title.toLowerCase()} and understanding the results.`}
          items={calculator.seo.faq}
        />

        {content?.references ? <ReferencesSection title={t('referencesTitle')} references={content.references} /> : null}

        <RelatedCalculators title={t('relatedTitle')} description={t('relatedDescription')} items={relatedLinks} />
      </div>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </div>
  );
}
