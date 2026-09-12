/**
 * Google Places API (New) client — Autocomplete + Place Details.
 * https://developers.google.com/maps/documentation/places/web-service/op-overview
 *
 * Needs EXPO_PUBLIC_GOOGLE_PLACES_API_KEY with "Places API (New)" enabled.
 */

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const BASE = 'https://places.googleapis.com/v1';

if (!API_KEY) {
  console.warn(
    '[googlePlaces] Missing EXPO_PUBLIC_GOOGLE_PLACES_API_KEY — restaurant search will return no results.',
  );
}

export type PlaceSuggestion = {
  placeId: string;
  mainText: string;
  secondaryText?: string;
};

/** Autocomplete predictions for a restaurant/cafe/bar search string. */
export async function autocompleteRestaurants(
  input: string,
  bias?: { lat: number; lng: number },
): Promise<PlaceSuggestion[]> {
  if (!API_KEY || !input.trim()) return [];

  const body: Record<string, unknown> = {
    input,
    includedPrimaryTypes: ['restaurant', 'cafe', 'bar'],
    languageCode: 'en',
  };
  if (bias) {
    body.locationBias = {
      circle: { center: { latitude: bias.lat, longitude: bias.lng }, radius: 20000 },
    };
  }

  try {
    const res = await fetch(`${BASE}/places:autocomplete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      if (__DEV__) console.warn('[googlePlaces] autocomplete failed', res.status, await res.text());
      return [];
    }
    const json = await res.json();
    const suggestions: unknown[] = json.suggestions ?? [];
    return suggestions
      .map((s) => (s as { placePrediction?: Record<string, unknown> }).placePrediction)
      .filter((p): p is Record<string, unknown> => !!p)
      .map((p) => {
        const structured = p.structuredFormat as Record<string, { text?: string }> | undefined;
        const text = p.text as { text?: string } | undefined;
        return {
          placeId: p.placeId as string,
          mainText: structured?.mainText?.text ?? text?.text ?? '',
          secondaryText: structured?.secondaryText?.text,
        };
      })
      .filter((s) => s.placeId && s.mainText);
  } catch (e) {
    if (__DEV__) console.warn('[googlePlaces] autocomplete error', e);
    return [];
  }
}

export type PlaceDetails = {
  googlePlaceId: string;
  name: string;
  address?: string;
  area?: string;
  city?: string;
  lat?: number;
  lng?: number;
  priceLevel: 1 | 2 | 3 | 4 | null;
  websiteUrl?: string;
  coverPhotoUrl?: string;
};

const PRICE_LEVEL_MAP: Record<string, 1 | 2 | 3 | 4> = {
  PRICE_LEVEL_FREE: 1,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

type AddressComponent = { longText?: string; types?: string[] };

/** Full details for one place, normalized to what `restaurants` needs. */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!API_KEY) return null;

  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'addressComponents',
    'location',
    'priceLevel',
    'websiteUri',
    'photos',
  ].join(',');

  try {
    const res = await fetch(`${BASE}/places/${placeId}`, {
      headers: { 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': fieldMask },
    });
    if (!res.ok) {
      if (__DEV__) console.warn('[googlePlaces] details failed', res.status, await res.text());
      return null;
    }
    const p = await res.json();
    const components: AddressComponent[] = p.addressComponents ?? [];
    const find = (...types: string[]) =>
      components.find((c) => c.types?.some((t) => types.includes(t)))?.longText;

    const area = find('sublocality', 'sublocality_level_1', 'neighborhood');
    const city = find('locality', 'administrative_area_level_2');
    const photoName: string | undefined = p.photos?.[0]?.name;

    return {
      googlePlaceId: p.id,
      name: p.displayName?.text ?? '',
      address: p.formattedAddress,
      area,
      city,
      lat: p.location?.latitude,
      lng: p.location?.longitude,
      priceLevel: p.priceLevel ? (PRICE_LEVEL_MAP[p.priceLevel] ?? null) : null,
      websiteUrl: p.websiteUri,
      coverPhotoUrl: photoName ? `${BASE}/${photoName}/media?maxWidthPx=800&key=${API_KEY}` : undefined,
    };
  } catch (e) {
    if (__DEV__) console.warn('[googlePlaces] details error', e);
    return null;
  }
}
