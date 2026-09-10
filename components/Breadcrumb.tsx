import { Link } from '@/i18n/navigation';
import type { Breadcrumb as BreadcrumbItem } from '@/lib/seo';

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center gap-x-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                /
              </span>
            ) : null}
            {item.href === undefined ? (
              <span aria-current="page" className="font-medium text-slate-700 dark:text-slate-200">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href === '' ? '/' : item.href}
                className="font-medium text-brand-700 transition hover:text-brand-500 dark:text-brand-300 dark:hover:text-brand-200"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
