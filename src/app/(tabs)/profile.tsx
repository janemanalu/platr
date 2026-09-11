import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GalleryGrid } from '@/components/profile/GalleryGrid';
import { PrivacyToggle } from '@/components/profile/PrivacyToggle';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileListSection } from '@/components/profile/ProfileListSection';
import { Button, SearchField, SegmentedToggle, Text } from '@/components/ui';
import { currentUser, customLists, gallery, profileSections } from '@/lib/placeholder';
import { borderWidth, colors, fontFamily, space, type as typeScale } from '@/theme';

const VIS = ['Public', 'Private'] as const;

export default function Profile() {
  const router = useRouter();
  const openRestaurant = (id: string) => router.push(`/restaurant/${id}`);

  const [privacy, setPrivacy] = useState(() =>
    Object.fromEntries(profileSections.map((s) => [s.status, s.isPublic])),
  );
  const [galleryPublic, setGalleryPublic] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [listVis, setListVis] = useState<(typeof VIS)[number]>('Private');
  const [addQuery, setAddQuery] = useState('');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={currentUser.full_name}
          username={currentUser.username}
          area={currentUser.area}
          city={currentUser.city}
          avatarUrl={currentUser.avatar_url}
          stats={currentUser.stats}
        />

        <View style={styles.sections}>
          {profileSections.map((s) => (
            <ProfileListSection
              key={s.status}
              label={s.label}
              items={s.items}
              total={s.total}
              isPublic={privacy[s.status]}
              onTogglePrivacy={(next) => setPrivacy((p) => ({ ...p, [s.status]: next }))}
              onOpenRestaurant={openRestaurant}
              onSeeAll={() => router.push(`/list/${s.status.replace('_', '-')}?variant=list-rows`)}
            />
          ))}
        </View>

        {/* Custom lists + inline create form */}
        {customLists.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => router.push(`/list/${l.id}?variant=cards`)}
            style={styles.customList}
          >
            <View>
              <Text variant="bodyStrong" color="textStrong">
                {l.name}
              </Text>
              <Text variant="caption" color="textDisabled">
                {l.itemCount} places · {l.visibility}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
          </Pressable>
        ))}

        <View style={styles.createBlock}>
          <Pressable onPress={() => setCreateOpen((o) => !o)} style={styles.createHeader}>
            <Text variant="bodyStrong" color="textBody">
              + Create a list
            </Text>
            <Ionicons name={createOpen ? 'remove' : 'add'} size={16} color={colors.textFaint} />
          </Pressable>

          {createOpen ? (
            <View style={styles.createForm}>
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
                {gallery.length} photos
              </Text>
              <PrivacyToggle isPublic={galleryPublic} onToggle={setGalleryPublic} />
            </View>
          </View>
          <GalleryGrid photos={gallery} limit={6} onOpen={(logId) => router.push(`/restaurant/${logId}`)} />
          <Text variant="caption" color="textDisabled">
            Tap any photo → opens that log entry
          </Text>
          <Text variant="link" color="textFaint" onPress={() => router.push('/list/gallery?variant=gallery')}>
            See all ({gallery.length})
          </Text>
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
  scroll: { paddingHorizontal: space[4], paddingBottom: space[8], gap: space[5] },

  sections: { gap: space[4] },

  customList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth,
    borderColor: colors.border,
    padding: space[3],
  },

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
