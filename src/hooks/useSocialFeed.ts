import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Restaurant } from '@/lib/database.types';

export type FeedItem = {
  id: string;
  food_rating: number | null;
  vibe_rating: number | null;
  notes: string | null;
  created_at: string;
  restaurant: Restaurant;
  reviewer: { id: string; display_name: string; username: string };
};

async function fetchReviews(userIds?: string[]) {
  let query = supabase
    .from('reviews')
    .select(
      'id, food_rating, vibe_rating, notes, created_at, restaurant:restaurants(*), reviewer:profiles!reviews_user_id_fkey(id, display_name, username)',
    )
    .order('created_at', { ascending: false })
    .limit(30);
  if (userIds) query = query.in('user_id', userIds);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as FeedItem[];
}

/** Reviews from the people `userId` follows — the "Friends" tab. */
export function useFriendsFeed(userId: string | undefined, followingIds: string[] | undefined) {
  return useQuery({
    queryKey: ['feed-friends', userId, followingIds],
    enabled: !!userId && !!followingIds,
    queryFn: () => fetchReviews(followingIds && followingIds.length > 0 ? followingIds : ['00000000-0000-0000-0000-000000000000']),
  });
}

/** Every recent review, regardless of who — the "Everyone" tab. */
export function useEveryoneFeed() {
  return useQuery({
    queryKey: ['feed-everyone'],
    queryFn: () => fetchReviews(),
  });
}

/** One review by id — Post view. */
export function useReview(reviewId: string | undefined) {
  return useQuery({
    queryKey: ['review', reviewId],
    enabled: !!reviewId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          'id, food_rating, vibe_rating, notes, created_at, restaurant:restaurants(*), reviewer:profiles!reviews_user_id_fkey(id, display_name, username)',
        )
        .eq('id', reviewId!)
        .single();
      if (error) throw error;
      return data as unknown as FeedItem;
    },
  });
}
