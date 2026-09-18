import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Text, Thumbnail } from '@/components/ui';
import { useRestaurant } from '@/hooks/useRestaurants';
import { useReviewCategories, type RestaurantReview } from '@/hooks/useRestaurantReviews';
import { goBack } from '@/lib/nav';
import { colors, space } from '@/theme';

const TABS = ['all', 'food', 'vibe', 'tales'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = { all: 'All', food: 'Food', vibe: 'Vibe', tales: 'Tales' };

function shortName(displayName: string) {
  const [first, ...rest] = displayName.trim().split(/\s+/);
  const last = rest[rest.length - 1];
  return last ? `${first} ${last[0]}.` : first;
}

/** Restaurant Detail's Food/Vibe/Tales cards, all in one place — Figma 54:6872. */
export default function AllReviews() {
  const { restaurantId, category } = useLocalSearchParams<{ restaurantId: string; category?: string }>();
  const router = useRouter();
  const { data: restaurant } = useRestaurant(restaurantId);
  const { reviews, categories, isLoading } = useReviewCategories(restaurantId);
  const [tab, setTab] = useState<Tab>((TABS as readonly string[]).includes(category ?? '') ? (category as Tab) : 'all');

  const byTab: Record<Tab, RestaurantReview[]> = useMemo(
    () => ({
      all: reviews ?? [],
      food: categories.find((c) => c.key === 'food')?.sorted ?? [],
      vibe: categories.find((c) => c.key === 'vibe')?.sorted ?? [],
      tales: categories.find((c) => c.key === 'tales')?.sorted ?? [],
    }),
    [reviews, categories],
  );

  const shown = byTab[tab];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headRow}>
          <Pressable onPress={() => goBack(router, `/restaurant/${restaurantId}`)} hitSlop={12} style={styles.back}>
            <Ionicons name="chevron-back" size={16} color={colors.textFaint} />
          </Pressable>
          <View style={styles.headTitle}>
            <Text variant="modalTitle" color="textStrong">
              Reviews — {restaurant?.name ?? '—'}
            </Text>
            <Text variant="caption" color="textDisabled">
              {shown.length} {shown.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text variant="sectionLabel" color={tab === t ? 'onActive' : 'textFaint'}>
                {TAB_LABEL[t]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textFaint} />
        </View>
      ) : (
        <ScrollView style={styles.listBg} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {shown.length === 0 ? (
            <Text variant="caption" color="textDisabled">
              No reviews here yet.
            </Text>
          ) : (
            <View style={styles.list}>
              {shown.map((r) => (
                <Card key={r.id} padding={3} style={styles.review}>
                  {r.photoUrl ? <Thumbnail uri={r.photoUrl} fill aspectRatio={16 / 9} /> : null}
                  <View style={styles.reviewHead}>
                    <View style={styles.reviewer}>
                      <View style={styles.avatar}>
                        <Text variant="micro" color="textLabel">
                          {r.reviewer.display_name
                            .split(/\s+/)
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <Text variant="bodyStrong" color="textStrong">
                        {shortName(r.reviewer.display_name)}
                      </Text>
                    </View>
                    {tab === 'tales' ? null : tab === 'food' && r.food_rating != null ? (
                      <ScoreChip label="Food" value={r.food_rating} />
                    ) : tab === 'vibe' && r.vibe_rating != null ? (
                      <ScoreChip label="Vibe" value={r.vibe_rating} />
                    ) : tab === 'all' ? (
                      <View style={styles.chipRow}>
                        {r.food_rating != null ? <ScoreChip label="Food" value={r.food_rating} /> : null}
                        {r.vibe_rating != null ? <ScoreChip label="Vibe" value={r.vibe_rating} /> : null}
                      </View>
                    ) : null}
                  </View>
                  {r.notes ? (
                    <View style={styles.quote}>
                      <Text variant="body" color="textMuted">
                        "{r.notes}"
                      </Text>
                    </View>
                  ) : null}
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreChip}>
      <Text variant="micro" color="textLabel">
        {label}
      </Text>
      <Text variant="bodyStrong" color="textStrong">
        {value.toFixed(1)}
        <Text variant="micro" color="textDisabled">
          /10
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { paddingHorizontal: space[4], paddingTop: space[2], paddingBottom: space[3], gap: space[3] },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  back: { width: 20 },
  headTitle: { flex: 1, gap: 2 },

  tabs: { flexDirection: 'row', gap: space[2] },
  tab: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bg,
    paddingHorizontal: space[3],
    paddingVertical: space[1] + 2,
  },
  tabActive: { backgroundColor: colors.bgActive, borderColor: colors.bgActive },

  listBg: { backgroundColor: colors.bgSubtle },
  scroll: { padding: space[4], paddingBottom: space[8] },
  list: { gap: space[3] },
  review: { gap: space[2] },
  reviewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewer: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgSunken,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', gap: space[2] },
  scoreChip: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  quote: { borderLeftWidth: 2, borderLeftColor: colors.divider, paddingLeft: space[2] },
});
