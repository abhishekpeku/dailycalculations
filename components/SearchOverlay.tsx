'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import CalculatorMenuItem from './CalculatorMenuItem';
import { matchesQuery } from '@/lib/search';
import type { NavData } from '@/lib/navData';

const MAX_RESULTS = 8;

type Props = {
  nav: NavData;
  open: boolean;
  onClose: () => void;
};

// A centered "jump to anything" modal, reachable from every page (the header's search icon, or
// the `/` shortcut). Unlike the Categories panel, this is deliberately NOT anchored under the
// header — it should read as a dedicated tool, not a nav dropdown. Portaled to <body> for the
// same reason as Header's own panel and MobileMenu: the header's `backdrop-blur` is a CSS
// containing block for `fixed` descendants, so an un-portaled child would pin to the header's
// ~70px box instead of the viewport.
export default function SearchOverlay({ nav, open, onClose }: Props) {
  const t = useTranslations('nav');
  const tSearch = useTranslations('search');
  const tMenu = useTranslations('navMenu');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [entered, setEntered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return [];
    return nav.calculators.filter((calculator) => matchesQuery(calculator, trimmed)).slice(0, MAX_RESULTS);
  }, [nav.calculators, trimmed]);

  // Reset on every open so a stale query from last time never flashes, then autofocus. The
  // `entered` flag drives a one-frame-later transition-in (scale/opacity) instead of a flat
  // on/off appearance — the overlay should feel considered, not bolted on.
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    setQuery('');
    const frame = requestAnimationFrame(() => setEntered(true));
    const focusTimeout = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(focusTimeout);
    };
  }, [open]);

  const close = () => {
    setEntered(false);
    onClose();
  };

  const navigateToTopMatch = () => {
    const top = filtered[0];
    if (!top) return;
    router.push(`/calculators/${top.id}`);
    close();
  };

  // Escape closes regardless of where focus is inside the overlay; Enter jumps to the top match.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      navigateToTopMatch();
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh] sm:pt-[16vh]">
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-150 ${entered ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('openSearch')}
        onKeyDown={handleKeyDown}
        className={`relative z-10 h-fit w-full max-w-lg origin-top overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 transition duration-150 dark:bg-slate-900 dark:ring-white/10 ${
          entered ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-1 scale-[0.98] opacity-0'
        }`}
      >
        <div className="relative border-b border-slate-100 dark:border-slate-800">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E6E73] dark:text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <label htmlFor="header-search-input" className="sr-only">
            {tSearch('label')}
          </label>
          <input
            ref={inputRef}
            id="header-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tSearch('placeholder')}
            autoComplete="off"
            className="h-16 w-full bg-transparent pl-14 pr-5 text-base text-[#1D1D1F] outline-none dark:text-slate-100"
          />
        </div>

        {trimmed && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filtered.length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {filtered.map((calculator) => (
                  <li key={calculator.id}>
                    <CalculatorMenuItem calculator={calculator} onNavigate={close} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{tMenu('noMatches', { query: trimmed })}</p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
