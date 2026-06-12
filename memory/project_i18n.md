---
name: project-i18n
description: i18n implementation for Calcora — next-intl 3.x, 5 locales, [locale] App Router routing
metadata:
  type: project
---

Added multi-language support using next-intl 3.26.5 (installed with --legacy-peer-deps due to Next.js 16 peer dep mismatch).

Supported locales: en, de, fr, es, it. Default: en.

**Key files:**
- `i18n/routing.ts` — defineRouting with locales
- `i18n/navigation.ts` — locale-aware Link, useRouter, usePathname
- `i18n/request.ts` — getRequestConfig loading messages/{locale}.json
- `proxy.ts` — next-intl middleware (renamed from middleware.ts — Next.js 16 uses proxy.ts)
- `messages/{en,de,fr,es,it}.json` — translation files
- `app/[locale]/layout.tsx` — NextIntlClientProvider wrapper
- `components/LanguageSwitcher.tsx` — dropdown locale switcher in Header

**Why:** User requested European language support (DE, FR, ES, IT) for the calculator hub.

**How to apply:** All new pages go under `app/[locale]/`. Server components must call `setRequestLocale(locale)` before using `getTranslations`. Client components use `useTranslations` normally inside the provider.

**Lessons learned:**
- Old pages at `app/calculators/`, `app/categories/` etc. must be deleted — they conflict with `[locale]` routing
- next-intl requires `setRequestLocale(locale)` on every static page for `force-static` / `generateStaticParams` to work
- Next.js 16 uses `proxy.ts` not `middleware.ts`
- `useTranslations` cannot be used in async server components — use `getTranslations` instead
