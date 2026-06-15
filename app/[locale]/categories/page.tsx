import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import CategoryCard from '@/components/CategoryCard';
import { categories, calculators } from '@/data/calculators';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function CategoriesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'categories' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700 dark:text-brand-300">{t('eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{t('headline')}</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">{t('description')}</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const count = calculators.filter((item) => item.category === category.id).length;
            return (
              <CategoryCard
                key={category.id}
                category={category}
                count={count}
                locale={locale}
                toolsLabel={tCommon('tools', { count })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
