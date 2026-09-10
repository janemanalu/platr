import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Pressable, View, StyleSheet } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { colors, space } from '@/theme';

type Route = { href: string; label: string };

/**
 * Placeholder for a not-yet-built screen. Shows the screen name, its Figma node,
 * and any outgoing links so the navigation graph is walkable before the real
 * screens land. Delete usages as each screen is implemented.
 */
export function ScreenStub({
  name,
  figmaNode,
  note,
  links = [],
}: {
  name: string;
  figmaNode?: string;
  note?: string;
  links?: Route[];
}) {
  const router = useRouter();

  return (
    <Screen scroll>
      {router.canGoBack() ? (
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
          <Text variant="small" color="textFaint">
            Back
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.body}>
        <Text variant="caption" color="textLabel">
          screen stub
        </Text>
        <Text variant="h1" color="text">
          {name}
        </Text>
        {figmaNode ? (
          <Text variant="small" color="textFaint">
            Figma {figmaNode}
          </Text>
        ) : null}
        {note ? (
          <Text variant="body" color="textMuted">
            {note}
          </Text>
        ) : null}

        {links.length > 0 ? (
          <View style={styles.links}>
            <Text variant="sectionLabel" color="textLabel">
              Goes to
            </Text>
            {links.map((l) => (
              <Link key={l.href} href={l.href as never} style={styles.link}>
                <Text variant="link" color="textFaint">
                  {l.label}
                </Text>
              </Link>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    paddingTop: space[2],
  },
  body: { gap: space[2], paddingVertical: space[4] },
  links: { gap: space[2], paddingTop: space[4] },
  link: { paddingVertical: space[1] },
});

export default ScreenStub;
