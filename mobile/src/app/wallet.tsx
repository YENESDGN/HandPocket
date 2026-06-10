import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowDown, ArrowLeft, ArrowUp, Minus, Plus, TrendingUp, Wallet } from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeColors } from '@/shared/store/theme';
import { deposit, withdraw, getWalletSummary } from '@/shared/api/services/walletService';
import type { WalletSummary } from '@/shared/types';

type ModalType = 'deposit' | 'withdraw' | null;

function AmountModal({
  type, balance, onClose, onConfirm, loading,
}: {
  type: ModalType; balance: number; onClose: () => void;
  onConfirm: (amount: number) => void; loading: boolean;
}) {
  const C = useThemeColors();
  const [input, setInput] = useState('');
  const amount = parseFloat(input);
  const valid = !isNaN(amount) && amount > 0;
  const overBalance = type === 'withdraw' && valid && amount > balance;

  useEffect(() => { if (!type) setInput(''); }, [type]);

  return (
    <Modal visible={!!type} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28 }}>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
            {type === 'deposit' ? 'Bakiye Yükle' : 'Para Çek'}
          </Text>

          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>Miktar (₺)</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="0.00"
            placeholderTextColor={C.textDim}
            keyboardType="decimal-pad"
            style={{ backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: C.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}
          />

          {type === 'withdraw' && (
            <Text style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>
              Mevcut bakiye: ₺{balance.toFixed(2)}
            </Text>
          )}
          {overBalance && (
            <Text style={{ color: '#f87171', fontSize: 12, marginBottom: 16 }}>Bakiyeniz yetersiz.</Text>
          )}

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {[50, 100, 200, 500].map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setInput(String(v))}
                style={{ flex: 1, backgroundColor: C.card, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: input === String(v) ? 1 : 0, borderColor: C.primary }}
              >
                <Text style={{ color: input === String(v) ? C.primary : C.textMuted, fontWeight: '600' }}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => { setInput(''); onClose(); }}
              style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: C.textMuted, fontWeight: '600' }}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(amount)}
              disabled={!valid || overBalance || loading}
              style={{ flex: 2, backgroundColor: type === 'deposit' ? '#10b981' : C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: valid && !overBalance && !loading ? 1 : 0.45 }}
            >
              {loading ? <ActivityIndicator size="small" color="white" /> : (
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                  {type === 'deposit' ? 'Yükle' : 'Çek'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function WalletScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const C = useThemeColors();

  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [txLoading, setTxLoading] = useState(false);

  const load = useCallback(async () => {
    try { setSummary(await getWalletSummary()); } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleTransaction = async (amount: number) => {
    setTxLoading(true);
    try {
      if (modal === 'deposit') await deposit(amount); else await withdraw(amount);
      setModal(null);
      // Fire-and-forget — don't let refresh failures surface as transaction errors
      load().catch(() => {});
      refreshUser().catch(() => {});
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? (err instanceof Error ? err.message : 'İşlem başarısız.');
      Alert.alert('Hata', msg);
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={C.primary} />
        </TouchableOpacity>
        <Wallet size={20} color={C.primary} style={{ marginRight: 8 }} />
        <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold' }}>Cüzdan</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
        >
          {/* Balance card — always brand blue */}
          <View style={{ backgroundColor: C.primary, borderRadius: 24, padding: 24, marginBottom: 16, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Mevcut Bakiye</Text>
            <Text style={{ color: 'white', fontSize: 44, fontWeight: 'bold', marginVertical: 8 }}>
              ₺{(user?.wallet_balance ?? summary?.balance ?? 0).toFixed(2)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setModal('deposit')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
              >
                <Plus size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '600' }}>Yükle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModal('withdraw')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
              >
                <Minus size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '600' }}>Çek</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          {summary && (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <StatCard icon={<TrendingUp size={18} color={C.primary} />} label="Harcanan" value={`₺${summary.stats.total_spent.toFixed(2)}`} C={C} />
              <StatCard icon={<ArrowUp size={18} color="#34d399" />} label="Teslimat" value={String(summary.stats.total_deliveries)} C={C} />
              <StatCard icon={<ArrowDown size={18} color="#f59e0b" />} label="Ort. Sipariş" value={`₺${summary.stats.avg_order.toFixed(2)}`} C={C} />
            </View>
          )}

          {/* Transactions */}
          <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16 }}>
            <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 12 }}>İŞLEM GEÇMİŞİ</Text>
            {!summary?.transactions?.length ? (
              <Text style={{ color: C.textDim, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>Henüz işlem yok</Text>
            ) : (
              summary.transactions.map((tx) => (
                <View key={tx.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.borderDim }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: tx.type === 'credit' ? '#10b98120' : '#ef444420', alignItems: 'center', justifyContent: 'center' }}>
                      {tx.type === 'credit' ? <ArrowDown size={16} color="#34d399" /> : <ArrowUp size={16} color="#f87171" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.text, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{tx.label}</Text>
                      <Text style={{ color: C.textDim, fontSize: 11, marginTop: 1 }}>{new Date(tx.date).toLocaleDateString('tr-TR')}</Text>
                    </View>
                  </View>
                  <Text style={{ color: tx.type === 'credit' ? '#34d399' : '#f87171', fontWeight: 'bold', fontSize: 14 }}>
                    {tx.type === 'credit' ? '+' : '-'}₺{tx.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      <AmountModal type={modal} balance={user?.wallet_balance ?? 0} onClose={() => setModal(null)} onConfirm={handleTransaction} loading={txLoading} />
      </SafeAreaView>
    </ImageBackground>
  );
}

function StatCard({ icon, label, value, C }: { icon: ReactNode; label: string; value: string; C: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 }}>
      {icon}
      <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{label}</Text>
      <Text style={{ color: C.text, fontWeight: 'bold', fontSize: 13 }}>{value}</Text>
    </View>
  );
}
