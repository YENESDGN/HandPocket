import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/shared/store/auth';

// Phase C will replace this with the full sender Home / courier Jobs screen.
export default function HomeScreen() {
  const { user, role } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-darker-blue">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-primary-blue text-4xl font-bold mb-2">HP</Text>
        <Text className="text-white text-xl font-semibold mb-1">
          Hoş geldin, {user?.full_name ?? ''}
        </Text>
        <Text className="text-gray-400 text-sm capitalize">{role}</Text>
      </View>
    </SafeAreaView>
  );
}
