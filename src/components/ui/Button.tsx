import { ActivityIndicator, Pressable, PressableProps, StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, space } from '@/theme';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'md' | 'sm';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Optional leading glyph/element (e.g. a "+"). Kept simple for the wireframe. */
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

/**
 * Flat button. `primary` = dark fill, `secondary` = bordered white, `ghost` =
 * borderless, `link` = underlined text only. No shadows, square corners.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  ...rest
}: ButtonProps) {
  const isLink = variant === 'link';
  const textColor =
    variant === 'primary'
      ? 'onActive'
      : disabled
        ? 'textDisabled'
        : variant === 'link'
          ? 'textFaint'
          : 'textBody';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        !isLink && size === 'md' && styles.mdPad,
        !isLink && size === 'sm' && styles.smPad,
        !isLink && variant === 'primary' && styles.primary,
        !isLink && variant === 'secondary' && styles.secondary,
        !isLink && variant === 'ghost' && styles.ghost,
        fullWidth && styles.fullWidth,
        disabled && !isLink && styles.disabled,
        pressed && styles.pressed,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textFaint} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            variant={isLink ? 'link' : size === 'sm' ? 'small' : 'bodyStrong'}
            color={textColor}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.none,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  mdPad: { paddingVertical: space[3], paddingHorizontal: space[4] },
  smPad: { paddingVertical: space[2], paddingHorizontal: space[3] },
  primary: { backgroundColor: colors.bgActive },
  secondary: {
    backgroundColor: colors.bg,
    borderWidth,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { backgroundColor: colors.bgSubtle, borderColor: colors.border },
  pressed: { opacity: 0.6 },
});

export default Button;
