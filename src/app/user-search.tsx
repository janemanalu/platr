import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, SearchField, Text } from '@/components/ui';
import { useIsFollowing, useToggleFollow } from '@/hooks/useFollowing';
import { useSearchProfiles } from '@/hooks/useSearchProfiles';
import { goBack } from '@/lib/nav';
import type { Profile } from '@/lib/database.types';
import { borderWidth, colors, space } from '@/theme';

/** Search real users by name/username, follow inline, tap row → their profile. */
export default function UserSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const results = useSearchProfiles(query);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack(router, '/social')} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        </Pressable>
        <Text variant="title" color="textStrong">
          Find People
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.searchWrap}>
        <SearchField placeholder="Search by name or username…" value={query} onChangeText={setQuery} autoFocus />
      </View>

      {results.isFetching ? (
        <ActivityIndicator color={colors.textFaint} style={styles.loading} />
      ) : query.trim().length < 2 ? (
        <Text variant="caption" color="textDisabled" style={styles.hint}>
          Type at least 2 characters to search.
        </Text>
      ) : results.data && results.data.length > 0 ? (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {results.data.map((p) => (
            <ResultRow key={p.id} profile={p} onPress={() => router.push(`/user/${p.id}`)} />
          ))}
        </ScrollView>
      ) : (
        <Text variant="caption" color="textDisabled" style={styles.hint}>
          No one matches "{query.trim()}".
        </Text>
      )}
    </SafeAreaView>
  );
}

function ResultRow({ profile, onPress }: { profile: Profile; onPress: () => void }) {
  const following = useIsFollowing(profile.id);
  const toggle = useToggleFollow(profile.id);
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.avatar}>
        <Text variant="small" color="textLabel">
          {profile.display_name?.[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <Text variant="bodyStrong" color="textStrong" numberOfLines={1}>
          {profile.display_name}
        </Text>
        <Text variant="caption" color="textFaint" numberOfLines={1}>
          @{profile.username}
        </Text>
      </View>
      <Button
        label={following.data ? 'Following' : 'Follow'}
        size="sm"
        variant={following.data ? 'secondary' : 'primary'}
        loading={toggle.isPending}
        onPress={() => toggle.mutate(!following.data)}
      />
    </Pressable>
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
  headerBtn: { width: 24, alignItems: 'flex-start' },

  searchWrap: { paddingHorizontal: space[4], paddingTop: space[3] },
  loading: { paddingTop: space[6] },
  hint: { paddingHorizontal: space[4], paddingTop: space[5], textAlign: 'center' },

  list: { paddingHorizontal: space[4], paddingVertical: space[3], gap: space[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    borderWidth,
    borderColor: colors.border,
    padding: space[3],
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgSunken,
    borderWidth,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
});
