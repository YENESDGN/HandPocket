import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, MapPin, Navigation, Package, User } from 'lucide-react-native';
import { getTaskById } from '@/shared/api/services/taskService';
import { getUserById } from '@/shared/api/services/userService';
import { getLatestLocation, type LocationPin } from '@/shared/api/services/locationService';
import { useThemeColors } from '@/shared/store/theme';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import type { DeliveryRequest, User as UserType } from '@/shared/types';

const POLL_INTERVAL_MS = 15_000;
const TERMINAL = new Set(['completed', 'cancelled', 'disputed']);
const MAP_HEIGHT = Math.round(Dimensions.get('window').height * 0.32);

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const C = useThemeColors();

  const [task, setTask] = useState<DeliveryRequest | null>(null);
  const [courier, setCourier] = useState<UserType | null>(null);
  const [location, setLocation] = useState<LocationPin | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const eta = task
    ? new Date(Date.now() + task.estimated_time_mins * 60_000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const pollLocation = async (taskId: string) => {
    try { setLocation(await getLatestLocation(taskId)); } catch {}
    try {
      const updated = await getTaskById(taskId);
      setTask(updated);
      if (TERMINAL.has(updated.status) && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch {}
  };

  useEffect(() => {
    if (!id) return;
    getTaskById(id)
      .then(async (t) => {
        setTask(t);
        if (t.courier_id) {
          try { setCourier(await getUserById(t.courier_id)); } catch {}
        }
        if (!TERMINAL.has(t.status)) {
          await pollLocation(t.id);
          intervalRef.current = setInterval(() => pollLocation(t.id), POLL_INTERVAL_MS);
        }
      })
      .catch(() => setTask(null))
      .finally(() => setLoadingTask(false));

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  if (loadingTask) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <ImageBackground
      source={require('../../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={C.primary} /></TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.textMuted }}>Teslimat bulunamadı.</Text>
        </View>
        </SafeAreaView>
    </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold', flex: 1 }}>Canlı Takip</Text>
        <StatusBadge status={task.status} size="sm" />
      </View>

      {/* Live map */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ height: MAP_HEIGHT }}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        } : {
          latitude: 41.015,
          longitude: 28.979,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Kurye"
            pinColor="#08b4fb"
          />
        )}
      </MapView>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Location */}
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MapPin size={18} color={C.primary} />
            <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700' }}>KURYE KONUMU</Text>
          </View>
          {location ? (
            <>
              <Row label="Enlem" value={location.latitude.toFixed(6)} mono C={C} />
              <Row label="Boylam" value={location.longitude.toFixed(6)} mono C={C} />
              <Row label="Güncellenme" value={new Date(location.timestamp).toLocaleTimeString('tr-TR')} C={C} />
            </>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' }} />
              <Text style={{ color: C.textMuted, fontSize: 13 }}>Kurye konumu bekleniyor...</Text>
            </View>
          )}
        </View>

        {/* ETA */}
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={18} color={C.primary} />
            <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700' }}>TESLİMAT BİLGİSİ</Text>
          </View>
          <Row label="Tahmini Varış" value={eta ?? '—'} bold C={C} />
          <Row label="Mesafe" value={`${task.distance_km.toFixed(1)} km`} C={C} />
          <Row label="Teslimat Adresi" value={task.delivery_address} C={C} />
        </View>

        {/* Courier */}
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <User size={18} color={C.primary} />
            <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700' }}>KURYE</Text>
          </View>
          {courier ? (
            <>
              <Row label="Ad" value={courier.full_name} C={C} />
              <Row label="E-Posta" value={courier.email} C={C} />
            </>
          ) : (
            <Text style={{ color: C.textMuted }}>Kurye bilgisi yükleniyor...</Text>
          )}
        </View>

        {/* Cargo */}
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Package size={18} color={C.primary} />
            <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700' }}>KARGO</Text>
          </View>
          <Row label="Açıklama" value={task.package_description} C={C} />
          <Row label="Ağırlık" value={`${task.weight_kg} kg`} C={C} />
        </View>

        <Text style={{ color: C.textDim, fontSize: 11, textAlign: 'center', marginTop: 4 }}>
          Konum 15 saniyede bir güncellenir.
        </Text>
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}

function Row({ label, value, mono, bold, C }: {
  label: string; value: string; mono?: boolean; bold?: boolean;
  C: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ color: C.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 13, fontWeight: bold ? 'bold' : '400', fontFamily: mono ? 'monospace' : undefined }}>
        {value}
      </Text>
    </View>
  );
}
