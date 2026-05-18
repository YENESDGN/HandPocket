import { useEffect, useRef, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
} from '../services/notificationService';
import type { AppNotification } from '../types';

const POLL_INTERVAL_MS = 60_000;
// Mount this component ONCE per page. Each instance owns its own setInterval —
// rendering two bells at the same time doubles polling load on /notifications/unread-count.

function formatRelative(raw: string): string {
  const diff = Date.now() - new Date(raw).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'şimdi';
  if (min < 60) return `${min} dk`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} sa`;
  const day = Math.floor(hr / 24);
  return `${day} g`;
}

interface Props {
  variant?: 'dark' | 'light';
}

export default function NotificationBell({ variant = 'dark' }: Props) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const c = await getUnreadCount();
        if (cancelled) return;
        setCount(c);
      } catch { /* silent — polling tolerates failures */ }
    };
    tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const lastFetchedCountRef = useRef<number | null>(null);

  const openDropdown = async () => {
    setOpen((v) => !v);
    if (open) return;
    // Skip refetch if nothing changed since last fetch: same unread count + items already loaded.
    if (items.length > 0 && lastFetchedCountRef.current === count) return;
    setLoading(true);
    try {
      const data = await getNotifications();
      setItems(data);
      lastFetchedCountRef.current = count;
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleRowClick = async (n: AppNotification) => {
    if (!n.read_at) {
      try { await markRead(n.id); } catch { /* silent */ }
      setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x));
      setCount((c) => Math.max(0, c - 1));
    }
    const requestId = n.data_json?.request_id;
    setOpen(false);
    if (typeof requestId === 'string') navigate(`/talep/${requestId}`);
  };

  const handleMarkAll = async () => {
    try { await markAllRead(); } catch { /* silent */ }
    const now = new Date().toISOString();
    setItems((prev) => prev.map((x) => x.read_at ? x : { ...x, read_at: now }));
    setCount(0);
  };

  if (!isLoggedIn) return null;

  const iconColor = variant === 'light' ? 'text-white' : 'text-gray-800';
  const hoverBg = variant === 'light' ? 'hover:bg-white/15' : 'hover:bg-gray-100';

  return (
    <div ref={wrapperRef} className="relative font-sextary">
      <button
        type="button"
        onClick={openDropdown}
        aria-label="Bildirimler"
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${hoverBg}`}
      >
        <Bell size={20} className={iconColor} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] fade-in-up">
          <div className="flex items-center justify-between px-4 py-3 bg-darker-blue">
            <span className="text-white font-bold text-sm tracking-wide">BİLDİRİMLER</span>
            {items.some((i) => !i.read_at) && (
              <button
                onClick={handleMarkAll}
                className="text-white/80 hover:text-white text-xs underline"
              >
                Tümünü oku
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="text-primary-blue animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                Henüz bildiriminiz yok.
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleRowClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex gap-3 ${
                    !n.read_at ? 'bg-primary-blue/5' : ''
                  }`}
                >
                  {!n.read_at && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-blue flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-darker-blue font-semibold text-sm truncate">{n.title}</span>
                      <span className="text-gray-400 text-[10px] flex-shrink-0">{formatRelative(n.created_at)}</span>
                    </div>
                    <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
