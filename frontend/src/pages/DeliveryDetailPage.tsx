import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Truck, PackageCheck, Loader2 } from 'lucide-react';
import ReceiverNavBar from '../components/ReceiverNavBar';
import MapboxMap from '../components/MapboxMap';
import type { MapMarker } from '../components/MapboxMap';
import api from '../lib/api';
import type { DeliveryRequest } from '../types';
import { RequestStatus } from '../types';

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            { headers: { 'Accept-Language': 'tr' } }
        );
        const data = await res.json();
        if (!data.length) return null;
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {
        return null;
    }
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    [RequestStatus.PENDING]:   { label: 'Beklemede',     icon: <Clock        size={13} />, cls: 'bg-amber-100  text-amber-700  border border-amber-200'  },
    [RequestStatus.ACCEPTED]:  { label: 'Kabul Edildi',  icon: <Truck        size={13} />, cls: 'bg-blue-100   text-blue-700   border border-blue-200'   },
    [RequestStatus.PICKED_UP]: { label: 'Kargo Alındı',  icon: <PackageCheck size={13} />, cls: 'bg-indigo-100 text-indigo-700 border border-indigo-200' },
    [RequestStatus.DELIVERED]: { label: 'Teslim Edildi', icon: <CheckCircle2 size={13} />, cls: 'bg-green-100  text-green-700  border border-green-200'  },
    [RequestStatus.CANCELLED]: { label: 'İptal Edildi',  icon: <XCircle      size={13} />, cls: 'bg-red-100    text-red-600    border border-red-200'    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? { label: status, icon: null, cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${cfg.cls}`}>
            {cfg.icon}{cfg.label}
        </span>
    );
}

const statusSteps: { key: string; label: string }[] = [
    { key: RequestStatus.PENDING,   label: 'Talep Oluşturuldu' },
    { key: RequestStatus.ACCEPTED,  label: 'Kurye Kabul Etti'  },
    { key: RequestStatus.PICKED_UP, label: 'Kargo Alındı'      },
    { key: RequestStatus.DELIVERED, label: 'Teslim Edildi'     },
];

const statusOrder: Record<string, number> = {
    pending: 0, accepted: 1, picked_up: 2, delivered: 3, cancelled: -1,
};

const priorityLabel = (m: number) => m >= 2 ? 'Çok Acil' : m >= 1.5 ? 'Acil' : 'Normal';
const priorityColor  = (m: number) =>
    m >= 2 ? 'text-red-500 bg-red-50' : m >= 1.5 ? 'text-orange-500 bg-orange-50' : 'text-green-600 bg-green-50';

export default function DeliveryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [request, setRequest]   = useState<DeliveryRequest | null>(null);
    const [loading, setLoading]   = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
    const [mapRoute, setMapRoute]     = useState<[number, number][]>([]);
    const routeAbortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!id) { setNotFound(true); setLoading(false); return; }
        api.get<DeliveryRequest>(`/tasks/${id}`)
            .then(({ data }) => setRequest(data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!request) return;
        routeAbortRef.current?.abort();
        const ctrl = new AbortController();
        routeAbortRef.current = ctrl;

        Promise.all([
            geocodeAddress(request.pickup_address),
            geocodeAddress(request.delivery_address),
        ]).then(async ([pickup, delivery]) => {
            if (ctrl.signal.aborted) return;
            const markers: MapMarker[] = [];
            if (pickup)   markers.push({ lng: pickup.lng,   lat: pickup.lat,   color: '#004561', popup: 'Başlangıç' });
            if (delivery) markers.push({ lng: delivery.lng, lat: delivery.lat, color: '#08b4fb', popup: 'Bitiş' });
            setMapMarkers(markers);
            if (pickup && delivery) {
                try {
                    const res = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}?overview=full&geometries=geojson`,
                        { signal: ctrl.signal }
                    );
                    const data = await res.json();
                    if (!ctrl.signal.aborted && data.code === 'Ok') {
                        setMapRoute(data.routes[0].geometry.coordinates as [number, number][]);
                    }
                } catch { /* aborted */ }
            }
        });
        return () => ctrl.abort();
    }, [request?.id]);

    if (loading) {
        return (
            <>
                <ReceiverNavBar />
                <div className='min-h-screen bg-dark-blue flex items-center justify-center'>
                    <Loader2 size={40} className='text-primary-blue animate-spin' />
                </div>
            </>
        );
    }

    if (notFound || !request) {
        return (
            <>
                <ReceiverNavBar />
                <div className='min-h-screen bg-dark-blue flex flex-col items-center justify-center gap-4 font-sextary text-center'>
                    <p className='text-secondary-blue font-bold text-7xl'>?</p>
                    <h2 className='text-white font-bold text-xl'>Teslimat Bulunamadı</h2>
                    <p className='text-white/50 text-sm'>{id} ID'li kayıt mevcut değil.</p>
                    <Link to='/profil' className='mt-2 bg-secondary-blue text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-blue transition-all'>
                        Profile Dön
                    </Link>
                </div>
            </>
        );
    }

    const currentStep  = statusOrder[request.status] ?? 0;
    const isCancelled  = request.status === RequestStatus.CANCELLED;
    const createdDate  = new Date(request.created_at).toLocaleDateString('tr-TR');

    return (
        <>
            <ReceiverNavBar />
            <section className='grid grid-cols-[30%_70%] p-10 gap-10 items-start bg-dark-blue font-sextary min-h-screen'>

                {/* Left panel */}
                <div className='flex flex-col gap-4'>

                    {/* ID + Status */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-3'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <span className='text-gray-400 text-xs uppercase tracking-widest block'>Gönderi ID</span>
                                <h2 className='text-xl font-bold text-darker-blue font-mono'>{request.id.slice(0, 8).toUpperCase()}</h2>
                            </div>
                            <StatusBadge status={request.status} />
                        </div>
                        <div className='flex gap-4 pt-2 border-t border-gray-100'>
                            <div className='flex-1'>
                                <span className='text-gray-400 text-xs block'>TARİH</span>
                                <span className='text-darker-blue font-semibold text-sm'>{createdDate}</span>
                            </div>
                            <div className='flex-1'>
                                <span className='text-gray-400 text-xs block'>ÜCRET</span>
                                <span className='text-secondary-blue font-bold text-lg'>{request.calculated_price != null ? Number(request.calculated_price).toFixed(2) : '—'} TL</span>
                            </div>
                        </div>
                    </div>

                    {/* Status timeline */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]'>
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
                                                active ? 'bg-secondary-blue border-secondary-blue ring-4 ring-secondary-blue/20' :
                                                done   ? 'bg-secondary-blue border-secondary-blue' :
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
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-3'>
                        <h3 className='text-xs font-bold text-darker-blue uppercase tracking-widest'>Kargo Bilgileri</h3>
                        <div className='flex flex-col gap-2 text-sm'>
                            <div>
                                <span className='text-gray-400 text-xs block'>AÇIKLAMA</span>
                                <span className='text-darker-blue font-medium'>{request.package_description}</span>
                            </div>
                            <div className='grid grid-cols-2 gap-2 pt-1'>
                                <div>
                                    <span className='text-gray-400 text-xs block'>AĞIRLIK</span>
                                    <span className='text-darker-blue font-semibold'>{Number(request.weight_kg).toFixed(2)} kg</span>
                                </div>
                                <div>
                                    <span className='text-gray-400 text-xs block'>ÖNCELİK</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor(request.open_time_multiplier)}`}>
                                        {priorityLabel(request.open_time_multiplier)}
                                    </span>
                                </div>
                                <div>
                                    <span className='text-gray-400 text-xs block'>MESAFE</span>
                                    <span className='text-darker-blue font-semibold'>{request.distance_km != null ? Number(request.distance_km).toFixed(2) : '—'} km</span>
                                </div>
                                <div>
                                    <span className='text-gray-400 text-xs block'>TAHMİNİ SÜRE</span>
                                    <span className='text-darker-blue font-semibold'>{request.estimated_time_mins ?? '—'} dk</span>
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
                <div className='relative w-full h-[calc(100vh-160px)] rounded-xl overflow-hidden drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]'>
                    <MapboxMap markers={mapMarkers} route={mapRoute} />
                </div>
            </section>
        </>
    );
}
