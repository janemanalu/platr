import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantMap } from '@/components/map/RestaurantMap';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { RestaurantRow } from '@/components/restaurant/RestaurantRow';
import { Card, SectionHeader, Text } from '@/components/ui';
import { useTastesLikeYou, useTrendingNearYou } from '@/hooks/useHomeRecommendations';
import { useMyProfile } from '@/hooks/useProfile';
import { useMyStreak } from '@/hooks/useStreak';
import { useUserLogs } from '@/hooks/useUserLogs';
import { useUserId } from '@/lib/auth';
import { borderWidth, colors, gray, radius, space } from '@/theme';

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Home() {
  const router = useRouter();
  const userId = useUserId();
  const openRestaurant = (id: string) => router.push(`/restaurant/${id}`);

  const profile = useMyProfile();
  const streak = useMyStreak();
  const logs = useUserLogs(userId);
  const tastesLikeYou = useTastesLikeYou(userId);
  const trendingNearYou = useTrendingNearYou(userId);

  const wishlist = useMemo(() => (logs.data ?? []).filter((l) => l.status === 'wishlist'), [logs.data]);

  const pins = useMemo(
    () =>
      (logs.data ?? [])
        .filter((l) => (l.status === 'go_to' || l.status === 'visited') && l.restaurant.lat != null && l.restaurant.lng != null)
        .map((l) => ({ id: l.restaurant.id, label: initials(l.restaurant.name), lat: l.restaurant.lat!, lng: l.restaurant.lng! })),
    [logs.data],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Sticky header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="title" color="textBody">
            :P
          </Text>
          <View style={styles.headerDivider} />
          <Ionicons name="location-outline" size={12} color={colors.textFaint} />
          <Text variant="small" color="textMuted">
            {profile.data?.area ?? '—'}, {profile.data?.city ?? '—'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.push('/settings')}
          style={styles.avatar}
        >
          {profile.data?.avatar_url ? (
            <Image source={{ uri: profile.data.avatar_url }} style={StyleSheet.absoluteFill} />
          ) : (
            <Ionicons name="person-outline" size={14} color={colors.textMuted} />
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text variant="caption" color="textDisabled" style={styles.tracked}>
            welcome back,
          </Text>
          <Text variant="h1" color="text">
            {(profile.data?.display_name ?? 'there').split(' ')[0]}!
          </Text>
          <Text variant="body" color="textFaint" style={styles.italic}>
            What are we eating today?
          </Text>
        </View>

        {/* Streak */}
        <View style={styles.section}>
          <Card style={styles.streak}>
            {streak.isLoading ? (
              <ActivityIndicator color={colors.textFaint} />
            ) : (
              <Text variant="display" color="textStrong">
                {streak.data ?? 0}
              </Text>
            )}
            <View style={styles.streakMeta}>
              <Text variant="small" color="textBody">
                day streak
              </Text>
              <Text variant="caption" color="textLabel">
                Keep logging to hold it
              </Text>
            </View>
            <Text variant="h2">🔥</Text>
          </Card>
        </View>

        {/* Your Food Map */}
        <View style={styles.section}>
          <SectionHeader
            label="Your Food Map"
            actionLabel="Expand"
            onAction={() => router.push('/map-expanded')}
          />
          <View style={styles.map}>
            <RestaurantMap pins={pins} onPressPin={openRestaurant} />
            <Text variant="caption" color="textFaint" style={styles.mapCaption}>
              {pins.length ? `${pins.length} logged · tap pin for detail` : 'Log a visit to start your map'}
            </Text>
          </View>
        </View>

        {/* Tastes Like You */}
        <View style={styles.section}>
          <SectionHeader
            label="Tastes Like You"
            caption="Based on your logs and wishlist"
            actionLabel={`See all (${tastesLikeYou.total})`}
            onAction={() => router.push('/list/tastes-like-you')}
          />
          {tastesLikeYou.data.length === 0 && !tastesLikeYou.isLoading ? (
            <Text variant="caption" color="textDisabled">
              You've logged the whole catalog so far — check back as more restaurants join Platr.
            </Text>
          ) : (
            <Carousel>
              {tastesLikeYou.data.map((r) => (
                <RestaurantCard
                  key={r.id}
                  name={r.name}
                  cuisine={r.cuisine ?? undefined}
                  photoUri={r.cover_photo_url}
                  width={150}
                  onPress={() => openRestaurant(r.id)}
                />
              ))}
            </Carousel>
          )}
        </View>

        {/* Trending Near You */}
        <View style={styles.section}>
          <SectionHeader
            label="Trending Near You"
            caption="Highly-rated by friends nearby"
            actionLabel={`See all (${trendingNearYou.total})`}
            onAction={() => router.push('/list/trending')}
          />
          {trendingNearYou.data.length === 0 && !trendingNearYou.isLoading ? (
            <Text variant="caption" color="textDisabled">
              Follow some friends to see what they're loving nearby.
            </Text>
          ) : (
            <Carousel>
              {trendingNearYou.data.map(({ restaurant, score, reviewer }) => (
                <RestaurantCard
                  key={restaurant.id}
                  name={restaurant.name}
                  score={score}
                  scoreBy={reviewer}
                  photoUri={restaurant.cover_photo_url}
                  width={150}
                  onPress={() => openRestaurant(restaurant.id)}
                />
              ))}
            </Carousel>
          )}
        </View>

        {/* Your Wishlist */}
        <View style={styles.section}>
          <SectionHeader
            label="Your Wishlist"
            actionLabel={`See all (${wishlist.length})`}
            onAction={() => router.push('/list/wishlist')}
          />
          {wishlist.length === 0 ? (
            <Text variant="caption" color="textDisabled">
              Nothing on your wishlist yet.
            </Text>
          ) : (
            <Card padding={0}>
              {wishlist.map((l, i) => (
                <RestaurantRow
                  key={l.id}
                  name={l.restaurant.name}
                  subtitle={l.restaurant.cuisine ?? undefined}
                  photoUri={l.restaurant.cover_photo_url}
                  divider={i < wishlist.length - 1}
                  onPress={() => openRestaurant(l.restaurant.id)}
                />
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Horizontal, edge-to-edge scroller with consistent gutters. */
function Carousel({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingTop: space[2],
    paddingBottom: space[3],
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.divider,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  headerDivider: { width: borderWidth, height: 12, backgroundColor: colors.border },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSunken,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  scroll: { paddingBottom: space[8] },

  greeting: {
    backgroundColor: colors.bgSubtle,
    paddingHorizontal: space[5],
    paddingTop: space[5],
    paddingBottom: space[4],
    gap: space[1],
  },
  tracked: { letterSpacing: 1 },
  italic: { fontStyle: 'italic' },

  section: { paddingHorizontal: space[5], paddingTop: space[5], gap: space[3] },

  streak: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  streakMeta: { flex: 1, gap: 2 },

  map: {
    height: 120,
    backgroundColor: gray[200],
    borderWidth,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  mapCaption: {
    position: 'absolute',
    left: space[2],
    bottom: space[1],
    backgroundColor: colors.bg,
    paddingHorizontal: space[1],
  },

  carousel: { gap: space[3], paddingRight: space[5] },
});
