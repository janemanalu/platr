import type { TagCategory } from './database.types';

/** Display label + fixed display order for the 5 tag categories, shared by
 *  Restaurant Detail's tag groups and Log a Visit's tag picker. */
export const CATEGORY_LABEL: Record<TagCategory, string> = {
  cuisine: 'Cuisine',
  occasion: 'Occasion',
  vibe: 'Vibe',
  price_point: 'Price Point',
  dietary: 'Dietary',
};

export const CATEGORY_ORDER: TagCategory[] = ['cuisine', 'occasion', 'vibe', 'price_point', 'dietary'];

/** Group any list of {category, ...} rows by category, in the fixed display order. */
export function groupByCategory<T extends { category: TagCategory }>(rows: T[]): { category: TagCategory; label: string; items: T[] }[] {
  const byCategory = new Map<TagCategory, T[]>();
  for (const row of rows) {
    const arr = byCategory.get(row.category) ?? [];
    arr.push(row);
    byCategory.set(row.category, arr);
  }
  return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
    category: c,
    label: CATEGORY_LABEL[c],
    items: byCategory.get(c)!,
  }));
}
