import { File } from 'expo-file-system';

import { supabase } from './supabase';

const BUCKET = 'review-photos';

/** Public URL for a photo stored at `storagePath` in the review-photos bucket
 *  (public-read, so no signing needed — see supabase/migrations/…_storage.sql). */
export function reviewPhotoUrl(storagePath: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

function extensionFromUri(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(uri.split('?')[0]);
  return (match?.[1] ?? 'jpg').toLowerCase();
}

function contentTypeFor(ext: string): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
}

/**
 * Uploads a locally-picked photo (a `file://` uri from expo-image-picker) to
 * Storage, under the uploader's own `<uid>/` prefix — required by the
 * bucket's RLS policy, which only lets a user write inside their own folder.
 * Records the resulting path against the review, then returns its public URL.
 */
export async function uploadReviewPhoto(userId: string, reviewId: string, localUri: string): Promise<string> {
  const ext = extensionFromUri(localUri);
  const path = `${userId}/${reviewId}/${Date.now()}.${ext}`;

  const file = new File(localUri);
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: contentTypeFor(ext) });
  if (uploadError) throw uploadError;

  const { error: rowError } = await supabase.from('review_photos').insert({ review_id: reviewId, storage_path: path });
  if (rowError) throw rowError;

  return reviewPhotoUrl(path);
}
