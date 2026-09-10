import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingSlider } from '@/components/log/RatingSlider';
import { Button, Chip, SearchField, Text } from '@/components/ui';
import { friends, restaurants, tagOptions } from '@/lib/placeholder';
import { borderWidth, colors, fontFamily, space, type as typeScale } from '@/theme';
import type { LogStatus } from '@/lib/database.types';

const STATUSES: { key: LogStatus; label: string }[] = [
  { key: 'visited', label: 'Visited' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'blacklisted', label: 'Blacklisted' },
  { key: 'go_to', label: 'Go-To' },
];

export default function LogAVisit() {
  const router = useRouter();
  const { restaurantId } = useLocalSearchParams<{ restaurantId?: string }>();
  const prefilled = restaurantId ? restaurants[restaurantId]?.name : undefined;

  const [restaurantQuery, setRestaurantQuery] = useState(prefilled ?? '');
  const [food, setFood] = useState(7);
  const [vibe, setVibe] = useState(6.5);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<LogStatus>('visited');
  const [friendQuery, setFriendQuery] = useState('');
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState('');

  const friendMatches = useMemo(() => {
    const q = friendQuery.trim().toLowerCase();
    if (!q) return [];
    return friends.filter((f) => f.name.toLowerCase().includes(q) || f.username.includes(q));
  }, [friendQuery]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        </Pressable>
        <Text variant="sectionLabel" color="textBody">
          Log a Visit
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Field label="Restaurant">
            <SearchField
              placeholder="Search or select…"
              value={restaurantQuery}
              onChangeText={setRestaurantQuery}
            />
          </Field>

          <Field label="Ratings — 0 to 10 (0.5 steps)">
            <View style={{ gap: space[4] }}>
              <RatingSlider label="Food" value={food} onChange={setFood} />
              <RatingSlider label="Vibe" value={vibe} onChange={setVibe} />
            </View>
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
            <Pressable style={styles.upload}>
              <Ionicons name="arrow-up" size={18} color={colors.textDisabled} />
              <Text variant="caption" color="textDisabled">
                Tap to upload
              </Text>
            </Pressable>
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
                      {f.name}
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
                  const f = friends.find((x) => x.id === id)!;
                  return (
                    <Chip
                      key={id}
                      label={f.name}
                      active
                      onPress={() => toggle(taggedFriends, setTaggedFriends, id)}
                    />
                  );
                })}
              </View>
            ) : null}
          </Field>

          <Field label="Tags" hint="Fixed list — no custom tags">
            <Pressable onPress={() => setTagsOpen((o) => !o)} style={styles.select}>
              <Text variant="body" color={tags.length ? 'textBody' : 'textDisabled'}>
                {tags.length ? `${tags.length} selected` : 'Select tags…'}
              </Text>
              <Ionicons name={tagsOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textDisabled} />
            </Pressable>
            {tagsOpen ? (
              <View style={styles.chipWrap}>
                {tagOptions.map((t) => (
                  <Chip key={t} label={t} active={tags.includes(t)} onPress={() => toggle(tags, setTags, t)} />
                ))}
              </View>
            ) : tags.length ? (
              <View style={styles.chipWrap}>
                {tags.map((t) => (
                  <Chip key={t} label={t} active onPress={() => toggle(tags, setTags, t)} />
                ))}
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

          <Button label="Save Entry" fullWidth onPress={() => router.back()} style={styles.save} />
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

  save: { marginTop: space[2] },
});
