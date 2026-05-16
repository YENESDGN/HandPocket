import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, LogOut, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import type { User, DeliveryRequest, Dispute } from '../types';
import { UserRole, RequestStatus } from '../types';
import { useAuthStore } from '../store/auth';
import { getAllDisputes, resolveDispute } from '../services/disputeService';

type AdminNav = 'genel' | 'kullanicilar' | 'teslimatlar' | 'itirazlar';

const mockUsers: User[] = [
    { id: 'u-1', full_name: 'Yağız Enes DOĞAN',  role: UserRole.SENDER,  email: 'yenesdogan@outlook.com.tr', phone_number: '+90 530 301 6118', wallet_balance: 236,  average_rating: 4.9, is_banned: false, created_at: new Date('2024-03-01') },
    { id: 'u-2', full_name: 'Ahmet Yılmaz',       role: UserRole.COURIER, email: 'ahmet@mail.com',             phone_number: '+90 532 100 2233', wallet_balance: 1240, average_rating: 4.7, is_banned: false, created_at: new Date('2024-04-15') },
    { id: 'u-3', full_name: 'Zeynep Kaya',        role: UserRole.SENDER,  email: 'zeynep@mail.com',            phone_number: '+90 541 200 3344', wallet_balance: 80,   average_rating: 4.5, is_banned: false, created_at: new Date('2024-05-20') },
    { id: 'u-4', full_name: 'Mert Demir',         role: UserRole.COURIER, email: 'mert@mail.com',              phone_number: '+90 555 300 4455', wallet_balance: 750,  average_rating: 4.2, is_banned: true,  created_at: new Date('2024-06-10') },
    { id: 'u-5', full_name: 'Admin',              role: UserRole.ADMIN,   email: 'admin@handpocket.com',       phone_number: '+90 212 000 0000', wallet_balance: 0,    average_rating: undefined, is_banned: false, created_at: new Date('2024-01-01') },
];

const mockDeliveries: (DeliveryRequest & { delivery_address: string })[] = [
    { id: 'KRG-1', sender_id: 'u-1', courier_id: 'u-2', package_photo_url: '', package_description: 'Elektronik Eşya',   pickup_address: 'Kadıköy',  delivery_address: 'Beşiktaş', distance_km: 12.4, estimated_time_mins: 25, weight_kg: 2.5, open_time_multiplier: 1.5, calculated_price: 87,  status: RequestStatus.DELIVERED, created_at: new Date('2025-09-24'), updated_at: new Date() },
    { id: 'KRG-2', sender_id: 'u-3', courier_id: 'u-4', package_photo_url: '', package_description: 'Giysi & Aksesuar', pickup_address: 'Üsküdar',  delivery_address: 'Şişli',    distance_km: 8.1,  estimated_time_mins: 18, weight_kg: 1.2, open_time_multiplier: 1.0, calculated_price: 53,  status: RequestStatus.DELIVERED, created_at: new Date('2025-12-24'), updated_at: new Date() },
    { id: 'KRG-3', sender_id: 'u-1', courier_id: 'u-2', package_photo_url: '', package_description: 'Kitap & Kırtasiye', pickup_address: 'Bakırköy', delivery_address: 'Fatih',    distance_km: 6.3,  estimated_time_mins: 14, weight_kg: 0.8, open_time_multiplier: 1.0, calculated_price: 40,  status: RequestStatus.PICKED_UP, created_at: new Date('2026-02-10'), updated_at: new Date() },
    { id: 'KRG-4', sender_id: 'u-3', courier_id: undefined, package_photo_url: '', package_description: 'Ev Eşyası', pickup_address: 'Pendik',    delivery_address: 'Maltepe',  distance_km: 5.0,  estimated_time_mins: 12, weight_kg: 3.0, open_time_multiplier: 2.0, calculated_price: 124, status: RequestStatus.PENDING,   created_at: new Date('2026-05-12'), updated_at: new Date() },
];

const overviewStats = [
    { label: 'Toplam Kullanıcı',   value: '2.341',  color: 'bg-secondary-blue' },
    { label: 'Aktif Kurye',        value: '187',     color: 'bg-dark-blue'      },
    { label: 'Toplam Teslimat',    value: '50.241',  color: 'bg-darker-blue'    },
    { label: 'Aylık Gelir',        value: '₺84.2K',  color: 'bg-tertiary-blue'  },
];

