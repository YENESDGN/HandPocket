import { useState } from 'react';
import { MapPin, Weight, Clock } from 'lucide-react';
import ReceiverNavBar from '../components/ReceiverNavBar';
import DeliveryAmountCard from '../components/DeliveryAmountCard';
import type { DeliveryRequest } from '../types';

interface AvailableRequest extends DeliveryRequest {
    delivery_address: string;
}

const availableRequests: AvailableRequest[] = [
    {
        id: 'REQ-101',
        sender_id: 'user-2',
        package_photo_url: '',
        package_description: 'Elektronik Eşya',
        pickup_address: 'Kadıköy, İstanbul',
        delivery_address: 'Beşiktaş, İstanbul',
        distance_km: 1.2,
        estimated_time_mins: 15,
        weight_kg: 2.5,
        open_time_multiplier: 1.0,
        calculated_price: 27,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 'REQ-102',
        sender_id: 'user-3',
        package_photo_url: '',
        package_description: 'Tıbbi Malzeme — Kırılabilir',
        pickup_address: 'Üsküdar, İstanbul',
        delivery_address: 'Şişli, İstanbul',
        distance_km: 9.4,
        estimated_time_mins: 22,
        weight_kg: 1.0,
        open_time_multiplier: 2.0,
        calculated_price: 115,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 'REQ-103',
        sender_id: 'user-5',
        package_photo_url: '',
        package_description: 'Giysi & Aksesuar',
        pickup_address: 'Bakırköy, İstanbul',
        delivery_address: 'Fatih, İstanbul',
        distance_km: 5.7,
        estimated_time_mins: 13,
        weight_kg: 0.8,
        open_time_multiplier: 1.0,
        calculated_price: 42,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 'REQ-104',
        sender_id: 'user-7',
        package_photo_url: '',
        package_description: 'Belge & Evrak',
        pickup_address: 'Levent, İstanbul',
        delivery_address: 'Taksim, İstanbul',
        distance_km: 3.2,
        estimated_time_mins: 8,
        weight_kg: 0.3,
        open_time_multiplier: 1.5,
        calculated_price: 55,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 'REQ-105',
        sender_id: 'user-9',
        package_photo_url: '',
        package_description: 'Spor Ekipmanı',
        pickup_address: 'Kartal, İstanbul',
        delivery_address: 'Kadıköy, İstanbul',
        distance_km: 9.6,
        estimated_time_mins: 22,
        weight_kg: 4.2,
        open_time_multiplier: 1.0,
        calculated_price: 68,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 'REQ-106',
        sender_id: 'user-11',
        package_photo_url: '',
        package_description: 'Çiçek & Hediye Paketi',
        pickup_address: 'Bağcılar, İstanbul',
        delivery_address: 'Zeytinburnu, İstanbul',
        distance_km: 4.8,
        estimated_time_mins: 11,
        weight_kg: 0.6,
        open_time_multiplier: 1.5,
        calculated_price: 49,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
    },
];

const priorityLabel = (m: number) => m >= 2 ? 'Çok Acil' : m >= 1.5 ? 'Acil' : 'Normal';

const priorityBadge = (m: number) =>
    m >= 2
        ? 'bg-red-100 text-red-600 border border-red-200'
        : m >= 1.5
        ? 'bg-amber-100 text-amber-700 border border-amber-200'
        : 'bg-green-100 text-green-700 border border-green-200';


