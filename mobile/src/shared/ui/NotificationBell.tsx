import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  AppState,
  type AppStateStatus,
  type ListRenderItem,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { useThemeColors } from '../store/theme';
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from '../api/services/notificationService';
import type { AppNotification } from '../types';

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'şimdi';
  if (mins < 60) return `${mins} dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa`;
  return `${Math.floor(hours / 24)} g`;
}

export default function NotificationBell() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const C = useThemeColors();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const c = await getUnreadCount();
      setCount(c);
    } catch {}
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    tick();
    intervalRef.current = setInterval(tick, 60000);

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') tick();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [isLoggedIn, tick]);

  const openBell = async () => {
    setOpen(true);
    try {
      const data = await getNotifications();
      setItems(data);
    } catch {}
  };

  const handleMarkRead = async (item: AppNotification) => {
    if (!item.read_at) {
      try {
        await markRead(item.id);
        setItems((prev) =>
          prev.map((n) =>
            n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        );
        setCount((c) => Math.max(0, c - 1));
      } catch {}
    }
    const requestId = item.data_json?.request_id;
    if (requestId) {
      setOpen(false);
      router.push(`/delivery/${requestId}` as never);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setItems((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
      );
      setCount(0);
    } catch {}
  };

  const renderItem: ListRenderItem<AppNotification> = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMarkRead(item)}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: C.borderDim,
        backgroundColor: !item.read_at ? `${C.primary}12` : 'transparent',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: !item.read_at ? '600' : '400',
            color: !item.read_at ? C.text : C.textMuted,
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={{ color: C.textDim, fontSize: 11, marginLeft: 8 }}>
          {formatRelative(item.created_at)}
        </Text>
      </View>
      <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }} numberOfLines={2}>
        {item.body}
      </Text>
    </TouchableOpacity>
  );

  if (!isLoggedIn) return null;

  return (
    <>
      <TouchableOpacity onPress={openBell} style={{ padding: 8, position: 'relative' }}>
        <Bell size={22} color={C.primary} />
        {count > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: '#ef4444',
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 3,
            }}
          >
            <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>
              {count > 99 ? '99+' : String(count)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        transparent
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: C.bg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '75%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
              }}
            >
              <Text style={{ color: C.text, fontSize: 17, fontWeight: '700' }}>Bildirimler</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                {count > 0 && (
                  <TouchableOpacity onPress={handleMarkAll}>
                    <Text style={{ color: C.primary, fontSize: 13 }}>Tümünü oku</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Text style={{ color: C.textMuted, fontSize: 13 }}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>

            {items.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                <Text style={{ color: C.textDim }}>Bildirim yok</Text>
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(n) => n.id}
                renderItem={renderItem}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
