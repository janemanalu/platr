import { ScreenStub } from '@/components/dev/ScreenStub';

export default function ProfileTab() {
  return (
    <ScreenStub
      name="Profile"
      figmaNode="13:5811 / 13:6351"
      note="Header, status list sections with per-section privacy, custom lists, gallery."
      links={[
        { href: '/restaurant/demo', label: 'Restaurant Detail (list row)' },
        { href: '/list/go-to', label: 'List Detail (See all / gallery)' },
        { href: '/settings', label: 'Settings' },
      ]}
    />
  );
}
