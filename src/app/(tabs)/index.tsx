import { ScreenStub } from '@/components/dev/ScreenStub';

export default function HomeTab() {
  return (
    <ScreenStub
      name="Home"
      figmaNode="13:9 / 13:1207"
      note="Greeting, streak, food map, Tastes Like You, Trending Near You, Wishlist."
      links={[
        { href: '/restaurant/demo', label: 'Restaurant Detail (card / pin tap)' },
        { href: '/list/tastes-like-you', label: 'List Detail (See all)' },
        { href: '/settings', label: 'Settings (avatar tap)' },
        { href: '/log', label: 'Log a Visit (+ FAB)' },
      ]}
    />
  );
}
