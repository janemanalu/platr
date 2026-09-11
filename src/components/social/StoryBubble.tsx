import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { borderWidth, colors, radius, space } from '@/theme';

export type StoryBubbleProps = {
  name: string;
  initial: string;
  onPress?: () => void;
};

/** Circle avatar + first name — the "Recent visits" row on Social. */
export function StoryBubble({ name, initial, onPress }: StoryBubbleProps) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={styles.circle}>
        <Text variant="small" color="textMuted">
          {initial}
        </Text>
      </View>
      <Text variant="caption" color="textFaint">
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space[1], width: 56 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StoryBubble;
