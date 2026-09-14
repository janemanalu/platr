import { useQuery } from '@tanstack/react-query';

import { useUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/** Calls the current_streak(user) RPC — consecutive days with a review, ending today or yesterday. */
export function useStreak(userId: string | undefined) {
  return useQuery({
    queryKey: ['streak', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('current_streak', { _user_id: userId! });
      if (error) throw error;
      return data ?? 0;
    },
  });
}

export function useMyStreak() {
  return useStreak(useUserId());
}
