import { useEffect, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { useThemeColors } from '../store/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export function DisputeModal({ visible, onClose, onConfirm, loading }: Props) {
  const C = useThemeColors();
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 5;

  useEffect(() => {
    if (!visible) setReason('');
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ backgroundColor: C.bg, borderRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={20} color="#f87171" />
              <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold' }}>İtiraz Et</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <X size={22} color={C.textDim} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>İtiraz Sebebi</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Sebebinizi açıklayın (en az 5 karakter)..."
            placeholderTextColor={C.textDim}
            multiline
            style={{
              backgroundColor: C.card,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: C.text,
              height: 100,
              textAlignVertical: 'top',
              marginBottom: 20,
            }}
          />

          <TouchableOpacity
            onPress={() => onConfirm(reason.trim())}
            disabled={!valid || loading}
            style={{
              backgroundColor: '#ef4444',
              borderRadius: 12,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: valid && !loading ? 1 : 0.45,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>
              {loading ? 'Gönderiliyor...' : 'İtirazı Gönder'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
