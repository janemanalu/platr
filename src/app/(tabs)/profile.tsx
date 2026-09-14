import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GalleryGrid } from '@/components/profile/GalleryGrid';
import { PrivacyToggle } from '@/components/profile/PrivacyToggle';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileListSection } from '@/components/profile/ProfileListSection';
import { Button, SearchField, SegmentedToggle, Text } from '@/components/ui';
import { useFollowStats } from '@/hooks/useFollowStats';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useMyProfile } from '@/hooks/useProfile';
import { useSetStatusPrivacy, useStatusPrivacy } from '@/hooks/useStatusPrivacy';
import { useProfileSections } from '@/hooks/useUserLogs';
import { useUserId } from '@/lib/auth';
import type { LogStatus } from '@/lib/database.types';
import { borderWidth, colors, fontFamily, space, type as typeScale } from '@/theme';

const VIS = ['Public', 'Private'] as const;

const SECTIONS: { status: LogStatus; label: string }[] = [
  { status: 'go_to', label: 'Go-To' },
  { status: 'visited', label: 'Visited' },
  { status: 'wishlist', label: 'Wishlist' },
  { status: 'blacklisted', label: 'Blacklisted' },
];

export default function Profile() {
  const router = useRouter();
  const userId = useUserId();
  const openRestaurant = (id: string) => router.push(`/restaurant/${id}`);

  const profile = useMyProfile();
  const stats = useFollowStats(userId);
  const sections = useProfileSections(userId);
  const privacy = useStatusPrivacy(userId);
  const setPrivacy = useSetStatusPrivacy(userId);
  const gallery = useGalleryPhotos(userId);

  const [createOpen, setCreateOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [listVis, setListVis] = useState<(typeof VIS)[number]>('Private');
  const [addQuery, setAddQuery] = useState('');

  if (profile.isLoading || sections.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textFaint} />
        </View>
      </SafeAreaView>
    );
  }

  const byStatus = { go_to: sections.goTo, visited: sections.visited, wishlist: sections.wishlist, blacklisted: sections.blacklisted };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={profile.data?.display_name ?? '—'}
          username={profile.data?.username ?? ''}
          area={profile.data?.area ?? undefined}
          city={profile.data?.city ?? undefined}
          avatarUrl={profile.data?.avatar_url}
          stats={{ logged: stats.data?.logged ?? 0, following: stats.data?.following ?? 0, followers: stats.data?.followers ?? 0 }}
        />

        <View style={styles.sections}>
          {SECTIONS.map((s) => {
            const logs = byStatus[s.status];
            return (
              <ProfileListSection
                key={s.status}
                label={s.label}
                items={logs.slice(0, 2).map((l) => l.restaurant)}
                total={logs.length}
                isPublic={privacy.data?.[s.status] ?? false}
                onTogglePrivacy={(next) => setPrivacy.mutate({ status: s.status, isPublic: next })}
                onOpenRestaurant={openRestaurant}
                onSeeAll={() => router.push(`/list/${s.status.replace('_', '-')}?variant=list-rows`)}
              />
            );
          })}
        </View>

        <View style={styles.createBlock}>
          <Pressable onPress={() => setCreateOpen((o) => !o)} style={styles.createHeader}>
            <Text variant="bodyStrong" color="textBody">
              + Create a list
            </Text>
            <Ionicons name={createOpen ? 'remove' : 'add'} size={16} color={colors.textFaint} />
          </Pressable>

          {createOpen ? (
            <View style={styles.createForm}>
              <Text variant="caption" color="textDisabled">
                Custom lists aren't wired to save yet — tracked on the build checklist.
              </Text>
              <Field label="List name">
                <TextInputStyled value={listName} onChangeText={setListName} placeholder="e.g. Best Brunch Spots" />
              </Field>
              <Field label="Visibility">
                <SegmentedToggle options={VIS} value={listVis} onChange={setListVis} />
              </Field>
              <Field label="Add restaurants">
                <SearchField
                  placeholder="Search or select from logged places…"
                  value={addQuery}
                  onChangeText={setAddQuery}
                />
              </Field>
              <Button
                label="Save List"
                fullWidth
                disabled={!listName.trim()}
                onPress={() => {
                  setCreateOpen(false);
                  setListName('');
                  setAddQuery('');
                }}
              />
            </View>
          ) : null}
        </View>

        {/* Gallery */}
        <View style={styles.sections}>
          <View style={styles.galleryHead}>
            <Text variant="sectionLabel" color="textLabel">
              Gallery
            </Text>
            <View style={styles.galleryHeadRight}>
              <Text variant="caption" color="textDisabled">
                {gallery.data?.length ?? 0} photos
              </Text>
            </View>
          </View>
          {gallery.data && gallery.data.length > 0 ? (
            <>
              <GalleryGrid
                photos={gallery.data.map((p) => ({ id: p.id, logId: p.logId }))}
                limit={6}
                onOpen={(logId) => router.push(`/restaurant/${logId}`)}
              />
              <Text variant="caption" color="textDisabled">
                Tap any photo → opens that log entry
              </Text>
              <Text variant="link" color="textFaint" onPress={() => router.push('/list/gallery?variant=gallery')}>
                See all ({gallery.data.length})
              </Text>
            </>
          ) : (
            <Text variant="caption" color="textDisabled">
              No photos yet — Log a Visit with a photo to fill this in. (Photo upload isn't wired yet.)
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text variant="sectionLabel" color="textLabel">
        {label}
      </Text>
      {children}
    </View>
  );
}

function TextInputStyled(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} style={styles.input} placeholderTextColor={colors.textDisabled} autoCapitalize="sentences" />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: space[4], paddingBottom: space[8], gap: space[5] },

  sections: { gap: space[4] },

  createBlock: { borderWidth, borderColor: colors.border },
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space[3],
  },
  createForm: {
    padding: space[3],
    paddingTop: 0,
    gap: space[3],
    borderTopWidth: borderWidth,
    borderTopColor: colors.divider,
  },
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

  galleryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  galleryHeadRight: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
