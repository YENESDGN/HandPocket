import '@/global.css';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeStore } from '@/shared/store/theme';

// Show notification banner while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Genel Bildirimler',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#08b4fb',
    });
  }
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { isLoggedIn, initialize } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    setupNotificationChannel();

    const { loadSaved } = useThemeStore.getState();
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 6000));
    Promise.all([loadSaved(), Promise.race([initialize(), timeout])]).finally(() => setReady(true));

    // Foreground notification received — banner is shown by the handler above
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    // Notification tap → navigate to the relevant delivery
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      const requestId = data?.request_id as string | undefined;
      if (requestId) {
        router.push(`/delivery/${requestId}` as never);
      }
    });

    // expo-router already handles handpocket:// scheme deep links automatically
    // via the scheme configured in app.json — no manual Linking handler needed

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
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
