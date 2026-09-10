/**
 * Placeholder data for building screens before Supabase seed + Google Places land.
 * Shapes mirror the DB rows so swapping these for real queries is mechanical.
 * Content matches the Figma wireframe.
 */

export type PlaceholderRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  price_level: 1 | 2 | 3 | 4 | null;
  area: string;
  city: string;
};

const R = (
  id: string,
  name: string,
  cuisine: string,
  area: string,
  price_level: PlaceholderRestaurant['price_level'] = null,
): PlaceholderRestaurant => ({ id, name, cuisine, area, city: 'Jakarta', price_level });

export const restaurants: Record<string, PlaceholderRestaurant> = {
  osteria: R('osteria', 'Osteria Fiorella', 'Italian', 'SCBD', 2),
  maebird: R('maebird', 'Mae Bird', 'Southern', 'Kemang', 1),
  kato: R('kato', 'Kato', 'Taiwanese', 'Menteng', 2),
  ilis: R('ilis', 'Ilis', 'New Nordic', 'Sudirman', 4),
  deptculture: R('deptculture', 'Dept of Culture', 'Nigerian', 'Cikini', 3),
  bakmiekaret: R('bakmiekaret', 'Bakmie Karet', 'Indonesian', 'Senen', 1),
};

export const currentUser = {
  display_name: 'Jordan',
  full_name: 'Jordan Reeves',
  username: 'jordanreeves',
  area: 'SCBD',
  city: 'Jakarta',
  avatar_url: null as string | null,
};

export const home = {
  streak: 5,

  /** Restaurants with a log, for the "Your Food Map" pins. */
  foodMap: {
    loggedCount: 4,
    pins: [
      { id: 'osteria', initials: 'OF' },
      { id: 'maebird', initials: 'MB' },
      { id: 'kato', initials: 'K' },
      { id: 'deptculture', initials: 'DC' },
    ],
  },

  /** "Tastes Like You" — recommendation carousel. */
  tastesLikeYou: [
    restaurants.osteria,
    restaurants.maebird,
    restaurants.kato,
    restaurants.ilis,
    restaurants.deptculture,
    restaurants.bakmiekaret,
  ],
  tastesLikeYouTotal: 6,

  /** "Trending Near You" — highly rated by friends. */
  trendingNearYou: [
    { restaurant: restaurants.maebird, score: 9.2, reviewer: 'Aisha' },
    { restaurant: restaurants.deptculture, score: 8.8, reviewer: 'Ravi' },
    { restaurant: restaurants.ilis, score: 9.5, reviewer: 'Sofia' },
    { restaurant: restaurants.osteria, score: 9.0, reviewer: 'Leo' },
    { restaurant: restaurants.kato, score: 8.5, reviewer: 'Mei' },
  ],
  trendingNearYouTotal: 5,

  /** "Your Wishlist" — preview rows. */
  wishlist: [
    { restaurant: restaurants.ilis, distanceKm: 0.8 },
    { restaurant: restaurants.bakmiekaret, distanceKm: 4.7 },
  ],
  wishlistTotal: 2,
};

export const PRICE = ['', '$', '$$', '$$$', '$$$$'] as const;

/** Discovery — list + map. */
export const discovery = {
  areaLabel: 'SCBD area',
  results: [
    { ...restaurants.osteria, tags: ['Cozy', 'Date spot'] },
    { ...restaurants.maebird, tags: ['Casual'] },
    { ...restaurants.kato, tags: ['Intimate', 'Date spot'] },
    { ...restaurants.ilis, tags: ['Fancy', 'Anniversary'] },
    { ...restaurants.deptculture, tags: ['Adventurous'] },
    { ...restaurants.bakmiekaret, tags: ['Quick Bite'] },
  ],
  filters: ['Open now', 'Wishlist', 'Cozy', 'Date spot', '$$ or less', 'Nearby'],
  pins: [
    { id: 'osteria', label: 'Osteria', x: '30%', y: '34%' },
    { id: 'kato', label: 'Kato', x: '66%', y: '28%' },
    { id: 'maebird', label: 'Mae Bird', x: '70%', y: '58%' },
    { id: 'ilis', label: 'Ilis', x: '34%', y: '64%' },
  ],
};

export type RestaurantDetail = PlaceholderRestaurant & {
  about: string;
  website_url: string;
  tagGroups: { label: string; tags: string[] }[];
  reviews: { dimension: string; text: string; by: string }[];
};

const DETAILS: Record<string, RestaurantDetail> = {
  maebird: {
    ...restaurants.maebird,
    about:
      'A neighbourhood Italian osteria known for hand-rolled pastas and a tight, seasonal menu. Intimate space — book ahead.',
    website_url: 'https://example.com',
    tagGroups: [
      { label: 'Cuisine', tags: ['Italian', 'Pasta', 'Wood-fired'] },
      { label: 'Occasion', tags: ['Date spot', 'Anniversary', 'Business lunch'] },
      { label: 'Vibe', tags: ['Cozy', 'Dim lighting', 'Intimate'] },
      { label: 'Price Point', tags: ['Mid-range', '$$'] },
      { label: 'Dietary', tags: ['Vegetarian options', 'Gluten-free available'] },
    ],
    reviews: [
      { dimension: 'Food', text: 'What was ordered, dish highlights…', by: 'Jordan R.' },
      { dimension: 'Vibe', text: 'Atmosphere, noise level, service…', by: 'Aisha K.' },
      { dimension: 'Tales', text: 'Who they went with, occasion, the story…', by: 'Ravi M.' },
    ],
  },
};

export function restaurantDetail(id: string): RestaurantDetail {
  return (
    DETAILS[id] ?? {
      ...(restaurants[id] ?? restaurants.maebird),
      ...DETAILS.maebird,
      ...(restaurants[id] ?? {}),
    }
  );
}

/** Friends to tag on a log — anyone you follow. */
export const friends = [
  { id: 'aisha', name: 'Aisha Kurnia', username: 'aishak' },
  { id: 'ravi', name: 'Ravi Mehta', username: 'ravim' },
  { id: 'sofia', name: 'Sofia Alvarez', username: 'sofiaa' },
  { id: 'leo', name: 'Leo Tanaka', username: 'leot' },
  { id: 'mei', name: 'Mei Wong', username: 'meiw' },
];

/** Fixed tag vocabulary for the Log a Visit "Tags" picker (mirrors 0005_seed_tags). */
export const tagOptions = [
  'Italian', 'Pasta', 'Wood-fired', 'Southern', 'Taiwanese', 'New Nordic', 'Nigerian', 'Indonesian',
  'Date spot', 'Anniversary', 'Business lunch', 'Solo', 'Group Hangout', 'Quick Bite', 'Celebration',
  'Cozy', 'Dim lighting', 'Intimate', 'Adventurous', 'Familiar', 'Fancy', 'Casual',
  'Budget', 'Mid-range', 'Splurge',
  'Vegetarian options', 'Gluten-free available', 'Vegan options', 'Halal',
];
