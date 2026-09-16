import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { reviewPhotoUrl } from '@/lib/photos';
import { supabase } from '@/lib/supabase';

export type RestaurantReview = {
  id: string;
  food_rating: number | null;
  vibe_rating: number | null;
  notes: string | null;
  visited_on: string | null;
  created_at: string;
  reviewer: { display_name: string; username: string };
  photoUrl: string | null;
};

/** Every review for one restaurant, most recently *visited* first. */
export function useRestaurantReviews(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['restaurant-reviews', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          'id, food_rating, vibe_rating, notes, visited_on, created_at, reviewer:profiles!reviews_user_id_fkey(display_name, username), photos:review_photos(storage_path, position)',
        )
        .eq('restaurant_id', restaurantId!)
        .order('visited_on', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      type Row = Omit<RestaurantReview, 'photoUrl'> & { photos: { storage_path: string; position: number }[] };
      return (data as unknown as Row[]).map(({ photos, ...row }) => ({
        ...row,
        photoUrl: photos.length
          ? reviewPhotoUrl([...photos].sort((a, b) => a.position - b.position)[0].storage_path)
          : null,
      }));
    },
  });
}

export type ReviewCategoryKey = 'food' | 'vibe' | 'tales';

/**
 * Maps the wireframe's Food / Vibe / Tales cards onto real review rows —
 * there's no per-category text, so each card previews whichever real review
 * ranks first for that category (highest food_rating / vibe_rating / most
 * recent for Tales, which isn't a rated dimension).
 */
export function useReviewCategories(restaurantId: string | undefined) {
  const { data: reviews, ...rest } = useRestaurantReviews(restaurantId);

  const categories = useMemo(() => {
    const all = reviews ?? [];
    const byFood = [...all].filter((r) => r.food_rating != null).sort((a, b) => b.food_rating! - a.food_rating!);
    const byVibe = [...all].filter((r) => r.vibe_rating != null).sort((a, b) => b.vibe_rating! - a.vibe_rating!);
    const byRecent = all; // already newest-first

    const avg = (nums: number[]) => (nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : null);

    return [
      {
        key: 'food' as const,
        label: 'Food',
        score: avg(all.map((r) => r.food_rating).filter((n): n is number => n != null)),
        sorted: byFood,
      },
      {
        key: 'vibe' as const,
        label: 'Vibe',
        score: avg(all.map((r) => r.vibe_rating).filter((n): n is number => n != null)),
        sorted: byVibe,
      },
      {
        key: 'tales' as const,
        label: 'Tales',
        score: null,
        sorted: byRecent,
      },
    ];
  }, [reviews]);

  return { ...rest, reviews, categories };
}

export function categoryLabel(key: string): string {
  return key === 'food' ? 'Food' : key === 'vibe' ? 'Vibe' : 'Tales';
}
