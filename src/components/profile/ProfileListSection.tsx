import { StyleSheet, View } from 'react-native';

import { RestaurantRow } from '@/components/restaurant/RestaurantRow';
import { Card, Text } from '@/components/ui';
import type { PlaceholderRestaurant } from '@/lib/placeholder';
import { space } from '@/theme';

import { PrivacyToggle } from './PrivacyToggle';

export type ProfileListSectionProps = {
  label: string;
  items: PlaceholderRestaurant[];
  total: number;
  isPublic: boolean;
  /** Interactive privacy toggle (own profile only). */
  onTogglePrivacy?: (next: boolean) => void;
  onOpenRestaurant: (id: string) => void;
  onSeeAll?: () => void;
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
        <Text variant="caption" color="textDisabled">
          None yet
        </Text>
      ) : (
        <Card padding={0}>
          {items.map((r, i) => (
            <RestaurantRow
              key={r.id}
              name={r.name}
              subtitle={`${r.cuisine} · ${r.area}, ${r.city}`}
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
});

export default ProfileListSection;
