import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Weight, Clock, Loader2 } from 'lucide-react';
import ReceiverNavBar from '../components/ReceiverNavBar';
import DeliveryAmountCard from '../components/DeliveryAmountCard';
import MapboxMap from '../components/MapboxMap';
import type { MapMarker } from '../components/MapboxMap';
import { getOpenTasks, acceptTask } from '../services/taskService';
import type { DeliveryRequest } from '../types';

const priorityLabel = (m: number) => m >= 2 ? 'Çok Acil' : m >= 1.5 ? 'Acil' : 'Normal';

const priorityBadge = (m: number) =>
    m >= 2
        ? 'bg-red-100 text-red-600 border border-red-200'
        : m >= 1.5
        ? 'bg-amber-100 text-amber-700 border border-amber-200'
        : 'bg-green-100 text-green-700 border border-green-200';

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

export default function RecieverPage() {
    const [requests, setRequests]     = useState<DeliveryRequest[]>([]);
    const [selected, setSelected]     = useState<DeliveryRequest | null>(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);
    const [accepting, setAccepting]   = useState(false);
    const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
    const [mapRoute, setMapRoute]     = useState<[number, number][]>([]);
    const routeAbortRef               = useRef<AbortController | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        getOpenTasks()
            .then((data) => {
                setRequests(data);
                if (data.length > 0) setSelected(data[0]);
            })
            .catch(() => setError('Talepler yüklenemedi.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selected) { setMapMarkers([]); setMapRoute([]); return; }

        routeAbortRef.current?.abort();
        const ctrl = new AbortController();
        routeAbortRef.current = ctrl;

        setMapRoute([]);
        setMapMarkers([]);

        Promise.all([
            geocodeAddress(selected.pickup_address),
            geocodeAddress(selected.delivery_address),
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
                } catch { /* aborted or network error */ }
            }
        });

        return () => ctrl.abort();
    }, [selected?.id]);

    const handleAccept = async () => {
        if (!selected) return;
        setAccepting(true);
        try {
            await acceptTask(selected.id);
            navigate('/navigasyon', { state: { request: selected } });
        } catch {
            setError('Talep kabul edilemedi. Başkası almış olabilir.');
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <>
                <ReceiverNavBar />
                <div className='flex items-center justify-center min-h-screen bg-dark-blue'>
                    <Loader2 size={40} className='text-primary-blue animate-spin' />
                </div>
            </>
        );
    }

    if (error && requests.length === 0) {
        return (
            <>
                <ReceiverNavBar />
                <div className='flex items-center justify-center min-h-screen bg-dark-blue'>
                    <p className='text-red-400 font-sextary'>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <ReceiverNavBar />
            <section className='grid grid-cols-[22%_1fr_22%] p-10 gap-6 items-start bg-dark-blue font-sextary min-h-screen'>

                {/* Left — selected request details */}
                <div className='bg-tertiary-blue w-full rounded-xl p-4 flex flex-col gap-2 drop-shadow-[0_0_15px_rgba(0,0,0,0.7)] receiver-panel'>
                    {selected ? (
                        <>
                            <div className='flex items-center justify-between mb-1'>
                                <span className='text-white font-bold text-sm uppercase tracking-widest'>Seçili Talep</span>
                                <span className='text-white/50 text-xs font-mono'>{selected.id.slice(0, 8)}</span>
                            </div>

                            <div className='flex flex-col gap-1'>
                                <span className='text-white/70 text-xs uppercase tracking-wider'>Kargo Adı</span>
                                <input type='text' readOnly value={selected.package_description}
                                    className='bg-white text-black rounded px-3 py-2 cursor-default text-sm' />
                            </div>

                            <div className='flex flex-col gap-1'>
                                <span className='text-white/70 text-xs uppercase tracking-wider'>Başlangıç</span>
                                <input type='text' readOnly value={selected.pickup_address}
                                    className='bg-white text-black rounded px-3 py-2 cursor-default text-sm' />
                            </div>

                            <div className='flex flex-col gap-1'>
                                <span className='text-white/70 text-xs uppercase tracking-wider'>Bitiş</span>
                                <input type='text' readOnly value={selected.delivery_address}
                                    className='bg-white text-black rounded px-3 py-2 cursor-default text-sm' />
                            </div>

                            <div className='grid grid-cols-2 gap-2'>
                                <div className='flex flex-col gap-1'>
                                    <span className='text-white/70 text-xs uppercase tracking-wider'>Ağırlık (kg)</span>
                                    <input type='text' readOnly value={Number(selected.weight_kg).toFixed(2)}
                                        className='bg-white text-black rounded px-3 py-2 cursor-default text-sm' />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <span className='text-white/70 text-xs uppercase tracking-wider'>Öncelik</span>
                                    <div className={`rounded px-3 py-2 text-xs font-bold ${priorityBadge(selected.open_time_multiplier)}`}>
                                        {priorityLabel(selected.open_time_multiplier)}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className='text-red-300 text-xs bg-red-900/30 rounded px-3 py-2'>{error}</p>
                            )}

                            <DeliveryAmountCard
                                distanceKm={selected.distance_km ?? 0}
                                estimatedTimeMins={selected.estimated_time_mins ?? 0}
                                calculatedPrice={selected.calculated_price ?? 0}
                                onAccept={handleAccept}
                                loading={accepting}
                            />
                        </>
                    ) : (
                        <div className='flex items-center justify-center h-40'>
                            <p className='text-white/50 text-sm'>Bekleyen talep yok</p>
                        </div>
                    )}
                </div>

                {/* Center — Mapbox map */}
                <div className='relative w-full h-[850px] rounded-xl overflow-hidden receiver-map'>
                    <MapboxMap markers={mapMarkers} route={mapRoute} />
                </div>

                {/* Right — available requests list */}
                <div className='flex flex-col h-[850px] bg-secondary-blue rounded-xl overflow-hidden drop-shadow-[0_0_5px_rgba(0,0,0,0.4)] receiver-list'>
                    <div className='px-4 py-3 border-b border-white/20 flex items-center justify-between flex-shrink-0'>
                        <span className='text-white font-bold text-sm uppercase tracking-widest'>Bekleyen Talepler</span>
                        <span className='bg-white text-secondary-blue text-xs font-bold px-2.5 py-0.5 rounded-full'>
                            {requests.length}
                        </span>
                    </div>

                    <div className='flex-1 overflow-y-auto flex flex-col gap-2 p-3'>
                        {requests.length === 0 ? (
                            <p className='text-white/50 text-sm text-center mt-8'>Açık talep bulunmuyor</p>
                        ) : requests.map((req) => {
                            const isActive = req.id === selected?.id;
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
                                    <div className='flex items-start justify-between gap-2 mb-2'>
                                        <span className='text-darker-blue font-semibold text-xs leading-snug line-clamp-2'>
                                            {req.package_description}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityBadge(req.open_time_multiplier)}`}>
                                            {priorityLabel(req.open_time_multiplier)}
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-1.5 text-darker-blue/60 text-xs mb-2'>
                                        <MapPin size={11} className='flex-shrink-0' />
                                        <span className='truncate'>{req.pickup_address}</span>
                                        <span className='text-darker-blue/30'>→</span>
                                        <span className='truncate'>{req.delivery_address}</span>
                                    </div>

                                    <div className='flex items-center gap-3 text-[11px]'>
                                        <span className='flex items-center gap-1 text-darker-blue/50'>
                                            <Clock size={10} /> {req.estimated_time_mins ?? '—'} dk
                                        </span>
                                        <span className='flex items-center gap-1 text-darker-blue/50'>
                                            <Weight size={10} /> {Number(req.weight_kg).toFixed(2)} kg
                                        </span>
                                    </div>

                                    {isActive && (
                                        <div className='mt-2 pt-2 border-t border-darker-blue/10 text-darker-blue text-[10px] font-bold uppercase tracking-wider'>
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
