import { useState } from 'react';
import { Package, Settings, Shield, List, HelpCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

type NavItem = 'teslimatlar' | 'ayarlar' | 'guvenlik' | 'tercihler';

type DeliveryStatus = 'Başarılı' | 'Başarısız' | 'Bekliyor';

interface DeliveryRequest {
  id: string;
  location: string;
  date: string;
  status: DeliveryStatus;
}

const successfulRequests: DeliveryRequest[] = [
  { id: '#KRG-1', location: 'Akse Mah 415/2 Sok. No9. D.2', date: '24.09.2025', status: 'Başarılı' },
  { id: '#KRG-2', location: 'Akse Mah 415/2 Sok. No9. D.2', date: '24.12.2025', status: 'Başarılı' },
];

const failedRequests: DeliveryRequest[] = [
  { id: '#KRG-1', location: 'Akse Mah 415/2 Sok. No9. D.2', date: '24.09.2025', status: 'Başarısız' },
  { id: '#KRG-2', location: 'Akse Mah 415/2 Sok. No9. D.2', date: '24.12.2025', status: 'Başarısız' },
];

const pendingRequests: DeliveryRequest[] = [
  { id: '#KRG-1', location: 'Akse Mah 415/2 Sok. No9. D.2', date: '24.09.2025', status: 'Bekliyor' },
  { id: '#KRG-2', location: 'Akse Mah 415/2 Sok. No9. D.2', date: '24.12.2025', status: 'Bekliyor' },
];

const statusStyles: Record<DeliveryStatus, string> = {
  'Başarılı':  'bg-green-100 text-green-700 border border-green-300 ',
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

function DeliveryTable({ title, rows }: { title: string; rows: DeliveryRequest[] }) {
  return (
    <div className="mb-6 rounded overflow-hidden border border-gray-200 shadow-sm">
      <div className="bg-darker-blue px-4 py-3">
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
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-gray-800">{row.id}</td>
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

export default function ProfilePage() {
  const [activeNav, setActiveNav] = useState<NavItem>('teslimatlar');

  const navItemClass = (item: NavItem) =>
    `flex items-center gap-3 px-3 py-2.5 rounded text-sm text-left w-full transition-all ${
      activeNav === item
        ? 'bg-dark-blue text-white font-semibold'
        : 'text-white/90 btn-hover-shadow-blue'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sextary">
      {/* Sidebar */}
      <aside className="w-52 bg-darker-blue flex flex-col flex-shrink-0">
        {/* Profile section */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4 border-b border-white/10">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 mb-3">
            <img
              src="/assets/avatar-placeholder.png"
              alt="Profil"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                target.parentElement!.classList.add('bg-primary-blue');
              }}
            />
          </div>
          <p className="text-white font-bold text-sm text-center leading-tight">Yağız Enes DOĞAN</p>
          <p className="text-white/70 text-xs mt-1">+90 530 301 6118</p>
          <p className="text-white/70 text-xs mt-0.5 text-center">yenesdogan@outlook.com.tr</p>
        </div>

        {/* Navigation menu */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 font-sextary">
          <button className={navItemClass('teslimatlar')} onClick={() => setActiveNav('teslimatlar')}>
            <Package size={18} />
            Teslimatlar
          </button>
          <button className={navItemClass('ayarlar')} onClick={() => setActiveNav('ayarlar')}>
            <Settings size={18} />
            Ayarlar
          </button>
          <button className={navItemClass('guvenlik')} onClick={() => setActiveNav('guvenlik')}>
            <Shield size={18} />
            Güvenlik
          </button>
          <button className={navItemClass('tercihler')} onClick={() => setActiveNav('tercihler')}>
            <List size={18} />
            Tercihler
          </button>
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-6 flex flex-col gap-1 font-sextary">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded text-white/80 btn-hover-shadow-blue text-sm text-left w-full">
            <HelpCircle size={18} />
            Yardım Merkezi
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded text-red-400 btn-hover-shadow-blue text-sm text-left font-semibold w-full">
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white border-b border-gray-200 flex items-center justify-between px-8 py-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/assets/favicon.png" alt="HandPocket" className="w-16 h-16 object-contain" />
          </div>
          <nav className="flex items-center gap-8 text-lg font-tertiary relative px-10">
            <Link to="/" className="text-gray-800 btn-hover-blue">Anasayfa</Link>
            <button className="text-gray-800 btn-hover-blue">Hakkımızda</button>
            <Link to="/iletisim" className="text-gray-800 btn-hover-blue">İletişim</Link>
          </nav>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-8">
          <DeliveryTable title="BAŞARILI TALEPLER"  rows={successfulRequests} />
          <DeliveryTable title="BAŞARISIZ TALEPLER" rows={failedRequests} />
          <DeliveryTable title="BEKLEYEN TALEPLER"  rows={pendingRequests} />
        </main>
      </div>
    </div>
  );
}
