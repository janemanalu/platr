import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { LogStatus } from '@/lib/database.types';

/** The four Public/Private flags behind a profile's status sections. */
export function useStatusPrivacy(userId: string | undefined) {
  return useQuery({
    queryKey: ['status-privacy', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('status_list_privacy').select('*').eq('user_id', userId!);
      if (error) throw error;
      const map: Record<LogStatus, boolean> = { go_to: false, visited: false, wishlist: false, blacklisted: false };
      for (const row of data ?? []) map[row.status as LogStatus] = row.is_public;
      return map;
    },
  });
}

/** Toggle one section's privacy (own profile only — RLS enforces it). */
export function useSetStatusPrivacy(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ status, isPublic }: { status: LogStatus; isPublic: boolean }) => {
      const { error } = await supabase
        .from('status_list_privacy')
        .update({ is_public: isPublic })
        .eq('user_id', userId!)
        .eq('status', status);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-privacy', userId] });
    },
  });
}
