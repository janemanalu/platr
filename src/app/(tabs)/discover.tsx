import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantMap } from '@/components/map/RestaurantMap';
import { RestaurantListItem } from '@/components/restaurant/RestaurantListItem';
import { Chip, SearchField, SegmentedToggle, Text } from '@/components/ui';
import { useLivePlaceSearch } from '@/hooks/useLivePlaceSearch';
import { useMyProfile } from '@/hooks/useProfile';
import { useRestaurants } from '@/hooks/useRestaurants';
import { JAKARTA_CENTER } from '@/lib/geo';
import { upsertRestaurantFromPlace } from '@/lib/restaurants';
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
  const [linkingPlaceId, setLinkingPlaceId] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

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

  // Real places from Google, for whatever's typed — not limited to what's
  // already in our catalog. Same find-or-create pattern as Log a Visit.
  const knownPlaceIds = useMemo(
    () => new Set((restaurants ?? []).map((r) => r.google_place_id).filter((id): id is string => !!id)),
    [restaurants],
  );
  const liveSearch = useLivePlaceSearch(query, JAKARTA_CENTER);
  const liveResults = useMemo(
    () => (liveSearch.data ?? []).filter((p) => !knownPlaceIds.has(p.googlePlaceId)),
    [liveSearch.data, knownPlaceIds],
  );

  async function handleSelectLivePlace(place: (typeof liveResults)[number]) {
    setLinkError(null);
    setLinkingPlaceId(place.googlePlaceId);
    try {
      const restaurant = await upsertRestaurantFromPlace(place);
      router.push(`/restaurant/${restaurant.id}`);
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : 'Could not add this place');
    } finally {
      setLinkingPlaceId(null);
    }
  }

  const areaLabel = profile.data?.area ? `${profile.data.area} area` : 'nearby';

  const pins = useMemo(
    () =>
      filtered
        .filter((r) => r.lat != null && r.lng != null)
        .map((r) => ({ id: r.id, label: initials(r.name), lat: r.lat!, lng: r.lng! })),
    [filtered],
  );

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
          {filtered.length === 0 && (query.trim() || active.length > 0) ? (
            <View style={styles.noMatches}>
              <Text variant="body" color="textMuted">
                No matches
              </Text>
              <Text
                variant="link"
                color="textFaint"
                onPress={() => {
                  setQuery('');
                  setActive([]);
                }}
              >
                Clear filters
              </Text>
            </View>
          ) : (
            filtered.map((r) => (
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
            ))
          )}

          {query.trim().length >= 2 ? (
            <View style={styles.liveSection}>
              <Text variant="sectionLabel" color="textLabel">
                More from Google
              </Text>
              {liveSearch.isFetching ? (
                <ActivityIndicator color={colors.textFaint} style={styles.liveLoading} />
              ) : liveResults.length === 0 ? (
                <Text variant="caption" color="textDisabled">
                  No other real places found for "{query.trim()}".
                </Text>
              ) : (
                liveResults.map((p) => (
                  <RestaurantListItem
                    key={p.googlePlaceId}
                    name={p.name}
                    cuisine={p.cuisine ?? ''}
                    area={p.area ?? ''}
                    city={p.city ?? ''}
                    priceLevel={p.priceLevel}
                    onPress={() => {
                      if (!linkingPlaceId) handleSelectLivePlace(p);
                    }}
                  />
                ))
              )}
              {linkingPlaceId ? (
                <Text variant="caption" color="textFaint">
                  Adding to Platr…
                </Text>
              ) : linkError ? (
                <Text variant="caption" color="textBody">
                  {linkError}
                </Text>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.mapWrap}>
          <View style={styles.map}>
            <RestaurantMap pins={pins} onPressPin={(id) => router.push(`/restaurant/${id}`)} />
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
  liveSection: { gap: space[2], paddingTop: space[3] },
  liveLoading: { paddingVertical: space[3] },
  noMatches: { alignItems: 'center', gap: space[2], paddingVertical: space[6] },

  mapWrap: { flex: 1, padding: space[4], gap: space[3] },
  map: { flex: 1, backgroundColor: gray[200], borderWidth, borderColor: colors.borderStrong, overflow: 'hidden' },
  mapBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
