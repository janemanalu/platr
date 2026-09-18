import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/database.types';

/** Debounced search over profiles by display name or username — Social's "Find users". */
export function useSearchProfiles(query: string) {
  const myId = useUserId();
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  return useQuery({
    queryKey: ['search-profiles', debounced],
    enabled: debounced.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${debounced}%,username.ilike.%${debounced}%`)
        .neq('id', myId ?? '')
        .limit(20);
      if (error) throw error;
      return data as Profile[];
    },
  });
}
