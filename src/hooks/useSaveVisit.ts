import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { LogStatus } from '@/lib/database.types';

export type SaveVisitInput = {
  restaurantId: string;
  status: LogStatus;
  foodRating?: number;
  vibeRating?: number;
  notes?: string;
  tagIds?: string[];
  friendIds?: string[];
  suggestion?: string;
};

/**
 * Log a Visit's "Save Entry" — the piece that actually persists what a user
 * does. Upserts the log (one per user+restaurant; status changes in place),
 * then — only if there's something to review (a rating or notes) — inserts a
 * review + its tags/friend-tags. A separate anonymous suggestion, if any,
 * always goes in even without a review.
 */
export function useSaveVisit() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveVisitInput) => {
      if (!userId) throw new Error('You need to be signed in to save a visit.');

      const { data: log, error: logError } = await supabase
        .from('logs')
        .upsert(
          { user_id: userId, restaurant_id: input.restaurantId, status: input.status },
          { onConflict: 'user_id,restaurant_id' },
        )
        .select()
        .single();
      if (logError) throw logError;

      let reviewId: string | null = null;
      const hasReviewContent = input.foodRating != null || input.vibeRating != null || !!input.notes?.trim();

      if (hasReviewContent) {
        const { data: review, error: reviewError } = await supabase
          .from('reviews')
          .insert({
            log_id: log.id,
            food_rating: input.foodRating ?? null,
            vibe_rating: input.vibeRating ?? null,
            notes: input.notes?.trim() || null,
            visited_on: new Date().toISOString().slice(0, 10),
          })
          .select()
          .single();
        if (reviewError) throw reviewError;
        reviewId = review.id;

        if (input.tagIds && input.tagIds.length > 0) {
          const { error } = await supabase
            .from('review_tags')
            .insert(input.tagIds.map((tag_id) => ({ review_id: reviewId!, tag_id })));
          if (error) throw error;
        }

        if (input.friendIds && input.friendIds.length > 0) {
          const { error } = await supabase
            .from('review_friend_tags')
            .insert(input.friendIds.map((friend_id) => ({ review_id: reviewId!, friend_id })));
          if (error) throw error;
        }
      }

      if (input.suggestion?.trim()) {
        const { error } = await supabase.from('review_suggestions').insert({
          restaurant_id: input.restaurantId,
          author_id: userId,
          review_id: reviewId,
          body: input.suggestion.trim(),
        });
        if (error) throw error;
      }

      return { logId: log.id as string, reviewId };
    },
    onSuccess: (_data, input) => {
      // Everything this could change: the log/review itself, streak, the
      // restaurant's aggregate score/tags, its review list, the social feed,
      // and this user's stats.
      queryClient.invalidateQueries({ queryKey: ['user-logs'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', input.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-reviews', input.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tags', input.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['feed-friends'] });
      queryClient.invalidateQueries({ queryKey: ['feed-everyone'] });
      queryClient.invalidateQueries({ queryKey: ['follow-stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['my-last-review', userId] });
      queryClient.invalidateQueries({ queryKey: ['status-privacy', userId] });
    },
  });
}
