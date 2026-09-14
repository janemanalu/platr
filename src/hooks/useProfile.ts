import { useQuery } from '@tanstack/react-query';

import { useUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId!).single();
      if (error) throw error;
      return data;
    },
  });
}

/** The signed-in user's own profile row. */
export function useMyProfile() {
  const userId = useUserId();
  return useProfile(userId);
}

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ['profile-by-username', username],
    enabled: !!username,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('username', username!).single();
      if (error) throw error;
      return data;
    },
  });
}
