import { useLocalSearchParams } from 'expo-router';

import { ScreenStub } from '@/components/dev/ScreenStub';

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenStub
      name="Restaurant Detail"
      figmaNode="13:7914"
      note={`id: ${id} — photo, name/price/area, tag groups, About, reviews (Food/Vibe/Tales), + Log a Visit.`}
      links={[
        { href: '/log?restaurantId=' + id, label: 'Log a Visit (button)' },
        { href: '/list/reviews', label: 'See all reviews' },
      ]}
    />
  );
}
