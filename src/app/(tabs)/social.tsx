import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedTile } from '@/components/social/FeedTile';
import { StoryBubble } from '@/components/social/StoryBubble';
import { Button, SegmentedToggle, Text } from '@/components/ui';
import { useFollowing } from '@/hooks/useFollowing';
import { useEveryoneFeed, useFriendsFeed, useMyLastReview } from '@/hooks/useSocialFeed';
import { useUserId } from '@/lib/auth';
import { borderWidth, colors, space } from '@/theme';

const SCOPES = ['Friends', 'Everyone'] as const;

function daysAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86_400_000);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
}

export default function Social() {
  const router = useRouter();
  const userId = useUserId();
  const [scope, setScope] = useState<(typeof SCOPES)[number]>('Friends');

  const following = useFollowing(userId);
  const followingIds = useMemo(() => following.data?.map((f) => f.id), [following.data]);
  const friendsFeed = useFriendsFeed(userId, followingIds);
  const everyoneFeed = useEveryoneFeed();
  const lastReview = useMyLastReview(userId);

  const feed = scope === 'Friends' ? friendsFeed : everyoneFeed;

  const recentVisits = useMemo(() => {
    const seen = new Set<string>();
    const bubbles: { id: string; name: string; initial: string }[] = [];
    for (const item of friendsFeed.data ?? []) {
      if (seen.has(item.reviewer.id)) continue;
      seen.add(item.reviewer.id);
      bubbles.push({ id: item.reviewer.username, name: item.reviewer.display_name.split(' ')[0], initial: item.reviewer.display_name[0] });
    }
    return bubbles;
  }, [friendsFeed.data]);

  const sharedRecently = lastReview.data && Date.now() - new Date(lastReview.data.created_at).getTime() < 7 * 86_400_000;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h2" color="text">
          Social
        </Text>
        <Pressable onPress={() => router.push('/user/aisha')} style={styles.findBtn}>
          <Ionicons name="search" size={13} color={colors.textFaint} />
          <Text variant="caption" color="textFaint" style={styles.upper}>
            Find users
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SegmentedToggle options={SCOPES} value={scope} onChange={setScope} />

        {recentVisits.length > 0 ? (
          <View style={styles.block}>
            <Text variant="sectionLabel" color="textLabel">
              Recent visits
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stories}>
              {recentVisits.map((v) => (
                <StoryBubble
                  key={v.id}
                  name={v.name}
                  initial={v.initial}
                  onPress={() => router.push(`/user/${v.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.share}>
          <View style={styles.shareText}>
            <Text variant="bodyStrong" color="textBody">
              Share your last meal
            </Text>
            <Text variant="caption" color="textDisabled">
              {sharedRecently ? `Last logged ${daysAgo(lastReview.data!.created_at)}` : 'Nothing logged this week'}
            </Text>
          </View>
          <Button label="+ Log" size="sm" variant="secondary" onPress={() => router.push('/log')} />
        </View>

        <View style={styles.block}>
          <Text variant="sectionLabel" color="textLabel">
            {scope === 'Friends' ? "Friends' logs" : 'Everyone'}
          </Text>
          {feed.isLoading ? (
            <ActivityIndicator color={colors.textFaint} style={styles.loading} />
          ) : feed.data && feed.data.length > 0 ? (
            <View style={styles.feed}>
              {feed.data.map((item) => {
                const featured = item.notes != null && item.notes.length > 60;
                return (
                  <View key={item.id} style={featured ? styles.full : styles.half}>
                    <FeedTile
                      reviewer={item.reviewer.display_name.split(' ')[0]}
                      restaurantName={item.restaurant.name}
                      food={item.food_rating ?? 0}
                      vibe={item.vibe_rating ?? 0}
                      featured={featured}
                      previewText={item.notes ?? undefined}
                      photoUrl={item.photoUrl}
                      onPress={() => router.push(`/post/${item.id}`)}
                      onOpenRestaurant={() => router.push(`/restaurant/${item.restaurant.id}`)}
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <Text variant="caption" color="textDisabled">
              {scope === 'Friends' ? 'Follow some friends to see their logs here.' : 'No activity yet.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space[2],
    paddingVertical: space[2],
  },
  upper: { textTransform: 'uppercase', letterSpacing: 0.6 },

  scroll: { paddingHorizontal: space[4], paddingVertical: space[4], paddingBottom: space[8], gap: space[5] },
  block: { gap: space[2] },
  stories: { gap: space[2], paddingVertical: space[1] },
  loading: { paddingVertical: space[4] },

  share: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth,
    borderColor: colors.border,
    padding: space[3],
    gap: space[3],
  },
  shareText: { flex: 1, gap: 2 },

  feed: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  half: { width: '48%' },
  full: { width: '100%' },
});
