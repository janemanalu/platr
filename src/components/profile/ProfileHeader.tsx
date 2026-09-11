import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { borderWidth, colors, radius, space } from '@/theme';

export type ProfileHeaderProps = {
  name: string;
  username: string;
  area?: string;
  city?: string;
  avatarUrl?: string | null;
  stats: { logged: number; following: number; followers: number };
  /** e.g. ["Ravi", "Sofia"] — renders a "N mutual friends · …" line. */
  mutualFriends?: string[];
};

/** Avatar + name + handle·location + a stats line. Shared by own & other profiles. */
export function ProfileHeader({
  name,
  username,
  area,
  city,
  avatarUrl,
  stats,
  mutualFriends,
}: ProfileHeaderProps) {
  const place = [area, city].filter(Boolean).join(', ');
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={StyleSheet.absoluteFill} />
          ) : (
            <Ionicons name="person-outline" size={22} color={colors.textDisabled} />
          )}
        </View>
        <View style={styles.meta}>
          <Text variant="h2" color="text">
            {name}
          </Text>
          <Text variant="small" color="textFaint">
            @{username}
            {place ? ` · ${place}` : ''}
          </Text>
          {mutualFriends && mutualFriends.length > 0 ? (
            <Text variant="caption" color="textDisabled">
              {mutualFriends.length} mutual friends · {mutualFriends.join(', ')}
            </Text>
          ) : null}
        </View>
      </View>
      <Text variant="caption" color="textLabel">
        {stats.logged} logged · {stats.following} following · {stats.followers} followers
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[2], paddingTop: space[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    borderWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSunken,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  meta: { flex: 1, gap: 2 },
});

export default ProfileHeader;
