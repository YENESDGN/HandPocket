import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User } from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';

// Phase E will replace this with the full profile screen.
export default function ProfileScreen() {
  const { user, role, signOut } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-darker-blue">
      <View className="flex-1 px-6 py-8">
        {/* Avatar placeholder */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-dark-blue items-center justify-center mb-3 border-2 border-primary-blue">
            <User size={36} color="#08b4fb" />
          </View>
          <Text className="text-white text-xl font-semibold">{user?.full_name}</Text>
          <Text className="text-gray-400 text-sm mt-1">{user?.email}</Text>
          <View className="mt-2 bg-primary-blue/20 rounded-full px-4 py-1">
            <Text className="text-primary-blue text-xs font-medium capitalize">{role}</Text>
          </View>
        </View>

        {/* Info card */}
        <View className="bg-dark-blue rounded-2xl px-5 py-4 mb-6">
          <View className="flex-row justify-between py-3 border-b border-white/10">
            <Text className="text-gray-400">Bakiye</Text>
            <Text className="text-white font-semibold">₺{user?.wallet_balance?.toFixed(2) ?? '0.00'}</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-white/10">
            <Text className="text-gray-400">Puan</Text>
            <Text className="text-white font-semibold">
              {user?.average_rating ? user.average_rating.toFixed(1) : '—'}
            </Text>
          </View>
          <View className="flex-row justify-between py-3">
            <Text className="text-gray-400">Telefon</Text>
            <Text className="text-white">{user?.phone_number ?? '—'}</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={signOut}
          className="flex-row items-center justify-center bg-red-500/15 border border-red-500/30 rounded-xl h-12 gap-2"
        >
          <LogOut size={18} color="#f87171" />
          <Text className="text-red-400 font-semibold">Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
