import { useState } from 'react';
import ProofOfDeliveryModal from '../components/ProofOfDeliveryModal';

export default function NavigationPage() {
    const [showProofModal, setShowProofModal] = useState(false);

    return (
        <div className='relative h-screen w-full overflow-hidden font-sextary'>

            {/* Map Background */}
            <div className='absolute inset-0'>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48171.67891452748!2d28.9352!3d41.0133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9eb3c4d0b03%3A0x27f63c9e9e62c68!2zQmXFn2lrdGHFnywgxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1234567890"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Navigasyon Haritası"
                />
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
                        <span className='font-bold text-2xl text-darker-blue leading-tight block'>450 m</span>
                        <span className='text-gray-500 text-sm'>Sanayi Caddesi'nde sağa dönün</span>
                    </div>
                </div>

                <div className='bg-white/90 backdrop-blur-md p-3 border border-gray-200 shadow-xl rounded-xl nav-arrival-card'>
                    <div className='flex justify-between items-center mb-2'>
                        <span className='text-xs font-semibold text-secondary-blue bg-secondary-blue/10 px-2.5 py-1 rounded-full'>
                            TAH. VARIŞ: 14:32
                        </span>
                        <span className='text-gray-500 text-xs'>2.4 km kaldı</span>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4 text-secondary-blue flex-shrink-0' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className='font-bold text-sm text-darker-blue'>Beşiktaş Mah. No:782</span>
                        </div>
                        <span className='text-gray-400 text-xs pl-6'>Kapı 4B, Lojistik Bölgesi</span>
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
                                <span className='text-xs text-gray-400'>13:45 • Kadıköy</span>
                            </div>
                        </div>

                        <div className='flex gap-3 h-14'>
                            <div className='flex flex-col items-center'>
                                <div className='w-4 h-4 rounded-full border-2 border-primary-blue bg-white ring-4 ring-primary-blue/20 flex-shrink-0' />
                                <div className='w-0.5 flex-1 bg-gray-200 mt-0.5' />
                            </div>
                            <div className='flex flex-col -mt-0.5'>
                                <span className='text-sm font-bold text-darker-blue'>Yolda</span>
                                <span className='text-xs text-primary-blue'>Aktif Segment</span>
                            </div>
                        </div>

                        <div className='flex gap-3 h-14'>
                            <div className='flex flex-col items-center'>
                                <div className='w-3 h-3 rounded-full bg-gray-300 flex-shrink-0' />
                                <div className='w-0.5 flex-1 bg-gray-200 mt-0.5' />
                            </div>
                            <div className='flex flex-col -mt-0.5 opacity-60'>
                                <span className='text-xs text-gray-500'>Varış Noktası</span>
                                <span className='text-xs text-gray-400'>14:32 • Beşiktaş</span>
                            </div>
                        </div>

                        <div className='flex gap-3'>
                            <div className='flex flex-col items-center'>
                                <div className='w-3 h-3 rounded-full bg-gray-300 flex-shrink-0' />
                            </div>
                            <div className='flex flex-col -mt-0.5 opacity-60'>
                                <span className='text-xs text-gray-500'>Teslim Onayı</span>
                                <span className='text-xs text-gray-400'>Kapı 4B</span>
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
                        <span className='text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full'>Acil Gönderi</span>
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                        <div>
                            <span className='text-xs text-gray-400 block'>Ağırlık</span>
                            <span className='text-sm font-bold text-darker-blue'>2.5 kg</span>
                        </div>
                        <div>
                            <span className='text-xs text-gray-400 block'>Mesafe</span>
                            <span className='text-sm font-bold text-darker-blue'>12.4 km</span>
                        </div>
                        <div>
                            <span className='text-xs text-gray-400 block'>ID</span>
                            <span className='text-sm font-bold text-darker-blue'>#LXP-882</span>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className='flex gap-3 nav-action-buttons'>
                    <button className='bg-white text-gray-500 border border-gray-300 font-bold text-lg px-8 py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        İptal
                    </button>
                    <button
                        onClick={() => setShowProofModal(true)}
                        className='bg-secondary-blue text-white font-bold text-lg px-8 py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-dark-blue transition-all active:scale-95'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tamamla
                    </button>
                </div>
            </div>

            {showProofModal && (
                <ProofOfDeliveryModal onClose={() => setShowProofModal(false)} />
            )}
        </div>
    );
}
