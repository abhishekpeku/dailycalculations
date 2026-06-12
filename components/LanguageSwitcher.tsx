'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LOCALE_NAMES: Record<string, string> = {
  en: 'EN',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  it: 'IT'
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(pathname, { locale: e.target.value });
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      aria-label="Select language"
      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_NAMES[loc]}
        </option>
      ))}
    </select>
  );
}
