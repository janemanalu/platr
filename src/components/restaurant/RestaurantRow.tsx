import { Pressable, StyleSheet, View } from 'react-native';

import { Text, Thumbnail } from '@/components/ui';
import { borderWidth, colors, space } from '@/theme';

export type RestaurantRowProps = {
  name: string;
  /** Secondary line — cuisine, or "Cuisine · Area". */
  subtitle?: string;
  photoUri?: string | null;
  /** Right-aligned trailing text, e.g. "0.8 km" or "›". */
  trailing?: string;
  /** Hairline divider below the row (for stacked rows in a card). */
  divider?: boolean;
  onPress?: () => void;
};

/** List row: small thumbnail, name + subtitle, optional trailing text. */
export function RestaurantRow({
  name,
  subtitle,
  photoUri,
  trailing,
  divider = false,
  onPress,
}: RestaurantRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && onPress && styles.pressed]}
    >
      <Thumbnail uri={photoUri} size={40} />
      <View style={styles.meta}>
        <Text variant="bodyStrong" color="textStrong" numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textLabel" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <Text variant="small" color="textFaint">
          {trailing}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  divider: {
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.dividerFaint,
  },
  meta: { flex: 1, gap: 2 },
  pressed: { opacity: 0.6 },
});

export default RestaurantRow;
