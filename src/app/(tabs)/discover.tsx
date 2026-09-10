import { ScreenStub } from '@/components/dev/ScreenStub';

export default function DiscoverTab() {
  return (
    <ScreenStub
      name="Discovery"
      figmaNode="13:1807 (map) / 13:2142 (list)"
      note="Search, map/list toggle, filter chips, ✦ Find for me."
      links={[
        { href: '/restaurant/demo', label: 'Restaurant Detail (row / pin tap)' },
        { href: '/find-for-me', label: 'Find for Me (✦ button)' },
      ]}
    />
  );
}
