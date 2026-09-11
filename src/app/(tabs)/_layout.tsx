import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius } from '@/theme';

/**
 * Center "+" in the tab bar — not a tab, opens the Log a Visit modal. Raised
 * above the bar (a true floating action button) rather than sitting inline
 * with the icon+label tabs: inline, its bare circle had no label to balance
 * against its neighbors and read as an odd, cramped fifth tab.
 */
function LogFab() {
  const router = useRouter();
  return (
    <View style={styles.fabSlot} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log a visit"
        onPress={() => router.push('/log')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={26} color={colors.textStrong} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textStrong,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.borderStrong, borderTopWidth: borderWidth },
        tabBarLabelStyle: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="discover"
        options={{ title: 'Discover', tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen name="new" options={{ title: '', tabBarButton: () => <LogFab /> }} />
      <Tabs.Screen
        name="social"
        options={{ title: 'Social', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabSlot: { flex: 1, alignItems: 'center' },
  fab: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  fabPressed: { opacity: 0.5, backgroundColor: colors.bgSubtle },
});
