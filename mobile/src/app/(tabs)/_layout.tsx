import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Home, Package, Truck, User } from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeColors } from '@/shared/store/theme';
import NotificationBell from '@/shared/ui/NotificationBell';

export default function TabsLayout() {
  const { isLoggedIn, role } = useAuthStore();
  const router = useRouter();
  const C = useThemeColors();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/(auth)/login');
  }, [isLoggedIn]);

  const isSender = role === 'sender';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: C.tabBar },
        headerTitleStyle: { color: C.text, fontWeight: '600' },
        headerRight: () => (
          <View style={{ marginRight: 8 }}>
            <NotificationBell />
          </View>
        ),
        tabBarStyle: {
          backgroundColor: C.tabBar,
          borderTopColor: C.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textDim,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isSender ? 'Ana Sayfa' : 'İşler',
          tabBarIcon: ({ color, size }) =>
            isSender ? <Home size={size} color={color} /> : <Truck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Teslimatlar',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