export default function RecieverPage() {
    const [selected, setSelected] = useState<AvailableRequest>(availableRequests[0]);

    const handleAccept = () => {
        // TODO: API call to accept delivery
    };

    return (
        <>
            <ReceiverNavBar />
            <section className='grid grid-cols-[22%_1fr_22%] p-10 gap-6 items-start bg-dark-blue font-sextary min-h-screen'>

                {/* Left — selected request details */}
                <div className='bg-tertiary-blue w-full rounded-xl p-4 flex flex-col gap-2 drop-shadow-[0_0_15px_rgba(0,0,0,0.7)] receiver-panel'>
                    <div className='flex items-center justify-between mb-1'>
                        <span className='text-white font-bold text-sm uppercase tracking-widest'>Seçili Talep</span>
                        <span className='text-white/50 text-xs font-mono'>{selected.id}</span>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='text-white/70 text-xs uppercase tracking-wider'>Kargo Adı</span>
                        <input
                            type='text'
                            readOnly
                            value={selected.package_description}
                            className='bg-white text-black rounded px-3 py-2 cursor-default text-sm'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='text-white/70 text-xs uppercase tracking-wider'>Başlangıç</span>
                        <input
                            type='text'
                            readOnly
                            value={selected.pickup_address}
                            className='bg-white text-black rounded px-3 py-2 cursor-default text-sm'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='text-white/70 text-xs uppercase tracking-wider'>Bitiş</span>
                        <input
                            type='text'
                            readOnly
                            value={selected.delivery_address}
                            className='bg-white text-black rounded px-3 py-2 cursor-default text-sm'
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col gap-1'>
                            <span className='text-white/70 text-xs uppercase tracking-wider'>Ağırlık (kg)</span>
                            <input
                                type='number'
                                readOnly
                                value={selected.weight_kg}
                                className='bg-white text-black rounded px-3 py-2 cursor-default text-sm'
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-white/70 text-xs uppercase tracking-wider'>Öncelik</span>
                            <div className={`rounded px-3 py-2 text-xs font-bold ${priorityBadge(selected.open_time_multiplier)}`}>
                                {priorityLabel(selected.open_time_multiplier)}
                            </div>
                        </div>
                    </div>

                    <DeliveryAmountCard
                        distanceKm={selected.distance_km}
                        estimatedTimeMins={selected.estimated_time_mins}
                        calculatedPrice={selected.calculated_price}
                        onAccept={handleAccept}
                    />
                </div>

                {/* Center — map */}
                <div className='relative w-full h-[850px] rounded-xl overflow-hidden receiver-map'>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385396.60516460294!2d28.682528!3d41.005369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVsLCBUw7xya2l5ZQ!5e0!3m2!1str!2str!4v1234567890"
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Kargo Haritası"
                    />
                </div>

                {/* Right — available requests list */}
                <div className='flex flex-col h-[850px] bg-secondary-blue rounded-xl overflow-hidden drop-shadow-[0_0_5px_rgba(0,0,0,0.4)] receiver-list'>
                    {/* Header */}
                    <div className='px-4 py-3 border-b border-white/20 flex items-center justify-between flex-shrink-0'>
                        <span className='text-white font-bold text-sm uppercase tracking-widest'>Bekleyen Talepler</span>
                        <span className='bg-white text-secondary-blue text-xs font-bold px-2.5 py-0.5 rounded-full'>
                            {availableRequests.length}
                        </span>
                    </div>

                    {/* Scrollable list */}
                    <div className='flex-1 overflow-y-auto flex flex-col gap-2 p-3'>
                        {availableRequests.map((req) => {
                            const isActive = req.id === selected.id;
                            return (
                                <button
                                    key={req.id}
                                    onClick={() => setSelected(req)}
                                    className={`w-full text-left rounded-xl p-3 transition-all duration-200 ${
                                        isActive
                                            ? 'bg-white ring-2 ring-darker-blue shadow-md'
                                            : 'bg-white/90 hover:bg-white hover:shadow-md'
                                    }`}
                                >   
                                    {/* Top row */}
                                    <div className='flex items-start justify-between gap-2 mb-2'>
                                        <span className='text-darker-blue font-semibold text-xs leading-snug line-clamp-2'>
                                            {req.package_description}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityBadge(req.open_time_multiplier)}`}>
                                            {priorityLabel(req.open_time_multiplier)}
                                        </span>
                                    </div>

                                    {/* Route */}
                                    <div className='flex items-center gap-1.5 text-darker-blue/60 text-xs mb-2'>
                                        <MapPin size={11} className='flex-shrink-0' />
                                        <span className='truncate'>{req.pickup_address}</span>
                                        <span className='text-darker-blue/30'>→</span>
                                        <span className='truncate'>{req.delivery_address}</span>
                                    </div>

                                    {/* Stats row */}
                                    <div className='flex items-center gap-3 text-[11px]'>
                                        <span className='flex items-center gap-1 text-darker-blue/50'>
                                            <Clock size={10} /> {req.estimated_time_mins} dk
                                        </span>
                                        <span className='flex items-center gap-1 text-darker-blue/50'>
                                            <Weight size={10} /> {req.weight_kg} kg
                                        </span>

                                    </div>

                                    {isActive && (
                                        <div className='mt-2 pt-2 border-t border-darker-blue/10 flex items-center gap-1 text-darker-blue text-[10px] font-bold uppercase tracking-wider'>
                                            Seçildi
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </section>
        </>
    );
}
