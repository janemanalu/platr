import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewCategoryCard } from '@/components/restaurant/ReviewCategoryCard';
import { TagGroup } from '@/components/restaurant/TagGroup';
import { Button, Text, Thumbnail } from '@/components/ui';
import { useRestaurant } from '@/hooks/useRestaurants';
import { useRestaurantTagGroups } from '@/hooks/useRestaurantTagGroups';
import { useReviewCategories } from '@/hooks/useRestaurantReviews';
import { goBack } from '@/lib/nav';
import { PRICE } from '@/lib/placeholder';
import { colors, space } from '@/theme';

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: r, isLoading, error } = useRestaurant(id);
  const { groups: tagGroups } = useRestaurantTagGroups(id);
  const { categories } = useReviewCategories(id);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable onPress={() => goBack(router, '/discover')} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        <Text variant="small" color="textFaint">
          Back
        </Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textFaint} />
        </View>
      ) : error || !r ? (
        <View style={styles.centered}>
          <Text variant="small" color="textBody">
            Couldn't load this restaurant.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Thumbnail uri={r.cover_photo_url} fill aspectRatio={2.4} />

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text variant="h2" color="text" style={styles.name}>
                {r.name}
              </Text>
              <Button
                label="Log a Visit"
                size="sm"
                variant="secondary"
                onPress={() => router.push(`/log?restaurantId=${r.id}`)}
              />
            </View>
            <Text variant="small" color="textFaint">
              {r.cuisine ?? '—'}
              {r.price_level ? ` · ${PRICE[r.price_level]}` : ''}
            </Text>
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={12} color={colors.textFaint} />
              <Text variant="small" color="textMuted">
                {r.area ?? '—'}, {r.city ?? '—'}
              </Text>
            </View>

            {tagGroups.length > 0 ? (
              <Section label="Tags">
                <View style={styles.tagGroups}>
                  {tagGroups.map((g) => (
                    <TagGroup key={g.label} label={g.label} tags={g.tags} />
                  ))}
                </View>
              </Section>
            ) : null}

            {r.about ? (
              <Section label="About">
                <Text variant="body" color="textMuted">
                  {r.about}
                </Text>
                {r.website_url ? (
                  <Pressable onPress={() => Linking.openURL(r.website_url!)} style={styles.website}>
                    <Text variant="link" color="textFaint">
                      Visit Website ↗
                    </Text>
                  </Pressable>
                ) : null}
              </Section>
            ) : null}

            <Section label="Reviews — you & friends">
              {categories.every((c) => c.sorted.length === 0) ? (
                <Text variant="caption" color="textDisabled">
                  No reviews yet — be the first to log a visit.
                </Text>
              ) : (
                <View style={styles.reviews}>
                  {categories
                    .filter((c) => c.sorted.length > 0)
                    .map((c) => (
                      <ReviewCategoryCard
                        key={c.key}
                        label={c.label}
                        score={c.score ?? undefined}
                        previewText={c.sorted[0].notes ?? ''}
                        by={c.sorted[0].reviewer.display_name}
                        onSeeAll={() => router.push(`/reviews/${r.id}?category=${c.key}`)}
                      />
                    ))}
                </View>
              )}
            </Section>

            <Button
              label="+ LOG A VISIT"
              fullWidth
              onPress={() => router.push(`/log?restaurantId=${r.id}`)}
              style={styles.cta}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="sectionLabel" color="textLabel">
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[4], paddingVertical: space[2] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: space[6] },
  body: { paddingHorizontal: space[4], paddingTop: space[4], gap: space[2] },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space[3] },
  name: { flex: 1 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },

  section: { paddingTop: space[5], gap: space[3] },
  tagGroups: { gap: space[3] },

  website: { alignSelf: 'flex-start', paddingVertical: space[1] },

  reviews: { gap: space[3] },

  cta: { marginTop: space[6] },
});
