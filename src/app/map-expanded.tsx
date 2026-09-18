import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantMap } from '@/components/map/RestaurantMap';
import { Card, Text, Thumbnail } from '@/components/ui';
import { useDeviceLocation } from '@/hooks/useDeviceLocation';
import { useUserLogs } from '@/hooks/useUserLogs';
import { useUserId } from '@/lib/auth';
import { distanceKm, formatDistance } from '@/lib/geo';
import { goBack } from '@/lib/nav';
import { borderWidth, colors, space } from '@/theme';

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

/** Figma 54:7462 — Home's "Your Food Map", full-screen. */
export default function ExpandedMap() {
  const router = useRouter();
  const userId = useUserId();
  const logs = useUserLogs(userId);
  const myLocation = useDeviceLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const spots = useMemo(
    () =>
      (logs.data ?? []).filter(
        (l) => (l.status === 'go_to' || l.status === 'visited') && l.restaurant.lat != null && l.restaurant.lng != null,
      ),
    [logs.data],
  );

  const pins = useMemo(
    () => spots.map((l) => ({ id: l.restaurant.id, label: initials(l.restaurant.name), lat: l.restaurant.lat!, lng: l.restaurant.lng! })),
    [spots],
  );

  const selected = spots.find((l) => l.restaurant.id === selectedId) ?? null;
  const selectedDistance =
    selected && myLocation ? formatDistance(distanceKm(myLocation, { lat: selected.restaurant.lat!, lng: selected.restaurant.lng! })) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.map}>
        <RestaurantMap pins={pins} onPressPin={(id) => setSelectedId((cur) => (cur === id ? null : id))} />
        <Pressable onPress={() => goBack(router, '/')} style={styles.homeBtn}>
          <Text variant="small" color="textBody">
            ← Home
          </Text>
        </Pressable>
        <View style={styles.countBadge}>
          <Text variant="caption" color="textDisabled">
            {spots.length} logged {spots.length === 1 ? 'spot' : 'spots'}
          </Text>
        </View>
      </View>

      {selected ? (
        <Card style={styles.selection}>
          <Thumbnail uri={selected.restaurant.cover_photo_url} size={48} />
          <View style={styles.selectionBody}>
            <Text variant="bodyStrong" color="textStrong" numberOfLines={1}>
              {selected.restaurant.name}
            </Text>
            {selectedDistance ? (
              <Text variant="caption" color="textFaint">
                {selectedDistance} away
              </Text>
            ) : null}
          </View>
          <Pressable onPress={() => router.push(`/restaurant/${selected.restaurant.id}`)} hitSlop={8}>
            <Text variant="link" color="textFaint">
              View →
            </Text>
          </Pressable>
        </Card>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  map: { flex: 1 },
  homeBtn: {
    position: 'absolute',
    left: space[4],
    top: space[4],
    backgroundColor: colors.bg,
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  countBadge: {
    position: 'absolute',
    right: space[4],
    top: space[4],
    backgroundColor: colors.bg,
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
  },
  selection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginHorizontal: space[4],
    marginBottom: space[4],
  },
  selectionBody: { flex: 1, gap: 2 },
});
