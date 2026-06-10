import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  ImageBackground,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  MapPin,
  Package,
  Plus,
  Truck,
  Wallet,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeColors } from '@/shared/store/theme';
import { useTaskCache } from '@/shared/store/taskCache';
import {
  acceptTask as acceptTaskService,
  getMyTasks,
  getOpenTasks,
} from '@/shared/api/services/taskService';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import type { DeliveryRequest } from '@/shared/types';

const priorityLabel = (m: number) =>
  m >= 2 ? 'Çok Acil' : m >= 1.5 ? 'Acil' : 'Normal';

const priorityColor = (m: number) =>
  m >= 2 ? '#ef4444' : m >= 1.5 ? '#f59e0b' : '#10b981';

// ── D-1: Courier Jobs ─────────────────────────────────────────────────────────

function CourierJobsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const C = useThemeColors();
  const { openTasks: cachedTasks, setOpenTasks } = useTaskCache();
  const [tasks, setTasks] = useState<DeliveryRequest[]>(cachedTasks);
  const [loading, setLoading] = useState(cachedTasks.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<DeliveryRequest | null>(null);
  const [accepting, setAccepting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const fresh = await getOpenTasks();
      setTasks(fresh);
      setOpenTasks(fresh);
    } catch {}
  }, [setOpenTasks]);

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, [fetchTasks]);

  const handleAccept = useCallback(async () => {
    if (!selected) return;
    setAccepting(true);
    try {
      await acceptTaskService(selected.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const id = selected.id;
      setSelected(null);
      router.push(`/courier/navigation/${id}` as never);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Görev kabul edilemedi.');
    } finally {
      setAccepting(false);
    }
  }, [selected, router]);

  const renderItem = useCallback(
    ({ item }: { item: DeliveryRequest }) => (
      <TouchableOpacity
        onPress={() => setSelected(item)}
        style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
          <Package size={16} color={C.primary} />
          <Text style={{ color: C.text, fontWeight: '600', flex: 1 }} numberOfLines={1}>{item.package_description}</Text>
          <View style={{ backgroundColor: `${priorityColor(item.open_time_multiplier)}22`, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: priorityColor(item.open_time_multiplier), fontSize: 11, fontWeight: '600' }}>{priorityLabel(item.open_time_multiplier)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <MapPin size={12} color={C.textDim} />
          <Text style={{ color: C.textMuted, fontSize: 12, flex: 1 }} numberOfLines={1}>{item.pickup_address}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <MapPin size={12} color={C.primary} />
          <Text style={{ color: C.textMuted, fontSize: 12, flex: 1 }} numberOfLines={1}>{item.delivery_address}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={{ color: C.textDim, fontSize: 12 }}>{item.weight_kg} kg</Text>
            <Text style={{ color: C.textDim, fontSize: 12 }}>{item.distance_km.toFixed(1)} km</Text>
            <Text style={{ color: C.textDim, fontSize: 12 }}>{item.estimated_time_mins} dk</Text>
          </View>
          <Text style={{ color: C.primary, fontWeight: '700', fontSize: 15 }}>₺{item.calculated_price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    ),
    [C],
  );

  return (
    <ImageBackground
      source={require('../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ color: C.textMuted, fontSize: 13 }}>Hoş geldin,</Text>
        <Text style={{ color: C.text, fontSize: 24, fontWeight: 'bold' }}>{user?.full_name}</Text>
        {!loading && (
          <Text style={{ color: C.primary, fontSize: 13, marginTop: 4 }}>
            {tasks.length > 0 ? `${tasks.length} açık görev mevcut` : 'Şu an açık görev yok'}
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Truck size={52} color={C.textDim} />
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '600', marginTop: 16 }}>Açık Görev Yok</Text>
              <Text style={{ color: C.textDim, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                Şu an uygun görev bulunmuyor.{'\n'}Yenilemek için aşağı çekin.
              </Text>
            </View>
          }
        />
      )}

      {/* Task detail modal */}
      <Modal visible={selected !== null} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setSelected(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            {selected && (
              <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                <View style={{ width: 40, height: 4, backgroundColor: C.primary, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
                <TouchableOpacity onPress={() => setSelected(null)} style={{ position: 'absolute', top: 20, right: 20 }}>
                  <X size={22} color={C.textDim} />
                </TouchableOpacity>

                <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>{selected.package_description}</Text>
                <View style={{ alignSelf: 'flex-start', backgroundColor: `${priorityColor(selected.open_time_multiplier)}22`, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 20 }}>
                  <Text style={{ color: priorityColor(selected.open_time_multiplier), fontSize: 12, fontWeight: '600' }}>{priorityLabel(selected.open_time_multiplier)}</Text>
                </View>

                <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ marginTop: 2 }}><MapPin size={15} color={C.textDim} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.textDim, fontSize: 11 }}>Alış Adresi</Text>
                      <Text style={{ color: C.text, fontSize: 13, marginTop: 2 }}>{selected.pickup_address}</Text>
                    </View>
                  </View>
                  <View style={{ height: 1, backgroundColor: C.borderDim }} />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ marginTop: 2 }}><MapPin size={15} color={C.primary} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.textDim, fontSize: 11 }}>Teslimat Adresi</Text>
                      <Text style={{ color: C.text, fontSize: 13, marginTop: 2 }}>{selected.delivery_address}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Ağırlık', value: `${selected.weight_kg} kg` },
                    { label: 'Mesafe', value: `${selected.distance_km.toFixed(1)} km` },
                    { label: 'Süre', value: `${selected.estimated_time_mins} dk` },
                  ].map((stat) => (
                    <View key={stat.label} style={{ flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                      <Text style={{ color: C.textMuted, fontSize: 11 }}>{stat.label}</Text>
                      <Text style={{ color: C.text, fontWeight: '600', fontSize: 14, marginTop: 4 }}>{stat.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ color: C.textMuted, fontSize: 15 }}>Kazanç</Text>
                  <Text style={{ color: C.primary, fontSize: 28, fontWeight: 'bold' }}>₺{selected.calculated_price.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  onPress={handleAccept}
                  disabled={accepting}
                  style={{ backgroundColor: accepting ? '#1ea4dc88' : C.primary, borderRadius: 16, padding: 18, alignItems: 'center' }}
                >
                  {accepting ? <ActivityIndicator color="white" /> : (
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Görevi Kabul Et</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ── Sender Home ───────────────────────────────────────────────────────────────

function SenderHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const C = useThemeColors();
  const [tasks, setTasks] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTasks().then((data) => setTasks(data.slice(0, 3))).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <ImageBackground
      source={require('../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: C.textMuted, fontSize: 13 }}>Hoş geldin,</Text>
          <Text style={{ color: C.text, fontSize: 26, fontWeight: 'bold' }}>{user?.full_name}</Text>
        </View>

        {/* Balance card */}
        <TouchableOpacity
          onPress={() => router.push('/wallet')}
          style={{ backgroundColor: C.primary, borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Bakiye</Text>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 4 }}>
              ₺{user?.wallet_balance?.toFixed(2) ?? '0.00'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Wallet size={36} color="rgba(255,255,255,0.8)" />
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 }}>Cüzdana Git →</Text>
          </View>
        </TouchableOpacity>

        {/* Create CTA */}
        <TouchableOpacity
          onPress={() => router.push('/delivery/create')}
          style={{ backgroundColor: C.card, borderRadius: 20, borderWidth: 2, borderColor: C.primary, padding: 20, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 14 }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={26} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold' }}>Teslimat Oluştur</Text>
            <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Hızlı ve güvenli kargo</Text>
          </View>
          <ChevronRight size={22} color={C.primary} />
        </TouchableOpacity>

        {/* Recent deliveries */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: C.text, fontWeight: '600', fontSize: 16 }}>Son Teslimatlar</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/deliveries')}>
            <Text style={{ color: C.primary, fontSize: 13 }}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 20 }} />
        ) : tasks.length === 0 ? (
          <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <Package size={32} color={C.textDim} />
            <Text style={{ color: C.textMuted, marginTop: 8, fontSize: 14 }}>Henüz teslimat yok</Text>
            <Text style={{ color: C.textDim, marginTop: 4, fontSize: 12 }}>İlk teslimatınızı oluşturmak için yukarıdaki butonu kullanın.</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => router.push(`/delivery/${task.id}`)}
              style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: C.text, fontWeight: '500' }} numberOfLines={1}>{task.package_description}</Text>
                <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }} numberOfLines={1}>{task.delivery_address}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <StatusBadge status={task.status} size="sm" />
                <Text style={{ color: C.textMuted, fontSize: 11 }}>₺{task.calculated_price.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ── Entry ─────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { role } = useAuthStore();
  return role === 'courier' ? <CourierJobsScreen /> : <SenderHomeScreen />;
}
