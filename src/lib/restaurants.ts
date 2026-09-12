import type { PlaceDetails } from './googlePlaces';
import { supabase } from './supabase';
import type { Restaurant } from './database.types';

/**
 * Find-or-create the `restaurants` row for a Google Place. Called when a user
 * picks a place from search (Log a Visit, Discovery) — the catalog is shared
 * across all users, keyed on `google_place_id`.
 */
export async function upsertRestaurantFromPlace(details: PlaceDetails): Promise<Restaurant> {
  const { data: existing, error: findError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('google_place_id', details.googlePlaceId)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from('restaurants')
    .insert({
      google_place_id: details.googlePlaceId,
      name: details.name,
      area: details.area ?? null,
      city: details.city ?? null,
      address: details.address ?? null,
      lat: details.lat ?? null,
      lng: details.lng ?? null,
      price_level: details.priceLevel,
      website_url: details.websiteUrl ?? null,
      cover_photo_url: details.coverPhotoUrl ?? null,
    })
    .select()
    .single();
  if (insertError) throw insertError;
  return created;
}
