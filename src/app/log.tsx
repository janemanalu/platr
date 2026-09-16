import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingSlider } from '@/components/log/RatingSlider';
import { PlaceSearchField } from '@/components/restaurant/PlaceSearchField';
import { RestaurantPreviewCard } from '@/components/restaurant/RestaurantPreviewCard';
import { Button, Chip, SearchField, Text, Thumbnail } from '@/components/ui';
import { useFollowing } from '@/hooks/useFollowing';
import { useRestaurant } from '@/hooks/useRestaurants';
import { useSaveVisit } from '@/hooks/useSaveVisit';
import { useTags } from '@/hooks/useTags';
import { useUserId } from '@/lib/auth';
import type { LogStatus, Restaurant } from '@/lib/database.types';
import type { PlaceDetails } from '@/lib/googlePlaces';
import { goBack } from '@/lib/nav';
import { upsertRestaurantFromPlace } from '@/lib/restaurants';
import { groupByCategory } from '@/lib/tags';
import { borderWidth, colors, fontFamily, space, type as typeScale } from '@/theme';

const STATUSES: { key: LogStatus; label: string }[] = [
  { key: 'visited', label: 'Visited' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'blacklisted', label: 'Blacklisted' },
  { key: 'go_to', label: 'Go-To' },
];

/** Statuses that imply an actual visit — the only ones a rating makes sense for. */
const RATED_STATUSES: LogStatus[] = ['visited', 'go_to'];

const MAX_TAGS = 5;

