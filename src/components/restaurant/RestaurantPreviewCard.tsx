import { StyleSheet, View } from 'react-native';

import { Card, Text, Thumbnail } from '@/components/ui';
import { PRICE } from '@/lib/placeholder';
import { space } from '@/theme';

export type RestaurantPreviewCardProps = {
  name: string;
  cuisine?: string | null;
  area?: string | null;
  city?: string | null;
  priceLevel?: number | null;
  photoUri?: string | null;
};

/**
 * Compact confirmation card shown once a restaurant is linked in Log a Visit —
 * lets the user check they picked the right place before continuing.
 */
export function RestaurantPreviewCard({ name, cuisine, area, city, priceLevel, photoUri }: RestaurantPreviewCardProps) {
  const place = [area, city].filter(Boolean).join(', ');
  return (
    <Card padding={2} style={styles.card}>
      <Thumbnail uri={photoUri} size={40} />
      <View style={styles.meta}>
        <View style={styles.row}>
          <Text variant="bodyStrong" color="textStrong" numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          {priceLevel ? (
            <Text variant="small" color="textLabel">
              {PRICE[priceLevel]}
            </Text>
          ) : null}
        </View>
        {cuisine || place ? (
          <Text variant="caption" color="textFaint" numberOfLines={1}>
            {[cuisine, place].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  meta: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  name: { flex: 1 },
});

export default RestaurantPreviewCard;
