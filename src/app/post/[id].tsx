import { useLocalSearchParams } from 'expo-router';

import { ScreenStub } from '@/components/dev/ScreenStub';

export default function PostView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenStub
      name="Post View"
      figmaNode="Social Feed overlay (13:4824)"
      note={`review id: ${id} — full post: photo, ratings, notes, friend, restaurant, likes/comments.`}
      links={[
        { href: '/user/demo', label: 'User Profile (name / avatar)' },
        { href: '/restaurant/demo', label: 'Restaurant Detail (name)' },
      ]}
    />
  );
}
