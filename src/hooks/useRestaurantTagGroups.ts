import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { groupByCategory } from '@/lib/tags';
import { supabase } from '@/lib/supabase';
import type { TagCategory } from '@/lib/database.types';

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
      return (data ?? []) as { category: TagCategory; label: string; slug: string; uses: number }[];
    },
  });

  const groups = useMemo(
    () => groupByCategory(query.data ?? []).map((g) => ({ label: g.label, tags: g.items.map((t) => t.label) })),
    [query.data],
  );

  return { ...query, groups };
}
