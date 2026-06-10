import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Circle,
  Navigation,
  Star,
} from 'lucide-react-native';
import { useAuthStore } from '@/shared/store/auth';
import { useThemeColors } from '@/shared/store/theme';
import { getTaskById, verifyTask } from '@/shared/api/services/taskService';
import { createDispute } from '@/shared/api/services/disputeService';
import { createReview } from '@/shared/api/services/reviewService';
import { getUserById } from '@/shared/api/services/userService';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { ReviewModal } from '@/shared/ui/ReviewModal';
import { DisputeModal } from '@/shared/ui/DisputeModal';
import type { DeliveryRequest, User } from '@/shared/types';

const TIMELINE_STEPS = [
  { key: 'pending',   label: 'Talep Oluşturuldu' },
  { key: 'accepted',  label: 'Kabul Edildi' },
  { key: 'picked_up', label: 'Alındı' },
  { key: 'delivered', label: 'Teslim Edildi' },
  { key: 'completed', label: 'Gönderici Onayladı' },
];
const STATUS_ORDER = ['pending', 'accepted', 'picked_up', 'delivered', 'completed'];

function stepIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status);
  if (idx !== -1) return idx;
  if (status === 'disputed') return 3;
  return 0;
}

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const C = useThemeColors();

  const [task, setTask] = useState<DeliveryRequest | null>(null);
  const [courier, setCourier] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofFull, setProofFull] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeLoading, setDisputeLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTaskById(id)
      .then(async (t) => {
        setTask(t);
        if (t.courier_id) {
          try { setCourier(await getUserById(t.courier_id)); } catch {}
        }
      })
      .catch(() => setTask(null))
      .finally(() => setLoading(false));
  }, [id]);

  const reload = async () => {
    if (!id) return;
    try { setTask(await getTaskById(id)); } catch {}
  };

  const handleVerify = async () => {
    if (!task) return;
    Alert.alert('Onayla', 'Teslimatı onaylamak istiyor musunuz? Kurye cüzdanı kredilenir.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: async () => {
          setVerifying(true);
          try { await verifyTask(task.id); await refreshUser(); await reload(); }
          catch { Alert.alert('Hata', 'Onaylama başarısız.'); }
          finally { setVerifying(false); }
        },
      },
    ]);
  };

  const handleDispute = async (reason: string) => {
    if (!task) return;
    setDisputeLoading(true);
    try { await createDispute({ request_id: task.id, reason }); setDisputeModal(false); await reload(); }
    catch { Alert.alert('Hata', 'İtiraz gönderilemedi.'); }
    finally { setDisputeLoading(false); }
  };

  const handleReview = async (score: number, comment: string) => {
    if (!task || !user) return;
    const revieweeId = user.id === task.sender_id ? task.courier_id : task.sender_id;
    if (!revieweeId) return;
    setReviewLoading(true);
    try { await createReview({ request_id: task.id, reviewee_id: revieweeId, score, comment }); setReviewModal(false); Alert.alert('Teşekkürler', 'Değerlendirmeniz gönderildi.'); }
    catch { Alert.alert('Hata', 'Değerlendirme gönderilemedi.'); }
    finally { setReviewLoading(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <ImageBackground
      source={require('../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={C.primary} /></TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.textMuted, fontSize: 16 }}>Teslimat bulunamadı.</Text>
        </View>
        </SafeAreaView>
    </ImageBackground>
    );
  }

  const isSender = user?.id === task.sender_id;
  const currentStep = stepIndex(task.status);
  const canTrack = ['accepted', 'picked_up'].includes(task.status) && isSender;
  const canVerify = task.status === 'delivered' && isSender;
  const canDispute = task.status === 'delivered' && isSender;
  const canReview = task.status === 'completed';
  const showProof = ['delivered', 'completed'].includes(task.status) && !!task.delivery_proof_photo_url;

  return (
    <ImageBackground
      source={require('../../../assets/images/bg-hex.png')}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.05 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={C.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: 'bold' }} numberOfLines={1}>{task.package_description}</Text>
          <Text style={{ color: C.textDim, fontSize: 11, marginTop: 1 }}>#{task.id.slice(0, 8)}</Text>
        </View>
        <StatusBadge status={task.status} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Timeline */}
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 14 }}>DURUM ZAMANÇİZELGESİ</Text>
          {TIMELINE_STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            const active = idx === currentStep;
            return (
              <View key={step.key} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ alignItems: 'center', width: 24, marginRight: 12 }}>
                  {done
                    ? <CheckCircle size={22} color={active ? C.primary : '#34d399'} />
                    : <Circle size={22} color={C.textDim} />}
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <View style={{ width: 2, flex: 1, minHeight: 20, backgroundColor: done ? '#34d399' : C.textDim, marginTop: 2 }} />
                  )}
                </View>
                <View style={{ flex: 1, paddingBottom: idx < TIMELINE_STEPS.length - 1 ? 16 : 0 }}>
                  <Text style={{ color: done ? (active ? C.primary : C.text) : C.textDim, fontWeight: active ? '700' : '500', fontSize: 14 }}>
                    {step.label}
                  </Text>
                  {task.status === 'disputed' && step.key === 'delivered' && (
                    <Text style={{ color: '#f87171', fontSize: 11, marginTop: 2 }}>İtiraz açıldı</Text>
                  )}
                  {task.status === 'cancelled' && step.key === 'pending' && (
                    <Text style={{ color: '#f87171', fontSize: 11, marginTop: 2 }}>İptal edildi</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Cargo info */}
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 12 }}>KARGO BİLGİLERİ</Text>
          <InfoRow label="Açıklama" value={task.package_description} C={C} />
          <InfoRow label="Alış" value={task.pickup_address} C={C} />
          <InfoRow label="Teslimat" value={task.delivery_address} C={C} />
          <InfoRow label="Mesafe" value={`${task.distance_km.toFixed(1)} km`} C={C} />
          <InfoRow label="Ağırlık" value={`${task.weight_kg} kg`} C={C} />
          <InfoRow label="Tahmini Süre" value={`${task.estimated_time_mins} dk`} C={C} />
          <InfoRow label="Ücret" value={`₺${task.calculated_price.toFixed(2)}`} C={C} last />
        </View>

        {courier && (
          <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 12 }}>KURYE</Text>
            <InfoRow label="Ad" value={courier.full_name} C={C} />
            <InfoRow label="E-Posta" value={courier.email} C={C} last />
          </View>
        )}

        {showProof && (
          <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 12 }}>TESLİMAT KANITI</Text>
            <TouchableOpacity onPress={() => setProofFull(true)}>
              <Image source={{ uri: task.delivery_proof_photo_url! }} style={{ width: '100%', height: 180, borderRadius: 10 }} resizeMode="cover" />
              <Text style={{ color: C.primary, fontSize: 12, textAlign: 'center', marginTop: 6 }}>Tam ekran için dokun</Text>
            </TouchableOpacity>
          </View>
        )}

        {canTrack && (
          <TouchableOpacity
            onPress={() => router.push(`/delivery/tracking/${task.id}`)}
            style={{ backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
          >
            <Navigation size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Canlı Takip</Text>
          </TouchableOpacity>
        )}

        {(canVerify || canDispute) && (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            {canVerify && (
              <TouchableOpacity
                onPress={handleVerify}
                disabled={verifying}
                style={{ flex: 1, backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: verifying ? 0.6 : 1 }}
              >
                {verifying ? <ActivityIndicator size="small" color="white" /> : <CheckCircle size={18} color="white" />}
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{verifying ? 'Onaylanıyor...' : 'Teslimatı Onayla'}</Text>
              </TouchableOpacity>
            )}
            {canDispute && (
              <TouchableOpacity
                onPress={() => setDisputeModal(true)}
                style={{ flex: 1, backgroundColor: '#ef444420', borderRadius: 14, borderWidth: 1, borderColor: '#ef4444', paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <AlertTriangle size={18} color="#f87171" />
                <Text style={{ color: '#f87171', fontWeight: 'bold', fontSize: 14 }}>İtiraz Et</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {canReview && (
          <TouchableOpacity
            onPress={() => setReviewModal(true)}
            style={{ backgroundColor: '#f59e0b20', borderRadius: 14, borderWidth: 1, borderColor: '#f59e0b', paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
          >
            <Star size={18} color="#f59e0b" />
            <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 15 }}>Değerlendir</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Proof full screen */}
      <Modal visible={proofFull} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setProofFull(false)} style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}>
            <Text style={{ color: 'white', fontSize: 16 }}>✕ Kapat</Text>
          </TouchableOpacity>
          {task.delivery_proof_photo_url && (
            <Image source={{ uri: task.delivery_proof_photo_url }} style={{ width: '90%', height: '70%' }} resizeMode="contain" />
          )}
        </View>
      </Modal>

      <ReviewModal visible={reviewModal} onClose={() => setReviewModal(false)} onConfirm={handleReview} loading={reviewLoading} />
      <DisputeModal visible={disputeModal} onClose={() => setDisputeModal(false)} onConfirm={handleDispute} loading={disputeLoading} />
    </SafeAreaView>
    </ImageBackground>
  );
}

function InfoRow({ label, value, last, C }: { label: string; value: string; last?: boolean; C: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.borderDim }}>
      <Text style={{ color: C.textMuted, fontSize: 13, flex: 1 }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 13, flex: 2, textAlign: 'right' }} numberOfLines={2}>{value}</Text>
    </View>
  );
}
