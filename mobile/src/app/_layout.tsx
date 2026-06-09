import '@/global.css';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/shared/store/auth';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { isLoggedIn, initialize } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize().finally(() => setReady(true));
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
