import { useQuery } from '@tanstack/react-query';

import { reviewPhotoUrl } from '@/lib/photos';
import { supabase } from '@/lib/supabase';

export type GalleryPhoto = {
  id: string;
  storagePath: string;
  logId: string;
  uri: string;
  restaurantId: string;
  restaurantName: string;
  note: string | null;
  date: string;
};

/** Every photo across a user's reviews — the Profile/User Profile gallery grid
 *  and Photo Viewer, newest visit first. */
export function useGalleryPhotos(userId: string | undefined) {
  return useQuery({
    queryKey: ['gallery-photos', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_photos')
        .select(
          'id, storage_path, review:reviews!inner(log_id, user_id, notes, visited_on, created_at, restaurant_id, restaurant:restaurants(name))',
        )
        .eq('review.user_id', userId!);
      if (error) throw error;
      type Row = {
        id: string;
        storage_path: string;
        review: {
          log_id: string;
          notes: string | null;
          visited_on: string | null;
          created_at: string;
          restaurant_id: string;
          restaurant: { name: string };
        };
      };
      const photos: GalleryPhoto[] = (data as unknown as Row[]).map((row) => ({
        id: row.id,
        storagePath: row.storage_path,
        logId: row.review.log_id,
        uri: reviewPhotoUrl(row.storage_path),
        restaurantId: row.review.restaurant_id,
        restaurantName: row.review.restaurant.name,
        note: row.review.notes,
        date: row.review.visited_on ?? row.review.created_at,
      }));
      return photos.sort((a, b) => (a.date < b.date ? 1 : -1));
    },
  });
}
