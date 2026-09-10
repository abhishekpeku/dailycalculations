import { MetadataRoute } from 'next';
import { calculators, categories } from '@/data/calculators';
import { SITE_URL } from '@/lib/site';

// Home is emitted separately at a lower priority than the calculator pages —
// the leaf pages are the product (see mdFiles/instructions.md §2.4).
const STATIC_PATHS = [
  '/calculators',
  '/categories',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/suggestions',
];

function entry(path: string, priority: number, lastModified: Date): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  return [
    entry('', 0.6, buildDate),
    ...STATIC_PATHS.map((path) => entry(path, 0.5, buildDate)),
    ...calculators.map((calc) =>
      entry(`/calculators/${calc.id}`, 0.8, new Date(calc.updatedAt))
    ),
    ...categories.map((cat) => entry(`/categories/${cat.id}`, 0.6, buildDate)),
  ];
}
