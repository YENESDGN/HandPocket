import { useEffect, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { useThemeColors } from '../store/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (score: number, comment: string) => void;
  loading?: boolean;
}

export function ReviewModal({ visible, onClose, onConfirm, loading }: Props) {
  const C = useThemeColors();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!visible) {
      setScore(5);
      setComment('');
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ backgroundColor: C.bg, borderRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: 'bold' }}>Değerlendirme</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={22} color={C.textDim} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>Puan</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setScore(i)}>
                <Star
                  size={34}
                  color={i <= score ? '#f59e0b' : C.borderDim}
                  fill={i <= score ? '#f59e0b' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>Yorum (opsiyonel)</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Yorumunuzu yazın..."
            placeholderTextColor={C.textDim}
            multiline
            style={{
              backgroundColor: C.card,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: C.text,
              height: 80,
              textAlignVertical: 'top',
              marginBottom: 20,
            }}
          />

          <TouchableOpacity
            onPress={() => onConfirm(score, comment.trim())}
            disabled={loading}
            style={{
              backgroundColor: C.primary,
              borderRadius: 12,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>
              {loading ? 'Gönderiliyor...' : 'Gönder'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
