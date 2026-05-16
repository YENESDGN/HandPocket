import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ReceiverNavBar from '../components/ReceiverNavBar';
import MapboxMap from '../components/MapboxMap';
import type { MapMarker } from '../components/MapboxMap';
import type { DeliveryRequest, User } from '../types';
import { getUserById } from '../services/userService';

const statusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        pending: 'Beklemede',
        accepted: 'Yolda',
        picked_up: 'Alındı',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal',
    };
    return labels[status] ?? status;
};

const priorityLabel = (multiplier: number): string => {
    if (multiplier >= 2.0) return 'Çok Acil';
    if (multiplier >= 1.5) return 'Acil';
    return 'Normal';
};

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
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

function calcEta(estimatedMins: number): string {
    const arrival = new Date(Date.now() + estimatedMins * 60 * 1000);
    return arrival.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function TrackingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const request: DeliveryRequest | null = (location.state as { request?: DeliveryRequest })?.request ?? null;

    const [courier, setCourier]     = useState<User | null>(null);
    const [courierLoading, setCourierLoading] = useState(false);
    const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
    const [mapCenter, setMapCenter]   = useState<[number, number]>([29.01, 41.025]);

    useEffect(() => {
        if (!request?.courier_id) return;
        setCourierLoading(true);
        getUserById(request.courier_id)
            .then(setCourier)
            .catch(() => {})
            .finally(() => setCourierLoading(false));
    }, [request?.courier_id]);

    useEffect(() => {
        if (!request?.pickup_address) return;
        geocode(request.pickup_address).then((coords) => {
            if (!coords) return;
            setMapCenter([coords.lng, coords.lat]);
            setMapMarkers([{ lng: coords.lng, lat: coords.lat, color: '#1ea4dc', popup: 'Kurye Konumu' }]);
        });
    }, [request?.pickup_address]);

    if (!request) {
        return (
            <>
                <ReceiverNavBar />
                <div className='min-h-screen bg-dark-blue flex flex-col items-center justify-center gap-4 font-sextary'>
                    <p className='text-white text-lg'>Gönderi bilgisi bulunamadı.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className='bg-secondary-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-blue transition-all'
                    >
                        Geri Dön
                    </button>
                </div>
            </>
        );
    }

    const eta = calcEta(request.estimated_time_mins);

    return (
        <>
            <ReceiverNavBar />
            <section className='grid grid-cols-[23%_77%] p-10 gap-10 items-start bg-dark-blue font-sextary min-h-screen'>

                {/* Left Panel */}
                <div className='flex flex-col gap-4'>

                    {/* Status Card */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-3'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <span className='text-gray-500 text-xs uppercase tracking-widest block'>Gönderi ID</span>
                                <h2 className='text-xl font-bold text-darker-blue'>#{request.id.slice(0, 8)}</h2>
                            </div>
                            <span className='bg-secondary-blue text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
                                {statusLabel(request.status)}
                            </span>
                        </div>
                        <div className='flex items-center gap-4 pt-2 border-t border-gray-100'>
                            <div className='flex-1'>
                                <span className='text-gray-400 text-xs block'>TAHMİNİ VARIŞ</span>
                                <span className='text-3xl font-bold text-secondary-blue'>{eta}</span>
                                <span className='text-gray-500 text-sm ml-1'>Bugün</span>
                            </div>
                            <div className='w-px h-12 bg-gray-200' />
                            <div className='flex-1'>
                                <span className='text-gray-400 text-xs block'>MESAFE</span>
                                <span className='text-xl font-bold text-darker-blue'>{request.distance_km} km</span>
                            </div>
                        </div>
                    </div>

                    {/* Cargo Details Card */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-4'>
                        <div className='flex items-center gap-2'>
                            <div className='bg-secondary-blue rounded-lg p-1.5 text-white'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                </svg>
                            </div>
                            <h3 className='text-base font-bold text-darker-blue'>Kargo Detayları</h3>
                        </div>
                        <p className='text-gray-500 text-sm -mt-2'>{request.package_description}</p>

                        <div className='relative pl-6 flex flex-col gap-5'>
                            <div className='absolute left-[7px] top-3 bottom-3 w-0.5 bg-gray-200' />
                            <div className='relative'>
                                <div className='absolute -left-[21px] top-1 w-3.5 h-3.5 bg-secondary-blue rounded-full border-2 border-white ring-2 ring-secondary-blue/30' />
                                <span className='text-gray-400 text-xs uppercase tracking-widest block'>BAŞLANGIÇ</span>
                                <p className='text-darker-blue font-semibold text-sm'>{request.pickup_address}</p>
                            </div>
                            <div className='relative'>
                                <div className='absolute -left-[21px] top-1 w-3.5 h-3.5 bg-primary-blue rounded-full border-2 border-white ring-2 ring-primary-blue/30' />
                                <span className='text-gray-400 text-xs uppercase tracking-widest block'>TESLİMAT</span>
                                <p className='text-darker-blue font-semibold text-sm'>{request.delivery_address}</p>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-2 pt-2 border-t border-gray-100'>
                            <div>
                                <span className='text-gray-400 text-xs block'>AĞIRLIK</span>
                                <span className='text-darker-blue font-semibold text-sm'>{request.weight_kg} kg</span>
                            </div>
                            <div>
                                <span className='text-gray-400 text-xs block'>ÖNCELİK</span>
                                <span className='text-darker-blue font-semibold text-sm'>{priorityLabel(request.open_time_multiplier)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Courier Card */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-3'>
                        <h3 className='text-base font-bold text-darker-blue'>Kurye Bilgileri</h3>
                        {courierLoading ? (
                            <div className='flex justify-center py-4'>
                                <Loader2 size={24} className='text-secondary-blue animate-spin' />
                            </div>
                        ) : (
                            <div className='flex items-center gap-3'>
                                <div className='w-14 h-14 rounded-full bg-secondary-blue/10 border-2 border-secondary-blue flex items-center justify-center flex-shrink-0'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='w-7 h-7 text-secondary-blue' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className='flex-1'>
                                    <p className='font-bold text-darker-blue'>{courier?.full_name ?? '—'}</p>
                                    <p className='text-gray-500 text-xs'>{courier?.email ?? ''}</p>
                                </div>
                                <button className='bg-secondary-blue/10 hover:bg-secondary-blue hover:text-white text-secondary-blue p-2.5 rounded-full transition-all duration-300'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map */}
                <div className='relative w-full h-[calc(100vh-160px)] rounded-xl overflow-hidden drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]'>
                    <MapboxMap
                        center={mapCenter}
                        zoom={13}
                        markers={mapMarkers}
                        showUserLocation
                    />
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none'>
                        <div className='relative flex items-center justify-center'>
                            <div className='absolute w-14 h-14 bg-secondary-blue/30 rounded-full animate-ping' />
                            <div className='relative bg-secondary-blue text-white p-2.5 rounded-full shadow-xl border-2 border-white'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
