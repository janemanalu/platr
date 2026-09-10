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
