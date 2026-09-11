import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GalleryGrid } from '@/components/profile/GalleryGrid';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { RestaurantRow } from '@/components/restaurant/RestaurantRow';
import { Card, Text } from '@/components/ui';
import { gallery, listDetail, type ListVariant } from '@/lib/placeholder';
import { goBack } from '@/lib/nav';
import { colors, space } from '@/theme';

export default function ListDetail() {
  const { id, variant } = useLocalSearchParams<{ id: string; variant?: ListVariant }>();
  const router = useRouter();
  const v: ListVariant = variant ?? 'cards';
  const list = listDetail(id, v);
  const openRestaurant = (rid: string) => router.push(`/restaurant/${rid}`);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable onPress={() => goBack(router, '/')} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        <Text variant="small" color="textFaint">
          Back
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="h2" color="text">
            {list.name}
          </Text>
          <Text variant="caption" color="textLabel">
            {list.items.length} items
          </Text>
          {list.subtitle ? (
            <Text variant="caption" color="textDisabled">
              {list.subtitle}
            </Text>
          ) : null}
        </View>

        {v === 'gallery' ? (
          <GalleryGrid photos={gallery} onOpen={(logId) => openRestaurant(logId)} />
        ) : v === 'cards' ? (
          <View style={styles.grid}>
            {list.items.map((r) => (
              <View key={r.id} style={styles.gridCell}>
                <RestaurantCard name={r.name} cuisine={r.cuisine} width={undefined} onPress={() => openRestaurant(r.id)} />
              </View>
            ))}
          </View>
        ) : (
          <Card padding={0}>
            {list.items.map((r, i) => (
              <RestaurantRow
                key={r.id}
                name={r.name}
                subtitle={
                  v === 'wishlist-rows' ? r.cuisine : `${r.cuisine} · ${r.area}, ${r.city}`
                }
                trailing={v === 'wishlist-rows' ? `${(0.5 + i * 1.3).toFixed(1)} km` : '›'}
                divider={i < list.items.length - 1}
                onPress={() => openRestaurant(r.id)}
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[4], paddingVertical: space[2] },
  scroll: { paddingHorizontal: space[4], paddingBottom: space[8], gap: space[4] },
  header: { paddingTop: space[3], gap: space[1] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  gridCell: { width: '47%' },
});
