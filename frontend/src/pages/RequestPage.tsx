import SecondNavBar from '../components/SecondNavBar';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { createTask } from '../services/taskService';
import { useAuthStore } from '../store/auth';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface GeoResult {
    display_name: string;
    lat: string;
    lon: string;
}

interface LocationState {
    address: string;
    lat: number | null;
    lon: number | null;
}

interface CalcResult {
    distanceKm: number;
    durationMins: number;
    price: number;
}

function calcPrice(distanceKm: number, weightKg: number, priority: number): number {
    return Math.round(distanceKm * weightKg * priority * 100) / 100;
}

function LocationInput({ label, placeholder, value, onChange }: {
    label: string;
    placeholder: string;
    value: LocationState;
    onChange: (loc: LocationState) => void;
}) {
    const [query, setQuery] = useState(value.address);
    const [results, setResults] = useState<GeoResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback((q: string) => {
        setQuery(q);
        onChange({ address: q, lat: null, lon: null });
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (q.length < 3) { setResults([]); setIsOpen(false); return; }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
                    { headers: { 'Accept-Language': 'tr' } }
                );
                const data: GeoResult[] = await res.json();
                setResults(data);
                setIsOpen(data.length > 0);
            } finally {
                setLoading(false);
            }
        }, 400);
    }, [onChange]);

    const select = (r: GeoResult) => {
        setQuery(r.display_name);
        setResults([]);
        setIsOpen(false);
        onChange({ address: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
    };

    return (
        <div className='flex flex-col gap-1 relative'>
            <span className='text-white text-lg'>{label}</span>
            <div className='relative'>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => search(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className='bg-white text-black placeholder:text-gray-400 rounded px-3 py-2 w-full pr-8'
                    onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                />
                {loading && (
                    <div className='absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-blue border-t-transparent rounded-full animate-spin' />
                )}
            </div>
            {isOpen && (
                <ul className='absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto border border-gray-200'>
                    {results.map((r, i) => (
                        <li
                            key={i}
                            onMouseDown={() => select(r)}
                            className='px-3 py-2 text-xs text-gray-700 hover:bg-primary-blue/10 cursor-pointer border-b border-gray-100 last:border-0'
                        >
                            {r.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function RouteMap({ pickup, delivery, routeCoords }: {
    pickup: LocationState;
    delivery: LocationState;
    routeCoords: [number, number][];
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapObj       = useRef<mapboxgl.Map | null>(null);
    const mkStart      = useRef<mapboxgl.Marker | null>(null);
    const mkEnd        = useRef<mapboxgl.Marker | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapObj.current) return;
        mapObj.current = new mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [28.97, 41.005],
            zoom: 10,
        });
        mapObj.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
        return () => { mapObj.current?.remove(); mapObj.current = null; };
    }, []);

    useEffect(() => {
        const map = mapObj.current;
        if (!map) return;

        mkStart.current?.remove();
        mkEnd.current?.remove();

        if (pickup.lat && pickup.lon) {
            mkStart.current = new mapboxgl.Marker({ color: '#004561' })
                .setLngLat([pickup.lon, pickup.lat])
                .setPopup(new mapboxgl.Popup().setText('Başlangıç'))
                .addTo(map);
        }
        if (delivery.lat && delivery.lon) {
            mkEnd.current = new mapboxgl.Marker({ color: '#08b4fb' })
                .setLngLat([delivery.lon, delivery.lat])
                .setPopup(new mapboxgl.Popup().setText('Bitiş'))
                .addTo(map);
        }

        const updateRoute = () => {
            if (map.getLayer('route')) map.removeLayer('route');
            if (map.getSource('route')) map.removeSource('route');

            if (routeCoords.length > 0) {
                map.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: routeCoords.map(([lat, lon]) => [lon, lat]),
                        },
                    },
                });
                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#08b4fb', 'line-width': 5, 'line-opacity': 0.85 },
                });
                const lngs = routeCoords.map(([, lon]) => lon);
                const lats = routeCoords.map(([lat]) => lat);
                map.fitBounds(
                    [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                    { padding: 60 }
                );
            } else if (pickup.lat && pickup.lon && delivery.lat && delivery.lon) {
                map.fitBounds(
                    [[pickup.lon, pickup.lat], [delivery.lon, delivery.lat]],
                    { padding: 80 }
                );
            } else if (pickup.lat && pickup.lon) {
                map.flyTo({ center: [pickup.lon, pickup.lat], zoom: 13 });
            }
        };

        if (map.isStyleLoaded()) updateRoute();
        else map.once('load', updateRoute);
    }, [pickup, delivery, routeCoords]);

    return <div ref={containerRef} className="w-full h-full" />;
}

export default function RequestPage() {
    const navigate    = useNavigate();
    const user        = useAuthStore((s) => s.user);
    const refreshUser = useAuthStore((s) => s.refreshUser);
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [insufficientBalance, setInsufficientBalance] = useState(false);
    const [cargoName, setCargoName]   = useState('');
    const [pickup, setPickup]         = useState<LocationState>({ address: '', lat: null, lon: null });
    const [delivery, setDelivery]     = useState<LocationState>({ address: '', lat: null, lon: null });
    const [weightKg, setWeightKg]     = useState('');
    const [priority, setPriority]     = useState('');
    const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
    const [calcResult, setCalcResult]       = useState<CalcResult | null>(null);
    const [routeCoords, setRouteCoords]     = useState<[number, number][]>([]);
    const [calcLoading, setCalcLoading]     = useState(false);
    const [calcError, setCalcError]         = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError]     = useState<string | null>(null);
    const [showSuccess, setShowSuccess]     = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoPreview(URL.createObjectURL(file));
    };

    const clearPhoto = () => {
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!calcResult) return;
        setInsufficientBalance(false);
        const balance = user?.wallet_balance ?? 0;
        if (balance < calcResult.price) {
            setInsufficientBalance(true);
            return;
        }
        setSubmitError(null);
        setSubmitLoading(true);
        try {
            await createTask({
                package_description: cargoName || 'Kargo',
                pickup_address: pickup.address,
                delivery_address: delivery.address,
                weight_kg: parseFloat(weightKg),
                open_time_multiplier: parseFloat(priority),
                distance_km: calcResult.distanceKm,
                estimated_time_mins: calcResult.durationMins,
                calculated_price: calcResult.price,
            });
            await refreshUser();
            setShowSuccess(true);
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            if (detail === 'Yetersiz bakiye') { setInsufficientBalance(true); return; }
            setSubmitError('Teslimat oluşturulamadı. Lütfen tekrar deneyin.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCalculate = async () => {
        setCalcError(null);
        if (!pickup.lat || !pickup.lon || !delivery.lat || !delivery.lon) {
            setCalcError('Lütfen başlangıç ve bitiş konumunu seçin.');
            return;
        }
        if (!weightKg || parseFloat(weightKg) <= 0) {
            setCalcError('Lütfen geçerli bir ağırlık girin.');
            return;
        }
        if (!priority) {
            setCalcError('Lütfen öncelik seçin.');
            return;
        }
        setCalcLoading(true);
        try {
            const res = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${delivery.lon},${delivery.lat}?overview=full&geometries=geojson`
            );
            const data = await res.json();
            if (data.code !== 'Ok') throw new Error('Rota hesaplanamadı');
            const route = data.routes[0];
            const distanceKm   = route.distance / 1000;
            const durationMins = Math.ceil(route.duration / 60);
            const price = calcPrice(distanceKm, parseFloat(weightKg), parseFloat(priority));
            setCalcResult({ distanceKm, durationMins, price });
            const coords: [number, number][] = (route.geometry.coordinates as [number, number][])
                .map(([lon, lat]) => [lat, lon]);
            setRouteCoords(coords);
        } catch {
            setCalcError('Mesafe hesaplanamadı. Lütfen konumları kontrol edin.');
        } finally {
            setCalcLoading(false);
        }
    };

    return (
        <>
            <SecondNavBar />
            <section className='grid grid-cols-[23%_77%] p-10 gap-10 items-start bg-dark-blue font-sextary'>
                <div className='bg-tertiary-blue w-full h-full rounded-xl p-4 flex flex-col gap-2 text-shadow-sm drop-shadow-[0_0_15px_rgba(0,0,0,0.7)] request-form-panel'>
                    <h1 className='text-white text-3xl font-extrabold pb-4 pt-2'>Yeni Kargo</h1>

                    <div className='flex flex-col gap-1'>
                        <span className='text-white text-lg'>Kargo Adı</span>
                        <input
                            type="text"
                            placeholder="Kargo adını giriniz"
                            value={cargoName}
                            onChange={(e) => setCargoName(e.target.value)}
                            className='bg-white text-black placeholder:text-gray-400 rounded px-3 py-2'
                        />
                    </div>

                    <LocationInput
                        label="Başlangıç Konumu"
                        placeholder="Başlangıç konumunu arayın..."
                        value={pickup}
                        onChange={setPickup}
                    />

                    <LocationInput
                        label="Bitiş Konumu"
                        placeholder="Bitiş konumunu arayın..."
                        value={delivery}
                        onChange={setDelivery}
                    />

                    <div className='flex flex-col gap-1 flex-grow'>
                        <span className='text-white text-sm'>
                            Paket Fotoğrafı <span className='text-gray-300 text-lg'>(Opsiyonel)</span>
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className='hidden'
                            onChange={handlePhotoChange}
                        />
                        {photoPreview ? (
                            <div className='relative h-48 rounded overflow-hidden border-2 border-gray-300'>
                                <img src={photoPreview} alt="Paket önizleme" className='w-full h-full object-cover' />
                                <button
                                    onClick={clearPhoto}
                                    className='absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-all'
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className='bg-white text-gray-400 rounded px-3 py-4 h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-primary-blue transition-all gap-2'
                            >
                                <ImagePlus size={28} className='text-gray-300' />
                                <span className='text-sm'>Fotoğraf yüklemek için tıklayın</span>
                            </div>
                        )}
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col gap-1'>
                            <span className='text-white text-lg'>Ağırlık (kg)</span>
                            <input
                                type="number"
                                placeholder="0.0"
                                min="0"
                                step="0.1"
                                value={weightKg}
                                onChange={(e) => setWeightKg(e.target.value)}
                                className='bg-white text-black placeholder:text-gray-400 rounded px-3 py-2'
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-white text-lg'>Öncelik</span>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className='bg-white text-black rounded px-3 py-2'
                            >
                                <option value="">Seçiniz</option>
                                <option value="1.0">Normal</option>
                                <option value="1.5">Acil</option>
                                <option value="2.0">Çok Acil</option>
                            </select>
                        </div>
                    </div>

                    {calcError && (
                        <p className='text-red-300 text-xs bg-red-900/30 rounded px-3 py-2'>{calcError}</p>
                    )}

                    <button
                        onClick={handleCalculate}
                        disabled={calcLoading}
                        className='bg-white uppercase text-xl text-secondary-blue rounded px-4 py-3 font-extrabold btn-hover-shadow disabled:opacity-50 flex items-center justify-center gap-2'
                    >
                        {calcLoading && <Loader2 size={18} className='animate-spin' />}
                        Paket Tutarını Hesapla
                    </button>
                </div>

                <div className='relative w-full h-[900px] rounded-xl overflow-hidden request-map'>
                    <RouteMap pickup={pickup} delivery={delivery} routeCoords={routeCoords} />

                    <button
                        onClick={() => setIsPanelVisible(!isPanelVisible)}
                        className='absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-all z-20'
                        title={isPanelVisible ? 'Paneli Gizle' : 'Paneli Göster'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isPanelVisible ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            )}
                        </svg>
                    </button>

                    {isPanelVisible && (
                        <div className='absolute bottom-4 right-4 bg-white rounded-lg shadow-2xl z-10 font-tertiary w-56 overflow-hidden'>
                            <div className='bg-primary-blue text-white px-3 py-1.5'>
                                <h3 className='font-extrabold text-xs tracking-wide uppercase'>Hesaplama Sonuçları</h3>
                            </div>
                            <div className='px-3 py-2 flex flex-col gap-1.5'>
                                <div>
                                    <span className='text-gray-500 text-[10px] block'>Mesafe</span>
                                    <p className='text-[#808080] text-sm font-semibold leading-tight'>
                                        {calcResult ? `${calcResult.distanceKm.toFixed(1)} km` : '—'}
                                    </p>
                                    <div className='w-full h-[2px] bg-primary-blue mt-0.5 rounded-xl' />
                                </div>
                                <div>
                                    <span className='text-gray-500 text-[10px] block'>Süre</span>
                                    <p className='text-[#808080] text-sm font-semibold leading-tight'>
                                        {calcResult ? `${calcResult.durationMins} dk` : '—'}
                                    </p>
                                    <div className='w-full h-[2px] bg-primary-blue mt-0.5 rounded-xl' />
                                </div>
                                <div>
                                    <span className='text-gray-500 text-[10px] block text-darker-blue font-bold'>Ücret Dağılımı</span>
                                    {calcResult ? (
                                        <div className='flex flex-col gap-0.5 mt-0.5'>
                                            <div className='flex justify-between text-[10px] text-gray-500'>
                                                <span>Mesafe</span>
                                                <span>{calcResult.distanceKm.toFixed(2)} km</span>
                                            </div>
                                            <div className='flex justify-between text-[10px] text-gray-500'>
                                                <span>Ağırlık</span>
                                                <span>{weightKg} kg</span>
                                            </div>
                                            <div className='flex justify-between text-[10px] text-gray-500'>
                                                <span>Öncelik çarpanı</span>
                                                <span>×{priority}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className='text-[10px] text-gray-400'>Hesaplamak için formu doldurun</p>
                                    )}
                                </div>
                                <div className='border-t border-gray-100 pt-1'>
                                    <span className='text-dark-blue text-xs font-bold block'>Hesaplanan Ücret</span>
                                    <p className='text-dark-blue text-xl font-extrabold leading-tight'>
                                        {calcResult ? `${calcResult.price.toFixed(2)} TL` : '— TL'}
                                    </p>
                                </div>
                                {submitError && (
                                    <p className='text-red-500 text-[10px]'>{submitError}</p>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!calcResult || submitLoading}
                                    className='btn-hover-shadow w-full bg-primary-blue text-white rounded px-3 py-1.5 font-extrabold text-xs tracking-wide uppercase disabled:opacity-40 flex items-center justify-center gap-1'
                                >
                                    {submitLoading && <Loader2 size={12} className='animate-spin' />}
                                    Teslimat Oluştur
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {insufficientBalance && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 font-sextary flex flex-col items-center gap-4'>
                        <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-8 h-8 text-red-500' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <p className='text-darker-blue font-bold text-lg text-center'>Yetersiz bakiye.</p>
                        <p className='text-gray-500 text-sm text-center'>
                            Mevcut bakiyeniz bu teslimat için yeterli değil. Lütfen bakiyenizi yükleyin.
                        </p>
                        <div className='flex gap-3 w-full'>
                            <button
                                onClick={() => setInsufficientBalance(false)}
                                className='flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all'
                            >
                                Kapat
                            </button>
                            <button
                                onClick={() => navigate('/profil')}
                                className='flex-1 bg-primary-blue text-white font-semibold py-3 rounded-xl hover:bg-secondary-blue transition-all'
                            >
                                Bakiye Yükle
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showSuccess && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 font-sextary flex flex-col items-center gap-4'>
                        <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-8 h-8 text-green-600' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className='text-darker-blue font-bold text-lg text-center'>
                            Talep başarıyla oluşturuldu.
                        </p>
                        <button
                            onClick={() => navigate('/profil')}
                            className='w-full bg-primary-blue text-white font-semibold py-3 rounded-xl hover:bg-secondary-blue transition-all'
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
