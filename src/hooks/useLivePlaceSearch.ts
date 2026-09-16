import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { searchRestaurantsText } from '@/lib/googlePlaces';

/**
 * Debounced Google Places Text Search — Discovery's search bar, so results
 * aren't limited to whatever's already in our `restaurants` table.
 */
export function useLivePlaceSearch(query: string, bias?: { lat: number; lng: number }) {
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(id);
  }, [query]);

  return useQuery({
    queryKey: ['places-search', debounced, bias?.lat, bias?.lng],
    enabled: debounced.length >= 2,
    queryFn: () => searchRestaurantsText(debounced, bias),
    staleTime: 60_000,
  });
}
