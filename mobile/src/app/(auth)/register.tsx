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
import { Lock, Mail, User } from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';

type Role = 'sender' | 'courier';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<Role>('sender');
  const [localError, setLocalError] = useState('');
  const { signUp, loading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    setLocalError('');
    clearError();
    if (!fullName || !email || !password) {
      setLocalError('Tüm alanları doldurun.');
      return;
    }
    if (email !== emailConfirm) {
      setLocalError('E-postalar eşleşmiyor.');
      return;
    }
    if (password !== passwordConfirm) {
      setLocalError('Parolalar eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Parola en az 6 karakter olmalı.');
      return;
    }
    try {
      await signUp(email.trim(), password, fullName.trim(), role);
    } catch {
      // error state set in store
    }
  };

  const displayError = localError || error;

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
          <View className="items-center mb-8">
            <Text className="text-primary-blue text-5xl font-bold">HP</Text>
            <Text className="text-white text-lg mt-1 tracking-widest">HandPocket</Text>
          </View>

          {/* Card */}
          <View className="bg-dark-blue rounded-2xl px-6 py-8">
            <Text className="text-white text-2xl font-semibold mb-6">Kayıt Ol</Text>

            {displayError ? (
              <View className="bg-red-500/20 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-300 text-sm">{displayError}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <View className="flex-row items-center bg-darker-blue/60 rounded-xl px-4 mb-3 h-12 border border-white/10">
              <User size={18} color="#08b4fb" />
              <TextInput
                className="flex-1 text-white ml-3 text-base"
                placeholder="Ad Soyad"
                placeholderTextColor="#6b7280"
                value={fullName}
                onChangeText={setFullName}
                autoComplete="name"
              />
            </View>

            {/* Email */}
            <View className="flex-row items-center bg-darker-blue/60 rounded-xl px-4 mb-3 h-12 border border-white/10">
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

            {/* Email Confirm */}
            <View className="flex-row items-center bg-darker-blue/60 rounded-xl px-4 mb-3 h-12 border border-white/10">
              <Mail size={18} color="#6b7280" />
              <TextInput
                className="flex-1 text-white ml-3 text-base"
                placeholder="E-posta Tekrar"
                placeholderTextColor="#6b7280"
                value={emailConfirm}
                onChangeText={setEmailConfirm}
                autoCapitalize="none"
                keyboardType="email-address"
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
                autoComplete="new-password"
              />
            </View>

            {/* Password Confirm */}
            <View className="flex-row items-center bg-darker-blue/60 rounded-xl px-4 mb-5 h-12 border border-white/10">
              <Lock size={18} color="#6b7280" />
              <TextInput
                className="flex-1 text-white ml-3 text-base"
                placeholder="Parola Tekrar"
                placeholderTextColor="#6b7280"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
              />
            </View>

            {/* Role Selector */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={() => setRole('sender')}
                className={`flex-1 h-11 rounded-xl items-center justify-center border ${
                  role === 'sender'
                    ? 'bg-primary-blue border-primary-blue'
                    : 'bg-darker-blue/60 border-white/10'
                }`}
              >
                <Text className="text-white font-semibold">Gönderici</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('courier')}
                className={`flex-1 h-11 rounded-xl items-center justify-center border ${
                  role === 'courier'
                    ? 'bg-primary-blue border-primary-blue'
                    : 'bg-darker-blue/60 border-white/10'
                }`}
              >
                <Text className="text-white font-semibold">Kurye</Text>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="bg-primary-blue rounded-xl h-12 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400">Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-primary-blue font-semibold">Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
