import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type GalleryPhoto = { id: string; storagePath: string; logId: string };

/** Every photo across a user's reviews — the Profile/User Profile gallery grid. */
export function useGalleryPhotos(userId: string | undefined) {
  return useQuery({
    queryKey: ['gallery-photos', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_photos')
        .select('id, storage_path, review:reviews!inner(log_id, user_id)')
        .eq('review.user_id', userId!);
      if (error) throw error;
      type Row = { id: string; storage_path: string; review: { log_id: string } };
      return (data as unknown as Row[]).map((row) => ({
        id: row.id,
        storagePath: row.storage_path,
        logId: row.review.log_id,
      }));
    },
  });
}
