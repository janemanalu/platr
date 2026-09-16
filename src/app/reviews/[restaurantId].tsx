import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Text, Thumbnail } from '@/components/ui';
import { useRestaurant } from '@/hooks/useRestaurants';
import { categoryLabel, useReviewCategories } from '@/hooks/useRestaurantReviews';
import { goBack } from '@/lib/nav';
import { colors, space } from '@/theme';

/** Every review in one category (Food / Vibe / Tales) for a restaurant. */
export default function CategoryReviews() {
  const { restaurantId, category } = useLocalSearchParams<{ restaurantId: string; category: string }>();
  const router = useRouter();
  const { data: restaurant } = useRestaurant(restaurantId);
  const { categories, isLoading } = useReviewCategories(restaurantId);
  const cat = categories.find((c) => c.key === (category ?? 'food'));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable onPress={() => goBack(router, `/restaurant/${restaurantId}`)} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        <Text variant="small" color="textFaint">
          Back
        </Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textFaint} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="caption" color="textLabel" style={styles.upper}>
              {categoryLabel(category ?? 'food')} · {restaurant?.name ?? '—'}
            </Text>
            <View style={styles.headRow}>
              <Text variant="h2" color="text">
                {cat?.sorted.length ?? 0} {cat?.sorted.length === 1 ? 'review' : 'reviews'}
              </Text>
              {cat?.score != null ? (
                <Text variant="h2" color="textStrong">
                  {cat.score.toFixed(1)}/10
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.list}>
            {(cat?.sorted ?? []).map((r) => (
              <Card key={r.id} padding={3} style={styles.review}>
                {r.photoUrl ? <Thumbnail uri={r.photoUrl} fill aspectRatio={16 / 9} /> : null}
                <View style={styles.reviewHead}>
                  <Text variant="bodyStrong" color="textStrong">
                    {r.reviewer.display_name}
                  </Text>
                  <Text variant="small" color="textFaint">
                    {r.food_rating != null ? `F ${r.food_rating.toFixed(1)}` : ''}
                    {r.food_rating != null && r.vibe_rating != null ? ' · ' : ''}
                    {r.vibe_rating != null ? `V ${r.vibe_rating.toFixed(1)}` : ''}
                  </Text>
                </View>
                {r.notes ? (
                  <Text variant="body" color="textMuted">
                    {r.notes}
                  </Text>
                ) : null}
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[4], paddingVertical: space[2] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: space[4], paddingBottom: space[8] },
  header: { paddingTop: space[3], gap: space[2] },
  upper: { textTransform: 'uppercase', letterSpacing: 0.6 },
  headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  list: { paddingTop: space[5], gap: space[3] },
  review: { gap: space[2] },
  reviewHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
});
