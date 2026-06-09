import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Phase C will replace this with the full sender deliveries list.
export default function DeliveriesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-darker-blue">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white text-xl font-semibold mb-2">Teslimatlarım</Text>
        <Text className="text-gray-400 text-sm text-center">
          Faz C'de gönderici teslimat listesi buraya gelecek.
        </Text>
      </View>
    </SafeAreaView>
  );
}
