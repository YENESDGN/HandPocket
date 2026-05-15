import { useState, useEffect, useRef } from 'react';
import { Package, Settings, Shield, List, HelpCircle, LogOut, Wallet, Loader2, Camera, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import SettingsPanel from '../components/settings';
import SecurityPanel from '../components/Security';
import PreferencesPanel from '../components/Preferences';
import NeedHelpPanel from '../components/NeedHelp';
import api from '../lib/api';
import type { WalletTransaction, WalletSummary, DeliveryRequest as ApiDeliveryRequest } from '../types';

type NavItem = 'teslimatlar' | 'ayarlar' | 'guvenlik' | 'tercihler' | 'yardim' | 'cuzdan';

type DeliveryStatus = 'Başarılı' | 'Başarısız' | 'Bekliyor';

interface DeliveryRow {
  id: string;
  location: string;
  date: string;
  status: DeliveryStatus;
  rawStatus: string;
}

const SUCCESSFUL_STATUSES = new Set(['delivered', 'completed']);
const FAILED_STATUSES     = new Set(['cancelled', 'disputed']);

function mapStatus(apiStatus: string): DeliveryStatus {
  if (SUCCESSFUL_STATUSES.has(apiStatus)) return 'Başarılı';
  if (FAILED_STATUSES.has(apiStatus))     return 'Başarısız';
  return 'Bekliyor';
}

function formatDate(raw: string | Date): string {
  const d = new Date(raw);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toRow(req: ApiDeliveryRequest): DeliveryRow {
  return {
    id: req.id,
    location: `${req.pickup_address.split(',')[0]} → ${req.delivery_address.split(',')[0]}`,
    date: formatDate(req.created_at),
    status: mapStatus(req.status),
    rawStatus: req.status,
  };
}

const statusStyles: Record<DeliveryStatus, string> = {
  'Başarılı':  'bg-green-100 text-green-700 border border-green-300',
  'Başarısız': 'bg-red-100 text-red-700 border border-red-300',
  'Bekliyor':  'bg-yellow-100 text-yellow-700 border border-yellow-300',
};

function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium font-sextary ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function DeliveryTable({ title, rows, animClass }: { title: string; rows: DeliveryRow[]; animClass?: string }) {
  return (
    <div className={`mb-6 rounded overflow-hidden border border-gray-200 shadow-sm${animClass ? ` ${animClass}` : ''}`}>
      <div className="bg-secondary-blue px-4 py-3">
        <span className="text-white font-bold font-sextary tracking-wide text-sm">{title}</span>
      </div>
      <table className="w-full bg-white text-sm font-sextary table-fixed">
        <colgroup>
          <col style={{ width: '15%' }} />
          <col style={{ width: '45%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-gray-700 font-semibold">Kargo ID</th>
            <th className="text-left px-4 py-3 text-gray-700 font-semibold">Lokasyon</th>
            <th className="text-left px-4 py-3 text-gray-700 font-semibold">Tarih</th>
            <th className="text-left px-4 py-3 text-gray-700 font-semibold">Durum</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-gray-400 text-xs">Kayıt bulunamadı</td>
            </tr>
          ) : rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
              <td className="px-4 py-3">
                <Link to={`/talep/${row.id}`} className="text-secondary-blue font-semibold hover:underline font-mono text-xs">
                  {row.id.slice(0, 8).toUpperCase()}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-800">{row.location}</td>
              <td className="px-4 py-3 text-gray-800">{row.date}</td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ModalType = 'deposit' | 'withdraw' | null;

function WalletModal({ type, onClose, onConfirm, loading }: {
  type: ModalType;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
  loading: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [error, setError]   = useState('');

  if (!type) return null;

  const isDeposit = type === 'deposit';
  const title     = isDeposit ? 'Bakiye Yükle' : 'Para Çek';

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) { setError('Geçerli bir miktar girin.'); return; }
    setError('');
    await onConfirm(val);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 font-sextary'>
        <div className='flex items-center justify-between mb-5'>
          <h2 className='text-darker-blue font-bold text-lg'>{title}</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'><X size={18} /></button>
        </div>
        <input
          type='number'
          min='1'
          step='1'
          placeholder='Miktar (TL)'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className='w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-primary-blue transition-colors mb-2'
        />
        {error && <p className='text-red-500 text-xs mb-2'>{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className='w-full bg-primary-blue text-white font-bold py-3 rounded-xl hover:bg-secondary-blue transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-1'
        >
          {loading && <Loader2 size={16} className='animate-spin' />}
          {title}
        </button>
      </div>
    </div>
  );
}

function WalletPanel() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [summary, setSummary]   = useState<WalletSummary | null>(null);
  const [wLoading, setWLoading] = useState(true);
  const [modal, setModal]       = useState<ModalType>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError]     = useState('');

  const load = async () => {
    try {
      const { data } = await api.get<WalletSummary>('/wallet/');
      setSummary(data);
    } finally {
      setWLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleTransaction = async (amount: number) => {
    setTxLoading(true);
    setTxError('');
    try {
      const endpoint = modal === 'deposit' ? '/wallet/deposit' : '/wallet/withdraw';
      const { data } = await api.post<{ balance: number }>(endpoint, { amount });
      setSummary((prev) => prev ? { ...prev, balance: data.balance } : prev);
      await Promise.all([load(), refreshUser()]);
      setModal(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'İşlem başarısız.';
      setTxError(msg);
    } finally {
      setTxLoading(false);
    }
  };

  if (wLoading) return (
    <div className='flex justify-center py-16'><Loader2 size={32} className='text-primary-blue animate-spin' /></div>
  );

  const stats = summary?.stats;
  const walletStats = [
    { label: 'Toplam Harcama',  value: stats ? `${stats.total_spent.toFixed(2)} TL` : '— TL' },
    { label: 'Toplam Teslimat', value: stats ? String(stats.total_deliveries) : '—' },
    { label: 'Ortalama Sipariş', value: stats ? `${stats.avg_order.toFixed(2)} TL` : '— TL' },
  ];

  return (
    <>
      <WalletModal type={modal} onClose={() => setModal(null)} onConfirm={handleTransaction} loading={txLoading} />

      <div className='flex flex-col gap-6'>
        {txError && (
          <div className='bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between'>
            <span>{txError}</span>
            <button onClick={() => setTxError('')}><X size={14} /></button>
          </div>
        )}

        <div className='bg-secondary-blue rounded-2xl p-8 flex items-center justify-between drop-shadow-[0_0_15px_rgba(0,0,0,0.3)] fade-in-up'>
          <div>
            <span className='text-white/70 text-sm block mb-1'>Mevcut Bakiye</span>
            <span className='text-white font-bold text-5xl'>{summary ? summary.balance.toFixed(2) : '—'} TL</span>
          </div>
          <div className='flex flex-col gap-2 items-end'>
            <button
              onClick={() => setModal('deposit')}
              className='bg-white text-secondary-blue font-bold px-6 py-2.5 rounded-full text-sm hover:bg-primary-blue hover:text-white transition-all active:scale-95'
            >
              Bakiye Yükle
            </button>
            <button
              onClick={() => setModal('withdraw')}
              className='bg-white/15 border border-white/25 text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-white/25 transition-all active:scale-95'
            >
              Para Çek
            </button>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-4 fade-in-up-delay-1'>
          {walletStats.map((s) => (
            <div key={s.label} className='bg-white rounded-xl p-5 drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]'>
              <span className='text-gray-400 text-xs block mb-1'>{s.label}</span>
              <span className='text-darker-blue font-bold text-2xl'>{s.value}</span>
            </div>
          ))}
        </div>

        <div className='bg-white rounded-xl overflow-hidden drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up-delay-2'>
          <div className='bg-darker-blue px-5 py-3'>
            <span className='text-white font-bold text-sm tracking-wide uppercase'>İşlem Geçmişi</span>
          </div>
          <table className='w-full text-sm font-sextary'>
            <thead>
              <tr className='border-b border-gray-100'>
                <th className='text-left px-5 py-3 text-gray-500 font-semibold'>İşlem</th>
                <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Tarih</th>
                <th className='text-right px-5 py-3 text-gray-500 font-semibold'>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {!summary || summary.transactions.length === 0 ? (
                <tr><td colSpan={3} className='px-5 py-4 text-center text-gray-400 text-xs'>İşlem bulunamadı</td></tr>
              ) : summary.transactions.map((tx: WalletTransaction) => (
                <tr key={tx.id} className='border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors'>
                  <td className='px-5 py-3 text-gray-800'>{tx.label}</td>
                  <td className='px-5 py-3 text-gray-400'>{tx.date}</td>
                  <td className={`px-5 py-3 text-right font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '−'}{tx.amount.toFixed(2)} TL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  const [activeNav, setActiveNav] = useState<NavItem>('teslimatlar');
  const [rows, setRows]           = useState<DeliveryRow[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const signOut      = useAuthStore((s) => s.signOut);
  const user         = useAuthStore((s) => s.user);
  const role         = useAuthStore((s) => s.role);
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);
  const navigate     = useNavigate();
  const avatarRef    = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    api.get<ApiDeliveryRequest[]>('/tasks/my')
      .then(({ data }) => setRows(data.map(toRow)))
      .finally(() => setTasksLoading(false));
  }, []);

  const navItemClass = (item: NavItem) =>
    `flex items-center gap-3 px-3 py-2.5 rounded text-sm text-left w-full transition-all ${
      activeNav === item
        ? 'bg-dark-blue text-white font-semibold'
        : 'text-white/90 btn-hover-shadow-blue'
    }`;

  return (
    <div className="profile-bg relative flex h-screen overflow-hidden font-sextary">
      {/* Sidebar */}
      <aside className="w-52 bg-darker-blue flex flex-col flex-shrink-0 profile-sidebar">
        {/* Profile section */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4 border-b border-white/10">
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 mb-3 bg-primary-blue cursor-pointer group"
            onClick={() => avatarRef.current?.click()}
          >
            <img
              key={user?.avatar_url ?? 'default'}
              src={user?.avatar_url ?? '/assets/avatar-placeholder.png'}
              alt="Profil"
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} className="text-white" />
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <p className="text-white font-bold text-sm text-center leading-tight">{user?.full_name ?? '—'}</p>
          <p className="text-white/70 text-xs mt-1">{user?.phone_number ?? ''}</p>
          <p className="text-white/70 text-xs mt-0.5 text-center">{user?.email ?? ''}</p>
        </div>

        {/* Navigation menu */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 font-sextary">
          <button className={`${navItemClass('teslimatlar')} profile-nav-item`} onClick={() => setActiveNav('teslimatlar')} style={{ animationDelay: '0.05s' }}>
            <Package size={18} />
            Teslimatlar
          </button>
          <button className={`${navItemClass('ayarlar')} profile-nav-item`} onClick={() => setActiveNav('ayarlar')} style={{ animationDelay: '0.12s' }}>
            <Settings size={18} />
            Ayarlar
          </button>
          <button className={`${navItemClass('guvenlik')} profile-nav-item`} onClick={() => setActiveNav('guvenlik')} style={{ animationDelay: '0.19s' }}>
            <Shield size={18} />
            Güvenlik
          </button>
          <button className={`${navItemClass('tercihler')} profile-nav-item`} onClick={() => setActiveNav('tercihler')} style={{ animationDelay: '0.26s' }}>
            <List size={18} />
            Tercihler
          </button>
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-6 flex flex-col gap-1 font-sextary">
          <button className={`${navItemClass('cuzdan')} profile-nav-item`} onClick={() => setActiveNav('cuzdan')} style={{ animationDelay: '0.33s' }}>
            <Wallet size={18} />
            Cüzdan
          </button>
          <button className={`${navItemClass('yardim')} profile-nav-item`} onClick={() => setActiveNav('yardim')} style={{ animationDelay: '0.40s' }}>
            <HelpCircle size={18} />
            Yardım Merkezi
          </button>
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded text-red-400 btn-hover-shadow-blue text-sm text-left font-semibold w-full profile-nav-item"
            style={{ animationDelay: '0.47s' }}
            onClick={() => { signOut(); navigate('/'); }}
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-8 py-5 flex-shrink-0 profile-header">
          <div className="flex items-center gap-2">
            <img src="/assets/favicon.png" alt="HandPocket" className="w-16 h-16 object-contain" />
          </div>
          <nav className="flex items-center gap-8 text-lg font-tertiary relative px-10">
            <Link to="/" className="text-gray-800 btn-hover-blue">Anasayfa</Link>
            <Link to="/hakkimizda" className="text-gray-800 btn-hover-blue">Hakkımızda</Link>
            <Link to="/iletisim" className="text-gray-800 btn-hover-blue">İletişim</Link>
          </nav>
          <button
            onClick={() => avatarRef.current?.click()}
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary-blue bg-primary-blue flex-shrink-0 group relative"
            title="Fotoğrafı Değiştir"
          >
            <img
              key={user?.avatar_url ?? 'default'}
              src={user?.avatar_url ?? '/assets/favicon.png'}
              alt="Profil"
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={13} className="text-white" />
            </div>
          </button>
        </header>

        {/* Page body */}
        <main className="main-bg flex-1 overflow-y-auto p-8 profile-content">
          {activeNav === 'teslimatlar' && (
            tasksLoading ? (
              <div className='flex justify-center py-16'>
                <Loader2 size={32} className='text-primary-blue animate-spin' />
              </div>
            ) : role === 'courier' ? (
              <>
                <DeliveryTable
                  title="AKTİF TESLİMATLAR"
                  rows={rows.filter(r => ['accepted', 'picked_up'].includes(r.rawStatus))}
                  animClass="delivery-table-1"
                />
                <DeliveryTable
                  title="TAMAMLANAN TESLİMATLAR"
                  rows={rows.filter(r => ['delivered', 'completed'].includes(r.rawStatus))}
                  animClass="delivery-table-2"
                />
                <DeliveryTable
                  title="İPTAL / ANLAŞMAZLIK"
                  rows={rows.filter(r => ['cancelled', 'disputed'].includes(r.rawStatus))}
                  animClass="delivery-table-3"
                />
              </>
            ) : (
              <>
                <DeliveryTable title="BAŞARILI TALEPLER"  rows={rows.filter(r => r.status === 'Başarılı')}  animClass="delivery-table-1" />
                <DeliveryTable title="BAŞARISIZ TALEPLER" rows={rows.filter(r => r.status === 'Başarısız')} animClass="delivery-table-2" />
                <DeliveryTable title="BEKLEYEN TALEPLER"  rows={rows.filter(r => r.status === 'Bekliyor')}  animClass="delivery-table-3" />
              </>
            )
          )}
          {activeNav === 'ayarlar' && <SettingsPanel />}
          {activeNav === 'guvenlik' && <SecurityPanel />}
          {activeNav === 'tercihler' && <PreferencesPanel />}
          {activeNav === 'cuzdan' && <WalletPanel />}
          {activeNav === 'yardim' && <NeedHelpPanel />}
        </main>
      </div>
    </div>
  );
}