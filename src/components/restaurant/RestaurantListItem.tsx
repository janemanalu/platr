import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card, Text, Thumbnail } from '@/components/ui';
import { PRICE } from '@/lib/placeholder';
import { gray, space } from '@/theme';

import { MicroTag } from './MicroTag';

export type RestaurantListItemProps = {
  name: string;
  cuisine: string;
  area: string;
  city: string;
  priceLevel?: 1 | 2 | 3 | 4 | null;
  tags?: string[];
  onPress?: () => void;
};

/**
 * Discovery result row — an individually bordered compact card (Figma 13:2142):
 * 48×48 thumbnail, name + price, "cuisine · area, city", small rectangular tag
 * row, trailing chevron. Not a big image-first card, not a divided list.
 */
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
    <Card padding={0} onPress={onPress} style={styles.card}>
      <Thumbnail uri={null} size={48} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="bodyStrong" color="textStrong" numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          {priceLevel ? (
            <Text variant="small" color="textLabel">
              {PRICE[priceLevel]}
            </Text>
          ) : null}
        </View>
        <Text variant="small" color="textFaint" numberOfLines={1}>
          {[cuisine, [area, city].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
        </Text>
        {tags.length > 0 ? (
          <View style={styles.tags}>
            {tags.map((t) => (
              <MicroTag key={t} label={t} />
            ))}
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={14} color={gray[250]} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderColor: gray[200],
  },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  name: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingTop: 2 },
});

export default RestaurantListItem;
