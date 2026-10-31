import type { TileColor } from './IconTile';
import { GLYPH_TINT } from '@/lib/categoryTheme';

// A calculator's math/unit symbol on a tinted square — the glyph equivalent of IconTile, used
// wherever a calculator is listed (menus, the categories dropdown, the phone sheet). Decorative
// only, so aria-hidden; the title text next to it is what screen readers get.
// Light/dark pairs are CSS variables set inline, read by a static `dark:[...]` arbitrary-value
// class, so the actual color swap happens in CSS (no theme JS, no flash on first paint).

const FONT_SCALE: Record<number, number> = {
  1: 0.46,
  2: 0.4,
  3: 0.32,
  4: 0.27
};

type Props = {
  glyph: string;
  color: TileColor;
  size?: number;
};

export default function GlyphBadge({ glyph, color, size = 40 }: Props) {
  const { tint, ink, darkTint, darkInk } = GLYPH_TINT[color];
  const length = Math.min(4, Math.max(1, [...glyph].length));
  const fontSize = Math.round(size * (FONT_SCALE[length] ?? FONT_SCALE[4]));

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-[11px] leading-none dark:[background-color:var(--badge-dark-tint)] dark:[color:var(--badge-dark-ink)]"
      style={{
        width: size,
        height: size,
        backgroundColor: tint,
        color: ink,
        fontFamily: 'ui-serif, Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize,
        '--badge-dark-tint': darkTint,
        '--badge-dark-ink': darkInk
      } as React.CSSProperties}
    >
      {glyph}
    </span>
  );
}
