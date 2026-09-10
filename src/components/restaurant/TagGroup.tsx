import { StyleSheet, View } from 'react-native';

import { Chip, Text } from '@/components/ui';
import { space } from '@/theme';

export type TagGroupProps = {
  label: string;
  tags: string[];
};

/** A tag category on Restaurant Detail: small label + a wrap of display-only chips. */
export function TagGroup({ label, tags }: TagGroupProps) {
  if (tags.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text variant="caption" color="textLabel" style={styles.label}>
        {label}
      </Text>
      <View style={styles.chips}>
        {tags.map((t) => (
          <Chip key={t} label={t} static />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  label: { width: 76, paddingTop: space[1], textTransform: 'uppercase', letterSpacing: 0.6 },
  chips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
});

export default TagGroup;
