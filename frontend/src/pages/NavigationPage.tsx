import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProofOfDeliveryModal from '../components/ProofOfDeliveryModal';
import MapboxMap from '../components/MapboxMap';
import type { MapMarker } from '../components/MapboxMap';
import type { DeliveryRequest } from '../types';
import api from '../lib/api';

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            { headers: { 'Accept-Language': 'tr' } }
        );
        const data = await res.json();
        if (!data.length) return null;
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch { return null; }
}

interface OsrmStep {
    distance: number;
    duration: number;
    name: string;
    maneuver: { type: string; modifier?: string };
}

function maneuverText(type: string, modifier?: string, name?: string): string {
    if (type === 'depart') return name ? `${name} üzerinden yola çıkın` : 'Yola çıkın';
    if (type === 'arrive') return 'Hedefe ulaştınız';
    if (type === 'roundabout' || type === 'rotary') return 'Dönel kavşaktan çıkın';
    const dirs: Record<string, string> = {
        'left': 'sola dönün', 'right': 'sağa dönün',
        'slight left': 'hafif sola dönün', 'slight right': 'hafif sağa dönün',
        'sharp left': 'keskin sola dönün', 'sharp right': 'keskin sağa dönün',
        'straight': 'düz devam edin', 'uturn': 'geri dönün',
    };
    const action = modifier ? (dirs[modifier] ?? 'devam edin') : 'devam edin';
    return name ? `${name}'de ${action}` : action;
}

