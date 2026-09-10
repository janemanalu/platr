import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/theme';

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
          No Figma node — minimal screen. Account, privacy defaults, and edit
          profile land here later.
        </Text>

        <View style={styles.section}>
          <Text variant="sectionLabel" color="textLabel">
            Account
          </Text>
          <Text variant="body" color="textMuted">
            {session?.user.email ?? 'Not signed in'}
          </Text>
        </View>

        <Button label="Sign out" variant="secondary" onPress={() => supabase.auth.signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingTop: space[2] },
  body: { gap: space[3], paddingVertical: space[4] },
  section: { gap: space[1], paddingTop: space[2] },
});
