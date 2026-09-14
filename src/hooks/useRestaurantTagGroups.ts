import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { TagCategory } from '@/lib/database.types';

const CATEGORY_LABEL: Record<TagCategory, string> = {
  cuisine: 'Cuisine',
  occasion: 'Occasion',
  vibe: 'Vibe',
  price_point: 'Price Point',
  dietary: 'Dietary',
};

const CATEGORY_ORDER: TagCategory[] = ['cuisine', 'occasion', 'vibe', 'price_point', 'dietary'];

/** A restaurant's tags (from restaurant_tags_view, derived from reviews), grouped by category. */
export function useRestaurantTagGroups(restaurantId: string | undefined) {
  const query = useQuery({
    queryKey: ['restaurant-tags', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tags_view')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .order('uses', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const groups = useMemo(() => {
    const byCategory = new Map<TagCategory, string[]>();
    for (const row of query.data ?? []) {
      const cat = row.category as TagCategory;
      const arr = byCategory.get(cat) ?? [];
      arr.push(row.label);
      byCategory.set(cat, arr);
    }
    return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
      label: CATEGORY_LABEL[c],
      tags: byCategory.get(c)!,
    }));
  }, [query.data]);

  return { ...query, groups };
}
