import { useState } from 'react';
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
import { Lock, Mail, User } from 'lucide-react-native';
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
  const { isDark } = useThemeStore();
  const router = useRouter();
  const A = isDark ? DARK : LIGHT;

  const handleRegister = async () => {
    setLocalError(''); clearError();
    if (!fullName || !email || !password) { setLocalError('Tüm alanları doldurun.'); return; }
    if (email !== emailConfirm) { setLocalError('E-postalar eşleşmiyor.'); return; }
    if (password !== passwordConfirm) { setLocalError('Parolalar eşleşmiyor.'); return; }
    if (password.length < 6) { setLocalError('Parola en az 6 karakter olmalı.'); return; }
    try { await signUp(email.trim(), password, fullName.trim(), role); } catch {}
  };

  const displayError = localError || error;
  const inputRow = { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: A.inputBg, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, height: 50, borderWidth: 1, borderColor: A.border };
  const inputText = { flex: 1, color: A.text, marginLeft: 12, fontSize: 15 } as const;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: A.bg }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 20 }}>
          <Image
            source={require('../../../assets/images/favicon.png')}
            style={{ width: 52, height: 52 }}
            resizeMode="contain"
          />
          <Text style={{ color: A.text, fontSize: 14, marginTop: 4, letterSpacing: 4, fontWeight: '600' }}>HandPocket</Text>
        </View>

        {/* Form card */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 48 }}>
          <View style={{ backgroundColor: A.card, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 28 }}>
            <Text style={{ color: A.text, fontSize: 22, fontWeight: '600', marginBottom: 20 }}>Kayıt Ol</Text>

            {displayError ? (
              <View style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 }}>
                <Text style={{ color: '#dc2626', fontSize: 13 }}>{displayError}</Text>
              </View>
            ) : null}

            <View style={inputRow}>
              <User size={18} color={A.primary} />
              <TextInput style={inputText} placeholder="Ad Soyad" placeholderTextColor={A.textDim} value={fullName} onChangeText={setFullName} autoComplete="name" />
            </View>
            <View style={inputRow}>
              <Mail size={18} color={A.primary} />
              <TextInput style={inputText} placeholder="E-posta" placeholderTextColor={A.textDim} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            </View>
            <View style={inputRow}>
              <Mail size={18} color={A.textDim} />
              <TextInput style={inputText} placeholder="E-posta Tekrar" placeholderTextColor={A.textDim} value={emailConfirm} onChangeText={setEmailConfirm} autoCapitalize="none" keyboardType="email-address" />
            </View>
            <View style={inputRow}>
              <Lock size={18} color={A.primary} />
              <TextInput style={inputText} placeholder="Parola" placeholderTextColor={A.textDim} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
            </View>
            <View style={{ ...inputRow, marginBottom: 20 }}>
              <Lock size={18} color={A.textDim} />
              <TextInput style={inputText} placeholder="Parola Tekrar" placeholderTextColor={A.textDim} value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {(['sender', 'courier'] as Role[]).map((r) => (
                <TouchableOpacity
                  key={r} onPress={() => setRole(r)}
                  style={{ flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: role === r ? A.primary : A.inputBg, borderColor: role === r ? A.primary : A.border }}
                >
                  <Text style={{ color: role === r ? 'white' : A.textMuted, fontWeight: '600' }}>
                    {r === 'sender' ? 'Gönderici' : 'Kurye'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleRegister} disabled={loading}
              style={{ backgroundColor: A.primary, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' }}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <Text style={{ color: A.textMuted }}>Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={{ color: A.primary, fontWeight: '600' }}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
