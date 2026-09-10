import { useLocalSearchParams } from 'expo-router';

import { ScreenStub } from '@/components/dev/ScreenStub';

export default function ListDetail() {
  const { id, variant } = useLocalSearchParams<{ id: string; variant?: string }>();
  return (
    <ScreenStub
      name="List Detail"
      figmaNode="13:8356"
      note={`id: ${id}${variant ? ` · variant: ${variant}` : ''} — cards / wishlist-rows / list-rows / gallery layouts.`}
      links={[{ href: '/restaurant/demo', label: 'Restaurant Detail (item tap)' }]}
    />
  );
}
