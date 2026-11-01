import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import IconTile from '@/components/IconTile';
import GlyphCalculatorCard from '@/components/GlyphCalculatorCard';
import CategoryCalculatorFilter from '@/components/CategoryCalculatorFilter';
import { categories, findCategoryCalculators } from '@/data/calculators';
import { buildCategoryMetadata } from '@/lib/seo';
import type { Breadcrumb as BreadcrumbItem } from '@/lib/seo';
import { categoryTheme, CARD } from '@/lib/categoryTheme';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';
export const dynamicParams = false;

// Categories past this size get their own search box (today: measurements 40, math 29,
// statistics 25 — everything else tops out at 8). A threshold, not a hand-picked id list, so a
// category that grows past it in a later wave gets the filter for free.
const SEARCH_THRESHOLD = 15;

export async function generateStaticParams() {
  return categories.map((category) => ({ locale: routing.defaultLocale, category: category.id }));
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
  const theme = categoryTheme(category.id);
  const t = await getTranslations({ locale, namespace: 'categoryPage' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const breadcrumbs: BreadcrumbItem[] = [
    { name: t('breadcrumbHome'), href: '' },
    { name: t('breadcrumbCalculators'), href: '/calculators' },
    { name: category.title }
  ];

  const browseItems = categoryCalculators.map(({ id, title, description, category: calcCategory, aliases, glyph }) => ({
    id,
    title,
    description,
    category: calcCategory,
    aliases,
    glyph
  }));

  const otherCategories = categories.filter((item) => item.id !== category.id);

  return (
    <div className="bg-[#F5F5F7] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbs} />

          <div className={CARD}>
            <div className="flex items-start gap-4">
              <IconTile icon={theme.icon} color={theme.color} size="lg" />
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white">{category.title}</h1>
                <p className="mt-2 max-w-3xl text-base leading-7 text-[#515154] dark:text-slate-300">{category.description}</p>
                <p className="mt-2 text-sm text-[#6E6E73] dark:text-slate-400">{tCommon('calculators', { count: categoryCalculators.length })}</p>
              </div>
            </div>
          </div>

          <div className={CARD}>
            {categoryCalculators.length > SEARCH_THRESHOLD ? (
              <CategoryCalculatorFilter calculators={browseItems} />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                {browseItems.map((calculator) => (
                  <GlyphCalculatorCard key={calculator.id} calculator={calculator} />
                ))}
              </div>
            )}
          </div>

          <div className={CARD}>
            <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-white">{t('otherCategoriesHeading')}</h2>
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
              {otherCategories.map((other) => {
                const otherTheme = categoryTheme(other.id);
                return (
                  <Link
                    key={other.id}
                    href={`/categories/${other.id}`}
                    className="flex items-center gap-2.5 rounded-xl p-2 text-sm font-medium text-[#1D1D1F] transition hover:bg-[#F5F5F7] dark:text-white dark:hover:bg-slate-800"
                  >
                    <IconTile icon={otherTheme.icon} color={otherTheme.color} size="sm" />
                    {other.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
