import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GalleryGrid } from '@/components/profile/GalleryGrid';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileListSection } from '@/components/profile/ProfileListSection';
import { Button, Text } from '@/components/ui';
import { goBack } from '@/lib/nav';
import { gallery, otherUser } from '@/lib/placeholder';
import { colors, space } from '@/theme';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const u = otherUser(id);
  const [following, setFollowing] = useState(u.isFollowing);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Pressable onPress={() => goBack(router, '/social')} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        <Text variant="small" color="textFaint">
          Social
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={u.name}
          username={u.username}
          area={u.area}
          city={u.city}
          stats={u.stats}
          mutualFriends={u.mutualFriends}
        />

        <Button
          label={following ? 'Following' : '+ Follow'}
          variant={following ? 'secondary' : 'primary'}
          fullWidth
          onPress={() => setFollowing((f) => !f)}
        />

        <Text variant="caption" color="textDisabled">
          Public lists · Private lists hidden
        </Text>

        <View style={styles.sections}>
          {u.publicSections.map((s) => (
            <ProfileListSection
              key={s.label}
              label={s.label}
              items={s.items}
              total={s.total}
              isPublic
              onOpenRestaurant={(rid) => router.push(`/restaurant/${rid}`)}
              onSeeAll={() => router.push(`/list/${s.label.toLowerCase().replace(' ', '-')}?variant=list-rows`)}
            />
          ))}
        </View>

        <View style={styles.sections}>
          <View style={styles.galleryHead}>
            <Text variant="sectionLabel" color="textLabel">
              Gallery
            </Text>
            <Text variant="caption" color="textDisabled">
              ○ Public
            </Text>
          </View>
          <GalleryGrid photos={gallery} limit={6} onOpen={(logId) => router.push(`/restaurant/${logId}`)} />
          <Text variant="link" color="textFaint" onPress={() => router.push('/list/gallery?variant=gallery')}>
            See all photos →
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[4], paddingVertical: space[2] },
  scroll: { paddingHorizontal: space[4], paddingBottom: space[8], gap: space[4] },
  sections: { gap: space[4] },
  galleryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
