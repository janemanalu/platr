import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/system/ErrorBoundary';
import { AuthProvider, useAuth } from '@/lib/auth';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { session, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) SplashScreen.hideAsync().catch(() => {});
  }, [initializing]);

  // Dev escape hatch: set EXPO_PUBLIC_DEV_SKIP_AUTH=1 in .env to walk the app
  // without signing in. Never true in a release build.
  const skipAuth = __DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === '1';
  const signedIn = !!session || skipAuth;

  // The Stack (and its NavigationContainer) stays mounted from the very first
  // render — including while `initializing` is still resolving — so a deep
  // link opened cold has a single, stable navigator to land in instead of one
  // that gets torn down and rebuilt once the session check finishes. The
  // native splash screen (above) covers the screen for that brief window.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="restaurant/[id]" />
        <Stack.Screen name="reviews/[restaurantId]" />
        <Stack.Screen name="list/[id]" />
        <Stack.Screen name="user/[id]" />
        <Stack.Screen name="find-for-me" />
        <Stack.Screen name="post/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack.Protected>

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ErrorBoundary>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
