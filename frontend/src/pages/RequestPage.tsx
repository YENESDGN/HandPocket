import SecondNavBar from '../components/SecondNavBar';
import { useState } from 'react';

export default function RequestPage() {
    const [isPanelVisible, setIsPanelVisible] = useState(true);

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
                            className='bg-white text-black placeholder:text-gray-400 rounded px-3 py-2'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='text-white text-lg'>Başlangıç Konumu</span>
                        <input 
                            type="text" 
                            placeholder="Başlangıç konumunu seçiniz"
                            className='bg-white text-black placeholder:text-gray-400 rounded px-3 py-2'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='text-white text-lg'>Bitiş Konumu</span>
                        <input 
                            type="text" 
                            placeholder="Bitiş konumunu seçiniz"
                            className='bg-white text-black placeholder:text-gray-400 rounded px-3 py-2'
                        />
                    </div>

                    <div className='flex flex-col gap-1 flex-grow'>
                        <span className='text-white text-sm'>
                            Paket Fotoğrafı <span className='text-gray-300 text-lg'>(Opsiyonel)</span>
                        </span>
                        <div className='bg-white text-gray-400 rounded px-3 py-4 h-48 flex items-center justify-center border-2 border-dashed border-gray-300'>
                            <span className='text-sm'>Fotoğraf yüklemek için tıklayın</span>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col gap-1'>
                            <span className='text-white text-lg'>Ağırlık (kg)</span>
                            <input 
                                type="number" 
                                placeholder="0.0"
                                className='bg-white text-black placeholder:text-gray-400 rounded px-3 py-2'
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-white text-lg'>Öncelik</span>
                            <select className='bg-white text-black placeholder:text-gray-400 rounded px-3 py-2'>
                                <option value="">Seçiniz</option>
                                <option value="normal">Normal</option>
                                <option value="acil">Acil</option>
                            </select>
                        </div>
                    </div>

                    <button className='bg-white uppercase text-xl text-secondary-blue rounded px-4 py-3 font-extrabold btn-hover-shadow'>
                        Paket Tutarını Hesapla
                    </button>
                </div>
                <div className='relative w-full h-[900px] rounded-xl overflow-hidden request-map'>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385396.60516460294!2d28.682528!3d41.005369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVsLCBUw7xya2l5ZQ!5e0!3m2!1str!2str!4v1234567890"
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Kargo Haritası"
                    />

                    {/* Gizlenebilir Toggle Butonu */}
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

                    {/* Hesaplama Paneli */}
                    {isPanelVisible && (
                        <div className='absolute bottom-4 right-4 bg-white rounded-lg shadow-2xl z-10 font-tertiary w-56 overflow-hidden'>
                            <div className='bg-primary-blue text-white px-3 py-1.5'>
                                <h3 className='font-extrabold text-xs tracking-wide uppercase'>Hesaplama Sonuçları</h3>
                            </div>
                            <div className='px-3 py-2 flex flex-col gap-1.5'>
                                <div>
                                    <span className='text-gray-500 text-[10px] block'>Mesafe</span>
                                    <p className='text-[#808080] text-sm font-semibold leading-tight'>1.2 KM</p>
                                    <div className='w-full h-[2px] bg-primary-blue mt-0.5 rounded-xl' />
                                </div>
                                <div>
                                    <span className='text-gray-500 text-[10px] block'>Süre</span>
                                    <p className='text-[#808080] text-sm font-semibold leading-tight'>15 dk</p>
                                    <div className='w-full h-[2px] bg-primary-blue mt-0.5 rounded-xl' />
                                </div>
                                <div>
                                    <span className='text-dark-blue text-xs font-bold block'>Hesaplanan Ücret</span>
                                    <p className='text-dark-blue text-xl font-extrabold leading-tight'>27 TL</p>
                                </div>
                                <button className='btn-hover-shadow w-full bg-primary-blue text-white rounded px-3 py-1.5 font-extrabold text-xs tracking-wide uppercase'>
                                    Teslimat Oluştur
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}