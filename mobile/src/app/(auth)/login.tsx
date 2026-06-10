import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Fingerprint, Lock, Mail } from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeStore } from '@/shared/store/theme';

const LIGHT = {
  bg: '#e8f4fd', card: '#ffffff', inputBg: '#d0eaf8',
  primary: '#08b4fb', text: '#0c2234', textMuted: '#406683',
  textDim: '#6b8fa8', border: 'rgba(8,100,150,0.12)',
} as const;

const DARK = {
  bg: '#004561', card: '#206988', inputBg: 'rgba(0,69,97,0.6)',
  primary: '#08b4fb', text: '#ffffff', textMuted: '#9ca3af',
  textDim: '#6b7280', border: 'rgba(255,255,255,0.1)',
} as const;

const BIOMETRIC_EMAIL_KEY = 'hp_bio_email';
const BIOMETRIC_PASS_KEY = 'hp_bio_pass';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const { signIn, loading, error, clearError } = useAuthStore();
  const { isDark } = useThemeStore();
  const router = useRouter();
  const A = isDark ? DARK : LIGHT;

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const savedEmail = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
      setBiometricAvailable(compatible && enrolled && !!savedEmail);
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    clearError();
    try {
      await signIn(email.trim(), password);
      // Save credentials for future biometric login
      await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email.trim());
      await SecureStore.setItemAsync(BIOMETRIC_PASS_KEY, password);
    } catch {}
  };

  const handleBiometric = async () => {
    setBiometricLoading(true);
    clearError();
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'HandPocket\'a giriş yap',
        fallbackLabel: 'Şifre ile giriş',
        cancelLabel: 'İptal',
      });
      if (!result.success) return;

      const savedEmail = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
      const savedPass = await SecureStore.getItemAsync(BIOMETRIC_PASS_KEY);
      if (savedEmail && savedPass) {
        await signIn(savedEmail, savedPass);
      }
    } catch {} finally {
      setBiometricLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: A.bg }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={{ alignItems: 'center', paddingTop: 48, paddingBottom: 24 }}>
          <Image
            source={require('../../../assets/images/favicon.png')}
            style={{ width: 64, height: 64 }}
            resizeMode="contain"
          />
          <Text style={{ color: A.text, fontSize: 16, marginTop: 8, letterSpacing: 4, fontWeight: '600' }}>HandPocket</Text>
        </View>

        {/* Form card */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 48 }}>
          <View style={{ backgroundColor: A.card, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 32 }}>
            <Text style={{ color: A.text, fontSize: 22, fontWeight: '600', marginBottom: 24 }}>Giriş Yap</Text>

            {error ? (
              <View style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 }}>
                <Text style={{ color: '#dc2626', fontSize: 13 }}>{error}</Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: A.inputBg, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, height: 50, borderWidth: 1, borderColor: A.border }}>
              <Mail size={18} color={A.primary} />
              <TextInput
                style={{ flex: 1, color: A.text, marginLeft: 12, fontSize: 15 }}
                placeholder="E-posta" placeholderTextColor={A.textDim}
                value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address" autoComplete="email"
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: A.inputBg, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, height: 50, borderWidth: 1, borderColor: A.border }}>
              <Lock size={18} color={A.primary} />
              <TextInput
                style={{ flex: 1, color: A.text, marginLeft: 12, fontSize: 15 }}
                placeholder="Parola" placeholderTextColor={A.textDim}
                value={password} onChangeText={setPassword}
                secureTextEntry autoComplete="password"
              />
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
              <Text style={{ color: A.primary, fontSize: 13 }}>Şifremi unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin} disabled={loading}
              style={{ backgroundColor: A.primary, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' }}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            {/* Biometric login */}
            {biometricAvailable && (
              <TouchableOpacity
                onPress={handleBiometric}
                disabled={biometricLoading || loading}
                style={{ marginTop: 16, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: A.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
              >
                {biometricLoading ? (
                  <ActivityIndicator color={A.primary} size="small" />
                ) : (
                  <>
                    <Fingerprint size={20} color={A.primary} />
                    <Text style={{ color: A.primary, fontWeight: '600', fontSize: 14 }}>Biyometrik Giriş</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
              <Text style={{ color: A.textMuted }}>Hesabın yok mu? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={{ color: A.primary, fontWeight: '600' }}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
