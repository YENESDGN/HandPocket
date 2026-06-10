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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark } = useThemeStore();
  const router = useRouter();
  const A = isDark ? DARK : LIGHT;

  const handleSend = async () => {
    if (!email.trim()) { setError('E-posta adresi gerekli.'); return; }
    setLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: A.bg }}
    >
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}
        >
          <ArrowLeft size={20} color={A.primary} />
          <Text style={{ color: A.primary, marginLeft: 8, fontSize: 15 }}>Geri</Text>
        </TouchableOpacity>

        <View style={{ backgroundColor: A.card, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 32 }}>
          {sent ? (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <CheckCircle size={52} color={A.primary} />
              <Text style={{ color: A.text, fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
                E-posta Gönderildi
              </Text>
              <Text style={{ color: A.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
                Şifre sıfırlama bağlantısı{'\n'}{email}{'\n'}adresine gönderildi.
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={{ marginTop: 32, backgroundColor: A.primary, borderRadius: 12, height: 50, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Giriş Sayfasına Dön</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={{ color: A.text, fontSize: 22, fontWeight: '600', marginBottom: 8 }}>Şifremi Unuttum</Text>
              <Text style={{ color: A.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 20 }}>
                E-posta adresinizi girin, sıfırlama bağlantısı göndereceğiz.
              </Text>

              {error ? (
                <View style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 }}>
                  <Text style={{ color: '#dc2626', fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: A.inputBg, borderRadius: 12, paddingHorizontal: 16, marginBottom: 24, height: 50, borderWidth: 1, borderColor: A.border }}>
                <Mail size={18} color={A.primary} />
                <TextInput
                  style={{ flex: 1, color: A.text, marginLeft: 12, fontSize: 15 }}
                  placeholder="E-posta" placeholderTextColor={A.textDim}
                  value={email} onChangeText={setEmail}
                  autoCapitalize="none" keyboardType="email-address" autoComplete="email"
                />
              </View>

              <TouchableOpacity
                onPress={handleSend} disabled={loading}
                style={{ backgroundColor: A.primary, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' }}
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>Gönder</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
