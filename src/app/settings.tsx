import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { currentUser } from '@/lib/placeholder';
import { supabase } from '@/lib/supabase';
import { borderWidth, colors, space } from '@/theme';

const ROWS = [
  { label: 'Edit profile', hint: 'Name, username, avatar, location' },
  { label: 'Privacy defaults', hint: 'Which sections are public for new lists' },
  { label: 'Notifications', hint: 'Not set up yet' },
  { label: 'About Platr', hint: 'Version 0.1.0 — wireframe build' },
];

export default function Settings() {
  const router = useRouter();
  const { session } = useAuth();

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        <Text variant="small" color="textFaint">
          Back
        </Text>
      </Pressable>

      <View style={styles.body}>
        <Text variant="h1" color="text">
          Settings
        </Text>
        <Text variant="small" color="textFaint">
          No Figma node — minimal screen for this pass.
        </Text>

        <View style={styles.section}>
          <Text variant="sectionLabel" color="textLabel">
            Account
          </Text>
          <Card>
            <Text variant="bodyStrong" color="textStrong">
              {currentUser.full_name}
            </Text>
            <Text variant="caption" color="textLabel">
              {session?.user.email ?? '@' + currentUser.username}
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="sectionLabel" color="textLabel">
            Preferences
          </Text>
          <Card padding={0}>
            {ROWS.map((r, i) => (
              <View key={r.label} style={[styles.row, i < ROWS.length - 1 && styles.rowDivider]}>
                <View style={styles.rowText}>
                  <Text variant="body" color="textBody">
                    {r.label}
                  </Text>
                  <Text variant="caption" color="textDisabled">
                    {r.hint}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
              </View>
            ))}
          </Card>
        </View>

        <Button label="Sign out" variant="secondary" fullWidth onPress={() => supabase.auth.signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingTop: space[2] },
  body: { gap: space[4], paddingVertical: space[4] },
  section: { gap: space[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space[3],
  },
  rowDivider: { borderBottomWidth: borderWidth, borderBottomColor: colors.dividerFaint },
  rowText: { gap: 2 },
});
