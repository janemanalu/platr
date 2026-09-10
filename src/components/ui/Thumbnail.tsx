import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius } from '@/theme';

import { Text } from './Text';

export type ThumbnailProps = {
  uri?: string | null;
  /** Square side length, or pass `height`/`width` explicitly via style. */
  size?: number;
  /** Fill the parent's width, keeping the given aspect ratio. */
  fill?: boolean;
  aspectRatio?: number;
  rounded?: boolean;
};

/**
 * Grayscale image placeholder. Shows the wireframe's "[]" glyph until a real
 * image URI is passed. No shadow, hairline border, square by default.
 */
export function Thumbnail({ uri, size = 32, fill = false, aspectRatio = 1, rounded = false }: ThumbnailProps) {
  return (
    <View
      style={[
        styles.box,
        rounded && styles.rounded,
        fill ? { width: '100%', aspectRatio } : { width: size, height: size },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Text variant="caption" color="textLabel">
          []
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.bgPlaceholder,
    borderWidth,
    borderColor: colors.borderStrong,
    borderRadius: radius.none,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rounded: { borderRadius: radius.pill },
});

export default Thumbnail;
