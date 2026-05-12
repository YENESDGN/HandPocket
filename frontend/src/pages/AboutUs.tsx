import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SecondNavBar from '../components/SecondNavBar';

const stats = [
    { value: '50K+', label: 'Tamamlanan Teslimat' },
    { value: '81',   label: 'Hizmet Verilen Şehir' },
    { value: '4.9',  label: 'Ortalama Puan' },
    { value: '2K+',  label: 'Aktif Kurye' },
];

const values = ['Hız', 'Güvenlik', 'Güvenilirlik', 'Şeffaflık'];

export default function AboutUs() {
    return (
        <div className='min-h-screen flex flex-col font-sextary'>

                <SecondNavBar />
        

            {/* Two-column main */}
            <main className='flex-1 flex flex-col md:flex-row'>

                {/* Left: Narrative */}
                <section className='w-full md:w-1/2 bg-secondary-blue p-12 md:p-20 flex flex-col justify-center about-left-panel'>
                    <div className='max-w-xl'>

                        <div className='mb-10'>
                            <span className='text-white/70 text-xs font-bold uppercase tracking-widest block mb-3'>
                                Mirasımız
                            </span>
                            <h1 className='text-4xl md:text-5xl font-bold text-white leading-tight mb-5'>
                                Hızlı ve Güvenli,<br />2024'ten Beri.
                            </h1>
                            <div className='w-16 h-1 bg-white/30 rounded-full' />
                        </div>

                        <div className='flex flex-col gap-8'>

                            {/* Mission */}
                            <div>
                                <h3 className='text-white font-bold text-lg mb-2'>Misyon Beyanımız</h3>
                                <p className='text-white/85 text-base leading-relaxed'>
                                    HandPocket olarak misyonumuz; bireylerin ve işletmelerin kargolarını en hızlı, en güvenli ve en
                                    şeffaf biçimde teslim etmelerini sağlamak. Teknolojiyi insan sıcaklığıyla buluşturarak her
                                    gönderinin zamanında ulaştığını garanti ediyoruz.
                                </p>
                            </div>

                            {/* Founded */}
                            <div className='flex items-start gap-3'>
                                <div className='bg-white/20 p-2.5 rounded-xl flex-shrink-0'>
                                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className='text-white font-bold text-xs uppercase tracking-widest'>Kuruluş: 2024</h4>
                                    <p className='text-white/75 text-sm mt-0.5'>
                                        İstanbul'daki tek bir ofisten Türkiye'nin büyüyen kurye platformuna.
                                    </p>
                                </div>
                            </div>

                            {/* Core values */}
                            <div>
                                <h4 className='text-white font-bold text-xs uppercase tracking-widest mb-3'>Temel Değerlerimiz</h4>
                                <div className='flex flex-wrap gap-2'>
                                    {values.map((v) => (
                                        <span
                                            key={v}
                                            className='bg-white/15 border border-white/25 px-4 py-1.5 rounded-full text-white text-sm font-semibold'
                                        >
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right: Visual + Stats */}
                <section className='w-full md:w-1/2 bg-darker-blue flex flex-col items-center justify-center p-12 gap-10 about-right-panel'>

                    {/* Hero illustration */}
                    <div className='flex flex-col items-center gap-5'>
                        <div className='relative flex items-center justify-center'>
                            <div className='absolute w-72 h-72 bg-secondary-blue/10 rounded-full blur-2xl' />
                            <img
                                src='/assets/Bg_Second.png'
                                alt='HandPocket Teslimat'
                                className='relative w-72 h-72 object-contain drop-shadow-[0_0_40px_rgba(30,164,220,0.25)] invert brightness-0 invert'
                                style={{ filter: 'brightness(0) invert(1)' }}
                            />
                        </div>
                        <div className='text-center'>
                            <p className='text-white font-bold text-2xl'>HandPocket</p>
                            <p className='text-white/50 text-sm'>Türkiye'nin Hızlı Kurye Ağı</p>
                        </div>
                    </div>

                    {/* CTA */}
                    <Link
                        to='/kayit'
                        className='bg-secondary-blue text-white font-bold px-8 py-3 rounded-full hover:bg-primary-blue transition-all duration-200 active:scale-95 text-sm'
                    >
                        Hemen Başla
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
}
