import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { borderWidth, colors, fontFamily, space, type as typeScale } from '@/theme';

export type SearchFieldProps = TextInputProps & {
  /** Leading glyph. Defaults to a magnifier; pass null for none. */
  icon?: keyof typeof Ionicons.glyphMap | null;
};

/** Single-line grayscale input with a leading icon. Used for search + select fields. */
export function SearchField({ icon = 'search', style, ...rest }: SearchFieldProps) {
  return (
    <View style={styles.wrap}>
      {icon ? <Ionicons name={icon} size={15} color={colors.textDisabled} /> : null}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.textDisabled}
        autoCapitalize="none"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
  },
  input: {
    flex: 1,
    padding: 0,
    color: colors.textBody,
    fontFamily,
    fontSize: typeScale.body.fontSize,
  },
});

export default SearchField;
