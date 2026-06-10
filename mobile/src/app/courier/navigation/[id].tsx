import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Camera, Clock, FolderOpen, MapPin, Navigation, Package, X } from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeColors } from '@/shared/store/theme';
import { getTaskById, setProofPhoto, updateTaskStatus } from '@/shared/api/services/taskService';
import { postLocation } from '@/shared/api/services/locationService';
import { supabase } from '@/shared/api/supabase';
import type { DeliveryRequest } from '@/shared/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────

interface OsrmStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: { type: string; modifier?: string };
}

interface Coords { lat: number; lon: number; }

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOD_MAP: Record<string, string> = {
  left: 'Sola dön', right: 'Sağa dön',
  'slight left': 'Hafif sola', 'slight right': 'Hafif sağa',
  'sharp left': 'Keskin sola dön', 'sharp right': 'Keskin sağa dön',
  straight: 'Düz devam et', uturn: 'U-dönüşü yap',
};

const buildInstruction = (step: OsrmStep): string => {
  const { type, modifier } = step.maneuver;
  if (type === 'depart') return `Hareket başlıyor${step.name ? ` — ${step.name}` : ''}`;
  if (type === 'arrive') return 'Hedefe ulaştınız';
  const base = modifier ? (MOD_MAP[modifier] ?? 'Devam et') : 'Devam et';
  return step.name ? `${base} — ${step.name}` : base;
};

const formatDist = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
const formatDur = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
};

async function geocode(address: string): Promise<Coords | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'HandPocketMobile/1.0' } });
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch { return null; }
}

async function fetchOsrmRoute(from: Coords, to: Coords) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?steps=true&overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    const route = data.routes[0];
    return {
      steps: route.legs[0].steps as OsrmStep[],
      totalDist: route.distance as number,
      totalDur: route.duration as number,
      coords: route.geometry.coordinates as [number, number][],
    };
  } catch { return null; }
}

interface MapData {
  from: Coords;
  to: Coords;
  polyline: { latitude: number; longitude: number }[];
}

// ── D-3: Proof Modal ──────────────────────────────────────────────────────────

interface ProofModalProps { visible: boolean; onCancel: () => void; onConfirm: (uri: string) => void; }

function ProofModal({ visible, onCancel, onConfirm }: ProofModalProps) {
  const C = useThemeColors();
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => { if (!visible) setUri(null); }, [visible]);

  const pickImage = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('İzin Gerekli', 'Kamera/galeri izni gerekiyor.'); return; }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.75 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.75 });
    if (!result.canceled) setUri(result.assets[0].uri);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
          <View style={{ width: 40, height: 4, backgroundColor: C.primary, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>Teslimat Kanıtı</Text>
          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>
            Paketi teslim etmeden önce fotoğraf çekin veya galeriden seçin.
          </Text>

          {uri ? (
            <View style={{ marginBottom: 20 }}>
              <Image source={{ uri }} style={{ width: '100%', height: 200, borderRadius: 16 }} resizeMode="cover" />
              <TouchableOpacity
                onPress={() => setUri(null)}
                style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: 4 }}
              >
                <X size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <TouchableOpacity onPress={() => pickImage(true)} style={{ flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 }}>
                <Camera size={28} color={C.primary} />
                <Text style={{ color: C.text, fontSize: 13 }}>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickImage(false)} style={{ flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 }}>
                <FolderOpen size={28} color={C.primary} />
                <Text style={{ color: C.text, fontSize: 13 }}>Galeri</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={onCancel} style={{ flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: C.textMuted, fontWeight: '600' }}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { if (uri) onConfirm(uri); }}
              disabled={!uri}
              style={{ flex: 2, backgroundColor: uri ? C.primary : C.card, borderRadius: 16, padding: 16, alignItems: 'center' }}
            >
              <Text style={{ color: uri ? 'white' : C.textDim, fontWeight: 'bold' }}>Teslim Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── D-2: Navigation Screen ────────────────────────────────────────────────────

