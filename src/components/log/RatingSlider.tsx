import Slider from '@react-native-community/slider';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, space } from '@/theme';

export type RatingSliderProps = {
  label: string;
  /** 0–10, in 0.5 steps. */
  value: number;
  onChange: (value: number) => void;
};

/** Labelled 0–10 slider (0.5 steps) for the Food / Vibe ratings on Log a Visit. */
export function RatingSlider({ label, value, onChange }: RatingSliderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text variant="small" color="textBody" style={styles.label}>
          {label}
        </Text>
        <Text variant="title" color="textStrong">
          {value.toFixed(1)}
        </Text>
      </View>
      <Slider
        minimumValue={0}
        maximumValue={10}
        step={0.5}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.textStrong}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.textStrong}
      />
      <View style={styles.scale}>
        {[0, 2.5, 5, 7.5, 10].map((n) => (
          <Text key={n} variant="micro" color="textDisabled">
            {n % 1 === 0 ? n : n.toFixed(1)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { textTransform: 'uppercase', letterSpacing: 0.6 },
  scale: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default RatingSlider;