export default function LogAVisit() {
  const router = useRouter();
  const userId = useUserId();
  const { restaurantId: prefilledId } = useLocalSearchParams<{ restaurantId?: string }>();
  const prefilledRestaurant = useRestaurant(prefilledId);
  const following = useFollowing(userId);
  const allTags = useTags();
  const saveVisit = useSaveVisit();

  const [restaurantQuery, setRestaurantQuery] = useState('');
  const [resolvedRestaurant, setResolvedRestaurant] = useState<Restaurant | null>(null);
  const resolvedRestaurantId = resolvedRestaurant?.id ?? null;
  const [linkingPlace, setLinkingPlace] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [food, setFood] = useState(7);
  const [vibe, setVibe] = useState(6.5);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [status, setStatus] = useState<LogStatus>('visited');
  const [friendQuery, setFriendQuery] = useState('');
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fill in the restaurant name + preview once it resolves (deep-linked from Restaurant Detail).
  useEffect(() => {
    if (prefilledRestaurant.data && !restaurantQuery) {
      setRestaurantQuery(prefilledRestaurant.data.name);
      setResolvedRestaurant(prefilledRestaurant.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledRestaurant.data]);

  const tagGroups = useMemo(() => groupByCategory(allTags.data ?? []), [allTags.data]);

  const friendMatches = useMemo(() => {
    const q = friendQuery.trim().toLowerCase();
    if (!q || !following.data) return [];
    return following.data.filter(
      (f) => f.display_name.toLowerCase().includes(q) || f.username.includes(q),
    );
  }, [friendQuery, following.data]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function handleSelectPlace(details: PlaceDetails) {
    setResolvedRestaurant(null);
    setPlaceError(null);
    setLinkingPlace(true);
    try {
      const restaurant = await upsertRestaurantFromPlace(details);
      setResolvedRestaurant(restaurant);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : 'Could not save this place');
    } finally {
      setLinkingPlace(false);
    }
  }

  async function pickFromLibrary() {
    setPhotoError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setPhotoError('Enable photo access in Settings to attach a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  }

  async function pickFromCamera() {
    setPhotoError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setPhotoError('Enable camera access in Settings to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  }

  function handlePickPhoto() {
    Alert.alert('Add a photo', undefined, [
      { text: 'Take Photo', onPress: pickFromCamera },
      { text: 'Choose from Library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleSave() {
    if (!resolvedRestaurantId) {
      setSaveError('Pick a restaurant first.');
      return;
    }
    setSaveError(null);
    const rated = RATED_STATUSES.includes(status);
    saveVisit.mutate(
      {
        restaurantId: resolvedRestaurantId,
        status,
        foodRating: rated ? food : undefined,
        vibeRating: rated ? vibe : undefined,
        notes,
        photoUri,
        tagIds,
        friendIds: taggedFriends,
        suggestion,
      },
      {
        onSuccess: () => goBack(router, '/'),
        onError: (e) => setSaveError(e instanceof Error ? e.message : 'Could not save this entry'),
      },
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack(router, '/')} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        </Pressable>
        <Text variant="modalTitle" color="textStrong">
          Log a Visit
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Field label="Restaurant">
            <PlaceSearchField
              value={restaurantQuery}
              onChangeText={(t) => {
                setRestaurantQuery(t);
                setResolvedRestaurant(null);
                setPlaceError(null);
              }}
              onSelect={handleSelectPlace}
            />
            {linkingPlace ? (
              <Text variant="caption" color="textFaint">
                Adding to Platr…
              </Text>
            ) : resolvedRestaurant ? (
              <RestaurantPreviewCard
                name={resolvedRestaurant.name}
                cuisine={resolvedRestaurant.cuisine}
                area={resolvedRestaurant.area}
                city={resolvedRestaurant.city}
                priceLevel={resolvedRestaurant.price_level}
                photoUri={resolvedRestaurant.cover_photo_url}
              />
            ) : placeError ? (
              <Text variant="caption" color="textBody">
                {placeError}
              </Text>
            ) : null}
          </Field>

          <Field label="Ratings — 0 to 10 (0.5 steps)">
            <View style={{ gap: space[4] }}>
              <RatingSlider label="Food" value={food} onChange={setFood} />
              <RatingSlider label="Vibe" value={vibe} onChange={setVibe} />
            </View>
            {!RATED_STATUSES.includes(status) ? (
              <Text variant="caption" color="textDisabled">
                Ratings save once you mark this Visited or Go-To.
              </Text>
            ) : null}
          </Field>

          <Field label="Quick notes">
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="What stood out? The story…"
              placeholderTextColor={colors.textDisabled}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </Field>

          <Field label="Photo">
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Thumbnail uri={photoUri} fill aspectRatio={4 / 3} />
                <View style={styles.photoActions}>
                  <Text variant="link" color="textFaint" onPress={handlePickPhoto}>
                    Change photo
                  </Text>
                  <Text variant="link" color="textFaint" onPress={() => setPhotoUri(null)}>
                    Remove
                  </Text>
                </View>
              </View>
            ) : (
              <Pressable style={styles.upload} onPress={handlePickPhoto}>
                <Ionicons name="arrow-up" size={18} color={colors.textDisabled} />
                <Text variant="caption" color="textDisabled">
                  Tap to upload
                </Text>
              </Pressable>
            )}
            {photoError ? (
              <Text variant="caption" color="textBody">
                {photoError}
              </Text>
            ) : null}
          </Field>

          <Field label="Status">
            <View style={styles.statusGrid}>
              {STATUSES.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setStatus(s.key)}
                  style={[styles.statusBtn, status === s.key && styles.statusBtnActive]}
                >
                  <Text variant="small" color={status === s.key ? 'onActive' : 'textMuted'}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Tag friends" hint="Anyone you follow">
            <SearchField
              placeholder="Search friends to tag…"
              value={friendQuery}
              onChangeText={setFriendQuery}
            />
            {friendMatches.length > 0 ? (
              <View style={styles.friendResults}>
                {friendMatches.map((f) => (
                  <Pressable
                    key={f.id}
                    onPress={() => {
                      toggle(taggedFriends, setTaggedFriends, f.id);
                      setFriendQuery('');
                    }}
                    style={styles.friendRow}
                  >
                    <Text variant="small" color="textBody">
                      {f.display_name}
                    </Text>
                    <Text variant="caption" color="textDisabled">
                      @{f.username}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {taggedFriends.length > 0 ? (
              <View style={styles.chipWrap}>
                {taggedFriends.map((id) => {
                  const f = following.data?.find((x) => x.id === id);
                  if (!f) return null;
                  return (
                    <Chip
                      key={id}
                      label={f.display_name}
                      active
                      onPress={() => toggle(taggedFriends, setTaggedFriends, id)}
                    />
                  );
                })}
              </View>
            ) : null}
          </Field>

          <Field
            label={`Tags (${tagIds.length}/${MAX_TAGS} selected)`}
            hint="Fixed list — no custom tags"
          >
            <Pressable onPress={() => setTagsOpen((o) => !o)} style={styles.select}>
              <Text variant="body" color={tagIds.length ? 'textBody' : 'textDisabled'}>
                {tagIds.length ? `${tagIds.length} selected` : 'Select tags…'}
              </Text>
              <Ionicons name={tagsOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textDisabled} />
            </Pressable>
            {tagsOpen ? (
              <View style={styles.tagGroups}>
                {tagGroups.map((g) => (
                  <View key={g.category} style={styles.tagGroup}>
                    <Text variant="sectionLabel" color="textLabel">
                      {g.label}
                    </Text>
                    <View style={styles.chipWrap}>
                      {g.items.map((t) => {
                        const active = tagIds.includes(t.id);
                        const limitReached = !active && tagIds.length >= MAX_TAGS;
                        return (
                          <Chip
                            key={t.id}
                            label={t.label}
                            active={active}
                            disabled={limitReached}
                            onPress={() => toggle(tagIds, setTagIds, t.id)}
                          />
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ) : tagIds.length ? (
              <View style={styles.chipWrap}>
                {tagIds.map((id) => {
                  const t = allTags.data?.find((x) => x.id === id);
                  if (!t) return null;
                  return <Chip key={id} label={t.label} active onPress={() => toggle(tagIds, setTagIds, id)} />;
                })}
              </View>
            ) : null}
          </Field>

          <Field label="Suggestion / complaint" hint="Sent anonymously — never shown publicly">
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Anonymous note to the restaurant…"
              placeholderTextColor={colors.textDisabled}
              multiline
              value={suggestion}
              onChangeText={setSuggestion}
            />
          </Field>

          {saveError ? (
            <Text variant="small" color="textBody">
              {saveError}
            </Text>
          ) : null}

          <Button
            label="Save Entry"
            fullWidth
            loading={saveVisit.isPending}
            disabled={!resolvedRestaurantId}
            onPress={handleSave}
            style={styles.save}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text variant="sectionLabel" color="textLabel">
        {label}
      </Text>
      {children}
      {hint ? (
        <Text variant="caption" color="textDisabled">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.divider,
  },
  headerBtn: { width: 24, alignItems: 'flex-start' },

  scroll: { paddingHorizontal: space[4], paddingVertical: space[4], paddingBottom: space[10], gap: space[5] },
  field: { gap: space[2] },

  input: {
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    color: colors.textBody,
    fontFamily,
    fontSize: typeScale.body.fontSize,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },

  upload: {
    borderWidth,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    paddingVertical: space[6],
    alignItems: 'center',
    gap: space[1],
  },
  photoPreview: { gap: space[2] },
  photoActions: { flexDirection: 'row', gap: space[3] },

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  statusBtn: {
    width: '48%',
    borderWidth,
    borderColor: colors.border,
    paddingVertical: space[3],
    alignItems: 'center',
  },
  statusBtnActive: { backgroundColor: colors.bgActive, borderColor: colors.bgActive },

  friendResults: { borderWidth, borderColor: colors.border },
  friendRow: {
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.dividerFaint,
    gap: 2,
  },

  select: {
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  tagGroups: { gap: space[3] },
  tagGroup: { gap: space[2] },

  save: { marginTop: space[2] },
});
