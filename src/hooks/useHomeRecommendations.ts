import { useMemo } from 'react';

import type { Restaurant } from '@/lib/database.types';

import { useFollowing } from './useFollowing';
import { useFriendsFeed } from './useSocialFeed';
import { useUserLogs } from './useUserLogs';
import { useRestaurants } from './useRestaurants';

/**
 * "Tastes Like You" — restaurants you haven't logged yet, ranked by overall
 * score. A real recommendation engine (matching on shared tags, etc.) is a
 * reasonable next step; this is a deliberately simple stand-in for a catalog
 * this size.
 */
export function useTastesLikeYou(userId: string | undefined, limit = 6) {
  const restaurants = useRestaurants();
  const logs = useUserLogs(userId);

  const items = useMemo(() => {
    if (!restaurants.data || !logs.data) return [];
    const loggedIds = new Set(logs.data.map((l) => l.restaurant.id));
    return restaurants.data
      .filter((r) => !loggedIds.has(r.id))
      .sort((a, b) => (b.score?.overall_avg ?? 0) - (a.score?.overall_avg ?? 0));
  }, [restaurants.data, logs.data]);

  return {
    data: items.slice(0, limit),
    total: items.length,
    isLoading: restaurants.isLoading || logs.isLoading,
    error: restaurants.error ?? logs.error,
  };
}

/** "Trending Near You" — top-rated recent visits from people you follow. */
export function useTrendingNearYou(userId: string | undefined, limit = 5) {
  const following = useFollowing(userId);
  const followingIds = useMemo(() => following.data?.map((f) => f.id), [following.data]);
  const feed = useFriendsFeed(userId, followingIds);

  const items = useMemo(() => {
    if (!feed.data) return [];
    // one entry per restaurant — keep the highest-rated review for it
    const byRestaurant = new Map<string, { restaurant: Restaurant; score: number; reviewer: string }>();
    for (const r of feed.data) {
      if (r.food_rating == null || r.vibe_rating == null) continue;
      const overall = (r.food_rating + r.vibe_rating) / 2;
      const existing = byRestaurant.get(r.restaurant.id);
      if (!existing || overall > existing.score) {
        byRestaurant.set(r.restaurant.id, {
          restaurant: r.restaurant,
          score: overall,
          reviewer: r.reviewer.display_name.split(' ')[0],
        });
      }
    }
    return Array.from(byRestaurant.values()).sort((a, b) => b.score - a.score);
  }, [feed.data]);

  return {
    data: items.slice(0, limit),
    total: items.length,
    isLoading: following.isLoading || feed.isLoading,
    error: following.error ?? feed.error,
  };
}
