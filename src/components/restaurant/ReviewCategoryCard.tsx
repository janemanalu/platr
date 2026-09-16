import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text, Thumbnail } from '@/components/ui';
import { space } from '@/theme';

export type ReviewCategoryCardProps = {
  label: string;
  /** Average 0–10 score. Omitted for Tales (not a rated dimension). */
  score?: number;
  previewText: string;
  by: string;
  /** The featured review's photo, if it has one. */
  photoUrl?: string | null;
  onSeeAll: () => void;
};

/** One category (Food / Vibe / Tales) on Restaurant Detail: label + avg score, a
 *  preview line, the reviewer, and a link to every review in that category. */
export function ReviewCategoryCard({ label, score, previewText, by, photoUrl, onSeeAll }: ReviewCategoryCardProps) {
  return (
    <Card padding={3} style={styles.card}>
      <View style={styles.row}>
        {photoUrl ? <Thumbnail uri={photoUrl} size={40} /> : null}
        <View style={styles.body}>
          <View style={styles.head}>
            <Text variant="caption" color="textLabel" style={styles.label}>
              {label}
            </Text>
            {score != null ? (
              <Text variant="bodyStrong" color="textStrong">
                {score.toFixed(1)}/10
              </Text>
            ) : null}
          </View>
          <Text variant="body" color="textMuted">
            {previewText}
          </Text>
          <Text variant="caption" color="textFaint">
            by {by}
          </Text>
        </View>
      </View>
      <Pressable onPress={onSeeAll} hitSlop={8} style={styles.link}>
        <Text variant="link" color="textFaint">
          See all reviews
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space[2] },
  row: { flexDirection: 'row', gap: space[3] },
  body: { flex: 1, gap: space[2] },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  label: { textTransform: 'uppercase', letterSpacing: 0.6 },
  link: { alignSelf: 'flex-start' },
});

export default ReviewCategoryCard;
