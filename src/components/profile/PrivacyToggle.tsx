import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { borderWidth, colors, space } from '@/theme';

export type PrivacyToggleProps = {
  isPublic: boolean;
  /** Omit to render a read-only indicator (other users' profiles). */
  onToggle?: (next: boolean) => void;
};

/** "○ Public" / "● Private" pill. Interactive when `onToggle` is given. */
export function PrivacyToggle({ isPublic, onToggle }: PrivacyToggleProps) {
  const label = `${isPublic ? '○' : '●'} ${isPublic ? 'Public' : 'Private'}`;
  if (!onToggle) {
    return (
      <Text variant="caption" color="textDisabled">
        {label}
      </Text>
    );
  }
  return (
    <Pressable
      onPress={() => onToggle(!isPublic)}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
      accessibilityRole="switch"
      accessibilityState={{ checked: isPublic }}
    >
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
  },
  pressed: { opacity: 0.6 },
});

export default PrivacyToggle;
