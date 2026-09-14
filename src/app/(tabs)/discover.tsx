import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantListItem } from '@/components/restaurant/RestaurantListItem';
import { Chip, SearchField, SegmentedToggle, Text } from '@/components/ui';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMyProfile } from '@/hooks/useProfile';
import { borderWidth, colors, gray, space } from '@/theme';

const VIEWS = ['Map', 'List'] as const;
const FILTERS = ['Cozy', 'Date spot', 'Casual', 'Adventurous', 'Fancy', 'Budget'];

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Discover() {
  const router = useRouter();
  const profile = useMyProfile();
  const { data: restaurants, isLoading, error } = useRestaurants();
  const [view, setView] = useState<(typeof VIEWS)[number]>('List');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [active, setActive] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const toggleFilter = (f: string) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const filtered = useMemo(() => {
    let list = restaurants ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.cuisine ?? '').toLowerCase().includes(q),
      );
    }
    if (active.length > 0) {
      list = list.filter((r) => active.every((f) => r.tags.some((t) => t.toLowerCase() === f.toLowerCase())));
    }
    return list;
  }, [restaurants, query, active]);

  const areaLabel = profile.data?.area ? `${profile.data.area} area` : 'nearby';

  const pins = useMemo(() => {
    const points = filtered.filter((r) => r.lat != null && r.lng != null);
    if (points.length === 0) return [];
    const lats = points.map((p) => p.lat!);
    const lngs = points.map((p) => p.lng!);
    const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
    const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
    const norm = (v: number, min: number, max: number) => (max === min ? 0.5 : (v - min) / (max - min));
    return points.map((r) => ({
      id: r.id,
      label: initials(r.name),
      x: `${10 + norm(r.lng!, minLng, maxLng) * 80}%`,
      y: `${10 + (1 - norm(r.lat!, minLat, maxLat)) * 80}%`,
    }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.controls}>
        <SearchField
          placeholder="Search restaurants, cuisines, vibes…"
          value={query}
          onChangeText={setQuery}
        />

        <View style={styles.toolbar}>
          <SegmentedToggle options={VIEWS} value={view} onChange={setView} />
          <View style={styles.toolbarRight}>
            <Pressable
              onPress={() => setFiltersOpen((o) => !o)}
              style={[styles.filterBtn, filtersOpen && styles.filterBtnActive]}
            >
              <Ionicons
                name="options-outline"
                size={11}
                color={filtersOpen ? colors.onActive : colors.textFaint}
              />
              <Text variant="sectionLabel" color={filtersOpen ? 'onActive' : 'textFaint'}>
                Filters
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push('/find-for-me')} style={styles.findBtn}>
              <Text variant="caption" color="textBody" style={styles.findBtnText}>
                ✦ Find for me
              </Text>
            </Pressable>
          </View>
        </View>

        {filtersOpen ? (
          <View style={styles.filters}>
            {FILTERS.map((f) => (
              <Chip key={f} label={f} active={active.includes(f)} onPress={() => toggleFilter(f)} />
            ))}
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textFaint} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text variant="small" color="textBody">
            Couldn't load restaurants.
          </Text>
        </View>
      ) : view === 'List' ? (
        <ScrollView
          style={styles.listBg}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="sectionLabel" color="textLabel">
            {filtered.length} results · {areaLabel}
          </Text>
          {filtered.map((r) => (
            <RestaurantListItem
              key={r.id}
              name={r.name}
              cuisine={r.cuisine ?? ''}
              area={r.area ?? ''}
              city={r.city ?? ''}
              priceLevel={r.price_level as 1 | 2 | 3 | 4 | null}
              tags={r.tags.slice(0, 2)}
              onPress={() => router.push(`/restaurant/${r.id}`)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.mapWrap}>
          <View style={styles.map}>
            {pins.map((pin) => (
              <Pressable
                key={pin.id}
                onPress={() => router.push(`/restaurant/${pin.id}`)}
                style={[styles.pin, { left: pin.x, top: pin.y } as never]}
              >
                <Text variant="micro" color="onActive">
                  {pin.label}
                </Text>
              </Pressable>
            ))}
            <Text variant="micro" color="textFaint" style={styles.mapNote}>
              Interactive map · tap pins
            </Text>
          </View>
          <View style={styles.mapBar}>
            <Text variant="small" color="textFaint">
              {filtered.length} results nearby
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
    gap: space[2],
    borderBottomWidth: borderWidth,
    borderBottomColor: gray[200],
  },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bg,
    paddingVertical: 6,
    paddingHorizontal: space[2],
  },
  filterBtnActive: { backgroundColor: colors.bgActive, borderColor: colors.bgActive },
  findBtn: {
    borderWidth,
    borderColor: colors.textBody,
    backgroundColor: colors.bg,
    paddingVertical: 6,
    paddingHorizontal: space[2],
  },
  findBtnText: { fontWeight: '700' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listBg: { backgroundColor: colors.bgSubtle },
  list: { paddingHorizontal: space[4], paddingVertical: space[3], paddingBottom: space[8], gap: space[2] },

  mapWrap: { flex: 1, padding: space[4], gap: space[3] },
  map: { flex: 1, backgroundColor: gray[200], borderWidth, borderColor: colors.borderStrong },
  pin: {
    position: 'absolute',
    backgroundColor: colors.textBody,
    paddingHorizontal: space[1],
    paddingVertical: 2,
  },
  mapNote: { position: 'absolute', right: space[2], bottom: space[2] },
  mapBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