const roleLabel: Record<string, string> = {
    sender: 'Gönderici', courier: 'Kurye', admin: 'Admin',
};

const statusColor: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700',
    accepted:  'bg-blue-100 text-blue-700',
    picked_up: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const statusLabel: Record<string, string> = {
    pending: 'Bekliyor', accepted: 'Kabul Edildi', picked_up: 'Alındı', delivered: 'Teslim Edildi', cancelled: 'İptal',
};

export default function AdminDashboard() {
    const [activeNav, setActiveNav] = useState<AdminNav>('genel');
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [disputesLoading, setDisputesLoading] = useState(false);
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const signOut = useAuthStore((s) => s.signOut);
    const navigate = useNavigate();

    useEffect(() => {
        if (activeNav !== 'itirazlar') return;
        setDisputesLoading(true);
        getAllDisputes()
            .then(setDisputes)
            .catch(() => setDisputes([]))
            .finally(() => setDisputesLoading(false));
    }, [activeNav]);

    const handleResolve = async (id: string) => {
        setResolvingId(id);
        try {
            const updated = await resolveDispute(id);
            setDisputes((prev) => prev.map((d) => d.id === id ? updated : d));
        } finally {
            setResolvingId(null);
        }
    };

    const navClass = (item: AdminNav) =>
        `flex items-center gap-3 px-3 py-2.5 rounded text-sm text-left w-full transition-all ${
            activeNav === item ? 'bg-dark-blue text-white font-semibold' : 'text-white/90 btn-hover-shadow-blue'
        }`;

    return (
        <div className='profile-bg relative flex h-screen overflow-hidden font-sextary'>

            {/* Sidebar */}
            <aside className='w-52 bg-darker-blue flex flex-col flex-shrink-0 profile-sidebar'>
                <div className='flex flex-col items-center pt-8 pb-6 px-4 border-b border-white/10'>
                    <div className='w-16 h-16 rounded-full bg-secondary-blue flex items-center justify-center mb-3'>
                        <ShieldCheck size={28} className='text-white' />
                    </div>
                    <p className='text-white font-bold text-sm text-center'>Admin Paneli</p>
                    <p className='text-white/50 text-xs mt-1'>admin@handpocket.com</p>
                </div>

                <nav className='flex flex-col gap-1 px-3 py-4 flex-1'>
                    <button className={navClass('genel')} onClick={() => setActiveNav('genel')}>
                        <LayoutDashboard size={18} /> Genel Bakış
                    </button>
                    <button className={navClass('kullanicilar')} onClick={() => setActiveNav('kullanicilar')}>
                        <Users size={18} /> Kullanıcılar
                    </button>
                    <button className={navClass('teslimatlar')} onClick={() => setActiveNav('teslimatlar')}>
                        <Package size={18} /> Teslimatlar
                    </button>
                    <button className={navClass('itirazlar')} onClick={() => setActiveNav('itirazlar')}>
                        <AlertTriangle size={18} /> İtirazlar
                    </button>
                </nav>

                <div className='px-3 pb-6'>
                    <button onClick={() => { signOut(); navigate('/'); }} className='flex items-center gap-3 px-3 py-2.5 rounded text-red-400 btn-hover-shadow-blue text-sm font-semibold w-full'>
                        <LogOut size={18} /> Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className='flex flex-col flex-1 overflow-hidden'>

                {/* Top navbar */}
                <header className='backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-8 py-5 flex-shrink-0'>
                    <img src='/assets/favicon.png' alt='HandPocket' className='w-16 h-16 object-contain' />
                    <span className='text-darker-blue font-bold text-lg'>Admin Paneli</span>
                    <div className='w-16 h-16' />
                </header>

                <main className='main-bg flex-1 overflow-y-auto p-8'>

                    {/* Genel Bakış */}
                    {activeNav === 'genel' && (
                        <div className='flex flex-col gap-6'>
                            <div className='grid grid-cols-4 gap-4 fade-in-up'>
                                {overviewStats.map((s) => (
                                    <div key={s.label} className={`${s.color} rounded-xl p-5 text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]`}>
                                        <span className='text-white/70 text-xs block mb-1'>{s.label}</span>
                                        <span className='text-3xl font-bold'>{s.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Recent deliveries preview */}
                            <div className='bg-white rounded-xl overflow-hidden drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up-delay-1'>
                                <div className='bg-darker-blue px-5 py-3 flex items-center justify-between'>
                                    <span className='text-white font-bold text-sm uppercase tracking-wide'>Son Teslimatlar</span>
                                    <button onClick={() => setActiveNav('teslimatlar')} className='text-white/60 text-xs hover:text-white transition-colors'>
                                        Tümünü Gör →
                                    </button>
                                </div>
                                <table className='w-full text-sm font-sextary'>
                                    <thead>
                                        <tr className='border-b border-gray-100'>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>ID</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Açıklama</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Ücret</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockDeliveries.slice(0, 3).map((d) => (
                                            <tr key={d.id} className='border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors'>
                                                <td className='px-5 py-3 font-semibold text-darker-blue'>#{d.id}</td>
                                                <td className='px-5 py-3 text-gray-700'>{d.package_description}</td>
                                                <td className='px-5 py-3 text-secondary-blue font-bold'>{d.calculated_price} TL</td>
                                                <td className='px-5 py-3'>
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[d.status]}`}>
                                                        {statusLabel[d.status]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Recent users preview */}
                            <div className='bg-white rounded-xl overflow-hidden drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up-delay-2'>
                                <div className='bg-darker-blue px-5 py-3 flex items-center justify-between'>
                                    <span className='text-white font-bold text-sm uppercase tracking-wide'>Son Kullanıcılar</span>
                                    <button onClick={() => setActiveNav('kullanicilar')} className='text-white/60 text-xs hover:text-white transition-colors'>
                                        Tümünü Gör →
                                    </button>
                                </div>
                                <table className='w-full text-sm font-sextary'>
                                    <thead>
                                        <tr className='border-b border-gray-100'>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Ad Soyad</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Rol</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Puan</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockUsers.slice(0, 3).map((u) => (
                                            <tr key={u.id} className='border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors'>
                                                <td className='px-5 py-3 font-semibold text-darker-blue'>{u.full_name}</td>
                                                <td className='px-5 py-3 text-gray-600'>{roleLabel[u.role]}</td>
                                                <td className='px-5 py-3 text-gray-700'>{u.average_rating ?? '—'}</td>
                                                <td className='px-5 py-3'>
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.is_banned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                                        {u.is_banned ? 'Yasaklı' : 'Aktif'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Kullanıcılar */}
                    {activeNav === 'kullanicilar' && (
                        <div className='bg-white rounded-xl overflow-hidden drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up'>
                            <div className='bg-darker-blue px-5 py-3'>
                                <span className='text-white font-bold text-sm uppercase tracking-wide'>Tüm Kullanıcılar</span>
                            </div>
                            <table className='w-full text-sm font-sextary'>
                                <thead>
                                    <tr className='border-b border-gray-100'>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Ad Soyad</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>E-Posta</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Rol</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Bakiye</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Puan</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Durum</th>
                                        <th className='px-5 py-3' />
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockUsers.map((u) => (
                                        <tr key={u.id} className='border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors'>
                                            <td className='px-5 py-3 font-semibold text-darker-blue'>{u.full_name}</td>
                                            <td className='px-5 py-3 text-gray-500'>{u.email}</td>
                                            <td className='px-5 py-3'>
                                                <span className='bg-secondary-blue/10 text-secondary-blue text-xs font-bold px-2.5 py-1 rounded-full'>
                                                    {roleLabel[u.role]}
                                                </span>
                                            </td>
                                            <td className='px-5 py-3 text-gray-700'>{u.wallet_balance ?? 0} TL</td>
                                            <td className='px-5 py-3 text-gray-700'>{u.average_rating ?? '—'}</td>
                                            <td className='px-5 py-3'>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.is_banned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                                    {u.is_banned ? 'Yasaklı' : 'Aktif'}
                                                </span>
                                            </td>
                                            <td className='px-5 py-3'>
                                                <button className='text-xs text-secondary-blue font-semibold hover:text-dark-blue transition-colors'>
                                                    {u.is_banned ? 'Yasağı Kaldır' : 'Yasakla'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* İtirazlar */}
                    {activeNav === 'itirazlar' && (
                        <div className='bg-white rounded-xl overflow-hidden drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up'>
                            <div className='bg-darker-blue px-5 py-3 flex items-center justify-between'>
                                <span className='text-white font-bold text-sm uppercase tracking-wide'>Tüm İtirazlar</span>
                                <span className='text-white/60 text-xs'>{disputes.length} kayıt</span>
                            </div>
                            {disputesLoading ? (
                                <div className='flex justify-center py-12'>
                                    <Loader2 size={28} className='text-secondary-blue animate-spin' />
                                </div>
                            ) : disputes.length === 0 ? (
                                <p className='text-center text-gray-400 text-sm py-10'>Açık itiraz yok.</p>
                            ) : (
                                <table className='w-full text-sm font-sextary'>
                                    <thead>
                                        <tr className='border-b border-gray-100'>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Talep ID</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Açan</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Sebep</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Tarih</th>
                                            <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Durum</th>
                                            <th className='px-5 py-3' />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {disputes.map((d) => (
                                            <tr key={d.id} className='border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors'>
                                                <td className='px-5 py-3'>
                                                    <Link to={`/talep/${d.request_id}`} className='text-secondary-blue font-mono text-xs font-semibold hover:underline'>
                                                        {d.request_id.slice(0, 8).toUpperCase()}
                                                    </Link>
                                                </td>
                                                <td className='px-5 py-3 text-gray-700 font-mono text-xs'>{d.raised_by.slice(0, 8).toUpperCase()}</td>
                                                <td className='px-5 py-3 text-gray-700 max-w-xs truncate' title={d.reason}>{d.reason}</td>
                                                <td className='px-5 py-3 text-gray-500 text-xs'>{new Date(d.created_at).toLocaleDateString('tr-TR')}</td>
                                                <td className='px-5 py-3'>
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.resolved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {d.resolved ? 'Çözüldü' : 'Açık'}
                                                    </span>
                                                </td>
                                                <td className='px-5 py-3 text-right'>
                                                    {!d.resolved && (
                                                        <button
                                                            onClick={() => handleResolve(d.id)}
                                                            disabled={resolvingId === d.id}
                                                            className='text-xs bg-secondary-blue text-white font-semibold px-3 py-1.5 rounded-full hover:bg-dark-blue transition-colors disabled:opacity-60 inline-flex items-center gap-1.5'
                                                        >
                                                            {resolvingId === d.id && <Loader2 size={12} className='animate-spin' />}
                                                            Çözüldü olarak işaretle
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Teslimatlar */}
                    {activeNav === 'teslimatlar' && (
                        <div className='bg-white rounded-xl overflow-hidden drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up'>
                            <div className='bg-darker-blue px-5 py-3'>
                                <span className='text-white font-bold text-sm uppercase tracking-wide'>Tüm Teslimatlar</span>
                            </div>
                            <table className='w-full text-sm font-sextary'>
                                <thead>
                                    <tr className='border-b border-gray-100'>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>ID</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Açıklama</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Güzergah</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Mesafe</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Ücret</th>
                                        <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockDeliveries.map((d) => (
                                        <tr key={d.id} className='border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors'>
                                            <td className='px-5 py-3 font-semibold text-darker-blue'>#{d.id}</td>
                                            <td className='px-5 py-3 text-gray-700'>{d.package_description}</td>
                                            <td className='px-5 py-3 text-gray-500 text-xs'>{d.pickup_address} → {d.delivery_address}</td>
                                            <td className='px-5 py-3 text-gray-700'>{d.distance_km} km</td>
                                            <td className='px-5 py-3 text-secondary-blue font-bold'>{d.calculated_price} TL</td>
                                            <td className='px-5 py-3'>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[d.status]}`}>
                                                    {statusLabel[d.status]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
