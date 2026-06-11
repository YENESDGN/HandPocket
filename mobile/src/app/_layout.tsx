import '@/global.css';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import Constants from 'expo-constants';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeStore } from '@/shared/store/theme';

// expo-notifications throws at require() in Expo Go since SDK 53 — skip entirely.
const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

type Unsub = { remove: () => void } | null;

async function setupNotifications(onTap: (id: string) => void): Promise<() => void> {
  if (IS_EXPO_GO) return () => {};
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const N = require('expo-notifications');
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('default', {
      name: 'Genel Bildirimler',
      importance: N.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#08b4fb',
    });
  }
  const s1: Unsub = N.addNotificationReceivedListener(() => {});
  const s2: Unsub = N.addNotificationResponseReceivedListener(
    (response: { notification: { request: { content: { data: Record<string, unknown> } } } }) => {
      const id = response.notification.request.content.data?.request_id as string | undefined;
      if (id) onTap(id);
    },
  );
  return () => { s1?.remove(); s2?.remove(); };
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { isLoggedIn, initialize } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const cleanup = useRef<() => void>(() => {});

  console.log('[HP] RootLayout render, ready=', ready);

  useEffect(() => {
    console.log('[HP] RootLayout mount effect START');
    const { loadSaved } = useThemeStore.getState();

    // Hard safety: never let the splash hang — show the app within 6s no matter what.
    const safety = setTimeout(() => { console.log('[HP] safety fired'); setReady(true); }, 6000);

    setupNotifications((id) => router.push(`/delivery/${id}` as never))
      .then((fn) => { cleanup.current = fn; })
      .catch(() => {});

    Promise.all([loadSaved(), initialize()])
      .catch(() => {})
      .finally(() => { clearTimeout(safety); setReady(true); });

    return () => { clearTimeout(safety); cleanup.current(); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    if (!isLoggedIn && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuth) {
      router.replace('/(tabs)');
    }
  }, [ready, isLoggedIn, segments]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#004561' }}>
        <ActivityIndicator size="large" color="#08b4fb" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
