// iOS app-icon style tile: a rounded square with a vertical gradient and a white stroke icon.
// Decorative only, so every tile is aria-hidden.

export const TILE_COLORS = {
  blue: ['#40A0FF', '#0A6CFF'],
  green: ['#4CD964', '#28A745'],
  purple: ['#C969F5', '#9B3FD6'],
  orange: ['#FFB340', '#FF8A00'],
  red: ['#FF6B5E', '#E5332A'],
  teal: ['#5AC8E0', '#1E9BB8'],
  indigo: ['#7D7AFF', '#4B48E0'],
  pink: ['#FF6B8B', '#E0335A'],
  gray: ['#A1A1A6', '#6E6E73']
} as const;

export type TileColor = keyof typeof TILE_COLORS;

const ICONS = {
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  function: 'M15 4h-2.5a2.5 2.5 0 0 0-2.5 2.5V20M7 11h7M14 14l5 5M19 14l-5 5',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  alert: 'M12 3 2.5 20h19L12 3zM12 10v4M12 17h.01',
  question: 'M9.2 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 18h.01',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM19 19v2H6',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  atom: "M2 12a10 4 0 1 0 20 0a10 4 0 1 0-20 0M7 3.34a10 4 60 1 0 10 17.32a10 4 60 1 0-10-17.32M7 20.66a10 4-60 1 0 10-17.32a10 4-60 1 0-10 17.32M12 12h.01",
  dollar: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  heart: 'M12 21s-7.5-4.6-10-9.3C.5 8.1 2.4 4.8 6 4.4c2-.2 3.7.9 4.6 2.4.9-1.5 2.6-2.6 4.6-2.4 3.6.4 5.5 3.7 4 7.3C19.5 16.4 12 21 12 21z',
  home: 'M3 11 12 4l9 7M5 10v10h14V10',
  car: 'M5 16h14M6 16l1.5-5h9L18 16M6 16v3M18 16v3M8 13.5h.01M16 13.5h.01',
  tag: 'M3 3h8l10 10-8 8L3 11V3zM7.5 7.5h.01',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  plane: 'M10 14 3 11l1.5-1.5L11 11l4.5-6.5L18 6l-3 7 4 1.5L18 16l-8-2zM8 20l2-6',
  briefcase: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  ruler: 'M4 16 16 4l4 4L8 20l-4-4zM8 12l2 2M11 9l2 2M14 6l2 2',
  play: 'M5 4h14v16H5zM10 9l5 3-5 3V9z',
  text: 'M5 6h14M12 6v13M8 19h8',
  cap: 'M2 9l10-5 10 5-10 5L2 9zM6 11v5c0 1 2.7 3 6 3s6-2 6-3v-5'
} as const;

export type IconName = keyof typeof ICONS;

const SIZES = {
  sm: { box: 'h-7 w-7 rounded-[8px]', icon: 15 },
  md: { box: 'h-9 w-9 rounded-[10px]', icon: 19 },
  lg: { box: 'h-14 w-14 rounded-[16px]', icon: 28 }
};

type Props = {
  icon: IconName;
  color: TileColor;
  size?: keyof typeof SIZES;
};

export default function IconTile({ icon, color, size = 'md' }: Props) {
  const [from, to] = TILE_COLORS[color];
  const { box, icon: iconSize } = SIZES[size];

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center shadow-sm ${box}`}
      style={{ backgroundImage: `linear-gradient(180deg, ${from}, ${to})` }}
    >
      <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={ICONS[icon]} />
      </svg>
    </span>
  );
}
