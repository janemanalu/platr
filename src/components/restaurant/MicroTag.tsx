import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { borderWidth, colors } from '@/theme';

/**
 * The small rectangular (not pill) tag used inline on compact list rows —
 * Discovery results, Find for Me. Distinct from the pill-shaped `Chip` used
 * for filters and Restaurant Detail's tag groups, which really are rounded
 * pills in the Figma spec.
 */
export function MicroTag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text variant="micro" color="textFaint">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});

export default MicroTag;
