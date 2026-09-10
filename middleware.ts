import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// English now serves at the root, so every locale-prefixed URL is permanently gone.
const DEAD_LOCALES = ['de', 'fr', 'es', 'it'];

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const seg = pathname.split('/')[1];

  if (seg === 'en' || DEAD_LOCALES.includes(seg)) {
    const stripped = pathname.slice(seg.length + 1) || '/';
    return NextResponse.redirect(new URL(stripped + search, req.url), 301);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
