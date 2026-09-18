import { StyleSheet, View } from 'react-native';

import { RestaurantRow } from '@/components/restaurant/RestaurantRow';
import { Button, Card, Text } from '@/components/ui';
import { space } from '@/theme';

import { PrivacyToggle } from './PrivacyToggle';

/** Minimal shape a section row needs — satisfied by both the real Restaurant row and placeholder fixtures. */
export type ProfileListSectionItem = {
  id: string;
  name: string;
  cuisine?: string | null;
  area?: string | null;
  city?: string | null;
  cover_photo_url?: string | null;
};

export type ProfileListSectionProps = {
  label: string;
  items: ProfileListSectionItem[];
  total: number;
  isPublic: boolean;
  /** Interactive privacy toggle (own profile only). */
  onTogglePrivacy?: (next: boolean) => void;
  onOpenRestaurant: (id: string) => void;
  onSeeAll?: () => void;
  /** Shown alongside "None yet" on this user's own empty sections. */
  onLogVisit?: () => void;
};

/** One status section on a profile: label + privacy state, 2-item preview, See all. */
export function ProfileListSection({
  label,
  items,
  total,
  isPublic,
  onTogglePrivacy,
  onOpenRestaurant,
  onSeeAll,
  onLogVisit,
}: ProfileListSectionProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text variant="sectionLabel" color="textLabel">
          {label}
        </Text>
        <PrivacyToggle isPublic={isPublic} onToggle={onTogglePrivacy} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="caption" color="textDisabled">
            None yet
          </Text>
          {onLogVisit ? <Button label="Log a visit" size="sm" variant="secondary" onPress={onLogVisit} /> : null}
        </View>
      ) : (
        <Card padding={0}>
          {items.map((r, i) => (
            <RestaurantRow
              key={r.id}
              name={r.name}
              subtitle={[r.cuisine, [r.area, r.city].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
              photoUri={r.cover_photo_url}
              trailing="›"
              divider={i < items.length - 1}
              onPress={() => onOpenRestaurant(r.id)}
            />
          ))}
        </Card>
      )}

      {total > items.length ? (
        <Text variant="link" color="textFaint" onPress={onSeeAll}>
          See all ({total})
        </Text>
      ) : items.length > 0 ? (
        <Text variant="caption" color="textDisabled">
          All items shown
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[2] },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empty: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});

export default ProfileListSection;
