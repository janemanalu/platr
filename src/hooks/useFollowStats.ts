import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type FollowStats = { logged: number; following: number; followers: number };

/** "N logged · N following · N followers" — the line under a profile header. */
export function useFollowStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['follow-stats', userId],
    enabled: !!userId,
    queryFn: async (): Promise<FollowStats> => {
      const [logged, following, followers] = await Promise.all([
        supabase.from('logs').select('id', { count: 'exact', head: true }).eq('user_id', userId!),
        supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('follower_id', userId!),
        supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('following_id', userId!),
      ]);
      if (logged.error) throw logged.error;
      if (following.error) throw following.error;
      if (followers.error) throw followers.error;
      return {
        logged: logged.count ?? 0,
        following: following.count ?? 0,
        followers: followers.count ?? 0,
      };
    },
  });
}
