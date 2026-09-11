import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantListItem } from '@/components/restaurant/RestaurantListItem';
import { Button, Chip, Text } from '@/components/ui';
import { findForMe } from '@/lib/placeholder';
import { colors, space } from '@/theme';

export default function FindForMe() {
  const router = useRouter();
  const [occasion, setOccasion] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  const pick = (cur: string | null, v: string, set: (x: string | null) => void) =>
    set(cur === v ? null : v);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        <Text variant="small" color="textFaint">
          Discovery
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headingBlock}>
          <Text variant="caption" color="textLabel" style={styles.upper}>
            Discovery · AI picks
          </Text>
          <Text variant="h1" color="text">
            Your next spot.
          </Text>
        </View>

        <Group label="Occasion" options={findForMe.occasion} value={occasion} onPick={(v) => pick(occasion, v, setOccasion)} />
        <Group label="Mood" options={findForMe.mood} value={mood} onPick={(v) => pick(mood, v, setMood)} />
        <Group label="Budget?" options={findForMe.budget} value={budget} onPick={(v) => pick(budget, v, setBudget)} />

        <Button label="Show me ✦" fullWidth onPress={() => setShown(true)} style={styles.cta} />

        {shown ? (
          <View style={styles.results}>
            <Text variant="sectionLabel" color="textLabel">
              {findForMe.results.length} picks for you
            </Text>
            {findForMe.results.map((r) => (
              <RestaurantListItem
                key={r.id}
                name={r.name}
                cuisine={r.cuisine}
                area={r.area}
                city={r.city}
                priceLevel={r.price_level}
                onPress={() => router.push(`/restaurant/${r.id}`)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: string[];
  value: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <View style={styles.group}>
      <Text variant="sectionLabel" color="textLabel">
        {label}
      </Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <Chip key={o} label={o} active={value === o} onPress={() => onPick(o)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[4], paddingVertical: space[2] },
  scroll: { paddingHorizontal: space[4], paddingBottom: space[8], gap: space[5] },
  headingBlock: { paddingTop: space[3], gap: space[1] },
  upper: { textTransform: 'uppercase', letterSpacing: 0.6 },
  group: { gap: space[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  cta: { marginTop: space[2] },
  results: { gap: space[1], paddingTop: space[2] },
});
