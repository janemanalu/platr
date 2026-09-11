import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Text } from '@/components/ui';
import { restaurantDetail, reviewCategory } from '@/lib/placeholder';
import { goBack } from '@/lib/nav';
import { colors, space } from '@/theme';

/** Every review in one category (Food / Vibe / Tales) for a restaurant. */
export default function CategoryReviews() {
  const { restaurantId, category } = useLocalSearchParams<{ restaurantId: string; category: string }>();
  const router = useRouter();
  const restaurant = restaurantDetail(restaurantId);
  const cat = reviewCategory(restaurantId, category ?? 'food');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable onPress={() => goBack(router, `/restaurant/${restaurantId}`)} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        <Text variant="small" color="textFaint">
          Back
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="caption" color="textLabel" style={styles.upper}>
            {cat?.label ?? 'Reviews'} · {restaurant.name}
          </Text>
          <View style={styles.headRow}>
            <Text variant="h2" color="text">
              {cat?.count ?? 0} {cat?.count === 1 ? 'review' : 'reviews'}
            </Text>
            {cat?.score != null ? (
              <Text variant="h2" color="textStrong">
                {cat.score.toFixed(1)}/10
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.list}>
          {(cat?.entries ?? []).map((e, i) => (
            <Card key={i} padding={3} style={styles.review}>
              <View style={styles.reviewHead}>
                <Text variant="bodyStrong" color="textStrong">
                  {e.by}
                </Text>
                {e.score != null ? (
                  <Text variant="small" color="textFaint">
                    {e.score.toFixed(1)}/10
                  </Text>
                ) : null}
              </View>
              <Text variant="body" color="textMuted">
                {e.text}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[4], paddingVertical: space[2] },
  scroll: { paddingHorizontal: space[4], paddingBottom: space[8] },
  header: { paddingTop: space[3], gap: space[2] },
  upper: { textTransform: 'uppercase', letterSpacing: 0.6 },
  headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  list: { paddingTop: space[5], gap: space[3] },
  review: { gap: space[2] },
  reviewHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
});
