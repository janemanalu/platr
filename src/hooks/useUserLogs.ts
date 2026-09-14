import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { LogStatus, Restaurant } from '@/lib/database.types';

export type UserLog = {
  id: string;
  status: LogStatus;
  created_at: string;
  restaurant: Restaurant;
};

/**
 * A user's logs (their relationship to restaurants), each with the joined
 * restaurant row. RLS decides what's visible: your own logs always come back;
 * someone else's only for the status sections they've made public.
 */
export function useUserLogs(userId: string | undefined, status?: LogStatus) {
  return useQuery({
    queryKey: ['user-logs', userId, status ?? 'all'],
    enabled: !!userId,
    queryFn: async () => {
      let query = supabase
        .from('logs')
        .select('id, status, created_at, restaurant:restaurants(*)')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as UserLog[];
    },
  });
}

/** All four status sections for a profile, grouped — for Profile / Other User Profile. */
export function useProfileSections(userId: string | undefined) {
  const { data: logs, ...rest } = useUserLogs(userId);
  const byStatus = (status: LogStatus) => (logs ?? []).filter((l) => l.status === status);
  return {
    ...rest,
    logs,
    goTo: byStatus('go_to'),
    visited: byStatus('visited'),
    wishlist: byStatus('wishlist'),
    blacklisted: byStatus('blacklisted'),
  };
}
