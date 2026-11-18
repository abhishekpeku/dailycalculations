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
  statistics: { color: 'purple', icon: 'chart' },
  food: { color: 'red', icon: 'bowl' },
  sports: { color: 'green', icon: 'trophy' },
  chemistry: { color: 'teal', icon: 'flask' },
  biology: { color: 'lime', icon: 'dna' },
  ecology: { color: 'emerald', icon: 'leaf' },
  // Fun & Other (step 50): reuses pink (already health/creator) — playful, Valentine-adjacent hue
  // fits astrology/love/numerology better than any unclaimed color would.
  fun: { color: 'pink', icon: 'sparkle' },
  // Tech (step 25): a new category, new color — subnetting/checksums/password tools read as
  // technical, not playful or scientific like any already-claimed hue.
  tech: { color: 'cyan', icon: 'chip' },
  // Crypto (step 65): a new color, gold/coin-like — distinct from finance's green so these
  // hypothetical-projection tools don't read as the same trustworthy-bank-math category.
  crypto: { color: 'amber', icon: 'coin' },
  // Solar & Home Energy (step 62): a new color, sun-yellow — distinct from crypto's amber and
  // home's orange so solar/home-energy sizing, savings and financing tools read as their own thing.
  solar: { color: 'yellow', icon: 'sun' },
  // Insurance (step 63): a new color, a protective blue-violet — distinct from finance's green
  // (loans/savings/investing) even though both are money categories; the shield icon reads as
  // coverage/protection rather than growth.
  insurance: { color: 'violet', icon: 'shield' },
  // Business & Tax (step 64): a new color, a cool slate blue-gray — reads as professional/ledger
  // rather than finance's growth-green or work's neutral gray; the invoice icon (not work's
  // briefcase) distinguishes business-operations math from personal career tools.
  business: { color: 'slate', icon: 'invoice' }
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
  purple: { tint: '#F4EAFB', ink: '#7A2BAE', darkTint: 'rgba(201,105,245,0.16)', darkInk: '#C969F5' },
  lime: { tint: '#F1F8E3', ink: '#4D7C0F', darkTint: 'rgba(163,230,53,0.16)', darkInk: '#A3E635' },
  emerald: { tint: '#E6F7F0', ink: '#047857', darkTint: 'rgba(52,211,153,0.16)', darkInk: '#34D399' },
  cyan: { tint: '#E0F7FC', ink: '#0E7490', darkTint: 'rgba(34,211,238,0.16)', darkInk: '#22D3EE' },
  amber: { tint: '#FFF6E0', ink: '#8A5A00', darkTint: 'rgba(255,196,0,0.16)', darkInk: '#FFC400' },
  yellow: { tint: '#FFFBE0', ink: '#8A6D00', darkTint: 'rgba(255,224,102,0.16)', darkInk: '#FFE066' },
  violet: { tint: '#F0EAFE', ink: '#6425C9', darkTint: 'rgba(139,92,246,0.16)', darkInk: '#A78BFA' },
  slate: { tint: '#EEF1F5', ink: '#39465A', darkTint: 'rgba(148,163,184,0.16)', darkInk: '#94A3B8' }
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
