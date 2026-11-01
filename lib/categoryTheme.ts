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

// GlyphBadge's tinted square: a light background + a >=4.5:1 dark ink of the same hue, with a
// dark-mode pair (a low-opacity tint over the page background + the TILE_COLORS "light" stop,
// already bright enough to read on dark).
export const GLYPH_TINT: Record<TileColor, { tint: string; ink: string; darkTint: string; darkInk: string }> = {
  green: { tint: '#E8F7EC', ink: '#1E7A34', darkTint: 'rgba(76,217,100,0.16)', darkInk: '#4CD964' },
  pink: { tint: '#FDECEF', ink: '#B0204A', darkTint: 'rgba(255,107,139,0.16)', darkInk: '#FF6B8B' },
  orange: { tint: '#FFF3E0', ink: '#A65A00', darkTint: 'rgba(255,179,64,0.16)', darkInk: '#FFB340' },
  blue: { tint: '#E8F1FF', ink: '#0A57CC', darkTint: 'rgba(64,160,255,0.16)', darkInk: '#40A0FF' },
  red: { tint: '#FDEDEB', ink: '#B5241C', darkTint: 'rgba(255,107,94,0.16)', darkInk: '#FF6B5E' },
  indigo: { tint: '#EEEDFF', ink: '#3B38B8', darkTint: 'rgba(125,122,255,0.16)', darkInk: '#7D7AFF' },
  teal: { tint: '#E6F6FA', ink: '#14718A', darkTint: 'rgba(90,200,224,0.16)', darkInk: '#5AC8E0' },
  gray: { tint: '#F2F2F7', ink: '#48484A', darkTint: 'rgba(161,161,166,0.16)', darkInk: '#C7C7CC' },
  purple: { tint: '#F4EAFB', ink: '#7A2BAE', darkTint: 'rgba(201,105,245,0.16)', darkInk: '#C969F5' }
};

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
