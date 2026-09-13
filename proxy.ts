import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { CALCULATOR_REDIRECTS, CATEGORY_REDIRECTS } from '@/lib/redirects';

const intlMiddleware = createMiddleware(routing);

// English now serves at the root, so every locale-prefixed URL is permanently gone.
const DEAD_LOCALES = ['de', 'fr', 'es', 'it'];

// Permanently renamed pages. next/navigation's redirect() answers 307 and
// permanentRedirect() 308 — neither is the 301 these deserve.
const RENAMED_PATHS: Record<string, string> = {
  '/about-us': '/about',
  '/contact-us': '/contact',
  '/privacy': '/privacy-policy',
  '/terms-and-conditions': '/terms',
  ...CALCULATOR_REDIRECTS,
  ...CATEGORY_REDIRECTS
};

// Strips every leading dead-locale segment, not just one — old language-switcher links left
// Google crawling doubled-up prefixes like /fr/it/calculators/x, which otherwise take two 301s
// to resolve (one per segment) instead of one.
function stripDeadLocalePrefixes(pathname: string): string | null {
  const segments = pathname.split('/');
  let end = 1;
  while (end < segments.length && (segments[end] === 'en' || DEAD_LOCALES.includes(segments[end]))) {
    end += 1;
  }
  if (end === 1) return null;
  return `/${segments.slice(end).join('/')}`;
}

export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Strip every dead locale prefix and resolve a rename in one pass, so a URL needing
  // both answers a single 301 rather than chaining through an intermediate.
  const stripped = stripDeadLocalePrefixes(pathname);

  const lookup = stripped ?? pathname;
  const renamed = RENAMED_PATHS[lookup.endsWith('/') ? lookup.slice(0, -1) : lookup];

  const target = renamed ?? stripped;
  if (target) {
    return NextResponse.redirect(new URL(target + search, req.url), 301);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
