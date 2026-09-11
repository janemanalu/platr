import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Thumbnail } from '@/components/ui';
import { social } from '@/lib/placeholder';
import { borderWidth, colors, radius, space } from '@/theme';

export default function PostView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const post = social.feed.find((f) => f.id === id) ?? social.feed[0];
  const [liked, setLiked] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={20} color={colors.textFaint} />
        </Pressable>
        <Text variant="sectionLabel" color="textBody">
          Post
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Thumbnail uri={null} fill aspectRatio={1.2} />

        <View style={styles.body}>
          <Pressable style={styles.author} onPress={() => router.push(`/user/${post.reviewer.toLowerCase()}`)}>
            <View style={styles.avatar}>
              <Text variant="small" color="textMuted">
                {post.reviewer[0]}
              </Text>
            </View>
            <Text variant="bodyStrong" color="textStrong">
              {post.reviewer}
            </Text>
          </Pressable>

          <Text
            variant="h2"
            color="text"
            onPress={() => router.push(`/restaurant/${post.restaurant.id}`)}
          >
            {post.restaurant.name}
          </Text>
          <Text variant="small" color="textFaint">
            {post.restaurant.cuisine} · {post.restaurant.area}, {post.restaurant.city}
          </Text>

          <View style={styles.scores}>
            <Text variant="bodyStrong" color="textStrong">
              F {post.food.toFixed(1)}/10
            </Text>
            <Text variant="bodyStrong" color="textStrong">
              V {post.vibe.toFixed(1)}/10
            </Text>
          </View>

          <Text variant="body" color="textMuted">
            {post.preview ?? 'What was ordered, who they went with, the story…'}
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={() => setLiked((l) => !l)} style={styles.action} hitSlop={8}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={16}
                color={liked ? colors.textStrong : colors.textFaint}
              />
              <Text variant="caption" color="textFaint">
                {liked ? 4 : 3}
              </Text>
            </Pressable>
            <View style={styles.action}>
              <Ionicons name="chatbubble-outline" size={15} color={colors.textFaint} />
              <Text variant="caption" color="textFaint">
                2
              </Text>
            </View>
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
    paddingVertical: space[3],
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.divider,
  },
  scroll: { paddingBottom: space[8] },
  body: { paddingHorizontal: space[4], paddingTop: space[4], gap: space[2] },
  author: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scores: { flexDirection: 'row', gap: space[4], paddingTop: space[1] },
  actions: {
    flexDirection: 'row',
    gap: space[4],
    paddingTop: space[3],
    borderTopWidth: borderWidth,
    borderTopColor: colors.divider,
    marginTop: space[2],
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
});