function formatDist(m: number): string {
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function calcEta(durationSecs: number): string {
    return new Date(Date.now() + durationSecs * 1000)
        .toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

const priorityLabel = (m: number) => m >= 2 ? 'Çok Acil' : m >= 1.5 ? 'Acil' : 'Normal';

export default function NavigationPage() {
    const [showProofModal, setShowProofModal]   = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
    const [mapRoute, setMapRoute]     = useState<[number, number][]>([]);
    const [steps, setSteps]           = useState<OsrmStep[]>([]);
    const [totalDist, setTotalDist]   = useState(0);
    const [totalDur, setTotalDur]     = useState(0);
    const navigate  = useNavigate();
    const location  = useLocation();
    const request: DeliveryRequest | null = (location.state as { request?: DeliveryRequest })?.request ?? null;

    useEffect(() => {
        if (!request) return;
        const ctrl = new AbortController();
        Promise.all([geocode(request.pickup_address), geocode(request.delivery_address)])
            .then(async ([pickup, delivery]) => {
                if (ctrl.signal.aborted) return;
                const markers: MapMarker[] = [];
                if (pickup)   markers.push({ lng: pickup.lng,   lat: pickup.lat,   color: '#004561', popup: 'Alım' });
                if (delivery) markers.push({ lng: delivery.lng, lat: delivery.lat, color: '#08b4fb', popup: 'Teslim' });
                setMapMarkers(markers);
                if (pickup && delivery) {
                    try {
                        const res = await fetch(
                            `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}?overview=full&geometries=geojson&steps=true`,
                            { signal: ctrl.signal }
                        );
                        const data = await res.json();
                        if (!ctrl.signal.aborted && data.code === 'Ok') {
                            const route = data.routes[0];
                            setMapRoute(route.geometry.coordinates as [number, number][]);
                            setTotalDist(route.distance);
                            setTotalDur(route.duration);
                            const allSteps: OsrmStep[] = route.legs.flatMap((leg: { steps: OsrmStep[] }) => leg.steps);
                            setSteps(allSteps);
                        }
                    } catch { /* aborted */ }
                }
            });
        return () => ctrl.abort();
    }, [request?.id]);

    const handleComplete = async () => {
        if (!request) return;
        setCompleting(true);
        try {
            await api.patch(`/tasks/${request.id}/status`, { status: 'picked_up' });
            await api.patch(`/tasks/${request.id}/status`, { status: 'delivered' });
            navigate('/profil');
        } catch {
            setCompleting(false);
        }
    };

    const handleCancel = async () => {
        if (!request) return;
        setCancelling(true);
        try {
            await api.patch(`/tasks/${request.id}/status`, { status: 'cancelled' });
        } catch { /* best-effort */ }
        navigate('/talep-al');
    };

    return (
        <div className='relative h-screen w-full overflow-hidden font-sextary'>

            {/* Map Background */}
            <div className='absolute inset-0'>
                <MapboxMap center={[28.97, 41.005]} zoom={12} markers={mapMarkers} route={mapRoute} />
            </div>

            {/* Top-left: Turn instruction */}
            <div className='absolute top-4 left-4 w-80 flex flex-col gap-2 z-10'>
                <div className='bg-white p-3 border border-gray-200 shadow-xl flex items-center gap-3 rounded-xl nav-turn-card'>
                    <div className='bg-secondary-blue text-white p-2.5 rounded-xl flex items-center justify-center flex-shrink-0'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-8 h-8' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                    <div>
                        <span className='font-bold text-2xl text-darker-blue leading-tight block'>
                            {steps[0] ? formatDist(steps[0].distance) : '—'}
                        </span>
                        <span className='text-gray-500 text-sm'>
                            {steps[0] ? maneuverText(steps[0].maneuver.type, steps[0].maneuver.modifier, steps[0].name) : 'Rota hesaplanıyor...'}
                        </span>
                    </div>
                </div>

                <div className='bg-white/90 backdrop-blur-md p-3 border border-gray-200 shadow-xl rounded-xl nav-arrival-card'>
                    <div className='flex justify-between items-center mb-2'>
                        <span className='text-xs font-semibold text-secondary-blue bg-secondary-blue/10 px-2.5 py-1 rounded-full'>
                            TAH. VARIŞ: {totalDur > 0 ? calcEta(totalDur) : '—'}
                        </span>
                        <span className='text-gray-500 text-xs'>{totalDist > 0 ? formatDist(totalDist) : '—'} kaldı</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4 text-secondary-blue flex-shrink-0' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className='font-bold text-sm text-darker-blue truncate'>{request?.delivery_address ?? '—'}</span>
                    </div>
                </div>
            </div>

            {/* Top-right: Route timeline */}
            <div className='absolute top-4 right-4 w-64 z-10 hidden md:block'>
                <div className='bg-white/90 backdrop-blur-md p-4 border border-gray-200 shadow-xl rounded-xl nav-timeline-panel'>
                    <span className='text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3'>
                        Rota Zaman Çizelgesi
                    </span>
                    <div className='flex flex-col gap-0'>
                        <div className='flex gap-3 h-14'>
                            <div className='flex flex-col items-center'>
                                <div className='w-3 h-3 rounded-full bg-secondary-blue flex-shrink-0' />
                                <div className='w-0.5 flex-1 bg-secondary-blue mt-0.5' />
                            </div>
                            <div className='flex flex-col -mt-0.5'>
                                <span className='text-xs font-semibold text-secondary-blue'>Alım Tamamlandı</span>
                                <span className='text-xs text-gray-400 truncate max-w-[160px]'>{request?.pickup_address ?? '—'}</span>
                            </div>
                        </div>

                        <div className='flex gap-3 h-14'>
                            <div className='flex flex-col items-center'>
                                <div className='w-4 h-4 rounded-full border-2 border-primary-blue bg-white ring-4 ring-primary-blue/20 flex-shrink-0' />
                                <div className='w-0.5 flex-1 bg-gray-200 mt-0.5' />
                            </div>
                            <div className='flex flex-col -mt-0.5'>
                                <span className='text-sm font-bold text-darker-blue'>Yolda</span>
                                <span className='text-xs text-primary-blue'>{totalDist > 0 ? formatDist(totalDist) : 'Hesaplanıyor...'}</span>
                            </div>
                        </div>

                        <div className='flex gap-3 h-14'>
                            <div className='flex flex-col items-center'>
                                <div className='w-3 h-3 rounded-full bg-gray-300 flex-shrink-0' />
                                <div className='w-0.5 flex-1 bg-gray-200 mt-0.5' />
                            </div>
                            <div className='flex flex-col -mt-0.5 opacity-60'>
                                <span className='text-xs text-gray-500'>Varış Noktası</span>
                                <span className='text-xs text-gray-400'>{totalDur > 0 ? calcEta(totalDur) : '—'}</span>
                            </div>
                        </div>

                        <div className='flex gap-3'>
                            <div className='flex flex-col items-center'>
                                <div className='w-3 h-3 rounded-full bg-gray-300 flex-shrink-0' />
                            </div>
                            <div className='flex flex-col -mt-0.5 opacity-60'>
                                <span className='text-xs text-gray-500'>Teslim Onayı</span>
                                <span className='text-xs text-gray-400 truncate max-w-[160px]'>{request?.delivery_address ?? '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Cargo specs + action buttons */}
            <div className='absolute bottom-6 left-6 right-6 flex flex-col md:flex-row justify-between items-end gap-3 z-10'>

                {/* Cargo specs */}
                <div className='w-full md:w-96 bg-white p-3 border border-gray-200 shadow-xl rounded-xl nav-cargo-specs'>
                    <div className='flex items-center justify-between border-b border-gray-100 pb-2 mb-2'>
                        <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Kargo Özellikleri</span>
                        {request && (
                            <span className='text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full'>
                                {priorityLabel(request.open_time_multiplier)}
                            </span>
                        )}
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                        <div>
                            <span className='text-xs text-gray-400 block'>Ağırlık</span>
                            <span className='text-sm font-bold text-darker-blue'>{request ? `${Number(request.weight_kg).toFixed(2)} kg` : '—'}</span>
                        </div>
                        <div>
                            <span className='text-xs text-gray-400 block'>Mesafe</span>
                            <span className='text-sm font-bold text-darker-blue'>{request?.distance_km ? `${Number(request.distance_km).toFixed(2)} km` : '—'}</span>
                        </div>
                        <div>
                            <span className='text-xs text-gray-400 block'>ID</span>
                            <span className='text-sm font-bold text-darker-blue'>#{request?.id.slice(0, 8).toUpperCase() ?? '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className='flex gap-3 nav-action-buttons'>
                    <button
                        onClick={() => setShowCancelConfirm(true)}
                        className='bg-white text-gray-500 border border-gray-300 font-bold text-lg px-8 py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        İptal
                    </button>
                    <button
                        onClick={() => setShowProofModal(true)}
                        disabled={completing}
                        className='bg-secondary-blue text-white font-bold text-lg px-8 py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-dark-blue transition-all active:scale-95 disabled:opacity-60'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tamamla
                    </button>
                </div>
            </div>

            {showProofModal && (
                <ProofOfDeliveryModal
                    onClose={() => setShowProofModal(false)}
                    onConfirm={handleComplete}
                />
            )}

            {showCancelConfirm && (
                <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 font-sextary'>
                        <p className='text-darker-blue font-bold text-lg text-center mb-6'>
                            Siparişi bırakmak istediğine emin misin?
                        </p>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className='flex-1 border border-gray-300 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all'
                            >
                                Hayır
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className='flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-all disabled:opacity-60'
                            >
                                Evet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
