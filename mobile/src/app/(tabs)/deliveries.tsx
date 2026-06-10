import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, Package } from 'lucide-react-native';
import { getMyTasks } from '@/shared/api/services/taskService';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeColors } from '@/shared/store/theme';
import { useTaskCache } from '@/shared/store/taskCache';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import type { DeliveryRequest } from '@/shared/types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const isOld = (dateStr: string | Date) =>
  new Date().getTime() - new Date(dateStr).getTime() > SEVEN_DAYS_MS;

const ACTIVE_STATUSES = new Set(['accepted', 'picked_up', 'delivered']);
const TERMINAL_STATUSES = new Set(['completed', 'disputed', 'cancelled']);

interface SectionProps {
  title: string;
  tasks: DeliveryRequest[];
  color?: string;
  onPress: (task: DeliveryRequest) => void;
}

function Section({ title, tasks, color = '#08b4fb', onPress }: SectionProps) {
  const C = useThemeColors();
  if (tasks.length === 0) return null;
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 }}>
        {title.toUpperCase()}
      </Text>
      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          onPress={() => onPress(task)}
          style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ color: C.text, fontWeight: '500', fontSize: 14 }} numberOfLines={1}>{task.package_description}</Text>
            <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }} numberOfLines={1}>{task.delivery_address}</Text>
            <Text style={{ color: C.textDim, fontSize: 11, marginTop: 2 }}>{new Date(task.created_at).toLocaleDateString('tr-TR')}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 5 }}>
            <StatusBadge status={task.status} size="sm" />
            <Text style={{ color: C.textMuted, fontSize: 12 }}>₺{task.calculated_price.toFixed(2)}</Text>
            <ChevronRight size={14} color={C.textDim} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function DeliveriesScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const { role } = useAuthStore();
  const { myTasks: cachedTasks, setMyTasks } = useTaskCache();
  const [tasks, setTasks] = useState<DeliveryRequest[]>(cachedTasks);
  const [loading, setLoading] = useState(cachedTasks.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const fresh = await getMyTasks();
      setTasks(fresh);
      setMyTasks(fresh);
    } catch {}
  }, [setMyTasks]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const goDetail = (task: DeliveryRequest) => {
    if (role === 'courier' && ACTIVE_STATUSES.has(task.status)) {
      router.push(`/courier/navigation/${task.id}` as never);
    } else {
      router.push(`/delivery/${task.id}`);
    }
  };

  const active = tasks.filter((t) => ACTIVE_STATUSES.has(t.status));
  const pending = tasks.filter((t) => t.status === 'pending');
  const recentTerminal = tasks.filter((t) => TERMINAL_STATUSES.has(t.status) && !isOld(t.created_at));
  const oldTerminal = tasks.filter((t) => TERMINAL_STATUSES.has(t.status) && isOld(t.created_at));
  const recentCompleted = recentTerminal.filter((t) => t.status === 'completed');
  const recentFailed = recentTerminal.filter((t) => t.status !== 'completed');
  const oldCompleted = oldTerminal.filter((t) => t.status === 'completed');
  const oldFailed = oldTerminal.filter((t) => t.status !== 'completed');

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {tasks.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Package size={48} color={C.textDim} />
            <Text style={{ color: C.textDim, marginTop: 12, fontSize: 15 }}>Henüz teslimat yok</Text>
          </View>
        ) : (
          <>
            <Section title="Aktif Teslimatlar" tasks={active} color="#60a5fa" onPress={goDetail} />
            <Section title="Onay Bekleyen" tasks={pending} color="#f59e0b" onPress={goDetail} />
            <Section title="Başarılı Teslimatlar" tasks={recentCompleted} color="#34d399" onPress={goDetail} />
            <Section title="Başarısız Talepler" tasks={recentFailed} color="#f87171" onPress={goDetail} />

            {(oldCompleted.length > 0 || oldFailed.length > 0) && (
              <View style={{ marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => setHistoryOpen((v) => !v)}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, marginBottom: historyOpen ? 12 : 0 }}
                >
                  <Text style={{ color: C.textMuted, fontWeight: '600', fontSize: 14 }}>
                    Geçmiş Teslimatlar ({oldCompleted.length + oldFailed.length})
                  </Text>
                  <View style={{ transform: [{ rotate: historyOpen ? '180deg' : '0deg' }] }}>
                    <ChevronDown size={18} color={C.textMuted} />
                  </View>
                </TouchableOpacity>
                {historyOpen && (
                  <>
                    <Section title="Başarılı (Eski)" tasks={oldCompleted} color="#34d399" onPress={goDetail} />
                    <Section title="Başarısız (Eski)" tasks={oldFailed} color="#f87171" onPress={goDetail} />
                  </>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}
