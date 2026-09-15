import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Tag } from '@/lib/database.types';

/** The fixed tag vocabulary — Log a Visit's tag picker. */
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    staleTime: Infinity, // fixed vocabulary, effectively static
    queryFn: async () => {
      const { data, error } = await supabase.from('tags').select('*').order('category').order('label');
      if (error) throw error;
      return data as Tag[];
    },
  });
}
