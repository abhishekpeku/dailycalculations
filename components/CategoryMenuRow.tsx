'use client';

import IconTile from './IconTile';
import { categoryTheme } from '@/lib/categoryTheme';
import type { NavCategory } from '@/lib/navData';

// One row in the categories menu's left pane (desktop) or the phone sheet's category list.
// Shared so the two surfaces can't visually drift apart.
type Props = {
  category: NavCategory;
  active?: boolean;
  chevron?: boolean;
  onClick: () => void;
  // React 19: function components take `ref` as an ordinary prop, no forwardRef needed.
  ref?: React.Ref<HTMLButtonElement>;
};

export default function CategoryMenuRow({ category, active = false, chevron = false, onClick, ref }: Props) {
  const theme = categoryTheme(category.id);
  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition ${
        active ? 'bg-[#F2F2F7] dark:bg-slate-800' : 'hover:bg-[#F7F7F8] dark:hover:bg-slate-800/60'
      }`}
    >
      <IconTile icon={theme.icon} color={theme.color} size="sm" />
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-slate-900 dark:text-white">
        {category.title}
      </span>
      <span className="shrink-0 text-[12px] text-[#8E8E93] dark:text-slate-500">{category.count}</span>
      {chevron && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-[#AEAEB2] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}
