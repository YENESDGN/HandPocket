import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Truck, PackageCheck } from 'lucide-react';
import ReceiverNavBar from '../components/ReceiverNavBar';
import type { DeliveryRequest } from '../types';
import { RequestStatus } from '../types';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    [RequestStatus.PENDING]:   { label: 'Beklemede',     icon: <Clock       size={13} />, cls: 'bg-amber-100   text-amber-700  border border-amber-200'   },
    [RequestStatus.ACCEPTED]:  { label: 'Kabul Edildi',  icon: <Truck       size={13} />, cls: 'bg-blue-100    text-blue-700   border border-blue-200'    },
    [RequestStatus.PICKED_UP]: { label: 'Kargo Alındı',  icon: <PackageCheck size={13} />, cls: 'bg-indigo-100  text-indigo-700 border border-indigo-200'  },
    [RequestStatus.DELIVERED]: { label: 'Teslim Edildi', icon: <CheckCircle2 size={13} />, cls: 'bg-green-100   text-green-700  border border-green-200'   },
    [RequestStatus.CANCELLED]: { label: 'İptal Edildi',  icon: <XCircle      size={13} />, cls: 'bg-red-100     text-red-600    border border-red-200'     },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? { label: status, icon: null, cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${cfg.cls}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

const mockDeliveries: Record<string, DeliveryRequest & { delivery_address: string }> = {
    'KRG-1': {
        id: 'KRG-1',
        sender_id: 'user-1',
        courier_id: 'courier-2',
        package_photo_url: '',
        package_description: 'Elektronik Eşya — Laptop & Aksesuar',
        pickup_address: 'Kadıköy, İstanbul',
        delivery_address: 'Beşiktaş, İstanbul',
        distance_km: 12.4,
        estimated_time_mins: 25,
        weight_kg: 2.5,
        open_time_multiplier: 1.5,
        calculated_price: 87,
        status: RequestStatus.ACCEPTED,
        created_at: new Date('2025-09-24'),
        updated_at: new Date('2025-09-24'),
    },
    'KRG-2': {
        id: 'KRG-2',
        sender_id: 'user-1',
        courier_id: 'courier-3',
        package_photo_url: '',
        package_description: 'Giysi & Aksesuar',
        pickup_address: 'Üsküdar, İstanbul',
        delivery_address: 'Şişli, İstanbul',
        distance_km: 8.1,
        estimated_time_mins: 18,
        weight_kg: 1.2,
        open_time_multiplier: 1.0,
        calculated_price: 53,
        status: RequestStatus.DELIVERED,
        created_at: new Date('2025-12-24'),
        updated_at: new Date('2025-12-24'),
    },
    'KRG-3': {
        id: 'KRG-3',
        sender_id: 'user-1',
        courier_id: 'courier-2',
        package_photo_url: '',
        package_description: 'Kitap & Kırtasiye',
        pickup_address: 'Bakırköy, İstanbul',
        delivery_address: 'Fatih, İstanbul',
        distance_km: 6.3,
        estimated_time_mins: 14,
        weight_kg: 0.8,
        open_time_multiplier: 1.0,
        calculated_price: 40,
        status: RequestStatus.PICKED_UP,
        created_at: new Date('2026-02-10'),
        updated_at: new Date('2026-02-10'),
    },
    'KRG-4': {
        id: 'KRG-4',
        sender_id: 'user-1',
        courier_id: undefined,
        package_photo_url: '',
        package_description: 'Ev Eşyası — Küçük Paket',
        pickup_address: 'Pendik, İstanbul',
        delivery_address: 'Maltepe, İstanbul',
        distance_km: 5.0,
        estimated_time_mins: 12,
        weight_kg: 3.0,
        open_time_multiplier: 2.0,
        calculated_price: 124,
        status: RequestStatus.PENDING,
        created_at: new Date('2026-05-01'),
        updated_at: new Date('2026-05-01'),
    },
    'KRG-5': {
        id: 'KRG-5',
        sender_id: 'user-3',
        courier_id: 'courier-4',
        package_photo_url: '',
        package_description: 'Tıbbi Malzeme — Kırılabilir',
        pickup_address: 'Sarıyer, İstanbul',
        delivery_address: 'Ataşehir, İstanbul',
        distance_km: 28.7,
        estimated_time_mins: 55,
        weight_kg: 1.5,
        open_time_multiplier: 2.0,
        calculated_price: 210,
        status: RequestStatus.DELIVERED,
        created_at: new Date('2026-01-15'),
        updated_at: new Date('2026-01-15'),
    },
    'KRG-6': {
        id: 'KRG-6',
        sender_id: 'user-3',
        courier_id: undefined,
        package_photo_url: '',
        package_description: 'Belge & Evrak',
        pickup_address: 'Levent, İstanbul',
        delivery_address: 'Taksim, İstanbul',
        distance_km: 3.2,
        estimated_time_mins: 8,
        weight_kg: 0.3,
        open_time_multiplier: 1.5,
        calculated_price: 35,
        status: RequestStatus.CANCELLED,
        created_at: new Date('2026-03-22'),
        updated_at: new Date('2026-03-22'),
    },
    'KRG-7': {
        id: 'KRG-7',
        sender_id: 'user-1',
        courier_id: 'courier-5',
        package_photo_url: '',
        package_description: 'Çiçek & Hediye Paketi',
        pickup_address: 'Bağcılar, İstanbul',
        delivery_address: 'Zeytinburnu, İstanbul',
        distance_km: 4.8,
        estimated_time_mins: 11,
        weight_kg: 0.6,
        open_time_multiplier: 1.0,
        calculated_price: 29,
        status: RequestStatus.PICKED_UP,
        created_at: new Date('2026-05-12'),
        updated_at: new Date('2026-05-12'),
    },
    'KRG-8': {
        id: 'KRG-8',
        sender_id: 'user-3',
        courier_id: 'courier-2',
        package_photo_url: '',
        package_description: 'Spor Ekipmanı',
        pickup_address: 'Kartal, İstanbul',
        delivery_address: 'Kadıköy, İstanbul',
        distance_km: 9.6,
        estimated_time_mins: 22,
        weight_kg: 4.2,
        open_time_multiplier: 1.0,
        calculated_price: 68,
        status: RequestStatus.ACCEPTED,
        created_at: new Date('2026-04-30'),
        updated_at: new Date('2026-04-30'),
    },
};

const statusSteps: { key: string; label: string }[] = [
    { key: RequestStatus.PENDING,   label: 'Talep Oluşturuldu' },
    { key: RequestStatus.ACCEPTED,  label: 'Kurye Kabul Etti' },
    { key: RequestStatus.PICKED_UP, label: 'Kargo Alındı' },
    { key: RequestStatus.DELIVERED, label: 'Teslim Edildi' },
];

const statusOrder: Record<string, number> = {
    pending: 0, accepted: 1, picked_up: 2, delivered: 3, cancelled: -1,
};

const priorityLabel = (m: number) => m >= 2 ? 'Çok Acil' : m >= 1.5 ? 'Acil' : 'Normal';
const priorityColor  = (m: number) =>
    m >= 2 ? 'text-red-500 bg-red-50' : m >= 1.5 ? 'text-orange-500 bg-orange-50' : 'text-green-600 bg-green-50';

export default function DeliveryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const request = id ? mockDeliveries[id] : undefined;

    if (!request) {
        return (
            <>
                <ReceiverNavBar />
                <div className='min-h-screen bg-dark-blue flex flex-col items-center justify-center gap-4 font-sextary text-center'>
                    <p className='text-secondary-blue font-bold text-7xl'>?</p>
                    <h2 className='text-white font-bold text-xl'>Teslimat Bulunamadı</h2>
                    <p className='text-white/50 text-sm'>#{id} ID'li kayıt mevcut değil.</p>
                    <Link to='/profil' className='mt-2 bg-secondary-blue text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-blue transition-all'>
                        Profile Dön
                    </Link>
                </div>
            </>
        );
    }

    const currentStep = statusOrder[request.status] ?? 0;
    const isCancelled = request.status === RequestStatus.CANCELLED;

    return (
        <>
            <ReceiverNavBar />
            <section className='grid grid-cols-[30%_70%] p-10 gap-10 items-start bg-dark-blue font-sextary min-h-screen'>

                {/* Left panel */}
                <div className='flex flex-col gap-4'>

                    {/* ID + Status */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-3 tracking-status-card'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <span className='text-gray-400 text-xs uppercase tracking-widest block'>Gönderi ID</span>
                                <h2 className='text-xl font-bold text-darker-blue'>#{request.id}</h2>
                            </div>
                            <StatusBadge status={request.status} />
                        </div>
                        <div className='flex gap-4 pt-2 border-t border-gray-100'>
                            <div className='flex-1'>
                                <span className='text-gray-400 text-xs block'>TARİH</span>
                                <span className='text-darker-blue font-semibold text-sm'>
                                    {request.created_at.toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                            <div className='flex-1'>
                                <span className='text-gray-400 text-xs block'>ÜCRET</span>
                                <span className='text-secondary-blue font-bold text-lg'>{request.calculated_price} TL</span>
                            </div>
                        </div>
                    </div>

                    {/* Status timeline */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] tracking-cargo-card'>
                        <h3 className='text-xs font-bold text-darker-blue uppercase tracking-widest mb-4'>Durum Zaman Çizelgesi</h3>
                        <div className='flex flex-col'>
                            {statusSteps.map((step, i) => {
                                const done   = i <= currentStep && !isCancelled;
                                const active = i === currentStep && !isCancelled;
                                const isLast = i === statusSteps.length - 1;
                                return (
                                    <div key={step.key} className='flex gap-3'>
                                        <div className='flex flex-col items-center'>
                                            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 transition-all ${
                                                active  ? 'bg-secondary-blue border-secondary-blue ring-4 ring-secondary-blue/20' :
                                                done    ? 'bg-secondary-blue border-secondary-blue' :
                                                          'bg-gray-200 border-gray-300'
                                            }`} />
                                            {!isLast && <div className={`w-0.5 h-8 mt-0.5 ${done ? 'bg-secondary-blue' : 'bg-gray-200'}`} />}
                                        </div>
                                        <p className={`pb-4 -mt-0.5 text-sm ${active ? 'font-bold text-darker-blue' : done ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {step.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Package details */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-3 tracking-courier-card'>
                        <h3 className='text-xs font-bold text-darker-blue uppercase tracking-widest'>Kargo Bilgileri</h3>

                        <div className='flex flex-col gap-2 text-sm'>
                            <div>
                                <span className='text-gray-400 text-xs block'>AÇIKLAMA</span>
                                <span className='text-darker-blue font-medium'>{request.package_description}</span>
                            </div>

                            <div className='grid grid-cols-2 gap-2 pt-1'>
                                <div>
                                    <span className='text-gray-400 text-xs block'>AĞIRLIK</span>
                                    <span className='text-darker-blue font-semibold'>{request.weight_kg} kg</span>
                                </div>
                                <div>
                                    <span className='text-gray-400 text-xs block'>ÖNCELİK</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor(request.open_time_multiplier)}`}>
                                        {priorityLabel(request.open_time_multiplier)}
                                    </span>
                                </div>
                                <div>
                                    <span className='text-gray-400 text-xs block'>MESAFE</span>
                                    <span className='text-darker-blue font-semibold'>{request.distance_km} km</span>
                                </div>
                                <div>
                                    <span className='text-gray-400 text-xs block'>TAHMINI SÜRE</span>
                                    <span className='text-darker-blue font-semibold'>{request.estimated_time_mins} dk</span>
                                </div>
                            </div>

                            <div className='pt-2 border-t border-gray-100 flex flex-col gap-2'>
                                <div>
                                    <span className='text-gray-400 text-xs block'>BAŞLANGIÇ</span>
                                    <span className='text-darker-blue font-medium'>{request.pickup_address}</span>
                                </div>
                                <div>
                                    <span className='text-gray-400 text-xs block'>TESLİMAT</span>
                                    <span className='text-darker-blue font-medium'>{request.delivery_address}</span>
                                </div>
                            </div>
                        </div>

                        {request.status === RequestStatus.ACCEPTED && (
                            <Link
                                to='/takip'
                                className='mt-1 w-full bg-secondary-blue text-white py-2.5 rounded-xl font-bold text-sm text-center hover:bg-dark-blue transition-all active:scale-[0.98]'
                            >
                                Canlı Takip
                            </Link>
                        )}
                    </div>
                </div>

                {/* Map */}
                <div className='relative w-full h-[calc(100vh-160px)] rounded-xl overflow-hidden drop-shadow-[0_0_15px_rgba(0,0,0,0.7)] tracking-map'>
                    <iframe
                        src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385396.60516460294!2d28.682528!3d41.005369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVsLCBUw7xya2l5ZQ!5e0!3m2!1str!2str!4v1234567890'
                        className='w-full h-full border-0'
                        loading='lazy'
                        referrerPolicy='no-referrer-when-downgrade'
                        title='Teslimat Haritası'
                    />
                </div>
            </section>
        </>
    );
}
