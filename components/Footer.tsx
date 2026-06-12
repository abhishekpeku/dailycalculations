import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-slate-200 bg-white/95 py-8 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t('tagline')}
            <Link href="/suggestions" className="ml-2 transition hover:text-slate-900 dark:hover:text-white">
              {t('suggestLink')}
            </Link>
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/about" className="transition hover:text-slate-900 dark:hover:text-white">{t('about')}</Link>
            <Link href="/contact" className="transition hover:text-slate-900 dark:hover:text-white">{t('contact')}</Link>
            <Link href="/privacy-policy" className="transition hover:text-slate-900 dark:hover:text-white">{t('privacy')}</Link>
            <Link href="/terms" className="transition hover:text-slate-900 dark:hover:text-white">{t('terms')}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
