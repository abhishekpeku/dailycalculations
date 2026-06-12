import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import CalculatorCard from '@/components/CalculatorCard';
import { categories, findCategoryCalculators } from '@/data/calculators';
import { buildCategoryMetadata } from '@/lib/seo';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    categories.map((category) => ({ locale, category: category.id }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return buildCategoryMetadata(resolvedParams.category);
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categoryId } = await params;
  setRequestLocale(locale);

  const category = categories.find((item) => item.id === categoryId);
  if (!category) notFound();

  const categoryCalculators = findCategoryCalculators(category.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700 dark:text-brand-300">{category.title}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{category.title} calculators</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{category.description}</p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoryCalculators.map((calculator) => (
            <CalculatorCard key={calculator.id} calculator={calculator} />
          ))}
        </div>
      </div>
    </div>
  );
}
