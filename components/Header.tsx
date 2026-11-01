'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useTheme } from './ThemeProvider';
import CategoriesMenu from './CategoriesMenu';
import MobileMenu from './MobileMenu';
import type { NavData } from '@/lib/navData';

// Exported so MobileMenu's bottom row reuses the exact same button, instead of a second copy.
export function ThemeToggle({ className }: { className?: string }) {
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

// A small delay before a hover-away closes the panel, so moving the pointer from the button to
// the panel (or around inside it) doesn't close it mid-move.
const HOVER_CLOSE_DELAY = 200;

export default function Header({ nav }: { nav: NavData }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const categoriesButtonRef = useRef<HTMLButtonElement>(null);
  const categoriesPanelRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const hoverCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A route change (a link inside either menu was followed) closes both.
  useEffect(() => {
    setCategoriesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Escape closes whichever menu is open and returns focus to its trigger. Outside click closes
  // the desktop panel only — the phone sheet already covers the whole screen.
  useEffect(() => {
    if (!categoriesOpen && !mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (categoriesOpen) {
        setCategoriesOpen(false);
        categoriesButtonRef.current?.focus();
      }
      if (mobileOpen) {
        setMobileOpen(false);
        mobileButtonRef.current?.focus();
      }
    };
    const handleClick = (event: MouseEvent) => {
      if (!categoriesOpen) return;
      const target = event.target as Node;
      if (categoriesPanelRef.current?.contains(target) || categoriesButtonRef.current?.contains(target)) return;
      setCategoriesOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [categoriesOpen, mobileOpen]);

  // Body scroll is locked while the full-height phone sheet covers the page.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const openOnHover = () => {
    if (hoverCloseTimeout.current) clearTimeout(hoverCloseTimeout.current);
    setCategoriesOpen(true);
  };
  const closeOnHoverAway = () => {
    hoverCloseTimeout.current = setTimeout(() => setCategoriesOpen(false), HOVER_CLOSE_DELAY);
  };

  return (
    <header className="relative z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-slate-950 dark:text-white">
          Daily Calculations
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm text-slate-600 dark:text-slate-300 lg:flex">
          <Link href="/" className="transition hover:text-slate-900 dark:hover:text-white">{t('home')}</Link>

          <div className="relative" onMouseEnter={openOnHover} onMouseLeave={closeOnHoverAway}>
            <button
              ref={categoriesButtonRef}
              type="button"
              aria-expanded={categoriesOpen}
              aria-controls="categories-menu-panel"
              onClick={() => setCategoriesOpen((previous) => !previous)}
              className="flex items-center gap-1 transition hover:text-slate-900 dark:hover:text-white"
            >
              {t('categories')}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width={12}
                height={12}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

          </div>

          <Link href="/calculators" className="transition hover:text-slate-900 dark:hover:text-white">{t('allCalculators')}</Link>
          <Link href="/about" className="transition hover:text-slate-900 dark:hover:text-white">{t('about')}</Link>
          <Link href="/suggestions" className="transition hover:text-slate-900 dark:hover:text-white">{t('suggest')}</Link>
          <ThemeToggle />
        </nav>

        {/* Mobile: theme toggle + hamburger button */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            ref={mobileButtonRef}
            onClick={() => setMobileOpen(true)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrim behind the desktop panel, portaled to <body>: `backdrop-blur` above makes this
          header a CSS containing block for fixed descendants, so a plain `fixed inset-0` child
          would be pinned to the header's own ~70px box instead of the viewport. */}
      {categoriesOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div aria-hidden="true" onClick={() => setCategoriesOpen(false)} className="fixed inset-0 z-20 bg-slate-950/20" />,
          document.body
        )}

      {/* Desktop panel, anchored under the full header (max-w-6xl, same as the header's own row).
          Hover handlers mirror the button's, so moving the pointer down into the panel keeps it open. */}
      {categoriesOpen && (
        <div
          ref={categoriesPanelRef}
          id="categories-menu-panel"
          onMouseEnter={openOnHover}
          onMouseLeave={closeOnHoverAway}
          className="absolute inset-x-0 top-full z-20 hidden lg:block"
        >
          <div className="mx-auto max-w-6xl px-4 pt-2 sm:px-6 lg:px-8">
            <CategoriesMenu nav={nav} onNavigate={() => setCategoriesOpen(false)} />
          </div>
        </div>
      )}

      <MobileMenu nav={nav} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
