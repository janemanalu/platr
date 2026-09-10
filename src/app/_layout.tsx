import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root layout. The full navigation tree (tabs + stacks matching the Figma flow)
 * lands in the navigation-structure step; for now this is a plain headerless stack.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
