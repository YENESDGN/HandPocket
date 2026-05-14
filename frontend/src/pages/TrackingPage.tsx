import ReceiverNavBar from '../components/ReceiverNavBar';
import MapboxMap from '../components/MapboxMap';
import type { DeliveryRequest } from '../types';

const mockRequest: DeliveryRequest = {
    id: 'LXP-882941',
    sender_id: 'user-1',
    package_photo_url: '',
    package_description: 'Elektronik Eşya - Batch 4',
    pickup_address: 'Kadıköy, İstanbul',
    distance_km: 12.4,
    estimated_time_mins: 25,
    weight_kg: 2.5,
    open_time_multiplier: 1.5,
    calculated_price: 87,
    status: 'accepted',
    created_at: new Date(),
    updated_at: new Date(),
};

const mockCourier = {
    name: 'Ahmet Yılmaz',
    fleetId: 'TR-4022',
    vehicle: 'Honda PCX 150',
    license: '34 ABC 123',
};

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

export default function TrackingPage() {
    const eta = '14:25';
    const deliveryAddress = 'Beşiktaş, İstanbul';

    return (
        <>
            <ReceiverNavBar />
            <section className='grid grid-cols-[23%_77%] p-10 gap-10 items-start bg-dark-blue font-sextary min-h-screen'>

                {/* Left Panel */}
                <div className='flex flex-col gap-4'>

                    {/* Status Card */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-3 tracking-status-card'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <span className='text-gray-500 text-xs uppercase tracking-widest block'>Gönderi ID</span>
                                <h2 className='text-xl font-bold text-darker-blue'>#{mockRequest.id}</h2>
                            </div>
                            <span className='bg-secondary-blue text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
                                {statusLabel(mockRequest.status)}
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
                                <span className='text-xl font-bold text-darker-blue'>{mockRequest.distance_km} km</span>
                            </div>
                        </div>
                    </div>

                    {/* Cargo Details Card */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-4 tracking-cargo-card'>
                        <div className='flex items-center gap-2'>
                            <div className='bg-secondary-blue rounded-lg p-1.5 text-white'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                </svg>
                            </div>
                            <h3 className='text-base font-bold text-darker-blue'>Kargo Detayları</h3>
                        </div>
                        <p className='text-gray-500 text-sm -mt-2'>{mockRequest.package_description}</p>

                        {/* Timeline */}
                        <div className='relative pl-6 flex flex-col gap-5'>
                            <div className='absolute left-[7px] top-3 bottom-3 w-0.5 bg-gray-200' />
                            <div className='relative'>
                                <div className='absolute -left-[21px] top-1 w-3.5 h-3.5 bg-secondary-blue rounded-full border-2 border-white ring-2 ring-secondary-blue/30' />
                                <span className='text-gray-400 text-xs uppercase tracking-widest block'>BAŞLANGIÇ</span>
                                <p className='text-darker-blue font-semibold text-sm'>{mockRequest.pickup_address}</p>
                            </div>
                            <div className='relative'>
                                <div className='absolute -left-[21px] top-1 w-3.5 h-3.5 bg-primary-blue rounded-full border-2 border-white ring-2 ring-primary-blue/30' />
                                <span className='text-gray-400 text-xs uppercase tracking-widest block'>TESLİMAT</span>
                                <p className='text-darker-blue font-semibold text-sm'>{deliveryAddress}</p>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-2 pt-2 border-t border-gray-100'>
                            <div>
                                <span className='text-gray-400 text-xs block'>AĞIRLIK</span>
                                <span className='text-darker-blue font-semibold text-sm'>{mockRequest.weight_kg} kg</span>
                            </div>
                            <div>
                                <span className='text-gray-400 text-xs block'>ÖNCELİK</span>
                                <span className='text-darker-blue font-semibold text-sm'>{priorityLabel(mockRequest.open_time_multiplier)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Courier Card */}
                    <div className='bg-white rounded-xl p-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col gap-3 tracking-courier-card'>
                        <h3 className='text-base font-bold text-darker-blue'>Kurye Bilgileri</h3>
                        <div className='flex items-center gap-3'>
                            <div className='w-14 h-14 rounded-full bg-secondary-blue/10 border-2 border-secondary-blue flex items-center justify-center flex-shrink-0'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-7 h-7 text-secondary-blue' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className='flex-1'>
                                <p className='font-bold text-darker-blue'>{mockCourier.name}</p>
                                <p className='text-gray-500 text-xs'>Filo ID: #{mockCourier.fleetId}</p>
                            </div>
                            <button className='bg-secondary-blue/10 hover:bg-secondary-blue hover:text-white text-secondary-blue p-2.5 rounded-full transition-all duration-300'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </button>
                        </div>
                        <div className='grid grid-cols-2 gap-2 pt-2 border-t border-gray-100'>
                            <div>
                                <span className='text-gray-400 text-xs block'>ARAÇ</span>
                                <span className='text-darker-blue font-semibold text-sm'>{mockCourier.vehicle}</span>
                            </div>
                            <div>
                                <span className='text-gray-400 text-xs block'>PLAKA</span>
                                <span className='text-darker-blue font-semibold text-sm'>{mockCourier.license}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className='relative w-full h-[calc(100vh-160px)] rounded-xl overflow-hidden drop-shadow-[0_0_15px_rgba(0,0,0,0.7)] tracking-map'>
                    <MapboxMap
                        center={[29.01, 41.025]}
                        zoom={13}
                        markers={[{ lng: 29.01, lat: 41.025, color: '#1ea4dc', popup: 'Kurye Konumu' }]}
                    />
                    {/* Pulsing courier overlay */}
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
