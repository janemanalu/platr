import { useLocalSearchParams } from 'expo-router';

import { ScreenStub } from '@/components/dev/ScreenStub';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenStub
      name="Other User Profile"
      figmaNode="13:5378"
      note={`id: ${id} — their header, mutual friends, Follow toggle, PUBLIC list sections only, gallery.`}
      links={[
        { href: '/restaurant/demo', label: 'Restaurant Detail (list row)' },
        { href: '/list/their-go-to', label: 'List Detail (See all)' },
      ]}
    />
  );
}
