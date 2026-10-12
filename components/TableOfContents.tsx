import IconTile from '@/components/IconTile';
import { CARD, SECTION_THEME } from '@/lib/categoryTheme';

type Props = {
  title: string;
  items: { id: string; label: string }[];
};

// Settings-app style list: colored tile, label, chevron.
export default function TableOfContents({ title, items }: Props) {
  return (
    <nav aria-label={title} className={`${CARD} !p-0 overflow-hidden`}>
      <h2 className="px-5 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h2>
      <ol>
        {items.map((item) => {
          const theme = SECTION_THEME[item.id];
          return (
            <li key={item.id} className="border-t border-slate-100 first:border-t-0 dark:border-slate-800">
              <a
                href={`#${item.id}`}
                className="flex items-center gap-3 px-5 py-2.5 text-[15px] text-slate-900 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/60"
              >
                {theme ? <IconTile icon={theme.icon} color={theme.color} size="sm" /> : null}
                <span className="flex-1">{item.label}</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-600">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
