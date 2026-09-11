import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { RestaurantRow } from '@/components/restaurant/RestaurantRow';
import { Card, SectionHeader, Text } from '@/components/ui';
import { currentUser, home } from '@/lib/placeholder';
import { borderWidth, colors, gray, radius, space } from '@/theme';

export default function Home() {
  const router = useRouter();
  const openRestaurant = (id: string) => router.push(`/restaurant/${id}`);

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
            {currentUser.area}, {currentUser.city}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.push('/settings')}
          style={styles.avatar}
        >
          {currentUser.avatar_url ? (
            <Image source={{ uri: currentUser.avatar_url }} style={StyleSheet.absoluteFill} />
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
            {currentUser.display_name}!
          </Text>
          <Text variant="body" color="textFaint" style={styles.italic}>
            What are we eating today?
          </Text>
        </View>

        {/* Streak */}
        <View style={styles.section}>
          <Card style={styles.streak}>
            <Text variant="display" color="textStrong">
              {home.streak}
            </Text>
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
            onAction={() => router.push('/discover')}
          />
          <View style={styles.map}>
            {home.foodMap.pins.map((pin, i) => (
              <Pressable
                key={pin.id}
                onPress={() => openRestaurant(pin.id)}
                style={[styles.pin, PIN_POSITIONS[i]]}
              >
                <Text variant="caption" color="onActive" style={styles.pinText}>
                  {pin.initials}
                </Text>
              </Pressable>
            ))}
            <Text variant="caption" color="textFaint" style={styles.mapCaption}>
              {home.foodMap.loggedCount} logged · tap pin for detail
            </Text>
          </View>
        </View>

        {/* Tastes Like You */}
        <View style={styles.section}>
          <SectionHeader
            label="Tastes Like You"
            caption="Based on your logs and wishlist"
            actionLabel={`See all (${home.tastesLikeYouTotal})`}
            onAction={() => router.push('/list/tastes-like-you')}
          />
          <Carousel>
            {home.tastesLikeYou.map((r) => (
              <RestaurantCard
                key={r.id}
                name={r.name}
                cuisine={r.cuisine}
                width={150}
                onPress={() => openRestaurant(r.id)}
              />
            ))}
          </Carousel>
        </View>

        {/* Trending Near You */}
        <View style={styles.section}>
          <SectionHeader
            label="Trending Near You"
            caption="Highly-rated by friends nearby"
            actionLabel={`See all (${home.trendingNearYouTotal})`}
            onAction={() => router.push('/list/trending')}
          />
          <Carousel>
            {home.trendingNearYou.map(({ restaurant, score, reviewer }) => (
              <RestaurantCard
                key={restaurant.id}
                name={restaurant.name}
                score={score}
                scoreBy={reviewer}
                width={150}
                onPress={() => openRestaurant(restaurant.id)}
              />
            ))}
          </Carousel>
        </View>

        {/* Your Wishlist */}
        <View style={styles.section}>
          <SectionHeader
            label="Your Wishlist"
            actionLabel={`See all (${home.wishlistTotal})`}
            onAction={() => router.push('/list/wishlist')}
          />
          <Card padding={0}>
            {home.wishlist.map(({ restaurant, distanceKm }, i) => (
              <RestaurantRow
                key={restaurant.id}
                name={restaurant.name}
                subtitle={restaurant.cuisine}
                trailing={`${distanceKm} km`}
                divider={i < home.wishlist.length - 1}
                onPress={() => openRestaurant(restaurant.id)}
              />
            ))}
          </Card>
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

const PIN_POSITIONS = [
  { left: '16%', top: '18%' },
  { left: '45%', top: '46%' },
  { left: '68%', top: '14%' },
  { left: '55%', top: '64%' },
] as const;

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
  },
  pin: {
    position: 'absolute',
    width: 22,
    height: 22,
    backgroundColor: colors.textBody,
    borderWidth: 1.5,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: { fontSize: 7, lineHeight: 8 },
  mapCaption: { position: 'absolute', left: space[2], bottom: space[1] },

  carousel: { gap: space[3], paddingRight: space[5] },
});