export default function CourierNavigationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { refreshUser } = useAuthStore();
  const C = useThemeColors();

  const [task, setTask] = useState<DeliveryRequest | null>(null);
  const [steps, setSteps] = useState<OsrmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalDist, setTotalDist] = useState(0);
  const [totalDur, setTotalDur] = useState(0);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofVisible, setProofVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const watchRef = useRef<{ remove: () => void } | null>(null);
  const lastPostRef = useRef(0);
  const taskStatusRef = useRef('accepted');
  const taskIdRef = useRef(id ?? '');

  useEffect(() => {
    activateKeepAwakeAsync();
    return () => { deactivateKeepAwake(); };
  }, []);

  useEffect(() => {
    if (!id) return;
    taskIdRef.current = id;
    const init = async () => {
      try {
        const fetched = await getTaskById(id);
        setTask(fetched);
        taskStatusRef.current = fetched.status;
        const [from, to] = await Promise.all([
          geocode(fetched.pickup_address),
          geocode(fetched.delivery_address),
        ]);
        if (from && to) {
          const route = await fetchOsrmRoute(from, to);
          const polyline = route
            ? route.coords.map(([lon, lat]) => ({ latitude: lat, longitude: lon }))
            : [];
          if (route) {
            setSteps(route.steps);
            setTotalDist(route.totalDist);
            setTotalDur(route.totalDur);
          }
          setMapData({ from, to, polyline });
        }
      } catch { Alert.alert('Hata', 'Görev bilgileri yüklenemedi.'); }
      finally { setLoading(false); }
    };
    init();
  }, [id]);

  useEffect(() => {
    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 15 },
        ({ coords }) => {
          const now = Date.now();
          if (['accepted', 'picked_up'].includes(taskStatusRef.current) && now - lastPostRef.current >= 30_000) {
            lastPostRef.current = now;
            postLocation(taskIdRef.current, coords.latitude, coords.longitude).catch(() => {});
          }
        },
      );
    };
    start();
    return () => { watchRef.current?.remove(); };
  }, []);

  const handleCancel = useCallback(() => {
    Alert.alert('Görevi İptal Et', 'Bu görevi iptal etmek istediğinize emin misiniz?', [
      { text: 'Hayır', style: 'cancel' },
      {
        text: 'İptal Et', style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await updateTaskStatus(taskIdRef.current, 'cancelled');
            taskStatusRef.current = 'cancelled';
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            watchRef.current?.remove();
            router.replace('/(tabs)');
          } catch { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); Alert.alert('Hata', 'Görev iptal edilemedi.'); setCancelling(false); }
        },
      },
    ]);
  }, [router]);

  const handleProofConfirm = useCallback(async (uri: string) => {
    setProofVisible(false);
    setSubmitting(true);
    let proofUrl: string | undefined;
    try {
      const resp = await fetch(uri);
      const blob = await resp.blob();
      const path = `${taskIdRef.current}/proof.jpg`;
      const { data, error } = await supabase.storage
        .from('delivery-proofs')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('delivery-proofs')
          .getPublicUrl(data.path);
        proofUrl = publicUrl;
      }
    } catch {}
    try {
      if (proofUrl) await setProofPhoto(taskIdRef.current, proofUrl);
      // Must transition accepted → picked_up → delivered
      if (taskStatusRef.current === 'accepted') {
        await updateTaskStatus(taskIdRef.current, 'picked_up');
        taskStatusRef.current = 'picked_up';
      }
      await updateTaskStatus(taskIdRef.current, 'delivered');
      taskStatusRef.current = 'delivered';
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      watchRef.current?.remove();
      await refreshUser();
      router.replace('/(tabs)/profile');
    } catch { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); Alert.alert('Hata', 'Teslimat tamamlanamadı.'); setSubmitting(false); }
  }, [refreshUser, router]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={{ color: C.textMuted, marginTop: 16 }}>Rota hesaplanıyor...</Text>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#ef4444' }}>Görev bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  const currentStepData = steps[currentStep] ?? null;
  const isLastStep = currentStep >= steps.length - 1;
  const MAP_HEIGHT = Math.round(SCREEN_HEIGHT * 0.38);
  const DONE_STATUSES = new Set(['delivered', 'completed', 'cancelled', 'disputed']);
  const isDeliveryDone = DONE_STATUSES.has(task.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Map ── */}
      {mapData ? (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={{ height: MAP_HEIGHT }}
          initialRegion={{
            latitude: (mapData.from.lat + mapData.to.lat) / 2,
            longitude: (mapData.from.lon + mapData.to.lon) / 2,
            latitudeDelta: Math.abs(mapData.from.lat - mapData.to.lat) * 2 + 0.02,
            longitudeDelta: Math.abs(mapData.from.lon - mapData.to.lon) * 2 + 0.02,
          }}
        >
          {mapData.polyline.length > 0 && (
            <Polyline coordinates={mapData.polyline} strokeColor="#08b4fb" strokeWidth={4} />
          )}
          <Marker coordinate={{ latitude: mapData.from.lat, longitude: mapData.from.lon }} title="Alım" pinColor="#004561" />
          <Marker coordinate={{ latitude: mapData.to.lat, longitude: mapData.to.lon }} title="Teslim" pinColor="#08b4fb" />
        </MapView>
      ) : (
        <View style={{ height: MAP_HEIGHT, backgroundColor: C.cardInner, alignItems: 'center', justifyContent: 'center' }}>
          <Navigation size={32} color={C.textDim} />
          <Text style={{ color: C.textDim, marginTop: 8, fontSize: 13 }}>Harita yükleniyor...</Text>
        </View>
      )}

      {/* ── Current turn instruction overlay ── */}
      {currentStepData && (
        <View style={{ backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Navigation size={20} color="white" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }} numberOfLines={1}>
              {buildInstruction(currentStepData)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              {formatDist(currentStepData.distance)}  ·  Adım {currentStep + 1}/{steps.length}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {currentStep > 0 && (
              <TouchableOpacity onPress={() => setCurrentStep((s) => s - 1)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8 }}>
                <Text style={{ color: 'white', fontSize: 12 }}>←</Text>
              </TouchableOpacity>
            )}
            {!isLastStep && (
              <TouchableOpacity onPress={() => setCurrentStep((s) => s + 1)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8 }}>
                <Text style={{ color: 'white', fontSize: 12 }}>→</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Scrollable details ── */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Route stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          {[
            { icon: <Clock size={16} color={C.primary} />, label: 'Süre', value: formatDur(totalDur) },
            { icon: <MapPin size={16} color={C.primary} />, label: 'Mesafe', value: formatDist(totalDist) },
            { icon: <Package size={16} color={C.primary} />, label: 'Kazanç', value: `₺${task.calculated_price.toFixed(2)}`, accent: true },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 }}>
              {item.icon}
              <Text style={{ color: C.textMuted, fontSize: 10 }}>{item.label}</Text>
              <Text style={{ color: item.accent ? C.primary : C.text, fontWeight: '700', fontSize: 13 }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Addresses */}
        <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <View style={{ marginTop: 2 }}><MapPin size={14} color={C.textDim} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.textDim, fontSize: 11 }}>Alış</Text>
              <Text style={{ color: C.text, fontSize: 13 }}>{task.pickup_address}</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: C.borderDim, marginBottom: 10 }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ marginTop: 2 }}><MapPin size={14} color={C.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.textDim, fontSize: 11 }}>Teslimat</Text>
              <Text style={{ color: C.text, fontSize: 13 }}>{task.delivery_address}</Text>
            </View>
          </View>
        </View>

        {/* Steps list */}
        {steps.length > 0 && (
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 10 }}>
              TÜM ADIMLAR ({steps.length})
            </Text>
            {steps.map((step, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setCurrentStep(idx)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: 10, opacity: idx < currentStep ? 0.4 : 1 }}
              >
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: idx === currentStep ? C.primary : idx < currentStep ? '#10b981' : C.cardInner, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: idx === currentStep ? C.text : C.textMuted, fontSize: 12 }} numberOfLines={1}>
                    {buildInstruction(step)}
                  </Text>
                  <Text style={{ color: C.textDim, fontSize: 11 }}>{formatDist(step.distance)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Bottom action bar ── */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border }}>
        {isDeliveryDone ? (
          <View style={{ backgroundColor: task.status === 'cancelled' ? '#ef444422' : '#10b98122', borderRadius: 14, padding: 16, alignItems: 'center' }}>
            <Text style={{ color: task.status === 'cancelled' ? '#ef4444' : '#10b981', fontWeight: 'bold', fontSize: 15 }}>
              {task.status === 'delivered' ? 'Teslim edildi — gönderici onayı bekleniyor' :
               task.status === 'completed' ? 'Teslimat tamamlandı ✓' :
               task.status === 'cancelled' ? 'Görev iptal edildi' : 'Görev sonlandı'}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={handleCancel}
              disabled={cancelling || submitting}
              style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 15, alignItems: 'center' }}
            >
              {cancelling ? <ActivityIndicator color="#ef4444" size="small" /> : (
                <Text style={{ color: '#ef4444', fontWeight: '600' }}>İptal Et</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setProofVisible(true)}
              disabled={cancelling || submitting}
              style={{ flex: 2, backgroundColor: submitting ? `${C.primary}88` : C.primary, borderRadius: 14, padding: 15, alignItems: 'center' }}
            >
              {submitting ? <ActivityIndicator color="white" size="small" /> : (
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Teslim Et</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ProofModal visible={proofVisible} onCancel={() => setProofVisible(false)} onConfirm={handleProofConfirm} />
    </SafeAreaView>
  );
}
