import { Pressable, StyleSheet, View } from 'react-native';

import { Text, Thumbnail } from '@/components/ui';
import { borderWidth, colors, space } from '@/theme';

export type FeedTileProps = {
  reviewer: string;
  restaurantName: string;
  food: number;
  vibe: number;
  /** Full-width "FEATURED" card with a preview line. */
  featured?: boolean;
  previewText?: string;
  onPress?: () => void;
  onOpenRestaurant?: () => void;
};

/** A friend's log in the Social feed — photo, reviewer, restaurant, F/V scores. */
export function FeedTile({
  reviewer,
  restaurantName,
  food,
  vibe,
  featured = false,
  previewText,
  onPress,
  onOpenRestaurant,
}: FeedTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, featured && styles.featured, pressed && styles.pressed]}
    >
      {featured ? (
        <Text variant="caption" color="textLabel" style={styles.badge}>
          Featured
        </Text>
      ) : null}
      <Thumbnail uri={null} fill aspectRatio={featured ? 1.9 : 1.3} />
      <View style={styles.meta}>
        <Text variant="caption" color="textDisabled">
          ◦ {reviewer}
        </Text>
        <Text variant="cardTitle" color="textStrong" numberOfLines={1} onPress={onOpenRestaurant}>
          {restaurantName}
        </Text>
        {featured && previewText ? (
          <Text variant="caption" color="textMuted" numberOfLines={2}>
            {previewText}
          </Text>
        ) : null}
        <Text variant="caption" color="textFaint">
          F {food.toFixed(1)}/10 · V {vibe.toFixed(1)}/10
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  featured: {},
  badge: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: space[2],
    paddingTop: space[2],
  },
  meta: { padding: space[2], gap: space[1] },
  pressed: { opacity: 0.6 },
});

export default FeedTile;
