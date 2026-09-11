import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedTile } from '@/components/social/FeedTile';
import { StoryBubble } from '@/components/social/StoryBubble';
import { Button, SegmentedToggle, Text } from '@/components/ui';
import { social } from '@/lib/placeholder';
import { borderWidth, colors, space } from '@/theme';

const SCOPES = ['Friends', 'Everyone'] as const;

export default function Social() {
  const router = useRouter();
  const [scope, setScope] = useState<(typeof SCOPES)[number]>('Friends');

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

        <View style={styles.block}>
          <Text variant="sectionLabel" color="textLabel">
            Recent visits
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stories}>
            {social.recentVisits.map((v) => (
              <StoryBubble
                key={v.id}
                name={v.name}
                initial={v.initial}
                onPress={() => router.push(`/user/${v.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.share}>
          <View style={styles.shareText}>
            <Text variant="bodyStrong" color="textBody">
              Share your last meal
            </Text>
            <Text variant="caption" color="textDisabled">
              Nothing logged this week
            </Text>
          </View>
          <Button label="+ Log" size="sm" variant="secondary" onPress={() => router.push('/log')} />
        </View>

        <View style={styles.block}>
          <Text variant="sectionLabel" color="textLabel">
            {scope === 'Friends' ? "Friends' logs" : 'Everyone'}
          </Text>
          <View style={styles.feed}>
            {social.feed.map((item) => (
              <View key={item.id} style={item.featured ? styles.full : styles.half}>
                <FeedTile
                  reviewer={item.reviewer}
                  restaurantName={item.restaurant.name}
                  food={item.food}
                  vibe={item.vibe}
                  featured={item.featured}
                  previewText={item.preview}
                  onPress={() => router.push(`/post/${item.id}`)}
                  onOpenRestaurant={() => router.push(`/restaurant/${item.restaurant.id}`)}
                />
              </View>
            ))}
          </View>
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
