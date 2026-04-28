import NavBar from '../components/NavBar';
import { useState } from 'react';

export default function RequestPage() {
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    return (
        <>
        <img 
        className='absolute left-0 w-full h-full object-cover z-[-1] opacity-75 bg-cover bg-center blur-sm'
        src="assets/RgLg_bg.png"
        alt="Register-Login Background" />
        <div className='border-b-1 border-thin relative h-[150px]'>
            <div className='grid grid-cols-2 items-center justify-start gap-0'>
                <div className='flex flex-row items-center justify-start gap-0'>
                    <img 
                        className='w-20 h-20 object-contain relative left-5 top-5'
                        src="/assets/favicon.png" 
                        alt="HandPocket Logo" />
                </div>
            </div>
            <NavBar />
        </div>
            <section className='grid grid-cols-[23%_77%] p-10 gap-10 items-start bg-dark-blue font-sextary'>
            <div className='bg-tertiary-blue w-full h-full rounded-xl p-4 flex flex-col gap-2 text-shadow-sm drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]'>
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
                <div className='relative w-full h-[600px] bg-gray-200 rounded-xl overflow-hidden'>
                    {/* Harita placeholder */}
                    <div className='absolute inset-0 bg-gradient-to-br from-blue-100 to-gray-300 flex items-center justify-center'>
                        <span className='text-gray-500 text-lg font-medium'>Harita Alanı</span>
                    </div>

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
                        <div className='absolute bottom-8 right-8 bg-white rounded-lg shadow-2xl z-10 font-tertiary max-w-xs w-80 overflow-hidden'>
                            {/* Başlık */}
                            <div className='bg-primary-blue text-white px-2 py-2'>
                                <h3 className='font-extrabold text-lg tracking-wide'>HESAPLAMA SONUÇLARI</h3>
                            </div>

                            {/* İçerik */}
                            <div className='p-4'>
                                {/* Mesafe ve Süre - Alt Alta */}
                                <div className='mb-4'>
                                    <div className='mb-3'>
                                        <span className='text-gray-600 text-xs block mb-1'>Mesafe</span>
                                        <p className='text-[#808080] text-xl font-semibold'>1.2 KM</p>
                                        <div className='w-full h-[3px] bg-primary-blue mt-1 rounded-xl'></div>
                                    </div>
                                    <div>
                                        <span className='text-gray-600 text-xs block mb-1'>Süre</span>
                                        <p className='text-[#808080] text-xl font-semibold'>1.2 KM</p>
                                        <div className='w-full h-[3px] bg-primary-blue mt-1 rounded-xl'></div>
                                    </div>
                                </div>

                                {/* Hesaplanan Ücret */}
                                <div className='mb-4'>
                                    <span className='text-dark-blue text-lg font-bold block mb-1'>Hesaplanan Ücret</span>
                                    <p className='text-dark-blue text-3xl font-extrabold'>27 TL</p>
                                </div>

                                {/* Teslimat Oluştur Butonu */}
                                <button className='btn-hover-shadow w-full bg-primary-blue text-white rounded px-4 py-3 font-extrabold text-lg tracking-wide uppercase'>
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