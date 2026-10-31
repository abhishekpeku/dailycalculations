import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import IconTile from '@/components/IconTile';
import { categories } from '@/data/calculators';
import { categoryTheme } from '@/lib/categoryTheme';

// Deep navy, fixed hex colors throughout — deliberately the same in light and dark mode, unlike
// the rest of the site, so no `dark:` variants here.
export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B2545] text-[#C9D6EA]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-2xl bg-[#0066CC] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-lg font-bold text-white sm:text-xl">{t('bannerTitle')}</p>
            <p className="mt-1 text-sm text-[#DCE9FA]">{t('bannerBody')}</p>
          </div>
          <Link
            href="/suggestions"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#0B2545] transition hover:bg-[#DCE9FA]"
          >
            {t('bannerCta')}
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-10">
          <div className="min-w-[220px] flex-1">
            <p className="text-base font-semibold text-white">{t('brand')}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#A9BCD8]">{t('blurb')}</p>
          </div>

          <div className="min-w-[280px] flex-[2]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FA6C8]">{t('categoriesHeading')}</p>
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
              {categories.map((category) => {
                const theme = categoryTheme(category.id);
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="flex items-center gap-2 text-sm text-[#DCE6F5] transition hover:text-white"
                  >
                    <IconTile icon={theme.icon} color={theme.color} size="sm" />
                    {category.title}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="min-w-[160px]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FA6C8]">{t('companyHeading')}</p>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <Link href="/about" className="text-[#DCE6F5] transition hover:text-white">{t('companyAbout')}</Link>
              <Link href="/contact" className="text-[#DCE6F5] transition hover:text-white">{t('companyContact')}</Link>
              <Link href="/suggestions" className="text-[#DCE6F5] transition hover:text-white">{t('companySuggest')}</Link>
              <Link href="/privacy-policy" className="text-[#DCE6F5] transition hover:text-white">{t('companyPrivacy')}</Link>
              <Link href="/terms" className="text-[#DCE6F5] transition hover:text-white">{t('companyTerms')}</Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-[#1E3A63] pt-6 text-xs text-[#9FB3D1]">{t('copyright', { year })}</div>
      </div>
    </footer>
  );
}
