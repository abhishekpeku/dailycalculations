import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { CALCULATOR_REDIRECTS } from '@/lib/redirects';

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
  ...CALCULATOR_REDIRECTS
};

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const seg = pathname.split('/')[1];

  // Strip a dead locale prefix and resolve a rename in one pass, so a URL needing
  // both answers a single 301 rather than chaining through an intermediate.
  const stripped =
    seg === 'en' || DEAD_LOCALES.includes(seg) ? pathname.slice(seg.length + 1) || '/' : null;

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
