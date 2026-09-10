import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantListItem } from '@/components/restaurant/RestaurantListItem';
import { Chip, SearchField, SegmentedToggle, Text } from '@/components/ui';
import { discovery } from '@/lib/placeholder';
import { borderWidth, colors, gray, space } from '@/theme';

const VIEWS = ['Map', 'List'] as const;

export default function Discover() {
  const router = useRouter();
  const [view, setView] = useState<(typeof VIEWS)[number]>('List');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [active, setActive] = useState<string[]>([]);

  const toggleFilter = (f: string) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.controls}>
        <SearchField placeholder="Search restaurants, cuisines, vibes…" />

        <View style={styles.toolbar}>
          <SegmentedToggle options={VIEWS} value={view} onChange={setView} />
          <View style={styles.toolbarRight}>
            <Pressable
              onPress={() => setFiltersOpen((o) => !o)}
              style={[styles.filterBtn, filtersOpen && styles.filterBtnActive]}
            >
              <Ionicons
                name="options-outline"
                size={13}
                color={filtersOpen ? colors.onActive : colors.textFaint}
              />
              <Text variant="caption" color={filtersOpen ? 'onActive' : 'textFaint'} style={styles.upper}>
                Filters
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push('/find-for-me')} style={styles.findBtn}>
              <Text variant="caption" color="onActive" style={styles.upper}>
                ✦ Find for me
              </Text>
            </Pressable>
          </View>
        </View>

        {filtersOpen ? (
          <View style={styles.filters}>
            {discovery.filters.map((f) => (
              <Chip key={f} label={f} active={active.includes(f)} onPress={() => toggleFilter(f)} />
            ))}
          </View>
        ) : null}
      </View>

      {view === 'List' ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text variant="sectionLabel" color="textLabel">
            {discovery.results.length} results · {discovery.areaLabel}
          </Text>
          {discovery.results.map((r) => (
            <RestaurantListItem
              key={r.id}
              name={r.name}
              cuisine={r.cuisine}
              area={r.area}
              city={r.city}
              priceLevel={r.price_level}
              tags={r.tags}
              onPress={() => router.push(`/restaurant/${r.id}`)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.mapWrap}>
          <View style={styles.map}>
            {discovery.pins.map((pin) => (
              <Pressable
                key={pin.id}
                onPress={() => router.push(`/restaurant/${pin.id}`)}
                style={[styles.pin, { left: pin.x as `${number}%`, top: pin.y as `${number}%` }]}
              >
                <Text variant="caption" color="onActive" style={styles.pinText}>
                  {pin.label}
                </Text>
              </Pressable>
            ))}
            <Text variant="caption" color="textFaint" style={styles.mapNote}>
              Interactive map · tap pins
            </Text>
          </View>
          <View style={styles.mapBar}>
            <Text variant="small" color="textFaint">
              {discovery.results.length} results nearby
            </Text>
            <Pressable onPress={() => setView('List')}>
              <Text variant="link" color="textFaint">
                Show list
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  controls: {
    paddingHorizontal: space[4],
    paddingTop: space[2],
    paddingBottom: space[3],
    gap: space[3],
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.divider,
  },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  upper: { textTransform: 'uppercase', letterSpacing: 0.6 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderWidth,
    borderColor: colors.border,
    paddingVertical: space[2],
    paddingHorizontal: space[2],
  },
  filterBtnActive: { backgroundColor: colors.bgActive, borderColor: colors.bgActive },
  findBtn: {
    backgroundColor: colors.bgActive,
    paddingVertical: space[2],
    paddingHorizontal: space[2],
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },

  list: { paddingHorizontal: space[4], paddingVertical: space[3], paddingBottom: space[8], gap: 0 },

  mapWrap: { flex: 1, padding: space[4], gap: space[3] },
  map: { flex: 1, backgroundColor: gray[200], borderWidth, borderColor: colors.borderStrong },
  pin: {
    position: 'absolute',
    backgroundColor: colors.textBody,
    paddingHorizontal: space[1],
    paddingVertical: 2,
  },
  pinText: { fontSize: 8, lineHeight: 10 },
  mapNote: { position: 'absolute', right: space[2], bottom: space[2] },
  mapBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
