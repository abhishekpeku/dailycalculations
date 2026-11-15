// Shared by CategoryCalculatorFilter.tsx (the /categories/<id> page) and CategoriesMenu.tsx (the
// header's Categories dropdown) — both need the exact same "all-or-nothing, first-seen order"
// grouping rule (UX-06/UX-08), so it lives here once instead of two copies that could drift apart.
export type Groupable = { group?: string };

export type CalculatorGroup<T> = { label: string; items: T[] };

// Splits `items` into labeled sections in the order each `group` is first seen (i.e. the category's
// own data-file order, not alphabetical). Returns null (no sections, caller falls back to one flat
// grid) unless every item has a non-empty `group` — a category that hasn't been tagged yet, or only
// partly tagged, should never silently drop an item into nowhere.
export function buildGroups<T extends Groupable>(items: T[]): CalculatorGroup<T>[] | null {
  if (items.length === 0 || items.some((item) => !item.group)) return null;
  const order: string[] = [];
  const byLabel = new Map<string, T[]>();
  for (const item of items) {
    const label = item.group as string;
    if (!byLabel.has(label)) {
      byLabel.set(label, []);
      order.push(label);
    }
    byLabel.get(label)!.push(item);
  }
  return order.map((label) => ({ label, items: byLabel.get(label)! }));
}
