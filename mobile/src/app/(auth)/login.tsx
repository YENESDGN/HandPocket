import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return;
    clearError();
    try {
      await signIn(email.trim(), password);
    } catch {
      // error state set in store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-darker-blue"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo */}
          <View className="items-center mb-10">
            <Text className="text-primary-blue text-5xl font-bold">HP</Text>
            <Text className="text-white text-lg mt-1 tracking-widest">HandPocket</Text>
          </View>

          {/* Card */}
          <View className="bg-dark-blue rounded-2xl px-6 py-8">
            <Text className="text-white text-2xl font-semibold mb-6">Giriş Yap</Text>

            {error ? (
              <View className="bg-red-500/20 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-300 text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View className="flex-row items-center bg-darker-blue/60 rounded-xl px-4 mb-4 h-12 border border-white/10">
              <Mail size={18} color="#08b4fb" />
              <TextInput
                className="flex-1 text-white ml-3 text-base"
                placeholder="E-posta"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Password */}
            <View className="flex-row items-center bg-darker-blue/60 rounded-xl px-4 mb-3 h-12 border border-white/10">
              <Lock size={18} color="#08b4fb" />
              <TextInput
                className="flex-1 text-white ml-3 text-base"
                placeholder="Parola"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              className="self-end mb-6"
            >
              <Text className="text-primary-blue text-sm">Şifremi unuttum</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary-blue rounded-xl h-12 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Giriş Yap</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400">Hesabın yok mu? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-primary-blue font-semibold">Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
