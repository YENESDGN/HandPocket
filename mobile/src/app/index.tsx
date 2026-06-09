import { ActivityIndicator, View } from 'react-native';

// Root layout calls initialize() and redirects to (auth)/login or (tabs) before this renders.
export default function IndexFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#004561' }}>
      <ActivityIndicator size="large" color="#08b4fb" />
    </View>
  );
}
