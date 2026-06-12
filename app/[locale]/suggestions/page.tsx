import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import SuggestionForm from '@/components/SuggestionForm';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SuggestionsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'suggestions' });
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">{t('headline')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('description')}</p>
        <div className="mt-6">
          <SuggestionForm />
        </div>
      </section>
    </div>
  );
}
