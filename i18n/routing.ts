import { defineRouting } from 'next-intl/routing';

// English-only (D2). `as-needed` keeps English at the root; adding a second locale later
// puts it at /<locale>/… with no second URL migration.
export const routing = defineRouting({
  locales: ['en'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeCookie: false
});

export type Locale = (typeof routing.locales)[number];
