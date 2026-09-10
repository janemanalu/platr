import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

import { colors, fontFamily, type as typeScale, TypeVariant } from '@/theme';

export type TextProps = RNTextProps & {
  /** Type-scale variant from the theme. Defaults to `body`. */
  variant?: TypeVariant;
  /** Semantic color key from `theme.colors`, or any raw color string. */
  color?: keyof typeof colors | (string & {});
};

/**
 * The single text primitive for the app. Every bit of copy goes through here so
 * the wireframe's type scale and grayscale stay consistent.
 */
export function Text({ variant = 'body', color = 'textBody', style, ...rest }: TextProps) {
  const resolvedColor = (color in colors ? colors[color as keyof typeof colors] : color) as string;
  return (
    <RNText
      style={[styles.base, typeScale[variant], { color: resolvedColor }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: { fontFamily },
});

export default Text;
