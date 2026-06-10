import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Calculator, Package } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeColors } from '@/shared/store/theme';
import { createTask } from '@/shared/api/services/taskService';
import { supabase } from '@/shared/api/supabase';

const MULTIPLIERS = [
  { label: 'Normal', value: 1.0 },
  { label: 'Acil', value: 1.5 },
  { label: 'Çok Acil', value: 2.0 },
];

interface CalcResult {
  distance_km: number;
  estimated_time_mins: number;
  price: number;
}

async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'HandPocketMobile/1.0' } });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

async function getRoute(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): Promise<{ distance_km: number; duration_min: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    return {
      distance_km: data.routes[0].distance / 1000,
      duration_min: Math.round(data.routes[0].duration / 60),
    };
  } catch {
    return null;
  }
}

export default function CreateDeliveryScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const C = useThemeColors();

  const [description, setDescription] = useState('');
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [weight, setWeight] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canCalculate =
    description.trim().length > 0 &&
    pickup.trim().length > 0 &&
    delivery.trim().length > 0 &&
    parseFloat(weight) > 0;

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri iznine ihtiyaç var.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.75,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setPhotoUri(uri);

    // Best-effort upload to Supabase Storage
    try {
      const resp = await fetch(uri);
      const blob = await resp.blob();
      const filename = `temp-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('delivery-proofs')
        .upload(filename, blob, { contentType: 'image/jpeg', upsert: true });
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('delivery-proofs')
          .getPublicUrl(data.path);
        setPhotoUrl(publicUrl);
      }
    } catch {
      // Upload failed — continue without photo URL
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setCalcResult(null);
    try {
      const [fromCoords, toCoords] = await Promise.all([geocode(pickup), geocode(delivery)]);
      if (!fromCoords) {
        Alert.alert('Adres Bulunamadı', `Alış adresi bulunamadı: "${pickup}"`);
        return;
      }
      if (!toCoords) {
        Alert.alert('Adres Bulunamadı', `Teslimat adresi bulunamadı: "${delivery}"`);
        return;
      }
      const route = await getRoute(fromCoords, toCoords);
      if (!route) {
        Alert.alert('Rota Hesaplanamadı', 'İki adres arasında rota bulunamadı.');
        return;
      }
      const kg = parseFloat(weight);
      const price = route.distance_km * kg * multiplier;
      setCalcResult({
        distance_km: route.distance_km,
        estimated_time_mins: route.duration_min,
        price,
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async () => {
    if (!calcResult) return;
    const balance = user?.wallet_balance ?? 0;
    if (balance < calcResult.price) {
      Alert.alert(
        'Yetersiz Bakiye',
        `Bakiyeniz (₺${balance.toFixed(2)}) bu teslimat için yeterli değil (₺${calcResult.price.toFixed(2)}).`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Bakiye Yükle', onPress: () => router.push('/wallet') },
        ],
      );
      return;
    }
    setSubmitting(true);
    try {
      const task = await createTask({
        package_description: description.trim(),
        pickup_address: pickup.trim(),
        delivery_address: delivery.trim(),
        weight_kg: parseFloat(weight),
        open_time_multiplier: multiplier,
        distance_km: calcResult.distance_km,
        estimated_time_mins: calcResult.estimated_time_mins,
        calculated_price: calcResult.price,
        package_photo_url: photoUrl,
      });
      await refreshUser();
      router.replace(`/delivery/${task.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Teslimat oluşturulamadı.';
      Alert.alert('Hata', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: C.text,
    fontSize: 15,
  } as const;

  return (
    <ImageBackground
      source={require('../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color={C.primary} />
          </TouchableOpacity>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold' }}>Teslimat Oluştur</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          {/* Description */}
          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 6 }}>Kargo Açıklaması *</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ne gönderiyorsunuz?"
            placeholderTextColor={C.textDim}
            autoCorrect={false}
            autoCapitalize="sentences"
            style={inputStyle}
          />

          {/* Pickup */}
          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 6, marginTop: 14 }}>Alış Adresi *</Text>
          <TextInput
            value={pickup}
            onChangeText={(t) => { setPickup(t); setCalcResult(null); }}
            placeholder="Ör: Kadıköy, İstanbul"
            placeholderTextColor={C.textDim}
            autoCorrect={false}
            autoCapitalize="words"
            style={inputStyle}
          />

          {/* Delivery */}
          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 6, marginTop: 14 }}>Teslimat Adresi *</Text>
          <TextInput
            value={delivery}
            onChangeText={(t) => { setDelivery(t); setCalcResult(null); }}
            placeholder="Ör: Beşiktaş, İstanbul"
            placeholderTextColor={C.textDim}
            autoCorrect={false}
            autoCapitalize="words"
            style={inputStyle}
          />

          {/* Weight */}
          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 6, marginTop: 14 }}>Ağırlık (kg) *</Text>
          <TextInput
            value={weight}
            onChangeText={(t) => { setWeight(t); setCalcResult(null); }}
            placeholder="Ör: 2.5"
            placeholderTextColor={C.textDim}
            keyboardType="decimal-pad"
            style={inputStyle}
          />

          {/* Priority */}
          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 8, marginTop: 14 }}>Öncelik</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
            {MULTIPLIERS.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => { setMultiplier(m.value); setCalcResult(null); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: multiplier === m.value ? C.primary : C.border,
                  backgroundColor: multiplier === m.value ? `${C.primary}20` : C.card,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: multiplier === m.value ? C.primary : C.textMuted, fontWeight: '600', fontSize: 13 }}>
                  {m.label}
                </Text>
                <Text style={{ color: multiplier === m.value ? C.primary : C.textDim, fontSize: 11, marginTop: 2 }}>
                  ×{m.value.toFixed(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Photo */}
          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 8, marginTop: 14 }}>Paket Fotoğrafı (opsiyonel)</Text>
          <TouchableOpacity
            onPress={handlePickPhoto}
            style={{
              backgroundColor: C.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: photoUri ? C.primary : C.borderDim,
              borderStyle: 'dashed',
              paddingVertical: 18,
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Camera size={22} color={photoUri ? C.primary : C.textDim} />
            <Text style={{ color: photoUri ? C.primary : C.textDim, fontSize: 13 }}>
              {photoUri ? 'Fotoğraf seçildi ✓' : 'Fotoğraf Seç'}
            </Text>
          </TouchableOpacity>

          {/* Calculate */}
          <TouchableOpacity
            onPress={handleCalculate}
            disabled={!canCalculate || calculating}
            style={{
              backgroundColor: canCalculate ? C.card : C.cardInner,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: canCalculate ? C.primary : C.borderDim,
              paddingVertical: 14,
              marginTop: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: canCalculate ? 1 : 0.5,
            }}
          >
            {calculating ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <Calculator size={18} color={C.primary} />
            )}
            <Text style={{ color: C.primary, fontWeight: '600' }}>
              {calculating ? 'Hesaplanıyor...' : 'Fiyat Hesapla'}
            </Text>
          </TouchableOpacity>

          {/* Price result */}
          {calcResult && (
            <View
              style={{
                backgroundColor: C.card,
                borderRadius: 16,
                padding: 16,
                marginTop: 16,
                borderWidth: 1,
                borderColor: `${C.primary}40`,
              }}
            >
              <Text style={{ color: C.textMuted, fontSize: 12, marginBottom: 10 }}>Hesaplama Sonucu</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: C.textMuted }}>Mesafe</Text>
                <Text style={{ color: C.text }}>{calcResult.distance_km.toFixed(1)} km</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: C.textMuted }}>Tahmini Süre</Text>
                <Text style={{ color: C.text }}>{calcResult.estimated_time_mins} dk</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: C.textMuted }}>Ağırlık</Text>
                <Text style={{ color: C.text }}>{weight} kg</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: C.textMuted }}>Öncelik Çarpanı</Text>
                <Text style={{ color: C.text }}>×{multiplier.toFixed(1)}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: `${C.primary}30`, marginVertical: 8 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: C.text, fontWeight: 'bold', fontSize: 15 }}>Toplam Ücret</Text>
                <Text style={{ color: C.primary, fontWeight: 'bold', fontSize: 18 }}>
                  ₺{calcResult.price.toFixed(2)}
                </Text>
              </View>
              {(user?.wallet_balance ?? 0) < calcResult.price && (
                <Text style={{ color: '#f87171', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                  ⚠ Bakiyeniz yetersiz (₺{(user?.wallet_balance ?? 0).toFixed(2)})
                </Text>
              )}
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!calcResult || submitting}
            style={{
              backgroundColor: calcResult ? C.primary : C.card,
              borderRadius: 14,
              paddingVertical: 16,
              marginTop: 16,
              marginBottom: 32,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: calcResult && !submitting ? 1 : 0.5,
            }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Package size={18} color="white" />
            )}
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {submitting ? 'Oluşturuluyor...' : 'Teslimat Oluştur'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
