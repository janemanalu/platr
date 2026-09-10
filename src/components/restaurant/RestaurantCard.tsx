import { StyleSheet, View } from 'react-native';

import { Card, Text, Thumbnail } from '@/components/ui';
import { space } from '@/theme';

export type RestaurantCardProps = {
  name: string;
  /** Secondary line — usually the cuisine. Omitted when `score` is shown. */
  cuisine?: string;
  photoUri?: string | null;
  /** Overall score, e.g. 9.2 — renders a "★" row instead of the cuisine line. */
  score?: number;
  /** Name shown next to the score (the reviewer). */
  scoreBy?: string;
  width?: number;
  onPress?: () => void;
};

/** Carousel card: photo on top, name, then either cuisine or a score row. */
export function RestaurantCard({
  name,
  cuisine,
  photoUri,
  score,
  scoreBy,
  width = 150,
  onPress,
}: RestaurantCardProps) {
  return (
    <Card padding={0} onPress={onPress} style={[styles.card, { width }]}>
      <Thumbnail uri={photoUri} fill aspectRatio={1.5} />
      <View style={styles.meta}>
        <Text variant="cardTitle" color="textStrong" numberOfLines={1}>
          {name}
        </Text>
        {score != null ? (
          <View style={styles.scoreRow}>
            <Text variant="caption" color="textFaint">
              {score.toFixed(1)} ★
            </Text>
            {scoreBy ? (
              <Text variant="caption" color="textDisabled" numberOfLines={1}>
                {scoreBy}
              </Text>
            ) : null}
          </View>
        ) : cuisine ? (
          <Text variant="caption" color="textLabel" numberOfLines={1}>
            {cuisine}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  meta: { padding: space[2], gap: space[1] },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default RestaurantCard;
