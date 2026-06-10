import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  User,
  LogOut,
  Edit2,
  Wallet,
  Moon,
  Sun,
  Trash2,
  Check,
  X,
  Camera,
} from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeColors, useThemeStore } from '@/shared/store/theme';
import { supabase } from '@/shared/api/supabase';

export default function ProfileScreen() {
  const { user, role, signOut, updateProfile, deleteAccount, setAvatarUrl } = useAuthStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const C = useThemeColors();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone_number ?? '');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile(name.trim(), phone.trim() || undefined);
      setEditing(false);
    } catch {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async () => {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;

    try {
      const ext = uri.split('.').pop() ?? 'jpg';
      const path = `avatars/${user.id}.${ext}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        setAvatarUrl(data.publicUrl);
        return;
      }
    } catch {}
    setAvatarUrl(uri);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch {
      Alert.alert('Hata', 'Hesap silinemedi.');
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <Text style={{ color: C.text, fontSize: 26, fontWeight: 'bold' }}>Profil</Text>
          <TouchableOpacity
            onPress={toggleTheme}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}
          >
            {isDark ? <Sun size={18} color={C.primary} /> : <Moon size={18} color={C.primary} />}
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={handleAvatar} style={{ position: 'relative', marginBottom: 12 }}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: C.primary }}
              />
            ) : (
              <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.card, borderWidth: 2, borderColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                <User size={40} color={C.primary} />
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: C.primary, borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: C.text, fontSize: 20, fontWeight: '700' }}>{user?.full_name}</Text>
          <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>{user?.email}</Text>
          <View style={{ marginTop: 8, backgroundColor: 'rgba(8,180,251,0.15)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4 }}>
            <Text style={{ color: C.primary, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>{role}</Text>
          </View>
        </View>

        {/* Stats card */}
        <View style={{ backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ color: C.textMuted, fontSize: 14 }}>Bakiye</Text>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>₺{user?.wallet_balance?.toFixed(2) ?? '0.00'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ color: C.textMuted, fontSize: 14 }}>Puan</Text>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>{user?.average_rating ? user.average_rating.toFixed(1) : '—'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 }}>
            <Text style={{ color: C.textMuted, fontSize: 14 }}>Telefon</Text>
            <Text style={{ color: C.text, fontSize: 14 }}>{user?.phone_number || '—'}</Text>
          </View>
        </View>

        {/* Action rows */}
        <TouchableOpacity
          onPress={() => router.push('/wallet')}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 10 }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(8,180,251,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Wallet size={18} color={C.primary} />
          </View>
          <Text style={{ color: C.text, fontWeight: '600', flex: 1, fontSize: 15 }}>Cüzdan</Text>
          <Text style={{ color: C.textMuted, fontSize: 13 }}>₺{user?.wallet_balance?.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setName(user?.full_name ?? ''); setPhone(user?.phone_number ?? ''); setEditing(true); }}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 28 }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(8,180,251,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Edit2 size={18} color={C.primary} />
          </View>
          <Text style={{ color: C.text, fontWeight: '600', flex: 1, fontSize: 15 }}>Profili Düzenle</Text>
        </TouchableOpacity>

        {/* Danger zone */}
        <TouchableOpacity
          onPress={signOut}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 14, paddingVertical: 14, marginBottom: 12, gap: 8 }}
        >
          <LogOut size={18} color="#f87171" />
          <Text style={{ color: '#f87171', fontWeight: '700', fontSize: 15 }}>Çıkış Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDelete(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 }}
        >
          <Trash2 size={15} color={C.textDim} />
          <Text style={{ color: C.textDim, fontSize: 13 }}>Hesabı Sil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={editing} animationType="slide" transparent onRequestClose={() => setEditing(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 44 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold' }}>Profili Düzenle</Text>
              <TouchableOpacity onPress={() => setEditing(false)}><X size={22} color={C.textMuted} /></TouchableOpacity>
            </View>
            <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 6 }}>Ad Soyad</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={{ backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, height: 50, color: C.text, fontSize: 15, marginBottom: 16 }}
              placeholderTextColor={C.textDim}
              placeholder="Ad Soyad"
            />
            <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 6 }}>Telefon</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={{ backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, height: 50, color: C.text, fontSize: 15, marginBottom: 24 }}
              placeholderTextColor={C.textDim}
              placeholder="+90 5xx xxx xx xx"
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{ backgroundColor: C.primary, borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center' }}
            >
              {saving ? <ActivityIndicator color="white" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Check size={18} color="white" />
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Kaydet</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal visible={showDelete} animationType="fade" transparent onRequestClose={() => setShowDelete(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: C.bg, borderRadius: 20, padding: 28 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 60, height: 60, backgroundColor: 'rgba(239,68,68,0.18)', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Trash2 size={26} color="#f87171" />
              </View>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold' }}>Hesabı Sil</Text>
              <Text style={{ color: C.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                Bu işlem geri alınamaz.{'\n'}Tüm verileriniz kalıcı olarak silinecek.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setShowDelete(false)} style={{ flex: 1, backgroundColor: C.card, borderRadius: 12, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.text, fontWeight: '600' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} disabled={deleting} style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 12, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                {deleting ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: 'white', fontWeight: '700' }}>Sil</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}
