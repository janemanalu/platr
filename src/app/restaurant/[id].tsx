import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewCategoryCard } from '@/components/restaurant/ReviewCategoryCard';
import { TagGroup } from '@/components/restaurant/TagGroup';
import { Button, Text, Thumbnail } from '@/components/ui';
import { PRICE, restaurantDetail } from '@/lib/placeholder';
import { colors, space } from '@/theme';

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const r = restaurantDetail(id);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        <Text variant="small" color="textFaint">
          Back
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Thumbnail uri={null} fill aspectRatio={2.4} />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="h2" color="text" style={styles.name}>
              {r.name}
            </Text>
            <Button label="Log a Visit" size="sm" variant="secondary" onPress={() => router.push(`/log?restaurantId=${r.id}`)} />
          </View>
          <Text variant="small" color="textFaint">
            {r.cuisine}
            {r.price_level ? ` · ${PRICE[r.price_level]}` : ''}
          </Text>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={12} color={colors.textFaint} />
            <Text variant="small" color="textMuted">
              {r.area}, {r.city}
            </Text>
          </View>

          <Section label="Tags">
            <View style={styles.tagGroups}>
              {r.tagGroups.map((g) => (
                <TagGroup key={g.label} label={g.label} tags={g.tags} />
              ))}
            </View>
          </Section>

          <Section label="About">
            <Text variant="body" color="textMuted">
              {r.about}
            </Text>
            {r.website_url ? (
              <Pressable onPress={() => Linking.openURL(r.website_url)} style={styles.website}>
                <Text variant="link" color="textFaint">
                  Visit Website ↗
                </Text>
              </Pressable>
            ) : null}
          </Section>

          <Section label="Reviews — you & friends">
            <View style={styles.reviews}>
              {r.reviews.map((rev) => (
                <ReviewCategoryCard
                  key={rev.key}
                  label={rev.label}
                  score={rev.score}
                  previewText={rev.entries[0]?.text ?? ''}
                  by={rev.entries[0]?.by ?? ''}
                  onSeeAll={() => router.push(`/reviews/${r.id}?category=${rev.key}`)}
                />
              ))}
            </View>
          </Section>

          <Button
            label="+ LOG A VISIT"
            fullWidth
            onPress={() => router.push(`/log?restaurantId=${r.id}`)}
            style={styles.cta}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  label,
  action,
  onAction,
  children,
}: {
  label: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text variant="sectionLabel" color="textLabel">
          {label}
        </Text>
        {action ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text variant="link" color="textFaint">
              {action}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[4], paddingVertical: space[2] },
  scroll: { paddingBottom: space[6] },
  body: { paddingHorizontal: space[4], paddingTop: space[4], gap: space[2] },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space[3] },
  name: { flex: 1 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },

  section: { paddingTop: space[5], gap: space[3] },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagGroups: { gap: space[3] },

  website: { alignSelf: 'flex-start', paddingVertical: space[1] },

  reviews: { gap: space[3] },

  cta: { marginTop: space[6] },
});
