import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/database.types';

/** Profiles the given user follows — "friends" for tagging/feed scope. */
export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ['following', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('profile:profiles!follows_following_id_fkey(*)')
        .eq('follower_id', userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.profile) as unknown as Profile[];
    },
  });
}

export function useMyFollowing() {
  return useFollowing(useUserId());
}

/** Whether I (the signed-in user) follow `targetId`. */
export function useIsFollowing(targetId: string | undefined) {
  const myId = useUserId();
  return useQuery({
    queryKey: ['is-following', myId, targetId],
    enabled: !!myId && !!targetId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', myId!)
        .eq('following_id', targetId!)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function useToggleFollow(targetId: string | undefined) {
  const myId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (follow: boolean) => {
      if (!myId || !targetId) throw new Error('Not signed in');
      if (follow) {
        const { error } = await supabase.from('follows').insert({ follower_id: myId, following_id: targetId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', myId)
          .eq('following_id', targetId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', myId, targetId] });
      queryClient.invalidateQueries({ queryKey: ['follow-stats', myId] });
      queryClient.invalidateQueries({ queryKey: ['follow-stats', targetId] });
      queryClient.invalidateQueries({ queryKey: ['following', myId] });
    },
  });
}
