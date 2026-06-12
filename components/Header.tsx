'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from './ThemeProvider';

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`rounded-md p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${className ?? ''}`}
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Header() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-slate-950 dark:text-white">
          Daily Calculations
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm text-slate-600 dark:text-slate-300 lg:flex">
          <Link href="/" className="transition hover:text-slate-900 dark:hover:text-white">{t('home')}</Link>
          <Link href="/calculators" className="transition hover:text-slate-900 dark:hover:text-white">{t('allCalculators')}</Link>
          <Link href="/categories" className="transition hover:text-slate-900 dark:hover:text-white">{t('categories')}</Link>
          <Link href="/about" className="transition hover:text-slate-900 dark:hover:text-white">{t('about')}</Link>
          <Link href="/contact" className="transition hover:text-slate-900 dark:hover:text-white">{t('contact')}</Link>
          <Link href="/privacy-policy" className="transition hover:text-slate-900 dark:hover:text-white">{t('privacy')}</Link>
          <Link href="/terms" className="transition hover:text-slate-900 dark:hover:text-white">{t('terms')}</Link>
          <Link href="/suggestions" className="transition hover:text-slate-900 dark:hover:text-white">{t('suggest')}</Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>

        {/* Mobile: language switcher + hamburger button */}
        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <nav className="border-t border-slate-200 bg-white/95 px-4 pb-4 pt-2 dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
          <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{t('home')}</Link>
            <Link href="/calculators" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{t('allCalculators')}</Link>
            <Link href="/categories" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{t('categories')}</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{t('about')}</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{t('contact')}</Link>
            <Link href="/privacy-policy" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{t('privacy')}</Link>
            <Link href="/terms" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{t('terms')}</Link>
            <Link href="/suggestions" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{t('suggest')}</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
