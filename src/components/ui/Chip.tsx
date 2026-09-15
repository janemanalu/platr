import { Pressable, PressableProps, StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, space } from '@/theme';

import { Text } from './Text';

export type ChipProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** Filled dark state — used for active filters / selected tags. */
  active?: boolean;
  /** Render as a static tag (no press feedback, no button role). */
  static?: boolean;
  /** Visually greyed out and unpressable — e.g. a selection limit reached. */
  disabled?: boolean;
};

/**
 * Small pill tag. Inactive = white with hairline border; active = dark fill;
 * disabled = greyed out and unpressable. Used for cuisine tags, discovery
 * filters, friend tags.
 */
export function Chip({ label, active = false, static: isStatic = false, disabled = false, ...rest }: ChipProps) {
  const body = (
    <Text variant="small" color={disabled ? 'textDisabled' : active ? 'onActive' : 'textMuted'}>
      {label}
    </Text>
  );

  if (isStatic) {
    return <View style={[styles.chip, active && styles.active]}>{body}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        active && styles.active,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      {...rest}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: space[1],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignSelf: 'flex-start',
  },
  active: {
    backgroundColor: colors.bgActive,
    borderColor: colors.bgActive,
  },
  disabled: {
    backgroundColor: colors.bgSubtle,
    borderColor: colors.divider,
  },
  pressed: { opacity: 0.6 },
});

export default Chip;
