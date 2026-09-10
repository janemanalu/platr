import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TagGroup } from '@/components/restaurant/TagGroup';
import { Button, Text, Thumbnail } from '@/components/ui';
import { PRICE, restaurantDetail } from '@/lib/placeholder';
import { borderWidth, colors, space } from '@/theme';

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

          <Section
            label="Reviews"
            action="See all reviews →"
            onAction={() => router.push(`/list/${r.id}?variant=reviews`)}
          >
            <View style={styles.reviews}>
              {r.reviews.map((rev) => (
                <View key={rev.dimension} style={styles.review}>
                  <Text variant="caption" color="textLabel" style={styles.reviewDim}>
                    {rev.dimension}
                  </Text>
                  <Text variant="body" color="textDisabled">
                    {rev.text}
                  </Text>
                  <Text variant="caption" color="textFaint">
                    by {rev.by}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button label="+ Log a Visit" fullWidth onPress={() => router.push(`/log?restaurantId=${r.id}`)} />
      </View>
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

  reviews: { gap: space[4] },
  review: { gap: space[1], borderLeftWidth: borderWidth, borderLeftColor: colors.border, paddingLeft: space[3] },
  reviewDim: { textTransform: 'uppercase', letterSpacing: 0.6 },

  cta: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    borderTopWidth: borderWidth,
    borderTopColor: colors.divider,
  },
});
