import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, Package, Truck, User } from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';

export default function TabsLayout() {
  const { isLoggedIn, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/(auth)/login');
  }, [isLoggedIn]);

  const isSender = role === 'sender';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#004561',
          borderTopColor: '#1ea4dc',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#08b4fb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      {/* Home (sender) / Jobs (courier) */}
      <Tabs.Screen
        name="index"
        options={{
          title: isSender ? 'Ana Sayfa' : 'İşler',
          tabBarIcon: ({ color, size }) =>
            isSender ? <Home size={size} color={color} /> : <Truck size={size} color={color} />,
        }}
      />

      {/* Deliveries — sender only */}
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Teslimatlar',
          href: isSender ? undefined : null,
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />

      {/* Profile — both roles */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
