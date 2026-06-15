import { MetadataRoute } from 'next';
import { calculators, categories } from '@/data/calculators';
import { routing } from '@/i18n/routing';

const baseUrl = 'https://dailycalculations.app';
const { locales, defaultLocale } = routing;

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

function buildEntry(path: string): MetadataRoute.Sitemap[number] {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] =
      locale === defaultLocale ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
  }
  return {
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    alternates: { languages: alternates },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    entries.push(buildEntry(path));
    for (const locale of locales) {
      if (locale !== defaultLocale) entries.push(buildEntry(`/${locale}${path}`));
    }
  }

  for (const calc of calculators) {
    const path = `/calculators/${calc.id}`;
    entries.push(buildEntry(path));
    for (const locale of locales) {
      if (locale !== defaultLocale) entries.push(buildEntry(`/${locale}${path}`));
    }
  }

  for (const cat of categories) {
    const path = `/categories/${cat.id}`;
    entries.push(buildEntry(path));
    for (const locale of locales) {
      if (locale !== defaultLocale) entries.push(buildEntry(`/${locale}${path}`));
    }
  }

  return entries;
}
