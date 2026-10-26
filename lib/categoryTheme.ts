import type { IconName, TileColor } from '@/components/IconTile';

// One app-icon color + glyph per category. Unknown ids fall back to gray.
export const CATEGORY_THEME: Record<string, { color: TileColor; icon: IconName }> = {
  finance: { color: 'green', icon: 'dollar' },
  health: { color: 'pink', icon: 'heart' },
  home: { color: 'orange', icon: 'home' },
  auto: { color: 'blue', icon: 'car' },
  shopping: { color: 'red', icon: 'tag' },
  time: { color: 'indigo', icon: 'clock' },
  travel: { color: 'teal', icon: 'plane' },
  work: { color: 'gray', icon: 'briefcase' },
  measurements: { color: 'purple', icon: 'ruler' },
  creator: { color: 'pink', icon: 'play' },
  text: { color: 'gray', icon: 'text' },
  education: { color: 'blue', icon: 'cap' },
  physics: { color: 'indigo', icon: 'atom' },
  math: { color: 'orange', icon: 'function' },
  statistics: { color: 'purple', icon: 'chart' }
};

export function categoryTheme(categoryId: string) {
  return CATEGORY_THEME[categoryId] ?? { color: 'gray' as const, icon: 'grid' as const };
}

// Which tile each long-form section wears, in both its heading and the table of contents.
export const SECTION_THEME: Record<string, { color: TileColor; icon: IconName }> = {
  concept: { color: 'blue', icon: 'bulb' },
  'how-to-use': { color: 'green', icon: 'list' },
  formula: { color: 'purple', icon: 'function' },
  'worked-example': { color: 'orange', icon: 'pencil' },
  'common-values': { color: 'teal', icon: 'grid' },
  'reference-table': { color: 'teal', icon: 'grid' },
  'watch-out': { color: 'red', icon: 'alert' },
  faq: { color: 'teal', icon: 'question' },
  references: { color: 'gray', icon: 'book' },
  related: { color: 'indigo', icon: 'grid' }
};

// iOS grouped-list card: white, large radius, hairline ring instead of a border.
export const CARD = 'rounded-[22px] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10 sm:p-7';
