// A slim nav model for the client Header, built once on the server. Header must never import
// data/calculators directly — every calculator there carries its full compute()/content/solver,
// which would balloon the client bundle. This is the only bridge.
import { calculators, categories } from '@/data/calculators';

export type NavCalculator = {
  id: string;
  title: string;
  description: string;
  category: string;
  glyph: string;
  aliases: string[];
};

export type NavCategory = {
  id: string;
  title: string;
  description: string;
  count: number;
};

export type NavData = {
  categories: NavCategory[];
  calculators: NavCalculator[];
};

export function buildNavData(): NavData {
  const navCalculators: NavCalculator[] = calculators.map((calculator) => ({
    id: calculator.id,
    title: calculator.title,
    description: calculator.description,
    category: calculator.category,
    glyph: calculator.glyph,
    aliases: calculator.aliases
  }));

  const navCategories: NavCategory[] = categories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    count: navCalculators.filter((calculator) => calculator.category === category.id).length
  }));

  return { categories: navCategories, calculators: navCalculators };
}
