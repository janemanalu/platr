import { GestureResponderEvent, Pressable, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { borderWidth, colors, radius, space } from '@/theme';

export type CardProps = Omit<ViewProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Inner padding, keyed to the spacing scale. Defaults to step 4 (16pt). Pass 0 for none. */
  padding?: keyof typeof space;
  /** Drop the border (e.g. when the card sits on a subtle background as a plain group). */
  borderless?: boolean;
  /** When supplied, the card renders as a Pressable with press feedback. */
  onPress?: (e: GestureResponderEvent) => void;
};

/**
 * Flat container: white fill, hairline border, square corners, no shadow.
 * The workhorse surface for the wireframe. Renders a `Pressable` when `onPress`
 * is supplied, otherwise a plain `View`.
 */
export function Card({ padding = 4, borderless = false, onPress, style, ...rest }: CardProps) {
  const base: StyleProp<ViewStyle> = [
    styles.card,
    { padding: space[padding] },
    borderless && styles.borderless,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, pressed && styles.pressed]}
        {...rest}
      />
    );
  }

  return <View style={base} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderWidth,
    borderColor: colors.border,
    borderRadius: radius.none,
  },
  borderless: {
    borderWidth: 0,
  },
  pressed: {
    opacity: 0.6,
  },
});

export default Card;
