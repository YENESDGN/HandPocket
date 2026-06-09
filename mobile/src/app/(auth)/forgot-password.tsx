import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react-native';
import { supabase } from '@/shared/api/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSend = async () => {
    if (!email.trim()) { setError('E-posta adresi gerekli.'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-darker-blue px-6"
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center mt-14 mb-8"
      >
        <ArrowLeft size={20} color="#08b4fb" />
        <Text className="text-primary-blue ml-2 text-base">Geri</Text>
      </TouchableOpacity>

      <View className="bg-dark-blue rounded-2xl px-6 py-8">
        {sent ? (
          <View className="items-center py-4">
            <CheckCircle size={52} color="#08b4fb" />
            <Text className="text-white text-xl font-semibold mt-4 mb-2 text-center">
              E-posta Gönderildi
            </Text>
            <Text className="text-gray-400 text-center text-sm leading-5">
              Şifre sıfırlama bağlantısı{'\n'}{email}{'\n'}adresine gönderildi.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              className="mt-8 bg-primary-blue rounded-xl h-12 px-8 items-center justify-center"
            >
              <Text className="text-white font-semibold">Giriş Sayfasına Dön</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="text-white text-2xl font-semibold mb-2">Şifremi Unuttum</Text>
            <Text className="text-gray-400 text-sm mb-6 leading-5">
              E-posta adresinizi girin, sıfırlama bağlantısı göndereceğiz.
            </Text>

            {error ? (
              <View className="bg-red-500/20 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-300 text-sm">{error}</Text>
              </View>
            ) : null}

            <View className="flex-row items-center bg-darker-blue/60 rounded-xl px-4 mb-6 h-12 border border-white/10">
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

            <TouchableOpacity
              onPress={handleSend}
              disabled={loading}
              className="bg-primary-blue rounded-xl h-12 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Gönder</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
