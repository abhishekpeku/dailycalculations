import { NextResponse } from 'next/server';
import { calculators, categories } from '@/data/calculators';
import { routing } from '@/i18n/routing';

export function GET() {
  const baseUrl = 'https://dailycalculations.app';
  const today = new Date().toISOString();
  const locales = routing.locales;
  const defaultLocale = routing.defaultLocale;

  const staticPaths = [
    '',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/calculators',
    '/categories',
    '/suggestions',
  ];

  const urls: { loc: string; alternates: { hreflang: string; href: string }[] }[] = [];

  const buildAlternates = (path: string) =>
    locales.map((locale) => ({
      hreflang: locale,
      href: locale === defaultLocale ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`,
    }));

  const addUrl = (path: string) => {
    urls.push({
      loc: `${baseUrl}${path}`,
      alternates: buildAlternates(path),
    });
  };

  for (const path of staticPaths) {
    addUrl(path);
    for (const locale of locales) {
      if (locale !== defaultLocale) addUrl(`/${locale}${path}`);
    }
  }

  for (const calc of calculators) {
    const path = `/calculators/${calc.id}`;
    addUrl(path);
    for (const locale of locales) {
      if (locale !== defaultLocale) addUrl(`/${locale}${path}`);
    }
  }

  for (const cat of categories) {
    const path = `/categories/${cat.id}`;
    addUrl(path);
    for (const locale of locales) {
      if (locale !== defaultLocale) addUrl(`/${locale}${path}`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
    .map(({ loc, alternates }) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n${alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
        .join('\n')}\n  </url>`
    )
    .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
