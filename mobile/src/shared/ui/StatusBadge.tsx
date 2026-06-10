import { Text, View } from 'react-native';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Bekliyor',        bg: '#f59e0b20', text: '#f59e0b' },
  accepted:  { label: 'Kabul Edildi',    bg: '#3b82f620', text: '#60a5fa' },
  picked_up: { label: 'Yolda',           bg: '#8b5cf620', text: '#a78bfa' },
  delivered: { label: 'Teslim Edildi',   bg: '#06b6d420', text: '#22d3ee' },
  completed: { label: 'Tamamlandı',      bg: '#10b98120', text: '#34d399' },
  disputed:  { label: 'İtirazlı',        bg: '#ef444420', text: '#f87171' },
  cancelled: { label: 'İptal',           bg: '#6b728020', text: '#9ca3af' },
};

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#6b728020', text: '#9ca3af' };
  const px = size === 'sm' ? 8 : 12;
  const py = size === 'sm' ? 2 : 4;
  const fs = size === 'sm' ? 11 : 12;

  return (
    <View style={{ backgroundColor: cfg.bg, borderRadius: 999, paddingHorizontal: px, paddingVertical: py }}>
      <Text style={{ color: cfg.text, fontSize: fs, fontWeight: '600' }}>{cfg.label}</Text>
    </View>
  );
}
