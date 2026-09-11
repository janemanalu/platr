import { Pressable, StyleSheet, View } from 'react-native';

import { borderWidth, colors, space } from '@/theme';

import { Text } from './Text';

export type SegmentedToggleProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

/** Flat segmented control: bordered box, active segment filled dark. */
export function SegmentedToggle<T extends string>({ options, value, onChange }: SegmentedToggleProps<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((opt, i) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.seg, i > 0 && styles.divider, active && styles.segActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text variant="sectionLabel" color={active ? 'onActive' : 'textFaint'}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderWidth,
    borderColor: colors.borderStrong,
    alignSelf: 'flex-start',
  },
  seg: { paddingVertical: 6, paddingHorizontal: space[3] },
  divider: { borderLeftWidth: borderWidth, borderLeftColor: colors.borderStrong },
  segActive: { backgroundColor: colors.bgActive },
});

export default SegmentedToggle;
