import { Pressable, StyleSheet, View } from 'react-native';

import { space } from '@/theme';

import { Text } from './Text';

export type SectionHeaderProps = {
  label: string;
  /** Small italic-ish helper line under the label. */
  caption?: string;
  /** Right-aligned action, e.g. "See all (6)" / "Expand". */
  actionLabel?: string;
  onAction?: () => void;
};

/** Uppercase section label with an optional caption and a right-side link action. */
export function SectionHeader({ label, caption, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text variant="sectionLabel" color="textLabel">
          {label}
        </Text>
        {actionLabel ? (
          <Pressable onPress={onAction} hitSlop={8} disabled={!onAction}>
            <Text variant="link" color="textFaint">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {caption ? (
        <Text variant="caption" color="textDisabled">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default SectionHeader;
