import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Restaurant, RestaurantScore } from '@/lib/database.types';

export type RestaurantWithMeta = Restaurant & {
  score: RestaurantScore | null;
  /** Tag labels derived from reviews (restaurant_tags_view), most-used first. */
  tags: string[];
};

async function fetchScoresAndTags() {
  const [{ data: scores, error: sErr }, { data: tagRows, error: tErr }] = await Promise.all([
    supabase.from('restaurant_scores').select('*'),
    supabase.from('restaurant_tags_view').select('*').order('uses', { ascending: false }),
  ]);
  if (sErr) throw sErr;
  if (tErr) throw tErr;

  const scoreMap = new Map((scores ?? []).map((s) => [s.restaurant_id, s]));
  const tagMap = new Map<string, string[]>();
  for (const row of tagRows ?? []) {
    const arr = tagMap.get(row.restaurant_id) ?? [];
    arr.push(row.label);
    tagMap.set(row.restaurant_id, arr);
  }
  return { scoreMap, tagMap };
}

function attachMeta<T extends Restaurant>(
  restaurants: T[],
  scoreMap: Map<string, RestaurantScore>,
  tagMap: Map<string, string[]>,
): RestaurantWithMeta[] {
  return restaurants.map((r) => ({
    ...r,
    score: scoreMap.get(r.id) ?? null,
    tags: tagMap.get(r.id) ?? [],
  }));
}

/** The full catalog — Discovery's list. */
export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const [{ data: restaurants, error }, { scoreMap, tagMap }] = await Promise.all([
        supabase.from('restaurants').select('*').order('name'),
        fetchScoresAndTags(),
      ]);
      if (error) throw error;
      return attachMeta(restaurants ?? [], scoreMap, tagMap);
    },
  });
}

/** One restaurant, with its score + full tag list attached. */
export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurant', id],
    enabled: !!id,
    queryFn: async () => {
      const [{ data: restaurant, error }, { scoreMap, tagMap }] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', id!).single(),
        fetchScoresAndTags(),
      ]);
      if (error) throw error;
      return attachMeta([restaurant], scoreMap, tagMap)[0];
    },
  });
}
