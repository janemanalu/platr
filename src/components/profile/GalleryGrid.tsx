import { Pressable, StyleSheet, View } from 'react-native';

import { Thumbnail } from '@/components/ui';

export type GalleryGridProps = {
  photos: { id: string; logId: string; uri?: string | null }[];
  /** Cap the number shown (e.g. 6 for a profile preview). */
  limit?: number;
  columns?: number;
  /** logId of the tapped tile, plus its index in the full (unlimited) photos list. */
  onOpen: (logId: string, index: number) => void;
};

/** Square photo grid. Profile preview + List Detail "gallery" variant. */
export function GalleryGrid({ photos, limit, columns = 3, onOpen }: GalleryGridProps) {
  const shown = limit ? photos.slice(0, limit) : photos;
  const width = `${100 / columns}%` as const;
  return (
    <View style={styles.grid}>
      {shown.map((p, i) => (
        <View key={p.id} style={[styles.cell, { width }]}>
          <Pressable onPress={() => onOpen(p.logId, i)}>
            <Thumbnail uri={p.uri} fill aspectRatio={1} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { padding: 2 },
});

export default GalleryGrid;
