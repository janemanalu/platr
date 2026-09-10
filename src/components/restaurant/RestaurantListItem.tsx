import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Chip, Text, Thumbnail } from '@/components/ui';
import { borderWidth, colors, space } from '@/theme';
import { PRICE } from '@/lib/placeholder';

export type RestaurantListItemProps = {
  name: string;
  cuisine: string;
  area: string;
  city: string;
  priceLevel?: 1 | 2 | 3 | 4 | null;
  tags?: string[];
  onPress?: () => void;
};

/** Discovery list row: thumbnail, name + price, "cuisine · area", tag chips, chevron. */
export function RestaurantListItem({
  name,
  cuisine,
  area,
  city,
  priceLevel,
  tags = [],
  onPress,
}: RestaurantListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Thumbnail uri={null} size={48} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="cardTitle" color="textStrong" numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          {priceLevel ? (
            <Text variant="caption" color="textFaint">
              {PRICE[priceLevel]}
            </Text>
          ) : null}
        </View>
        <Text variant="caption" color="textLabel">
          {cuisine} · {area}, {city}
        </Text>
        {tags.length > 0 ? (
          <View style={styles.tags}>
            {tags.map((t) => (
              <Chip key={t} label={t} static />
            ))}
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.divider,
  },
  pressed: { opacity: 0.6 },
  body: { flex: 1, gap: space[1] },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  name: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1], paddingTop: 2 },
});

export default RestaurantListItem;
