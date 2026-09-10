import { ScreenStub } from '@/components/dev/ScreenStub';

export default function SocialTab() {
  return (
    <ScreenStub
      name="Social Feed"
      figmaNode="13:4270 / 13:4824"
      note="Friends/Everyone toggle, story bubbles, recent visits, featured."
      links={[
        { href: '/user/demo', label: 'User Profile (story / name tap)' },
        { href: '/post/demo', label: 'Post view (grid tile)' },
        { href: '/restaurant/demo', label: 'Restaurant Detail (name tap)' },
        { href: '/log', label: 'Log a Visit (+ Log nudge)' },
      ]}
    />
  );
}
