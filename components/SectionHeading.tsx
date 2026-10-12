import IconTile from '@/components/IconTile';
import { SECTION_THEME } from '@/lib/categoryTheme';

type Props = {
  section: keyof typeof SECTION_THEME;
  title: string;
};

export default function SectionHeading({ section, title }: Props) {
  const theme = SECTION_THEME[section];

  return (
    <div className="flex items-center gap-3">
      <IconTile icon={theme.icon} color={theme.color} />
      <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{title}</h2>
    </div>
  );
}
