import { ScrollView, StyleSheet, View, ViewProps } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors, space } from '@/theme';

export type ScreenProps = ViewProps & {
  /** Wrap children in a vertical ScrollView. */
  scroll?: boolean;
  /** Apply default horizontal padding (16pt). Turn off for full-bleed layouts. */
  padded?: boolean;
  /** Safe-area edges to inset. Defaults to top + bottom. */
  edges?: Edge[];
  /** Page background. Defaults to white. */
  background?: keyof typeof colors;
};

/** Standard screen shell: safe-area inset, grayscale background, optional scroll. */
export function Screen({
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  background = 'bg',
  style,
  children,
  ...rest
}: ScreenProps) {
  const inner = (
    <View style={[styles.inner, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: colors[background] }]}
    >
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { flex: 1 },
  padded: { paddingHorizontal: space[4] },
});

export default Screen;
