import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { goBack } from '@/lib/nav';
import { space } from '@/theme';

const MAX_DOTS = 8;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Figma 54:7894 — full-screen photo, swipe/arrow through a user's gallery. */
export default function PhotoViewer() {
  const router = useRouter();
  const { userId, index } = useLocalSearchParams<{ userId: string; index?: string }>();
  const photos = useGalleryPhotos(userId);
  const [i, setI] = useState(Number(index ?? 0));

  const total = photos.data?.length ?? 0;
  const photo = photos.data?.[i];
  const canPrev = i > 0;
  const canNext = i < total - 1;

  const dots = Math.min(total, MAX_DOTS);
  const overflow = total - MAX_DOTS;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack(router, '/profile')} hitSlop={12}>
          <Text variant="h2" color="onActive">
            ×
          </Text>
        </Pressable>
        <Text variant="caption" color="textFaint" style={styles.counter}>
          {total ? `${i + 1} / ${total}` : ''}
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.photoWrap}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={styles.photo} />
        )}
      </View>

      <View style={styles.nav}>
        <Pressable onPress={() => canPrev && setI(i - 1)} disabled={!canPrev} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={18} color={canPrev ? '#fff' : '#444'} />
        </Pressable>
        <View style={styles.dots}>
          {Array.from({ length: dots }).map((_, d) => (
            <View key={d} style={[styles.dot, d === i && styles.dotActive]} />
          ))}
          {overflow > 0 ? (
            <Text variant="micro" color="textFaint">
              +{overflow}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={() => canNext && setI(i + 1)} disabled={!canNext} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={18} color={canNext ? '#fff' : '#444'} />
        </Pressable>
      </View>

      {photo ? (
        <View style={styles.caption}>
          <Text variant="small" color="textFaint">
            {photo.restaurantName} · logged {formatDate(photo.date)}
          </Text>
          {photo.note ? (
            <Text variant="body" color="textMuted" style={styles.note}>
              "{photo.note}"
            </Text>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  counter: { letterSpacing: 0.9, textTransform: 'uppercase' },
  spacer: { width: 20 },

  photoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[2] },
  photo: { width: '100%', aspectRatio: 1, backgroundColor: '#2a2a2a' },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[6],
    paddingVertical: space[5],
  },
  navBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#444' },
  dotActive: { backgroundColor: '#fff' },

  caption: {
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[6],
    gap: 2,
  },
  note: { fontStyle: 'italic' },
});
